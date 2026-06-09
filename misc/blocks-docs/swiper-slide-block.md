# Swiper Slide Block Documentation

## Overview
The **Swiper Slide Block** is the child block used within a Swiper Carousel. Each slide controls its own background media, overlay, copy, and hover styling. Slides cannot exist outside a carousel, keeping the editor organized.

## Adding Slides
1. Select an existing Swiper Carousel block.
2. Click the “+” button inside the carousel to add a new Swiper Slide.
3. Use the media picker to select a background image (optional).
4. Provide headline and supporting text to overlay on the slide.

## Slide Settings
- **Image & Media** – Choose a media library image. The block stores `imageUrl`, `imageId`, and `alt` text.
- **Overlay Type**
  - `color` – Use a solid color with opacity (RGBA support).
  - `gradient` – Paste a CSS gradient string (e.g., `linear-gradient(...)`).
- **Overlay Color / Gradient** – Controls what sits between the background image and text.
- **Text Content** – `Header` and `Text` fields for on-slide copy.
- **Text Color** – Set the foreground color to contrast the overlay/background.
- **Background Size/Position/Repeat** – CSS controls for how the background image behaves.
- **Border Radius** – Base + hover radius controls for advanced animations.

## Tips
- Keep overlay opacity high enough for text readability.
- Use gradients for multi-color hero effects (e.g., brand-specific gradients).
- Duplicate a slide to maintain consistent typography across multiple slides.
- Combine hover border radius with global carousel radius for subtle transitions.

