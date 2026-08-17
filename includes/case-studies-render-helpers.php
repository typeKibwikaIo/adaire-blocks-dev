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

if ( ! function_exists( 'adaire_case_studies_placeholder_color' ) ) {
	/**
	 * Deterministic HSL color for a case study with no Hero Image, so
	 * multiple un-imaged cards are visually distinguishable instead of all
	 * showing the same flat gray box. Same seed always produces the same
	 * color — the JS port of this (view.js / edit.js) matches so the
	 * placeholder never flashes a different color between server render
	 * and client-side (editor/popup) render.
	 */
	function adaire_case_studies_placeholder_color( $seed ) {
		$hash = crc32( (string) $seed );
		$hue  = $hash % 360;
		return sprintf( 'hsl(%d, 45%%, 28%%)', $hue );
	}
}

if ( ! function_exists( 'adaire_case_studies_placeholder_initials' ) ) {
	/**
	 * Up to two initials from a case study title, shown centered over the
	 * placeholder color when there's no Hero Image.
	 */
	function adaire_case_studies_placeholder_initials( $title ) {
		$words    = array_filter( preg_split( '/\s+/', trim( wp_strip_all_tags( (string) $title ) ) ) );
		$initials = '';
		foreach ( array_slice( $words, 0, 2 ) as $word ) {
			$initials .= mb_strtoupper( mb_substr( $word, 0, 1 ) );
		}
		return '' !== $initials ? $initials : '•';
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

			// Hero Image: the uploaded Featured Image wins if set, otherwise
			// falls back to the Hero Image URL field — see
			// AdaireCaseStudiesCPT::get_hero_image_url(). Either way this is
			// the single canonical preview used everywhere the case study is
			// represented — the grid card, the popup, navigation "peek"
			// previews, and the large hero on the case study's own page. The
			// Website URL below never generates this automatically.
			$background_image = class_exists( 'AdaireCaseStudiesCPT' )
				? AdaireCaseStudiesCPT::get_hero_image_url( $post->ID, 'large' )
				: get_the_post_thumbnail_url( $post->ID, 'large' );

			// Fully rendered post content (blocks/shortcodes/wpautop applied)
			// — the case study's free-form write-up, built with the native
			// block editor rather than fixed Challenge/Solution/Results
			// fields, so authors can mix text, images, galleries, video,
			// quotes, or anything else the project needs.
			$rendered_content = apply_filters( 'the_content', $post->post_content );

			$studies[] = array(
				'id'               => $post->ID,
				'title'            => get_the_title( $post ),
				'description'      => $description,
				'backgroundImage'  => $background_image ? $background_image : '',
				'permalink'        => get_permalink( $post ),
				'linkUrl'          => (string) get_post_meta( $post->ID, '_adaire_case_link_url', true ),
				'openInNewTab'     => (bool) get_post_meta( $post->ID, '_adaire_case_open_in_new_tab', true ),
				'industries'       => is_array( $industry_terms ) ? array_values( $industry_terms ) : array(),
				'capabilities'     => is_array( $capability_terms ) ? array_values( $capability_terms ) : array(),
				'client'           => (string) get_post_meta( $post->ID, '_adaire_case_client', true ),
				'country'          => (string) get_post_meta( $post->ID, '_adaire_case_country', true ),
				'language'         => (string) get_post_meta( $post->ID, '_adaire_case_language', true ),
				'technology'       => (string) get_post_meta( $post->ID, '_adaire_case_technology', true ),
				'summary'          => (string) get_post_meta( $post->ID, '_adaire_case_summary', true ),
				'likes'            => (int) get_post_meta( $post->ID, '_adaire_case_likes', true ),
				'authorId'         => (int) $post->post_author,
				'authorName'       => get_the_author_meta( 'display_name', $post->post_author ),
				'authorAvatar'     => get_avatar_url( $post->post_author, array( 'size' => 64 ) ),
				'authorProfileUrl' => get_author_posts_url( $post->post_author ),
				'content'          => $rendered_content,
				'galleryItems'     => array(),
			);
		}

		wp_reset_postdata();

		return $studies;
	}
}

if ( ! function_exists( 'adaire_case_studies_related' ) ) {
	/**
	 * Picks "More by [author]" and "Similar sites" studies out of an
	 * already-fetched list (e.g. the full array from adaire_case_studies_from_cpt())
	 * — no extra queries needed since the block/template already load every
	 * published study up front for client-side filtering.
	 *
	 * @param array $all_studies Full study list (from adaire_case_studies_from_cpt()).
	 * @param array $current     The study currently open in the popup / being viewed.
	 * @param int   $limit       Max items per group.
	 * @return array{more_by_author: array, similar: array}
	 */
	function adaire_case_studies_related( $all_studies, $current, $limit = 3 ) {
		$current_id        = isset( $current['id'] ) ? (int) $current['id'] : 0;
		$current_author    = isset( $current['authorId'] ) ? (int) $current['authorId'] : 0;
		$current_industries = isset( $current['industries'] ) && is_array( $current['industries'] ) ? $current['industries'] : array();
		$current_caps      = isset( $current['capabilities'] ) && is_array( $current['capabilities'] ) ? $current['capabilities'] : array();

		$more_by_author = array();
		$similar        = array();
		$used_ids       = array( $current_id );

		foreach ( $all_studies as $study ) {
			if ( (int) $study['id'] === $current_id ) {
				continue;
			}
			if ( count( $more_by_author ) < $limit && $current_author && (int) $study['authorId'] === $current_author ) {
				$more_by_author[] = $study;
				$used_ids[]       = $study['id'];
			}
		}

		foreach ( $all_studies as $study ) {
			if ( count( $similar ) >= $limit ) {
				break;
			}
			if ( in_array( $study['id'], $used_ids, true ) ) {
				continue;
			}
			$shares_industry = ! empty( $current_industries ) && ! empty( $study['industries'] )
				&& count( array_intersect( $current_industries, $study['industries'] ) ) > 0;
			$shares_capability = ! empty( $current_caps ) && ! empty( $study['capabilities'] )
				&& count( array_intersect( $current_caps, $study['capabilities'] ) ) > 0;
			if ( $shares_industry || $shares_capability ) {
				$similar[]  = $study;
				$used_ids[] = $study['id'];
			}
		}

		// Backfill "Similar sites" with the newest remaining studies if
		// nothing shared a taxonomy term, so the section still has content.
		if ( count( $similar ) < $limit ) {
			foreach ( $all_studies as $study ) {
				if ( count( $similar ) >= $limit ) {
					break;
				}
				if ( in_array( $study['id'], $used_ids, true ) ) {
					continue;
				}
				$similar[]  = $study;
				$used_ids[] = $study['id'];
			}
		}

		return array(
			'more_by_author' => $more_by_author,
			'similar'        => $similar,
		);
	}
}

if ( ! function_exists( 'adaire_case_studies_render_card' ) ) {
	/**
	 * Card markup — "Made in Webflow" showcase style: one large preview
	 * image (portfolio-scale, not a small thumbnail), the title and author
	 * below it, and up to two tag chips (Industry + first Capability) when
	 * present. Cards are real links to each case study's own page (clicking
	 * opens the popup instead via view.js, except for modified clicks /
	 * no-JS, which fall through to this href).
	 */
	function adaire_case_studies_render_card( $study, $index, $is_initially_hidden ) {
		$classes = 'ad-case-studies__card' . ( $is_initially_hidden ? ' ad-case-studies__card--hidden' : '' );
		$has_bg  = ! empty( $study['backgroundImage'] );
		$href    = ! empty( $study['permalink'] ) ? $study['permalink'] : '#';
		$likes   = isset( $study['likes'] ) ? (int) $study['likes'] : 0;

		$thumb = $has_bg
			? sprintf( '<img class="ad-case-studies__card-thumb" src="%1$s" alt="%2$s" loading="lazy" decoding="async" />', esc_url( $study['backgroundImage'] ), esc_attr( isset( $study['title'] ) ? $study['title'] : '' ) )
			: sprintf(
				'<div class="ad-case-studies__card-thumb ad-case-studies__card-thumb--placeholder" style="background:%1$s;"><span class="ad-case-studies__card-thumb-initials">%2$s</span></div>',
				esc_attr( adaire_case_studies_placeholder_color( isset( $study['id'] ) ? $study['id'] : ( isset( $study['title'] ) ? $study['title'] : '' ) ) ),
				esc_html( adaire_case_studies_placeholder_initials( isset( $study['title'] ) ? $study['title'] : '' ) )
			);

		// Up to two tag chips: Industries first, then Capabilities, in order.
		$tag_labels = array();
		if ( ! empty( $study['industries'] ) && is_array( $study['industries'] ) ) {
			foreach ( $study['industries'] as $ind ) {
				if ( count( $tag_labels ) >= 2 ) {
					break;
				}
				$tag_labels[] = $ind;
			}
		}
		if ( ! empty( $study['capabilities'] ) && is_array( $study['capabilities'] ) ) {
			foreach ( $study['capabilities'] as $cap ) {
				if ( count( $tag_labels ) >= 2 ) {
					break;
				}
				$tag_labels[] = $cap;
			}
		}
		$tags_html = '';
		if ( ! empty( $tag_labels ) ) {
			$tags_html = '<div class="ad-case-studies__card-tags">' . implode(
				'',
				array_map(
					function ( $label ) {
						return '<span class="ad-case-studies__card-tag">' . esc_html( $label ) . '</span>';
					},
					$tag_labels
				)
			) . '</div>';
		}

		$search_text = strtolower( trim( ( isset( $study['title'] ) ? $study['title'] : '' ) . ' ' . ( isset( $study['authorName'] ) ? $study['authorName'] : '' ) ) );

		return sprintf(
			'<a href="%1$s" class="%2$s" data-id="%3$s" data-industries="%4$s" data-capabilities="%5$s" data-index="%6$d" data-likes="%14$d" data-search="%15$s" aria-label="%7$s">'
				. '<div class="ad-case-studies__card-media">%8$s</div>'
				. '<div class="ad-case-studies__card-footer">'
					. '<img class="ad-case-studies__card-avatar" src="%9$s" alt="" loading="lazy" width="32" height="32" />'
					. '<div class="ad-case-studies__card-meta">'
						. '<span class="ad-case-studies__card-title">%10$s</span>'
						. '<span class="ad-case-studies__card-author">%11$s</span>'
					. '</div>'
					. '<span class="ad-case-studies__card-likes"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 21s-6.7-4.35-9.33-8.2C.6 9.77 1.6 6.2 4.8 5.02c2-.74 4-.1 5.2 1.53A4.65 4.65 0 0115.2 5c3.2 1.18 4.2 4.75 2.13 7.8C18.7 16.65 12 21 12 21z"/></svg>%12$d</span>'
				. '</div>'
				. '%13$s'
			. '</a>',
			esc_url( $href ),
			esc_attr( $classes ),
			esc_attr( isset( $study['id'] ) ? $study['id'] : $index ),
			esc_attr( wp_json_encode( isset( $study['industries'] ) ? $study['industries'] : array() ) ),
			esc_attr( wp_json_encode( isset( $study['capabilities'] ) ? $study['capabilities'] : array() ) ),
			(int) $index,
			esc_attr( isset( $study['title'] ) ? $study['title'] : '' ),
			$thumb,
			esc_url( isset( $study['authorAvatar'] ) ? $study['authorAvatar'] : '' ),
			esc_html( isset( $study['title'] ) ? $study['title'] : '' ),
			esc_html( isset( $study['authorName'] ) ? $study['authorName'] : '' ),
			$likes,
			$tags_html,
			$likes,
			esc_attr( $search_text )
		);
	}
}
