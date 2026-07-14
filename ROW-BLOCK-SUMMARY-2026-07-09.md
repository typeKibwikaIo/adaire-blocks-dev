# Row Block Changes — 2026-07-09

This summarizes only the work done on the Row block (`src/row-block`) in this session.

## What was wrong

Two issues were raised. First, a bug report: the Row block gave no way to add borders to individual columns. Second, a follow-up observation: the Row block's Inspector sidebar didn't follow the "Layout / Style / Advanced" tabbed convention used by other blocks in this plugin (such as Cookie Banner) — it used plain, flat panels instead, and the Row itself also had no border customization of its own (width, color, style, and so on).

## What was changed

The Row block's `edit.js` was restructured to use the plugin's shared `InspectorTabs` component instead of two separate flat panel groups. The existing "Width" panel was renamed to "Row Layout" and now also holds Vertical Alignment and Mobile Columns (previously split into a separate "Spacing & Alignment" panel); "Columns" stays as its own panel. Both of these remain in the Layout tab, since they're functional/positional settings rather than visual styling. "Gap Between Columns" was pulled into its own "Spacing" panel, and a new "Border" panel was added — both are titled so the Inspector's existing classification logic automatically moves them into the Style tab, matching how every other block in the plugin organizes its own styling controls.

The new Border panel gives the Row itself (the whole grid container, not the individual columns inside it) an "Enable Border" toggle, plus width, type (solid, dashed, dotted, double, or groove), color, and corner radius controls once enabled. Five new attributes were added to `block.json` to store these settings (`borderEnabled`, `borderWidth`, `borderStyle`, `borderColor`, `borderRadius`), and `save.js` was updated to render the same border styling on the published page that the editor shows.

The border styling only gets applied to the page when "Enable Border" is switched on. Since that toggle defaults to off, every Row block already published before this change keeps rendering exactly as it did before — nothing changes retroactively, and no compatibility fix was needed for existing content.

## Verification

`block.json` was checked for valid JSON, and both `edit.js` and `save.js` were checked with the same parser Babel uses to confirm there are no syntax errors. Beyond that, an isolated test build was run — a real webpack build using just the Row block and its shared dependencies — which compiled successfully and confirmed the new Inspector tabs, the "Row Layout" panel, and the Border controls all appear correctly in the compiled output.

## What still needs to happen on your end

The Row block ships in the Free tier alongside roughly 40 other blocks, and a full Free-tier build could not be completed inside this sandbox (it reliably takes longer than the sandbox allows per command). The change is saved in the plugin's source, so running your normal Free-tier build and deploy process will pick it up automatically — no new zip has been generated from this session.

(Note: the Column block, which lives inside Row, received matching changes in the same session — its own Border panel plus a Background Color control — since the two blocks share the same Inspector conventions. Let me know if you'd like a separate write-up of just that part.)
