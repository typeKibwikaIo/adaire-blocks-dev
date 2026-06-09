# Map Block Documentation

## Overview

In this article, we look at the Map Block, a multi-location Google Maps component with address listings, contact details, and synchronized navigation. The block supports multiple branch locations, an interactive list, fly-to animations, and responsive layouts. Use it to highlight offices, stores, or service areas with rich contact information.

## Adding the Map Block to your page

### Locate and add the Map Block

1. Type "/" and then type in "map"
2. Select the Map Block
3. The block appears with sample locations and an embedded Google Map iframe

## Location Settings

### Locations Repeater

**Location Entries** - Manage multiple location cards  
- Fields: Country label, address lines, phone, email, latitude, longitude, embed URL  
- Default data includes sample locations for Namibia, Switzerland, United Kingdom, and Ghana  
- Add new entries via the inspector; each entry generates a navigation tab/button

**Active Location** - Determines which location loads first  
- Attribute: `activeIndex` (0-based)  
- Default: 0 (first location)  
- Update when rearranging locations to set the default view

**Single Map Mode**  
- Toggle to display a single global map without navigation  
- Default: Off  
- Enable when you only need one location with contact details

### Contact Details

- Address lines support multi-line text for street, city, and country
- Phone and email fields render as clickable links (tel/mailto)
- Country label populates navigation buttons for multi-location layouts

## Styling Settings

### Navigation Appearance

**Nav Text Color** - Color for inactive location buttons  
- Default: #333333  
- Choose a neutral tone that contrasts with background

**Nav Active Background** - Background color of the active location button  
- Default: #d52d3a (brand red)  
- Ensures the current location stands out

**Nav Active Text Color** - Text color for the active button  
- Default: #ffffff  
- Provides high contrast against the active background

**Nav Font Weight** - Visual weight of navigation labels  
- Options: Standard CSS font-weight strings (400–700)  
- Default: 600 for semi-bold emphasis

### Fly Animation

**Fly Duration** - Duration (seconds) for map transitions between locations  
- Range: 0.2 to 3  
- Default: 0.9  
- Longer durations create a cinematic pan; shorter feels snappier

## Layout & Container Controls

### Container Width

**Container Mode** - Full width or constrained layout  
- Options: Full (default), Constrained  
- Constrained mode activates max-width controls

**Container Max Width** - Responsive width of the map container in constrained mode  
- Desktop Default: 1200px  
- Tablet & Mobile Default: 100%  
- Units supported: px, %, rem, vw

### Spacing

**Margins** - Outer spacing per device for top/right/bottom/left  
- Default: 0px across all devices  
- Add vertical spacing to separate from surrounding sections

**Padding** - Inner spacing around the entire block  
- Default: 0px  
- Increase when placing the block within cards or colored backgrounds

## Map Display

- Each location stores a `mapEmbedUrl` that loads a Google Maps iframe  
- Latitude/longitude data powers fly-to animations and map centering  
- The list of locations renders as tabs or buttons above/beside the map (depending on theme styles)
- Content area displays address lines, phone, and email alongside the map for quick reference

## Responsive Behavior

### Desktop (> 1024px)
- Layout typically displays navigation on the left/top with map on the right
- Full-width mode can stretch the map to the page edges
- Fly-to animations smoothly transition between distant locations

### Tablet (768px - 1024px)
- Navigation and map stack vertically for readability
- Map height adjusts to keep the location list visible without scrolling
- Touch interactions allow users to swipe or tap navigation buttons

### Mobile (< 768px)
- Locations stack in a vertical list above the map
- Consider reducing the number of default locations or enabling single map mode for simplicity
- Map iframe remains responsive, filling available width

## Technical Features

### CSS Custom Properties

- `--map-container-max-width-*` for responsive container widths
- Margin/padding variables applied per breakpoint
- Navigation colors exposed via CSS variables for theme overrides

### JavaScript Functionality

- Frontend script (`view.js`) wires up location navigation, fly-to animations, and iframe updates
- Generates unique `blockId` for targeting multiple Map Blocks on the same page
- Uses CSS transitions and Google Maps embed parameters for smooth experiences

## Usage Tips

1. **Verify Embed URLs** - Copy the “Embed a map” URL directly from Google Maps to ensure correct rendering.
2. **Optimize Order** - Place the most relevant locations first; set `activeIndex` accordingly.
3. **Add Descriptions** - Use address lines creatively (e.g., include opening hours).
4. **Use Single Mode for Simplicity** - Toggle single map mode when you only have one location to avoid redundant navigation.
5. **Combine With Contact Forms** - Pair the Map Block with a form or CTA button for easy inquiries.

## Best Practices

- **Keep Copy Short** - Limit address lines to essential info for quick scanning.
- **Maintain Brand Colors** - Customize navigation colors to match your primary palette.
- **Ensure Contrast** - Provide high contrast between nav backgrounds and text for readability.
- **Check Responsiveness** - Preview on mobile to confirm map height and navigation layout.
- **Respect Privacy** - Use publicly shareable map links and avoid exposing unwanted data.

## Accessibility

- **Descriptive Labels** - Navigation buttons use country names—make sure they are meaningful.
- **Keyboard Navigation** - Users can tab through navigation buttons and activate with Enter/Space.
- **Alt Content** - Provide textual directions or contact info nearby for users who cannot view maps.
- **Color Considerations** - Ensure active/inactive states rely on more than color (use underline or bold).

## Browser Compatibility

- **Modern Browsers** - Works in Chrome, Firefox, Safari, Edge.
- **Mobile Browsers** - Embeds responsive iframes that load on iOS Safari and Android Chrome.
- **Fallback** - If iframes are blocked, display fallback contact details and link to Google Maps directly.

## Screenshots

### Desktop View
- Tabbed navigation listing multiple countries
- Large responsive map with highlighted location pin
- Address and contact details displayed alongside the embed

### Tablet View
- Stacked layout with navigation above the map
- Touch-friendly buttons and legible typography
- Smooth fly animation when switching locations

### Mobile View
- Single-column layout with location list followed by the map
- Scrollable content with clear spacing
- Embedded map sized to fit mobile screens without overflow



