# WordPress Gutenberg Block Attributes Not Saving - Complete Solution

## 🚨 The Problem

When developing WordPress Gutenberg blocks, you may encounter a common issue where:

- Block attributes (especially complex arrays like `videos`, `items`, `content`) exist in the editor
- Attributes are visible in the editor console and work correctly
- **BUT** the attributes don't persist to the database when the post is saved
- PHP only receives basic attributes like `backgroundColor` but not the full data
- Frontend JavaScript can't access the block data, resulting in empty or broken functionality

## 🔍 Root Cause

### Primary Issue: Block Validation Errors
WordPress Gutenberg blocks sometimes don't save attributes properly when they're only set via `useEffect` without user interaction. The `setAttributes` call needs to trigger a "dirty" state that WordPress recognizes as requiring a save.

### Secondary Issue: HTML Validation vs Dynamic Content
**CRITICAL**: The main root cause is that WordPress block validation fails when:

1. **Dynamic HTML Content**: If your `save.js` function renders dynamic content (like mapped arrays, conditional elements, or user-generated data) directly into the HTML, WordPress will fail validation because the saved HTML doesn't match the expected structure.

2. **Static HTML Requirement**: WordPress expects the `save.js` function to render **static, predictable HTML** that remains the same every time (apart from attributes). Any dynamic content should be:
   - **Either**: Rendered as minimal placeholders in `save.js` and dynamically created in `view.js`
   - **Or**: Passed as block attributes to JavaScript via PHP (for complex data like arrays/objects)

3. **Data Flow Architecture**: 
   - `save.js` → Should render minimal static HTML with placeholders
   - `view.js` → Should dynamically create all content using JavaScript
   - `PHP` → Should pass complex data (arrays, objects) to JavaScript via `window.yourBlockData`

### Why This Happens
- WordPress compares the saved HTML with the expected HTML structure
- If `save.js` renders different HTML each time (due to dynamic content), validation fails
- Complex data (arrays, objects) should never be rendered directly in HTML
- Block attributes should be passed to JavaScript, not embedded in HTML

## 🏗️ Proper Architecture for Dynamic Content

### ❌ WRONG Approach (Causes Validation Errors)
```javascript
// DON'T DO THIS in save.js
export default function save({ attributes }) {
    const { videos } = attributes;
    
    return (
        <div className="video-slider">
            {videos.map((video, index) => (
                <div key={index} className="video-slide">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                </div>
            ))}
        </div>
    );
}
```

### ✅ CORRECT Approach (Prevents Validation Errors)
```javascript
// DO THIS in save.js - Static HTML with placeholders
export default function save({ attributes }) {
    return (
        <div className="video-slider">
            <div className="video-background">
                {/* Dynamic video slides will be injected here by view.js */}
            </div>
            <div className="video-content-placeholder">
                {/* Dynamic content will be injected here by view.js */}
            </div>
            <div className="video-indicators">
                {/* Dynamic indicators will be injected here by view.js */}
            </div>
        </div>
    );
}
```

```javascript
// DO THIS in view.js - Dynamic content creation
function createVideoSlides() {
    const videoBackground = document.querySelector('.video-background');
    if (!videoBackground || videos.length === 0) return;
    
    videos.forEach((video, index) => {
        const videoSlide = document.createElement('div');
        videoSlide.className = `video-slide ${index === 0 ? "active" : ""}`;
        videoSlide.setAttribute('data-video-index', index);
        
        const title = document.createElement('h3');
        title.textContent = video.title;
        videoSlide.appendChild(title);
        
        videoBackground.appendChild(videoSlide);
    });
}
```

## ✅ The Complete Solution

### 1. Editor Side (`edit.js`)

```javascript
import { useEffect } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
    const { videos = [] } = attributes;

    // Ensure videos are properly initialized AND saved
    useEffect(() => {
        console.log('useEffect running, current videos:', videos);
        console.log('useEffect running, videos length:', videos?.length);
        
        if (!videos || videos.length === 0) {
            // Set default videos if none exist
            const defaultVideos = [
                {
                    id: 1,
                    title: "Default Video 1",
                    description: "Default description",
                    videoUrl: "https://example.com/video1",
                    videoType: "youtube",
                    // ... other properties
                },
                // ... more default videos
            ];
            console.log('Setting default videos:', defaultVideos);
            setAttributes({ videos: defaultVideos });
        } else {
            console.log('Videos already exist, no need to set defaults');
            // 🔑 KEY: Force a save to ensure videos are persisted by making a small change
            console.log('Forcing save of existing videos to ensure persistence');
            // Add a timestamp to force a change and trigger save
            const videosWithTimestamp = videos.map(video => ({
                ...video,
                _lastModified: Date.now()
            }));
            setAttributes({ videos: videosWithTimestamp });
        }
    }, []); // Empty dependency array - only run once on mount

    // ... rest of your component
}
```

### 2. PHP Side (`your-plugin.php`)

```php
// Pass block data to frontend for your-block
function enqueue_your_block_data() {
    if ( is_admin() ) {
        return;
    }
    global $post;
    if ( ! $post ) {
        return;
    }
    if ( has_block( 'create-block/your-block', $post ) ) {
        // Get all your-block instances on the page
        $blocks = parse_blocks( $post->post_content );
        $your_blocks = array();
        
        // Recursive function to find blocks in nested structures
        function find_your_blocks($blocks, &$your_blocks) {
            foreach ( $blocks as $block ) {
                if ( $block['blockName'] === 'create-block/your-block' ) {
                    $block_id = $block['attrs']['blockId'] ?? uniqid('your-block-');
                    // Ensure we have the full attributes array
                    $your_blocks[$block_id] = $block['attrs'] ?? array();
                }
                // Recursively search in inner blocks
                if ( ! empty( $block['innerBlocks'] ) ) {
                    find_your_blocks( $block['innerBlocks'], $your_blocks );
                }
            }
        }
        
        find_your_blocks($blocks, $your_blocks);
        
        // Always add the script, even if empty, for debugging
        add_action( 'wp_footer', function() use ($your_blocks) {
            echo '<script>console.log("PHP Debug - your_blocks:", ' . json_encode($your_blocks) . ');</script>';
            echo '<script>console.log("PHP Debug - videos in first block:", ' . json_encode($your_blocks[array_keys($your_blocks)[0]]['videos'] ?? 'NOT FOUND') . ');</script>';
            echo '<script>window.yourBlockData = ' . json_encode($your_blocks) . ';</script>';
            echo '<script>window.wpApiSettings = { postId: ' . get_the_ID() . ' };</script>';
        });
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_your_block_data' );
```

### 3. Frontend Side (`view.js`)

```javascript
// Initialize your block data
let videos = [];
let currentVideoIndex = 0;
let transitionDuration = 8000;
let autoPlay = true;
let showControls = true;

async function initializeVideos() {
    const blockElement = document.querySelector('.your-block-class');
    
    console.log('Initializing videos...');
    console.log('Block element found:', !!blockElement);
    console.log('window.yourBlockData:', window.yourBlockData);
    
    if (blockElement && window.yourBlockData) {
        console.log('HERE IS THE DATA:', window.yourBlockData);
        
        // Find the block data by ID or use the first available
        const blockId = blockElement.id || Object.keys(window.yourBlockData)[0];
        const blockData = window.yourBlockData[blockId];
        
        console.log('Looking for block ID:', blockId);
        console.log('Found block data:', blockData);
        
        if (blockData) {
            videos = blockData.videos || [];
            transitionDuration = blockData.transitionDuration || 8000;
            autoPlay = blockData.autoPlay !== false;
            showControls = blockData.showControls !== false;
            console.log('Got data from WordPress block attributes:', videos.length, 'videos');
        } else {
            console.warn('No block data found for ID:', blockId);
            videos = [];
        }
    } else {
        console.warn('No yourBlockData found. Block attributes not passed from PHP.');
        videos = [];
    }
    
    if (videos.length === 0) {
        console.warn('No videos found');
        return;
    }
    
    console.log('Initialized with videos:', videos.length);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async function() {
    await initializeVideos();
    
    // Your block initialization logic here
    if (videos.length > 0) {
        // Initialize your block functionality
        console.log('Block initialized with videos:', videos.length);
    }
});
```

### 4. Block Configuration (`block.json`)

Ensure your `block.json` has proper default values:

```json
{
    "attributes": {
        "videos": {
            "type": "array",
            "default": [
                {
                    "id": 1,
                    "title": "Default Video 1",
                    "description": "Default description",
                    "videoUrl": "https://example.com/video1",
                    "videoType": "youtube",
                    "thumbnail": "",
                    "thumbnailId": 0,
                    "autoplay": true,
                    "muted": true,
                    "useImage": false,
                    "imageUrl": "",
                    "imageId": 0
                }
            ]
        },
        "transitionDuration": {
            "type": "number",
            "default": 8000
        },
        "autoPlay": {
            "type": "boolean",
            "default": true
        }
    }
}
```

## 📊 Data Flow Principles

### Static vs Dynamic Content
- **Static Content**: Can be rendered directly in `save.js` (text, numbers, simple strings)
- **Dynamic Content**: Must be rendered in `view.js` (arrays, objects, user-generated content)

### Data Passing Hierarchy
1. **Simple Attributes**: Pass via block attributes in `save.js`
2. **Complex Data**: Pass via PHP to JavaScript (`window.yourBlockData`)
3. **Never**: Embed complex data directly in HTML

### File Responsibilities
- **`save.js`**: Minimal static HTML structure with placeholders
- **`edit.js`**: Editor interface and attribute management
- **`view.js`**: Dynamic content creation and functionality
- **`PHP`**: Data passing from backend to frontend JavaScript

## 🔑 Key Points for Future Blocks

### 1. Force Save Mechanism
Always add a timestamp or small change to trigger WordPress save:
```javascript
const videosWithTimestamp = videos.map(video => ({
    ...video,
    _lastModified: Date.now()
}));
setAttributes({ videos: videosWithTimestamp });
```

### 2. Empty Dependency Array
Use `[]` in `useEffect` to run only once on mount:
```javascript
useEffect(() => {
    // Your logic here
}, []); // Empty dependency array - only run once on mount
```

### 3. Console Logging
Add extensive logging to debug data flow:
```javascript
console.log('useEffect running, current videos:', videos);
console.log('HERE IS THE DATA:', window.yourBlockData);
```

### 4. PHP Data Passing
Use `wp_footer` action for reliable data passing:
```php
add_action( 'wp_footer', function() use ($your_blocks) {
    echo '<script>window.yourBlockData = ' . json_encode($your_blocks) . ';</script>';
});
```

### 5. Recursive Block Finding
Handle nested blocks properly:
```php
function find_your_blocks($blocks, &$your_blocks) {
    foreach ( $blocks as $block ) {
        if ( $block['blockName'] === 'create-block/your-block' ) {
            $your_blocks[$block['attrs']['blockId']] = $block['attrs'];
        }
        if ( ! empty( $block['innerBlocks'] ) ) {
            find_your_blocks( $block['innerBlocks'], $your_blocks );
        }
    }
}
```

### 6. Save the Post
Always save the post/page after the `useEffect` runs in the editor.

## 🧪 Testing Steps

1. **Editor Console Check**: Look for `useEffect` logs in the WordPress editor
2. **Save the Post**: Click "Update" or "Publish" in the WordPress editor
3. **Frontend Console Check**: Look for "HERE IS THE DATA" log in the frontend
4. **Data Verification**: Verify data is properly passed from PHP to JavaScript

## 🎯 When to Use This Approach

- Complex block attributes (arrays, objects)
- Attributes that need to be initialized with default values
- Blocks where data exists in editor but not in frontend
- WordPress Gutenberg blocks with persistent data issues
- Blocks with dynamic content that needs to be saved

## 🚀 Expected Results

After implementing this solution:

1. Block attributes will be properly saved to the database
2. PHP will receive the full block data including complex arrays
3. Frontend JavaScript will have access to all block attributes
4. Your block will function correctly with all dynamic content

## 📝 Example Implementation

See the complete implementation in:
- `src/video-hero-block/edit.js` - Editor component with force save
- `adaire-blocks.php` - PHP data passing with recursive block finding
- `src/video-hero-block/view.js` - Frontend JavaScript with data initialization

This approach ensures that block attributes are properly saved and accessible in the frontend! 🎉
