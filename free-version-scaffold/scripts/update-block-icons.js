const fs = require('fs');
const path = require('path');

const blocksDir = path.join(__dirname, '../src');
const iconsDir = path.join(__dirname, '../src/icons');

// Load unified mapping from config file (source of truth)
const mappingPath = path.join(__dirname, '../config/block-icon-mapping.json');
let BLOCK_ICON_MAP = {};

if (fs.existsSync(mappingPath)) {
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    BLOCK_ICON_MAP = mappingData.blockIconMap || {};
    console.log('✅ Loaded icon mapping from config/block-icon-mapping.json');
} else {
    console.warn('⚠️  Mapping file not found at config/block-icon-mapping.json, using default fallback behavior');
}

/**
 * Extract SVG content from a React component file
 */
const getSvgContent = (iconName) => {
    const iconPath = path.join(iconsDir, `${iconName}.js`);
    
    if (!fs.existsSync(iconPath)) {
        console.log(`Icon file not found: ${iconName}.js`);
        return null;
    }
    
    const fileContent = fs.readFileSync(iconPath, 'utf8');
    
    // Extract the complete SVG tag using regex with dotall flag
    const svgMatch = fileContent.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
    
    if (svgMatch) {
        return svgMatch[0];
    }
    
    console.log(`No SVG found in ${iconName}.js`);
    return null;
};

/**
 * Update block.json files with actual SVG content from icon components.
 * Uses blockIconMap from block-icon-mapping.json as the source of truth.
 */
function updateBlockIcons() {
    console.log('Updating block icons with actual SVG content from React components...\n');
    
    // Get all block directories
    const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-block'))
        .map(dirent => dirent.name);
    
    console.log(`Found ${blockDirs.length} block directories:`, blockDirs.join(', '));
    console.log('');
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    blockDirs.forEach(blockName => {
        const blockJsonPath = path.join(blocksDir, blockName, 'block.json');
        
        if (!fs.existsSync(blockJsonPath)) {
            console.log(`❌ block.json not found for ${blockName}`);
            errorCount++;
            return;
        }
        
        try {
            // Read current block.json
            const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
            
            // Get icon component name from blockIconMap (source of truth)
            // If not in mapping, fall back to removing -block suffix
            const iconName = BLOCK_ICON_MAP[blockName] || blockName.replace('-block', '');
            
            // Get actual SVG content from React icon component
            const svgContent = getSvgContent(iconName);
            
            if (svgContent) {
                // Update the icon property with the actual SVG
                blockJson.icon = svgContent;
                
                // Write updated block.json
                fs.writeFileSync(blockJsonPath, JSON.stringify(blockJson, null, 4));
                console.log(`✅ Updated ${blockName} with icon from ${iconName}.js`);
                updatedCount++;
            } else {
                console.log(`⚠️  No React component found for ${blockName} (${iconName}.js), keeping existing icon`);
                skippedCount++;
            }
            
        } catch (error) {
            console.log(`❌ Error updating ${blockName}:`, error.message);
            errorCount++;
        }
    });
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    if (errorCount > 0) {
        console.log(`   ❌ Errors: ${errorCount}`);
    }
    console.log('\n🎉 Block icon update complete!');
}

// Run the update
updateBlockIcons();
