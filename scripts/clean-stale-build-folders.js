/**
 * Removes stale compiled block folders from build/ that no longer have a
 * matching src/ folder — i.e. leftovers from a block being renamed or
 * deleted.
 *
 * Why this exists: `wp-scripts build` (and the free-version generator's own
 * build step) never clean their output directory — they only ever add or
 * overwrite files. If a block's source folder is renamed (e.g.
 * src/header-block -> src/header-menu-block), the OLD build/header-block
 * folder from a previous build is never removed. Since both the free-tier
 * plugin's block registration (a plain glob over build/*) and the WP
 * admin settings page's block list (same glob, in
 * admin/settings-page.php's get_available_blocks()) discover blocks by
 * scanning build/ directly rather than reading block.json's registered
 * `name`, that stale folder keeps registering as its own fully-visible
 * block — indistinguishable from the real one in the inserter, causing an
 * exact-duplicate entry. (This is what happened after the header-block ->
 * header-menu-block rename: build/header-block lingered with its
 * unmodified block.json, inserter:true and all, alongside the new
 * build/header-menu-block.)
 *
 * Only removes a build/<name> directory when:
 *   - it contains a block.json (so non-block shared folders like
 *     build/images/ are never touched), AND
 *   - there's no src/<name>/block.json to match it (so anything still
 *     actively built is left alone).
 *
 * Safe to run repeatedly; a no-op once build/ is in sync with src/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const BUILD_DIR = path.join(ROOT, 'build');

function main() {
    if (!fs.existsSync(BUILD_DIR)) {
        console.log('No build/ directory yet — nothing to clean.');
        return;
    }

    const buildEntries = fs.readdirSync(BUILD_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    let removed = 0;

    for (const name of buildEntries) {
        const buildBlockJson = path.join(BUILD_DIR, name, 'block.json');
        if (!fs.existsSync(buildBlockJson)) {
            // Not a compiled block folder (e.g. build/images) — leave it alone.
            continue;
        }

        const srcBlockJson = path.join(SRC_DIR, name, 'block.json');
        if (fs.existsSync(srcBlockJson)) {
            // Still a real, currently-built block — leave it alone.
            continue;
        }

        const target = path.join(BUILD_DIR, name);
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`✓ Removed stale build folder: build/${name}`);
        removed += 1;
    }

    if (removed === 0) {
        console.log('✓ No stale build folders found.');
    } else {
        console.log(`✓ Cleaned ${removed} stale build folder(s).`);
    }
}

main();
