# Device-Specific Controls Implementation Guide

## Overview
This guide describes the pattern for adding responsive device-specific controls (Desktop, Tablet, Mobile, Smartwatch) to GutenBlocks.

## Pattern Summary
Each block that needs responsive controls follows this 3-file structure:

### 1. `block.json` - Add Responsive Attributes
Define attributes for each device with `desktop`, `tablet`, `mobile`, and `smartwatch` keys:

```json
"containerMaxWidth": {
  "type": "object",
  "default": {
    "desktop": { "value": 1200, "unit": "px" },
    "tablet": { "value": 100, "unit": "%" },
    "mobile": { "value": 100, "unit": "%" },
    "smartwatch": { "value": 100, "unit": "%" }
  }
},
"marginTop": {
  "type": "object",
  "default": {
    "desktop": 0,
    "tablet": 0,
    "mobile": 0,
    "smartwatch": 0
  }
}
```

### 2. `edit.js` - Add Device Switcher UI
Include device state and UI buttons:

```jsx
import { useState } from "@wordpress/element";
import { desktop, tablet, mobile } from "@wordpress/icons";
import { Button, ButtonGroup } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const [deviceType, setDeviceType] = useState("desktop");
  const { containerMaxWidth } = attributes;

  return (
    <InspectorControls>
      <PanelBody title="Container">
        {/* Device Switcher */}
        <p style={{ fontWeight: 600, marginBottom: "8px" }}>Device</p>
        <ButtonGroup style={{ marginBottom: "12px", display: "flex" }}>
          <Button
            icon={desktop}
            isPrimary={deviceType === "desktop"}
            onClick={() => setDeviceType("desktop")}
            label="Desktop"
          />
          <Button
            icon={tablet}
            isPrimary={deviceType === "tablet"}
            onClick={() => setDeviceType("tablet")}
            label="Tablet"
          />
          <Button
            icon={mobile}
            isPrimary={deviceType === "mobile"}
            onClick={() => setDeviceType("mobile")}
            label="Mobile"
          />
          <Button
            isPrimary={deviceType === "smartwatch"}
            onClick={() => setDeviceType("smartwatch")}
            label="Watch"
          >
            ⌚
          </Button>
        </ButtonGroup>

        {/* Device-Specific Controls */}
        <div style={{ display: "flex", gap: "8px" }}>
          <TextControl
            type="number"
            value={
              containerMaxWidth?.[deviceType]?.value ??
              (deviceType === "desktop" ? 1200 : 100)
            }
            onChange={(v) =>
              setAttributes({
                containerMaxWidth: {
                  ...(containerMaxWidth || {}),
                  [deviceType]: {
                    ...(containerMaxWidth?.[deviceType] || {}),
                    value: Number(v),
                  },
                },
              })
            }
          />
          <ButtonGroup>
            {["px", "%", "rem", "vw"].map((u) => (
              <Button
                key={u}
                isPrimary={
                  (containerMaxWidth?.[deviceType]?.unit ??
                    (deviceType === "desktop" ? "px" : "%")) === u
                }
                onClick={() =>
                  setAttributes({
                    containerMaxWidth: {
                      ...(containerMaxWidth || {}),
                      [deviceType]: {
                        ...(containerMaxWidth?.[deviceType] || {}),
                        unit: u,
                      },
                    },
                  })
                }
              >
                {u}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </PanelBody>
    </InspectorControls>
  );
}
```

### 3. `save.js` - Output CSS Variables
Pass device-specific values as CSS custom properties:

```jsx
export default function save({ attributes }) {
  const { containerMaxWidth } = attributes;

  const blockProps = useBlockProps.save({
    style: {
      "--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${
        containerMaxWidth?.desktop?.unit ?? "px"
      }`,
      "--container-max-width-tablet": `${
        containerMaxWidth?.tablet?.value ?? 100
      }${containerMaxWidth?.tablet?.unit ?? "%"}`,
      "--container-max-width-mobile": `${
        containerMaxWidth?.mobile?.value ?? 100
      }${containerMaxWidth?.mobile?.unit ?? "%"}`,
      "--container-max-width-watch": `${
        containerMaxWidth?.smartwatch?.value ?? 100
      }${containerMaxWidth?.smartwatch?.unit ?? "%"}`,
    },
  });

  return <div {...blockProps}>...</div>;
}
```

### 4. `style.scss` - Add Media Queries
Apply CSS variables at each breakpoint:

```scss
.my-block {
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;

  @media (max-width: 1024px) {
    max-width: var(--container-max-width-tablet, 100%);
  }

  @media (max-width: 768px) {
    max-width: var(--container-max-width-mobile, 100%);
  }

  @media (max-width: 320px) {
    max-width: var(--container-max-width-watch, 100%);
  }
}
```

---

## Responsive Breakpoints
- **Desktop**: Default (no media query)
- **Tablet**: `@media (max-width: 1024px)`
- **Mobile**: `@media (max-width: 768px)`
- **Smartwatch**: `@media (max-width: 320px)`

---

## Implementation Checklist

For each block, ensure:
- [ ] `block.json`: All responsive attributes have `desktop`, `tablet`, `mobile`, `smartwatch` keys
- [ ] `edit.js`: Device switcher UI with 4 buttons (Desktop, Tablet, Mobile, Watch)
- [ ] `edit.js`: Device controls for critical dimensions (maxWidth, height, fontSize, etc.)
- [ ] `save.js`: Output CSS custom properties for each device
- [ ] `style.scss`: Media queries using CSS variables

---

## Blocks Completed ✅
- `video-player-block` - Full device controls + media upload
- `image-composition-block` - Device controls for container width

## Blocks Pending (Priority Order)
1. `video-hero-block` - Hero with video + device controls
2. `video-carousel-block` - Carousel with device-specific spacing
3. `hero-1-block` - Hero banner responsive sizing
4. `portfolio-block` - Portfolio grid responsive layout
5. `swiper-slide-block` - Carousel slides responsive dimensions
6. `case-studies-block` - Case study cards responsive
7. `services-block` - Services cards responsive
8. All other media-heavy blocks...

---

## Common Attributes to Make Responsive
- Container width: `containerMaxWidth`
- Spacing: `marginTop`, `marginRight`, `marginBottom`, `marginLeft`
- Padding: `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`
- Height: `containerHeight` (for video/image blocks)
- Font sizes: `fontSize`, `titleSize`, `descriptionSize`
- Gap/Spacing: `gap`, `cardGap`, `itemSpacing`
- Grid columns: `slidesPerView`, `columnsPerRow`

---

## Example: Adding to `video-hero-block`
See the pattern above and apply to existing video attributes. Focus on:
- `titleFontSize` (already has tablet/mobile variants - add smartwatch)
- `descriptionFontSize` (already has tablet/mobile variants - add smartwatch)
- Add device controls for responsive container height and overlay adjustments

---

## Helpful Utilities
### Get Device Value with Fallback
```jsx
const getDeviceValue = (attr, device, defaultValue) => {
  return attr?.[device] ?? defaultValue;
};
```

### Merge Device Attributes
```jsx
const updateDeviceAttribute = (currentAttr, device, newValue) => {
  return {
    ...(currentAttr || {}),
    [device]: newValue,
  };
};
```

---

## Notes
- Always include a smartwatch breakpoint (320px) for modern responsiveness
- Use CSS custom properties for efficient responsive styling
- Test on actual devices or use browser DevTools to simulate breakpoints
- Document device-specific behavior in README or comment headers
