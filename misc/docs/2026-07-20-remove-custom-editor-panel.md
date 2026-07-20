# Adaire Blocks — Removal of the Custom "Adaire Blocks" Editor Panel

**Date:** 2026-07-20
**Scope:** the custom "Adaire Blocks" sidebar overlay (`src/editor-panel/`) — investigation of two related bugs, the decision to remove it, and the removal itself (including a merge regression that briefly reintroduced part of it).

## Background

The plugin shipped a fully custom "Elementor-style" settings panel (`src/editor-panel/EditorPanel.jsx`) that replaced WordPress's native Block/Document settings sidebar. It was a **separate React root**, mounted via `createRoot` into a `<div id="adaire-ep-wrapper">` appended directly to `document.body` — outside WordPress's own component tree — and it CSS-hid the native sidebar (`.interface-interface-skeleton__sidebar { display: none !important; }`) to make room for itself. It auto-generated "General" / "Advanced" tabs by reading each selected block's attribute schema directly, bypassing `InspectorControls` entirely.

Separately, 38 of the plugin's blocks already had a **second, independent settings UI** for the same attributes: `<InspectorTabs>` (`src/components/InspectorTabs.js`), a wrapper around WordPress's native `<InspectorControls>` that renders a native "Content / Layout / Style" tabbed panel into the standard sidebar. So for those 38 blocks, two complete settings UIs existed at once — one visible (the custom overlay), one hidden behind it (the native one).

## Bug 1 — panel stuck open, ignoring the sidebar toggle

**Symptom:** the custom panel was always visible, didn't open/close with the native settings-toggle button (the icon next to Publish), and showed "Select a block to edit" even with nothing selected.

**Root cause:** `EditorPanel.jsx` never read WordPress's sidebar-open state at all — it rendered unconditionally, with its own `useState` "collapsed" flag wired only to its own internal button.

**Fix applied at the time:** wired the panel's visibility to `core/edit-post`'s `isEditorSidebarOpened()` selector (with a `core/edit-site` fallback for the site editor), so it opened/closed in sync with the real toggle button, and removed the separate "collapsed" state in favor of a real open/close tied to the same store.

## Bug 2 — panel randomly disappears, native sidebar "takes over"

**Symptom:** after the fix above, interacting with a block's settings would sometimes make the custom panel vanish and the native Block/Document sidebar show through instead, unpredictably.

**Root cause, verified against the installed WordPress core bundle** (`wp-includes/js/dist/edit-post.js`, `editor.js`):

- `isEditorSidebarOpened()` reads `core/interface`'s **shared** `"core"`-scoped complementary area:
  ```js
  isEditorSidebarOpened = createRegistrySelector(select => () =>
    ["edit-post/document", "edit-post/block"].includes(
      select(interfaceStore).getActiveComplementaryArea("core")
    )
  );
  ```
- That same `"core"` scope is used by **every** `PluginSidebar` in this WP version (default `scope: "core"`), by WP's own command-palette "Show/hide Settings panel" commands, by the `Ctrl+Shift+,` shortcut, and by WP's native block-selection → tab-switch behavior (`useAutoSwitchEditorSidebars`, `editor.js:64187`).
- The native sidebar DOM container (`.interface-interface-skeleton__sidebar`) is **not actually removed** when "closed" — it stays mounted (via `InterfaceSkeleton`, `editor.js:19598`) whenever the editor isn't in preview/distraction-free mode, populated by a `<Slot scope="core">`. Adaire's CSS was the *only* thing keeping the real, fully-built `InspectorTabs` content inside it from showing.
- **Concrete proof this was live, not just theoretical:** `src/saas-hero-block/edit.js` had a leftover effect calling `openGeneralSidebar('edit-post/block')` on every block selection — directly writing to that same shared store, independent of Adaire's own toggle logic.

**Conclusion:** this was the *same* root cause as Bug 1, one step further along — Adaire's visibility was reverse-engineered from a WordPress-internal, multi-writer piece of state that a full duplicate native settings UI (`InspectorTabs`, 38 blocks) was always sitting behind, ready to show through the instant that shared state didn't match Adaire's narrow two-value check.

## Decision

Two options were on the table:
- **Option A:** keep the custom panel, strip `InspectorTabs`/`InspectorControls` out of the 38 blocks.
- **Option B (chosen):** remove the custom panel entirely and let the native `InspectorTabs`-based settings UI be the only one, using WordPress's real extension points end-to-end.

Option B was chosen to eliminate the shared-state problem structurally rather than keep patching which values are "recognized."

## What was removed

- `src/editor-panel/` — the entire custom overlay (`EditorPanel.jsx`, `index.js`, `style.scss`) and its build output (`build/editor-panel/`)
- `adaire_enqueue_editor_panel()` and its `enqueue_block_editor_assets` hook in `adaire-blocks.php`
- The `editor-panel/index` webpack entry (and the now-pointless `entry` override + unused `path` import) in `webpack.config.js`
- The `import "./editor-panel"` line in `src/index.js`
- The vestigial `openGeneralSidebar('edit-post/block')` effect in `src/saas-hero-block/edit.js`, plus its now-unused `useEffect`/`useDispatch` imports and `clientId` prop

`src/components/InspectorTabs.js` and its 38 block consumers were left untouched — that's now the sole settings UI.

## Merge regression (and re-fix)

After the initial removal was committed (`cb77660 Remove custom editor panel feature`), a subsequent merge from an upstream branch (`typeKibwikaIo/adaire-blocks`, merge commit `a0473f4`) reintroduced `adaire_enqueue_editor_panel()` into `adaire-blocks.php`, because upstream's copy of the file predated the removal and the merge's conflict resolution kept upstream's version of that hunk. The JS/build files it pointed to were still gone, so this was inert dead code rather than a functional regression, but it needed cleaning up.

A full re-audit (`editor-panel`, `EditorPanel`, `adaire-ep*` CSS classes, `adaire_enqueue_editor_panel`, `#adaire-ep-wrapper`, `Blockstudio-style`/`Elementor-style editor panel`) across the whole plugin — excluding `node_modules` and the generated `.temp-zip-content` staging mirror — found this was the *only* place the merge had reintroduced anything. `src/editor-panel/`, `build/editor-panel/`, `webpack.config.js`, `src/index.js`, and `src/saas-hero-block/edit.js` were all still clean. The resurrected function was removed again.

## Verification

- `php -l adaire-blocks.php` — no syntax errors
- `npm run build` — exit code 0, no new errors (only pre-existing Sass `@import` deprecation warnings unrelated to this change)
- `build/editor-panel/` does not regenerate
- Plugin-wide search for every known trace of the custom panel returns no real matches (only an unrelated, coincidentally-named `.pc-comparison--editor-panel` CSS class in `pricing-comparison-block`)

**To verify live:** reload the block editor — there is no fixed custom panel on the right anymore. Selecting a block shows WordPress's native "Block" tab (Content/Layout/Style, via `InspectorTabs`) in the standard sidebar, and the settings-toggle button next to Publish opens/closes it like any other native Gutenberg sidebar, with no flicker or takeover behavior since there is only one settings UI now.
