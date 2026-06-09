#!/usr/bin/env node

/**
 * Apply new SVG icons to React icon components.
 * Sources are stored in src/icons/new-icons grouped by tier.
 *
 * This script creates/updates React icon components based on block-icon-mapping.json.
 * The mapping file is the source of truth - ALL components referenced in blockIconMap
 * will get React components created, using newIconMap to find the SVG source.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const iconsDir = path.join(projectRoot, "src/icons");
const newIconsDir = path.join(iconsDir, "new-icons");

// Load unified mapping from config file
const mappingPath = path.join(__dirname, "../config/block-icon-mapping.json");
let ICON_MAP = {};
let BLOCK_ICON_MAP = {};

if (fs.existsSync(mappingPath)) {
	const mappingData = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
	ICON_MAP = mappingData.newIconMap || {};
	BLOCK_ICON_MAP = mappingData.blockIconMap || {};
	console.log("✅ Loaded icon mappings from config/block-icon-mapping.json");
} else {
	console.warn(
		"⚠️  Mapping file not found at config/block-icon-mapping.json, skipping new icon application"
	);
	process.exit(1);
}

const toComponentName = (slug) => {
	const base = slug.replace(/-block$/, "");
	return (
		base
			.split("-")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join("") + "Icon"
	);
};

const escapeTemplateLiteral = (content) =>
	content.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/**
 * Convert embedded <style> blocks (with class selectors) into inline styles so
 * WordPress sanitizers don't strip our color/gradient definitions.
 */
const inlineSvgStyles = (svgContent) => {
	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
	const styleMatch = svgContent.match(styleRegex);

	if (!styleMatch) {
		return svgContent;
	}

	const classStyles = {};
	const rules = styleMatch[1];
	const ruleRegex = /([^{]+)\{([^}]+)\}/g;
	let ruleMatch;

	while ((ruleMatch = ruleRegex.exec(rules))) {
		const selectors = ruleMatch[1]
			.split(",")
			.map((selector) => selector.trim())
			.filter(Boolean);
		const declarations = ruleMatch[2]
			.split(";")
			.map((decl) => decl.trim())
			.filter(Boolean);

		const declarationMap = {};
		declarations.forEach((decl) => {
			const [prop, value] = decl.split(":").map((part) => part.trim());
			if (prop && value) {
				declarationMap[prop.toLowerCase()] = value;
			}
		});

		if (!Object.keys(declarationMap).length) {
			continue;
		}

		selectors.forEach((selector) => {
			const classMatch = selector.match(/\.([A-Za-z0-9_-]+)/);
			if (classMatch) {
				const className = classMatch[1];
				classStyles[className] = {
					...(classStyles[className] || {}),
					...declarationMap,
				};
			}
		});
	}

	// Remove the <style> block entirely
	let sanitizedSvg = svgContent.replace(styleRegex, "");

	// Remove empty <defs></defs> tags that might cause rendering issues
	sanitizedSvg = sanitizedSvg.replace(/<defs>\s*<\/defs>/g, "");

	// Replace class attributes with explicit SVG attributes
	const classAttrRegex = /class="([^"]+)"/g;
	sanitizedSvg = sanitizedSvg.replace(
		classAttrRegex,
		(match, classList) => {
			const classes = classList
				.split(/\s+/)
				.map((cls) => cls.trim())
				.filter(Boolean);

			const aggregatedStyles = {};
			classes.forEach((cls) => {
				if (classStyles[cls]) {
					Object.assign(aggregatedStyles, classStyles[cls]);
				}
			});

			const attrParts = Object.entries(aggregatedStyles).map(
				([prop, value]) => `${prop}="${value}"`,
			);

			return attrParts.length ? ` ${attrParts.join(" ")}` : "";
		},
	);

	return sanitizedSvg;
};

// Get all unique component names needed from blockIconMap
const neededComponents = new Set(Object.values(BLOCK_ICON_MAP));

// Create a reverse map: componentName -> array of blocks that use it
const componentToBlocks = {};
Object.entries(BLOCK_ICON_MAP).forEach(([blockSlug, componentName]) => {
	if (!componentToBlocks[componentName]) {
		componentToBlocks[componentName] = [];
	}
	componentToBlocks[componentName].push(blockSlug);
});

// Track which components we've created
const createdComponents = new Set();

/**
 * Find the SVG path for a component by looking for a block that uses it and has an entry in newIconMap
 */
const findSvgForComponent = (componentName) => {
	// First, try to find a block that uses this component and has an entry in newIconMap
	const blocksUsingComponent = componentToBlocks[componentName] || [];
	
	for (const blockSlug of blocksUsingComponent) {
		if (ICON_MAP[blockSlug]) {
			return {
				blockSlug,
				relativePath: ICON_MAP[blockSlug]
			};
		}
	}
	
	return null;
};

// Process each needed component
neededComponents.forEach((componentName) => {
	// Skip if already created
	if (createdComponents.has(componentName)) {
		return;
	}

	// Find SVG for this component
	const svgInfo = findSvgForComponent(componentName);
	
	if (!svgInfo) {
		console.warn(`⚠️  No SVG found for component ${componentName} (used by: ${(componentToBlocks[componentName] || []).join(', ')})`);
		return;
	}

	const svgPath = path.join(newIconsDir, svgInfo.relativePath);
	
	if (!fs.existsSync(svgPath)) {
		console.warn(`⚠️  SVG file not found: ${svgInfo.relativePath} (for component ${componentName})`);
		return;
	}

	const svgContent = fs.readFileSync(svgPath, "utf8").trim();
	const sanitizedSvg = inlineSvgStyles(svgContent);
	const escapedSvg = escapeTemplateLiteral(sanitizedSvg);

	// Generate component name (toComponentName handles -block suffix removal)
	const reactComponentName = toComponentName(componentName);
	const componentPath = path.join(iconsDir, `${componentName}.js`);

	const fileContents = `import React from "react";

const svgMarkup = \`${escapedSvg}\`;

const ${reactComponentName} = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default ${reactComponentName};
`;

	fs.writeFileSync(componentPath, fileContents);
	createdComponents.add(componentName);
	
	const blocksUsing = componentToBlocks[componentName] || [];
	console.log(`✅ Created/updated icon component: ${componentName}.js (used by: ${blocksUsing.join(', ')})`);
});

const missingComponents = Array.from(neededComponents).filter(c => !createdComponents.has(c));

if (missingComponents.length > 0) {
	console.log(`\n⚠️  Warning: ${missingComponents.length} components could not be created (missing SVG files):`);
	missingComponents.forEach(comp => {
		const blocks = componentToBlocks[comp] || [];
		console.log(`   - ${comp} (used by: ${blocks.join(', ')})`);
	});
}

console.log(`\n✨ Icon components refreshed. Created/updated ${createdComponents.size} components.`);
console.log("   Run scripts/update-block-icons.js next to sync block.json files.");
