#!/usr/bin/env node

/**
 * Copy the Bootstrap Icons font + CSS from node_modules into
 * assets/vendor/bootstrap-icons/, which is what adaire-blocks.php enqueues
 * on both the frontend and in the editor. Runs on install and before every
 * build so this vendored copy can never silently go missing again.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const srcDir = path.join(projectRoot, "node_modules/bootstrap-icons/font");
const destDir = path.join(projectRoot, "assets/vendor/bootstrap-icons");

if (!fs.existsSync(srcDir)) {
	console.error("❌ node_modules/bootstrap-icons/font not found — run npm install first");
	process.exit(1);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });
fs.cpSync(srcDir, destDir, { recursive: true });

console.log("✅ Copied bootstrap-icons font assets to assets/vendor/bootstrap-icons/");
