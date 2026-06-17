#!/usr/bin/env node

/**
 * Apply new SVG icons to React icon components.
 * Sources are stored in src/icons/new-icons grouped by tier.
 *
 * Reads blockIconMap from config/block-icon-mapping.json.
 * Each entry is { component, svg? }.  Blocks sharing a component omit svg —
 * the script resolves the SVG through the first sibling that has one.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const iconsDir = path.join(projectRoot, "src/icons");
const newIconsDir = path.join(iconsDir, "new-icons");

// Load mapping
const mappingPath = path.join(__dirname, "../config/block-icon-mapping.json");

if (!fs.existsSync(mappingPath)) {
	console.error("❌ Mapping file not found at config/block-icon-mapping.json");
	process.exit(1);
}

const BLOCK_ICON_MAP = JSON.parse(fs.readFileSync(mappingPath, "utf8")).blockIconMap || {};
console.log("✅ Loaded icon mapping from config/block-icon-mapping.json");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toComponentName = (slug) =>
	slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("") + "Icon";

const escapeTemplateLiteral = (content) =>
	content.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/**
 * Convert embedded <style> blocks (with class selectors) into inline SVG
 * attributes so WordPress sanitizers don't strip colour/gradient definitions.
 */
const inlineSvgStyles = (svgContent) => {
	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
	const styleMatch = svgContent.match(styleRegex);

	if (!styleMatch) return svgContent;

	const classStyles = {};
	const ruleRegex = /([^{]+)\{([^}]+)\}/g;
	let ruleMatch;

	while ((ruleMatch = ruleRegex.exec(styleMatch[1]))) {
		const selectors = ruleMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
		const declarationMap = {};

		ruleMatch[2]
			.split(";")
			.map((d) => d.trim())
			.filter(Boolean)
			.forEach((decl) => {
				const [prop, value] = decl.split(":").map((p) => p.trim());
				if (prop && value) declarationMap[prop.toLowerCase()] = value;
			});

		if (!Object.keys(declarationMap).length) continue;

		selectors.forEach((selector) => {
			const classMatch = selector.match(/\.([A-Za-z0-9_-]+)/);
			if (classMatch) {
				const cls = classMatch[1];
				classStyles[cls] = { ...(classStyles[cls] || {}), ...declarationMap };
			}
		});
	}

	let sanitized = svgContent.replace(styleRegex, "");
	sanitized = sanitized.replace(/<defs>\s*<\/defs>/g, "");

	sanitized = sanitized.replace(/class="([^"]+)"/g, (_, classList) => {
		const classes = classList.split(/\s+/).map((c) => c.trim()).filter(Boolean);
		const aggregated = {};
		classes.forEach((cls) => {
			if (classStyles[cls]) Object.assign(aggregated, classStyles[cls]);
		});
		const attrs = Object.entries(aggregated).map(([p, v]) => `${p}="${v}"`);
		return attrs.length ? ` ${attrs.join(" ")}` : "";
	});

	return sanitized;
};

// ─── Build component → svg map ────────────────────────────────────────────────

// componentSvgMap: component name → svg relative path (from new-icons/)
const componentSvgMap = {};

// componentBlocks: component name → all block slugs using it
const componentBlocks = {};

Object.entries(BLOCK_ICON_MAP).forEach(([blockSlug, entry]) => {
	const component = entry.component;
	if (!component) {
		console.warn(`⚠️  No component defined for ${blockSlug}, skipping`);
		return;
	}

	if (!componentBlocks[component]) componentBlocks[component] = [];
	componentBlocks[component].push(blockSlug);

	if (entry.svg && !componentSvgMap[component]) {
		componentSvgMap[component] = entry.svg;
	}
});

// ─── Create / update React components ────────────────────────────────────────

const created = new Set();
const missing = [];

Object.keys(componentBlocks).forEach((componentName) => {
	const svgRelPath = componentSvgMap[componentName];

	if (!svgRelPath) {
		missing.push({ component: componentName, blocks: componentBlocks[componentName] });
		return;
	}

	const svgPath = path.join(newIconsDir, svgRelPath);

	if (!fs.existsSync(svgPath)) {
		console.warn(`⚠️  SVG file not found: ${svgRelPath} (for component ${componentName})`);
		missing.push({ component: componentName, blocks: componentBlocks[componentName] });
		return;
	}

	const rawSvg = fs.readFileSync(svgPath, "utf8").trim();
	const sanitizedSvg = inlineSvgStyles(rawSvg);
	const escapedSvg = escapeTemplateLiteral(sanitizedSvg);
	const reactComponentName = toComponentName(componentName);
	const componentPath = path.join(iconsDir, `${componentName}.js`);

	const fileContents = `import React from "react";

const svgMarkup = \`${escapedSvg}\`;

const ${reactComponentName} = () => (
\t<span
\t\tclassName="adaire-block-icon"
\t\tdangerouslySetInnerHTML={{ __html: svgMarkup }}
\t/>
);

export default ${reactComponentName};
`;

	fs.writeFileSync(componentPath, fileContents);
	created.add(componentName);

	const blocks = componentBlocks[componentName].join(", ");
	console.log(`✅ Created/updated ${componentName}.js  (used by: ${blocks})`);
});

if (missing.length) {
	console.log(`\n⚠️  ${missing.length} component(s) could not be created (no svg defined or file missing):`);
	missing.forEach(({ component, blocks }) =>
		console.log(`   - ${component}  (used by: ${blocks.join(", ")})`),
	);
}

console.log(`\n✨ Done. Created/updated ${created.size} icon component(s).`);
console.log("   Run scripts/update-block-icons.js next to sync block.json files.");
