/**
 * Header block is now a dynamic block: frontend markup is produced by
 * src/header-block/render.php (registered via block.json's "render"
 * field), not by this save(). Returning null here is required for dynamic
 * blocks and means the block comment saved in post_content carries no
 * markup — WordPress calls the PHP render callback on every request, so
 * content (e.g. live WP menu data) always reflects the current site state.
 *
 * The previous static save() (used by every block instance saved before
 * this refactor) is preserved verbatim as `deprecatedV3` in deprecated.js
 * so existing saved blocks keep validating/migrating correctly in the
 * editor. Frontend rendering for those existing posts is unaffected by
 * this change: WordPress always renders blocks via the currently
 * registered render path (this render.php), regardless of which save()
 * variant originally produced the saved HTML comment.
 */
export default function save() {
	return null;
}
