const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../models/Product");

dotenv.config({ path: path.join(__dirname, "../.env") });

const sourcePath = path.join(__dirname, "../../src/data/products.js");

const loadFrontendProducts = () => {
  const source = fs.readFileSync(sourcePath, "utf8").replace(/export const/g, "const");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.products = products;`, sandbox, { filename: sourcePath });
  return sandbox.products;
};

const toBackendProduct = (product) => {
  const originalPrice = Number(product.originalPrice || product.price);
  const salePrice = Number(product.price);
  const discount = originalPrice > salePrice
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: originalPrice,
    discount,
    description: product.description,
    image: product.image,
    stock: product.inStock ? 100 : 0,
    unit: product.unit || "1 piece",
    farm: product.farm || "",
    deliveryTime: product.deliveryTime || "45 mins",
    tags: product.tags || [],
    badge: product.badge || null,
    badgeColor: product.badgeColor || null,
    ratings: {
      average: product.rating || 0,
      count: product.reviews || 0,
    },
    isActive: true,
  };
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed products.");
  }

  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });

  const products = loadFrontendProducts().map(toBackendProduct);

  if (process.argv.includes("--fresh")) {
    await Product.deleteMany({});
  }

  const operations = products.map((product) => ({
    updateOne: {
      filter: { name: product.name, brand: product.brand },
      update: { $set: product },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations);
  console.log(`Seed complete: ${products.length} products processed.`);
  console.log(JSON.stringify({
    inserted: result.upsertedCount,
    modified: result.modifiedCount,
    matched: result.matchedCount,
  }, null, 2));

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
