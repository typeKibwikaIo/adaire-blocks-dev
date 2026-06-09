# Swiper Carousel Block Documentation

## Overview
The **Swiper Carousel Block** is a wrapper around [Swiper.js](https://swiperjs.com/) that lets you build draggable hero sliders without leaving Gutenberg. Each carousel hosts multiple **Swiper Slide** child blocks, and you can control autoplay, loop, speed, effects, overlay text, and border styling directly from the inspector.

## Block Structure
- **Swiper Carousel** – Parent block that defines global behavior (speed, autoplay, loop, cursor overlay, height, border radius, effect).
- **Swiper Slide** – Child block (documented separately) that handles per-slide imagery, overlay, and text content. Only available when the carousel block is selected.

## Key Settings
- **Speed** – Transition duration in milliseconds (default 600).
- **Loop** – Enable/disable infinite looping.
- **Autoplay** – Toggle autoplay and choose delay (ms).
- **Effect** – Choose from Swiper’s built-in effects like `slide`, `fade`, etc.
- **Carousel Height** – Set height in viewport units (% of viewport) to control hero size.
- **Border Radius** – Apply rounded corners globally.
- **Cursor Overlay** – Provide a drag cue by customizing overlay background color and overlay text (e.g., “drag”).

## Usage
1. Insert the “Swiper Carousel” block.
2. Use the blueprint UI to add “Swiper Slide” blocks inside the carousel.
3. Configure global behavior (autoplay, loop, etc.) from the parent block panel.
4. Adjust cursor overlay text if you want to change the drag hint.
5. Preview on desktop and mobile to ensure slides respect the chosen height and radius.

## Tips
- Use high-quality, similarly sized images to avoid jumpy transitions.
- When autoplay is enabled, keep the delay long enough (e.g., 3–5s) for users to read slide content.
- Pair the carousel with a solid or gradient overlay to improve text readability.
- Remember to duplicate slides to extend the story while reusing layout styles.

