const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const LANDING = path.join(ROOT, "landing");
const APP_DIST = path.join(DIST, "app");

console.log("📦 Building Expo web...");
execSync("npx expo export --platform web --clear", { cwd: ROOT, stdio: "inherit" });

console.log("📁 Moving Expo output to /app/...");
const items = fs.readdirSync(DIST);
fs.mkdirSync(APP_DIST, { recursive: true });
items.forEach((item) => {
  if (item !== "app") {
    const src = path.join(DIST, item);
    const dst = path.join(APP_DIST, item);
    fs.renameSync(src, dst);
  }
});

console.log("🌐 Copying landing page to root...");
const landingItems = fs.readdirSync(LANDING);
landingItems.forEach((item) => {
  if (!item.startsWith(".") && item !== "vercel.json") {
    const src = path.join(LANDING, item);
    const dst = path.join(DIST, item);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dst);
    }
  }
});

console.log("✅ Build complete");
