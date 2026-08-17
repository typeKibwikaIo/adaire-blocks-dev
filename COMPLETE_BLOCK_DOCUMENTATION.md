# Adaire Blocks - Complete Block Documentation

This document provides comprehensive, detailed descriptions for all 72 blocks in the Adaire Blocks plugin. Each block includes its name, slug, technical stack, full functionality description, how users can interact with it, and component architecture.

---

## Table of Contents
- [Free Blocks](#free-blocks)
- [Plus Blocks](#plus-blocks)  
- [Premium Blocks](#premium-blocks)
- [Freemium Blocks](#freemium-blocks)
- [Additional Blocks](#additional-blocks)
- [Architecture Patterns](#architecture-patterns)

---

## Free Blocks

### 1. About Us Block
- **Slug:** `about-us-block`
- **Block Name:** About Us (Free)
- **Category:** adaire-business
- **Technical Stack:** React, WordPress Block Editor, CSS custom properties, Responsive design system

**Full Functionality Description:**
The About Us block creates a beautiful, editorial-style section that tells your company's story in a compelling visual format. It's designed to make your "About Us" page more engaging than plain text by combining storytelling with strategic imagery. The block features a hero section at the top with your main heading and tagline, followed by a powerful mission statement that captures your company's purpose. As visitors scroll down, they encounter an asymmetric image grid that displays two photos alongside descriptive text - perfect for showing your team, office, or products in action. The section concludes with a closing statement and call-to-action that encourages visitors to connect further.

**How Users Can Use It:**
When you add this block to your page, you'll see a complete template ready for customization. Start by editing the main heading to introduce your company name or a welcoming phrase. The tagline field is perfect for a brief, memorable description of what makes your business unique. In the mission section, write a compelling statement about your company's purpose and values - this is where you can connect emotionally with visitors.

The image grid is where the visual storytelling happens. Upload two high-quality images that represent your business - perhaps one showing your team in action and another displaying your products or services. Each image can have its own caption, allowing you to provide context or tell a mini-story. The body text section gives you space to elaborate on your company history, values, or what makes your approach special.

Throughout the block, you can customize colors to match your brand - choose colors for headings, regular text, and accent elements. The typography controls let you adjust font sizes, line heights, and letter spacing to ensure your content is readable and visually appealing. You can also control the spacing around the entire section to ensure it fits perfectly within your page layout.

The block includes an optional "Scroll" button that appears at the bottom of the hero section, encouraging visitors to continue reading. You can customize the button text or hide it entirely if you prefer a cleaner look.

**Component Structure:** 
- Hero zone (heading, tagline, mission, scroll button)
- Statement zone with impactful messaging
- Media grid (main image, caption, body text, secondary image)
- Closing statement zone with call-to-action
- Responsive design controls for mobile, tablet, and desktop

### 2. Accordion Block
- **Slug:** `accordion-block`
- **Block Name:** Accordion (Free)
- **Category:** adaire-content-expandable
- **Technical Stack:** React, GSAP animations, WordPress Block Editor, CSS transitions

**Full Functionality Description:**
The Accordion block is perfect for organizing large amounts of content in a space-efficient, user-friendly way. It's commonly used for FAQ (Frequently Asked Questions) sections, feature lists, or any content where you want to present information that visitors can explore on demand. Each accordion item consists of a clickable title bar that, when clicked, expands to reveal the content below. This keeps your page clean and scannable while still providing access to detailed information.

The block features smooth, professional animations when items open and close, creating a polished user experience. You can control whether multiple items can be open at once or if opening one item automatically closes others - this is useful for keeping the interface tidy. The first item can be set to open by default, so visitors immediately see some content.

**How Users Can Use It:**
When you add the Accordion block, you'll start with several sample items that demonstrate how it works. To add your own content, simply click on any title to edit it - you can make it a question if you're building an FAQ, or a category name if you're organizing features. The content area below each title is fully editable, so you can add as much text, images, or other content as needed.

Adding new accordion items is easy - just click the "+" button that appears at the bottom of the accordion in the editor. You can also duplicate existing items if you want to maintain consistent formatting, or delete items you don't need. Items can be reordered by dragging them into the desired sequence.

The styling options are extensive. You can choose colors for the titles, content text, background, and the chevron icon that indicates expandable items. The chevron icon rotates when items are opened, providing visual feedback. Font sizes can be adjusted independently for titles and content, and all settings are responsive - you can specify different sizes for mobile, tablet, and desktop to ensure readability across all devices.

The animation settings let you control how quickly items open and close, and you can choose from different easing functions to make the motion feel more natural. The spacing between items, border radius (rounded corners), and padding inside each item are all customizable, so you can achieve the exact look you want.

For user experience, you can decide whether visitors should be able to have multiple items open simultaneously, or if opening one item should close others. You can also choose which item (if any) should be open when the page first loads.

**Component Structure:** Container with InnerBlocks for accordion-item-block children
- Accordion wrapper with styling controls
- Individual accordion items with title bars and content panels
- Animated chevron icons
- Responsive sizing and spacing controls
- GSAP-powered smooth animations

### 3. Accordion Item Block
- **Slug:** `accordion-item-block`
- **Block Name:** Accordion Item
- **Category:** adaire-content-expandable
- **Parent:** create-block/accordion-block
- **Technical Stack:** React, WordPress Block Editor, CSS transitions

**Full Functionality Description:**
The Accordion Item block is an individual component that works within the parent Accordion block. Each item represents one expandable section with a clickable title and hidden content panel. When a visitor clicks on the title bar, the content panel smoothly expands to reveal its contents, and the chevron icon rotates to indicate the open state. This block cannot be used independently - it must be placed inside an Accordion block to function properly.

**How Users Can Use It:**
You don't typically add Accordion Item blocks directly - instead, you add them through the parent Accordion block's interface. Each item has a title field where you can enter a question, category name, or any short text that visitors will click to expand the content. Below the title is a content area where you can add detailed information, images, lists, or any other content you want to display when the item is expanded.

The item includes unique identifier attributes that help the system track which item is which, especially important for animations and state management. You can also control the typography of both the title and content to ensure they match your design preferences.

**Component Structure:** Title button + content panel
- Clickable title bar with hover effects
- Expandable content panel with smooth transitions
- Rotating chevron icon indicator
- Typography controls for title and content

### 4. Animation Scroll Block
- **Slug:** `animation-scroll-block`
- **Block Name:** Scroll Animation (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, GSAP ScrollTrigger, WordPress Block Editor, CSS animations

**Full Functionality Description:**
The Scroll Animation block is a powerful wrapper that brings your content to life as visitors scroll through your page. Instead of static content that just sits there, you can make elements fade in, slide into view, grow, shrink, bounce, flip, rotate, or blur in - all triggered automatically when the visitor scrolls to that section. This creates an engaging, dynamic experience that keeps visitors interested and guides their attention to important content.

The block works as a container - you place other blocks inside it, and then choose what animation effect should happen when someone scrolls to that container. You have precise control over when the animation triggers (how far the element needs to be into view), how long it takes, and whether it should happen every time they scroll past or just the first time.

**How Users Can Use It:**
To use scroll animations, first add the Scroll Animation block to your page where you want the animated content to appear. Then, add the content blocks you want to animate inside the Scroll Animation block - this could be text, images, buttons, or any other blocks. The Scroll Animation block acts as a wrapper that controls how the inner content appears.

In the block settings, you'll find a variety of animation types to choose from. "Fade in" makes content gradually appear from transparent to opaque, while "fade left" or "fade right" makes content slide in from the sides. "Fly up" and "fly down" create vertical movement effects. "Grow" makes content scale up from small to normal size, while "shrink" does the opposite. "Bounce" adds a playful bouncing effect, "flip" creates a 3D rotation, "rotate" spins the content, and "blur in" makes content go from blurry to clear.

You can control how long the animation takes (duration) and add a delay if you want the animation to wait a moment before starting. The easing function determines how the animation feels - options range from linear (constant speed) to various curves that make the motion start slow, end slow, or both.

The threshold setting controls when the animation triggers - a higher threshold means the visitor must scroll further down the page before the animation starts. You can also choose whether the animation should reverse when the visitor scrolls away (playing backward) or if it should only happen once.

**Component Structure:** Wrapper block with InnerBlocks support
- Animation wrapper with ScrollTrigger integration
- InnerBlocks container for nested content
- Configurable animation parameters
- Responsive threshold and timing controls

### 5. Button Block
- **Slug:** `button-block`
- **Block Name:** Button (Free)
- **Category:** adaire-start-actions
- **Technical Stack:** React, WordPress Block Editor, CSS transitions, SVG icons

**Full Functionality Description:**
The Button block is a versatile call-to-action component that helps guide visitors to take important actions on your website. Whether you need a simple "Learn More" link, a "Sign Up" button, or a "Download Now" call-to-action, this block provides the styling and functionality to make your buttons stand out. It supports multiple visual styles, hover animations, and can link to any page on your site or external websites.

The block offers five distinct button styles: underline (a text link with animated underline), fill (solid background color), border (outlined button with transparent background), gradient (modern gradient background), and glass (frosted glass effect). Each style can be customized with your brand colors, and you can set different colors for normal and hover states to create interactive feedback.

**How Users Can Use It:**
Add the Button block wherever you need a call-to-action - at the end of a section, in a hero banner, or within content where you want to guide visitors to take action. Start by entering the button text - this should be clear and action-oriented (like "Get Started," "Contact Us," or "View Pricing").

Set the destination link by entering a URL or selecting a page from your site. You can choose whether the link should open in the same tab or a new tab - opening in a new tab is often better for external links so visitors don't leave your site completely.

Choose a button style that fits your design - underline works well for subtle calls-to-action within text, while fill or gradient styles are more prominent for important buttons. The glass effect is perfect for modern, overlay-style designs.

Customize the colors to match your brand - you can set the text color and background color for the normal state, and different colors for when someone hovers over the button. This hover effect provides visual feedback that the button is interactive.

The block includes optional icons that can appear before, after, or inline with the button text. Choose from arrow icons, chevrons, plus signs, or external link indicators. Icons can make your buttons more visually interesting and help communicate the action (like an arrow for "next" or external link icon for external resources).

Hover animations add movement when someone interacts with the button - options include slide-underline (the underline grows from center), scale (button grows slightly), bounce (playful bouncing), glow (subtle glow effect), or shake (attention-grabbing shake). You can also choose no animation for a more traditional feel.

The padding and margin controls let you adjust the spacing around and inside the button, ensuring it fits perfectly within your layout. All spacing is responsive, so you can set different values for mobile, tablet, and desktop.

**Component Structure:** `<a>` or `<button>` element with icon support
- Configurable button with multiple style options
- Hover state animations and transitions
- Optional icon integration with positioning controls
- Responsive padding and margin controls
- Link management with new tab option

### 6. Card Scroll Block
- **Slug:** `card-scroll-block`
- **Block Name:** Card Slider (Free)
- **Category:** adaire-interactive
- **Technical Stack:** React, WordPress Block Editor, CSS scroll snapping, responsive design

**Full Functionality Description:**
The Card Scroll block creates an elegant horizontal scrolling container for displaying content cards. This is perfect for showcasing team members, product features, testimonials, portfolio items, or any content that works well in a card format. Instead of taking up lots of vertical space with a grid, the horizontal scroll keeps your layout compact while still allowing visitors to browse through multiple items.

The block uses smooth horizontal scrolling with optional snap-to-card behavior, making it easy for visitors to navigate through the cards. Each card can contain images, text, and even video content, giving you flexibility in how you present your information. The container is fully responsive - on desktop you might show more cards at once, while on mobile it naturally adapts to show fewer cards with touch-friendly scrolling.

**How Users Can Use It:**
Add the Card Scroll block to your page where you want to display horizontal content. You'll start with a container that can hold multiple card items. Add individual cards through the block's interface - each card can have its own title, description, and media (image or video).

For each card, you can upload an image or embed a video, then add a title and description text. This makes it perfect for team member profiles (photo + name + bio), product features (icon/image + title + description), or testimonials (avatar + name + quote).

The container settings let you control the overall dimensions and spacing. You can set how tall the cards should be, how much space between them, and the overall width of the container. The colors for titles, descriptions, and backgrounds can be customized for each card or set globally for consistency.

On the frontend, visitors can scroll through the cards using touch gestures on mobile or by clicking and dragging on desktop. The scrolling is smooth and natural, with optional snap behavior that aligns cards perfectly when scrolling stops.

**Component Structure:** Horizontal scroll container with card-scroll-item-block children
- Horizontal scroll container with CSS scroll snapping
- Responsive card sizing and spacing
- Individual card content management
- Touch-friendly scrolling interactions

### 7. Card Scroll Item Block
- **Slug:** `card-scroll-item-block`
- **Block Name:** Slider Card
- **Category:** adaire-interactive
- **Parent:** create-block/card-scroll-block
- **Technical Stack:** React, WordPress Block Editor, media handling

**Full Functionality Description:**
The Card Scroll Item block represents an individual card within the Card Scroll container. Each card can display media (image or video) along with accompanying text content, making it perfect for showcasing individual items within a collection. This block cannot be used independently - it must be placed inside a Card Scroll block to function properly.

**How Users Can Use It:**
You add Card Item blocks through the parent Card Scroll block's interface. For each card, you can upload an image or provide a video URL. The media appears at the top of the card, followed by a title and description text area. This structure works well for team member profiles, product features, testimonials, or any content that benefits from a consistent card format.

You can customize the colors for the title and description text within each card, and adjust typography settings to ensure readability. If using video content, you can control video playback settings like autoplay and muting.

**Component Structure:** Card with media section + text content section
- Media upload/embed functionality
- Title and description text fields
- Individual color and typography controls
- Video playback configuration options

### 8. Container Block
- **Slug:** `container-block`
- **Block Name:** Container
- **Category:** adaire-free
- **Technical Stack:** React, WordPress Block Editor, CSS flexbox, responsive design

**Full Functionality Description:**
The Container block is a fundamental layout component that provides structure and organization to your page content. Think of it as a wrapper that can hold other blocks and control how they're positioned and sized. This is essential for creating professional layouts with consistent spacing, alignment, and visual treatment across your entire site.

The container gives you precise control over the maximum width of your content - you can constrain it to a readable width (like 1200px) or let it span the full width of the screen. You can also control horizontal alignment (left, center, right) to position your content exactly where you want it. The padding controls let you add breathing room inside the container, while margin controls handle spacing outside the container.

Background options include solid colors, gradients, and images, giving you flexibility in creating visual sections. You can add borders with custom colors, widths, and border radius for rounded corners. Shadow effects add depth and make content stand out from the background. The minimum height setting ensures the container has a certain presence even with minimal content, and overflow controls handle content that might exceed the container dimensions.

**How Users Can Use It:**
Use the Container block whenever you need to group content together or apply consistent styling to a section. Common uses include creating full-width colored sections, centering content with a maximum width, adding background images to specific areas, or simply wrapping content to apply consistent padding and margins.

To use it, add the Container block and then place other blocks inside it - this could be text, images, buttons, or any other content. In the container settings, set the maximum width to control how wide the content area should be. For standard content sections, 1200px is a common choice that ensures readability on large screens.

Use the alignment controls to position the container within its parent - center alignment is common for main content areas. Add padding inside the container to create space between the content and the container edges. Use margins to control spacing between this container and other elements on the page.

Choose a background color or gradient to create visual sections - this is great for alternating between light and dark sections, or for creating branded areas. You can also upload a background image and control its positioning and sizing.

Add borders if you want to create a framed effect, and use border radius to soften the corners with rounded edges. Shadow effects can make your content pop - try subtle shadows for cards or stronger shadows for floating elements.

**Component Structure:** Simple wrapper div with styling
- Responsive width and alignment controls
- Padding and margin management
- Background (solid/gradient/image) options
- Border and shadow customization
- Minimum height and overflow controls

### 9. Content Toggle Block
- **Slug:** `content-toggle-block`
- **Block Name:** Content Switcher (Free)
- **Category:** adaire-content-tabs
- **Technical Stack:** React, WordPress Block Editor, GSAP animations, CSS transitions

**Full Functionality Description:**
The Content Toggle block allows visitors to switch between different content panels using pill-style toggle buttons. This is perfect for comparing different options, showing alternative information, or organizing content into categories without overwhelming visitors with too much information at once. Unlike traditional tabs that might feel heavy, the pill toggle design feels modern and lightweight.

When visitors click on a toggle button, the corresponding content panel appears with a smooth animation, while other panels are hidden. This keeps the interface clean and focused. You can have as many toggles as you need - from a simple two-way switch to multiple options. The block supports various pill styles (default, rounded, outlined, or filled) to match your design aesthetic.

**How Users Can Use It:**
Add the Content Toggle block where you want to show switchable content. Start by adding toggle labels - these are the buttons visitors will click to switch between content. For example, if you're comparing pricing plans, your toggles might be "Monthly" and "Yearly." If you're showing different product features, they might be "Basic," "Pro," and "Enterprise."

For each toggle, you'll add a corresponding content panel where you can place any content you want - text, images, videos, or even other blocks. This makes the Content Toggle incredibly flexible - you could show different pricing tables, feature comparisons, testimonials, or any content that benefits from being organized into switchable views.

Customize the pill buttons to match your design. Choose the style that fits best - default for a clean look, rounded for softer edges, outlined for a subtle appearance, or filled for prominent buttons. You can set colors for the buttons in both normal and active states, making it clear which option is currently selected.

The content panels can be styled independently - you can set background colors, padding, and other styling to make the content areas look polished and integrated with your overall design.

**Component Structure:** Pill/toggle buttons + content panels (InnerBlocks)
- Pill-style toggle buttons with multiple style options
- Smooth content panel transitions
- InnerBlocks for flexible content in each panel
- Active state management and visual feedback
- GSAP-powered animations for smooth switching

### 10. Content Toggle Panel Block
- **Slug:** `content-toggle-panel-block`
- **Block Name:** Content Panel
- **Category:** adaire-content-tabs
- **Parent:** create-block/content-toggle-block
- **Technical Stack:** React, WordPress Block Editor, CSS transitions

**Full Functionality Description:**
The Content Toggle Panel block is the content area that corresponds to each toggle button in the parent Content Toggle block. Each panel holds the content that visitors see when they click on its associated toggle. This block cannot be used independently - it must be placed inside a Content Toggle block.

**How Users Can Use It:**
You add Content Panel blocks through the parent Content Toggle block's interface. Each panel is linked to a specific toggle button, so when a visitor clicks that toggle, this panel's content is displayed. Inside each panel, you can add any content you want - text blocks, images, videos, buttons, or even other complex layouts. This makes each toggle panel a fully flexible content area.

You can customize the styling of each panel independently, setting background colors, padding, and other visual properties to ensure the content looks great when displayed.

**Component Structure:** Content container with InnerBlocks
- Linked to specific toggle button via panelId
- InnerBlocks for flexible content layout
- Independent styling controls
- Smooth show/hide transitions

### 11. Cookie Notice Block
- **Slug:** `cookie-notice-block`
- **Block Name:** Cookie Notice (Free)
- **Category:** adaire-free
- **Technical Stack:** React, WordPress Block Editor, localStorage, CSS positioning

**Full Functionality Description:**
The Cookie Notice block creates a simple, user-friendly cookie consent banner that helps you comply with privacy regulations while maintaining a good user experience. It appears as a floating banner on your site with a customizable message and two action buttons: "Accept All" and "Decline." Once a visitor makes a choice, the banner remembers their decision for a specified number of days, so they don't see the notice again on subsequent visits.

The banner can be positioned in different locations on the screen (bottom-left, bottom-right, bottom-center, or top positions) to suit your design preferences. You can customize all the text - the main message, the button labels, and links to your privacy policy and terms of service.

**How Users Can Use It:**
Add the Cookie Notice block to your site - it will typically be placed in a global location like a footer or template so it appears on all pages. Customize the message to explain why you're using cookies and what they're for - something like "We use cookies to improve your experience and analyze site traffic."

Set the button text to be clear and action-oriented - "Accept All" and "Decline" are standard, but you can customize these if needed. Add links to your privacy policy and terms of service pages so visitors can read more about your data practices.

Choose the position where the banner should appear - bottom positions are most common as they're less intrusive. Set the expiration days to determine how long to remember a visitor's choice before showing the notice again (30-365 days is typical).

Customize the colors to match your brand - you can set the background color, text color, and button colors to ensure the banner feels integrated with your site design.

**Component Structure:** Simple banner with buttons
- Floating banner with multiple position options
- Accept/Decline button functionality
- localStorage for remembering user preferences
- Links to privacy policy and terms
- Customizable styling and colors

### 12. Flip Card Block
- **Slug:** `flipcard-block`
- **Block Name:** Flip Card
- **Category:** adaire-interactive
- **Technical Stack:** React, WordPress Block Editor, CSS 3D transforms, GSAP animations

**Full Functionality Description:**
The Flip Card block creates an interactive card that smoothly flips when visitors hover over it, revealing additional content on the back. This is perfect for showing before/after comparisons, question/answer pairs, product details, team member information, or any content where you want to provide additional information without cluttering the initial view. The 3D flip animation is smooth and polished, adding an engaging interactive element to your page.

The card can flip horizontally (left to right) or vertically (top to bottom), giving you flexibility in how the animation feels. You control the dimensions of the card, and all sizing is responsive so it looks great on all devices. The animation speed and easing can be adjusted to create the perfect feel - from quick and snappy to slow and elegant.

**How Users Can Use It:**
Add the Flip Card block where you want interactive content. You'll need to add content to both the front and back of the card. On the front, place the content that visitors see initially - this could be an image, a name, a question, or any content that invites interaction. On the back, place the hidden content that's revealed on hover - this might be detailed information, an answer, additional images, or any supplementary content.

Set the card dimensions to fit your content and layout. The width and height are responsive, so you can specify different values for mobile, tablet, and desktop to ensure the card looks good at all screen sizes.

Choose the flip direction - horizontal flipping feels more traditional for cards, while vertical flipping can feel more unique. Adjust the animation duration to control how fast the card flips, and choose an easing function to determine the animation feel (linear, ease-in, ease-out, etc.).

Customize the colors for both the front and back of the card independently. You can add borders with custom colors and widths, use border radius to create rounded corners, add padding inside the card, and apply shadow effects to make the card feel elevated and dimensional.

**Component Structure:** Card container with flipcard-front-block and flipcard-back-block children
- 3D flip animation with CSS transforms
- Responsive width and height controls
- Horizontal or vertical flip direction
- Independent front/back styling
- Border, shadow, and spacing controls

### 13. Flip Card Front Block
- **Slug:** `flipcard-front-block`
- **Block Name:** Flip Card Front
- **Category:** adaire-interactive
- **Parent:** create-block/flipcard-block
- **Technical Stack:** React, WordPress Block Editor, media handling

**Full Functionality Description:**
The Flip Card Front block contains the content that visitors see on the initial side of the flip card. This is the inviting face that encourages visitors to interact with the card by hovering over it. This block cannot be used independently - it must be placed inside a Flip Card block.

**How Users Can Use It:**
Add the Flip Card Front block through the parent Flip Card block's interface. On the front, you can place any content that represents the initial view - this might be a person's photo for a team card, a product image, a question text, or any content that makes visitors want to see what's on the back.

You can add images, text, or other content to the front face. The styling is controlled by the parent Flip Card block, ensuring consistent dimensions and visual treatment across both sides of the card.

**Component Structure:** Front face content
- Media and text content support
- Linked to parent card styling
- Hover-triggered flip initiation

### 14. Flip Card Back Block
- **Slug:** `flipcard-back-block`
- **Block Name:** Flip Card Back
- **Category:** adaire-interactive
- **Parent:** create-block/flipcard-block
- **Technical Stack:** React, WordPress Block Editor, media handling

**Full Functionality Description:**
The Flip Card Back block contains the hidden content that's revealed when visitors hover over the card and it flips. This is where you place the supplementary information, answers, or additional content that you want to provide without cluttering the initial view. This block cannot be used independently - it must be placed inside a Flip Card block.

**How Users Can Use It:**
Add the Flip Card Back block through the parent Flip Card block's interface. On the back, you can place the content that's revealed on hover - this might be detailed biographical information for a team card, product specifications, answers to questions, or any content that complements what's on the front.

You can add images, text, or other content to the back face. The styling is controlled by the parent Flip Card block, ensuring both sides of the card have consistent dimensions and visual treatment.

**Component Structure:** Back face content
- Media and text content support
- Linked to parent card styling
- Revealed on hover flip animation

### 15. Gallery Block
- **Slug:** `gallery-block`
- **Block Name:** Gallery (Free)
- **Category:** adaire-media-images
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, lightbox functionality

**Full Functionality Description:**
The Gallery block creates beautiful image displays with flexible layout options. Whether you're showcasing a portfolio, displaying product photos, sharing event images, or creating an inspiration board, this block provides the tools to present your images professionally. You can choose between a traditional grid layout (perfect for uniform images) or a masonry layout (ideal for images of varying sizes and aspect ratios).

The gallery includes optional lightbox functionality - when enabled, clicking on an image opens it in a full-screen overlay where visitors can view it larger and navigate through all the gallery images. Hover effects add interactivity - images can zoom, fade, or lift when visitors hover over them, making the gallery feel engaging and polished.

**How Users Can Use It:**
Add the Gallery block where you want to display images. Upload multiple images at once or add them individually. The block automatically arranges them based on your chosen layout mode.

Choose between grid layout (images align in uniform rows and columns) or masonry layout (images fit together like a puzzle, accommodating different aspect ratios naturally). Grid works great for uniform product shots, while masonry is perfect for artistic portfolios or varied content.

Set the number of columns for your layout - you can specify different values for mobile, tablet, and desktop to ensure the gallery looks good at all screen sizes. More columns on desktop can create a dense, rich display, while fewer columns on mobile keeps images large and touch-friendly.

Adjust the gap between images to control spacing - tighter gaps create a more cohesive feel, while larger gaps give each image breathing room. Set the aspect ratio if you want all images to be uniform (great for grids), or leave it flexible for masonry layouts.

Add rounded corners to images with the border radius control for a softer, more modern look. Enable hover effects to add interactivity - zoom makes images grow slightly, fade adds a subtle overlay, and lift creates a 3D elevation effect.

Enable the lightbox to let visitors click images to view them larger in a full-screen overlay. In lightbox mode, visitors can navigate through all images using arrows or swipe gestures. You can also enable captions to show image titles or descriptions when viewing in the lightbox.

**Component Structure:** Image grid with lightbox support
- Grid and masonry layout modes
- Responsive column controls
- Hover effects (zoom, fade, lift)
- Lightbox with full-screen image viewing
- Optional image captions
- Gap and spacing controls

### 16. Hero-1 Block
- **Slug:** `hero-1-block`
- **Block Name:** Hero Banner
- **Category:** adaire-layout-hero
- **Technical Stack:** React, WordPress Block Editor, CSS gradients, responsive design

**Full Functionality Description:**
The Hero Banner block creates powerful introductory sections that capture visitors' attention immediately upon landing on your page. Hero sections are critical for making a strong first impression and communicating your key message or value proposition. This block provides a large, prominent area for your main heading, supporting text, and optional icon or decorative elements.

The block includes optional breadcrumb navigation to help visitors understand where they are in your site structure. The heading area is designed to be large and impactful, perfect for your main message or headline. The text content area provides space for supporting copy that elaborates on your headline. You can add an optional icon that can be positioned in various locations to add visual interest or reinforce your brand.

Background gradient options let you create visually stunning backdrops without needing external images. All typography and spacing is fully responsive, so your hero looks perfect on mobile, tablet, and desktop screens.

**How Users Can Use It:**
Add the Hero Banner block at the top of your page where you want to make a strong first impression. Start with the main heading - this should be your most important message, like a value proposition, headline, or welcome message. Keep it concise and impactful.

Add supporting text that elaborates on your heading - this could be a subtitle, brief description, or tagline that provides context and encourages visitors to continue reading.

Optionally enable breadcrumbs if you want to show navigation path (like Home > Services > Web Design). This helps with user orientation and SEO.

Add an icon if you want to enhance the visual appeal - you can choose the icon type and position it to complement your content. Icons work great for highlighting specific themes or adding brand elements.

Choose a background gradient to create visual impact - gradients can add depth and modern appeal without the overhead of background images. You can customize the gradient colors to match your brand.

Use the responsive settings to control how the hero content is aligned and positioned on different screen sizes. You might center content on desktop but left-align it on mobile for better readability.

Customize typography settings to ensure your heading and text are perfectly sized and spaced. Font sizes, line heights, and letter spacing can all be adjusted independently for different breakpoints.

**Component Structure:** Hero with breadcrumbs, heading, text, and optional icon
- Large, impactful heading area
- Supporting text content
- Optional breadcrumb navigation
- Decorative icon with positioning controls
- Background gradient options
- Responsive typography and spacing

### 17. Icon Box Block
- **Slug:** `icon-box-block`
- **Block Name:** Icon Box (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress Block Editor, SVG icons, CSS styling

**Full Functionality Description:**
The Icon Box block creates visually appealing content containers that combine an icon with text content. These are perfect for displaying features, benefits, services, or any content that benefits from visual reinforcement. The icon draws attention and provides visual context, while the text delivers the detailed message. Icon boxes are commonly used in feature sections, service lists, benefit highlights, or as part of larger layouts.

Each icon box can have its own icon, title, and description. The styling is highly customizable - you can choose colors for the icon, title, and text independently. The box itself can have a background color, border, shadow, and rounded corners to match your design aesthetic. All spacing is responsive, ensuring the boxes look great on all screen sizes.

**How Users Can Use It:**
Add the Icon Box block where you want to display feature or benefit content. Select an icon from the available options - choose something that represents the content visually (like a gear for settings, a shield for security, a chart for analytics, etc.).

Add a title that clearly identifies the feature or benefit - keep it concise and descriptive. The description field allows you to provide more detail about what the icon represents or what benefit it offers.

Customize the colors to match your brand. You can set the icon color to make it stand out, choose a title color for hierarchy, and set the text color for readability. If you want the box to have a background, you can set a background color that complements your overall design.

Add borders if you want to create a defined box - you can control the border color, width, and style. Use border radius to soften the corners with rounded edges for a more modern, friendly feel. Shadow effects can make the boxes pop and feel elevated.

Adjust the spacing to ensure the content inside the box has breathing room and the boxes themselves have proper spacing when arranged in groups.

**Component Structure:** Icon + text content container
- Icon selection with color customization
- Title and description text fields
- Background, border, and shadow options
- Responsive spacing and sizing
- Border radius for rounded corners

### 18. Image Composition Block
- **Slug:** `image-composition-block`
- **Block Name:** Image Composition (Free)
- **Category:** adaire-media-images
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, responsive design

**Full Functionality Description:**
The Image Composition block creates artistic, collage-style image layouts that go beyond simple grids. It uses asymmetric layouts where images can be different sizes and positioned in interesting ways, creating visual interest and breaking away from predictable patterns. This is perfect for portfolio showcases, about pages, product presentations, or any content where you want images to feel dynamic and thoughtfully arranged rather than mechanically aligned.

The block provides layout presets that have been professionally designed to create balanced, visually appealing compositions. You can upload multiple images and the block will arrange them according to the chosen preset. The spacing between images, borders, and overall container settings are all customizable, giving you control over the final look while relying on expert-designed layouts for the composition itself.

**How Users Can Use It:**
Add the Image Composition block where you want to create an artistic image display. Upload the images you want to include - these could be product photos, team pictures, portfolio pieces, or any images that work well together in a collage.

Choose a layout preset from the available options - each preset creates a different visual arrangement with images of varying sizes and positions. Some presets might create a mosaic effect, others might emphasize one main image with supporting images, and others might create balanced asymmetrical layouts.

Adjust the spacing between images to control how tight or loose the composition feels. Tighter spacing creates a more unified, cohesive look, while larger spacing gives each image more individual presence.

Add borders if you want to define the images more clearly - you can control border color, width, and style. Rounded corners can soften the composition for a more modern, friendly feel.

The composition is fully responsive, so the layout adapts gracefully to different screen sizes while maintaining the artistic intent of the chosen preset.

**Component Structure:** Asymmetric image grid
- Multiple layout presets for artistic compositions
- Asymmetric image sizing and positioning
- Responsive layout adaptation
- Border and spacing controls
- Professional-designed visual arrangements

### 19. Info Grid Block
- **Slug:** `infogrid-block`
- **Block Name:** Info Grid (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, hover animations

**Full Functionality Description:**
The Info Grid block creates an engaging grid of information items that expand on hover, revealing additional content. This is perfect for displaying features, services, benefits, or any content where you want to present a concise overview initially and provide more detail on interaction. Each grid item has a title, optional tagline, and description - the title and tagline are always visible, while the description expands smoothly when visitors hover over the item.

The hover expansion creates an interactive experience that encourages exploration while keeping the initial view clean and scannable. The grid is fully responsive, automatically adjusting the number of columns based on screen size to ensure optimal readability and touch targets on mobile devices.

**How Users Can Use It:**
Add the Info Grid block where you want to display expandable content items. Add individual items to the grid, each with a title, optional tagline, and description. The title should be the main identifier for each item (like "Fast Performance" or "24/7 Support"). The tagline can provide additional context or emphasis (like "Lightning fast" or "Always available"). The description contains the detailed information that's revealed on hover.

Customize the colors for titles, taglines, and descriptions independently to create visual hierarchy and match your brand. The spacing between items can be adjusted to control how tight or loose the grid feels.

Choose the number of columns for your layout - you can specify different values for mobile, tablet, and desktop. Fewer columns on mobile ensures items are large enough to interact with easily, while more columns on desktop can create a rich, information-dense display.

The hover effect timing and feel can be customized to create the perfect user experience - from quick and snappy to slow and elegant.

**Component Structure:** Grid with expandable items
- Expandable items with hover animations
- Title, tagline, and description fields
- Responsive column controls
- Independent color styling
- Hover effect customization

### 20. Info Grid 2 Block
- **Slug:** `feature-grid-free`
- **Block Name:** Info Grid 2 (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, background effects

**Full Functionality Description:**
The Info Grid 2 block creates an advanced information grid with sophisticated background and overlay options. Unlike the basic Info Grid, this version allows each item to have its own background color or image, with optional overlay effects that ensure text remains readable. This is perfect for creating visually rich content displays where each item has its own visual identity while maintaining overall grid cohesion.

Each grid item can have a solid background color, gradient, or background image. Overlay options allow you to add semi-transparent layers that improve text readability over images or create subtle color effects. The grid is fully responsive and supports multiple column layouts for different screen sizes.

**How Users Can Use It:**
Add the Info Grid 2 block where you want to create a visually rich information display. Add individual items to the grid, each with title, tagline, and description content. For each item, you can choose a background color that helps categorize or emphasize the content, or upload a background image for a more visual approach.

If using background images, enable overlay options to ensure your text remains readable. Overlays add a semi-transparent layer between the background and content, improving contrast and legibility. You can customize the overlay color and opacity to achieve the perfect balance between visual impact and readability.

Adjust the spacing between items to control the grid's feel - tighter spacing creates a more unified composition, while larger spacing gives each item more individual presence. Set the number of columns for different screen sizes to ensure optimal layout across devices.

**Component Structure:** Advanced grid with backgrounds
- Individual item background support (color/gradient/image)
- Overlay effects for text readability
- Responsive column controls
- Spacing and gap customization
- Advanced visual styling options

### 21. Our Process Block
- **Slug:** `our-process-block`
- **Block Name:** Our Process (Free)
- **Category:** adaire-business
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, icon integration

**Full Functionality Description:**
The Our Process block is designed to showcase your workflow, methodology, or the steps visitors will experience when working with you. This is perfect for service businesses, agencies, consultants, or any business where explaining your process builds trust and sets expectations. Each step in the process can have its own icon, title, description, and optional link.

The block displays steps in a responsive grid layout that adapts to different screen sizes. On desktop, you might show multiple steps side by side, while on mobile they stack vertically for better readability. Each step is clickable, making the process feel interactive and engaging. Icons provide visual reinforcement and help visitors quickly understand each step's purpose.

**How Users Can Use It:**
Add the Our Process block where you want to explain your workflow. Add individual steps to represent each phase of your process - for a web design agency, this might be "Discovery," "Design," "Development," and "Launch." For a consultant, it might be "Initial Consultation," "Analysis," "Strategy," and "Implementation."

For each step, choose an icon that represents the phase visually - this helps with quick recognition and adds visual interest. Add a clear, concise title for each step. The description field allows you to provide more detail about what happens during that phase.

Optionally add links to each step if you want visitors to be able to click through to more detailed information about that phase of your process.

Customize the colors to match your brand - you can set colors for icons, titles, and descriptions independently. Adjust the spacing between steps to control the overall feel of the process display.

Set the number of columns for different screen sizes to ensure the process is easy to follow on all devices.

**Component Structure:** Process steps grid
- Multi-step process display
- Icon support for each step
- Clickable steps with optional links
- Responsive column layout
- Color and spacing customization

### 22. Posts Grid Block
- **Slug:** `posts-grid-block`
- **Block Name:** Posts Grid (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress REST API, CSS Grid, FLIP animations

**Full Functionality Description:**
The Posts Grid block dynamically displays your WordPress blog posts in a beautiful grid layout. Instead of manually creating cards for each post, this block automatically pulls your latest posts and displays them in a consistent, professional format. This is perfect for blog indexes, news sections, article showcases, or any area where you want to display your content dynamically.

The block includes powerful filtering options that let visitors filter posts by category, making it easy to find content relevant to their interests. FLIP animations (First, Last, Invert, Play) create smooth, polished transitions when filtering, making the interaction feel premium and engaging. Pagination controls allow visitors to navigate through large numbers of posts without overwhelming the page.

**How Users Can Use It:**
Add the Posts Grid block where you want to display your WordPress posts. Configure the post query to determine which posts appear - you can filter by category, limit the number of posts, control the order (newest first, oldest first, etc.), and exclude specific categories if needed.

Set the grid layout by choosing the number of columns - you can specify different values for mobile, tablet, and desktop to ensure the grid looks great at all screen sizes. Adjust the gap between posts to control spacing.

Customize the card styling to match your design - you can control the appearance of post titles, excerpts, featured images, and metadata like dates and authors. Each post card can include the featured image, title, excerpt, read more link, and post meta information.

Enable filtering if you want visitors to be able to filter posts by category - this adds category filter buttons that visitors can click to show only posts in specific categories. Configure pagination to show a set number of posts per page with navigation controls.

**Component Structure:** Post grid with filtering
- Dynamic WordPress post loading
- Category filtering with FLIP animations
- Responsive grid layout
- Customizable post card styling
- Pagination controls

### 23. Posts Carousel Block
- **Slug:** `posts-carousel-block`
- **Block Name:** Posts Carousel (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress REST API, carousel functionality, CSS animations

**Full Functionality Description:**
The Posts Carousel block displays your WordPress blog posts in a horizontal carousel format. Unlike the grid layout which shows many posts at once, the carousel shows a few posts at a time with navigation controls to browse through more. This is perfect for featured content sections, article highlights, or when you want to showcase posts in a more compact, interactive format.

The carousel automatically loads your WordPress posts based on your query settings and displays them in professional card format. Visitors can navigate through posts using arrow buttons, dots, or swipe gestures on touch devices. Autoplay functionality can optionally advance the carousel automatically, creating a dynamic, ever-changing display of your content.

**How Users Can Use It:**
Add the Posts Carousel block where you want to showcase your posts in a carousel format. Configure the post query to determine which posts appear - filter by category, limit the number of posts, control the order, and exclude specific categories as needed.

Set carousel options like how many posts to show at once, autoplay speed, and navigation style. You can choose between arrow navigation, dot indicators, or both. Enable autoplay if you want the carousel to advance automatically - perfect for featured content areas.

Customize the post card styling to match your design - control the appearance of featured images, titles, excerpts, and metadata. Each card can include the post's featured image, title, excerpt, read more link, and post information like date and author.

The carousel is fully responsive - on desktop you might show 3-4 posts at once, while on mobile it shows 1-2 posts for optimal readability and touch interaction.

**Component Structure:** Post carousel
- Dynamic WordPress post loading
- Horizontal carousel navigation
- Autoplay functionality
- Responsive post display
- Customizable card styling

### 24. Progress Block
- **Slug:** `progress-block`
- **Block Name:** Progress Bar (Free)
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress Block Editor, CSS animations, scroll tracking

**Full Functionality Description:**
The Progress block creates visual progress indicators that show visitors how far they've scrolled through content or how much of a process is complete. It supports two main styles: a horizontal bar that grows as visitors scroll, or a circular ring that fills progressively. The indicator can be fixed to the screen (always visible) or positioned statically within the content.

This is perfect for long-form content like articles, guides, or case studies where it helps visitors understand their reading progress. It's also useful for multi-step processes, showing completion status, or any scenario where visual feedback about progress improves the user experience.

**How Users Can Use It:**
Add the Progress block where you want to show progress indication. Choose between bar style (horizontal line that fills from left to right) or ring style (circular indicator that fills clockwise). Bar style works well at the top or bottom of the screen, while ring style is great for floating indicators.

Set the position to "fixed" if you want the indicator to stay visible as visitors scroll - this is common for reading progress bars at the top of the screen. Choose "static" if you want the indicator to be part of the content flow and scroll with the page.

Customize the colors to match your brand - you can set the background color (empty state) and the progress color (filled state). Adjust the thickness to control how prominent the indicator appears.

The animation can be customized to feel smooth and natural - you can control the transition speed and easing for a polished feel.

**Component Structure:** Progress indicator
- Bar and ring display modes
- Fixed and static positioning
- Scroll-based progress tracking
- Customizable colors and thickness
- Smooth animation controls

### 25. Row Block
- **Slug:** `row-block`
- **Block Name:** Row (Free)
- **Category:** adaire-layout-sections
- **Technical Stack:** React, WordPress Block Editor, CSS Flexbox, responsive design

**Full Functionality Description:**
The Row block is a fundamental layout component that creates horizontal containers for multi-column layouts. It's the foundation for creating complex page structures by allowing you to place content side-by-side instead of stacked vertically. The Row block works in conjunction with Column blocks - you create a Row, then add Column blocks inside it, and each Column can contain your actual content.

This block is essential for creating professional layouts like service sections, feature grids, testimonials, pricing tables, or any content that benefits from side-by-side arrangement. The Row handles the overall horizontal alignment, spacing between columns, and background treatment, while individual Columns control their own width and internal content.

**How Users Can Use It:**
Add the Row block where you want to create a multi-column layout. Inside the Row, add Column blocks for each vertical section you want. For example, a three-column feature section would have one Row block containing three Column blocks.

For each Column, set the width percentage - common layouts include equal-width columns (33.33% each for three columns) or varied widths (25% + 75% for sidebar + main content). The Row's gap control determines spacing between columns.

Set horizontal alignment to control how columns are positioned within the row (left, center, right, or spaced between). Vertical alignment controls how columns align when they have different heights.

The Row can have its own background color or image, which applies to the entire horizontal section. This is great for creating alternating background colors across different sections of your page.

**Component Structure:** Row container with column-block children
- Horizontal layout container
- Column width management
- Gap and spacing controls
- Horizontal and vertical alignment
- Background styling options

### 26. Column Block
- **Slug:** `column-block`
- **Block Name:** Column
- **Category:** adaire-layout-sections
- **Parent:** adaire/row-block
- **Technical Stack:** React, WordPress Block Editor, CSS Flexbox

**Full Functionality Description:**
The Column block is used within a Row block to create vertical sections within a horizontal layout. Each Column represents one vertical slice of the overall row and can contain any content blocks you want. Columns are the building blocks that make multi-column layouts possible - you might have a Row with three Columns to create a three-column feature section, or a Row with two Columns for a split-screen layout.

Each Column can have its own width percentage, determining how much horizontal space it occupies within the Row. Columns can also have their own horizontal and vertical alignment, borders, and internal padding. This block cannot be used independently - it must be placed inside a Row block to function properly.

**How Users Can Use It:**
Add Column blocks inside a Row block. Set the width percentage for each column based on your layout needs - for equal-width columns, divide 100 by the number of columns (33.33% for three columns, 25% for four columns). For varied layouts, use different percentages (like 30% + 70% for sidebar + main content).

Inside each Column, add the content blocks you want - text, images, buttons, or any other content. The Column will constrain this content to its assigned width.

Set horizontal alignment to control how content is positioned within the column (left, center, right). Vertical alignment determines how the column aligns with other columns when they have different heights.

Add borders if you want to create visual separation between columns - you can control border color, width, style, and border radius for rounded corners.

**Component Structure:** Simple column container with border support
- Width percentage control
- Horizontal and vertical alignment
- Border styling options
- Content container with InnerBlocks

### 27. Social Banner Block
- **Slug:** `social-banner-block`
- **Block Name:** Social Banner (Free)
- **Category:** adaire-marketing-conversion
- **Technical Stack:** React, WordPress Block Editor, CSS positioning, SVG icons

**Full Functionality Description:**
The Social Banner block creates a vertical, sticky banner that displays social media icons on the side of the screen. This keeps your social media presence consistently visible as visitors scroll through your content, making it easy for them to connect with you on various platforms. The banner stays fixed to the left or right side of the screen, always accessible regardless of scroll position.

You can add icons for any social media platforms you're active on - Facebook, Twitter, Instagram, LinkedIn, YouTube, and more. Each icon links directly to your profile on that platform. The banner can be positioned on either the left or right side of the screen, and you can customize the colors to match your brand.

**How Users Can Use It:**
Add the Social Banner block to display your social media links. Add individual social links by selecting the platform and entering your profile URL. Choose from popular social networks or add custom links.

Choose whether the banner should appear on the left or right side of the screen - consider your overall layout and which side feels less intrusive. Right-side placement is common as it doesn't interfere with standard left-aligned content.

Customize the icon colors to match your brand - you can set colors for normal and hover states to provide visual feedback when visitors interact with the icons. Adjust the spacing between icons and the overall size of the banner to ensure it looks proportional and doesn't overwhelm your content.

The banner is sticky, meaning it stays visible as visitors scroll, but you can adjust its vertical positioning if needed.

**Component Structure:** Vertical social icon banner
- Fixed positioning on screen sides
- Multiple social platform icons
- Hover effects and transitions
- Customizable colors and spacing
- Left/right position options

### 28. Social Share Block
- **Slug:** `social-share-block`
- **Block Name:** Social Share (Free)
- **Category:** adaire-start-actions
- **Technical Stack:** React, WordPress Block Editor, social sharing APIs, CSS styling

**Full Functionality Description:**
The Social Share block adds social sharing buttons to your content, making it easy for visitors to share your pages, articles, or products on their social networks. Unlike the Social Banner which links to your profiles, this block enables visitors to share your content with their followers. This is essential for increasing content reach, driving traffic, and leveraging social proof.

The block supports multiple social platforms including Facebook, Twitter, LinkedIn, Pinterest, and more. When visitors click a share button, it opens the platform's sharing interface pre-filled with your content. You can choose from different button styles - from simple icons to labeled buttons - and customize the appearance to match your design.

**How Users Can Use It:**
Add the Social Share block where you want sharing functionality - this is commonly at the end of blog posts, on product pages, or near content you want to encourage sharing. Select which social platforms to include based on where your audience is most active.

Choose a button style that fits your design - icon-only buttons are subtle and compact, while labeled buttons are more prominent and clear. Consider your layout and how much emphasis you want to give the sharing options.

Customize the colors to match your brand - you can set colors for the buttons in both normal and hover states. Tooltip options can show platform names on hover, which is helpful for icon-only buttons.

Choose the positioning and layout - buttons can be displayed horizontally in a row or vertically in a column. Adjust spacing between buttons to control the overall feel.

**Component Structure:** Social share buttons
- Multiple social platform integration
- One-click sharing functionality
- Button style options (icon/labeled)
- Tooltip interface
- Customizable colors and layout

### 29. Swiper Carousel Block
- **Slug:** `swiper-carousel-block`
- **Block Name:** Swiper Carousel (Free)
- **Category:** adaire-interactive
- **Technical Stack:** React, Swiper.js library, WordPress Block Editor, touch gestures

**Full Functionality Description:**
The Swiper Carousel block creates professional, touch-friendly carousels using the popular Swiper.js library. This is perfect for image galleries, testimonials, featured content, product showcases, or any content that benefits from a slide-based presentation. The carousel supports touch gestures on mobile devices, mouse drag on desktop, and provides smooth, hardware-accelerated animations.

The carousel includes advanced features like autoplay (automatically advancing slides), loop (infinite scrolling from last to first), navigation arrows, pagination dots, and configurable transition speeds. Each slide can contain any content you want - images, text, videos, or complex layouts. The carousel is fully responsive, automatically adjusting the number of visible slides based on screen size.

**How Users Can Use It:**
Add the Swiper Carousel block where you want a slide-based content display. Add individual Swiper Slide blocks inside the carousel - each slide represents one piece of content in the carousel.

Configure carousel settings to control the behavior. Enable autoplay if you want slides to advance automatically - set the delay time between slides. Enable loop to create infinite scrolling where the carousel seamlessly transitions from the last slide back to the first.

Choose navigation options - you can add arrow buttons for manual navigation, pagination dots for slide indicators, or both. The spacing control determines how much space appears between slides.

Set the number of slides to show at once for different screen sizes - on desktop you might show 3 slides, while on mobile it shows 1 slide for optimal touch interaction.

Each slide can contain any content blocks, giving you complete flexibility in what you display in the carousel.

**Component Structure:** Swiper.js carousel container
- Touch-friendly swipe navigation
- Autoplay and loop functionality
- Navigation arrows and pagination
- Responsive slide display
- Customizable transitions and spacing

### 30. Swiper Slide Block
- **Slug:** `swiper-slide-block`
- **Block Name:** Swiper Slide
- **Category:** adaire-interactive
- **Parent:** create-block/swiper-carousel-block
- **Technical Stack:** React, WordPress Block Editor, Swiper.js integration

**Full Functionality Description:**
The Swiper Slide block represents an individual slide within the parent Swiper Carousel block. Each slide can contain any content you want to display in the carousel - images, text, videos, or complex layouts. This block cannot be used independently - it must be placed inside a Swiper Carousel block.

**How Users Can Use It:**
Add Swiper Slide blocks through the parent Swiper Carousel block's interface. Inside each slide, add any content blocks you want to display - this could be an image, a testimonial, a product showcase, or any other content. Each slide acts as a canvas that can contain any combination of blocks.

You can also add overlay content that appears on top of the main slide content, perfect for text overlays on image slides or additional interactive elements.

**Component Structure:** Slide content with InnerBlocks
- Flexible content container
- Overlay support
- Linked to parent carousel behavior

### 31. Tabs Block
- **Slug:** `tabs-block`
- **Block Name:** Tabs (Free)
- **Category:** adaire-content-tabs
- **Technical Stack:** React, WordPress Block Editor, GSAP animations, CSS transitions

**Full Functionality Description:**
The Tabs block creates tabbed content sections that allow visitors to switch between different content panels without leaving the current view. This is perfect for organizing related content, presenting different aspects of a topic, or providing alternative views of information. Tabs keep your interface clean by showing only one content panel at a time while making other content easily accessible through clickable tab buttons.

The block supports different tab styles - default tabs for a traditional look, pill-style tabs for a modern appearance, or underline tabs for a subtle approach. Animations powered by GSAP make the transitions between tabs smooth and polished. You can arrange tabs horizontally or vertically, depending on your layout needs.

**How Users Can Use It:**
Add the Tabs block where you want to organize content into switchable panels. Add individual tabs by specifying the label text - this appears on the tab button and should clearly identify the content (like "Features," "Pricing," "FAQ").

For each tab, add corresponding content in the tab panel - this can be any content blocks including text, images, videos, or complex layouts. Each tab panel is independent, so you can have completely different content in each.

Choose a tab style that fits your design - default tabs have a traditional appearance, pill tabs are rounded and modern, and underline tabs are subtle with just a line indicator. Select horizontal or vertical layout based on your space and design preferences.

Customize the colors for tabs in both normal and active states, making it clear which tab is currently selected. Adjust the animation settings to control how quickly and smoothly tabs transition.

**Component Structure:** Tab navigation + tab panels
- Tab button navigation
- Content panels with InnerBlocks
- Multiple tab style options
- GSAP-powered smooth animations
- Horizontal and vertical layout options

### 32. Tab Panel Block
- **Slug:** `tab-panel-block`
- **Block Name:** Tab Panel
- **Category:** adaire-content-tabs
- **Parent:** create-block/tabs-block
- **Technical Stack:** React, WordPress Block Editor, CSS transitions

**Full Functionality Description:**
The Tab Panel block contains the content that appears when its corresponding tab button is clicked. Each panel is linked to a specific tab and remains hidden until that tab is activated. This block cannot be used independently - it must be placed inside a Tabs block.

**How Users Can Use It:**
Add Tab Panel blocks through the parent Tabs block's interface. Each panel is linked to a specific tab button, so when a visitor clicks that tab, this panel's content is displayed. Inside each panel, add any content you want - text, images, videos, or complex layouts. Each panel acts as a fully flexible content area.

You can customize the styling of each panel independently, setting background colors, padding, and other visual properties to ensure the content looks great when displayed.

**Component Structure:** Panel content with InnerBlocks
- Linked to specific tab button via panelId
- InnerBlocks for flexible content layout
- Independent styling controls
- Smooth show/hide transitions

### 33. Testimonial Block
- **Slug:** `testimonial-block`
- **Block Name:** Testimonial (Free)
- **Category:** adaire-business
- **Technical Stack:** React, WordPress Block Editor, carousel functionality, CSS styling

**Full Functionality Description:**
The Testimonial block is designed to showcase customer reviews, client feedback, or user testimonials in a professional and trustworthy format. Social proof is essential for building credibility, and this block makes it easy to display positive feedback from your customers or clients. Testimonials can be displayed in a grid layout or as an interactive carousel, depending on your preference and space constraints.

Each testimonial can include the customer's name, their role or title, company name, the testimonial quote or review text, and an optional profile photo. The carousel option allows visitors to navigate through multiple testimonials with smooth animations, while the grid layout shows several testimonials at once for immediate impact.

**How Users Can Use It:**
Add the Testimonial block where you want to display customer feedback. Add individual testimonials by entering the customer's name, their role (like "CEO" or "Marketing Manager"), and company name. Upload a profile photo if available - personal photos make testimonials more authentic and trustworthy.

Enter the testimonial quote or review text - this should be the customer's actual words about their experience with your product or service. Keep quotes concise but impactful.

Choose between a grid layout (showing multiple testimonials at once) or carousel layout (showing one testimonial at a time with navigation). The carousel is great for space efficiency, while the grid creates immediate social proof.

Customize the styling to match your design - you can control colors for names, roles, quotes, and background elements. Adjust spacing and layout to ensure the testimonials integrate well with your overall page design.

**Component Structure:** Testimonial carousel or grid
- Multiple testimonial support
- Profile photo, name, role, company fields
- Carousel or grid layout options
- Customizable styling and colors
- Navigation controls for carousel mode

### 34. Video Player Block
- **Slug:** `video-player-block`
- **Block Name:** Video Player (Free)
- **Category:** adaire-media-videos
- **Technical Stack:** React, WordPress Block Editor, YouTube/Vimeo APIs, HTML5 video

**Full Functionality Description:**
The Video Player block provides a flexible solution for embedding and playing videos on your website. It supports three main video sources: YouTube videos (via URL or video ID), Vimeo videos, or self-hosted video files that you upload directly. This makes it perfect for product demos, tutorials, promotional videos, or any video content you want to share.

The block includes a responsive container that ensures your video looks great on all screen sizes. You can control playback options like autoplay (video starts playing automatically), mute (sound is off by default), show/hide player controls, and loop (video repeats when finished). The container can be customized with background colors, borders, rounded corners, and shadows to match your design.

**How Users Can Use It:**
Add the Video Player block where you want to display video content. Choose the video source - YouTube, Vimeo, or upload your own file. For YouTube or Vimeo, simply paste the video URL and the block will automatically extract the video ID. For self-hosted videos, upload the video file directly.

Configure playback options based on your needs. Autoplay is great for background videos or promotional content, but be aware that browsers often block autoplay with sound. Muting the video by default can help with autoplay restrictions. Show player controls if you want visitors to be able to pause, play, and seek within the video. Enable loop if you want the video to repeat continuously.

Customize the container appearance - set the dimensions, add a background color if you want a frame around the video, add borders with custom colors and widths, use border radius for rounded corners, and add shadow effects for depth.

The container is fully responsive, so you can set different dimensions for mobile, tablet, and desktop to ensure the video looks optimal at all screen sizes.

**Component Structure:** Video container with responsive sizing
- YouTube, Vimeo, and self-hosted video support
- Responsive container with custom dimensions
- Playback controls (autoplay, mute, loop, controls)
- Customizable container styling
- Border, shadow, and background options

### 35. Website Footer Block
- **Slug:** `website-footer-block`
- **Block Name:** Website Footer (Free)
- **Category:** adaire-layout-navigation
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, widget integration

**Full Functionality Description:**
The Website Footer block creates a comprehensive footer section that appears at the bottom of your pages. Footers are essential for providing navigation, contact information, legal links, and branding consistency across your site. This block supports multiple sections or columns, allowing you to organize footer content logically - you might have a branding section, navigation links, contact information, and social media icons.

The footer can include your logo or company name, navigation links to important pages, contact details, copyright information, social media icons, and even WordPress widgets for dynamic content. The styling is fully customizable to match your brand, with options for background colors, text colors, and spacing.

**How Users Can Use It:**
Add the Website Footer block at the bottom of your page or in a global template to ensure consistent footer presence across your site. Add different sections or columns to organize your footer content - common setups include a branding column, navigation links column, contact information column, and social media column.

In the branding section, add your logo, company name, and a brief tagline or description. In navigation sections, add links to important pages like About, Services, Contact, and legal pages like Privacy Policy and Terms of Service.

Add contact information like email address, phone number, and physical address if relevant. Include social media icons that link to your profiles on various platforms.

Add copyright information and any additional legal or business information. You can also include WordPress widgets for dynamic content like recent posts or category lists.

Customize the styling with background colors (dark footers are common for contrast), text colors for readability, and spacing to ensure the footer feels properly proportioned.

**Component Structure:** Multi-section footer
- Multiple footer sections/columns
- Logo and branding support
- Navigation link management
- Contact information display
- Social media icon integration
- WordPress widget support
- Customizable styling and colors

---

## Plus Blocks

### 36. Call To Action Block
- **Slug:** `call-to-action-block`
- **Block Name:** Call To Action
- **Category:** adaire-start-actions
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, background images

**Full Functionality Description:**
The Call To Action (CTA) block creates compelling sections designed to convert visitors into customers or encourage specific actions. CTAs are critical for guiding visitors toward important goals like signing up for a newsletter, requesting a consultation, making a purchase, or downloading a resource. This block provides multiple layout options to suit different design needs and content types.

The block supports split layouts (content on one side, image on the other), stacked layouts (content above image or vice versa), and overlay layouts (content overlaid on a background image). You can use background images or solid colors, and the overlay options ensure text remains readable over images. The responsive design ensures the CTA looks great on all devices.

**How Users Can Use It:**
Add the Call To Action block where you want to encourage a specific action. Choose a layout that fits your content and design - split layouts work well for image + text combinations, stacked layouts are great for longer-form content, and overlay layouts create dramatic visual impact.

Add a compelling header that clearly states the value proposition or main message. The body text should elaborate on the benefits and provide context for the action you want visitors to take.

Add a button with clear, action-oriented text like "Get Started," "Sign Up Now," or "Download Free Guide." Set the button link to direct visitors to the appropriate destination - this could be a signup form, contact page, pricing page, or download link.

If using a split or overlay layout, upload a background image that reinforces your message. Use overlay options to ensure text remains readable over the image - overlays add a semi-transparent layer that improves contrast.

Customize the colors to match your brand and create visual hierarchy. Adjust spacing to ensure the CTA feels properly proportioned within your page layout.

**Component Structure:** Container with content and image sections
- Multiple layout options (split, stacked, overlay)
- Background image support with overlays
- Text content and button controls
- Responsive sizing and spacing
- Customizable colors and styling

### 37. Counter Block
- **Slug:** `counter-block`
- **Block Name:** Statistics Counter
- **Category:** adaire-marketing-conversion
- **Technical Stack:** React, WordPress Block Editor, counting animation library, CSS Grid

**Full Functionality Description:**
The Counter block displays key statistics, metrics, or numbers with animated counting effects. This is perfect for showcasing impressive numbers like "10,000+ Happy Customers," "500+ Projects Completed," or "99% Satisfaction Rate." The animated counting effect draws attention to these important metrics and makes them feel more dynamic and impactful.

Each counter can have a label (describing what the number represents), the numerical value, optional prefix (like "$" or "+"), and optional suffix (like "%" or "K"). When visitors scroll to the counter, the numbers animate from zero to the final value, creating an engaging visual effect. The counters are displayed in a responsive grid layout that adapts to different screen sizes.

**How Users Can Use It:**
Add the Counter block where you want to display key metrics or statistics. This is commonly used in "Our Impact" sections, "By the Numbers" areas, or anywhere you want to highlight impressive figures that build credibility.

Add individual counters for each metric you want to display. For each counter, enter a label that clearly describes what the number represents (like "Projects Completed" or "Years in Business"). Enter the numerical value - this can be a simple number like "500" or a larger number like "10000".

Add prefixes if needed - common prefixes include currency symbols like "$", or addition symbols like "+". Add suffixes like "%" for percentages, "K" for thousands, or "M" for millions.

Customize the animation settings to control how the counting effect feels - you can adjust the speed and duration. The typography controls let you set font sizes for labels and values independently, ensuring the numbers stand out appropriately.

Choose colors that match your brand - you can set colors for labels, values, and optional accent elements. Adjust the grid layout to control how many counters appear in each row on different screen sizes.

**Component Structure:** Grid of counter items with animated numbers
- Animated counting from zero to final value
- Label, value, prefix, and suffix fields
- Responsive grid layout
- Customizable animation timing
- Typography and color controls

### 38. Horizontal Scroll Card Block
- **Slug:** `horizontal-scroll-card-block`
- **Block Name:** Horizontal Scroll Cards
- **Category:** adaire-interactive
- **Technical Stack:** React, WordPress Block Editor, custom scroll implementation, CSS animations

**Full Functionality Description:**
The Horizontal Scroll Card block creates a touch-friendly horizontal scrolling container for displaying content cards. Unlike traditional scrollbars, this block uses a custom scroll implementation with a specialized drag cursor that indicates scrollability. This creates a more engaging and intuitive user experience, especially on touch devices where swipe gestures are natural.

The block is perfect for showcasing portfolio items, team members, product features, testimonials, or any content that works well in a card format. The horizontal scrolling keeps your layout compact while still allowing visitors to browse through multiple items. The custom drag cursor provides visual feedback that the area is scrollable, improving discoverability.

**How Users Can Use It:**
Add the Horizontal Scroll Card block where you want to display horizontally scrollable content. Add individual cards with your content - each card can contain images, text, or other elements depending on your needs.

Configure the scroll behavior by adjusting the scroll speed - faster scrolling feels more responsive, while slower scrolling provides more control. Set the spacing between cards to control how tight or loose the arrangement feels.

Customize the styling to match your design - you can control card colors, borders, shadows, and other visual elements. The custom drag cursor can be customized to indicate scrollability and match your overall aesthetic.

On touch devices, visitors can swipe naturally to scroll through the cards. On desktop, they can click and drag with the custom cursor, or use trackpad gestures. The scrolling is smooth and responsive, with optional snap-to-card behavior for precise control.

**Component Structure:** Horizontal scroll container
- Custom scroll implementation
- Specialized drag cursor
- Touch-friendly swipe gestures
- Configurable scroll speed and spacing
- Responsive card display

### 39. Horizontal Scroll Carousel Block
- **Slug:** `horizontal-scroll-carousel-block`
- **Block Name:** Horizontal Scroll Carousel
- **Category:** adaire-interactive
- **Technical Stack:** React, WordPress Block Editor, carousel library, CSS animations

**Full Functionality Description:**
The Horizontal Scroll Carousel block creates an elegant carousel with horizontal scrolling capabilities and smooth animations. This is perfect for featured content, product showcases, portfolio highlights, or any content that benefits from a slide-based presentation with controlled navigation. The carousel includes navigation controls, autoplay functionality, and smooth transitions between slides.

Unlike a simple horizontal scroll, the carousel provides structured navigation with arrows, dots, or both, giving visitors clear controls for browsing through content. The autoplay option can automatically advance slides, creating a dynamic, ever-changing display. Smooth animations and transitions make the experience feel polished and professional.

**How Users Can Use It:**
Add the Horizontal Scroll Carousel block where you want a structured, navigable content display. Add individual slides or content items to the carousel - each can contain images, text, or other content blocks.

Configure carousel settings to control the behavior. Enable autoplay if you want slides to advance automatically - set the delay time between slides and choose whether the carousel should loop (return to the first slide after the last).

Choose navigation options - you can add arrow buttons for manual navigation, pagination dots for slide indicators, or both. The navigation style can be customized to match your design.

Adjust the animation settings to control how slides transition - you can choose the transition speed and easing function for smooth or snappy motion. Set the spacing between slides to control the overall feel.

The carousel is fully responsive, automatically adjusting the number of visible slides and navigation controls based on screen size.

**Component Structure:** Horizontal carousel
- Structured navigation controls
- Autoplay with configurable timing
- Smooth slide transitions
- Pagination and arrow navigation
- Responsive slide display

### 40. Info Grid 3 Block
- **Slug:** `infogrid-3-block`
- **Block Name:** Info Grid 3
- **Category:** adaire-content-info
- **Technical Stack:** React, WordPress Block Editor, CSS Grid, background effects

**Full Functionality Description:**
The Info Grid 3 block creates a specialized grid layout with a unique structure: two main rows where the second row contains a three-column sub-section. This distinctive layout is perfect for creating visually interesting information displays that break away from standard grid patterns. The layout naturally guides the eye through content in a specific flow, making it great for storytelling or presenting information in a particular sequence.

The block supports background options for different sections, allowing you to create visual separation or emphasis for specific content areas. The responsive design ensures the layout adapts gracefully to different screen sizes while maintaining the distinctive structural pattern. This layout works particularly well for "Our Approach" sections, process explanations, or any content where the visual structure reinforces the narrative flow.

**How Users Can Use It:**
Add the Info Grid 3 block where you want to create a distinctive two-row layout with a three-column bottom section. The first row typically contains a main heading or featured content, while the second row's three-column section is perfect for supporting information, details, or related items.

Add content to each section of the grid. The top row works well for a main heading, introductory text, or featured content. The three-column bottom section can contain related items, details, or supporting information that elaborates on the top row content.

Configure background options to create visual separation - you might use a different background color for the top row to make it stand out, or use background images for visual interest. The spacing controls let you adjust the gaps between sections and columns for the perfect visual balance.

The layout is fully responsive - on desktop you'll see the full two-row structure, while on mobile the content stacks vertically for optimal readability.

**Component Structure:** 2-row grid with 3-column section
- Unique 2-row layout structure
- Three-column sub-section in bottom row
- Background customization options
- Responsive layout adaptation
- Visual hierarchy through structure

### 41. Logos Block
- **Slug:** `logos-block`
- **Block Name:** Logos
- **Category:** adaire-business
- **Technical Stack:** React, WordPress Block Editor, carousel functionality, responsive design

**Full Functionality Description:**
The Logos block is designed to display partner logos, client logos, affiliate badges, or certification marks in a professional layout. This is perfect for building credibility by showing the companies and organizations you work with or are certified by. The block can display logos in a static grid or as an animated carousel, depending on your preference and the number of logos you have.

The carousel option creates an automatically scrolling display that cycles through logos, which is great for showing many partners in a compact space. The grid option shows multiple logos at once for immediate impact. Both layouts are fully responsive, ensuring logos look great on all screen sizes. The animation settings let you control the speed and feel of logo transitions.

**How Users Can Use It:**
Add the Logos block where you want to display partner or client logos. Upload logo images for each company or organization you want to feature. You can add as many logos as needed - the block handles the layout automatically.

Choose between a grid layout (showing multiple logos at once) or carousel layout (showing a few logos at a time with automatic scrolling). The carousel is great for large numbers of logos, while the grid creates immediate social proof.

Configure carousel settings if using carousel mode - set the animation speed to control how quickly logos cycle, and choose whether the carousel should loop continuously. Adjust the spacing between logos to control the overall feel - tighter spacing creates a more unified display, while larger spacing gives each logo more individual presence.

Set the number of columns for different screen sizes to ensure optimal layout. On desktop you might show 4-6 logos at once, while on mobile 2-3 logos is typically better for readability.

**Component Structure:** Logo carousel or grid
- Multiple logo upload support
- Carousel and grid layout options
- Autoplay with configurable speed
- Responsive column controls
- Spacing and gap customization

### 42. Location Map
- **Slug:** `location-map`
- **Block Name:** Location Map
- **Category:** adaire-media-images
- **Technical Stack:** React, WordPress Block Editor, Google Maps API, Leaflet integration

**Full Functionality Description:**
The Map block displays interactive maps with multiple location markers, making it perfect for showing office locations, store branches, service areas, or any geographic information. The block integrates with Google Maps or Leaflet to provide professional, interactive mapping functionality with smooth zooming, panning, and marker interactions.

You can add multiple locations, each with its own marker, address, and optional description. The map can be customized with different map styles (standard, satellite, terrain), zoom levels, and marker styles. Visitors can interact with the map by clicking markers to see location details, zooming in/out, and panning around the area.

**How Users Can Use It:**
Add the Map block where you want to display geographic information. Add individual locations by entering addresses or coordinates - the map will automatically place markers at these locations. For each location, you can add a title, description, and other details that appear when visitors click the marker.

Choose the map style that fits your needs - standard maps are great for general location display, satellite maps show aerial imagery, and terrain maps emphasize topographic features. Set the initial zoom level to control how much of the area is visible - higher zoom levels show more detail for smaller areas, while lower zoom levels show broader regions.

Customize the marker appearance to match your brand - you can choose different marker colors, styles, or even custom marker images. The map dimensions can be adjusted to fit your layout, and the container can be styled with borders, shadows, or rounded corners.

The map is fully responsive, ensuring it works well on both desktop and mobile devices where touch interactions are natural.

**Component Structure:** Map container with markers
- Multiple location support
- Interactive map with zoom and pan
- Customizable markers and popups
- Different map style options
- Responsive map display

### 43. Mega Menu Block
- **Slug:** `mega-menu-block`
- **Block Name:** Mega Menu
- **Category:** adaire-layout-navigation
- **Technical Stack:** React, WordPress Block Editor, CSS positioning, responsive navigation

**Full Functionality Description:**
The Mega Menu block creates advanced, multi-level navigation menus with large dropdown panels that can contain rich content. Unlike standard dropdowns that show simple link lists, mega menus can include images, descriptions, multiple columns of links, and even other content blocks. This is perfect for complex websites with lots of content, e-commerce sites with many categories, or any site where you want to provide comprehensive navigation in an organized way.

The mega menu appears when visitors hover over or click on top-level menu items, revealing a large panel with organized content. You can create different layouts for different menu items - some might show link columns, others might show featured content with images and descriptions. The responsive design ensures the menu works well on all devices, potentially converting to a mobile-friendly format on smaller screens.

**How Users Can Use It:**
Add the Mega Menu block to your site's header area. Configure the menu structure by adding top-level menu items - these are the main navigation links that visitors see initially. For each top-level item, you can add submenu content that appears in the mega menu panel.

Choose a layout preset for each dropdown panel - options might include multi-column link lists, featured content with images, or custom layouts. Add the content for each panel, which can include links, images, descriptions, or even other blocks for rich content.

Customize the styling to match your design - you can control colors for menu items, dropdown backgrounds, borders, and text. Adjust spacing and sizing to ensure the menu feels properly proportioned within your header.

Configure responsive behavior - on mobile, mega menus typically convert to a simpler accordion-style menu or a hamburger menu for better touch interaction.

**Component Structure:** Complex navigation with dropdown panels
- Multi-level menu structure
- Rich content dropdown panels
- Multiple layout presets
- Responsive mobile adaptation
- Customizable styling and colors

### 44. Mega Menu Item
- **Slug:** `mega-menu-item`
- **Block Name:** Mega Menu Item
- **Category:** adaire-layout-navigation
- **Parent:** create-block/mega-menu-block
- **Functionality:** Individual mega menu item with dropdown content
- **Key Attributes:** label, link, dropdown content
- **Component Structure:** Menu item with dropdown panel

### 45. Portfolio Block
- **Slug:** `portfolio-block`
- **Block Name:** Portfolio
- **Category:** adaire-business
- **Functionality:** Showcase your work with elegant portfolio layouts, gallery modals, and GSAP animations
- **Key Attributes:** portfolio items array, layout mode, filtering, modal settings, styling
- **Component Structure:** Portfolio grid with modal
- **How to Use:** Add portfolio items, configure layout, enable filtering

### 46. Pricing Comparison Block
- **Slug:** `pricing-comparison-block`
- **Block Name:** Pricing Comparison
- **Category:** adaire-marketing-conversion
- **Functionality:** Compare pricing plans side-by-side with feature highlights
- **Key Attributes:** plans array, features array, comparison highlights, styling
- **Component Structure:** Comparison table
- **How to Use:** Add plans and features, configure comparison

### 47. Pricing Table Block
- **Slug:** `pricing-table-block`
- **Block Name:** Pricing Table
- **Category:** adaire-marketing-conversion
- **Functionality:** Build responsive pricing tables with monthly/yearly toggle, customizable cards, feature lists, and button styling
- **Key Attributes:** plans array, toggle (monthly/yearly), card styling, feature lists, buttons
- **Component Structure:** Pricing cards with toggle
- **How to Use:** Add pricing plans, configure toggle, customize cards

### 48. Questions Block
- **Slug:** `questions-block`
- **Block Name:** Questions
- **Category:** adaire-content-expandable
- **Functionality:** Create animated FAQ sections with GSAP pinning and smooth transitions
- **Key Attributes:** questions array, animation settings, styling, layout
- **Component Structure:** FAQ list with animations
- **How to Use:** Add questions, configure animations

### 49. Scroll Text Block
- **Slug:** `scroll-text-block`
- **Block Name:** Scroll Text
- **Category:** adaire-content-info
- **Functionality:** Add scroll-triggered text animations with customizable speed and direction
- **Key Attributes:** text content, scroll speed, direction, styling
- **Component Structure:** Scrolling text marquee
- **How to Use:** Add text, set speed and direction

### 50. Services Block
- **Slug:** `services-block`
- **Block Name:** Services
- **Category:** adaire-business
- **Functionality:** Display your services with interactive carousel layouts, scroll-triggered animations, and smooth transitions
- **Key Attributes:** services array, carousel settings, styling, animations
- **Component Structure:** Services carousel or grid
- **How to Use:** Add services, configure layout and animations

### 51. Testimonial 2 Block
- **Slug:** `testimonial2-block`
- **Block Name:** Testimonial 2
- **Category:** adaire-business
- **Functionality:** Feature long-form testimonials with portrait photography, company logos, and keyboard-accessible carousel navigation
- **Key Attributes:** testimonials array, carousel settings, detailed layout, styling
- **Component Structure:** Enhanced testimonial carousel
- **How to Use:** Add detailed testimonials, configure carousel

### 52. Video Carousel Block
- **Slug:** `video-carousel-block`
- **Block Name:** Video Carousel
- **Category:** adaire-media-videos
- **Functionality:** A draggable video carousel with custom drag cursor and smooth scrolling cards
- **Key Attributes:** videos array, carousel settings, styling, autoplay
- **Component Structure:** Video carousel
- **How to Use:** Add videos, configure carousel options

### 53. Video Hero Block
- **Slug:** `video-hero-block`
- **Block Name:** Video Hero
- **Category:** adaire-layout-hero
- **Functionality:** Create stunning video hero sections with YouTube/Vimeo integration, smooth transitions, and customizable overlays
- **Key Attributes:** video settings, overlay content, styling, responsive settings
- **Component Structure:** Video background with overlay content
- **How to Use:** Set video background, add overlay content, customize styling

---

## Premium Blocks

### 54. Particles Block
- **Slug:** `particles-block`
- **Block Name:** Particles Block
- **Category:** adaire-interactive
- **Functionality:** Add dynamic particle effects with scroll-controlled animations and customizable positioning
- **Key Attributes:** particle settings (count, speed, size), scroll behavior, colors, positioning
- **Component Structure:** Canvas-based particle system
- **How to Use:** Configure particle behavior, adjust scroll effects

### 55. Project Block
- **Slug:** `project-block`
- **Block Name:** Project Block
- **Category:** adaire-business
- **Functionality:** Highlight your projects with interactive showcases, particle effects, and dynamic content
- **Key Attributes:** project details, media, styling, particle effects
- **Component Structure:** Project showcase with effects
- **How to Use:** Add project details, configure effects

### 56. Industries Block
- **Slug:** `industries-block`
- **Block Name:** Industries
- **Category:** adaire-business
- **Functionality:** Showcase industries with responsive tiles, customizable icons, link functionality, and flexible layouts
- **Key Attributes:** industries array, tile layout, icons, links, styling
- **Component Structure:** Industry tiles grid
- **How to Use:** Add industries, configure tiles and icons

### 57. Popup Modal Block
- **Slug:** `popup-modal-block`
- **Block Name:** Popup Modal
- **Category:** adaire-interactive
- **Functionality:** Create customizable modal dialogs with trigger buttons, responsive dimensions, and flexible content areas
- **Key Attributes:** trigger settings, modal content, sizing, behavior, styling
- **Component Structure:** Modal with trigger button
- **How to Use:** Set trigger, add modal content, configure behavior

### 58. Testimonial 3 Block
- **Slug:** `testimonial3-block`
- **Block Name:** Testimonial 3
- **Category:** adaire-business
- **Functionality:** Pro testimonial carousel with draggable interface, purple background styling, white cards, and profile images
- **Key Attributes:** testimonials array, carousel settings, premium styling, animations
- **Component Structure:** Premium testimonial carousel
- **How to Use:** Add testimonials, configure premium styling

---

## Freemium Blocks

### 59. Cookie Consent Block
- **Slug:** `cookie-consent-block`
- **Block Name:** Cookie Banner
- **Category:** adaire-business
- **Functionality:** GDPR/CCPA-ready cookie consent banner with category-based preferences, multiple layouts, and full style controls
- **Key Attributes:** categories array (necessary, functional, preferences, analytics, marketing, etc.), layoutType (bar, floating, modal, slide-in), displayDensity, banner styling, button texts, policy links
- **Component Structure:** Complex banner with preference management
- **PHP Rendering:** Uses render.php
- **How to Use:** Configure cookie categories, choose layout, customize styling

---

## Additional Blocks

### 60. App Download Block
- **Slug:** `app-download-block`
- **Block Name:** App Download
- **Category:** adaire-marketing-conversion
- **Functionality:** App Download section with store badges, screenshots, ratings
- **Key Attributes:** eyebrow, heading, text, buttonText, buttonUrl, appName, tagline, appStoreUrl, googlePlayUrl, screenshotUrl, qrUrl, platform (both/ios/android), mockup, rating, downloadCount, badgeStyle, layout, background options
- **Component Structure:** Text content + app store badges + screenshot/mockup display
- **How to Use:** Customize text, add store URLs, upload app screenshot, choose layout

### 61. Bento Grid Block
- **Slug:** `bento-grid-block`
- **Block Name:** Bento Grid
- **Category:** adaire-information-blocks
- **Functionality:** Bento-style feature grid for high-impact content presentation
- **Key Attributes:** containerMode, containerMaxWidth, columns (responsive), gap, items array with preset layouts
- **Component Structure:** Grid container with configurable layouts (presets defined in bento-layouts.js)
- **How to Use:** Select preset layout, customize content in each grid cell

### 62. Case Studies Block
- **Slug:** `case-studies-block`
- **Block Name:** Case Studies
- **Category:** adaire-business
- **Functionality:** Showcase detailed customer success stories with images, results, and case study layouts
- **Key Attributes:** caseStudies array (title, description, backgroundImage, linkUrl, industry, capabilities, client, etc.), columns, gap, filters, search, load more, card styling
- **Component Structure:** Grid with filtering, search, and load more functionality
- **PHP Rendering:** Uses render.php for server-side rendering
- **How to Use:** Add case studies, configure grid layout, enable filters/search

### 63. Form Block
- **Slug:** `form-block`
- **Block Name:** Booking Form
- **Category:** adaire-business
- **Functionality:** Booking form with customizable fields
- **Key Attributes:** eyebrow, heading, text, buttonText, destinationEmail, services, calendarEmbedUrl, successMessage, fields array (label, name, type, required, width), styling options
- **Component Structure:** Form with input fields + submit button
- **How to Use:** Configure form fields, set destination email, customize styling

### 64. Header Block
- **Slug:** `header-menu-block`
- **Block Name:** Header Menu
- **Category:** adaire-layout-navigation
- **Functionality:** Build responsive site headers with logo, navigation, CTA, search, social icons, top bar, sticky behavior, and mobile hamburger menu
- **Key Attributes:** layout, topBar settings, logo (text/image), navItems (array), navigationSource, mobile menu settings, CTA/Sign In/Sign Up buttons, search, social icons, sticky behavior
- **Component Structure:** Complex header with multiple sections
- **PHP Rendering:** Uses render.php
- **How to Use:** Choose layout, add logo, configure navigation, add buttons, enable sticky

### 65. Live Streamer Block
- **Slug:** `live-streamer-block`
- **Block Name:** Live Streamer
- **Category:** adaire-media-videos
- **Functionality:** Embed live streaming content
- **Key Attributes:** streamUrl, platform, chat settings, styling
- **Component Structure:** Live stream embed
- **How to Use:** Set stream URL, configure platform options

### 66. PDF Upload Block
- **Slug:** `pdf-upload-block`
- **Block Name:** PDF Upload
- **Category:** adaire-media-images
- **Functionality:** PDF upload and display block
- **Key Attributes:** pdfFile, displayMode, styling
- **Component Structure:** PDF viewer
- **How to Use:** Upload PDF, choose display mode

### 67. Promo Banner Block
- **Slug:** `promo-banner-block`
- **Block Name:** Promo Banner
- **Category:** adaire-marketing-conversion
- **Functionality:** Promotional banner with countdown and CTA
- **Key Attributes:** content, countdown settings, styling, behavior
- **Component Structure:** Banner with optional countdown
- **How to Use:** Add content, configure countdown if needed

### 68. Rating Badge Block
- **Slug:** `rating-badge-block`
- **Block Name:** Rating Badge
- **Category:** adaire-content-info
- **Functionality:** Display rating badges with stars or custom icons
- **Key Attributes:** rating value, display style, colors, size
- **Component Structure:** Rating display
- **How to Use:** Set rating value, choose display style

### 69. Reader Block
- **Slug:** `reader-block`
- **Block Name:** Reader
- **Category:** adaire-content-info
- **Functionality:** Reading progress indicator and reader mode
- **Key Attributes:** progress indicator, styling, behavior
- **Component Structure:** Reading progress bar
- **How to Use:** Configure progress display, customize styling

### 70. SaaS Hero Block
- **Slug:** `saas-hero-block`
- **Block Name:** SaaS Hero
- **Category:** adaire-layout-hero
- **Functionality:** SaaS-specific hero section with product showcase
- **Key Attributes:** product content, styling, responsive settings
- **Component Structure:** SaaS product hero
- **How to Use:** Add product content, configure hero layout

### 71. Skill Bar Block
- **Slug:** `skill-bar-block`
- **Block Name:** Skill Bar
- **Category:** adaire-content-info
- **Functionality:** Display skill/progress bars with animations
- **Key Attributes:** skills array (name, level), animation settings, styling
- **Component Structure:** Skill bars with animations
- **How to Use:** Add skills with levels, configure animations

### 72. Timeline Block
- **Slug:** `timeline-block`
- **Block Name:** Timeline
- **Category:** adaire-content-info
- **Functionality:** Timeline display for events or milestones
- **Key Attributes:** timeline items, layout (vertical/horizontal), styling, animations
- **Component Structure:** Timeline with items
- **How to Use:** Add timeline items, choose layout, customize styling

---

## Architecture Patterns

### File Structure Pattern
```
block-name/
├── block.json          # Block metadata and attributes
├── index.js            # Block registration
├── edit.js             # Editor UI component
├── save.js             # Frontend rendering (React)
├── view.js             # Frontend interactivity (optional)
├── render.php          # Server-side rendering (optional)
├── style.scss          # Frontend styles
├── editor.scss         # Editor-only styles
├── deprecated.js       # Deprecated versions (optional)
└── icons.js            # Custom icons (optional)
```

### Common Attribute Patterns
- **blockId** - Unique identifier for the block instance
- **containerMode** - "constrained" or "full" width
- **containerMaxWidth** - Responsive max-width settings
- **Responsive sizing** - Objects with desktop/tablet/mobile/smartwatch keys
- **Typography controls** - fontSize, fontWeight, lineHeight, letterSpacing, textTransform, fontFamily
- **Color controls** - Various color attributes for different elements
- **Margin/Padding** - Responsive spacing controls

### Component Architecture
- **Parent blocks** use InnerBlocks for child content
- **Child blocks** have `parent` property in block.json
- **React components** use @wordpress/block-editor hooks (useBlockProps, RichText, MediaUpload)
- **CSS custom properties** extensively used for dynamic styling
- **Device switcher component** for responsive editing

### Rendering Approaches
1. **React-only:** edit.js + save.js (most blocks)
2. **React + view.js:** For frontend interactivity (accordion, tabs, etc.)
3. **PHP rendering:** render.php for complex server-side logic (header, case-studies, cookie-consent)

### Block Categories
- `adaire-business` - Business-focused blocks
- `adaire-content-expandable` - Accordion/Toggle content
- `adaire-content-tabs` - Tab-based content
- `adaire-content-info` - Information display
- `adaire-interactive` - Interactive elements
- `adaire-layout-hero` - Hero sections
- `adaire-layout-navigation` - Navigation headers
- `adaire-layout-sections` - Layout containers
- `adaire-marketing-conversion` - Marketing/CTA blocks
- `adaire-media-images` - Image/media galleries
- `adaire-media-videos` - Video content
- `adaire-start-actions` - Action buttons
- `adaire-free` - Free tier blocks
- `adaire-information-blocks` - Information display blocks

---

## Usage Guidelines

### Responsive Design
All blocks support responsive breakpoints:
- **Desktop** - Primary design target
- **Tablet** - Intermediate breakpoint
- **Mobile** - Mobile-optimized
- **Smartwatch** - Ultra-small breakpoint

### Device Switcher
Use the device switcher component in the editor to preview and configure settings for each breakpoint.

### Styling Best Practices
- Use CSS custom properties for dynamic styling
- Leverage responsive attribute objects for breakpoint-specific settings
- Follow the existing color and typography patterns
- Test across all breakpoints before publishing

### Parent-Child Relationships
Some blocks require specific parent blocks:
- `column-block` must be inside `row-block`
- `accordion-item-block` must be inside `accordion-block`
- `swiper-slide-block` must be inside `swiper-carousel-block`
- `tab-panel-block` must be inside `tabs-block`
- `flipcard-front-block` and `flipcard-back-block` must be inside `flipcard-block`

---

## Technical Requirements

- **WordPress:** 6.7 or higher
- **PHP:** 7.4 or higher
- **Browser:** Modern browsers with JavaScript enabled
- **Dependencies:** GSAP, React, WordPress Block Editor

---

## Support & Documentation

For additional support, refer to:
- Plugin README.md for general information
- BLOCKS-CATEGORIZATION.md for tier information
- Individual block folders for implementation details
- WordPress Block Editor documentation for Gutenberg basics