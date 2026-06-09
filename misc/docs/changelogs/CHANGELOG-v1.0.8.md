# Adaire Blocks v1.0.8 - Release Notes

**Release Date:** October 9, 2025 | **WordPress:** 6.7+ | **PHP:** 7.4+

---



## Improvements & Fixes

### Responsive Container System
- Added to: Tabs, Accordion, Logos, Posts Grid, Call to Action, Container blocks
- Desktop (1200px), Tablet (100%), Mobile (100%) defaults
- Units: px, %, rem, vw
- Device switcher UI with icon controls

### Layout & Alignment
- **Tabs:** Fixed vertical layout display, added layout-specific alignment (horizontal & vertical)
- **Tabs:** Margins now apply to container wrapper
- **Call to Action:** Fixed horizontal margins on all devices, maintained centering

### Animations
- **Posts Grid:** Removed bouncing from FLIP transitions, eliminated page-switch flash
- **Tabs:** Fixed underline visibility and color display

### Typography
- **Accordion:** Fixed font family inheritance from WordPress theme
- Added `font-family: inherit` across all blocks

---

## Responsive Features

**Breakpoints:** Desktop (1024px+), Tablet (768-1024px), Mobile (<768px)

All container-enabled blocks now have device-specific max-width controls with smooth transitions.

---

## Documentation

- Updated README.md and readme.txt with all 16 blocks (alphabetically sorted)
- Added tags: accordion, tabs, posts, grid
- Updated screenshots and changelog

---

## Migration & Compatibility

**100% Backward Compatible** - All existing blocks work with no changes required.

**Defaults:**
- Container Mode: Full width
- Max-Width: Desktop 1200px, Tablet/Mobile 100%
- Tabs Active Tab: First tab (index 0)

**Action Required:** Run `npm run build` to compile changes.

---

## Summary

**Total Blocks:** 16  
**New Features:** 15+  
**Bug Fixes:** 10+  
**Files Modified:** 20+

Major focus on consistency, responsiveness, and polish across all blocks.

---

**Made with ❤️ by Adaire Digital**

