<?php
/**
 * Renders a mega panel's content according to its layout
 * (standard/tabbed/showcase/gallery/link-list).
 *
 * "standard" renders the panel's block-editor post_content exactly as
 * before (unchanged, fully backward compatible). The other four layouts
 * render the structured items array (AdaireMegaPanelItemSanitizer's
 * schema) into layout-specific markup. All markup here is deliberately
 * static/server-rendered and degrades sensibly with JS disabled — the
 * frontend JS (src/mega-menu-item/view.js) only adds interaction states
 * (aria-expanded toggling, drill-down level switching, breadcrumb) on top
 * of markup that's already semantically complete without it.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders adaire_mega_panel content per layout.
 */
class AdaireMegaPanelRenderer {

	/**
	 * Renders a panel's inner content (the part that goes inside the
	 * dropdown wrapper) for its configured layout.
	 *
	 * @param WP_Post $panel Published, enabled adaire_mega_panel post.
	 * @return string Escaped HTML.
	 */
	public static function render( $panel ) {
		$layout = get_post_meta( $panel->ID, AdaireMegaPanelPostType::META_LAYOUT, true );
		$layout = $layout ? $layout : 'standard';

		switch ( $layout ) {
			case 'tabbed':
				return self::render_tabbed( $panel );
			case 'showcase':
				return self::render_showcase( $panel );
			case 'gallery':
				return self::render_gallery( $panel );
			case 'link-list':
				return self::render_link_list( $panel );
			case 'standard':
			default:
				return apply_filters( 'the_content', $panel->post_content );
		}
	}

	/**
	 * Reads and lightly normalizes a panel's items — visible only, and
	 * gracefully empty (never a fatal) if the meta is missing or malformed.
	 *
	 * @param int $panel_id Panel post id.
	 * @return array[]
	 */
	private static function get_visible_items( $panel_id ) {
		$items = get_post_meta( $panel_id, AdaireMegaPanelPostType::META_ITEMS, true );
		if ( ! is_array( $items ) ) {
			return array();
		}
		return array_values( array_filter( $items, static fn( $item ) => ! empty( $item['visible'] ) ) );
	}

	/**
	 * Direct children of a given parent id (or top level for '').
	 *
	 * @param array[] $items     All items.
	 * @param string  $parent_id Parent id, '' for top level.
	 * @return array[]
	 */
	private static function children_of( $items, $parent_id ) {
		$children = array_values(
			array_filter(
				$items,
				static fn( $item ) => ( $item['parentId'] ?? '' ) === $parent_id
			)
		);
		usort( $children, static fn( $a, $b ) => ( $a['order'] ?? 0 ) <=> ( $b['order'] ?? 0 ) );
		return $children;
	}

	/**
	 * Resolves a link's href — falls back to '#' so a card/item with no
	 * URL set still renders as a focusable, keyboard-reachable element
	 * rather than silently becoming inert.
	 *
	 * @param array $item Item.
	 * @return string
	 */
	private static function item_url( $item ) {
		return ! empty( $item['url'] ) ? esc_url( $item['url'] ) : '#';
	}

	/**
	 * Common link target/rel attributes for an item or its CTA.
	 *
	 * @param bool   $open_in_new_tab Whether to open in a new tab.
	 * @param bool   $nofollow        Whether to add rel=nofollow.
	 * @param string $extra_rel       Additional rel tokens.
	 * @return string HTML attribute fragment, safe to echo directly.
	 */
	private static function link_attrs( $open_in_new_tab, $nofollow, $extra_rel = '' ) {
		$rel_tokens = array_filter(
			array(
				$open_in_new_tab ? 'noopener' : '',
				$open_in_new_tab ? 'noreferrer' : '',
				$nofollow ? 'nofollow' : '',
				$extra_rel,
			)
		);

		$attrs = $open_in_new_tab ? ' target="_blank"' : '';
		if ( ! empty( $rel_tokens ) ) {
			$attrs .= ' rel="' . esc_attr( implode( ' ', array_unique( $rel_tokens ) ) ) . '"';
		}
		return $attrs;
	}

	/**
	 * Renders one "card" — the shared visual unit used by the tabbed and
	 * gallery layouts (image, badge, eyebrow, title, description, CTAs).
	 *
	 * @param array $item Item.
	 * @return string Escaped HTML.
	 */
	private static function render_card( $item ) {
		$classes = array( 'adaire-mmp-card' );
		if ( ! empty( $item['featured'] ) ) {
			$classes[] = 'adaire-mmp-card--featured';
		}
		if ( ! empty( $item['cssClass'] ) ) {
			$classes[] = $item['cssClass'];
		}

		$style = '';
		if ( ! empty( $item['colors']['background'] ) ) {
			$style .= '--adaire-mmp-card-bg:' . esc_attr( $item['colors']['background'] ) . ';';
		}
		if ( ! empty( $item['colors']['text'] ) ) {
			$style .= '--adaire-mmp-card-text:' . esc_attr( $item['colors']['text'] ) . ';';
		}
		if ( ! empty( $item['colors']['accent'] ) ) {
			$style .= '--adaire-mmp-card-accent:' . esc_attr( $item['colors']['accent'] ) . ';';
		}

		$link_attrs = self::link_attrs( ! empty( $item['openInNewTab'] ), ! empty( $item['nofollow'] ), $item['rel'] ?? '' );
		$style_attr = $style ? ' style="' . esc_attr( $style ) . '"' : '';
		$aria_attr  = ! empty( $item['ariaLabel'] ) ? ' aria-label="' . esc_attr( $item['ariaLabel'] ) . '"' : '';

		ob_start();
		?>
		<a
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
			href="<?php echo self::item_url( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- item_url() already escapes. ?>"
			<?php echo $link_attrs . $style_attr . $aria_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each piece already escaped above. ?>
		>
			<?php if ( ! empty( $item['badge'] ) ) : ?>
				<span class="adaire-mmp-card__badge"><?php echo esc_html( $item['badge'] ); ?></span>
			<?php endif; ?>
			<?php if ( ! empty( $item['image']['url'] ) ) : ?>
				<img
					class="adaire-mmp-card__image"
					src="<?php echo esc_url( $item['image']['url'] ); ?>"
					<?php if ( ! empty( $item['mobileImage']['url'] ) ) : ?>
						srcset="<?php echo esc_url( $item['mobileImage']['url'] ); ?> 600w, <?php echo esc_url( $item['image']['url'] ); ?> 1200w"
						sizes="(max-width: 782px) 600px, 1200px"
					<?php endif; ?>
					alt="<?php echo esc_attr( $item['image']['alt'] ?? '' ); ?>"
					loading="lazy"
				/>
			<?php endif; ?>
			<?php if ( ! empty( $item['eyebrow'] ) ) : ?>
				<span class="adaire-mmp-card__eyebrow"><?php echo esc_html( $item['eyebrow'] ); ?></span>
			<?php endif; ?>
			<?php if ( ! empty( $item['title'] ) ) : ?>
				<strong class="adaire-mmp-card__title"><?php echo esc_html( $item['title'] ); ?></strong>
			<?php endif; ?>
			<?php if ( ! empty( $item['description'] ) ) : ?>
				<p class="adaire-mmp-card__description"><?php echo esc_html( $item['description'] ); ?></p>
			<?php endif; ?>
			<?php if ( ! empty( $item['linkLabel'] ) ) : ?>
				<span class="adaire-mmp-card__link-label"><?php echo esc_html( $item['linkLabel'] ); ?></span>
			<?php endif; ?>
		</a>
		<?php
		return ob_get_clean();
	}

	/**
	 * Tabbed / showcase (Pattern A): a category list + a card grid that
	 * swaps per category. Server renders every category's cards (not just
	 * the active one) so it's fully usable/indexable with JS disabled —
	 * the frontend JS only handles hiding inactive panels and wiring the
	 * grace-period hover behaviour.
	 *
	 * @param WP_Post $panel Panel post.
	 * @return string Escaped HTML.
	 */
	private static function render_tabbed( $panel ) {
		$items      = self::get_visible_items( $panel->ID );
		$categories = self::resolve_top_level( $panel, $items );
		$default_id = get_post_meta( $panel->ID, AdaireMegaPanelPostType::META_DEFAULT_ACTIVE_ID, true );
		$default_id = $default_id ? $default_id : ( $categories[0]['id'] ?? '' );

		if ( empty( $categories ) ) {
			return '';
		}

		ob_start();
		?>
		<div class="adaire-mmp-tabbed" data-default-active="<?php echo esc_attr( $default_id ); ?>">
			<div class="adaire-mmp-tabbed__categories" role="tablist">
				<?php foreach ( $categories as $category ) : ?>
					<?php $is_active = $category['id'] === $default_id; ?>
					<button
						type="button"
						class="adaire-mmp-tabbed__category<?php echo $is_active ? ' is-active' : ''; ?>"
						role="tab"
						id="adaire-mmp-tab-<?php echo esc_attr( $category['id'] ); ?>"
						aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
						aria-controls="adaire-mmp-panel-<?php echo esc_attr( $category['id'] ); ?>"
						data-item-id="<?php echo esc_attr( $category['id'] ); ?>"
					>
						<?php if ( ! empty( $category['icon'] ) ) : ?>
							<span class="adaire-mmp-tabbed__icon" data-icon="<?php echo esc_attr( $category['icon'] ); ?>" aria-hidden="true"></span>
						<?php endif; ?>
						<span class="adaire-mmp-tabbed__category-title"><?php echo esc_html( $category['title'] ); ?></span>
						<?php if ( ! empty( $category['description'] ) ) : ?>
							<span class="adaire-mmp-tabbed__category-subtitle"><?php echo esc_html( $category['description'] ); ?></span>
						<?php endif; ?>
					</button>
				<?php endforeach; ?>
			</div>
			<div class="adaire-mmp-tabbed__panels">
				<?php foreach ( $categories as $category ) : ?>
					<?php
					$is_active = $category['id'] === $default_id;
					$cards     = self::resolve_children( $items, $category );
					?>
					<div
						class="adaire-mmp-tabbed__panel"
						role="tabpanel"
						id="adaire-mmp-panel-<?php echo esc_attr( $category['id'] ); ?>"
						aria-labelledby="adaire-mmp-tab-<?php echo esc_attr( $category['id'] ); ?>"
						data-item-id="<?php echo esc_attr( $category['id'] ); ?>"
						<?php echo $is_active ? '' : 'hidden'; ?>
					>
						<?php if ( empty( $cards ) && ! empty( $category['url'] ) ) : ?>
							<a class="adaire-mmp-card" href="<?php echo self::item_url( $category ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- item_url() already escapes. ?>">
								<?php echo esc_html( $category['linkLabel'] ? $category['linkLabel'] : $category['title'] ); ?>
							</a>
						<?php else : ?>
							<div class="adaire-mmp-tabbed__cards">
								<?php
								foreach ( $cards as $card ) {
									echo self::render_card( $card ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- render_card() escapes every field itself.
								}
								?>
							</div>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Interactive drill-down (Pattern B): every level of the tree is
	 * rendered up front as nested lists (fully usable/crawlable with JS
	 * disabled — it just reads as a complete expanded sitemap); the
	 * frontend JS hides all but the active level and injects a breadcrumb.
	 *
	 * @param WP_Post $panel Panel post.
	 * @return string Escaped HTML.
	 */
	private static function render_showcase( $panel ) {
		$items = self::get_visible_items( $panel->ID );
		$top   = self::resolve_top_level( $panel, $items );

		if ( empty( $top ) ) {
			return '';
		}

		ob_start();
		?>
		<div class="adaire-mmp-showcase">
			<div class="adaire-mmp-showcase__breadcrumb" aria-label="<?php esc_attr_e( 'Menu breadcrumb', 'adaire-blocks' ); ?>"></div>
			<?php echo self::render_showcase_level( $items, $top, 0 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- render_showcase_level() escapes every field itself. ?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Recursively renders one drill-down level and everything nested
	 * under it.
	 *
	 * @param array[] $all_items All items in the panel (for children lookups).
	 * @param array[] $level     The items at this level.
	 * @param int     $depth     Current nesting depth.
	 * @return string Escaped HTML.
	 */
	private static function render_showcase_level( $all_items, $level, $depth ) {
		ob_start();
		?>
		<ul class="adaire-mmp-showcase__level" data-level="<?php echo esc_attr( $depth ); ?>" <?php echo $depth > 0 ? 'hidden' : ''; ?>>
			<?php foreach ( $level as $item ) : ?>
				<?php $children = self::resolve_children( $all_items, $item ); ?>
				<li class="adaire-mmp-showcase__item" data-item-id="<?php echo esc_attr( $item['id'] ); ?>">
					<a
						class="adaire-mmp-showcase__link"
						href="<?php echo self::item_url( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- item_url() already escapes. ?>"
						<?php echo self::link_attrs( ! empty( $item['openInNewTab'] ), ! empty( $item['nofollow'] ), $item['rel'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- link_attrs() already escapes. ?>
					>
						<?php echo esc_html( $item['title'] ); ?>
					</a>
					<?php if ( ! empty( $children ) ) : ?>
						<button
							type="button"
							class="adaire-mmp-showcase__drill"
							data-target="<?php echo esc_attr( $item['id'] ); ?>"
							aria-label="<?php echo esc_attr( sprintf( /* translators: %s: submenu item title. */ __( 'View %s submenu', 'adaire-blocks' ), $item['title'] ) ); ?>"
						>
							<span aria-hidden="true">›</span>
						</button>
						<?php echo self::render_showcase_level( $all_items, $children, $depth + 1 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- recursive call, already escaping. ?>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php
		return ob_get_clean();
	}

	/**
	 * Visual gallery: a flat grid of cards (top-level items only — nesting
	 * isn't meaningful for a gallery layout, so descendants are ignored
	 * rather than silently dropped-with-no-explanation elsewhere).
	 *
	 * @param WP_Post $panel Panel post.
	 * @return string Escaped HTML.
	 */
	private static function render_gallery( $panel ) {
		$items = self::resolve_top_level( $panel, self::get_visible_items( $panel->ID ) );
		if ( empty( $items ) ) {
			return '';
		}

		ob_start();
		?>
		<div class="adaire-mmp-gallery">
			<?php
			foreach ( $items as $item ) {
				echo self::render_card( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- render_card() escapes every field itself.
			}
			?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Simple flat link list.
	 *
	 * @param WP_Post $panel Panel post.
	 * @return string Escaped HTML.
	 */
	private static function render_link_list( $panel ) {
		$items = self::resolve_top_level( $panel, self::get_visible_items( $panel->ID ) );
		if ( empty( $items ) ) {
			return '';
		}

		ob_start();
		?>
		<ul class="adaire-mmp-link-list">
			<?php foreach ( $items as $item ) : ?>
				<li class="adaire-mmp-link-list__item">
					<a
						href="<?php echo self::item_url( $item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- item_url() already escapes. ?>"
						<?php echo self::link_attrs( ! empty( $item['openInNewTab'] ), ! empty( $item['nofollow'] ), $item['rel'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- link_attrs() already escapes. ?>
					>
						<?php if ( ! empty( $item['icon'] ) ) : ?>
							<span class="adaire-mmp-link-list__icon" data-icon="<?php echo esc_attr( $item['icon'] ); ?>" aria-hidden="true"></span>
						<?php endif; ?>
						<?php echo esc_html( $item['linkLabel'] ? $item['linkLabel'] : $item['title'] ); ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php
		return ob_get_clean();
	}

	/**
	 * Resolves an item's children for the tabbed/showcase layouts — either
	 * the manually-authored items beneath it, or (when a dynamic source is
	 * configured and its content type is currently available) a live query
	 * mapped into the same item shape. An unavailable or unconfigured source
	 * falls back to the manual items, so a deactivated plugin degrades
	 * gracefully instead of erroring or silently rendering nothing.
	 *
	 * @param array[] $all_items All items in the panel.
	 * @param array   $parent_item The parent item (category / showcase node).
	 * @return array[]
	 */
	private static function resolve_children( $all_items, $parent_item ) {
		$dynamic = self::query_dynamic_items( $parent_item['dynamicSource'] ?? array( 'type' => 'none' ) );
		return null !== $dynamic ? $dynamic : self::children_of( $all_items, $parent_item['id'] );
	}

	/**
	 * Resolves a panel's top-level items — either the manually-authored
	 * top-level items, or (when the panel-level dynamic source meta is
	 * configured and available) a live query. Used by the flat gallery and
	 * link-list layouts, and as the starting level for tabbed/showcase.
	 *
	 * @param WP_Post $panel Panel post.
	 * @param array[] $items All (manual) items in the panel.
	 * @return array[]
	 */
	private static function resolve_top_level( $panel, $items ) {
		$source  = class_exists( 'AdaireMegaPanelPostType' )
			? get_post_meta( $panel->ID, AdaireMegaPanelPostType::META_DYNAMIC_SOURCE, true )
			: null;
		$dynamic = is_array( $source ) ? self::query_dynamic_items( $source ) : null;
		return null !== $dynamic ? $dynamic : self::children_of( $items, '' );
	}

	/**
	 * Dispatches a sanitized dynamicSource sub-object to the matching query
	 * helper. Returns null (never an empty array) for 'none'/malformed
	 * sources so callers can tell "not configured" apart from "configured,
	 * but the query legitimately returned zero results".
	 *
	 * @param array $source Sanitized dynamicSource sub-object.
	 * @return array[]|null
	 */
	private static function query_dynamic_items( $source ) {
		$type = is_array( $source ) ? ( $source['type'] ?? 'none' ) : 'none';

		switch ( $type ) {
			case 'posts':
				return self::query_dynamic_posts( $source );
			case 'terms':
				return self::query_dynamic_terms( $source );
			case 'products':
				return self::query_dynamic_products( $source );
			case 'product_categories':
				return self::query_dynamic_product_categories( $source );
			default:
				return null;
		}
	}

	/**
	 * Queries posts of a given post type (optionally filtered by a taxonomy
	 * term) and maps them into item shape. Returns null if the requested
	 * post type doesn't exist (e.g. a custom post type from a deactivated
	 * plugin), never a fatal error.
	 *
	 * @param array $source Sanitized dynamicSource sub-object.
	 * @return array[]|null
	 */
	private static function query_dynamic_posts( $source ) {
		$post_type = $source['postType'] ? $source['postType'] : 'post';
		if ( ! post_type_exists( $post_type ) ) {
			return null;
		}

		$orderby = 'menu_order' === $source['orderby'] ? 'menu_order' : $source['orderby'];
		$args    = array(
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => $source['count'],
			'orderby'        => $orderby,
			'order'          => $source['order'],
			'no_found_rows'  => true,
		);

		if ( $source['taxonomy'] && $source['term'] && taxonomy_exists( $source['taxonomy'] ) ) {
			$args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- Editor-configured, low-frequency (mega panel dropdown content, cached like any other page content).
				array(
					'taxonomy' => $source['taxonomy'],
					'field'    => 'slug',
					'terms'    => $source['term'],
				),
			);
		}

		$query = new WP_Query( $args );
		return array_map( array( __CLASS__, 'map_post_to_item' ), $query->posts );
	}

	/**
	 * Queries terms of a given taxonomy and maps them into item shape.
	 * Returns null if the taxonomy doesn't exist.
	 *
	 * @param array $source Sanitized dynamicSource sub-object.
	 * @return array[]|null
	 */
	private static function query_dynamic_terms( $source ) {
		$taxonomy = $source['taxonomy'];
		if ( ! $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		$orderby = 'menu_order' === $source['orderby'] ? 'term_order' : ( 'title' === $source['orderby'] ? 'name' : 'name' );
		$terms   = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
				'number'     => $source['count'],
				'orderby'    => $orderby,
				'order'      => $source['order'],
			)
		);

		if ( is_wp_error( $terms ) ) {
			return array();
		}

		return array_map( array( __CLASS__, 'map_term_to_item' ), $terms );
	}

	/**
	 * Queries WooCommerce products (optionally filtered by a product
	 * category slug) and maps them into item shape. Returns null when
	 * WooCommerce isn't active — this is the only "must not error when
	 * inactive" gate this method needs, since wc_get_products() itself
	 * doesn't exist otherwise.
	 *
	 * @param array $source Sanitized dynamicSource sub-object.
	 * @return array[]|null
	 */
	private static function query_dynamic_products( $source ) {
		if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'wc_get_products' ) ) {
			return null;
		}

		$orderby = 'menu_order' === $source['orderby'] ? 'menu_order' : $source['orderby'];
		$args    = array(
			'status'  => 'publish',
			'limit'   => $source['count'],
			'orderby' => $orderby,
			'order'   => $source['order'],
		);

		if ( $source['term'] ) {
			$args['category'] = array( $source['term'] );
		}

		return array_map( array( __CLASS__, 'map_product_to_item' ), wc_get_products( $args ) );
	}

	/**
	 * Queries WooCommerce product categories — a thin wrapper around
	 * query_dynamic_terms() forcing the 'product_cat' taxonomy, gated on
	 * that taxonomy actually being registered (i.e. WooCommerce active).
	 *
	 * @param array $source Sanitized dynamicSource sub-object.
	 * @return array[]|null
	 */
	private static function query_dynamic_product_categories( $source ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return null;
		}
		$source['taxonomy'] = 'product_cat';
		return self::query_dynamic_terms( $source );
	}

	/**
	 * Shared field defaults for a dynamically-generated item, so
	 * map_post_to_item()/map_term_to_item()/map_product_to_item() only need
	 * to specify the fields that actually vary per source type — every
	 * field render_card()/render_showcase_level()/etc. might read is always
	 * present.
	 *
	 * @return array
	 */
	private static function dynamic_item_defaults() {
		return array(
			'linkLabel'     => '',
			'openInNewTab'  => false,
			'rel'           => '',
			'nofollow'      => false,
			'icon'          => '',
			'image'         => array(
				'id'  => 0,
				'url' => '',
				'alt' => '',
			),
			'mobileImage'   => array(
				'id'  => 0,
				'url' => '',
				'alt' => '',
			),
			'badge'         => '',
			'eyebrow'       => '',
			'cta'           => array(
				'label'        => '',
				'url'          => '',
				'openInNewTab' => false,
			),
			'secondaryCta'  => array(
				'label'        => '',
				'url'          => '',
				'openInNewTab' => false,
			),
			'cssClass'      => '',
			'featured'      => false,
			'visible'       => true,
			'order'         => 0,
			'parentId'      => '',
			'depth'         => 0,
			'colors'        => array(
				'background' => '',
				'text'       => '',
				'accent'     => '',
			),
			'ariaLabel'     => '',
			'dynamicSource' => array( 'type' => 'none' ),
		);
	}

	/**
	 * Maps a WP_Post into item shape.
	 *
	 * @param WP_Post $post Post.
	 * @return array
	 */
	private static function map_post_to_item( $post ) {
		$thumbnail_id = get_post_thumbnail_id( $post );
		$excerpt      = has_excerpt( $post ) ? get_the_excerpt( $post ) : $post->post_content;

		return array_merge(
			self::dynamic_item_defaults(),
			array(
				'id'          => 'dyn-post-' . $post->ID,
				'title'       => get_the_title( $post ),
				'description' => wp_trim_words( wp_strip_all_tags( $excerpt ), 20 ),
				'url'         => get_permalink( $post ),
				'image'       => array(
					'id'  => $thumbnail_id,
					'url' => $thumbnail_id ? (string) wp_get_attachment_image_url( $thumbnail_id, 'medium' ) : '',
					'alt' => $thumbnail_id ? get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true ) : '',
				),
			)
		);
	}

	/**
	 * Maps a WP_Term into item shape.
	 *
	 * @param WP_Term $term Term.
	 * @return array
	 */
	private static function map_term_to_item( $term ) {
		$url = get_term_link( $term );

		return array_merge(
			self::dynamic_item_defaults(),
			array(
				'id'          => 'dyn-term-' . $term->term_id,
				'title'       => $term->name,
				'description' => wp_trim_words( wp_strip_all_tags( $term->description ), 20 ),
				'url'         => is_wp_error( $url ) ? '' : $url,
			)
		);
	}

	/**
	 * Maps a WC_Product into item shape.
	 *
	 * @param WC_Product $product Product.
	 * @return array
	 */
	private static function map_product_to_item( $product ) {
		$image_id = $product->get_image_id();

		return array_merge(
			self::dynamic_item_defaults(),
			array(
				'id'          => 'dyn-product-' . $product->get_id(),
				'title'       => $product->get_name(),
				'description' => wp_trim_words( wp_strip_all_tags( $product->get_short_description() ), 20 ),
				'url'         => get_permalink( $product->get_id() ),
				'image'       => array(
					'id'  => $image_id,
					'url' => $image_id ? (string) wp_get_attachment_image_url( $image_id, 'medium' ) : '',
					'alt' => $image_id ? get_post_meta( $image_id, '_wp_attachment_image_alt', true ) : '',
				),
				'badge'       => $product->is_on_sale() ? __( 'Sale', 'adaire-blocks' ) : '',
			)
		);
	}
}
