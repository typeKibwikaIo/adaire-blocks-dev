# Logos Block Documentation

## Overview

In this article, we look at the Logos Block, a responsive carousel for showcasing partner logos, client badges, or media mentions. It supports autoplay, hover pause, customizable slide counts, and an optional title area that frames the logo strip. Use it to build social proof sections on landing pages or footers.

## Adding the Logos Block to your page

### Locate and add the Logos Block

1. Type "/" and then type in "logos"
2. Select the Logos Block
3. The block appears with a placeholder heading and sample logo slot

## Logo Management

### Partner Logos

**Logo Repeater** - Add, remove, or reorder logos in the inspector  
- Each item stores company name, image URL, and attachment ID  
- Default entry: "Company 1" with empty image  
- Upload images via the media library or paste external URLs

**Logo Height** - Standardize logo height across the slider  
- Range: 20px to 200px  
- Default: 60px  
- Logos maintain aspect ratio to avoid distortion

**Gap Between Logos** - Spacing between slides  
- Accepts CSS units (e.g., `1rem`, `24px`)  
- Default: `1rem`  
- Adjust to tighten or loosen the logo lineup

## Slider Settings

### Autoplay Controls

**Slider Speed** - Duration (in seconds) for the marquee-style autoplay  
- Range: 0.2 to 5  
- Default: 0.5 (fast glide)  
- Lower values = faster movement; higher values = slower glide

**Slides Per View** - Number of logos visible at once  
- Range: 1 to 8  
- Default: 4  
- Responsive breakpoints adjust automatically to maintain readability

**Pause On Hover** - Toggle to freeze the slider when users hover/focus  
- Default: On  
- Useful for letting visitors inspect individual logos

## Title & Styling

### Heading

**Title Text** - Optional heading displayed above the logos  
- Default: "Our Partners"  
- Edit inline in the canvas or via inspector inputs

**Title Font Size** - Numeric value in pixels  
- Range: 12px to 48px  
- Default: 24px  
- Combine with font weight for hierarchy

**Title Font Weight** - Visual weight of the heading  
- Options: 300–900  
- Default: 600  
- Choose lighter weights for subtle labeling

**Title Color** - Hex value for the heading  
- Default: #333333  
- Ensure contrast with the background color

**Title Padding (Top/Bottom)** - Space above and below the heading  
- Defaults: 20px top, 30px bottom  
- Adjust to balance white space between title and logos

### Background & Padding

**Background Color** - Container background  
- Default: #ffffff  
- Switch to light gray or brand colors for emphasis

**Block Padding (Top/Bottom)** - Outer padding for the entire section  
- Default: 40px top and bottom  
- Create breathing room within sections or landing pages

## Container Settings

**Container Mode** - Full width vs constrained layout  
- Options: Full (default), Constrained  
- Constrained mode centers the slider within a max width

**Container Max Width** - Device-specific width when constrained  
- Desktop: 1200px (default)  
- Tablet: 100%  
- Mobile: 100%  
- Units: px, %, rem, vw

## Responsive Behavior

### Desktop (> 1024px)
- Shows up to 4 logos (default) simultaneously with smooth marquee motion
- Hover pause ensures visitors can inspect logos closely
- Works well within dark or light themes thanks to background controls

### Tablet (768px - 1024px)
- Automatically reduces slides per view to maintain comfortable spacing
- Touch gestures allow manual scrolling if autoplay is paused
- Title and padding adjust to keep the section compact

### Mobile (< 768px)
- Displays fewer logos per view (typically 1–2) for clarity
- Logos remain tappable even when autoplay is active
- Consider reducing slider speed for readability on smaller screens

## Technical Features

### CSS Custom Properties

- `--logos-gap`, `--logos-height` for controlling spacing and sizing
- `--logos-title-size`, `--logos-title-weight`, `--logos-title-color`
- `--logos-bg`, `--logos-padding-top`, `--logos-padding-bottom`
- `--logos-container-max-width-*` for responsive container sizing

### JavaScript Enhancements

- Frontend script (`view.js`) powers autoplay and pause-on-hover functionality
- Uses CSS transforms for smooth, GPU-accelerated scrolling
- Generates unique block IDs for targeting styles per instance

## Usage Tips

1. **Use High-Contrast Logos** - Upload transparent PNG/SVG files to blend with different backgrounds.
2. **Standardize Logo Size** - Adjust the logo height so all items appear uniform.
3. **Group by Category** - Create multiple logo blocks for clients, partners, press mentions.
4. **Adjust Speed** - Slow down the slider on pages with dense content to prevent distraction.
5. **Duplicate for Variations** - Clone the block to maintain styling when showcasing new logo sets.

## Best Practices

- **Optimize Images** - Compress logo files to keep load times low.
- **Limit Quantity per Row** - 4–5 logos per viewport ensures each brand remains legible.
- **Maintain Contrast** - Keep background and title colors readable, especially on brand-colored sections.
- **Combine with Testimonials** - Pair logos with testimonial sliders for stronger social proof.
- **Update Regularly** - Refresh logos to reflect current partnerships and keep trust cues current.

## Accessibility

- **Alt Text** - Provide company names as alt text for each logo image.
- **Pause on Hover** - Default setting supports users who need more time to read.
- **Keyboard Interaction** - Logos are static images; include surrounding text for context if needed.
- **Announce Relationships** - Use introductory text (e.g., "Trusted by") to set expectations.

## Browser Compatibility

- **Modern Browsers** - Tested in Chrome, Firefox, Safari, Edge.
- **Mobile Browsers** - Smooth scrolling on iOS Safari and Android Chrome.
- **Fallback** - If JavaScript is disabled, logos display in a static flex row.

## Screenshots

### Desktop View
- Title with bold text followed by a horizontal strip of logos
- Smooth autoplay showcasing multiple brands
- Ample padding and neutral background

### Tablet View
- Logos resized for mid-width screens with comfortable spacing
- Optional pause-on-hover provides readability
- Title and padding adapt to tighter layouts

### Mobile View
- Single-column carousel with 1–2 logos visible
- Tap-friendly logos retaining brand clarity
- Section fits neatly within mobile landing pages



