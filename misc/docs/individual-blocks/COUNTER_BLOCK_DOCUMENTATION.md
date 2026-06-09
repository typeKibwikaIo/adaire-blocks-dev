# Counter Block Documentation

> **Display animated counters that count up or down to a target number, with customizable styling, prefixes, suffixes, and captions. Perfect for showcasing statistics, milestones, or achievements with smooth, eye-catching animations.**

## 📦 Overview

The Counter Block is a dynamic WordPress block that displays animated numerical counters. It's ideal for:

- 🎯 **Statistics** - Website visitors, downloads, users
- 💰 **Financial Metrics** - Revenue, savings, transactions
- 🏆 **Achievements** - Awards won, projects completed, years in business
- 📊 **Performance Metrics** - Success rate, satisfaction score, growth percentage
- ⏱️ **Countdowns** - Days remaining, hours left, limited offers

## ✨ Key Features

### Animation
- ✅ Smooth counting animation
- ✅ Count **up** or **down**
- ✅ Customizable duration (speed)
- ✅ Optional start delay
- ✅ Live preview in WordPress editor

### Content
- ✅ Custom starting and ending numbers
- ✅ Prefix text (e.g., $, +, #)
- ✅ Suffix text (e.g., %, K, M, +)
- ✅ Optional caption (above or below)

### Styling
- ✅ Font size (12px - 120px)
- ✅ Font weight (300 - 900)
- ✅ Custom colors
- ✅ Letter spacing
- ✅ Caption styling

### Layout
- ✅ Full width or constrained mode
- ✅ Responsive max-width (Desktop/Tablet/Mobile)
- ✅ Responsive margins and padding
- ✅ Text alignment

## 🎛️ Available Settings

### Counter Settings Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Starting Number** | Number | 100 | Number to start counting from |
| **Ending Number** | Number | 200 | Number to count to |
| **Duration (ms)** | Number | 3000 | Total animation time in milliseconds |
| **Enable Delay** | Toggle | Off | Add delay before animation starts |
| **Delay Time (ms)** | Number | 500 | Delay duration before counting starts |

### Counter Content Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Prefix** | Text | Empty | Text before the number (e.g., "$", "+", "#") |
| **Suffix** | Text | Empty | Text after the number (e.g., "%", "K", "M", "+") |
| **Counter Direction** | Button Group | Up | Count Up or Count Down |
| **Caption** | Text | Empty | Descriptive text for the counter |
| **Caption Position** | Button Group | Bottom | Place caption above or below counter |

### Typography Panel

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| **Font Size** | Range | 12-120px | 48px | Size of the counter number |
| **Font Weight** | Button Group | 300-900 | 700 | Weight of the counter number |
| **Letter Spacing** | Range | -5px to 20px | 0px | Space between characters |
| **Caption Font Size** | Range | 10-32px | 16px | Size of the caption text |

### Colors Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Counter Color** | Color Picker | #1a1a1a | Color of the number |
| **Caption Color** | Color Picker | #666666 | Color of the caption text |

### Container Settings Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Container Mode** | Button Group | Full Width | Full Width or Constrained |
| **Max Width** | Number + Unit | 1200px | Maximum width when constrained |
| **Device-Specific Max Width** | Responsive | Desktop/Tablet/Mobile | Different widths per device |

### Margins Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Margins** | Box Control | 0px all sides | Top, Right, Bottom, Left margins |
| **Device-Specific** | Responsive | Desktop/Tablet/Mobile | Different margins per device |

### Padding Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Padding** | Box Control | 0px all sides | Top, Right, Bottom, Left padding |
| **Device-Specific** | Responsive | Desktop/Tablet/Mobile | Different padding per device |

## 📝 Usage Examples

### Example 1: Revenue Counter
```
Starting Number: 0
Ending Number: 1500000
Duration: 3000ms
Prefix: "$"
Suffix: "M"
Caption: "Revenue Generated"
Direction: Count Up
Result: $0M → $1M → $2M → ... → $1500000M
```

### Example 2: Success Rate
```
Starting Number: 0
Ending Number: 99
Duration: 2000ms
Prefix: ""
Suffix: "%"
Caption: "Customer Satisfaction"
Direction: Count Up
Result: 0% → 1% → 2% → ... → 99%
```

### Example 3: Countdown Timer
```
Starting Number: 365
Ending Number: 0
Duration: 5000ms
Prefix: ""
Suffix: " Days"
Caption: "Until Launch"
Direction: Count Down
Result: 365 Days → 364 Days → ... → 0 Days
```

### Example 4: Years in Business
```
Starting Number: 1990
Ending Number: 2024
Duration: 4000ms
Prefix: ""
Suffix: ""
Caption: "Established"
Caption Position: Top
Direction: Count Up
Result: 1990 → 1991 → ... → 2024
```

### Example 5: Growth Percentage
```
Starting Number: 0
Ending Number: 250
Duration: 3000ms
Prefix: "+"
Suffix: "%"
Caption: "Year-over-Year Growth"
Direction: Count Up
Result: +0% → +1% → ... → +250%
```

## 🎨 Styling Tips

### Large Impact Numbers
```
Font Size: 72px
Font Weight: 900
Color: #3b82f6 (Blue)
Letter Spacing: 2px
```

### Subtle Statistics
```
Font Size: 24px
Font Weight: 400
Color: #6b7280 (Gray)
Letter Spacing: 0px
```

### Financial Display
```
Font Size: 56px
Font Weight: 700
Color: #10b981 (Green)
Prefix: "$"
Suffix: "M"
```

### Percentage Display
```
Font Size: 48px
Font Weight: 600
Color: #ef4444 (Red) or #10b981 (Green)
Suffix: "%"
```

## 🏗️ Technical Architecture

### Block Type
**Dynamic Block** - Server-side rendered with PHP, client-side animated with JavaScript

### Files Structure
```
counter-block/
├── block.json          - Block configuration & attributes
├── edit.js             - Editor component with live preview
├── index.js            - Block registration (no save function)
├── view.js             - Frontend animation logic
├── style.scss          - Frontend styles
└── editor.scss         - Editor-only styles
```

### How It Works

```
1. WordPress Editor (edit.js)
   ↓
   User sets attributes → Saves to database
   ↓
2. PHP Render Function (adaire-blocks.php)
   ↓
   Reads attributes → Outputs HTML with data attributes
   ↓
3. Frontend JavaScript (view.js)
   ↓
   Reads data attributes → Animates counter
```

### Data Flow

**Attributes in Database (JSON):**
```json
{
    "startingNumber": 0,
    "endingNumber": 100,
    "duration": 3000,
    "counterDirection": "up",
    "prefix": "$",
    "suffix": "K"
}
```

**PHP Outputs (HTML):**
```html
<div class="ab-counter-block" 
     data-starting-number="0"
     data-ending-number="100"
     data-duration="3000"
     data-counter-direction="up"
     data-prefix="$"
     data-suffix="K">
    <span class="displayNumber">0</span>
</div>
```

**JavaScript Animates (view.js):**
```javascript
// Reads data attributes
// Animates from 0 to 100 over 3 seconds
// Updates displayNumber element
```

## 🎯 Best Practices

### Performance
- ✅ Use reasonable durations (1000ms - 5000ms)
- ✅ Avoid very large number differences (keep under 10,000)
- ✅ Test with multiple blocks on one page

### Design
- ✅ Use contrasting colors for visibility
- ✅ Match font weight to your brand
- ✅ Add descriptive captions for context
- ✅ Use prefixes/suffixes for clarity ($, %, K, M)

### Accessibility
- ✅ Add meaningful captions (screen readers)
- ✅ Ensure color contrast (WCAG 2.1 AA minimum)
- ✅ Use semantic HTML structure

### Content
- ✅ Round numbers work better (100, 1000, 10000)
- ✅ Use K for thousands (5K instead of 5000)
- ✅ Use M for millions (1.5M instead of 1500000)
- ✅ Keep animations short (3-5 seconds)

## 🔧 Responsive Settings

### Container Max Width

| Device | Default | Units Available |
|--------|---------|----------------|
| Desktop | 1200px | px, %, rem, vw |
| Tablet | 100% | px, %, rem, vw |
| Mobile | 100% | px, %, rem, vw |

### Spacing (Margins & Padding)

Each side (top, right, bottom, left) can be set independently for:
- 📱 Desktop
- 📱 Tablet (≤1024px)
- 📱 Mobile (≤768px)

## 🎬 Animation Details

### Timing Calculation
```javascript
interval = duration / (endingNumber - startingNumber)
```

**Example:**
- Duration: 3000ms
- Start: 0
- End: 100
- Interval: 3000 / 100 = 30ms per number
- Result: Updates every 30ms for 3 seconds total

### Direction Behavior

**Count Up:**
```
Starting → Starting+1 → Starting+2 → ... → Ending
```

**Count Down:**
```
Starting → Starting-1 → Starting-2 → ... → Ending
```

**Note:** Starting number can be larger or smaller than ending number. The direction determines the animation path.

## 🐛 Troubleshooting

### Counter doesn't animate on frontend
**Solution:** Check browser console for JavaScript errors. Ensure view.js is loading.

### Counter jumps instead of smooth counting
**Solution:** Increase duration or decrease the number difference.

### Preview shows but frontend doesn't
**Solution:** Clear cache, check if view.js is enqueued, view page source to see if data attributes are present.

### Multiple counters interfere with each other
**Solution:** Each counter has a unique block ID. Check console for errors. This should not happen.

### Caption doesn't appear
**Solution:** Make sure you've entered text in the Caption field. Empty captions don't render.

### Constrained mode doesn't center
**Solution:** Ensure editor.scss is being loaded and contains the `.is-constrained` styles with `!important`.

## 💡 Pro Tips

### Tip 1: Use Suffix Shortcuts
```
1000 → "1K"
1000000 → "1M"
1000000000 → "1B"
```
Set ending number to actual value, use suffix for formatting.

### Tip 2: Percentage Growth
```
Prefix: "+"
Suffix: "%"
Starting: 0
Ending: 150
Caption: "Growth Rate"
```
Shows: +0% → +150%

### Tip 3: Currency Display
```
Prefix: "$"
Suffix: "M"
Starting: 0
Ending: 50
Caption: "Annual Revenue"
```
Shows: $0M → $50M

### Tip 4: Countdown Urgency
```
Direction: Count Down
Starting: 24
Ending: 0
Suffix: " Hours"
Caption: "Limited Time Offer"
Color: Red (#ef4444)
```
Shows: 24 Hours → 0 Hours

### Tip 5: Multiple Counters
```
Block 1: "1K+ Customers"
Block 2: "500+ Projects"
Block 3: "15+ Years"
Block 4: "99% Satisfaction"
```
Each counter animates independently!

## 🎨 Design Patterns

### Hero Statistics
```
Font Size: 64px
Font Weight: 800
Color: Primary brand color
Caption Position: Bottom
Container: Constrained (800px)
```

### Sidebar Widget
```
Font Size: 32px
Font Weight: 600
Color: Dark gray
Container: Full Width
Padding: 20px all sides
```

### Feature Section
```
Font Size: 48px
Font Weight: 700
Color: Accent color
Caption Position: Top
Caption Font Size: 14px
Caption Color: Muted gray
```

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Count up/down animation
- Prefix/suffix support
- Caption support
- Responsive container
- Typography controls
- Color controls
- Dynamic block rendering
- Live editor preview

## 📚 Related Documentation

- [Block Template Documentation](./START_HERE.md) - Container and spacing settings
- [Editor SCSS Guide](./EDITOR_SCSS_GUIDE.md) - Understanding editor styles
- [WordPress Block Attributes Guide](./WORDPRESS_BLOCK_ATTRIBUTES_SAVING_SOLUTION.md) - Attribute management

## 🚀 Quick Start

1. **Add Block** - Click + in WordPress editor, search "Counter"
2. **Set Numbers** - Choose starting and ending numbers
3. **Add Context** - Set prefix, suffix, and caption
4. **Style It** - Adjust font size, weight, and colors
5. **Publish** - Save and view the animation on frontend!

## 🎯 Common Use Cases

### Website Stats Section
```html
Three counters side by side:
1. "10K+ Happy Customers"
2. "500+ Projects Completed"
3. "15 Years Experience"
```

### Sales Dashboard
```html
"$1.5M Revenue This Year"
- Prefix: $
- Suffix: M
- Count from 0 to 1.5
```

### Countdown Campaign
```html
"48 Hours Left"
- Direction: Count Down
- Start: 48
- End: 0
- Suffix: " Hours"
```

### Achievement Showcase
```html
"99% Customer Satisfaction"
- Start: 0
- End: 99
- Suffix: %
- Color: Green
```

---

**Need help?** Check the other documentation files or inspect the code in `src/counter-block/`!

