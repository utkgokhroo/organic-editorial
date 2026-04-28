const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

/**
 * Build a Mongoose filter object from request query params.
 * Keeps controller functions slim by centralising query logic here.
 *
 * Supported params:
 *   search    – partial, case-insensitive text match on name/brand
 *   category  – exact match, comma-separated for multiple
 *   minPrice  – inclusive lower bound on salePrice (price after discount)
 *   maxPrice  – inclusive upper bound
 *   inStock   – "true" restricts to stock > 0
 *   minRating – inclusive lower bound on ratings.average
 */
const buildFilter = (query) => {
  const filter = { isActive: true };

  // ── Text search ────────────────────────────────────────
  // Use MongoDB $text if we only had a text index match,
  // but regex gives us partial-word matching which is friendlier UX
  if (query.search && query.search.trim()) {
    const regex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: regex }, { brand: regex }, { tags: regex }];
  }

  // ── Category filter ────────────────────────────────────
  // Accept single value or comma-separated list: ?category=Dairy,Fruits
  if (query.category) {
    const cats = query.category.split(",").map((c) => c.trim());
    filter.category = cats.length === 1 ? cats[0] : { $in: cats };
  }

  // ── Price range ────────────────────────────────────────
  // Price here refers to the stored `price` field; discount is separate
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // ── Stock filter ───────────────────────────────────────
  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  // ── Rating filter ──────────────────────────────────────
  if (query.minRating) {
    filter["ratings.average"] = { $gte: Number(query.minRating) };
  }

  return filter;
};

/**
 * Build a Mongoose sort object from the `sort` query param.
 *
 * Supported values:
 *   price_asc    → price ascending
 *   price_desc   → price descending
 *   rating       → highest rated first
 *   newest       → most recently created first (default)
 *   name_asc     → alphabetical A–Z
 */
const buildSort = (sortParam) => {
  switch (sortParam) {
    case "price_asc":  return { price: 1 };
    case "price_desc": return { price: -1 };
    case "rating":     return { "ratings.average": -1, "ratings.count": -1 };
    case "name_asc":   return { name: 1 };
    case "newest":
    default:           return { createdAt: -1 };
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/products
//  @desc    Get all products — search, filter, sort, paginate
//  @access  Public
//
//  Query params:
//    search, category, minPrice, maxPrice, inStock, minRating
//    sort    (price_asc | price_desc | rating | name_asc | newest)
//    page    (default 1)
//    limit   (default 12, max 100)
// ─────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);
    const sort   = buildSort(req.query.sort);

    // Clamp page and limit to sane values
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip  = (page - 1) * limit;

    // Run query and count in parallel for efficiency
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        pages,
        limit,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/products/:id
//  @desc    Get a single product by its MongoDB _id
//  @access  Public
// ─────────────────────────────────────────────────────────
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/products
//  @desc    Create a new product
//  @access  Private — Admin only
// ─────────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const {
      name, brand, category, price, discount,
      description, image, stock, unit,
      farm, deliveryTime, tags, badge, badgeColor,
    } = req.body;

    const product = await Product.create({
      name, brand, category, price,
      discount: discount ?? 0,
      description, image,
      stock: stock ?? 0,
      unit, farm, deliveryTime, tags, badge, badgeColor,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   PUT /api/products/:id
//  @desc    Update any fields on an existing product
//  @access  Private — Admin only
// ─────────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    // Whitelist updatable fields — prevents overwriting _id, ratings etc.
    const allowed = [
      "name", "brand", "category", "price", "discount",
      "description", "image", "stock", "unit",
      "farm", "deliveryTime", "tags", "badge", "badgeColor", "isActive",
    ];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,           // return the updated document
        runValidators: true, // run schema validators on the updated fields
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   DELETE /api/products/:id
//  @desc    Soft-delete a product (sets isActive: false)
//           Hard-delete requires ?permanent=true (extra safety)
//  @access  Private — Admin only
// ─────────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (req.query.permanent === "true") {
      // Hard delete — removes the document entirely from the collection
      await product.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Product permanently deleted.",
      });
    }

    // Soft delete — hides from public queries but preserves order history
    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deactivated (soft delete). Use ?permanent=true to fully remove.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
