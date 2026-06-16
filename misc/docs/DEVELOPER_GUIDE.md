# GutenBlocks Blocks: Developer Guide

> **Audience:** New developers onboarding to this repo.  

> **Covers:** Repository structure, creating a block, building the plugin, the free-version build, and the icon system.

> **Repository Link:** https://gitlab-onprem01.adaire.dev/adaire-blocks/adaire-blocks-dev/

---

## Table of Contents

1. [Repository Overview](#1-repository-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Creating a New Block](#3-creating-a-new-block)
4. [Building the Plugin](#4-building-the-plugin)
5. [The Free Version Build](#5-the-free-version-build)
   - [5.1 The scaffold](#51-the-scaffold-free-version-scaffold)
   - [5.2 What gets included (blocks)](#52-what-gets-included-blocks)
   - [5.3 How the script assembles the free version](#53-how-the-script-assembles-the-free-version)
   - [5.4 File precedence](#54-file-precedence)
   - [5.5 Adding a feature exclusive to the free version](#55-adding-a-feature-exclusive-to-the-free-version)
   - [5.6 Updating the WordPress.org listing](#56-updating-the-wordpressorg-listing)
   - [5.7 SendGrid / deactivation feedback](#57-sendgrid--deactivation-feedback)
   - [5.8 Running the free build](#58-running-the-free-build)
6. [The Icon System](#6-the-icon-system)
7. [Key Config Files](#7-key-config-files)
8. [Registering Blocks in PHP](#8-registering-blocks-in-php)

---

## 1. Repository Overview

```
adaire-blocks-dev/
├── src/                        ← Block source files (one folder per block)
│   ├── accordion-block/
│   ├── pricing-table-block/
│   ├── …
│   ├── components/             ← Shared React components
│   ├── icons/                  ← React icon components (auto-generated)
│   │   ├── accordion.js
│   │   ├── pricing-table.js
│   │   ├── …
│   │   ├── index.js            ← Named re-exports (for editor use)
│   │   └── new-icons/          ← Raw SVG source files (organised by tier)
│   │       ├── Free Blocks/
│   │       ├── Plus Blocks/
│   │       ├── Premium Blocks/
│   │       ├── newer-icons/
│   │       └── part5/
│   └── index.js                ← Root entry: imports all blocks
├── free-version-scaffold/      ← Template for the free version (see Section 5)
│   ├── adaire-blocks.php       ← Free version main plugin file
│   ├── readme.txt              ← WordPress.org listing (edit here)
│   ├── admin/                  ← Free-version admin files (deactivation modal etc.)
│   ├── includes/               ← Free-version PHP helpers (sendgrid.php etc.)
│   ├── docs/                   ← SendGrid setup guide
│   └── SCAFFOLD-README.md      ← Quick reference (not copied to output)
├── config/
│   ├── block-icon-mapping.json ← SINGLE source of truth for icons
│   └── blocks-config.json      ← Enables/disables blocks per tier
├── scripts/
│   ├── apply-new-icons.js      ← SVG → React icon component
│   ├── update-block-icons.js   ← React component → block.json "icon" field
│   ├── update-block-index-icons.js  ← Patches index.js icon imports
│   ├── generate-free-version.js    ← Builds the free plugin distribution
│   └── update-block-categories.js
├── build/                      ← Compiled output (git-ignored, created by build)
├── admin/                      ← Plugin settings/licensing UI (PHP + assets)
├── includes/                   ← PHP helper classes (config, license, validation)
├── misc/                       ← Developer documentation, templates, releases
│   ├── block-template/         ← Starter files for a new block
│   └── docs/                   ← This documentation lives here
├── adaire-blocks.php           ← Main plugin file (registration, PHP hooks)
└── package.json
```

### Block tiers

| Category slug | Description |
|---|---|
| `adaire-blocks-free` | Included in both free and premium versions |
| `adaire-blocks-plus` | Premium only (requires license) |
| `adaire-blocks-premium` | Premium only (requires license) |

---

## 2. Prerequisites & Setup

```bash
# Install Node dependencies
npm install

# Start development watcher (rebuilds on file save)
npm run start

# One-off production build
npm run build
```

**Node toolchain**: `@wordpress/scripts` drives everything: no custom Webpack config is needed. The `--blocks-manifest` flag tells the tool to generate `build/blocks-manifest.php`, which PHP uses to register blocks.

---

## 3. Creating a New Block

### 3.1 Create the source folder

Every block lives at `src/{block-name}-block/`. All names must end in `-block`.

```
src/my-new-block/
├── block.json          ← Block metadata (attributes, category, assets)
├── index.js            ← Entry point: registerBlockType()
├── edit.js             ← Editor component (what appears in Gutenberg)
├── save.js             ← Frontend serialisation function
├── style.scss          ← Styles loaded on both frontend and editor
├── editor.scss         ← Editor-only styles (loaded only inside Gutenberg)
└── view.js             ← (optional) Frontend JS for interactive blocks
```

Starter files are in `misc/block-template/`: copy and rename them.

---

### 3.2 `block.json`

This is the block's manifest. The key fields:

```json
{
    "apiVersion": 3,
    "name": "create-block/my-new-block",
    "title": "My New Block (Free)",
    "description": "Short description shown in the block inserter.",
    "category": "adaire-blocks-free",
    "icon": "",
    "keywords": ["my", "new", "block"],
    "version": "1.0.0",
    "editorScript": "file:./index.js",
    "editorStyle": "file:./editor.css",
    "style": "file:./style-index.css",
    "viewScript": "file:./view.js",
    "attributes": {
        "myAttribute": {
            "type": "string",
            "default": "Hello"
        }
    },
    "supports": {
        "html": false
    }
}
```

> **`"icon"` field**: Leave this as an empty string. The icon is injected automatically by `scripts/update-block-icons.js` during the build: do not edit it manually. See [Section 6](#6-the-icon-system) for how to set the icon.

> **`"category"`**: Use `adaire-blocks-free` for blocks that should appear in the free version. Use `adaire-blocks-plus` or `adaire-blocks-premium` for blocks requiring a license.

---

### 3.3 `index.js`

The entry point that registers the block with WordPress:

```javascript
import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";
import MyNewBlockIcon from "../icons/my-new";  // ← see Section 6

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: MyNewBlockIcon,
});
```

---

### 3.4 `edit.js`

The editor component. It receives `attributes` and `setAttributes` as props and renders what the editor user sees.

```javascript
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
    const { myAttribute } = attributes;
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title="Settings">
                    <TextControl
                        label="My Attribute"
                        value={myAttribute}
                        onChange={(value) => setAttributes({ myAttribute: value })}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <p>{myAttribute}</p>
            </div>
        </>
    );
}
```

**Responsive controls pattern**: Most blocks in this repo support Desktop / Tablet / Mobile breakpoints. They store device-specific values as objects:

```json
"mySize": {
    "type": "object",
    "default": { "desktop": 16, "tablet": 14, "mobile": 12 }
}
```

And pass them to the DOM as CSS custom properties via `blockProps.style`:

```javascript
style: {
    "--my-size": `${mySize?.desktop ?? 16}px`,
    "--my-size-tablet": `${mySize?.tablet ?? 14}px`,
    "--my-size-mobile": `${mySize?.mobile ?? 12}px`,
}
```

See `misc/docs/BREAKPOINTS.md` for the breakpoint values.

---

### 3.5 `save.js`

The save function serialises the block's attributes into static HTML that is stored in the WordPress database. It must be a **pure function**: the same attributes must always produce the same HTML, or WordPress will throw a "block validation" error.

```javascript
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
    const { myAttribute } = attributes;
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <p>{myAttribute}</p>
        </div>
    );
}
```

> **Important**: If you change the HTML structure in `save.js` after blocks have already been saved to the database, you must write a **block deprecation** to handle the old markup. See the [WordPress deprecations docs](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/).

---

### 3.6 `style.scss` and `editor.scss`

- **`style.scss`**: loaded on both the frontend and inside the Gutenberg editor. Put rules that affect the rendered output here.
- **`editor.scss`**: loaded only inside the Gutenberg editor. Use this for sidebar/panel UI styles, editor-only layout overrides, etc.

```scss
// style.scss
.wp-block-create-block-my-new-block {
    // Responsive via CSS custom properties set in edit.js / save.js
    font-size: var(--my-size, 16px);

    @media (max-width: 1024px) {
        font-size: var(--my-size-tablet, 14px);
    }

    @media (max-width: 768px) {
        font-size: var(--my-size-mobile, 12px);
    }
}
```

See `misc/docs/misc/EDITOR_SCSS_GUIDE.md` for naming conventions.

---

### 3.7 `view.js` (optional)

For blocks with frontend interactivity (toggles, carousels, animations), add a `view.js`. It runs after the DOM is ready:

```javascript
document.addEventListener("DOMContentLoaded", () => {
    const blocks = document.querySelectorAll(".my-new-block");
    blocks.forEach((block) => {
        // your interactive code
    });
});
```

Reference it in `block.json` as `"viewScript": "file:./view.js"`.

---

### 3.8 Add the block to `src/index.js`

Open `src/index.js` and import your new block:

```javascript
import "./my-new-block";
```

---

### 3.9 Register the block in `config/blocks-config.json`

Add an entry under the appropriate tier (`free`, or any premium tier the file uses). This controls whether the block appears in the admin settings panel and whether it is included in the free-version build.

```json
"my-new-block": {
    "enabled": true,
    "upgradeMessage": "Upgrade to Premium for advanced features."
}
```

---

### 3.10 Add the icon (required)

Follow the steps in [Section 6: The Icon System](#6-the-icon-system).

---

## 4. Building the Plugin

### Available commands

| Command | What it does |
|---|---|
| `npm run start` | Starts the dev watcher: rebuilds on every file save |
| `npm run build` | Full production build (runs `prebuild` first, then compiles) |
| `npm run build:free` | Generates the free-only plugin in `../adaire-blocks-free/` |
| `npm run plugin-zip` | Creates a distributable `.zip` of the built plugin |
| `npm run deploy:free` | Runs `build:free` then `plugin-zip` in one step |

### What happens during `npm run build`

1. **`prebuild`** runs automatically first:
   - `node scripts/apply-new-icons.js`: reads `config/block-icon-mapping.json`, finds each block's SVG in `src/icons/new-icons/`, and writes/overwrites the corresponding React component in `src/icons/`.
   - `node scripts/update-block-icons.js`: reads each `src/icons/*.js` component, extracts the raw `<svg>` string, and writes it into the `"icon"` field of the matching `block.json`.
2. **`wp-scripts build --blocks-manifest`** compiles every block in `src/` into `build/` and produces `build/blocks-manifest.php`.

### Build output

```
build/
├── blocks-manifest.php     ← PHP array used by adaire-blocks.php to register all blocks
├── my-new-block/
│   ├── index.js            ← Compiled editor script
│   ├── index.asset.php     ← Script dependencies/version hash
│   ├── style-index.css     ← Frontend + editor styles
│   ├── editor.css          ← Editor-only styles
│   └── view.js             ← Frontend interactive script (if present)
└── …
```

---

## 5. The Free Version Build

The free version is a separate, self-contained distribution of the plugin. It is generated by `scripts/generate-free-version.js` and written to `../adaire-blocks-free/` (a sibling of this repo folder).

The key design principle: **the script never generates anything from scratch**. It combines two sources:

| Source | What it contributes |
|--------|-------------------|
| `free-version-scaffold/` | Every non-block file: plugin bootstrap, readme, admin UI, deactivation modal, SendGrid integration, settings page, CSS/JS assets |
| `src/` (this repo) | Only the free-eligible block source folders, shared components, and icons |

If you want to change anything about the free version: other than which blocks are included: you edit the scaffold. You do not touch the script.

---

### 5.1 The scaffold (`free-version-scaffold/`)

The scaffold is a versioned template that lives inside this repo. It was seeded from the last clean WordPress.org-compliant release tag and is kept up to date manually.

```
free-version-scaffold/
├── adaire-blocks.php           ← Free version plugin bootstrap
│                                  (no update checker, no license/activation code)
├── readme.txt                  ← WordPress.org listing: edit this freely
├── .gitignore
├── admin/
│   ├── settings-page.php       ← Settings page (sanitized for free use)
│   ├── block-migration.php
│   ├── deactivation-modal.php  ← Feedback modal shown on plugin deactivation
│   ├── deactivation-log-page.php ← Tools → GutenBlocks Deactivation Logs (SendGrid test)
│   ├── css/
│   │   ├── deactivation-modal.css
│   │   └── … (other admin styles)
│   └── js/
│       ├── deactivation-modal.js
│       └── … (other admin scripts)
├── includes/
│   ├── class-adaire-blocks-config.php
│   └── sendgrid.php            ← SendGrid API wrapper for deactivation feedback
└── docs/
    └── sendgrid-setup.md       ← How to configure SendGrid
```

> The file `SCAFFOLD-README.md` inside the scaffold is a developer quick-reference. It is **not** copied into the generated free version.

---

### 5.2 What gets included (blocks)

Only blocks that satisfy **both** conditions are included in the free build:

1. `"category": "adaire-blocks-free"` in the block's `block.json`
2. The block key is listed under `"free"` in `config/blocks-config.json` with `"enabled": true`

If either condition is missing the block is silently excluded.

---

### 5.3 How the script assembles the free version

```
scripts/generate-free-version.js
│
├── 1. Wipes ../adaire-blocks-free/ and recreates it clean
│
├── 2. Copies everything from free-version-scaffold/ into the output
│      └── Patches the plugin version in adaire-blocks.php
│          (reads the version from this repo's adaire-blocks.php)
│
├── 3. Copies free-eligible block source folders from src/
│      ├── Copies src/components/ and src/icons/
│      └── Copies src/index.js (then rewrites it: see step 5)
│
├── 4. Copies shared files from this repo (always overwrites scaffold versions)
│      ├── config/blocks-config.json   ← always from dev plugin (stays current)
│      ├── config/block-icon-mapping.json
│      └── scripts/
│
├── 5. Sanitizes admin/settings-page.php
│      └── Removes upgrade prompts, license checks, premium badges
│
├── 6. Generates package.json (version from this repo, scripts from template)
│
├── 7. Rewrites src/index.js to import only the free-eligible blocks
│
└── 8. Inside ../adaire-blocks-free/ runs:
       npm install → npm run prebuild → npm run build
```

---

### 5.4 File precedence

When the same file exists in both the scaffold and this repo, the scaffold always wins: **except** for `config/` files, which are always overwritten by the dev plugin's version to stay current.

| File | Comes from |
|------|-----------|
| `adaire-blocks.php` | Scaffold (version patched from dev plugin) |
| `readme.txt` | Scaffold |
| `admin/deactivation-modal.php` | Scaffold |
| `admin/deactivation-log-page.php` | Scaffold |
| `admin/css/deactivation-modal.css` | Scaffold |
| `admin/js/deactivation-modal.js` | Scaffold |
| `includes/sendgrid.php` | Scaffold |
| `admin/settings-page.php` | Scaffold (then sanitized) |
| `admin/block-migration.php` | Scaffold |
| `admin/css/*` (other) | Scaffold |
| `admin/js/*` (other) | Scaffold |
| `config/blocks-config.json` | **Dev plugin** (always overwritten) |
| `config/block-icon-mapping.json` | **Dev plugin** (always overwritten) |
| `scripts/` | **Dev plugin** |
| `src/` (blocks) | **Dev plugin** (free blocks only) |
| `package.json` | Generated by script |

---

### 5.5 Adding a feature exclusive to the free version

If you need to add or change something that should only exist in the free version (a new admin page, a behaviour change, a UI tweak, a new PHP helper) the workflow is:

1. **Make your changes inside `free-version-scaffold/`**: not in the main plugin source.
2. Edit whichever files are relevant (e.g. `admin/deactivation-modal.php`, `adaire-blocks.php`, `readme.txt`).
3. Run the generator to produce an updated free build:

```bash
npm run build:free
```

The generated plugin at `../adaire-blocks-free/` will contain your changes alongside the current free blocks.

> **Never edit the generator script** (`scripts/generate-free-version.js`) to hardcode content. All content belongs in the scaffold files.

---

### 5.6 Updating the WordPress.org listing

Edit `free-version-scaffold/readme.txt` directly. This is the only file WordPress.org reads for the plugin description, changelog, FAQ, and screenshots. No script needs to run: just edit and commit.

---

### 5.7 SendGrid / deactivation feedback

When a user deactivates the plugin in WordPress, a feedback modal appears and the response is emailed via SendGrid. The implementation lives entirely in the scaffold:

- `admin/deactivation-modal.php`: modal UI + AJAX handler
- `admin/js/deactivation-modal.js`: intercepts the deactivation link, shows modal
- `admin/css/deactivation-modal.css`: modal styles
- `includes/sendgrid.php`: `adaire_blocks_send_via_sendgrid()` wrapper
- `admin/deactivation-log-page.php`: Tools → GutenBlocks Deactivation Logs (for testing)

To change the feedback recipient email, edit `admin/deactivation-modal.php` line 9:

```php
private const DEFAULT_FEEDBACK_EMAIL = 'your@email.com';
```

Or set it in `wp-config.php` to keep it out of version control:

```php
define('ADAIRE_FEEDBACK_EMAIL', 'your@email.com');
define('ADAIRE_SENDGRID_API_KEY', 'your_key_here');
```

See `free-version-scaffold/docs/sendgrid-setup.md` for the full setup guide.

---

### 5.8 Running the free build

```bash
npm run build:free
```

The output is a fully built, standalone plugin at `../adaire-blocks-free/`.

To also produce a distributable zip:

```bash
npm run deploy:free
```

---

## 6. The Icon System

Block icons are managed through an automated pipeline. **Never edit the `"icon"` field in `block.json` manually**: it is overwritten on every build.

### The source of truth: `config/block-icon-mapping.json`

This single file controls everything about icons. Each entry maps a block to its icon component and the SVG source file:

```json
{
    "blockIconMap": {
        "my-new-block": { "component": "my-new", "svg": "Free Blocks/my-new-block.svg" }
    }
}
```

| Field | Description |
|---|---|
| key | The block folder name (must match `src/{key}/`) |
| `component` | Name of the React icon file to create/update in `src/icons/` (without `.js`) |
| `svg` | Path to the source SVG, relative to `src/icons/new-icons/` |

Blocks that **share** an icon (e.g. sub-blocks like `accordion-item-block`) omit `svg`: the pipeline finds the SVG via the sibling block that has one:

```json
"accordion-block":      { "component": "accordion", "svg": "Free Blocks/accordion-block.svg" },
"accordion-item-block": { "component": "accordion" }
```

### The pipeline (runs automatically on every build)

```
config/block-icon-mapping.json
        │
        ▼
scripts/apply-new-icons.js
  Reads each entry, loads the SVG from src/icons/new-icons/,
  converts embedded <style> blocks to inline attributes
  (so WordPress sanitizers don't strip them),
  writes/overwrites src/icons/{component}.js
        │
        ▼
src/icons/{component}.js  (React component with dangerouslySetInnerHTML)
        │
        ▼
scripts/update-block-icons.js
  Extracts the <svg> string from each .js file,
  writes it into the "icon" field of the matching block.json
        │
        ▼
src/{block}/block.json  →  "icon": "<svg>...</svg>"
```

### Adding an icon for a new block

**Step 1: Add the SVG to `src/icons/new-icons/`**

Place your `.svg` file in the appropriate tier folder:

```
src/icons/new-icons/
├── Free Blocks/          ← for adaire-blocks-free category blocks
├── Plus Blocks/          ← for adaire-blocks-plus category blocks
└── Premium Blocks/       ← for adaire-blocks-premium category blocks
```

SVG requirements:
- `width="24" height="24" viewBox="0 0 24 24"`
- Self-contained (no external references)
- If using a `<style>` block, the pipeline converts classes to inline attributes automatically

**Step 2: Add an entry to `config/block-icon-mapping.json`**

```json
"my-new-block": { "component": "my-new", "svg": "Free Blocks/my-new-block.svg" }
```

**Step 3: Import the icon in `index.js`**

```javascript
import MyNewIcon from "../icons/my-new";

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: MyNewIcon,
});
```

**Step 4: Build**

```bash
npm run build
```

The pipeline will:
- Create `src/icons/my-new.js` from your SVG
- Write the SVG into `src/my-new-block/block.json`

### Updating an existing block's icon

1. Replace (or add) the `.svg` file in `src/icons/new-icons/[Tier]/`
2. Ensure `block-icon-mapping.json` points to the correct path
3. Run `npm run build`

To run the icon pipeline in isolation (without a full build):

```bash
node scripts/apply-new-icons.js
node scripts/update-block-icons.js
```

### SVG folder layout

```
src/icons/new-icons/
├── Free Blocks/             ← SVGs for free-tier blocks
├── Plus Blocks/             ← SVGs for plus-tier blocks
├── Premium Blocks/          ← SVGs for premium-tier blocks
├── newer-icons/             ← Updated icon revisions
└── part5/                   ← Additional icon set (layout/structural blocks)
```

> **Do not edit `src/icons/*.js` files directly.** They are overwritten by `apply-new-icons.js` on every build. All changes must go through the SVG source file and `block-icon-mapping.json`.

---

## 7. Key Config Files

### `config/block-icon-mapping.json`

Single source of truth for which SVG maps to which block icon component. See [Section 6](#6-the-icon-system) for full details.

### `config/blocks-config.json`

Controls which blocks are enabled in the admin settings panel and which are included in the free distribution.

```json
{
    "free": {
        "accordion-block": {
            "enabled": true,
            "upgradeMessage": "Go pro to add more accordion items."
        }
    }
}
```

- `"enabled": true`: the block is active by default.
- `"upgradeMessage"`: shown in the admin when a user is on the free plan.

Blocks not listed here are still registered, but they won't appear in the admin toggle list or the free build.

---

## 8. Registering Blocks in PHP

`adaire-blocks.php` registers all blocks on the WordPress `init` hook. It:

1. Checks whether a license is active (`AdaireBlocksLicense::get_instance()->is_license_active()`).
2. Reads `blocks-config.json` via `AdaireBlocksConfig` to get the enabled/disabled state of each block.
3. On WordPress 6.8+, uses `wp_register_block_types_from_metadata_collection()` with the generated `build/blocks-manifest.php`.
4. For older WordPress versions, falls back to calling `register_block_type()` per block.
5. Skips **premium blocks** if no active license is found.
6. For **dynamic blocks** (`counter-block`, `mega-menu-block`) that require a PHP render callback, passes the callback explicitly:

```php
register_block_type( $block_path, [
    'render_callback' => 'render_counter_block'
] );
```

If you create a **dynamic block** (one where the frontend HTML is generated by PHP rather than stored in the database), you must:

1. Set `"render": "file:./render.php"` in `block.json`, **or**
2. Pass a `render_callback` function in `adaire-blocks.php`.

Static blocks (where `save.js` produces the HTML) need no changes to the PHP file: they are picked up automatically from `blocks-manifest.php`.

---

## Quick-start checklist for a new block

```
□  Create src/my-new-block/ with all required files
□  Set "category" in block.json (free vs premium)
□  Import block in src/index.js
□  Add entry to config/blocks-config.json
□  Add SVG to src/icons/new-icons/[Tier]/
□  Add entry to config/block-icon-mapping.json
□  Import icon in src/my-new-block/index.js
□  Run: npm run build
□  Verify the block appears in the Gutenberg inserter
```
