#!/usr/bin/env node

/**
 * Update all block index.js files to import and use React icon components.
 * This ensures all blocks use the unified icon system.
 */

const fs = require('fs');
const path = require('path');

const blocksDir = path.join(__dirname, '../src');
const mappingPath = path.join(__dirname, '../config/block-icon-mapping.json');

// Load mapping
let BLOCK_ICON_MAP = {};
if (fs.existsSync(mappingPath)) {
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    BLOCK_ICON_MAP = mappingData.blockIconMap || {};
    console.log('✅ Loaded icon mapping from config/block-icon-mapping.json');
} else {
    console.error('❌ Mapping file not found');
    process.exit(1);
}

const toComponentName = (iconName) => {
    const parts = iconName.split('-');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Icon';
};

/**
 * Update a block's index.js file to use the React icon component
 */
function updateBlockIndex(blockName) {
    const indexPath = path.join(blocksDir, blockName, 'index.js');
    
    if (!fs.existsSync(indexPath)) {
        return { updated: false, reason: 'index.js not found' };
    }

    try {
        let content = fs.readFileSync(indexPath, 'utf8');
        const originalContent = content;

        // Get the icon component name for this block
        const iconName = BLOCK_ICON_MAP[blockName];
        if (!iconName) {
            return { updated: false, reason: 'No icon mapping' };
        }

        const componentName = toComponentName(iconName);
        const iconImport = `import ${componentName} from '../icons/${iconName}';`;

        // Check if icon is already imported correctly
        const hasCorrectImport = content.includes(`import ${componentName} from '../icons/${iconName}'`);
        const hasIconInRegister = content.includes(`icon: ${componentName}`) || content.includes(`icon:${componentName}`);

        if (hasCorrectImport && hasIconInRegister) {
            return { updated: false, reason: 'Already correct' };
        }

        // Step 1: Add or fix icon import
        if (!hasCorrectImport) {
            // Remove ALL existing icon imports (including duplicates) - be more aggressive
            // First, remove any icon import lines (with optional comment before)
            content = content.replace(/(\/\/\s*Import\s+icon\s+(component|directly)\s*\n\s*)?import\s+\w+Icon\s+from\s+['"]\.\.\/icons\/\w+['"];?\s*\n?/g, '');
            
            // Also remove any icon imports that might be on the same line or have different formatting
            content = content.replace(/import\s+\w+Icon\s+from\s+['"]\.\.\/icons\/\w+['"];?\s*/g, '');
            
            // Remove any duplicate blank lines that might have been created
            content = content.replace(/\n\n\n+/g, '\n\n');
            
            // Find the best place to add the import (after metadata import or after last import)
            const metadataImportMatch = content.match(/(import\s+metadata\s+from\s+['"]\.\/block\.json['"];?)/);
            if (metadataImportMatch) {
                // Check if there's already an icon import comment after metadata
                const afterMetadata = content.substring(content.indexOf(metadataImportMatch[0]) + metadataImportMatch[0].length);
                if (!afterMetadata.trim().startsWith('// Import icon component')) {
                    content = content.replace(
                        metadataImportMatch[0],
                        `${metadataImportMatch[0]}\n\n// Import icon component\n${iconImport}`
                    );
                }
            } else {
                // Find the last import statement
                const importLines = content.match(/^import\s+.*$/gm);
                if (importLines && importLines.length > 0) {
                    const lastImport = importLines[importLines.length - 1];
                    const lastImportIndex = content.lastIndexOf(lastImport);
                    const afterLastImport = content.substring(lastImportIndex + lastImport.length);
                    // Only add if not already there
                    if (!afterLastImport.includes(iconImport)) {
                        const insertIndex = lastImportIndex + lastImport.length;
                        content = content.slice(0, insertIndex) + 
                                 `\n${iconImport}` + 
                                 content.slice(insertIndex);
                    }
                } else {
                    // No imports found, add at the top after any comments
                    const firstLineMatch = content.match(/^(\s*\/\*\*[\s\S]*?\*\/\s*)?/);
                    if (firstLineMatch) {
                        const insertIndex = firstLineMatch[0].length;
                        if (!content.substring(0, insertIndex).includes(iconImport)) {
                            content = content.slice(0, insertIndex) + 
                                     `${iconImport}\n` + 
                                     content.slice(insertIndex);
                        }
                    } else {
                        if (!content.includes(iconImport)) {
                            content = `${iconImport}\n${content}`;
                        }
                    }
                }
            }
        }

        // Step 2: Ensure icon is used in registerBlockType
        if (!hasIconInRegister) {
            // Check if registerBlockType uses ...metadata
            if (content.includes('registerBlockType') && content.includes('...metadata')) {
                // Replace ...metadata with explicit spread and add icon
                content = content.replace(
                    /(\s*)\.\.\.metadata,?/g,
                    `$1...metadata,\n$1\t\ticon: ${componentName},`
                );
            } else {
                // Find registerBlockType and add icon property
                // Find registerBlockType and add icon property
                // Try to match registerBlockType(name, { config })
                const registerMatch = content.match(/(registerBlockType\s*\([^,]+,\s*\{)([\s\S]*?)(\})/);
                if (registerMatch) {
                    const configContent = registerMatch[2];
                    // Check if icon already exists
                    if (!configContent.includes('icon:')) {
                        // Determine indentation
                        const lines = configContent.split('\n');
                        const lastLine = lines[lines.length - 1] || '';
                        const indent = lastLine.match(/^(\s*)/)?.[1] || '\t';
                        
                        // Add icon before closing brace
                        const trimmedConfig = configContent.trim();
                        const needsComma = trimmedConfig && !trimmedConfig.endsWith(',');
                        const newConfig = trimmedConfig + (needsComma ? ',' : '') + `\n${indent}\ticon: ${componentName},`;
                        content = content.replace(
                            /(registerBlockType\s*\([^,]+,\s*\{)([\s\S]*?)(\})/,
                            `$1${newConfig}$3`
                        );
                    }
                }
            }
        }

        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(indexPath, content);
            return { updated: true };
        }
        
        return { updated: false, reason: 'No changes needed' };
    } catch (error) {
        return { updated: false, reason: `Error: ${error.message}` };
    }
}

/**
 * Main function
 */
function updateAllBlockIcons() {
    console.log('Updating all block index.js files to use React icon components...\n');
    
    // Get all block directories
    const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-block'))
        .map(dirent => dirent.name)
        .sort();
    
    console.log(`Found ${blockDirs.length} block directories\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    blockDirs.forEach(blockName => {
        const result = updateBlockIndex(blockName);
        if (result.updated) {
            console.log(`✅ Updated ${blockName}`);
            updatedCount++;
        } else if (result.reason === 'Already correct') {
            // Silent skip for already correct
            skippedCount++;
        } else if (result.reason === 'No icon mapping') {
            console.log(`⚠️  ${blockName}: ${result.reason}`);
            skippedCount++;
        } else if (result.reason && result.reason.startsWith('Error')) {
            console.log(`❌ ${blockName}: ${result.reason}`);
            errorCount++;
        } else {
            skippedCount++;
        }
    });
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ℹ️  Skipped (already correct or no mapping): ${skippedCount}`);
    if (errorCount > 0) {
        console.log(`   ❌ Errors: ${errorCount}`);
    }
    console.log('\n🎉 Block icon updates complete!');
}

// Run the update
updateAllBlockIcons();
