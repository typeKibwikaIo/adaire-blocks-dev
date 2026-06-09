# Tabs Block Documentation

## Overview
A beautiful, fully customizable tabs block with smooth GSAP animations for WordPress Gutenberg editor.

## Features

### ✨ Core Functionality
- **Dynamic Tab Management**: Add, remove, and reorder tabs with ease
- **Smooth Animations**: Beautiful GSAP-powered transitions with customizable duration and easing
- **Animated Underline**: Smoothly moves between tabs with configurable color and height
- **Fade Transitions**: Content fades in/out with stagger effects on child elements
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Home, End)
- **Accessibility**: Proper ARIA attributes and roles for screen readers

### 🎨 Customization Options

#### Container Settings
- **Width Mode**: Full width or constrained
- **Max Width**: Customizable with units (px, %, rem, vw)

#### Tab Styling
- **Alignment**: Left, Center, Right, Space Between
- **Font Size**: 12-48px
- **Font Weight**: Normal and Active states (300-800)
- **Tab Gap**: 8-80px spacing between tabs
- **Colors**:
  - Inactive tab color
  - Active tab color
  - Underline color
- **Underline Height**: 1-10px

#### Content Spacing
- **Padding**: Individual controls for Top, Right, Bottom, Left (0-120px)
- **Margins**: Individual controls for all sides (0-200px)

#### Animation Settings
- **Duration**: 0.1-2 seconds
- **Easing Options**:
  - power2.out
  - power3.out
  - power4.out
  - elastic.out
  - back.out

### 🏗️ Block Structure
The tabs block uses a nested structure:
- **Tabs Block** (Parent): Manages tab navigation and settings
- **Tab Panel Block** (Child): Contains the content for each tab (uses InnerBlocks for flexibility)

Each tab panel can contain any Gutenberg blocks (groups, paragraphs, images, etc.)

### 🎭 Animations
The block features several GSAP animations:

1. **Underline Movement**: Smoothly slides between active tabs
2. **Content Fade Out**: Old content fades out and moves up slightly
3. **Content Fade In**: New content fades in and moves up into position
4. **Stagger Effect**: Child elements animate in sequence for a polished look
5. **Hover Effect**: Tabs scale slightly on hover (5% increase)

### 🎯 Usage

1. **Add the Block**: Search for "Tabs" in the block inserter
2. **Configure Tabs**: Use the sidebar to add/remove tabs and set titles
3. **Customize Appearance**: Adjust colors, spacing, and animation settings
4. **Add Content**: Click on each tab and add content using any Gutenberg blocks
5. **Reorder Tabs**: Use the ↑ and ↓ buttons in the sidebar to reorder

### 💡 Tips

- The active tab is highlighted in the editor for easy identification
- Each tab content is a separate Inner Blocks area for maximum flexibility
- Use the container mode "Constrained" for centered, max-width content
- Experiment with different easing functions for unique animation feels
- The underline has a subtle glow effect using box-shadow

### 📱 Responsive Design
- Font sizes scale down on mobile (90% on tablet, 85% on phone)
- Gap spacing reduces on smaller screens
- Content padding adjusts automatically
- Tabs wrap on mobile for better usability

### ⌨️ Keyboard Navigation
- **Left Arrow**: Previous tab
- **Right Arrow**: Next tab
- **Home**: First tab
- **End**: Last tab

### 🎨 Default Theme
The block comes with a beautiful default theme inspired by modern SaaS websites:
- Inactive tabs: Slate gray (#64748b)
- Active tabs: Dark slate (#0f172a)
- Underline: Bright blue (#3b82f6) with glow effect
- Smooth, professional animations

## Technical Details

### Files Created
```
src/tabs-block/
├── block.json          - Block configuration
├── edit.js            - Editor component
├── save.js            - Frontend output
├── view.js            - Frontend JavaScript (GSAP animations)
├── style.scss         - Frontend & editor styles
├── editor.scss        - Editor-only styles
└── index.js           - Entry point

src/tab-panel-block/
├── block.json         - Panel configuration
├── edit.js            - Panel editor component
├── save.js            - Panel frontend output
├── style.scss         - Panel styles
└── index.js           - Entry point
```

### Dependencies
- **GSAP**: Already included in your project (v3.13.0)
- **WordPress Block Editor**: Standard Gutenberg APIs
- **InnerBlocks**: For flexible content areas

## Example Use Cases
1. Product features showcase
2. Service categories
3. FAQ sections with categorized questions
4. Pricing tiers
5. Portfolio categories
6. Documentation sections
7. Team departments
8. Multi-step processes

Enjoy your new beautiful tabs block! 🎉

