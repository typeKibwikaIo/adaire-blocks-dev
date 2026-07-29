<?php
/**
 * Server-side render for adaire/mega-menu-item.
 *
 * Both the link (label/URL/target/rel) and the dropdown content are resolved
 * fresh on every request from centrally managed WordPress data — a native
 * nav menu item (Appearance > Menus) for the link, and a mega panel post for
 * the dropdown. The block itself stores only references (menuItemId,
 * panelId) and presentation settings, never duplicated menu content.
 *
 * @package AdaireBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block HTML (unused — dynamic block).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$menu_item_id  = absint( $attributes['menuItemId'] ?? 0 );
$panel_id      = absint( $attributes['panelId'] ?? 0 );
$layout        = isset( $attributes['layout'] ) ? (string) $attributes['layout'] : 'contained';
$max_width     = absint( $attributes['maxWidth'] ?? 960 );
$alignment     = isset( $attributes['alignment'] ) ? (string) $attributes['alignment'] : 'left';
$trigger       = isset( $attributes['trigger'] ) ? (string) $attributes['trigger'] : 'hover';
$breakpoint    = absint( $attributes['breakpoint'] ?? 1024 );
$animation     = isset( $attributes['animation'] ) ? (string) $attributes['animation'] : 'fade-slide';
$animation_ms  = absint( $attributes['animationDuration'] ?? 200 );
$open_delay    = absint( $attributes['openDelay'] ?? 100 );
$close_delay   = absint( $attributes['closeDelay'] ?? 200 );
$panel_padding = absint( $attributes['panelPadding'] ?? 24 );

$close_on_outside_click = ! isset( $attributes['closeOnOutsideClick'] ) || ! empty( $attributes['closeOnOutsideClick'] );
$close_on_escape        = ! isset( $attributes['closeOnEscape'] ) || ! empty( $attributes['closeOnEscape'] );
$close_on_link_select   = ! isset( $attributes['closeOnLinkSelect'] ) || ! empty( $attributes['closeOnLinkSelect'] );
$keep_only_one_open     = ! isset( $attributes['keepOnlyOneOpen'] ) || ! empty( $attributes['keepOnlyOneOpen'] );
$mobile_mode            = isset( $attributes['mobileMode'] ) ? (string) $attributes['mobileMode'] : 'accordion';
$mobile_panel_padding   = absint( $attributes['mobilePanelPadding'] ?? 16 );
$mobile_submenu_indent  = absint( $attributes['mobileSubmenuIndent'] ?? 16 );
$lock_body_scroll       = ! isset( $attributes['lockBodyScroll'] ) || ! empty( $attributes['lockBodyScroll'] );
$mobile_label           = isset( $attributes['mobileLabel'] ) ? (string) $attributes['mobileLabel'] : '';

$allowed_layouts      = array( 'contained', 'wide', 'full' );
$allowed_alignments   = array( 'left', 'center', 'right', 'stretch' );
$allowed_triggers     = array( 'hover', 'click', 'hover-focus' );
$allowed_animations   = array( 'none', 'fade', 'fade-slide', 'scale' );
$allowed_mobile_modes = array( 'accordion', 'drilldown', 'drawer' );

$mobile_mode = in_array( $mobile_mode, $allowed_mobile_modes, true ) ? $mobile_mode : 'accordion';
$layout      = in_array( $layout, $allowed_layouts, true ) ? $layout : 'contained';
$alignment   = in_array( $alignment, $allowed_alignments, true ) ? $alignment : 'left';
$trigger     = in_array( $trigger, $allowed_triggers, true ) ? $trigger : 'hover';
$animation   = in_array( $animation, $allowed_animations, true ) ? $animation : 'fade-slide';

// Resolve the link from the referenced native nav menu item — the same
// object WordPress's own Walker_Nav_Menu resolves for classic menus, so
// pages, posts, categories, and custom links all work identically here.
$menu_item_post = $menu_item_id ? get_post( $menu_item_id ) : null;

if ( ! $menu_item_post || 'nav_menu_item' !== $menu_item_post->post_type ) {
	// No menu item selected yet (or it was deleted) — nothing safe to
	// render. Failing silently keeps the surrounding navigation intact
	// rather than showing a broken link.
	return;
}

$menu_item = wp_setup_nav_menu_item( $menu_item_post );
$label     = $menu_item->title;
$url       = $menu_item->url;
$target    = $menu_item->target;
$rel       = $menu_item->xfn;

$has_panel = $panel_id && class_exists( 'AdaireMegaPanelPostType' ) && AdaireMegaPanelPostType::is_publicly_usable( $panel_id );

$link_target = $target ? ' target="' . esc_attr( $target ) . '"' : '';
$link_rel    = ( '_blank' === $target ) ? trim( $rel . ' noopener noreferrer' ) : $rel;

$unique_id = 'adaire-mega-menu-' . $menu_item_id . '-' . wp_unique_id();

$item_classes = array( 'adaire-mega-menu-item' );
if ( $has_panel ) {
	$item_classes[] = 'adaire-mega-menu-item--has-panel';
	$item_classes[] = 'adaire-mega-menu-item--' . $layout;
	$item_classes[] = 'adaire-mega-menu-item--align-' . $alignment;
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $item_classes ),
	)
);

if ( ! $has_panel ) {
	// No panel assigned, or the assigned panel is missing/draft/disabled —
	// degrade to a plain link so the surrounding navigation still works.
	printf(
		'<li %1$s><a href="%2$s"%3$s%4$s>%5$s</a></li>',
		$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built entirely from get_block_wrapper_attributes(), which already escapes.
		esc_url( $url ),
		$link_target, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built above from esc_attr() on a WP-controlled menu-item target value.
		$link_rel ? ' rel="' . esc_attr( $link_rel ) . '"' : '',
		esc_html( $label )
	);
	return;
}

$panel         = get_post( $panel_id );
$panel_layout  = get_post_meta( $panel_id, AdaireMegaPanelPostType::META_LAYOUT, true );
$panel_layout  = $panel_layout ? $panel_layout : 'standard';
$panel_content = class_exists( 'AdaireMegaPanelRenderer' ) ? AdaireMegaPanelRenderer::render( $panel ) : apply_filters( 'the_content', $panel->post_content );

$style_vars = sprintf(
	'--adaire-mega-menu-max-width:%1$dpx;--adaire-mega-menu-padding:%2$dpx;--adaire-mega-menu-animation-duration:%3$dms;--adaire-mega-menu-mobile-padding:%4$dpx;--adaire-mega-menu-mobile-indent:%5$dpx;',
	$max_width,
	$panel_padding,
	$animation_ms,
	$mobile_panel_padding,
	$mobile_submenu_indent
);
?>
<li <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<button
		type="button"
		class="adaire-mega-menu-item__trigger"
		id="<?php echo esc_attr( $unique_id ); ?>-trigger"
		aria-haspopup="true"
		aria-expanded="false"
		aria-controls="<?php echo esc_attr( $unique_id ); ?>-panel"
		<?php echo $mobile_label ? ' data-mobile-label="' . esc_attr( $mobile_label ) . '"' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Already escaped above. ?>
	>
		<span class="adaire-mega-menu-item__label"><?php echo esc_html( $label ); ?></span>
		<span class="adaire-mega-menu-item__chevron" aria-hidden="true"></span>
	</button>
	<div
		id="<?php echo esc_attr( $unique_id ); ?>-panel"
		class="adaire-mega-menu-item__panel adaire-mega-menu-item__panel--<?php echo esc_attr( $panel_layout ); ?>"
		role="region"
		aria-labelledby="<?php echo esc_attr( $unique_id ); ?>-trigger"
		data-layout="<?php echo esc_attr( $panel_layout ); ?>"
		data-trigger="<?php echo esc_attr( $trigger ); ?>"
		data-animation="<?php echo esc_attr( $animation ); ?>"
		data-breakpoint="<?php echo esc_attr( $breakpoint ); ?>"
		data-open-delay="<?php echo esc_attr( $open_delay ); ?>"
		data-close-delay="<?php echo esc_attr( $close_delay ); ?>"
		data-mobile-mode="<?php echo esc_attr( $mobile_mode ); ?>"
		data-close-on-outside-click="<?php echo $close_on_outside_click ? '1' : '0'; ?>"
		data-close-on-escape="<?php echo $close_on_escape ? '1' : '0'; ?>"
		data-close-on-link-select="<?php echo $close_on_link_select ? '1' : '0'; ?>"
		data-keep-only-one-open="<?php echo $keep_only_one_open ? '1' : '0'; ?>"
		data-lock-body-scroll="<?php echo $lock_body_scroll ? '1' : '0'; ?>"
		style="<?php echo esc_attr( $style_vars ); ?>"
		hidden
	>
		<div class="adaire-mega-menu-item__panel-inner">
			<?php echo $panel_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Standard layout is passed through the_content filter (WP's own trusted pipeline); other layouts come from AdaireMegaPanelRenderer, which escapes every field itself. ?>
		</div>
	</div>
</li>
