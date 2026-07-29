# Mega Menu

A centrally-managed mega menu feature for Adaire Blocks. Reusable dropdown
content ("mega panels") is authored once in the dashboard and referenced —
never duplicated — from a Core Navigation child block. Editing a panel
updates every place it's used automatically.

## Architecture

This intentionally reuses existing WordPress and Adaire Blocks
infrastructure rather than building parallel systems:

- **Menu structure** (creating, editing, reordering, nesting menu items)
  stays 100% native WordPress, under **Appearance > Menus**. WordPress
  already has a complete menu editor with drag-and-drop, page/post/category/
  custom-link support, and nesting — rebuilding that inside the plugin
  dashboard would be duplicate, higher-risk work for no benefit.
- **Mega panel content** (the reusable dropdown content itself) is a new
  post type, `adaire_mega_panel`, edited with the standard block editor.
- **The dashboard** (`Adaire Blocks > Mega Menu`) is a thin status/management
  layer on top of both: an overview of native menus, full CRUD for mega
  panels, and global default settings. It follows the same PHP + jQuery,
  singleton-class-per-file pattern as every other Adaire Blocks admin page —
  no new frontend framework was introduced.
- **The FSE block**, `adaire/mega-menu-item`, is a dynamic (server-rendered)
  child of `core/navigation`. Its attributes only ever store a reference
  (`panelId`) and presentation settings (layout, trigger, animation,
  breakpoint, etc.) — never panel content.

## Creating a mega panel

1. Go to **Adaire Blocks > Mega Menu > Mega Panels**.
2. Click **Create Panel**. This opens the standard block editor
   (`adaire_mega_panel` supports `title`, `editor`, and `revisions`, so any
   block — columns, groups, images, other Adaire Blocks blocks, etc. — can
   be used to build the panel).
3. Publish when ready. A panel must be **published** and **enabled**
   (see the "Mega Panel Status" box in the panel editor's sidebar) to be
   shown anywhere — draft or disabled panels degrade to a plain link
   wherever they're assigned.
4. From the Mega Panels list you can also **Duplicate**, **Enable/Disable**,
   or **Delete** (moves to Trash) a panel.

## Assigning a panel to a menu item (classic menus)

1. Go to **Appearance > Menus** and open the menu you want to edit.
2. Expand a top-level menu item. Below the normal fields you'll find
   **GutenBlocks Mega Panel** plus panel-width, trigger, breakpoint, and
   animation fields.
3. Choose a panel and save the menu as usual — WordPress's own Save Menu
   button handles it, no separate save step.

This groundwork (the assignment fields and their storage as menu item post
meta) is complete. Actually **rendering** the assigned panel on the front
end of a classic theme via `wp_nav_menu()` is a documented follow-up — see
[Known limitations](#known-limitations).

## Using it in an FSE header

1. Open **Appearance > Editor** and edit the Header template part.
2. Select (or add) a **Core Navigation** block.
3. Use the block inserter inside Navigation and add **GutenBlocks Mega Menu
   Item**.
4. In the block's Inspector, set the **Navigation label**, **Link URL**,
   and pick a **Mega panel** from the dropdown (populated live from your
   published/draft panels via `GET /wp/v2/adaire-mega-panels`).
5. Configure **Desktop Layout**, **Behaviour**, and **Animation** as needed.
6. Save the template. The panel's content is rendered fresh on every page
   load by `src/mega-menu-item/render.php` — editing the panel later
   requires no template changes.

## How global defaults work

**Adaire Blocks > Mega Menu > Settings** stores site-wide defaults (dropdown
width, breakpoint, trigger, animation, delays, and whether classic/FSE
integration are enabled) in the `adaire_mega_menu_settings` option. These
are read by `adaire_mega_menu_get_settings()`. Each block instance's own
Inspector settings always take precedence — the global defaults only apply
where a block hasn't been configured yet (i.e. block.json's own attribute
defaults were chosen to match the settings screen's defaults).

## How instance-level styling works

Every presentation attribute (`layout`, `maxWidth`, `alignment`, `trigger`,
`breakpoint`, `animation`, `animationDuration`, `openDelay`, `closeDelay`,
`panelPadding`) lives on the block itself, set via the Inspector. The
render callback (`src/mega-menu-item/render.php`) turns the relevant ones
into CSS custom properties (`--adaire-mega-menu-max-width`,
`--adaire-mega-menu-padding`, `--adaire-mega-menu-animation-duration`) and
`data-*` attributes the frontend JS reads — no large inline JSON payloads,
and each instance is fully independent.

## Accessibility behaviour

- Semantic markup: `<li>`, `<button>` (trigger), `role="region"` (panel).
- `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-labelledby`, each
  tied to a unique per-instance id (`wp_unique_id()`).
- Keyboard: Tab/Shift+Tab reach the trigger and panel content normally;
  Enter/Space activate the trigger button natively; Escape closes and
  returns focus to the trigger.
- No hover-only functionality — `hover-focus` trigger mode and the
  `click` mode both work without a mouse.
- `prefers-reduced-motion: reduce` disables transition durations via CSS,
  and the frontend JS checks it directly before deciding whether to delay
  hiding the panel for an animation.
- Never removes the native focus outline without a replacement
  (`:focus-visible` styling only adds to it).

## Migration from classic menus

No menu migration is needed — classic (and FSE-registered) WordPress menus
are used as-is; nothing about existing menus changes. What's new is purely
additive: the panel-assignment fields on menu items, and the new
`adaire/mega-menu-item` block for FSE headers.

### The pre-existing `mega-menu-block`

This plugin already ships a different, older `mega-menu-block` /
`mega-menu-panel-block` pair that stores full menu content (items, images,
icons, banner copy) directly in block attributes. That block is
**untouched and continues to work exactly as before** — nothing here
deprecates, migrates, or removes it automatically, to avoid any risk of
block-validation errors or content loss on existing sites.

If you want to move an existing `mega-menu-block` instance to the new
centrally-managed model:

1. Create a new Mega Panel (**Mega Panels > Create Panel**) and rebuild the
   dropdown content there using the block editor.
2. Replace the old `mega-menu-block` in your page/template with a Core
   Navigation block containing an `adaire/mega-menu-item` block, pointed at
   the new panel.
3. Remove the old block once you've confirmed the new one renders
   correctly.

An automated migration tool (parsing existing `menuItems` attributes into
panels automatically) is not built yet — see
[Known limitations](#known-limitations).

## Hooks and filters available to developers

- `AdaireMegaPanelPostType::is_publicly_usable( $post_id )` — the single
  source of truth for "is this panel safe to show right now" (exists,
  correct post type, published, enabled). Use this instead of re-checking
  `post_status` yourself.
- `AdaireMegaMenuNavItemFields::get_assignment( $menu_item_id )` — reads a
  classic menu item's panel assignment and presentation settings in one
  call.
- The mega panel content passes through the standard `the_content` filter
  before rendering, so any filter that already modifies post content
  (embeds, shortcodes, etc.) applies to panel content too.
- The Core Navigation block-editor filter is namespaced
  `gutenblocks/add-mega-menu-to-navigation` (guarded so it's only added
  once even if block registration runs more than once).

## Capabilities

Every mutation (creating/editing/publishing/deleting a panel, toggling a
menu's enabled state, saving global settings, saving a menu item's panel
assignment) is gated on `manage_options` / `edit_theme_options`, matching
the capability model used everywhere else in Adaire Blocks today — there is
no plugin-specific capability yet. See
[Known limitations](#known-limitations) for finer-grained capabilities as a
follow-up.

## Known limitations

This is a deliberately-scoped first slice, not the full long-term feature.
Explicitly deferred, and safe to build later without breaking anything
here:

- **Classic-theme front-end rendering.** The panel-assignment fields on
  classic menu items are fully built and saved, but there is no
  `Walker_Nav_Menu` (or equivalent `wp_nav_menu()` filter) yet that actually
  renders the assigned panel on the front end of a classic theme. Until
  that's built, the fields are groundwork only.
- **Locations screen.** The dashboard has Menus, Mega Panels, and Settings
  tabs; a dedicated "where is this panel/menu used" Locations screen (with
  reference detection across templates, pages, and menu items) is not
  built.
- **Caching layer.** Panel content is rendered fresh on every request via
  `the_content`. There is no dedicated cache/invalidation layer yet — for
  most sites this is fine (WordPress object caching and page caching still
  apply normally), but a very large site with many high-traffic mega menus
  may want one.
- **Bulk actions** on the Menus/Mega Panels list tables (multi-select
  enable/disable/delete) are not implemented — only per-row actions.
- **Automated migration** from the existing `mega-menu-block`'s embedded
  content into new Mega Panels is a manual process today (see above), not
  an automated tool.
- **No automated test suite.** This repository has no PHPUnit or Jest
  setup at all (confirmed during investigation — no `phpunit.xml`,
  `tests/` directory, or `jest` config anywhere). Verification for this
  feature was manual code review, `php -l`, PHPCS, and a production build,
  not automated tests. Standing up a test harness is a prerequisite for
  real automated coverage and is a significant undertaking on its own.
- **Finer-grained capabilities.** Everything is gated on `manage_options`
  today, matching the rest of the plugin. Dedicated capabilities (e.g.
  distinguishing "can edit panels" from "can publish panels") are not
  defined.
