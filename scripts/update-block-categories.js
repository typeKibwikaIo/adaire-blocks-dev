const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// Block category mapping based on icon paths and block type
const BLOCK_CATEGORIES = {
    // FREE Blocks
    'accordion-block': 'adaire-blocks-free',
    'button-block': 'adaire-blocks-free',
    'call-to-action-block': 'adaire-blocks-free',
    'icon-box-block': 'adaire-blocks-free',
    'posts-grid-block': 'adaire-blocks-free',
    'scroll-text-block': 'adaire-blocks-free',
    'tabs-block': 'adaire-blocks-free',
    'testimonial-block': 'adaire-blocks-free',
    'social-banner-block': 'adaire-blocks-free',
    'video-hero-block': 'adaire-blocks-free',
    'video-player-block': 'adaire-blocks-free',
    'content-toggle-block': 'adaire-blocks-free',
    'content-toggle-panel-block': 'adaire-blocks-free',
    'tab-panel-block': 'adaire-blocks-free', // Child block of tabs-block
    'testimonial2-block': 'adaire-blocks-free',
    'animation-scroll-block': 'adaire-blocks-free',
    
    // PRO Blocks
    'counter-block': 'adaire-blocks-pro',
    'map-block': 'adaire-blocks-pro',
    'logos-block': 'adaire-blocks-pro',
    'portfolio-block': 'adaire-blocks-pro',
    'questions-block': 'adaire-blocks-pro',
    'services-block': 'adaire-blocks-pro',
    'mega-menu-block': 'adaire-blocks-pro',
    'swiper-carousel-block': 'adaire-blocks-pro',
    'swiper-slide-block': 'adaire-blocks-pro',
    'our-process-block': 'adaire-blocks-pro',
    'flipcard-block': 'adaire-blocks-pro',
    'flipcard-front-block': 'adaire-blocks-pro',
    'flipcard-back-block': 'adaire-blocks-pro',

    'particles-block': 'adaire-blocks-pro',
    'project-block': 'adaire-blocks-pro',
    'industries-block': 'adaire-blocks-pro',
    'modal-block': 'adaire-blocks-pro',
    'modal-trigger-block': 'adaire-blocks-pro', // Child block of modal-block
    'modal-content-block': 'adaire-blocks-pro', // Child block of modal-block
};

// Get all block directories
const blockDirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-block'))
    .map(dirent => dirent.name);

console.log(`Found ${blockDirs.length} block directories\n`);

blockDirs.forEach(blockName => {
    const blockJsonPath = path.join(srcDir, blockName, 'block.json');
    
    if (!fs.existsSync(blockJsonPath)) {
        console.log(`⚠️  block.json not found for ${blockName}`);
        return;
    }
    
    try {
        // Read current block.json
        const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
        
        // Get new category
        const newCategory = BLOCK_CATEGORIES[blockName] || 'adaire-blocks-free'; // Default to free
        const oldCategory = blockJson.category;
        
        // Skip if category is already correct
        if (oldCategory === newCategory) {
            console.log(`⏭️  Skipped ${blockName}: already ${newCategory}`);
            return;
        }
        
        // Update category
        blockJson.category = newCategory;
        
        // Write updated block.json
        fs.writeFileSync(blockJsonPath, JSON.stringify(blockJson, null, 4));
        console.log(`✅ Updated ${blockName}: ${oldCategory} → ${newCategory}`);
        
    } catch (error) {
        console.log(`❌ Error updating ${blockName}:`, error.message);
    }
});

console.log('\n🎉 Block category update complete!');
