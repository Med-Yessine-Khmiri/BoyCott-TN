const fs = require("fs");
const path = require("path");

// Read all products
const productsData = require("./data/data.js");

// Create category-based bundles
const categories = {};
productsData.forEach((product) => {
  const category = product.category.toLowerCase();
  if (!categories[category]) {
    categories[category] = [];
  }
  categories[category].push(product);
});

// Create optimized bundles
const chunksDir = path.join(__dirname, "data", "chunks");
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

// Save category bundles
Object.entries(categories).forEach(([category, products]) => {
  fs.writeFileSync(
    path.join(chunksDir, `${category}.json`),
    JSON.stringify(products)
  );
});

// Create initial bundle with most popular items
const initialBundle = productsData.slice(0, 12);
fs.writeFileSync(
  path.join(chunksDir, "initial.json"),
  JSON.stringify(initialBundle)
);
