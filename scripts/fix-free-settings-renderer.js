#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const settingsPath = path.resolve(rootDir, '..', 'adaire-free', 'admin', 'settings-page.php');

if (!fs.existsSync(settingsPath)) {
    console.error(`Generated free settings page not found: ${settingsPath}`);
    process.exit(1);
}

let content = fs.readFileSync(settingsPath, 'utf8');

if (content.includes('$category_titles = array(') && content.includes('foreach ($grouped_blocks as $category_slug => $blocks_for_category)')) {
    console.log('Generated free settings page already renders all categories.');
    process.exit(0);
}

const oldRenderBlockPattern = /                    \/\/ Render tiers in the desired order: Free, Plus, Premium, then any others\.\r?\n\s+\$render_tier\(\s*'Free Blocks',\s+\$grouped_blocks\['adaire-free'\]\s*\);\r?\n\s+\$render_tier\(\s*'Plus Blocks',\s+\$grouped_blocks\['adaire-plus'\]\s*\);\r?\n\s+\$render_tier\(\s*'Premium Blocks',\s+\$grouped_blocks\['adaire-premium'\]\s*\);\r?\n\r?\n\s+\/\/ Render any non-standard categories under "Other Blocks"\.\r?\n\s+\$other_blocks = \$grouped_blocks\['other'\];\r?\n\s+if \(!empty\(\$other_blocks\)\) \{\r?\n\s+\$render_tier\(\s*'Other Blocks',\s+\$other_blocks\s*\);\r?\n\s+\}/;

const newRenderBlock = `                    $category_titles = array(
                        'adaire-free' => 'Free Blocks',
                        'adaire-plus' => 'Plus Blocks',
                        'adaire-premium' => 'Premium Blocks',
                        'other' => 'Other Blocks',
                        'adaire-hero-sections' => 'Hero & Navigation',
                        'adaire-layout-sections' => 'Layout Sections',
                        'adaire-marketing' => 'Marketing',
                        'adaire-media' => 'Media',
                        'adaire-business' => 'Business',
                        'adaire-testimonial' => 'Testimonials',
                        'adaire-social' => 'Social',
                        'adaire-blog-publishing' => 'Blog & Publishing',
                        'adaire-start-actions' => 'Start & Actions',
                        'adaire-information-blocks' => 'Information Blocks',
                        'adaire-effects-interactions' => 'Effects & Interactions',
                        'adaire-interactive' => 'Interactive',
                        'adaire-layout-navigation' => 'Layout & Navigation',
                        'adaire-blog-content' => 'Blog & Content',
                        'adaire-content-expandable' => 'Expandable Content',
                        'adaire-content-info' => 'Content & Info',
                        'adaire-content-tabs' => 'Tabs & Content',
                        'adaire-layout-hero' => 'Layout & Hero',
                        'adaire-marketing-conversion' => 'Marketing & Conversion',
                        'adaire-media-images' => 'Media & Images',
                        'adaire-media-videos' => 'Media & Videos',
                        'adaire-reviews-trust' => 'Reviews & Trust',
                        'adaire-social-engagement' => 'Social & Engagement',
                    );

                    foreach ($grouped_blocks as $category_slug => $blocks_for_category) {
                        if (empty($blocks_for_category)) {
                            continue;
                        }

                        $title = isset($category_titles[$category_slug]) ? $category_titles[$category_slug] : ucwords(str_replace('-', ' ', $category_slug));
                        $render_tier($title, $blocks_for_category);
                    }`;

if (!oldRenderBlockPattern.test(content)) {
    console.error('Could not find the broken tier renderer in the generated free settings page.');
    process.exit(1);
}

content = content.replace(oldRenderBlockPattern, newRenderBlock);
fs.writeFileSync(settingsPath, content);
console.log('Patched generated free settings page to render all categories.');
