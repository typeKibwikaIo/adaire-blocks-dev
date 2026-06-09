# Counter Block Documentation

## Overview

In this article, we look at the Counter Block, an animated numeric display that counts up or down between two values. The block includes controls for timing, prefixes, suffixes, captions, typography, and responsive layout. Use it to showcase metrics, achievements, or countdowns with smooth animations that draw attention to key numbers.

## Adding the Counter Block to your page

### Locate and add the Counter Block

1. Type "/" and then type in "counter"
2. Select the Counter Block
3. The block appears with a default counter configured to animate from 100 to 200

## Counter Settings

### Number Range

**Starting Number** - Initial value displayed before the animation runs  
- Default: 100  
- Accepts positive or negative integers and decimal values

**Ending Number** - Target value reached at the end of the animation  
- Default: 200  
- Set lower than the starting number to create countdowns

**Counter Direction** - Determines whether the counter counts up or down  
- Options: Up, Down  
- Default: Up  
- Direction automatically adjusts the step size between numbers

### Timing & Delay

**Duration (ms)** - Total time of the animation  
- Range: 500 to 10000  
- Default: 3000  
- Longer durations create slower, more dramatic counts

**Enable Delay** - Toggle to add a pre-animation delay  
- Default: Off  
- Enable to stagger multiple counters on the same page

**Delay Time (ms)** - Delay before animation starts  
- Range: 0 to 5000  
- Default: 500  
- Only active when "Enable Delay" is on

### Prefix & Suffix

**Prefix** - Text that appears before the number (e.g., `$`, `+`, `~`)  
- Default: Empty  
- Ideal for currency symbols or qualifiers

**Suffix** - Text that appears after the number (e.g., `%`, `K`, `hrs`)  
- Default: Empty  
- Use for units or percentage indicators

### Caption

**Caption Text** - Optional descriptive text for the counter  
- Default: Empty  
- Provide context such as "Projects Completed"

**Caption Position** - Placement of the caption relative to the number  
- Options: Top, Bottom  
- Default: Bottom  
- Adjust to match your layout or design system

**Caption Font Size** - Size of the caption text  
- Range: 10px to 48px  
- Default: 16px  
- Pair with caption color for readability

**Caption Color** - Hex color for the caption text  
- Default: #666666  
- Use lighter colors on dark backgrounds

## Typography Settings

### Number Styling

**Font Size** - Controls the height of the numeric display  
- Range: 12px to 120px  
- Default: 48px  
- Adjust per breakpoint using custom CSS if needed

**Font Weight** - Thickness of the number  
- Options: 300, 400, 500, 600, 700, 800, 900  
- Default: 700 (bold)  
- Match your brand typography for consistency

**Color** - Hex value for the number  
- Default: #1a1a1a  
- Choose brand colors or accent hues to highlight metrics

**Letter Spacing** - Adjust spacing between digits  
- Range: -5px to 20px  
- Default: 0px  
- Use positive values for spaced-out displays or negative for condensed looks

## Container & Layout Settings

### Container Mode

**Container Mode** - Choose between full width or constrained wrapper  
- Options: Full (default), Constrained  
- Constrained mode exposes responsive max-width controls

**Max Width** - Device-specific maximum width when constrained  
- Desktop Default: 1200px  
- Tablet Default: 100%  
- Mobile Default: 100%  
- Units supported: px, %, rem, vw

### Spacing Controls

**Margins** - Top/right/bottom/left spacing per device  
- Default: 0px  
- Provide breathing room around the counter within sections

**Padding** - Inner spacing around the counter content  
- Default: 0px  
- Add padding when placing the counter inside cards or colored boxes

## Responsive Behavior

### Desktop (> 1024px)
- Uses configured font size and weight for maximum impact
- Constrained mode centers the counter within the page grid
- Works well in hero sections or statistic rows

### Tablet (768px - 1024px)
- Maintains visibility with medium font sizes
- Responsive margins/padding can be adjusted for tighter layouts
- Captions remain legible with default sizes

### Mobile (< 768px)
- Animations remain smooth and performant
- Consider reducing font size via custom CSS for narrow screens
- Prefixes and suffixes stay attached to the number for clarity

## Technical Features

### CSS Custom Properties

- `--counter-font-size`, `--counter-font-weight`, `--counter-letter-spacing`
- `--counter-color`, `--counter-caption-color`
- `--counter-container-max-width-*` for desktop/tablet/mobile
- Margin and padding variables per breakpoint allow theme overrides

### JavaScript Animation

- Frontend script (`view.js`) calculates incremental updates between start and end values
- Supports counting up or down with smooth requestAnimationFrame timing
- Delay toggle defers animation until the block is in view
- Unique `data-counter-id` ensures multiple counters run independently

## Usage Tips

1. **Highlight Key Metrics** - Use large font sizes and bold colors for standout stats.
2. **Combine with Icons** - Pair the counter with an icon block above or beside it for context.
3. **Stagger Durations** - Mix durations (2000–4000ms) to create visual rhythm across multiple counters.
4. **Add Captions** - Always pair numbers with plain-language captions so the metric is clear.
5. **Test Looping** - For live dashboards, consider refreshing the page at intervals rather than looping the animation.

## Best Practices

- **Round Numbers** - Rounded values (1K, 250K, 4.7M) are easier to parse quickly.
- **Use Prefix/Suffix Sparingly** - Avoid crowding the number; stick to short units.
- **Mind Accessibility** - Ensure caption text explains the metric for screen reader users.
- **Control Contrast** - High-contrast colors improve readability, especially on mobile.
- **Stay Consistent** - Align font sizes and colors across all counters to create a cohesive section.

## Accessibility

- **Semantic Output** - Renders numbers with surrounding text so screen readers announce values naturally.
- **Caption Context** - Provide descriptive captions or surrounding text for clarity.
- **Reduced Motion Considerations** - Animations are brief, but you can disable via custom CSS if necessary.
- **Keyboard Interaction** - Static display; no keyboard traps or focus issues.

## Browser Compatibility

- **Modern Browsers** - Supported in Chrome, Firefox, Safari, and Edge.
- **Mobile Browsers** - Works on iOS Safari and Android Chrome.
- **Fallback** - If JavaScript is disabled, the ending number remains visible as static text.
- **Performance** - Uses requestAnimationFrame for smooth counting and minimal CPU usage.

## Screenshots

### Desktop View
- Large bold number with caption underneath
- Prefix and suffix visible for currency or percentages
- Counter centered within a constrained container

### Tablet View
- Medium typography scaling for balanced layout
- Caption readable with default spacing
- Counter embedded within a multi-column stats section

### Mobile View
- Single-column layout with stacked counters
- Smooth animation without jank on scroll
- Numbers remain legible with default 48px size



