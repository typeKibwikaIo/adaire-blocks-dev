# Counter Block - Quick Reference Card

## 🎯 At a Glance

| Feature | What It Does |
|---------|--------------|
| **Starting Number** | Where the count begins |
| **Ending Number** | Where the count ends |
| **Duration** | How long the animation takes |
| **Direction** | Count Up ↑ or Count Down ↓ |
| **Prefix** | Text before number ($, +, #) |
| **Suffix** | Text after number (%, K, M) |
| **Caption** | Label above/below counter |

## ⚙️ Panel Overview

```
Inspector Controls
├── Counter Settings (Starting, Ending, Duration, Delay)
├── Counter Content (Prefix, Suffix, Direction, Caption)
├── Typography (Font Size, Weight, Letter Spacing)
├── Colors (Counter Color, Caption Color)
├── Container Settings (Full/Constrained, Max Width)
├── Margins (Responsive spacing)
└── Padding (Responsive spacing)
```

## 🎨 Common Presets

### Money Counter
```
Prefix: $
Suffix: M
Font Size: 56px
Font Weight: 700
Color: #10b981 (Green)
Caption: "Annual Revenue"
```

### Percentage Stat
```
Prefix: ""
Suffix: %
Font Size: 48px
Font Weight: 600
Color: #3b82f6 (Blue)
Caption: "Success Rate"
```

### Customer Count
```
Prefix: ""
Suffix: K+
Font Size: 64px
Font Weight: 800
Color: #6366f1 (Indigo)
Caption: "Happy Customers"
```

### Countdown
```
Direction: Count Down
Starting: 24
Ending: 0
Suffix: " Hours"
Font Size: 72px
Font Weight: 900
Color: #ef4444 (Red)
Caption: "Limited Time Offer"
```

## 🚀 Quick Setup

1. **Add Block** → Search "Counter"
2. **Set Numbers** → Start: 0, End: 100
3. **Add Prefix/Suffix** → $, %, K, M, etc.
4. **Style** → Font size, color, weight
5. **Add Caption** → Descriptive text
6. **Publish** → View animation!

## 📱 Responsive Control

### Container
- Desktop: 1200px default
- Tablet: 100% (adapts to screen)
- Mobile: 100% (adapts to screen)

### Switch Devices
Click: 🖥️ Desktop | 📱 Tablet | 📱 Mobile

## 🎬 Animation Formula

```
Interval = Duration / (Ending - Starting)
```

**Example:**
- Duration: 3000ms
- Range: 0 → 100
- Updates every: 3000/100 = 30ms

## 🎨 Color Presets

| Use Case | Color | Hex |
|----------|-------|-----|
| Success | Green | #10b981 |
| Error/Urgency | Red | #ef4444 |
| Info | Blue | #3b82f6 |
| Warning | Orange | #f97316 |
| Neutral | Dark Gray | #1a1a1a |
| Muted | Gray | #6b7280 |

## 💡 Pro Tips Cheat Sheet

✅ Use K for thousands (5K vs 5000)  
✅ Use M for millions (2.5M vs 2500000)  
✅ Round numbers animate better  
✅ Keep duration 2-5 seconds  
✅ Add captions for context  
✅ Use color to convey meaning  
✅ Test with multiple blocks  

## 🔑 Data Attributes (Frontend)

```html
<div class="ab-counter-block"
     data-starting-number="0"
     data-ending-number="100"
     data-duration="3000"
     data-counter-direction="up"
     data-prefix="$"
     data-suffix="K"
     data-delay-bool="false"
     data-delay-time="500">
```

These are read by `view.js` to animate the counter.

## 🎭 Caption Positions

### Top Caption
```
─────────────
  Revenue Generated  ← Caption
  ─────────────
      $1.5M         ← Counter
  ─────────────
```

### Bottom Caption
```
─────────────
      $1.5M         ← Counter
  ─────────────
  Revenue Generated  ← Caption
─────────────
```

## 🔢 Number Formatting Examples

| Display | Settings |
|---------|----------|
| **$1,500** | Prefix: $, Number: 1500 |
| **+250%** | Prefix: +, Suffix: %, Number: 250 |
| **10K+** | Number: 10, Suffix: K+ |
| **#1** | Prefix: #, Number: 1 |
| **99.9%** | Number: 99.9, Suffix: % |

## ⚡ Performance Notes

- Each block instance runs independently
- `view.js` loads once per page (not per block)
- Multiple counters = multiple intervals (normal)
- Cleanup on unmount prevents memory leaks

## 🎓 Learning Path

1. Read: [Counter Block Documentation](./COUNTER_BLOCK_DOCUMENTATION.md)
2. Try: Add a block and experiment
3. Study: `src/counter-block/view.js` for animation logic
4. Reference: This quick reference card

---

**Happy counting!** 🚀

