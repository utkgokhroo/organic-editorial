const Product = require("../models/Product");
const { sendSuccess, createError, buildPagination } = require("../utils/apiResponse");
const wrapControllers = require("../utils/wrapControllers");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.search && query.search.trim()) {
    const safeSearch = escapeRegExp(query.search.trim().slice(0, 80));
    const regex = new RegExp(safeSearch, "i");
    filter.$or = [{ name: regex }, { brand: regex }, { tags: regex }];
  }

  if (query.category) {
    const cats = query.category.split(",").map((c) => c.trim());
    filter.category = cats.length === 1 ? cats[0] : { $in: cats };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  const rating = query.minRating || query.rating;
  if (rating) {
    filter["ratings.average"] = { $gte: Number(rating) };
  }

  return filter;
};

const buildSort = (sortParam) => {
  switch (sortParam) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
      return { "ratings.average": -1, "ratings.count": -1 };
    case "name_asc":
      return { name: 1 };
    case "discount":
      return { discount: -1, createdAt: -1 };
    case "featured":
      return { "ratings.average": -1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const getProducts = async (req, res) => {
  const filter = buildFilter(req.query);
  const sort = buildSort(req.query.sort);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, {
    count: products.length,
    total,
    pagination: buildPagination(page, limit, total),
    data: { products },
  });
};

const getProduct = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  }).lean({ virtuals: true });

  if (!product) {
    throw createError(404, "Product not found.", "ProductNotFound");
  }

  return sendSuccess(res, 200, { data: { product } });
};

const createProduct = async (req, res) => {
  const {
    name,
    brand,
    category,
    price,
    discount,
    description,
    image,
    stock,
    unit,
    farm,
    deliveryTime,
    tags,
    badge,
    badgeColor,
  } = req.body;

  const product = await Product.create({
    name,
    brand,
    category,
    price,
    discount: discount ?? 0,
    description,
    image,
    stock: stock ?? 0,
    unit,
    farm,
    deliveryTime,
    tags,
    badge,
    badgeColor,
  });

  return sendSuccess(res, 201, {
    message: "Product created successfully.",
    data: { product },
  });
};

const updateProduct = async (req, res) => {
  const allowed = [
    "name",
    "brand",
    "category",
    "price",
    "discount",
    "description",
    "image",
    "stock",
    "unit",
    "farm",
    "deliveryTime",
    "tags",
    "badge",
    "badgeColor",
    "isActive",
  ];

  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    throw createError(400, "No valid fields provided for update.", "NoValidFields");
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw createError(404, "Product not found.", "ProductNotFound");
  }

  return sendSuccess(res, 200, {
    message: "Product updated successfully.",
    data: { product },
  });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createError(404, "Product not found.", "ProductNotFound");
  }

  if (req.query.permanent === "true") {
    await product.deleteOne();
    return sendSuccess(res, 200, { message: "Product permanently deleted." });
  }

  product.isActive = false;
  await product.save();

  return sendSuccess(res, 200, {
    message: "Product deactivated (soft delete). Use ?permanent=true to fully remove.",
  });
};

module.exports = wrapControllers({
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
});
