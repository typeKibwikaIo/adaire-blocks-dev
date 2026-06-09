# Posts Grid Block

A powerful, feature-rich WordPress block for displaying posts in a beautiful, customizable grid layout with advanced filtering, pagination, and animations.

## Description

The Posts Grid Block allows you to showcase your WordPress posts in an elegant grid layout with complete control over appearance, behavior, and animations. Perfect for blog pages, portfolio showcases, news sections, or any content-heavy website.

**Key Features:**
- 🎨 Fully customizable styling (colors, typography, spacing)
- 📱 Responsive with device-specific settings (Desktop/Tablet/Mobile)
- 🎬 Multiple transition animations with FLIP technique
- 🔍 Category filtering with smooth transitions
- 📄 Pagination with 3 different styles
- ⚡ Smooth GSAP-powered animations
- 🎯 Smart positioning - posts stay in place when filtering

---

## Content Options

### Posts Display
- **Posts Per Page**: Number of posts to display (1-100)
- **Enable Pagination**: Toggle pagination on/off
- **Pagination Style**: 
  - Page Numbers (← Previous 1 2 3 Next →)
  - Load More Button
  - Previous/Next with page info
- **Exclude Current Post**: Automatically exclude the current post from the grid

### Category Selection
- Select specific categories to display
- Leave empty to show all posts
- Category labels on cards filter based on selection

### Post Information Display
Toggle visibility of:
- ✅ Categories
- ✅ Featured Image
- ✅ Publication Date
- ✅ Author Name
- ✅ Read Time
- ✅ Excerpt
- **Excerpt Length**: Number of words to display (1-100)

---

## Layout & Styling

### Grid Layout
- **Columns**: 1-6 columns (Desktop only)
- **Responsive Breakpoints**:
  - Desktop (>1024px): Your selected column count
  - Tablet (≤1024px): Automatically 2 columns
  - Mobile (≤768px): Automatically 1 column
- **Text Alignment**: Left, Center, or Right
- **Card Gap**: Spacing between cards (0-60px)
- **Card Padding**: Internal padding (0-60px)

### Card Styling
- **Card Border Radius**: Roundness of cards (0-50px)
- **Image Height**: Featured image height (100-400px)
- **Image Fit**: Cover, Contain, or Fill

### Border Radius Controls
- **Card Border Radius**: Post card corners
- **Category Tag Border Radius**: Category pill roundness
- **Filter Button Border Radius**: Category filter buttons
- **Pagination Border Radius**: Pagination button corners

---

## Typography

Full control over all text elements:

### Title
- **Font Size**: 12-48px
- **Font Weight**: Normal (400), Medium (500), Semi Bold (600), Bold (700)

### Excerpt
- **Font Size**: 10-24px
- **Font Weight**: Normal (400), Medium (500), Semi Bold (600), Bold (700)

### Meta (Date/Author/Read Time)
- **Font Size**: 8-20px
- **Font Weight**: Normal (400), Medium (500), Semi Bold (600), Bold (700)

---

## Colors

Customize colors for all elements:
- **Title Color**
- **Excerpt Color**
- **Meta Color** (date, author, read time)
- **Category Tag Color** (text)
- **Category Tag Background**

---

## Animations

### Transition Animations
Choose how cards appear/disappear when switching pages or categories:

1. **Fade**: Simple opacity fade
2. **Fade Up**: Fade with upward movement
3. **Fade Down**: Fade with downward movement
4. **Scale**: Fade with zoom effect
5. **Slide Left**: Fade with horizontal slide from right
6. **Slide Right**: Fade with horizontal slide from left
7. **Flip**: 3D rotation effect
8. **FLIP (Smart Position)**: ⭐ Keeps common posts in place, smoothly repositions

### Animation Settings
- **Enable Animations**: Master toggle for all animations
- **Animation Duration**: 0.1 - 2.0 seconds
- **Animation Delay (Stagger)**: 0 - 0.5 seconds between each card
- **Animation Ease**: Choose easing function (power2.out, power3.out, etc.)

### Hover Effects
- **Card Lift**: Smooth upward movement on hover
- **Shadow Enhancement**: Shadow deepens on hover
- **Image Zoom**: Subtle scale effect on image
- **Timing**: 0.2s linear for consistent feel

---

## Container & Spacing

### Container Width
- **Mode**: Full Width or Constrained
- **Responsive Max Width**:
  - Desktop: Custom value with units (px, %, rem, vw)
  - Tablet: Custom value with units
  - Mobile: Custom value with units

### Margins (Responsive)
Set different margins for each device:
- **Desktop Margins**: Top, Right, Bottom, Left
- **Tablet Margins**: Top, Right, Bottom, Left
- **Mobile Margins**: Top, Right, Bottom, Left

---

## Filtering

### Category Filtering
- **Enable Filtering**: Toggle category filter buttons on/off
- **Filter Display**: Shows above the grid
- **Filter Style**: Pill-style buttons
- **Interactive**: Click to filter, smooth transitions

---

## Advanced Features

### FLIP Animation Technique
When using "FLIP (Smart Position)" transition:
- Posts that exist in both old and new categories **stay in place**
- Only removed posts fade out
- Only new posts fade in
- Remaining posts **smoothly slide** to new positions
- Professional, smooth transitions

### Performance Optimizations
- Fetches up to 100 posts for client-side pagination
- CSS-based hover effects (no JavaScript overhead)
- GSAP for smooth, GPU-accelerated animations
- Efficient DOM manipulation

### Font Inheritance
All buttons and text elements inherit your site's font family automatically.

---

## Use Cases

### Blog Index Page
- Display latest posts in a grid
- Enable pagination for easy browsing
- Show categories and read time

### Portfolio Showcase
- Filter by project type (categories)
- Large images with overlay info
- Smooth FLIP transitions

### News Section
- Date and author display
- Category filtering
- Load more button style

### Content Archive
- High posts per page count
- Simple pagination
- Minimal design

---

## Best Practices

### For Best Performance
- Use FLIP animation for category filtering (smoothest)
- Keep animation duration around 0.3-0.6s
- Use linear easing for consistent feel
- Enable pagination for large post counts

### For Best UX
- Set appropriate posts per page (6-12 recommended)
- Use constrained mode for better readability
- Enable category filtering for content-heavy sites
- Use "Load More" pagination for infinite scroll feel

### For Best Design
- Match border radius across all elements (cards, filters, pagination)
- Use consistent font weights
- Align text left for better readability
- Keep hover animations subtle (0.2s)

---

## Technical Details

- **Built with**: React, GSAP, WordPress Block Editor
- **Responsive**: Mobile-first with breakpoints at 768px and 1024px
- **Animations**: GSAP with ScrollTrigger support
- **API**: WordPress REST API for dynamic content
- **Compatibility**: WordPress 5.9+

---

## Support

For issues or feature requests, please refer to the plugin documentation or contact support.

