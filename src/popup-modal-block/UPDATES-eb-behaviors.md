# Popup Modal — Essential Blocks behavior update

Additive update to the **Popup Modal** block (`create-block/popup-modal-block`) that brings
in four behaviors from Essential Blocks' PopUp, while keeping every existing adaire feature
and staying proprietary (own class names + data-attribute/`view.js` model — no EB code copied).

## Behaviors added

1. **External selector click trigger** — open the modal when any element matching a CSS
   selector is clicked. Uses a delegated listener on `document`, so it also catches elements
   inserted after page load. Treated as a manual action: always opens, never frequency-gated.
2. **Auto-close after time** — automatically close the modal N seconds after it opens. A manual
   close cancels the pending timer.
3. **Stop embedded media on close** — pause `<video>`/`<audio>` and reset each `<iframe>` src so
   YouTube/Vimeo/etc. stop playing when the modal closes. Always-on (no setting).
4. **Cookie-based frequency with configurable expiry** — a new "Once every N days" frequency
   option backed by a real cookie with an author-set day expiry.

## Files changed

All under `src/popup-modal-block/`:

### `block.json`
New attributes:

| Attribute | Type | Default |
|---|---|---|
| `autoOpenClickSelector` | string | `""` |
| `autoCloseEnabled` | boolean | `false` |
| `autoCloseDelay` | number (seconds) | `5` |
| `frequencyDays` | number (days) | `7` |

New enum values:
- `autoOpen` → added `"element-click"`
- `showFrequency` → added `"once-per-n-days"`

### `save.js`
Emits new root data attributes:
- `data-click-selector` ← `autoOpenClickSelector`
- `data-auto-close` ← `autoCloseEnabled` (`"true"`/`"false"`)
- `data-auto-close-delay` ← `autoCloseDelay`
- `data-frequency-days` ← `frequencyDays`

### `edit.js`
- Mirrors the four new data attributes on the editor preview block props.
- **Auto-Open** panel: new dropdown option "Element click …" + conditional CSS-selector
  `TextControl` bound to `autoOpenClickSelector`.
- **Behavior** panel: "Auto-close after a delay" `ToggleControl` + conditional seconds
  `RangeControl` (1–60); new "Once every N days (cookie)" entry in `FREQUENCY_OPTIONS` +
  conditional days `RangeControl` (1–365) bound to `frequencyDays`.

### `view.js`
- Added `getCookie` / `setCookie` helpers; extended `shouldAutoOpen` / `markShown` with a
  `once-per-n-days` branch (cookie key `adaire-modal-shown-<id>`, expiry = `frequencyDays`).
  Existing localStorage/sessionStorage branches untouched.
- Added module-level `stopMedia(container)`; called inside `closeModal` on the content
  container (always-on).
- `openModal`: schedules `autoCloseTimer = setTimeout(closeModal, autoCloseDelay)` when
  `data-auto-close === "true"`; `closeModal` clears it so a manual/earlier close cancels it.
- Added an `element-click` trigger: delegated `document` click listener on
  `data-click-selector` that calls `openModal` (not frequency-gated).

## Build

Requires dependencies installed (`npm install`), then:

```
npm run build   # wp-scripts build --blocks-manifest → output in build/popup-modal-block/
```

WordPress loads the block from `build/popup-modal-block/`. After building:
- Reload the Gutenberg editor to pick up the new Inspector controls.
- Hard-refresh (Ctrl+F5) front-end pages — `view.js` version is unchanged (`0.1.0`), so the
  browser may otherwise serve a cached copy.

## Not yet done

- Runtime end-to-end verification on a live page (external click, auto-close, media-stop,
  cookie gating).
- Optional "hide built-in trigger button" mode for purely external-triggered modals (not
  implemented; the trigger `<button>` still renders in `element-click` mode).
