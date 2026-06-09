# Standard Breakpoints

This document defines the standard breakpoint values used across all blocks in the Adaire Blocks plugin. **All future blocks must use these exact breakpoint values** to ensure consistency.

## Breakpoint Definitions

### Phone (Mobile)
- **Max Width**: `600px`
- **SCSS Mixin**: `@mixin phone`
- **Usage**: `@include phone { ... }`
- **Media Query**: `@media (max-width: 600px)`

### Tablet
- **Min Width**: `601px`
- **Max Width**: `1024px`
- **SCSS Mixin**: `@mixin tablet`
- **Usage**: `@include tablet { ... }`
- **Media Query**: `@media (min-width: 601px) and (max-width: 1024px)`

### Small Laptop
- **Min Width**: `1025px`
- **Max Width**: `1300px`
- **SCSS Mixin**: `@mixin small-laptop`
- **Usage**: `@include small-laptop { ... }`
- **Media Query**: `@media (min-width: 1025px) and (max-width: 1300px)`

### Desktop
- **Min Width**: `1301px`
- **Max Width**: `1920px`
- **SCSS Mixin**: `@mixin desktop`
- **Usage**: `@include desktop { ... }`
- **Media Query**: `@media (min-width: 1301px) and (max-width: 1920px)`

### Big Desktop
- **Min Width**: `1921px` and above
- **SCSS Mixin**: `@mixin big-desktop`
- **Usage**: `@include big-desktop { ... }`
- **Media Query**: `@media (min-width: 1921px)`

## SCSS Mixin Template

When creating a new block, include these mixins at the top of your `style.scss` file:

```scss
// Breakpoint Mixins (standard breakpoints for all blocks)
@mixin phone {
    @media (max-width: 600px) {
        @content;
    }
}

@mixin tablet {
    @media (min-width: 601px) and (max-width: 1024px) {
        @content;
    }
}

@mixin small-laptop {
    @media (min-width: 1025px) and (max-width: 1300px) {
        @content;
    }
}

@mixin desktop {
    @media (min-width: 1301px) and (max-width: 1920px) {
        @content;
    }
}

@mixin big-desktop {
    @media (min-width: 1921px) {
        @content;
    }
}
```

## JavaScript Breakpoint Values

When using breakpoints in JavaScript (e.g., for Swiper.js, responsive settings), use these values:

```javascript
const BREAKPOINTS = {
    phone: 600,        // max-width
    tablet: 601,       // min-width
    tabletMax: 1024,   // max-width
    smallLaptop: 1025, // min-width
    smallLaptopMax: 1300, // max-width
    desktop: 1301,     // min-width
    desktopMax: 1920,  // max-width
    bigDesktop: 1921   // min-width
};
```

## Cards Per View Settings

For carousel/slider blocks that support "cards per view" settings, the standard breakpoint mapping is:

- **Mobile**: Phone breakpoint (≤ 600px)
- **Tablet**: Tablet breakpoint (601px - 1024px)
- **Small Laptop**: Small Laptop breakpoint (1025px - 1300px)
- **Desktop**: Desktop breakpoint (1301px - 1920px)
- **Big Desktop**: Big Desktop breakpoint (≥ 1921px)

## Examples

### Example 1: Responsive Padding
```scss
.my-block {
    padding: 20px; // Default (mobile-first)
    
    @include tablet {
        padding: 40px;
    }
    
    @include desktop {
        padding: 60px;
    }
}
```

### Example 2: Responsive Grid Columns
```scss
.my-grid {
    grid-template-columns: 1fr; // Mobile: 1 column
    
    @include tablet {
        grid-template-columns: repeat(2, 1fr); // Tablet: 2 columns
    }
    
    @include small-laptop {
        grid-template-columns: repeat(3, 1fr); // Small Laptop: 3 columns
    }
    
    @include desktop {
        grid-template-columns: repeat(4, 1fr); // Desktop: 4 columns
    }
}
```

### Example 3: Swiper.js Breakpoints
```javascript
const swiper = new Swiper('.swiper', {
    slidesPerView: 1, // Mobile (default)
    breakpoints: {
        601: {   // Tablet
            slidesPerView: 2,
        },
        1025: {  // Small Laptop
            slidesPerView: 3,
        },
        1301: {  // Desktop
            slidesPerView: 4,
        },
        1921: {  // Big Desktop
            slidesPerView: 5,
        },
    },
});
```

## Notes

- **Mobile-First Approach**: Always define base styles for mobile, then use `min-width` media queries for larger breakpoints.
- **Consistency**: These breakpoints are used across all InfoGrid blocks, Hero blocks, and other responsive blocks.
- **Future Blocks**: Any new block created must use these exact breakpoint values. Do not create custom breakpoints.

