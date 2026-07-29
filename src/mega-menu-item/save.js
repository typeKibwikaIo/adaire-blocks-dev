/**
 * Dynamic block — entirely server-rendered by render.php so a centrally
 * managed panel's content is always read fresh, never duplicated into
 * saved post content. Saving null keeps the block's markup out of
 * post_content entirely (WordPress calls render.php on every render).
 */
export default function save() {
	return null;
}
