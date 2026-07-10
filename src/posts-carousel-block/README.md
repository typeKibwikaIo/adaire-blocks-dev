# Posts Grid Block

A powerful and flexible WordPress Gutenberg block for displaying posts in beautiful grid layouts with advanced animations and filtering capabilities.

## Features

### 🎨 Layout Options
- **Normal Grid**: Traditional card-based grid layout with customizable columns (1-6)
- **List Layout**: Horizontal list layout perfect for showcasing posts with side-by-side content
- **Bento Grid**: Modern asymmetric grid with overlay content on featured images

### 📱 Responsive Design
- Fully responsive across all device sizes
- Adaptive column layouts (6→2→1 columns on smaller screens)
- Mobile-optimized touch interactions

### 🎭 Advanced Animations
Powered by GSAP with multiple animation types:
- **Fade Up**: Smooth fade-in with upward motion
- **Fade In**: Simple opacity transition
- **Scale Up**: Scale animation from small to full size
- **Slide Up**: Slide-in from bottom
- **Rotate In**: Rotation effect with fade
- **Bounce In**: Playful bounce animation

### 🎯 Content Display Options
- **Feature Image**: Customizable height and fit options
- **Categories**: Display post categories with custom styling
- **Date Posted**: Publication date with formatting options
- **Author**: Post author information
- **Read Time**: Estimated reading time calculation
- **Title**: Customizable typography and colors
- **Excerpt**: Truncated content preview with adjustable length

### 🔍 Filtering System
- **Category Filtering**: Filter posts by categories with animated transitions
- **Filter Positions**: Top or bottom placement
- **Filter Styles**: Pills, buttons, or dropdown options
- **Smooth Transitions**: GSAP-powered filter animations

### 🎨 Customization Options
- **Typography**: Font sizes, weights, and colors for all text elements
- **Colors**: Custom color schemes for titles, excerpts, meta, and categories
- **Spacing**: Adjustable padding, margins, and gaps
- **Border Radius**: Rounded corners for modern aesthetics
- **Container**: Full-width or constrained layouts
- **Alignment**: Left, center, or right text alignment

### ✨ Interactive Effects
- **Hover Animations**: Scale, shadow, and color transitions
- **Image Effects**: Zoom effects on hover
- **Smooth Transitions**: All interactions use GSAP for buttery-smooth animations

## Usage

### Basic Setup
1. Add the Posts Grid block to your page/post
2. Configure the number of posts to display
3. Select layout type (Normal, List, or Bento)
4. Choose which content elements to show

### Advanced Configuration

#### Content Settings
- **Posts Per Page**: 1-20 posts
- **Post Type**: Posts, Pages, or Custom Post Types
- **Category Selection**: Choose specific categories or leave empty for all
- **Exclude Current Post**: Automatically exclude current post when viewing single posts

#### Layout Configuration
- **Columns**: 1-6 columns for normal grid
- **Card Styling**: Border radius, padding, and gap settings
- **Image Settings**: Height and fit options (cover, contain, fill)
- **Text Alignment**: Left, center, or right alignment

#### Animation Settings
- **Enable/Disable**: Toggle animations on/off
- **Animation Type**: Choose from 6 different animation styles
- **Duration**: 0.1-2 seconds
- **Delay**: Stagger delay between items (0-0.5s)
- **Easing**: 6 different GSAP easing options
- **Hover Effects**: Scale and shadow effects on hover

#### Filtering Options
- **Enable Filtering**: Show/hide category filter buttons
- **Filter Position**: Top or bottom of the grid
- **Filter Style**: Pills, buttons, or dropdown appearance

## Technical Details

### Dependencies
- **GSAP**: For all animations and interactions
- **ScrollTrigger**: For scroll-based animations
- **WordPress REST API**: For fetching post data
- **WordPress Block Editor**: Gutenberg integration

### Performance Features
- **Lazy Loading**: Images load only when needed
- **Efficient API Calls**: Optimized REST API requests
- **Cached Data**: Category and post data caching
- **Responsive Images**: Multiple image sizes for different devices

### Accessibility
- **Keyboard Navigation**: Full keyboard support for filters
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

## CSS Custom Properties

The block uses CSS custom properties for easy theming:

```css
:root {
  --adaire-posts-grid-columns: 3;
  --adaire-posts-grid-gap: 24px;
  --adaire-posts-grid-border-radius: 12px;
  --adaire-posts-grid-padding: 24px;
  --adaire-posts-grid-image-height: 200px;
  --adaire-posts-grid-title-color: #1f2937;
  --adaire-posts-grid-title-font-size: 20px;
  --adaire-posts-grid-title-font-weight: 600;
  --adaire-posts-grid-excerpt-color: #6b7280;
  --adaire-posts-grid-excerpt-font-size: 14px;
  --adaire-posts-grid-meta-color: #9ca3af;
  --adaire-posts-grid-meta-font-size: 12px;
  --adaire-posts-grid-category-color: #3b82f6;
  --adaire-posts-grid-category-background: #eff6ff;
  --adaire-posts-grid-category-border-radius: 20px;
  --adaire-posts-grid-hover-scale: 1.05;
  --adaire-posts-grid-overlay-opacity: 0.4;
  --adaire-posts-grid-overlay-gradient: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
}
```

## API Endpoints

The block creates custom REST API endpoints:

- `GET /wp-json/adaire/v1/posts-grid-data` - Fetch posts data with filtering
- Enhanced WordPress REST API responses with additional post metadata

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Fallbacks**: Graceful degradation for older browsers

## Examples

### Blog Grid
Perfect for showcasing blog posts with category filtering and smooth animations.

### Portfolio Showcase
Use the Bento grid layout to create an eye-catching portfolio display.

### News Section
List layout works great for news articles with author and date information.

### Product Showcase
Display products or services with custom post types and filtering.

## Troubleshooting

### Common Issues

1. **Posts not loading**: Check if REST API is enabled and posts are published
2. **Images not showing**: Ensure featured images are set and image URLs are accessible
3. **Animations not working**: Verify GSAP is loaded and JavaScript errors are resolved
4. **Filtering not working**: Check if categories are assigned to posts

### Performance Tips

1. **Limit posts per page**: Keep under 12 posts for optimal performance
2. **Optimize images**: Use appropriately sized images for faster loading
3. **Enable caching**: Use WordPress caching plugins for better performance
4. **Lazy loading**: Images load automatically when needed

## Development

### File Structure
```
src/posts-grid-block/
├── block.json          # Block configuration
├── index.js            # Block registration
├── edit.js             # Editor component
├── save.js             # Save component
├── view.js             # Frontend JavaScript
├── style.scss          # Styles
├── render.php          # PHP server-side rendering
└── README.md           # Documentation
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm start
```

## License

This block is part of the Adaire Blocks plugin and follows the same GPL-2.0+ license.
