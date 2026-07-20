=== Adaire Blocks ===
Contributors: adairedigital
Donate link: https://adaireblocks.com/
Tags: blocks, gutenberg, page builder, layout, animation
Requires at least: 6.7
Tested up to: 6.8
Stable tag: 1.3.0
Requires PHP: 7.4
License: GPL-3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Source Code: https://github.com/helloadaire/Adaire-Blocks-Free

A library of custom Gutenberg blocks for building responsive, animated WordPress pages — headers, hero sections, pricing tables, galleries, accordions, tabs, and more.

== Description ==

Adaire Blocks adds a set of custom Gutenberg blocks for building page layouts without leaving the standard WordPress block editor. The free version includes a complete set of foundational blocks — headers, hero sections, pricing tables, galleries, accordions, tabbed content, and more — with no cost and no time limit.

Additional blocks (mega menus, carousels, scroll-driven layouts, and other advanced components) are available as a separate paid add-on for users who need them. The free plugin is fully functional on its own and does not require the add-on to work.

**Included in the Free version**

* **Header Menu:** A configurable site header with menu, search, social icons, and call-to-action button support.
* **SaaS Hero:** A hero section with media frame styles, ratings display, and security badges.
* **Row & Column:** Flexible row/column containers for responsive layouts.
* **About Us:** A configurable About Us section.
* **Timeline:** Showcase milestones, history, or a process in a timeline layout.
* **Gallery:** A responsive image gallery (up to 8 images).
* **Card Slider:** A scroll-animated row of cards for showcasing content.
* **Footer:** A configurable site footer with menu and layout options.
* **Pricing Plans:** Responsive pricing tables with a monthly/yearly toggle.
* **Blog Post Grid:** Display your latest articles or portfolio items in a filterable, animated grid.
* **Feature Grid:** A grid layout with background image support and overlay controls.
* **Tabbed Content:** Organize content into tabbed interfaces with animated panel transitions.
* **Accordion:** Configurable, animated accordions for FAQs or multi-section content.
* **Content Switcher:** A pill-style toggle for switching between two content states.
* **Video Player:** Embed YouTube or Vimeo videos with a lightweight player.
* **Icon Box:** Display an icon with customizable styling.
* **Social Banner:** A sticky, side-mounted social sharing banner.
* **Share Buttons:** A customizable social sharing button with platform selection.
* **Reviews:** Showcase client reviews in an auto-playing carousel.
* **Rating Badges:** Display rating and review badges.
* **Button:** A customizable button block with link, target, and styling options.
* **Cookie Notice:** A configurable cookie consent banner.
* **Progress Bar:** A simple, styleable progress indicator.

**Design**

* Accessibility-friendly: semantic HTML and keyboard navigation support.
* Responsive by default: mobile-first design with breakpoint controls.
* Built with modern JavaScript (ES6+) and React, using native CSS transitions and animations — no third-party animation library is bundled.
* Every block includes customization options in the block sidebar: colors, typography, spacing, and responsive controls.

**System Requirements**

* WordPress 6.7 or higher
* PHP 7.4 or higher (8.0+ recommended)
* A modern WordPress theme with block editor support

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/adaire-blocks` directory, or install directly from the WordPress plugin repository.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. In the Gutenberg editor, click the '+' inserter and find your new Adaire Blocks under their respective categories.

== Frequently Asked Questions ==

= Will you be adding more blocks and templates? =
Yes. We're actively developing additional blocks and full website templates.

= Do I need another page builder to use these blocks? =
No. Adaire Blocks works exclusively within the standard WordPress Gutenberg editor. No additional plugins required.

= Are the blocks compatible with my theme? =
Yes, they are designed to integrate with any modern WordPress theme that follows block editor standards.

= Can I customize the animations? =
Yes. Each animation-enabled block includes controls for speed and, where applicable, easing and trigger points.

= Will these blocks slow down my website? =
Animations use native CSS transitions and the Intersection Observer API, loaded only on pages that use the relevant blocks, and use transform/opacity for GPU-accelerated animations to avoid layout thrashing.

= How do I get support? =
Visit our website at https://adaireblocks.com or reach out through the WordPress.org support forums. Adaire Blocks is open-source (GPL-3.0), and we welcome contributions from the community.

= Are there paid add-ons? =
A separate paid add-on with additional blocks is available for users who want it. It is not required to use this plugin, and this plugin does not nag, degrade, or limit functionality to promote it beyond a single entry in the "Plugins" admin menu.

== External Services ==

This plugin connects to the following third-party/external services under specific, limited circumstances:

**1. Adaire feedback service (adaire.com)**

If you deactivate the plugin and choose to submit the optional deactivation-feedback form, your selected reason, any free-text details you enter, your email address (if provided), and your site's home URL are sent to `https://adaire.com/feedback-handler.php` so we can review feedback and improve the plugin. This request is only made if you actively submit that optional form — it does not run automatically or silently. See Adaire's website for more information: https://adaireblocks.com/

**2. SendGrid (email delivery)**

The plugin includes an optional admin diagnostic tool ("Send test email") for site administrators who have configured their own SendGrid API key (via a `wp-config.php` constant or environment variable). This feature is inactive by default, requires an administrator to have deliberately configured an API key, and is only reachable from the plugin's own admin screens by a logged-in administrator. When used, the email content and recipient address you specify are sent through SendGrid's API (a Twilio company). SendGrid's terms and privacy policy: https://www.twilio.com/en-us/legal/privacy

**3. Vimeo oEmbed API**

The Video Player block lets you embed a Vimeo video by ID. When you select "Vimeo" as the video source in the block editor, the editor fetches the video's public thumbnail from Vimeo's oEmbed endpoint (`https://vimeo.com/api/oembed.json`) so it can be displayed in the editor preview. Only the video ID you provide is sent; no personal or site visitor data is included. This request happens only in the block editor, only when Vimeo is selected as the video source. Vimeo's terms and privacy policy: https://vimeo.com/privacy

== Screenshots ==

1. A clean, focused editing workspace with Adaire Blocks ready to use.
2. Blog Post Grid in action, showing the animated, filterable layout.
3. Header and SaaS Hero blocks on a live page.
4. Pricing Plans and Accordion blocks with their customization controls.
5. Tabbed Content and Card Slider blocks in use.

== Changelog ==

= 1.3.0 =
* WordPress.org compliance update, addressing a plugin-review guideline report:
* Removed GSAP (a non-GPL-compatible third-party animation library) from every block in this free plugin and replaced it with native CSS transitions/animations and the Intersection Observer API. No functionality was removed; animation controls behave the same as before.
* Bootstrap Icons is now bundled locally with the plugin instead of being loaded from a CDN at runtime.
* Corrected the plugin's text domain to `adaire-blocks` (matching the plugin slug) throughout the codebase.
* Added missing "exit if accessed directly" guards to a handful of PHP files that were missing them.
* Rewrote this readme to remove promotional/comparative language, correct the free block list, and add the External Services section above.
* A dev-only build script folder was being unintentionally bundled inside the distributed plugin package; it has been removed from the package (it has no effect on the plugin's behavior — it was never loaded by WordPress).

= 1.2.9 =
* Internal build and tooling maintenance.

= 1.2.8 =
* Improved the plugin deactivation flow: the deactivation survey now has a refreshed design, contextual follow-up questions based on your answer, a clear success state, and a working close button.
* Deactivation feedback is now sent through a dedicated server-side handler, so responses are processed reliably without depending on a third-party client-side script.
* Fixed a display issue in the deactivation modal (explicit SVG dimensions and inline fallback styles) that could cause the header icon to render incorrectly on some sites.

= 1.2.7 =
* Adaire Blocks is now Adaire Blocks. The plugin name, inserter categories, block titles, admin screens, and documentation have all been updated to reflect the new name.
* Every Free-tier block now displays with a "(Free)" suffix in the inserter, so it's clear at a glance which blocks are included at no cost. A few names were also shortened for clarity: Customer Reviews is now Reviews (Free), Website Footer is now Footer (Free), Header is now Header Menu (Free), and Advanced Feature Grid is now Feature Grid (Free).
* Renamed the Feature Box block to Icon Box (Free) for clarity.
* Moved Plan Comparison from Free to the paid add-on — it is no longer included in the Free tier.
* Complete list of blocks included in the Free version: Header Menu, SaaS Hero, Row, About Us, Timeline, Gallery, Card Slider, Card Scroll Item, Footer, Pricing Plans, Blog Post Grid, Feature Grid, Tabbed Content, Tab Panel, Accordion, Content Switcher, Content Toggle Panel, Video Player, Icon Box, Social Banner, Share Buttons, Reviews, Rating Badges, and Button.
* This is a frontend, user-facing rename only. Internal namespaces, block registration names (e.g. `create-block/row-block`), and other technical slugs still use the previous "adaire" naming and were intentionally left unchanged. A separate backend renaming phase, including the plugin slug, is planned for a future release.

= 1.2.6 =
* Corrected the published Free block list to match what actually ships in the plugin. Previously undocumented free blocks now listed: Header, SaaS Hero, Row, About Us, Timeline, Gallery, Card Scroll, Card Scroll Item, Website Footer, Pricing Table, Pricing Comparison, Content Toggle Panel, and Tab Panel.
* Removed Call to Action and Logo Block from the Free block list — these are paid-add-on blocks and were never actually included in the Free build; the previous listing was inaccurate.
* Refreshed the paid-add-on block list to match current tier configuration.
* Column and Accordion Item are not listed as standalone blocks — they are structural child blocks that only exist inside the Row and Accordion blocks, respectively, and were never meant to be used on their own.

= 1.2.5 =
* Added a GitHub link under Contributing section to redirect contributors straight to the Repository.
* Refreshed the WordPress.org plugin landing page banner and header description.

= 1.2.4 =
* Introduced a tiered approach to Gutenberg blocks: a complete free set, plus an optional paid add-on for advanced blocks.
* Built with modern JavaScript (ES6+) and React.

== Upgrade Notice ==

= 1.3.0 =
Compliance and maintenance update: removes the GSAP animation library (replaced with native CSS/JS animations, no functional change), bundles Bootstrap Icons locally instead of loading it from a CDN, and corrects the plugin's text domain. No action required.

= 1.2.8 =
Improved deactivation feedback flow and a display fix for the deactivation modal. No action required.

= 1.2.7 =
Adaire Blocks is now Adaire Blocks. Plugin name, block titles, and admin screens are updated; no functional changes and no action required.

== Additional Information ==

**Made by Adaire Digital**

Visit [Adaire Blocks](https://adaireblocks.com/ "Professional WordPress Development") for more information about our services and products.

**Support and Documentation**

For detailed documentation, tutorials, and support, please visit our website or contact us through the WordPress.org support forums.
