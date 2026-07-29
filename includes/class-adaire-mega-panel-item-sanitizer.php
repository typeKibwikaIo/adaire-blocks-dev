<?php
/**
 * Sanitizes and validates the structured item/card schema used by the
 * tabbed, showcase, gallery, and link-list mega panel layouts.
 *
 * The "standard columns" layout keeps using the block editor's own
 * post_content (unchanged, fully backward compatible with panels already
 * saved this session) — this structured schema is additive, stored in its
 * own post meta key, and only consumed by the newer layouts.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sanitizes and validates adaire_mega_panel item arrays.
 */
class AdaireMegaPanelItemSanitizer {

	/**
	 * Sanitizes a full items array (one mega panel's worth of items),
	 * dropping anything malformed rather than failing the whole save.
	 * Every item is guaranteed a stable, unique string id on the way out.
	 *
	 * @param mixed $items Raw items value (expected array of arrays).
	 * @return array[]
	 */
	public static function sanitize_items( $items ) {
		if ( ! is_array( $items ) ) {
			return array();
		}

		$seen_ids = array();
		$clean    = array();

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$sanitized = self::sanitize_item( $item );

			// Guarantee id uniqueness within this panel — a colliding or
			// missing id gets a fresh one rather than silently overwriting
			// another item when the array is later re-indexed by id.
			if ( '' === $sanitized['id'] || isset( $seen_ids[ $sanitized['id'] ] ) ) {
				$sanitized['id'] = wp_generate_uuid4();
			}
			$seen_ids[ $sanitized['id'] ] = true;

			$clean[] = $sanitized;
		}

		// parentId must reference an id that actually exists in this same
		// array — otherwise the item silently becomes a top-level item
		// rather than pointing at nothing (which would make it unreachable
		// in a drill-down tree).
		$valid_ids = wp_list_pluck( $clean, 'id' );
		foreach ( $clean as &$item ) {
			if ( '' !== $item['parentId'] && ! in_array( $item['parentId'], $valid_ids, true ) ) {
				$item['parentId'] = '';
				$item['depth']    = 0;
			}
		}
		unset( $item );

		return $clean;
	}

	/**
	 * Sanitizes a single item to the fixed field set — unknown keys are
	 * dropped, missing keys get safe defaults.
	 *
	 * @param array $item Raw item.
	 * @return array
	 */
	private static function sanitize_item( array $item ) {
		return array(
			'id'            => isset( $item['id'] ) ? sanitize_key( (string) $item['id'] ) : '',
			'title'         => isset( $item['title'] ) ? sanitize_text_field( $item['title'] ) : '',
			'description'   => isset( $item['description'] ) ? sanitize_textarea_field( $item['description'] ) : '',
			'url'           => isset( $item['url'] ) ? esc_url_raw( $item['url'] ) : '',
			'linkLabel'     => isset( $item['linkLabel'] ) ? sanitize_text_field( $item['linkLabel'] ) : '',
			'openInNewTab'  => ! empty( $item['openInNewTab'] ),
			'rel'           => isset( $item['rel'] ) ? sanitize_text_field( $item['rel'] ) : '',
			'nofollow'      => ! empty( $item['nofollow'] ),
			'icon'          => isset( $item['icon'] ) ? sanitize_key( $item['icon'] ) : '',
			'image'         => self::sanitize_media_ref( $item['image'] ?? null ),
			'mobileImage'   => self::sanitize_media_ref( $item['mobileImage'] ?? null ),
			'badge'         => isset( $item['badge'] ) ? sanitize_text_field( $item['badge'] ) : '',
			'eyebrow'       => isset( $item['eyebrow'] ) ? sanitize_text_field( $item['eyebrow'] ) : '',
			'cta'           => self::sanitize_cta( $item['cta'] ?? null ),
			'secondaryCta'  => self::sanitize_cta( $item['secondaryCta'] ?? null ),
			'cssClass'      => isset( $item['cssClass'] ) ? sanitize_html_class( $item['cssClass'] ) : '',
			'featured'      => ! empty( $item['featured'] ),
			'visible'       => ! isset( $item['visible'] ) || (bool) $item['visible'],
			'order'         => isset( $item['order'] ) ? absint( $item['order'] ) : 0,
			'parentId'      => isset( $item['parentId'] ) ? sanitize_key( (string) $item['parentId'] ) : '',
			'depth'         => isset( $item['depth'] ) ? min( 5, absint( $item['depth'] ) ) : 0,
			'colors'        => self::sanitize_colors( $item['colors'] ?? null ),
			'ariaLabel'     => isset( $item['ariaLabel'] ) ? sanitize_text_field( $item['ariaLabel'] ) : '',
			'dynamicSource' => self::sanitize_dynamic_source( $item['dynamicSource'] ?? null ),
		);
	}

	/**
	 * Sanitizes the optional "dynamic source" sub-object — when set to
	 * anything other than 'none', this item's children are populated at
	 * render time from a live query (posts, taxonomy terms, or WooCommerce
	 * products/categories) instead of the manually-authored items below it.
	 * Availability (post type/taxonomy exists, WooCommerce active) is checked
	 * by the renderer, not here — sanitization only validates shape, so a
	 * source that becomes unavailable later (e.g. a plugin gets deactivated)
	 * degrades gracefully at render time rather than losing the saved
	 * configuration.
	 *
	 * @param mixed $source Raw dynamicSource value.
	 * @return array
	 */
	public static function sanitize_dynamic_source( $source ) {
		if ( ! is_array( $source ) ) {
			$source = array();
		}

		$allowed_types   = array( 'none', 'posts', 'terms', 'products', 'product_categories' );
		$allowed_orderby = array( 'date', 'title', 'menu_order', 'rand' );

		$type    = isset( $source['type'] ) ? sanitize_key( $source['type'] ) : 'none';
		$orderby = isset( $source['orderby'] ) ? sanitize_key( $source['orderby'] ) : 'date';
		$order   = isset( $source['order'] ) ? strtoupper( sanitize_key( $source['order'] ) ) : 'DESC';

		return array(
			'type'     => in_array( $type, $allowed_types, true ) ? $type : 'none',
			'postType' => isset( $source['postType'] ) ? sanitize_key( $source['postType'] ) : 'post',
			'taxonomy' => isset( $source['taxonomy'] ) ? sanitize_key( $source['taxonomy'] ) : '',
			'term'     => isset( $source['term'] ) ? sanitize_key( $source['term'] ) : '',
			'count'    => isset( $source['count'] ) ? min( 50, max( 1, absint( $source['count'] ) ) ) : 6,
			'orderby'  => in_array( $orderby, $allowed_orderby, true ) ? $orderby : 'date',
			'order'    => in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'DESC',
		);
	}

	/**
	 * Sanitizes a media reference (image/mobileImage) shaped like a
	 * MediaUpload selection: attachment id + resolved url/alt. The id is
	 * the source of truth; url/alt are a display convenience the client
	 * already has and re-validating them against the attachment on every
	 * save would be an unnecessary extra query for data already implied by
	 * the id.
	 *
	 * @param mixed $media Raw media value.
	 * @return array{id:int,url:string,alt:string}
	 */
	private static function sanitize_media_ref( $media ) {
		if ( ! is_array( $media ) ) {
			return array(
				'id'  => 0,
				'url' => '',
				'alt' => '',
			);
		}

		return array(
			'id'  => isset( $media['id'] ) ? absint( $media['id'] ) : 0,
			'url' => isset( $media['url'] ) ? esc_url_raw( $media['url'] ) : '',
			'alt' => isset( $media['alt'] ) ? sanitize_text_field( $media['alt'] ) : '',
		);
	}

	/**
	 * Sanitizes a CTA (call-to-action) sub-object.
	 *
	 * @param mixed $cta Raw CTA value.
	 * @return array{label:string,url:string,openInNewTab:bool}
	 */
	private static function sanitize_cta( $cta ) {
		if ( ! is_array( $cta ) ) {
			return array(
				'label'        => '',
				'url'          => '',
				'openInNewTab' => false,
			);
		}

		return array(
			'label'        => isset( $cta['label'] ) ? sanitize_text_field( $cta['label'] ) : '',
			'url'          => isset( $cta['url'] ) ? esc_url_raw( $cta['url'] ) : '',
			'openInNewTab' => ! empty( $cta['openInNewTab'] ),
		);
	}

	/**
	 * Sanitizes the per-item colour override sub-object. Only accepts
	 * valid hex colours (WordPress's own sanitize_hex_color()) — anything
	 * else is dropped rather than saved as a broken value.
	 *
	 * @param mixed $colors Raw colors value.
	 * @return array{background:string,text:string,accent:string}
	 */
	private static function sanitize_colors( $colors ) {
		if ( ! is_array( $colors ) ) {
			$colors = array();
		}

		return array(
			'background' => sanitize_hex_color( $colors['background'] ?? '' ) ?? '',
			'text'       => sanitize_hex_color( $colors['text'] ?? '' ) ?? '',
			'accent'     => sanitize_hex_color( $colors['accent'] ?? '' ) ?? '',
		);
	}

	/**
	 * The REST/JSON schema for a single item, used by register_post_meta()
	 * so the REST API validates and documents the shape automatically.
	 *
	 * @return array
	 */
	public static function get_item_schema() {
		return array(
			'type'       => 'object',
			'properties' => array(
				'id'            => array( 'type' => 'string' ),
				'title'         => array( 'type' => 'string' ),
				'description'   => array( 'type' => 'string' ),
				'url'           => array(
					'type'   => 'string',
					'format' => 'uri',
				),
				'linkLabel'     => array( 'type' => 'string' ),
				'openInNewTab'  => array( 'type' => 'boolean' ),
				'rel'           => array( 'type' => 'string' ),
				'nofollow'      => array( 'type' => 'boolean' ),
				'icon'          => array( 'type' => 'string' ),
				'image'         => array(
					'type'       => 'object',
					'properties' => array(
						'id'  => array( 'type' => 'integer' ),
						'url' => array( 'type' => 'string' ),
						'alt' => array( 'type' => 'string' ),
					),
				),
				'mobileImage'   => array(
					'type'       => 'object',
					'properties' => array(
						'id'  => array( 'type' => 'integer' ),
						'url' => array( 'type' => 'string' ),
						'alt' => array( 'type' => 'string' ),
					),
				),
				'badge'         => array( 'type' => 'string' ),
				'eyebrow'       => array( 'type' => 'string' ),
				'cta'           => array(
					'type'       => 'object',
					'properties' => array(
						'label'        => array( 'type' => 'string' ),
						'url'          => array( 'type' => 'string' ),
						'openInNewTab' => array( 'type' => 'boolean' ),
					),
				),
				'secondaryCta'  => array(
					'type'       => 'object',
					'properties' => array(
						'label'        => array( 'type' => 'string' ),
						'url'          => array( 'type' => 'string' ),
						'openInNewTab' => array( 'type' => 'boolean' ),
					),
				),
				'cssClass'      => array( 'type' => 'string' ),
				'featured'      => array( 'type' => 'boolean' ),
				'visible'       => array( 'type' => 'boolean' ),
				'order'         => array( 'type' => 'integer' ),
				'parentId'      => array( 'type' => 'string' ),
				'depth'         => array( 'type' => 'integer' ),
				'colors'        => array(
					'type'       => 'object',
					'properties' => array(
						'background' => array( 'type' => 'string' ),
						'text'       => array( 'type' => 'string' ),
						'accent'     => array( 'type' => 'string' ),
					),
				),
				'ariaLabel'     => array( 'type' => 'string' ),
				'dynamicSource' => array(
					'type'       => 'object',
					'properties' => array(
						'type'     => array( 'type' => 'string' ),
						'postType' => array( 'type' => 'string' ),
						'taxonomy' => array( 'type' => 'string' ),
						'term'     => array( 'type' => 'string' ),
						'count'    => array( 'type' => 'integer' ),
						'orderby'  => array( 'type' => 'string' ),
						'order'    => array( 'type' => 'string' ),
					),
				),
			),
		);
	}

	/**
	 * The REST/JSON schema for a dynamicSource object — shared by the
	 * per-item schema above and the panel-level dynamic source meta
	 * (used by the flat gallery/link-list layouts to populate their
	 * top-level items from a live query).
	 *
	 * @return array
	 */
	public static function get_dynamic_source_schema() {
		return array(
			'type'       => 'object',
			'properties' => array(
				'type'     => array( 'type' => 'string' ),
				'postType' => array( 'type' => 'string' ),
				'taxonomy' => array( 'type' => 'string' ),
				'term'     => array( 'type' => 'string' ),
				'count'    => array( 'type' => 'integer' ),
				'orderby'  => array( 'type' => 'string' ),
				'order'    => array( 'type' => 'string' ),
			),
		);
	}
}
