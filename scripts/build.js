const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const indexPath = path.join(publicDir, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("Build failed: public/index.html not found");
  process.exit(1);
}

console.log("Build complete — Love Island Nigeria is ready to deploy.");
