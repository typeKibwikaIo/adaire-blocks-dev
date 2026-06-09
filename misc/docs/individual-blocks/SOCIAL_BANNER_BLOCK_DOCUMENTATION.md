# Social Banner Block Documentation

> **Display a sticky social media banner on the side of the screen with customizable icons, colors, links, and hover animations. Perfect for keeping social media links always visible as users scroll through your content.**

## 📦 Overview

The Social Banner Block is a fixed-position WordPress block that displays a vertical stack of social media icons on the left or right side of the screen. It's ideal for:

- 🔗 **Social Media Links** - Facebook, Twitter, LinkedIn, Instagram, etc.
- 📧 **Contact Methods** - Email, WhatsApp, Phone
- 🌐 **External Resources** - Portfolio, Blog, Documentation
- 📱 **Mobile-Friendly** - Responsive design that works on all devices
- ✨ **Always Visible** - Sticky positioning keeps links accessible while scrolling

## ✨ Key Features

### Positioning
- ✅ **Sticky Positioning** - Fixed to screen edge, stays visible while scrolling
- ✅ **Left or Right Side** - Choose which side of the screen to display
- ✅ **Flexible Offset** - Position from top or bottom with pixel or percentage units
- ✅ **Mobile Responsive** - Displays correctly on all screen sizes

### Icon Management
- ✅ **Multiple Icon Entries** - Add unlimited social media icons
- ✅ **Bootstrap Icons** - Access to 1,998+ icons via icon picker
- ✅ **Collapsible Panels** - Each icon entry is collapsible for easy editing
- ✅ **Individual Styling** - Custom colors and backgrounds per icon
- ✅ **Link Support** - Each icon can link to any URL
- ✅ **Link Target Control** - Open in same window or new tab

### Styling Options
- ✅ **Icon Size** - Adjustable from 16px to 64px
- ✅ **Icon Colors** - Custom color for each icon
- ✅ **Background Colors** - Custom background for each icon
- ✅ **Spacing** - Control gap between icons (0-30px)
- ✅ **Border Radius** - Rounded corners (0-50px)

### Hover Animations
- ✅ **12 Animation Types**:
  - Up - Moves upward on hover
  - Down - Moves downward on hover
  - Left - Moves left on hover
  - Right - Moves right on hover
  - Pulse - Pulsing scale animation
  - Scale Up - Grows larger on hover
  - Scale Down - Shrinks smaller on hover
  - Rotate - Rotates and scales on hover
  - Shake - Horizontal shake animation
  - Bounce - Bouncing animation
  - Glow - Glowing effect with brightness
  - None - No animation
- ✅ **Custom Duration** - Control animation speed (0.1s - 2s)
- ✅ **Easing Options** - 7 different easing functions:
  - Ease
  - Ease In
  - Ease Out
  - Ease In Out
  - Linear
  - Cubic Bezier (Smooth)
  - Cubic Bezier (Bounce)

## 🎛️ Available Settings

### Position Settings Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Position** | Select | Right | Which side of screen (Left/Right) |
| **Offset From** | Select | Top | Position from top or bottom |
| **Offset** | Range | 100 | Distance from top/bottom (0-500px or 0-100%) |
| **Unit** | Select | px | Offset unit (px or %) |

### Icon Settings Panel

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Icon Size** | Range | 24px | Size of icons (16-64px) |
| **Spacing Between Icons** | Range | 10px | Gap between icons (0-30px) |
| **Border Radius** | Range | 0px | Rounded corners (0-50px) |
| **Hover Animation** | Select | Up | Animation type on hover |
| **Animation Duration** | Range | 0.3s | Animation speed (0.1-2s) |
| **Animation Easing** | Select | Ease | Easing function for animations |

### Icon Entries Panel

Each icon entry has the following settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Bootstrap Icon** | Button | - | Opens icon picker modal |
| **Icon Color** | Color Picker | #ffffff | Color of the icon |
| **Background Color** | Color Picker | #000000 | Background color of icon container |
| **Link URL** | Text | - | URL to link to (optional) |
| **Link Target** | Select | New Window | Open in same window or new tab |

## 🚀 Usage Guide

### Adding the Block

1. In the WordPress editor, click the **+** button to add a block
2. Search for "Social Banner" or find it in the **Widgets** category
3. Click to insert the block

### Basic Setup

1. **Configure Position**:
   - Choose **Left** or **Right** side
   - Set **Offset From** (Top or Bottom)
   - Adjust **Offset** value and unit

2. **Add Icon Entries**:
   - Click **"Add Icon Entry"** button
   - Click **"Choose Icon"** to open the icon picker
   - Select an icon from the 1,998+ available Bootstrap Icons
   - Set **Icon Color** and **Background Color**
   - Add **Link URL** if you want the icon to be clickable
   - Choose **Link Target** (same window or new tab)

3. **Customize Styling**:
   - Adjust **Icon Size** to fit your design
   - Set **Spacing** between icons
   - Add **Border Radius** for rounded corners

4. **Configure Animations**:
   - Select **Hover Animation** type
   - Adjust **Animation Duration** for speed
   - Choose **Animation Easing** for smoothness

### Advanced Usage

#### Multiple Icons
- Add as many icon entries as needed
- Each icon can have different colors and links
- Use collapsible panels to manage many entries easily

#### Custom Positioning
- Use **percentage units** for responsive positioning (e.g., 50% = middle of screen)
- Use **pixel units** for fixed positioning (e.g., 100px from top)

#### Animation Customization
- Combine different animation types with custom durations
- Use **Cubic Bezier (Bounce)** for playful effects
- Use **Linear** for consistent speed
- Set duration to **0.1s** for quick, snappy animations
- Set duration to **2s** for slow, dramatic effects

## 📱 Responsive Behavior

- The banner is **fixed position** and stays visible while scrolling
- Works on **desktop, tablet, and mobile** devices
- Icons stack vertically regardless of screen size
- Touch-friendly on mobile devices

## 🎨 Styling Examples

### Minimal Design
- Icon Size: 20px
- Spacing: 8px
- Border Radius: 0px
- Background: Transparent
- Animation: None

### Modern Design
- Icon Size: 32px
- Spacing: 12px
- Border Radius: 8px
- Background: Brand colors
- Animation: Scale Up

### Playful Design
- Icon Size: 28px
- Spacing: 15px
- Border Radius: 50% (circular)
- Background: Vibrant colors
- Animation: Bounce with Cubic Bezier easing

## 🔧 Technical Details

### Block Attributes

```json
{
  "blockId": "string",
  "position": "left" | "right",
  "offsetFrom": "top" | "bottom",
  "offset": "number",
  "offsetUnit": "px" | "%",
  "iconEntries": "array",
  "iconSize": "number",
  "spacing": "number",
  "borderRadius": "number",
  "hoverAnimation": "string",
  "animationDuration": "number",
  "animationEasing": "string"
}
```

### Icon Entry Structure

```json
{
  "id": "string",
  "icon": "string (Bootstrap Icon class)",
  "iconColor": "string (hex color)",
  "backgroundColor": "string (hex color)",
  "linkUrl": "string",
  "linkTarget": "_self" | "_blank"
}
```

### CSS Classes

- `.adaire-social-banner` - Main container
- `.adaire-social-banner--hover-{animation}` - Animation modifier class
- `.adaire-social-banner__list` - Icon list container
- `.adaire-social-banner__item` - Individual icon item
- `.adaire-social-banner__icon` - Icon element

### CSS Variables

- `--banner-position` - Left or right positioning
- `--banner-offset-from` - Top or bottom offset
- `--banner-offset` - Offset value with unit
- `--icon-size` - Size of icons
- `--icon-spacing` - Gap between icons
- `--icon-border-radius` - Border radius value
- `--animation-duration` - Animation duration
- `--animation-easing` - Animation easing function

## 💡 Tips & Best Practices

1. **Icon Selection**: Choose icons that match your brand and are easily recognizable
2. **Color Contrast**: Ensure icon colors contrast well with background colors for visibility
3. **Link Testing**: Always test links to ensure they work correctly
4. **Animation Performance**: Use shorter durations (0.2-0.4s) for better performance
5. **Mobile Consideration**: Test on mobile devices to ensure icons are easily tappable
6. **Positioning**: Use percentage offsets for responsive designs that work across screen sizes
7. **Accessibility**: Ensure link URLs are descriptive and icons have proper labels

## 🐛 Troubleshooting

### Icons Not Displaying
- Ensure Bootstrap Icons CSS is loaded (automatically enqueued)
- Check that icon classes are correct (should start with `bi bi-`)
- Verify icon entries have valid icon values

### Banner Not Sticky
- Check that the block is saved and published
- Verify CSS is loading correctly
- Check for conflicting CSS from theme or other plugins

### Animations Not Working
- Ensure animation duration is set (default: 0.3s)
- Check that hover animation is not set to "None"
- Verify CSS variables are being applied

### Icons Overlapping Content
- Adjust the offset value to move banner away from content
- Consider using percentage units for responsive positioning
- Test on different screen sizes

## 📝 Changelog

### Version 0.1.0
- Initial release
- Sticky positioning (left/right)
- Top/bottom offset with px and % units
- Multiple icon entries with Bootstrap Icons
- 12 hover animation types
- Custom animation duration and easing
- Collapsible icon entry panels
- Individual icon colors and backgrounds
- Link support with target control

## 🔗 Related Documentation

- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library reference
- [WordPress Block Editor](https://developer.wordpress.org/block-editor/) - Gutenberg documentation
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations) - Animation reference

## 📄 License

This block is part of the Adaire Blocks plugin and follows the same license terms.

---

**Need Help?** Check the plugin documentation or contact support for assistance with the Social Banner Block.


