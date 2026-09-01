# Adaire Blocks — Activation, Admin Menu & Update Mechanism Audit

**Scope:** `adaire-blocks.php` (main plugin file), everything under `admin/` and `includes/`, and the bundled `plugin-update-checker` (Yahnis Elsts PUC v5.6) library, as connected in `adaire-blocks/`.

**Method:** Full manual read of every file that registers a hook, a menu page, an option, a transient, or makes a network/DB call. In addition, I built a disposable WordPress function-stub harness (PHP, no real WP install) that `require`s the real `adaire-blocks.php` and every file it loads, then fires hooks in the exact order WordPress does — file load → activation hooks → `admin_init` → `admin_menu` — and records every `add_menu_page()`/`add_submenu_page()` call, hook registration order, and any PHP exception along the way. This let me verify claims about hook timing and menu structure against actual execution rather than by inspection alone. `php -l` was run on every changed file.

---

## 1. Root Cause

There are two separate issues bundled into the reported symptom, and the evidence points to different mechanisms for each.

**Admin-menu registration itself is not broken.** The harness traced a full `admin_menu` firing end-to-end and the parent menu (`adaire-blocks-settings`) plus all six submenus registered correctly, every time, with no duplicates and no missing entries. The `class_exists( 'Adaire_Welcome_Screen' )` branching between `admin/settings-page.php` and `admin/welcome-screen.php` (which exists specifically so the free and pro plugins don't both call `add_menu_page()` for the same slug when active together) resolves correctly because PHP class declarations happen at file-*load* time, before any hook fires — so by the time `admin_menu` runs, the branch decision is already fixed and consistent. I could not reproduce a code path where the top-level menu fails to register in a single, well-formed request.

**What *does* explain "doesn't show/doesn't update until a manual refresh": stale plugin state that nothing in the code was clearing.** Two independent lines of evidence point here:

- The repo is set up for **file-level deployment** (a `.git` working copy inside the plugin folder itself, a `plugin-zips/` directory, and files like `.mount-sync-test.txt`/`test_write_check.txt` that only make sense if files land on the server by direct copy/sync rather than through WordPress's own upgrade UI). When plugin files change this way, **`upgrader_process_complete` never fires** — that hook is only dispatched by WordPress's own `Plugin_Upgrader`. Nothing else in WordPress core watches the filesystem, so several caches keep serving the old state indefinitely:
  - `get_plugins()`'s cached plugin list/version (`wp_cache_get( 'plugins', 'plugins' )`) — persists across requests on any site with a persistent object cache (Redis/Memcached, common on managed hosts) until `wp_clean_plugins_cache()` is called.
  - The `update_plugins` site transient (drives the "update available" nag).
  - The Plugin Update Checker library's own saved state (`adaire-blocks` update-checker option) — it only re-evaluates against the JSON feed at its own interval or when explicitly reset.
  - **PHP OPcache.** If the host runs with `opcache.validate_timestamps` off, or a non-trivial `opcache.revalidate_freq`, PHP keeps *executing the compiled bytecode of the old files* after a raw file replacement. This is the most direct explanation for the admin-menu symptom specifically: the request that happens to be the one where OPcache finally notices the files changed is the one that runs fresh code (and correctly builds the menu); every request before that runs old bytecode. That "sometimes needs a refresh" is exactly what re-validation lag looks like from the outside, and it's indistinguishable from "the menu is broken" without knowing to look at OPcache.

- Independently, and provably from the code itself: **`admin/settings-page.php` registered its admin JS with a hardcoded version string (`'1.0.0'`)** instead of the live plugin version used everywhere else on that same page (CSS on the same page correctly used `$plugin_version`). Every browser that had ever loaded the admin screen keeps serving its cached copy of `admin-settings.js` after an update, because the `?ver=1.0.0` query string never changes. This doesn't explain the *menu* symptom, but it is a second, concrete "doesn't reflect the update until you force a refresh" bug in the same area, and squarely inside what this audit asked for ("Asset loading for each admin page").

Nothing in the activation hooks, hook-priority ordering, or capability checks was found to *conditionally skip* menu registration. No duplicate `add_menu_page()` calls exist for the same slug under any active/inactive combination I could construct. The fixes below target the proven mechanism (stale cross-request state) rather than papering over the symptom with a forced reload.

---

## 2. Files Changed

| File | Change |
|---|---|
| `adaire-blocks.php` | Added a "Stale Plugin/Update State Guard" (new function `adaire_blocks_maybe_bust_stale_caches()`, hooked at `admin_init` priority `0`). Consolidated the standalone "Version Rollback" update-check (which ran its own `wp_remote_get()` against the same JSON feed PUC already polls) to read PUC's own cached state instead. |
| `includes/class-adaire-blocks-license.php` | License DB table creation (`dbDelta()`) no longer runs on every `admin_init`; it's now gated behind a stored schema-version option, matching the pattern already used correctly by the cookie-consent-log and cookie-scanner tables elsewhere in the plugin. |
| `admin/settings-page.php` | Fixed hardcoded `'1.0.0'` script version to use the live `$plugin_version`, matching the CSS registrations on the same page. |

No block registration, template, or REST files were touched. No settings/options schema changed in a way that affects existing stored data.

---

## 3. Changes Made (detail)

### 3.1 Stale Plugin/Update State Guard (`adaire-blocks.php`)

A new function runs on `admin_init` at priority `0` — earlier than every other Adaire Blocks `admin_init` callback (PUC's own scheduler, the settings/license/registry sync, and the welcome-screen redirect all run at the default priority `10`), and well before `admin_menu` builds the sidebar. On every normal page load it does one cheap `get_option()` compare and returns. The very first time it sees the on-disk `ADAIRE_BLOCKS_VERSION` differ from the version it last recorded (true for a fresh activation, a normal WP-driven update, *or* an out-of-band file sync/git pull), it:

1. Calls `wp_clean_plugins_cache( true )` — clears WordPress's own cached plugin list/version and the `update_plugins` transient.
2. Deletes the plugin's own legacy `adaire-blocks_latest_version` transient.
3. Calls the Plugin Update Checker instance's `resetUpdateState()` — its documented API for "the update cache should be considered gone."
4. Calls `opcache_reset()` if the extension is loaded, so a raw file replacement can't leave PHP executing old bytecode.
5. Records the new version so subsequent requests take the cheap early-return path again.

This is push-based, not polling: it only ever runs work in response to real admin traffic, adds no page reloads, and doesn't touch anything on the front end.

### 3.2 Consolidated the duplicate "latest version" check (`adaire-blocks.php`)

The `plugin_action_links_...` filter that shows/hides the "Rollback" link used to run its *own* `wp_remote_get()` against `.../update-info.json` — the exact same feed the bundled Plugin Update Checker already fetches — cached in a separate 1-hour transient, with `error_log()` calls on every single Plugins-page view. Two independently-cached "is this the latest version" answers for the same plugin can disagree (e.g. right after an update, PUC's freshly-reset state already knows the new version is current while the rollback filter's stale 1-hour cache could still say otherwise) — this is precisely the kind of "does the update mechanism leave stale/contradictory state" risk item 3 of the audit asked about. It now reads `$myUpdateChecker->getUpdate()` directly (returns `null` exactly when the installed version is current) — same UI behavior, one network call instead of two, one source of truth, and no more log spam on every page load. The `upgrader_process_complete` / `activated_plugin` cache-clear hooks were kept (now doc-commented) as immediate, no-op-if-not-needed belt-and-suspenders alongside the new guard.

### 3.3 License table creation moved off the hot path (`includes/class-adaire-blocks-license.php`)

`AdaireBlocksLicense::init()` — hooked to `admin_init` — called `create_license_table()` (a `dbDelta()` schema check) unconditionally, on *every single admin page load*. That's a DB round-trip nobody needs on 99.9% of requests. It's now gated behind a `LICENSE_TABLE_SCHEMA_VERSION` constant stored in an option (`maybe_create_license_table()`), so the schema check runs once and self-heals if the schema constant is ever bumped in a future release — even for sites that update in place and never re-fire the activation hook. This is the exact pattern the plugin's own `AdaireCookieConsentLog::ensure_table()` and cookie-scanner code already use correctly, so the license class was the one outlier, not a new pattern.

### 3.4 Admin JS cache-busting fix (`admin/settings-page.php`)

`wp_register_script( 'adaire-blocks-admin', ..., '1.0.0', true )` → `wp_register_script( 'adaire-blocks-admin', ..., $plugin_version, true )`. `$plugin_version` is already computed at the top of `enqueue_admin_scripts()` from the live plugin file header and was already being used correctly for the two stylesheet registrations in the same function — only the script tag was left pinned.

---

## 4. Adaire Menu Audit Results

Traced via the execution harness and manual read, covering everything registered under the Adaire menu:

- **Parent menu:** `adaire-blocks-settings`, registered by `Adaire_Welcome_Screen::add_menu_page()` (`admin/welcome-screen.php`) when that class is the one active copy; `admin/settings-page.php` correctly detects this via `class_exists()` and nests itself as a submenu instead of re-registering the top level. No duplicate top-level registration found in any active-plugin-combination path.
- **Submenus confirmed, correctly parented, capability `manage_options` throughout:** Welcome / Quick Start, Pro Settings (or the top-level page itself when Welcome isn't present), License, Migration, Cookie Categories, Mega Menu. A separate Tools-screen submenu (`Adaire Blocks Deactivation Logs`, capability `activate_plugins`) is intentionally registered under `tools.php`, not under the Adaire parent — correct as designed.
- **Submenu ordering:** `Adaire_Welcome_Screen::move_to_top()` (priority `999` on `admin_menu`) deterministically pins "Welcome / Quick Start" first and "Case Studies" second regardless of hook-registration order — this is a deliberate, working fix for a real WP quirk (the top-level menu's own link href is derived from whichever submenu entry is *first* in the array), not a bug.
- **Capabilities:** consistent (`manage_options` for all Adaire-branded pages; `activate_plugins` for the Tools log page, which is standard for that screen type). No page found that a logged-in administrator would be unable to reach.
- **AJAX/REST:** every `wp_ajax_*` handler checked verifies `check_ajax_referer()`/nonce and `current_user_can()` before doing anything. The one REST route (`adaire-blocks/v1/blocks`) gates on `current_user_can( 'manage_options' )`.
- **Asset loading:** each admin page's `admin_enqueue_scripts` callback correctly no-ops on any hook string other than its own page (verified by hook-name string match, e.g. `adaire-blocks-settings_page_adaire-blocks-migration`), so pages aren't loading each other's CSS/JS. The one real defect found is the hardcoded script version described above (fixed).
- **Activation/deactivation/update behavior:** `register_activation_hook()`/`register_deactivation_hook()` are each registered exactly once per feature (case studies CPT, cookie-consent log, cookie scanner, PUC's own scheduler-cron cleanup, the welcome-screen redirect flag) — no duplicate registrations, no missing deactivation counterpart where one’s expected. Reactivating after deactivation does not corrupt menu state — menu registration doesn't depend on any option that deactivation clears.
- **PHP errors/notices:** none found via `php -l` (all touched files) or via the execution trace, other than the DB-table-on-every-request inefficiency already fixed.

## 5. Update Mechanism Audit Results

- **Plugin Update Checker (PUC v5.6, Yahnis Elsts library):** configured correctly — `PucFactory::buildUpdateChecker()` against a plain JSON metadata URL, plugin file, and slug. This is the library's supported "just a JSON feed" mode and needed no changes. It correctly hooks `site_transient_update_plugins`, `upgrader_process_complete`, `admin_init` (for its own cron-fallback check), and registers a real WP-Cron event for periodic checks — no polling added by this plugin's own code.
- **Custom "Version Rollback" logic:** was a second, parallel, hand-rolled update-checker (its own `wp_remote_get()` to the same feed, its own transient, its own log lines on every page view) that could disagree with PUC's own state. Consolidated onto PUC (§3.2) — this was a real "stale/contradictory update info" defect and is now fixed.
- **`set_site_transient`/`get_site_transient` usage:** only PUC itself and the code above touch `update_plugins`; nothing else in the audited files writes to it, so there's no other source of conflicting update-availability data.
- **Non-WP-Upgrader deployment (git/file sync):** this is the one gap that existed in *every* layer — nothing previously detected "the files changed under me" outside of WordPress's own upgrade flow. §3.1 closes that gap generically, for any deployment method.

## 6. Testing Performed

- `php -l` (syntax lint) on every changed file — all clean.
- Built and ran a WordPress-function-stub execution harness that loads the real `adaire-blocks.php` and every file it requires, then fires `register_activation_hook` callbacks, `admin_init`, and `admin_menu` in WordPress's real order, against a simulated **fresh install** (no options/transients pre-set). Confirmed, both before and after the fix:
  - Exactly one top-level menu (`adaire-blocks-settings`) is registered, never duplicated.
  - All six submenus register under the correct parent with the correct capability.
  - The new stale-cache guard (`adaire_blocks_maybe_bust_stale_caches`) fires first, before PUC's own scheduler and before the license/settings init code, and completes without error, correctly calling `wp_clean_plugins_cache()`, clearing the legacy transient, and calling into the real PUC object's `resetUpdateState()`.
  - No new duplicate menu registrations, no new hook-ordering issues, introduced by any of the four changes.
- Manually traced every `add_menu_page()`/`add_submenu_page()` call site in `admin/` and `includes/` against the exact hook and priority it's registered on.
- Confirmed (by reading, not just running) that the license-table fix mirrors the already-correct, already-shipped pattern in `AdaireCookieConsentLog::ensure_table()` and the cookie-scanner table, rather than introducing a new pattern.

**Not tested (outside what this environment can do):** an actual install→activate→update cycle against a live WordPress instance with a persistent object cache and OPcache enabled, which is what would definitively confirm the OPcache/object-cache theory behind the reported "needs a refresh" symptom end-to-end. I'd recommend a real staging-server test of a git-based file update immediately followed by an admin page load, with and without this fix, if you want to observationally confirm it before shipping.

## 7. Regression Status

- All existing menu items, capabilities, slugs, and hook wiring are unchanged — only *when* certain work happens (cache-busting timing, DB table check timing, one now-consolidated network check) changed, not *what* gets registered.
- Settings save/AJAX flows, REST route, and nonce/capability checks in `admin/settings-page.php` are untouched apart from the one-line script-version fix.
- The Rollback feature's UI/behavior is unchanged from the admin's point of view; it now reads from one source of truth instead of two that could disagree.
- No options were renamed or removed; two new options were added (`adaire_blocks_seen_version`, `adaire_blocks_license_table_schema`) — both self-initializing, no migration needed, no impact on existing stored settings.
- Free/Pro dual-architecture: the `class_exists( 'Adaire_Welcome_Screen' )` guard pattern was not changed, only read and verified — it continues to prevent a duplicate top-level menu when both plugins are active together.

---

### One note for the audit record, not a bug fix

`free-version-scaffold/` (a separately generated build of the free plugin, produced by `scripts/generate-free-version.js`) ships its **own** copies of `Adaire_Welcome_Screen`/`AdaireBlocksSettings` under the same class names. When both the free and pro plugins are active on one site, *whichever one WordPress loads first* (determined by activation order, not alphabetically) is the copy that ends up owning the top-level menu and the Welcome screen content — this is handled safely (no duplicate menu, no fatal), but it does mean the specific Welcome-screen content shown is non-deterministic across sites. Not related to the reported symptoms and not touched here, but worth knowing if support tickets mention "the welcome screen looks different on different sites."

---

*Housekeeping: a few temporary audit scratch files were created under `adaire-blocks/` while producing this report. `device_bash` can't delete files in your connected folder without your separate approval, so they were moved to `adaire-blocks/_to_delete/` instead — safe to delete that folder whenever convenient.*
