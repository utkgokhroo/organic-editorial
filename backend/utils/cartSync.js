const Product = require("../models/Product");
const { computeSalePrice } = require("./commerce");
const { createError } = require("./apiResponse");

const PRODUCT_FIELDS = "name brand unit image price discount stock isActive";

/**
 * Build a cart line snapshot from the current product record.
 */
const buildCartLineFromProduct = (product, quantity) => ({
  product: product._id,
  name: product.name,
  brand: product.brand,
  unit: product.unit,
  image: product.image,
  price: computeSalePrice(product.price, product.discount),
  quantity,
});

/**
 * Refresh cart line prices and quantities from the catalog.
 * Removes unavailable products and caps quantity to available stock.
 */
const syncCartWithCatalog = async (cart, options = {}) => {
  const { session } = options;
  const warnings = [];
  let changed = false;

  if (!cart?.items?.length) {
    return { cart, warnings, changed: false };
  }

  for (let index = cart.items.length - 1; index >= 0; index -= 1) {
    const item = cart.items[index];
    const product = await Product.findById(item.product).select(PRODUCT_FIELDS);

    if (!product || !product.isActive) {
      warnings.push(`"${item.name}" is no longer available and was removed from your cart.`);
      cart.items.splice(index, 1);
      changed = true;
      continue;
    }

    const currentPrice = computeSalePrice(product.price, product.discount);

    if (product.stock < 1) {
      warnings.push(`"${product.name}" is out of stock and was removed from your cart.`);
      cart.items.splice(index, 1);
      changed = true;
      continue;
    }

    if (item.price !== currentPrice) {
      item.price = currentPrice;
      changed = true;
      warnings.push(`Price updated for "${product.name}" to reflect the latest offer.`);
    }

    if (item.quantity > product.stock) {
      item.quantity = product.stock;
      changed = true;
      warnings.push(
        `Quantity for "${product.name}" was reduced to ${product.stock} (only that many left).`
      );
    }

    if (item.name !== product.name) {
      item.name = product.name;
      item.brand = product.brand;
      item.unit = product.unit;
      item.image = product.image;
      changed = true;
    }
  }

  if (changed) {
    await cart.save(session ? { session } : undefined);
  }

  return { cart, warnings, changed };
};

/**
 * Validate product availability and stock for a requested quantity.
 */
const assertProductAvailable = (product, quantity, productId) => {
  if (!product || !product.isActive) {
    return {
      ok: false,
      status: 404,
      message: "Product not found or unavailable.",
      error: { field: "productId" },
    };
  }

  if (product.stock < 1) {
    return {
      ok: false,
      status: 400,
      message: `"${product.name}" is out of stock.`,
      error: "OutOfStock",
    };
  }

  if (quantity > product.stock) {
    return {
      ok: false,
      status: 400,
      message: `Only ${product.stock} unit(s) of "${product.name}" available.`,
      error: "InsufficientStock",
    };
  }

  return { ok: true, product };
};

const throwUnlessAvailable = (result) => {
  if (!result.ok) {
    throw createError(result.status, result.message, result.error);
  }
  return result.product;
};

/**
 * Atomically decrement stock; returns null if insufficient stock.
 */
const decrementProductStock = (productId, quantity, session) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
      stock: { $gte: quantity },
    },
    { $inc: { stock: -quantity } },
    { session, new: true }
  );

module.exports = {
  buildCartLineFromProduct,
  syncCartWithCatalog,
  assertProductAvailable,
  throwUnlessAvailable,
  decrementProductStock,
  PRODUCT_FIELDS,
};
