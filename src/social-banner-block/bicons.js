/**
 * Generate a list of all Bootstrap Icons in the format:
 * { icon: "Star", class: "bi bi-star" }
 *
 * Run:
 *    node generateBootstrapIcons.js
 */

import fs from "fs";
import https from "https";

const ICONS_URL = "https://icons.getbootstrap.com/assets/font/bootstrap-icons.json";

https.get(ICONS_URL, (res) => {
  let data = "";

  res.on("data", (chunk) => (data += chunk));

  res.on("end", () => {
    try {
      const json = JSON.parse(data);

      // In the current format, keys are icon names
      const iconNames = Object.keys(json);

      const formatted = iconNames.map((name) => ({
        icon: name
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(""),
        class: `bi bi-${name}`,
      }));

      const output = `export const icons = ${JSON.stringify(formatted, null, 2)};\n`;

      fs.writeFileSync("bootstrapIcons.js", output);
    } catch (err) {
      console.error("âŒ Failed to parse or write icons:", err);
    }
  });
}).on("error", (err) => {
  console.error("âŒ HTTPS request failed:", err);
});




