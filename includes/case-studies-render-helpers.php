<?php
/**
 * Shared render helpers for Case Studies Management (`adaire_case_study`).
 *
 * Used by both the Case Studies block (src/case-studies-block/render.php)
 * and the single case-study page template (templates/single-adaire_case_study.php)
 * so the two never drift out of sync on what a "study" looks like or how a
 * grid card is markup'd. Loaded once, unconditionally, from the main plugin
 * file — unlike render.php (which WordPress can `require` more than once per
 * request for repeated block instances), this file is only ever included
 * once, so the function_exists() guards here are just cheap insurance.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'adaire_case_studies_format_dimension' ) ) {
	/**
	 * PHP port of save.js formatDimensionValue().
	 */
	function adaire_case_studies_format_dimension( $dimension, $fallback_value, $fallback_unit ) {
		$value = ( isset( $dimension['value'] ) && '' !== $dimension['value'] ) ? $dimension['value'] : $fallback_value;
		$unit  = ! empty( $dimension['unit'] ) ? $dimension['unit'] : $fallback_unit;
		return $value . $unit;
	}
}

if ( ! function_exists( 'adaire_case_studies_from_cpt' ) ) {
	/**
	 * Builds the "study" shape both the block grid and the single-page
	 * template need, sourced live from the adaire_case_study post type.
	 * Gallery items are intentionally left empty — the frontend (view.js)
	 * falls back to a single gallery item built from title/description/
	 * backgroundImage when galleryItems is empty.
	 *
	 * @param array $args {
	 *     @type int[] $exclude        Post IDs to leave out (e.g. the current
	 *                                 case study on its own "Read more" grid).
	 *     @type int   $posts_per_page -1 for all.
	 * }
	 */
	function adaire_case_studies_from_cpt( $args = array() ) {
		if ( ! post_type_exists( 'adaire_case_study' ) ) {
			return array();
		}

		$defaults = array(
			'exclude'        => array(),
			'posts_per_page' => -1,
		);
		$args = wp_parse_args( $args, $defaults );

		$query = new WP_Query(
			array(
				'post_type'      => 'adaire_case_study',
				'post_status'    => 'publish',
				'posts_per_page' => $args['posts_per_page'],
				'post__not_in'   => array_map( 'intval', (array) $args['exclude'] ),
				'orderby'        => 'menu_order date',
				'order'          => 'DESC',
				'no_found_rows'  => true,
			)
		);

		$studies = array();

		foreach ( $query->posts as $post ) {
			$industry_terms   = wp_get_post_terms( $post->ID, 'adaire_case_industry', array( 'fields' => 'names' ) );
			$capability_terms = wp_get_post_terms( $post->ID, 'adaire_case_capability', array( 'fields' => 'names' ) );

			$description = has_excerpt( $post )
				? get_the_excerpt( $post )
				: wp_trim_words( wp_strip_all_tags( $post->post_content ), 30 );

			$background_image = get_the_post_thumbnail_url( $post->ID, 'large' );

			// Fully rendered post content (blocks/shortcodes/wpautop applied)
			// — this is what the popup's right column shows for the
			// Challenge/Solution/Results write-up. Only needed when the
			// popup can actually use it; still cheap enough to always
			// include since the block already embeds full study data for
			// client-side filtering.
			$rendered_content = apply_filters( 'the_content', $post->post_content );

			$studies[] = array(
				'id'              => $post->ID,
				'title'           => get_the_title( $post ),
				'description'     => $description,
				'backgroundImage' => $background_image ? $background_image : '',
				'permalink'       => get_permalink( $post ),
				'linkUrl'         => (string) get_post_meta( $post->ID, '_adaire_case_link_url', true ),
				'openInNewTab'    => (bool) get_post_meta( $post->ID, '_adaire_case_open_in_new_tab', true ),
				'industry'        => ( is_array( $industry_terms ) && ! empty( $industry_terms ) ) ? $industry_terms[0] : '',
				'capabilities'    => is_array( $capability_terms ) ? array_values( $capability_terms ) : array(),
				'client'          => (string) get_post_meta( $post->ID, '_adaire_case_client', true ),
				'country'         => (string) get_post_meta( $post->ID, '_adaire_case_country', true ),
				'language'        => (string) get_post_meta( $post->ID, '_adaire_case_language', true ),
				'technology'      => (string) get_post_meta( $post->ID, '_adaire_case_technology', true ),
				'summary'         => (string) get_post_meta( $post->ID, '_adaire_case_summary', true ),
				'content'         => $rendered_content,
				'galleryItems'    => array(),
			);
		}

		wp_reset_postdata();

		return $studies;
	}
}

if ( ! function_exists( 'adaire_case_studies_render_card' ) ) {
	/**
	 * PHP port of save.js's per-card markup — same classes, data attributes,
	 * and inline background style as the JS version. Cards are real links to
	 * each case study's own page.
	 */
	function adaire_case_studies_render_card( $study, $index, $is_initially_hidden ) {
		$classes = 'ad-case-studies__card' . ( $is_initially_hidden ? ' ad-case-studies__card--hidden' : '' );
		$has_bg  = ! empty( $study['backgroundImage'] );
		$style   = $has_bg
			? 'background-image:url(' . esc_url( $study['backgroundImage'] ) . ');background-color:transparent'
			: 'background-image:none;background-color:var(--cs-card-bg-color, #374151)';
		$href    = ! empty( $study['permalink'] ) ? $study['permalink'] : '#';

		return sprintf(
			'<a href="%1$s" class="%2$s" data-id="%3$s" data-industry="%4$s" data-capabilities="%5$s" data-index="%6$d" aria-label="%7$s" style="%8$s">'
				. '<div class="ad-case-studies__card-overlay">'
					. '<div class="ad-case-studies__card-content">'
						. '<h3 class="ad-case-studies__card-title">%9$s</h3>'
						. '<p class="ad-case-studies__card-description">%10$s</p>'
					. '</div>'
				. '</div>'
			. '</a>',
			esc_url( $href ),
			esc_attr( $classes ),
			esc_attr( isset( $study['id'] ) ? $study['id'] : $index ),
			esc_attr( isset( $study['industry'] ) ? $study['industry'] : '' ),
			esc_attr( wp_json_encode( isset( $study['capabilities'] ) ? $study['capabilities'] : array() ) ),
			(int) $index,
			esc_attr( isset( $study['title'] ) ? $study['title'] : '' ),
			esc_attr( $style ),
			esc_html( isset( $study['title'] ) ? $study['title'] : '' ),
			esc_html( isset( $study['description'] ) ? $study['description'] : '' )
		);
	}
}
