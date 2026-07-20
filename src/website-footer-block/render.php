<?php
/**
 * Server-side render for the Website Footer block.
 *
 * IMPORTANT — backward compatibility contract:
 * For every column whose `navigationSource` is "legacy" (the default —
 * therefore the value every column saved before this refactor resolves
 * to), and for every other attribute at its block.json default, this
 * template reproduces the previous static save.js output (now frozen as
 * `deprecatedV1` in deprecated.js) markup, classes, and inline style vars
 * exactly — with one deliberate, purely additive exception: nav-type
 * columns are now wrapped in a `<nav aria-label>` landmark for
 * accessibility (does not change any existing CSS selector, see
 * style.scss). Only opt-in attributes (a column's `navigationSource` set
 * to "primary"/"footer"/"menu", a column's `visible` set to false, or one
 * of the new column types) may otherwise change markup. Do not "fix" or
 * restyle the legacy paths here.
 *
 * Every function below is registered behind a function_exists() guard
 * because WordPress core `require`s this template fresh each time the
 * block renders — if the Footer block appears more than once on the same
 * page/request, this file is loaded more than once, and unguarded
 * `function foo() {}` declarations would cause a fatal redeclaration error.
 *
 * @var array    $attributes Block attributes (already merged with block.json defaults).
 * @var string   $content    Inner block content. Unused — this block has no innerBlocks.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'adaire_footer_style_vars_to_string' ) ) {
	/**
	 * Turns an associative array of CSS prop => value pairs into a style
	 * attribute string, skipping any entry whose value is '' or null —
	 * mirrors the JS pattern of `someValue || undefined` causing React to
	 * omit that property entirely.
	 */
	function adaire_footer_style_vars_to_string( $style_vars ) {
		$pairs = array();
		foreach ( $style_vars as $prop => $value ) {
			if ( '' === $value || null === $value ) {
				continue;
			}
			$pairs[] = $prop . ':' . $value;
		}
		return implode( ';', $pairs ) . ( $pairs ? ';' : '' );
	}
}

if ( ! function_exists( 'adaire_footer_font_size_class' ) ) {
	/**
	 * Mirrors save.js getFontSizeClass().
	 */
	function adaire_footer_font_size_class( $size ) {
		$sizes = array(
			'small'  => 'small',
			'medium' => 'medium',
			'large'  => 'large',
		);
		return isset( $sizes[ $size ] ) ? $sizes[ $size ] : 'medium';
	}
}

if ( ! function_exists( 'adaire_footer_icon_svg' ) ) {
	/**
	 * PHP port of save.js getIconSvg(). Markup is static/trusted (no user
	 * data interpolated), so it is safe to output directly.
	 */
	function adaire_footer_icon_svg( $icon ) {
		// width/height="1em" (not a fixed px value) so the glyph scales with
		// whatever inline font-size the caller sets from the Icon Size control —
		// a fixed px size here would leave the icon glyph static while only its
		// surrounding circle/box grew or shrank with that control.
		$icons = array(
			'twitter'   => '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
			'facebook'  => '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
			'instagram' => '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
			'linkedin'  => '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
			'youtube'   => '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
		);
		return isset( $icons[ $icon ] ) ? $icons[ $icon ] : $icons['twitter'];
	}
}

if ( ! function_exists( 'adaire_footer_register_nav_menu_locations' ) ) {
	/**
	 * Plugin-owned nav menu location slugs used to resolve a nav column's
	 * "Primary Menu" / "Footer Menu" Navigation Source options. Intentionally
	 * the SAME slugs the Header block uses (see
	 * src/header-block/render.php's identically-named function) so a site
	 * owner assigns one menu per location and both blocks can read it — this
	 * file defines its own copy rather than depending on header-block's
	 * render.php having been loaded, since either block may render without
	 * the other being present on the page. The locations themselves are
	 * registered on 'init' from the plugin bootstrap file (not here —
	 * render.php only runs when the block actually renders, which is too
	 * late for the locations to show up on the admin Appearance > Menus
	 * screen).
	 */
	function adaire_footer_register_nav_menu_locations() {
		return array(
			'primary' => 'adaire-blocks-primary',
			'footer'  => 'adaire-blocks-footer',
		);
	}
}

if ( ! function_exists( 'adaire_footer_resolve_menu_object' ) ) {
	/**
	 * Resolves a WP_Term menu object for a nav column's navigationSource of
	 * "primary", "footer", or "menu". Returns null if nothing is
	 * assigned/selected yet so callers can gracefully fall back to that
	 * column's legacy navItems.
	 */
	function adaire_footer_resolve_menu_object( $source, $selected_menu_id ) {
		if ( 'menu' === $source ) {
			$menu_id = $selected_menu_id ? (int) $selected_menu_id : 0;
			if ( ! $menu_id ) {
				return null;
			}
			$menu = wp_get_nav_menu_object( $menu_id );
			return $menu ? $menu : null;
		}

		if ( 'primary' === $source || 'footer' === $source ) {
			$locations_map = adaire_footer_register_nav_menu_locations();
			$location_slug = $locations_map[ $source ];
			$locations     = get_nav_menu_locations();

			if ( empty( $locations[ $location_slug ] ) ) {
				return null;
			}

			$menu = wp_get_nav_menu_object( $locations[ $location_slug ] );
			return $menu ? $menu : null;
		}

		return null;
	}
}

if ( ! function_exists( 'adaire_footer_build_menu_tree' ) ) {
	/**
	 * Assembles a flat wp_get_nav_menu_items() result into a nested tree via
	 * menu_item_parent. Same algorithm as
	 * adaire_header_build_menu_tree() in src/header-block/render.php.
	 */
	function adaire_footer_build_menu_tree( $menu_items ) {
		$by_parent = array();
		foreach ( $menu_items as $item ) {
			$parent = (int) $item->menu_item_parent;
			if ( ! isset( $by_parent[ $parent ] ) ) {
				$by_parent[ $parent ] = array();
			}
			$by_parent[ $parent ][] = $item;
		}

		$build = function ( $parent_id ) use ( &$build, $by_parent ) {
			if ( empty( $by_parent[ $parent_id ] ) ) {
				return array();
			}
			$nodes = array();
			foreach ( $by_parent[ $parent_id ] as $item ) {
				$nodes[] = array(
					'id'       => (int) $item->ID,
					'label'    => $item->title,
					'url'      => $item->url,
					'children' => $build( (int) $item->ID ),
				);
			}
			return $nodes;
		};

		return $build( 0 );
	}
}

if ( ! function_exists( 'adaire_footer_resolve_nav_items' ) ) {
	/**
	 * Single entry point used by the nav column renderer: decides between a
	 * column's legacy flat navItems attribute and a live WordPress menu, and
	 * always falls back to legacy items if a menu source is selected but
	 * nothing is actually assigned yet (so the column never silently renders
	 * empty just because a theme location isn't configured).
	 *
	 * @return array{items: array, dynamic: bool}
	 */
	function adaire_footer_resolve_nav_items( $column ) {
		$source       = isset( $column['navigationSource'] ) ? $column['navigationSource'] : 'legacy';
		$legacy_items = ( isset( $column['navItems'] ) && is_array( $column['navItems'] ) ) ? $column['navItems'] : array();

		if ( 'legacy' === $source || empty( $source ) ) {
			return array(
				'items'   => $legacy_items,
				'dynamic' => false,
			);
		}

		$menu = adaire_footer_resolve_menu_object( $source, isset( $column['selectedMenuId'] ) ? $column['selectedMenuId'] : 0 );
		if ( ! $menu ) {
			return array(
				'items'   => $legacy_items,
				'dynamic' => false,
			);
		}

		$menu_items = wp_get_nav_menu_items( $menu->term_id, array( 'update_post_term_cache' => false ) );
		if ( ! $menu_items ) {
			return array(
				'items'   => array(),
				'dynamic' => true,
			);
		}

		return array(
			'items'   => adaire_footer_build_menu_tree( $menu_items ),
			'dynamic' => true,
		);
	}
}

if ( ! function_exists( 'adaire_footer_render_nav_node' ) ) {
	/**
	 * Renders one WP-menu node and, recursively, its children. Footer nav
	 * trees use a plain always-visible nested list (no JS-driven disclosure)
	 * — simplest robust accessible pattern, and it needs no view.js changes.
	 */
	function adaire_footer_render_nav_node( $item, $link_style ) {
		$label    = isset( $item['label'] ) ? $item['label'] : '';
		$url      = ! empty( $item['url'] ) ? $item['url'] : '#';
		$children = ( isset( $item['children'] ) && is_array( $item['children'] ) ) ? $item['children'] : array();

		$style_attr = $link_style ? ( ' style="' . esc_attr( $link_style ) . '"' ) : '';
		$out        = '<li><a class="website-footer-block__nav-link" href="' . esc_url( $url ) . '"' . $style_attr . '>' . wp_kses_post( $label ) . '</a>';

		if ( ! empty( $children ) ) {
			$out .= '<ul class="website-footer-block__nav-sublist">';
			foreach ( $children as $child ) {
				$out .= adaire_footer_render_nav_node( $child, $link_style );
			}
			$out .= '</ul>';
		}

		$out .= '</li>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_nav_column_content' ) ) {
	/**
	 * Mirrors save.js's `column.type === 'nav'` branch, with an additional
	 * branch for WP-menu-sourced nested trees. The outer <ul> classes/style
	 * are identical either way so existing CSS keeps applying unchanged; the
	 * new <nav aria-label> landmark wraps both paths (additive a11y only,
	 * see the file-level comment above).
	 */
	function adaire_footer_render_nav_column_content( $column ) {
		$resolved               = adaire_footer_resolve_nav_items( $column );
		$list_style             = isset( $column['listStyle'] ) ? $column['listStyle'] : 'plain';
		$item_gap               = isset( $column['itemSpacing'] ) ? $column['itemSpacing'] : 12;
		// Base link color goes through --link-color (consumed by style.scss's
		// nav-link rule, which falls back to --footer-accent-color), not a
		// literal `color` declaration — an inline `color` here would
		// out-specificity the :hover rule below and hover color would never
		// visibly apply on the frontend, same bug already fixed for the
		// social icons elsewhere in this file.
		$link_color             = ! empty( $column['linkColor'] ) ? $column['linkColor'] : '';
		$hover_color            = ! empty( $column['linkHoverColor'] ) ? $column['linkHoverColor'] : '#ffffff';
		$hover_bg               = ! empty( $column['linkHoverBackgroundColor'] ) ? $column['linkHoverBackgroundColor'] : '';
		$underline              = ! empty( $column['linkUnderline'] );
		$hover_underline_color  = ! empty( $column['linkHoverUnderlineColor'] ) ? $column['linkHoverUnderlineColor'] : '';
		$wants_hover_underline  = $underline || ! empty( $hover_underline_color );
		$transition             = ( isset( $column['linkTransitionDuration'] ) && is_numeric( $column['linkTransitionDuration'] ) && $column['linkTransitionDuration'] >= 0 ) ? $column['linkTransitionDuration'] . 'ms' : '';
		$link_style             = adaire_footer_style_vars_to_string(
			array(
				'--link-color'                 => $link_color,
				'--link-hover-color'           => $hover_color,
				'--link-hover-bg'               => $hover_bg,
				'--link-hover-underline-color' => $hover_underline_color,
				'--link-underline-mode'         => $underline ? 'underline' : '',
				'--link-hover-underline-mode'   => $wants_hover_underline ? 'underline' : '',
				'--link-transition-duration'    => $transition,
			)
		);
		$nav_label              = ! empty( $column['headingText'] ) ? $column['headingText'] : __( 'Footer navigation', 'adaire-blocks' );

		$inner = '';
		if ( $resolved['dynamic'] ) {
			foreach ( $resolved['items'] as $item ) {
				$inner .= adaire_footer_render_nav_node( $item, $link_style );
			}
		} else {
			foreach ( $resolved['items'] as $item ) {
				$label      = isset( $item['label'] ) ? $item['label'] : '';
				$url        = ! empty( $item['url'] ) ? $item['url'] : '#';
				$inner     .= '<li><a class="website-footer-block__nav-link" href="' . esc_url( $url ) . '" style="' . esc_attr( $link_style ) . '">' . wp_kses_post( $label ) . '</a></li>';
			}
		}

		$out  = '<nav aria-label="' . esc_attr( wp_strip_all_tags( $nav_label ) ) . '">';
		$out .= '<ul class="website-footer-block__nav-list website-footer-block__nav-list--' . esc_attr( $list_style ) . '" style="gap:' . (int) $item_gap . 'px">';
		$out .= $inner;
		$out .= '</ul>';
		$out .= '</nav>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_brand_column_content' ) ) {
	/**
	 * Mirrors save.js's `column.type === 'brand'` branch. The CTA's icon
	 * spans are intentionally not rendered: in the current/legacy save.js,
	 * RichText.Content's `value` prop always wins over any `children` also
	 * passed to it, so those icon spans never actually appeared in the
	 * shipped output either — reproducing that (not "fixing" it) keeps this
	 * byte-identical to existing pages.
	 */
	function adaire_footer_render_brand_column_content( $column ) {
		$out = '';

		// `showLogo` is editor-only UI added after this block shipped; older
		// saved content has no such key, so absence must mean "show" (the
		// only behaviour that existed before) rather than "hide".
		$show_logo = ! isset( $column['showLogo'] ) || ! empty( $column['showLogo'] );

		if ( $show_logo && ! empty( $column['brandLogo'] ) ) {
			$alt  = isset( $column['brandName'] ) ? $column['brandName'] : '';
			$out .= '<img class="brand-logo" src="' . esc_url( $column['brandLogo'] ) . '" alt="' . esc_attr( wp_strip_all_tags( $alt ) ) . '" style="max-width:' . (int) ( isset( $column['brandLogoWidth'] ) ? $column['brandLogoWidth'] : 48 ) . 'px" />';
		}

		// `showBrandName` is editor-only UI added after this block shipped;
		// older saved content has no such key, so absence must mean "show it
		// if there's actually text" — a no-op for empty text, and it
		// preserves any real brand name a site owner already typed. New
		// columns get an explicit `showBrandName: false` default in
		// block.json, so the old "Your Brand" placeholder never appears
		// unless the user opts in and types something.
		$show_brand_name = isset( $column['showBrandName'] ) ? ! empty( $column['showBrandName'] ) : ! empty( $column['brandName'] );
		if ( $show_brand_name ) {
			$out .= '<div class="website-footer-block__brand-name">' . wp_kses_post( isset( $column['brandName'] ) ? $column['brandName'] : '' ) . '</div>';
		}

		// Tagline (ADAB-012): the `description` field is the de facto tagline
		// (it has no other use on this column type), now with its own
		// typography + color controls routed through CSS custom props —
		// mirrors edit.js's RichText style prop on the same element exactly,
		// so editor and frontend can never visually disagree.
		$tagline_font_size      = ( isset( $column['taglineFontSize'] ) && is_numeric( $column['taglineFontSize'] ) && $column['taglineFontSize'] >= 0 ) ? $column['taglineFontSize'] . 'px' : '';
		$tagline_font_weight    = ! empty( $column['taglineFontWeight'] ) ? $column['taglineFontWeight'] : '';
		$tagline_line_height    = ( isset( $column['taglineLineHeight'] ) && is_numeric( $column['taglineLineHeight'] ) && $column['taglineLineHeight'] >= 0 ) ? $column['taglineLineHeight'] : '';
		$tagline_letter_spacing = ( isset( $column['taglineLetterSpacing'] ) && is_numeric( $column['taglineLetterSpacing'] ) && $column['taglineLetterSpacing'] >= 0 ) ? $column['taglineLetterSpacing'] . 'px' : '';
		$tagline_color          = ! empty( $column['taglineColor'] ) ? $column['taglineColor'] : '';
		// Only override the legacy 0.9 opacity dimming once a tagline color is
		// explicitly chosen — see the matching style.scss comment for why.
		$tagline_opacity        = $tagline_color ? '1' : '';
		$tagline_style          = adaire_footer_style_vars_to_string(
			array(
				'--tagline-font-size'      => $tagline_font_size,
				'--tagline-font-weight'    => $tagline_font_weight,
				'--tagline-line-height'    => $tagline_line_height,
				'--tagline-letter-spacing' => $tagline_letter_spacing,
				'--tagline-color'          => $tagline_color,
				'--tagline-opacity'        => $tagline_opacity,
			)
		);
		$out .= '<p class="website-footer-block__brand-description"' . ( $tagline_style ? ' style="' . esc_attr( $tagline_style ) . '"' : '' ) . '>' . wp_kses_post( isset( $column['description'] ) ? $column['description'] : '' ) . '</p>';

		if ( ! empty( $column['showCta'] ) ) {
			$cta_style     = isset( $column['ctaStyle'] ) ? $column['ctaStyle'] : 'button';
			$is_button     = ( 'button' === $cta_style );
			$bg            = $is_button ? ( isset( $column['ctaBackgroundColor'] ) ? $column['ctaBackgroundColor'] : '' ) : 'transparent';
			$color         = $is_button ? ( isset( $column['ctaTextColor'] ) ? $column['ctaTextColor'] : '' ) : 'inherit';
			$hover_bg      = ! empty( $column['ctaHoverBackgroundColor'] ) ? $column['ctaHoverBackgroundColor'] : ( isset( $column['ctaBackgroundColor'] ) ? $column['ctaBackgroundColor'] : '' );
			$hover_color   = ! empty( $column['ctaHoverColor'] ) ? $column['ctaHoverColor'] : ( isset( $column['ctaTextColor'] ) ? $column['ctaTextColor'] : '' );
			$hover_border  = ! empty( $column['ctaHoverBorderColor'] ) ? $column['ctaHoverBorderColor'] : '';
			$border_radius = ( isset( $column['ctaBorderRadius'] ) && is_numeric( $column['ctaBorderRadius'] ) && $column['ctaBorderRadius'] >= 0 ) ? $column['ctaBorderRadius'] . 'px' : '';
			$transition    = ( isset( $column['ctaTransitionDuration'] ) && is_numeric( $column['ctaTransitionDuration'] ) && $column['ctaTransitionDuration'] >= 0 ) ? $column['ctaTransitionDuration'] . 'ms' : '';
			$style_string  = adaire_footer_style_vars_to_string(
				array(
					'background-color'           => $bg,
					'color'                       => $color,
					'--cta-hover-bg'              => $hover_bg,
					'--cta-hover-color'           => $hover_color,
					'--cta-hover-border-color'    => $hover_border,
					'--cta-border-radius'         => $border_radius,
					'--cta-transition-duration'   => $transition,
				)
			);

			$out .= '<a class="website-footer-block__cta website-footer-block__cta--' . esc_attr( $cta_style ) . '" href="' . esc_url( ! empty( $column['ctaUrl'] ) ? $column['ctaUrl'] : '#' ) . '"' . ( $style_string ? ' style="' . esc_attr( $style_string ) . '"' : '' ) . '>' . wp_kses_post( isset( $column['ctaText'] ) ? $column['ctaText'] : '' ) . '</a>';
		}

		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_social_column_content' ) ) {
	/**
	 * Mirrors save.js's `column.type === 'social'` branch.
	 */
	function adaire_footer_render_social_column_content( $column ) {
		$display_style  = ! empty( $column['displayStyle'] ) ? $column['displayStyle'] : 'vertical';
		$items          = ( isset( $column['socialItems'] ) && is_array( $column['socialItems'] ) ) ? $column['socialItems'] : array();
		$icon_size      = isset( $column['iconSize'] ) ? (int) $column['iconSize'] : 24;
		$icon_color     = isset( $column['iconColor'] ) ? $column['iconColor'] : '';
		$hover_color    = isset( $column['socialHoverColor'] ) ? $column['socialHoverColor'] : '';
		$hover_bg       = isset( $column['socialHoverBackgroundColor'] ) ? $column['socialHoverBackgroundColor'] : '';
		$border_color   = ! empty( $column['socialBorderColor'] ) ? $column['socialBorderColor'] : 'transparent';
		$hover_border   = isset( $column['socialHoverBorderColor'] ) ? $column['socialHoverBorderColor'] : '';
		$border_radius  = ( isset( $column['socialBorderRadius'] ) && is_numeric( $column['socialBorderRadius'] ) && $column['socialBorderRadius'] >= 0 ) ? $column['socialBorderRadius'] . '%' : '50%';
		$icon_spacing   = ( isset( $column['socialIconSpacing'] ) && is_numeric( $column['socialIconSpacing'] ) && $column['socialIconSpacing'] >= 0 ) ? $column['socialIconSpacing'] . 'px' : '';
		$transition_dur = ( isset( $column['socialTransitionDuration'] ) && is_numeric( $column['socialTransitionDuration'] ) && $column['socialTransitionDuration'] >= 0 ) ? $column['socialTransitionDuration'] : 300;

		$list_style = adaire_footer_style_vars_to_string( array( 'gap' => $icon_spacing ) );
		$out        = '<div class="website-footer-block__social-list website-footer-block__social-list--' . esc_attr( $display_style ) . '"' . ( $list_style ? ' style="' . esc_attr( $list_style ) . '"' : '' ) . '>';

		foreach ( $items as $item ) {
			$label = isset( $item['label'] ) ? $item['label'] : '';
			$url   = ! empty( $item['url'] ) ? $item['url'] : '#';

			$out .= '<div>';
			if ( 'vertical' === $display_style ) {
				// Base color goes through --social-icon-color (consumed by
				// style.scss's .social-list a rule), not a literal `color`
				// declaration, so the :hover rule's color can still win on hover.
				$style = adaire_footer_style_vars_to_string(
					array(
						'--social-icon-color'   => $icon_color,
						'--social-hover-color'  => $hover_color,
					)
				);
				$out  .= '<a href="' . esc_url( $url ) . '"' . ( $style ? ' style="' . esc_attr( $style ) . '"' : '' ) . '>' . wp_kses_post( $label ) . '</a>';
			} else {
				$icon_bg = ! empty( $column['iconBgColor'] ) ? $column['iconBgColor'] : 'rgba(255,255,255,0.1)';
				// Base color/background/border-color are passed as CSS custom
				// props (--social-icon-*), not as literal color/background-color/
				// border declarations — a literal inline declaration would beat
				// style.scss's &__social-icon:hover rule on specificity alone and
				// the hover colors below would never actually show up on hover.
				$style   = adaire_footer_style_vars_to_string(
					array(
						'display'         => 'inline-flex',
						'align-items'     => 'center',
						'justify-content' => 'center',
						'width'           => ( $icon_size + 12 ) . 'px',
						'height'          => ( $icon_size + 12 ) . 'px',
						'border-radius'   => $border_radius,
						'font-size'       => $icon_size . 'px',
						'transition'      => 'all ' . $transition_dur . 'ms ease',
						'--social-icon-color'         => $icon_color,
						'--social-icon-bg'            => $icon_bg,
						'--social-border-color'       => $border_color,
						'--social-hover-color'        => $hover_color,
						'--social-hover-bg'           => $hover_bg,
						'--social-hover-border-color' => $hover_border,
					)
				);
				$icon_key = ! empty( $item['icon'] ) ? $item['icon'] : ( isset( $item['platform'] ) ? $item['platform'] : '' );
				$out     .= '<a href="' . esc_url( $url ) . '" class="website-footer-block__social-icon" aria-label="' . esc_attr( wp_strip_all_tags( $label ) ) . '" target="_blank" rel="noopener noreferrer" style="' . esc_attr( $style ) . '">' . adaire_footer_icon_svg( $icon_key ) . '</a>';
			}
			$out .= '</div>';
		}

		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_newsletter_column_content' ) ) {
	/**
	 * New column type: a simple email-capture form. Submits as a normal
	 * (non-AJAX) form POST to whatever URL the site owner configures —
	 * wiring it to an actual mailing-list provider is left to that action
	 * attribute, matching the block's existing "bring your own URL" pattern
	 * used by every other link/button field in this block.
	 */
	function adaire_footer_render_newsletter_column_content( $column ) {
		$description  = isset( $column['newsletterDescription'] ) ? $column['newsletterDescription'] : '';
		$placeholder  = isset( $column['newsletterPlaceholder'] ) ? $column['newsletterPlaceholder'] : __( 'Enter your email', 'adaire-blocks' );
		$button_text  = isset( $column['newsletterButtonText'] ) ? $column['newsletterButtonText'] : __( 'Subscribe', 'adaire-blocks' );
		$action       = isset( $column['newsletterAction'] ) ? $column['newsletterAction'] : '';
		$field_name   = isset( $column['newsletterFieldName'] ) && $column['newsletterFieldName'] ? $column['newsletterFieldName'] : 'email';
		$button_color = isset( $column['newsletterButtonColor'] ) ? $column['newsletterButtonColor'] : '';
		$button_text_color = isset( $column['newsletterButtonTextColor'] ) ? $column['newsletterButtonTextColor'] : '';
		$input_border_color = isset( $column['newsletterInputBorderColor'] ) ? $column['newsletterInputBorderColor'] : '';

		$button_style = adaire_footer_style_vars_to_string(
			array(
				'background-color' => $button_color ? $button_color : 'var(--footer-accent-color, #503AA8)',
				'color'             => $button_text_color ? $button_text_color : '#ffffff',
			)
		);

		$input_style = $input_border_color
			? adaire_footer_style_vars_to_string( array( 'border-color' => $input_border_color ) )
			: '';

		$out = '<form class="website-footer-block__newsletter" method="post" action="' . esc_url( $action ? $action : '#' ) . '">';
		if ( $description ) {
			$out .= '<p class="website-footer-block__newsletter-description">' . wp_kses_post( $description ) . '</p>';
		}
		$out .= '<div class="website-footer-block__newsletter-field-row">';
		$out .= '<input type="email" name="' . esc_attr( $field_name ) . '" class="website-footer-block__newsletter-input" placeholder="' . esc_attr( $placeholder ) . '"' . ( $input_style ? ' style="' . esc_attr( $input_style ) . '"' : '' ) . ' required="required" />';
		$out .= '<button type="submit" class="website-footer-block__newsletter-button" style="' . esc_attr( $button_style ) . '">' . esc_html( $button_text ) . '</button>';
		$out .= '</div>';
		$out .= '</form>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_buttons_column_content' ) ) {
	/**
	 * New column type: a row/column of one or more independent buttons —
	 * distinct from the Brand column's single bundled CTA.
	 */
	function adaire_footer_render_buttons_column_content( $column ) {
		$layout = ! empty( $column['buttonsLayout'] ) ? $column['buttonsLayout'] : 'horizontal';
		$items  = ( isset( $column['buttonsItems'] ) && is_array( $column['buttonsItems'] ) ) ? $column['buttonsItems'] : array();

		$out = '<div class="website-footer-block__buttons website-footer-block__buttons--' . esc_attr( $layout ) . '">';

		foreach ( $items as $item ) {
			$style          = ! empty( $item['style'] ) ? $item['style'] : 'solid';
			$bg             = ! empty( $item['backgroundColor'] ) ? $item['backgroundColor'] : '';
			$text_color     = ! empty( $item['textColor'] ) ? $item['textColor'] : '';
			$hover_bg       = isset( $item['hoverBackgroundColor'] ) ? $item['hoverBackgroundColor'] : '';
			$hover_color    = isset( $item['hoverTextColor'] ) ? $item['hoverTextColor'] : '';
			$hover_border   = isset( $item['hoverBorderColor'] ) ? $item['hoverBorderColor'] : '';
			$border_radius  = ( isset( $item['borderRadius'] ) && is_numeric( $item['borderRadius'] ) && $item['borderRadius'] >= 0 ) ? $item['borderRadius'] . 'px' : '4px';
			$transition_dur = ( isset( $item['transitionDuration'] ) && is_numeric( $item['transitionDuration'] ) && $item['transitionDuration'] >= 0 ) ? $item['transitionDuration'] : 300;
			$style_attr     = adaire_footer_style_vars_to_string(
				array(
					'background-color' => 'solid' === $style ? ( $bg ? $bg : 'var(--footer-accent-color, #503AA8)' ) : 'transparent',
					'color'             => $text_color ? $text_color : ( 'solid' === $style ? '#ffffff' : 'inherit' ),
					'border-color'      => $bg ? $bg : 'var(--footer-accent-color, #503AA8)',
					'border-radius'     => $border_radius,
					'transition'        => 'all ' . $transition_dur . 'ms ease',
					'--buttons-hover-bg'           => $hover_bg,
					'--buttons-hover-color'        => $hover_color,
					'--buttons-hover-border-color' => $hover_border,
				)
			);
			$new_tab_attr = ! empty( $item['newTab'] ) ? ' target="_blank" rel="noopener noreferrer"' : '';

			$out .= '<a href="' . esc_url( ! empty( $item['url'] ) ? $item['url'] : '#' ) . '" class="website-footer-block__buttons-item website-footer-block__buttons-item--' . esc_attr( $style ) . '" style="' . esc_attr( $style_attr ) . '"' . $new_tab_attr . '>' . wp_kses_post( isset( $item['label'] ) ? $item['label'] : '' ) . '</a>';
		}

		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_copyright_column_content' ) ) {
	/**
	 * New column type: a standalone copyright line, independent of the Top
	 * Bar / Bottom Bar zone-level copyright fields. The literal substring
	 * "{year}" (if present) is replaced with the current year — purely
	 * opt-in convenience, plain text without it behaves exactly as typed.
	 */
	function adaire_footer_render_copyright_column_content( $column ) {
		$text = isset( $column['copyrightText'] ) ? $column['copyrightText'] : '';
		$text = str_replace( '{year}', date_i18n( 'Y' ), $text );
		return '<div class="website-footer-block__copyright-block"><p>' . wp_kses_post( $text ) . '</p></div>';
	}
}

if ( ! function_exists( 'adaire_footer_render_widget_area_column_content' ) ) {
	/**
	 * New column type: a classic WP widget area (sidebar), registered in
	 * adaire-blocks.php as adaire-footer-widget-1..4. Renders nothing on the
	 * live site if no area is selected or the area has no widgets — avoids
	 * leaving an empty box for real visitors. (The editor canvas shows its
	 * own "choose a widget area" placeholder instead; see edit.js.)
	 */
	function adaire_footer_render_widget_area_column_content( $column ) {
		$widget_area_id = isset( $column['widgetAreaId'] ) ? $column['widgetAreaId'] : '';
		if ( ! $widget_area_id || ! is_active_sidebar( $widget_area_id ) ) {
			return '';
		}

		ob_start();
		dynamic_sidebar( $widget_area_id );
		$widgets_html = ob_get_clean();

		return '<div class="website-footer-block__widget-area">' . $widgets_html . '</div>';
	}
}

if ( ! function_exists( 'adaire_footer_render_column' ) ) {
	/**
	 * Mirrors one iteration of save.js's columnsSection.columns.map(...).
	 * Returns '' for a column explicitly marked invisible (column.visible
	 * === false) — absent/true behaves exactly as before this attribute
	 * existed.
	 */
	function adaire_footer_render_column( $column ) {
		if ( isset( $column['visible'] ) && false === $column['visible'] ) {
			return '';
		}

		$type          = isset( $column['type'] ) ? $column['type'] : 'nav';
		$text_align    = isset( $column['textAlign'] ) ? $column['textAlign'] : 'left';
		$width         = isset( $column['width'] ) ? $column['width'] : 'auto';
		$flex_basis    = ( 'auto' !== $width ) ? $width : 'auto';
		$mobile_prio   = isset( $column['mobilePriority'] ) ? $column['mobilePriority'] : 999;
		$text_color    = isset( $column['textColor'] ) ? $column['textColor'] : '';

		$wrapper_style = adaire_footer_style_vars_to_string(
			array(
				'text-align'         => $text_align,
				'flex-basis'         => $flex_basis,
				'--mobile-priority'  => $mobile_prio,
				'color'              => $text_color,
			)
		);

		$out = '<div class="website-footer-block__column website-footer-block__column--' . esc_attr( $type ) . '"' . ( $wrapper_style ? ' style="' . esc_attr( $wrapper_style ) . '"' : '' ) . '>';

		if ( ! empty( $column['showHeading'] ) ) {
			$heading_tag   = isset( $column['headingTag'] ) ? $column['headingTag'] : 'h3';
			$heading_style = adaire_footer_style_vars_to_string( array( 'color' => isset( $column['headingColor'] ) ? $column['headingColor'] : '' ) );
			$out          .= '<' . tag_escape( $heading_tag ) . ' class="website-footer-block__column-heading"' . ( $heading_style ? ' style="' . esc_attr( $heading_style ) . '"' : '' ) . '>' . wp_kses_post( isset( $column['headingText'] ) ? $column['headingText'] : '' ) . '</' . tag_escape( $heading_tag ) . '>';
		}

		switch ( $type ) {
			case 'brand':
				$out .= adaire_footer_render_brand_column_content( $column );
				break;
			case 'nav':
				$out .= adaire_footer_render_nav_column_content( $column );
				break;
			case 'social':
				$out .= adaire_footer_render_social_column_content( $column );
				break;
			case 'custom':
				$out .= '<div class="website-footer-block__custom-content">' . wp_kses_post( isset( $column['customContent'] ) ? $column['customContent'] : '' ) . '</div>';
				break;
			case 'newsletter':
				$out .= adaire_footer_render_newsletter_column_content( $column );
				break;
			case 'buttons':
				$out .= adaire_footer_render_buttons_column_content( $column );
				break;
			case 'copyright':
				$out .= adaire_footer_render_copyright_column_content( $column );
				break;
			case 'widget-area':
				$out .= adaire_footer_render_widget_area_column_content( $column );
				break;
		}

		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_top_bar' ) ) {
	/**
	 * Mirrors save.js's Top Bar zone exactly.
	 */
	function adaire_footer_render_top_bar( $attributes ) {
		if ( empty( $attributes['showTopBar'] ) ) {
			return '';
		}

		$top_bar    = isset( $attributes['topBar'] ) && is_array( $attributes['topBar'] ) ? $attributes['topBar'] : array();
		$font_class = adaire_footer_font_size_class( isset( $top_bar['fontSize'] ) ? $top_bar['fontSize'] : 'medium' );
		$alignment  = isset( $top_bar['alignment'] ) ? $top_bar['alignment'] : 'space-between';

		$bar_style = adaire_footer_style_vars_to_string(
			array(
				'text-align'       => ( 'space-between' === $alignment ) ? 'left' : $alignment,
				'background-color' => ! empty( $top_bar['backgroundColor'] ) ? $top_bar['backgroundColor'] : 'transparent',
				'padding'          => ( isset( $top_bar['paddingVertical'] ) ? (int) $top_bar['paddingVertical'] : 20 ) . 'px 0',
				'border-bottom'    => ! empty( $top_bar['showDivider'] ) ? '1px solid rgba(255,255,255,0.1)' : 'none',
			)
		);

		$out  = '<div class="website-footer-block__top-bar website-footer-block__top-bar--' . esc_attr( $font_class ) . '"' . ( $bar_style ? ' style="' . esc_attr( $bar_style ) . '"' : '' ) . '>';
		$out .= '<div class="website-footer-block__top-bar-content">';
		$out .= '<div class="website-footer-block__top-bar-copyright">';

		if ( ! empty( $top_bar['showCopyright'] ) ) {
			$out .= '<p>' . wp_kses_post( isset( $top_bar['copyrightText'] ) ? $top_bar['copyrightText'] : '' ) . '</p>';
		}
		if ( ! empty( $top_bar['showContactLink'] ) ) {
			$contact_underline       = ! empty( $top_bar['contactLinkUnderline'] );
			$contact_hover_color     = ! empty( $top_bar['contactLinkHoverColor'] ) ? $top_bar['contactLinkHoverColor'] : '';
			$contact_hover_bg        = ! empty( $top_bar['contactLinkHoverBackgroundColor'] ) ? $top_bar['contactLinkHoverBackgroundColor'] : '';
			$contact_hover_underline = ! empty( $top_bar['contactLinkHoverUnderlineColor'] ) ? $top_bar['contactLinkHoverUnderlineColor'] : '';
			$contact_wants_hover_ul  = $contact_underline || ! empty( $contact_hover_underline );
			$contact_transition      = ( isset( $top_bar['contactLinkTransitionDuration'] ) && is_numeric( $top_bar['contactLinkTransitionDuration'] ) && $top_bar['contactLinkTransitionDuration'] >= 0 ) ? $top_bar['contactLinkTransitionDuration'] . 'ms' : '';
			$contact_style           = adaire_footer_style_vars_to_string(
				array(
					'--contact-underline-mode'        => $contact_underline ? 'underline' : '',
					'--contact-hover-color'           => $contact_hover_color,
					'--contact-hover-bg'              => $contact_hover_bg,
					'--contact-hover-underline-color' => $contact_hover_underline,
					'--contact-hover-underline-mode'  => $contact_wants_hover_ul ? 'underline' : '',
					'--contact-transition-duration'   => $contact_transition,
				)
			);
			$out .= '<span class="website-footer-block__separator"> | </span>';
			$out .= '<a class="website-footer-block__contact-link" href="' . esc_url( isset( $top_bar['contactLinkUrl'] ) ? $top_bar['contactLinkUrl'] : '#' ) . '"' . ( $contact_style ? ' style="' . esc_attr( $contact_style ) . '"' : '' ) . '>' . wp_kses_post( isset( $top_bar['contactLinkText'] ) ? $top_bar['contactLinkText'] : '' ) . '</a>';
		}

		$out .= '</div>'; // .top-bar-copyright

		if ( ! empty( $top_bar['showSocialMedia'] ) ) {
			$links          = ( isset( $top_bar['socialLinks'] ) && is_array( $top_bar['socialLinks'] ) ) ? $top_bar['socialLinks'] : array();
			$icon_size      = isset( $top_bar['iconSize'] ) ? (int) $top_bar['iconSize'] : 24;
			$icon_color     = isset( $top_bar['iconColor'] ) ? $top_bar['iconColor'] : '';
			$icon_bg        = ! empty( $top_bar['iconBgColor'] ) ? $top_bar['iconBgColor'] : 'rgba(255,255,255,0.1)';
			$hover_color    = isset( $top_bar['hoverColor'] ) ? $top_bar['hoverColor'] : '';
			$hover_bg       = isset( $top_bar['hoverBackgroundColor'] ) ? $top_bar['hoverBackgroundColor'] : '';
			$border_color   = ! empty( $top_bar['borderColor'] ) ? $top_bar['borderColor'] : 'transparent';
			$hover_border   = isset( $top_bar['hoverBorderColor'] ) ? $top_bar['hoverBorderColor'] : '';
			$border_radius  = ( isset( $top_bar['borderRadius'] ) && is_numeric( $top_bar['borderRadius'] ) && $top_bar['borderRadius'] >= 0 ) ? $top_bar['borderRadius'] . '%' : '50%';
			$icon_spacing   = ( isset( $top_bar['iconSpacing'] ) && is_numeric( $top_bar['iconSpacing'] ) && $top_bar['iconSpacing'] >= 0 ) ? $top_bar['iconSpacing'] . 'px' : '';
			$transition_dur = ( isset( $top_bar['transitionDuration'] ) && is_numeric( $top_bar['transitionDuration'] ) && $top_bar['transitionDuration'] >= 0 ) ? $top_bar['transitionDuration'] : 300;

			$social_wrap_style = adaire_footer_style_vars_to_string( array( 'gap' => $icon_spacing ) );
			$out  .= '<div class="website-footer-block__top-bar-social"' . ( $social_wrap_style ? ' style="' . esc_attr( $social_wrap_style ) . '"' : '' ) . '>';
			foreach ( $links as $link ) {
				$label = isset( $link['label'] ) ? $link['label'] : '';
				$url   = ! empty( $link['url'] ) ? $link['url'] : '#';
				$out  .= '<div class="website-footer-block__social-link-wrapper">';
				if ( isset( $link['displayStyle'] ) && 'icon' === $link['displayStyle'] ) {
					// Base color/background/border-color go through CSS custom props
					// (--social-icon-*), not literal declarations — see the social
					// column's identical comment above for why.
					$icon_style = adaire_footer_style_vars_to_string(
						array(
							'display'                     => 'inline-flex',
							'align-items'                  => 'center',
							'justify-content'              => 'center',
							'width'                        => ( $icon_size + 12 ) . 'px',
							'height'                       => ( $icon_size + 12 ) . 'px',
							'border-radius'                => $border_radius,
							'font-size'                    => $icon_size . 'px',
							'transition'                   => 'all ' . $transition_dur . 'ms ease',
							'--social-icon-color'          => $icon_color,
							'--social-icon-bg'             => $icon_bg,
							'--social-border-color'        => $border_color,
							'--social-hover-color'         => $hover_color,
							'--social-hover-bg'            => $hover_bg,
							'--social-hover-border-color'  => $hover_border,
						)
					);
					$out .= '<a href="' . esc_url( $url ) . '" class="website-footer-block__social-icon" aria-label="' . esc_attr( wp_strip_all_tags( $label ) ) . '" target="_blank" rel="noopener noreferrer" style="' . esc_attr( $icon_style ) . '">' . adaire_footer_icon_svg( isset( $link['platform'] ) ? $link['platform'] : '' ) . '</a>';
				} else {
					$out .= '<a href="' . esc_url( $url ) . '">' . wp_kses_post( $label ) . '</a>';
				}
				$out .= '</div>';
			}
			$out .= '</div>'; // .top-bar-social
		}

		$out .= '</div>'; // .top-bar-content
		$out .= '</div>'; // .top-bar

		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_columns_section' ) ) {
	/**
	 * Mirrors save.js's Columns Section zone exactly, delegating each
	 * column to adaire_footer_render_column().
	 */
	function adaire_footer_render_columns_section( $attributes ) {
		if ( empty( $attributes['showColumnsSection'] ) ) {
			return '';
		}

		$columns_section = isset( $attributes['columnsSection'] ) && is_array( $attributes['columnsSection'] ) ? $attributes['columnsSection'] : array();
		$columns         = ( isset( $columns_section['columns'] ) && is_array( $columns_section['columns'] ) ) ? $columns_section['columns'] : array();
		$align_map       = array(
			'top'    => 'flex-start',
			'center' => 'center',
			'bottom' => 'flex-end',
		);
		$vertical_align  = isset( $columns_section['verticalAlignment'] ) ? $columns_section['verticalAlignment'] : 'top';
		$align_items     = isset( $align_map[ $vertical_align ] ) ? $align_map[ $vertical_align ] : 'flex-start';
		$grid_style      = adaire_footer_style_vars_to_string(
			array(
				'gap'         => ( isset( $columns_section['columnGap'] ) ? (int) $columns_section['columnGap'] : 40 ) . 'px',
				'align-items' => $align_items,
			)
		);

		$out  = '<div class="website-footer-block__columns-section">';
		$out .= '<div class="website-footer-block__columns-grid"' . ( $grid_style ? ' style="' . esc_attr( $grid_style ) . '"' : '' ) . '>';
		foreach ( $columns as $column ) {
			$out .= adaire_footer_render_column( $column );
		}
		$out .= '</div>'; // .columns-grid
		$out .= '</div>'; // .columns-section

		return $out;
	}
}

if ( ! function_exists( 'adaire_footer_render_bottom_bar' ) ) {
	/**
	 * Mirrors save.js's Bottom Bar zone exactly.
	 */
	function adaire_footer_render_bottom_bar( $attributes ) {
		if ( empty( $attributes['showBottomBar'] ) ) {
			return '';
		}

		$bottom_bar = isset( $attributes['bottomBar'] ) && is_array( $attributes['bottomBar'] ) ? $attributes['bottomBar'] : array();
		$alignment  = isset( $bottom_bar['alignment'] ) ? $bottom_bar['alignment'] : 'space-between';

		$bar_style = adaire_footer_style_vars_to_string(
			array(
				'text-align'       => ( 'space-between' === $alignment ) ? 'left' : $alignment,
				'background-color' => ! empty( $bottom_bar['backgroundColor'] ) ? $bottom_bar['backgroundColor'] : 'transparent',
				'padding'          => ( isset( $bottom_bar['paddingVertical'] ) ? (int) $bottom_bar['paddingVertical'] : 20 ) . 'px 0',
				'border-top'       => ! empty( $bottom_bar['showDivider'] ) ? '1px solid rgba(255,255,255,0.1)' : 'none',
			)
		);

		$out  = '<div class="website-footer-block__bottom-bar"' . ( $bar_style ? ' style="' . esc_attr( $bar_style ) . '"' : '' ) . '>';
		$out .= '<div class="website-footer-block__bottom-bar-content">';

		$copyright_style = adaire_footer_style_vars_to_string( array( 'color' => isset( $bottom_bar['textColor'] ) ? $bottom_bar['textColor'] : '' ) );
		$out             .= '<div class="website-footer-block__bottom-bar-copyright"' . ( $copyright_style ? ' style="' . esc_attr( $copyright_style ) . '"' : '' ) . '>';
		if ( ! empty( $bottom_bar['showCopyright'] ) ) {
			$out .= '<p>' . wp_kses_post( isset( $bottom_bar['copyrightText'] ) ? $bottom_bar['copyrightText'] : '' ) . '</p>';
		}
		$out .= '</div>'; // .bottom-bar-copyright

		if ( ! empty( $bottom_bar['showPrivacyPolicy'] ) ) {
			$legal_links            = ( isset( $bottom_bar['legalLinks'] ) && is_array( $bottom_bar['legalLinks'] ) ) ? $bottom_bar['legalLinks'] : array();
			$separator              = isset( $bottom_bar['separator'] ) ? $bottom_bar['separator'] : '·';
			$legal_underline        = ! empty( $bottom_bar['legalLinkUnderline'] );
			$legal_hover_color      = ! empty( $bottom_bar['legalLinkHoverColor'] ) ? $bottom_bar['legalLinkHoverColor'] : '';
			$legal_hover_bg         = ! empty( $bottom_bar['legalLinkHoverBackgroundColor'] ) ? $bottom_bar['legalLinkHoverBackgroundColor'] : '';
			$legal_hover_underline  = ! empty( $bottom_bar['legalLinkHoverUnderlineColor'] ) ? $bottom_bar['legalLinkHoverUnderlineColor'] : '';
			$legal_wants_hover_ul   = $legal_underline || ! empty( $legal_hover_underline );
			$legal_transition       = ( isset( $bottom_bar['legalLinkTransitionDuration'] ) && is_numeric( $bottom_bar['legalLinkTransitionDuration'] ) && $bottom_bar['legalLinkTransitionDuration'] >= 0 ) ? $bottom_bar['legalLinkTransitionDuration'] . 'ms' : '';
			$legal_color            = adaire_footer_style_vars_to_string(
				array(
					'color'                          => isset( $bottom_bar['legalLinkColor'] ) ? $bottom_bar['legalLinkColor'] : '',
					'--legal-underline-mode'         => $legal_underline ? 'underline' : '',
					'--legal-hover-color'            => $legal_hover_color,
					'--legal-hover-bg'               => $legal_hover_bg,
					'--legal-hover-underline-color'  => $legal_hover_underline,
					'--legal-hover-underline-mode'   => $legal_wants_hover_ul ? 'underline' : '',
					'--legal-transition-duration'    => $legal_transition,
				)
			);
			$out          .= '<div class="website-footer-block__bottom-bar-legal">';
			$index = 0;
			foreach ( $legal_links as $link ) {
				$out .= '<span class="website-footer-block__legal-link-wrapper">';
				if ( $index > 0 ) {
					$out .= '<span class="website-footer-block__separator">' . esc_html( $separator ) . '</span>';
				}
				$link_url = ! empty( $link['url'] ) ? $link['url'] : '#';
				// Low-priority feature: if this is the (default, static) "Privacy
				// Policy" legal link and the site has a WP Privacy Policy page
				// configured, swap in its real URL automatically — no new
				// editor UI/toggle, matching the chosen "auto-replace" scope.
				if ( isset( $link['label'] ) && 'privacy policy' === strtolower( trim( wp_strip_all_tags( $link['label'] ) ) ) && function_exists( 'get_privacy_policy_url' ) ) {
					$live_privacy_url = get_privacy_policy_url();
					if ( ! empty( $live_privacy_url ) ) {
						$link_url = $live_privacy_url;
					}
				}
				$out .= '<a class="website-footer-block__legal-link" href="' . esc_url( $link_url ) . '"' . ( $legal_color ? ' style="' . esc_attr( $legal_color ) . '"' : '' ) . '>' . wp_kses_post( isset( $link['label'] ) ? $link['label'] : '' ) . '</a>';
				$out .= '</span>';
				++$index;
			}
			$out .= '</div>'; // .bottom-bar-legal
		}

		if ( ! empty( $bottom_bar['showSocialIcons'] ) ) {
			$social_icons   = ( isset( $bottom_bar['socialIcons'] ) && is_array( $bottom_bar['socialIcons'] ) ) ? $bottom_bar['socialIcons'] : array();
			$icon_size      = isset( $bottom_bar['iconSize'] ) ? (int) $bottom_bar['iconSize'] : 24;
			$icon_color     = isset( $bottom_bar['iconColor'] ) ? $bottom_bar['iconColor'] : '';
			$icon_bg        = ! empty( $bottom_bar['iconBgColor'] ) ? $bottom_bar['iconBgColor'] : 'rgba(255,255,255,0.1)';
			$hover_color    = isset( $bottom_bar['hoverColor'] ) ? $bottom_bar['hoverColor'] : '';
			$hover_bg       = isset( $bottom_bar['hoverBackgroundColor'] ) ? $bottom_bar['hoverBackgroundColor'] : '';
			$border_color   = ! empty( $bottom_bar['borderColor'] ) ? $bottom_bar['borderColor'] : 'transparent';
			$hover_border   = isset( $bottom_bar['hoverBorderColor'] ) ? $bottom_bar['hoverBorderColor'] : '';
			$border_radius  = ( isset( $bottom_bar['borderRadius'] ) && is_numeric( $bottom_bar['borderRadius'] ) && $bottom_bar['borderRadius'] >= 0 ) ? $bottom_bar['borderRadius'] . '%' : '50%';
			$icon_spacing   = ( isset( $bottom_bar['iconSpacing'] ) && is_numeric( $bottom_bar['iconSpacing'] ) && $bottom_bar['iconSpacing'] >= 0 ) ? $bottom_bar['iconSpacing'] . 'px' : '';
			$transition_dur = ( isset( $bottom_bar['transitionDuration'] ) && is_numeric( $bottom_bar['transitionDuration'] ) && $bottom_bar['transitionDuration'] >= 0 ) ? $bottom_bar['transitionDuration'] : 300;

			$social_wrap_style = adaire_footer_style_vars_to_string( array( 'gap' => $icon_spacing ) );
			$out         .= '<div class="website-footer-block__bottom-bar-social"' . ( $social_wrap_style ? ' style="' . esc_attr( $social_wrap_style ) . '"' : '' ) . '>';
			foreach ( $social_icons as $link ) {
				$label      = isset( $link['label'] ) ? $link['label'] : '';
				$url        = ! empty( $link['url'] ) ? $link['url'] : '#';
				// Base color/background/border-color go through CSS custom props
				// (--social-icon-*), not literal declarations — see the social
				// column's identical comment above for why.
				$icon_style = adaire_footer_style_vars_to_string(
					array(
						'display'                     => 'inline-flex',
						'align-items'                  => 'center',
						'justify-content'              => 'center',
						'width'                        => ( $icon_size + 12 ) . 'px',
						'height'                       => ( $icon_size + 12 ) . 'px',
						'border-radius'                => $border_radius,
						'font-size'                    => $icon_size . 'px',
						'transition'                   => 'all ' . $transition_dur . 'ms ease',
						'--social-icon-color'          => $icon_color,
						'--social-icon-bg'             => $icon_bg,
						'--social-border-color'        => $border_color,
						'--social-hover-color'         => $hover_color,
						'--social-hover-bg'            => $hover_bg,
						'--social-hover-border-color'  => $hover_border,
					)
				);
				$out .= '<a href="' . esc_url( $url ) . '" class="website-footer-block__social-icon" aria-label="' . esc_attr( wp_strip_all_tags( $label ) ) . '" target="_blank" rel="noopener noreferrer" style="' . esc_attr( $icon_style ) . '">' . adaire_footer_icon_svg( isset( $link['icon'] ) ? $link['icon'] : '' ) . '</a>';
			}
			$out .= '</div>'; // .bottom-bar-social
		}

		$out .= '</div>'; // .bottom-bar-content
		$out .= '</div>'; // .bottom-bar

		return $out;
	}
}

// ---------------------------------------------------------------------
// Render.
// ---------------------------------------------------------------------

$typography = array_merge(
	array(
		'fontFamily'         => 'inherit',
		'baseFontSize'       => 14,
		'headingFontSize'    => 16,
		'headingFontWeight'  => '600',
		'navFontWeight'      => '400',
		'linkFontWeight'     => '400',
		'ctaFontWeight'      => '500',
	),
	( isset( $attributes['typography'] ) && is_array( $attributes['typography'] ) ) ? $attributes['typography'] : array()
);

$background_type = isset( $attributes['backgroundType'] ) ? $attributes['backgroundType'] : 'solid';
$background_value = 'solid' === $background_type
	? ( ! empty( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '#1a1a1a' )
	: ( 'gradient' === $background_type ? ( isset( $attributes['backgroundGradient'] ) ? $attributes['backgroundGradient'] : '' ) : 'transparent' );

$style_string = adaire_footer_style_vars_to_string(
	array(
		'background-color'            => $background_value,
		'background-image'            => ( 'image' === $background_type ) ? ( 'url(' . ( isset( $attributes['backgroundImage'] ) ? $attributes['backgroundImage'] : '' ) . ')' ) : 'none',
		'background-size'              => ( 'image' === $background_type ) ? 'cover' : 'auto',
		'background-position'          => ( 'image' === $background_type ) ? 'center' : 'auto',
		'background-repeat'            => ( 'image' === $background_type ) ? 'no-repeat' : 'repeat',
		'color'                        => ! empty( $attributes['textColor'] ) ? $attributes['textColor'] : '#ffffff',
		'padding-top'                  => ( isset( $attributes['paddingTop'] ) ? (int) $attributes['paddingTop'] : 60 ) . 'px',
		'padding-bottom'               => ( isset( $attributes['paddingBottom'] ) ? (int) $attributes['paddingBottom'] : 40 ) . 'px',
		'margin-top'                   => ( isset( $attributes['marginTop'] ) ? (int) $attributes['marginTop'] : 0 ) . 'px',
		'margin-bottom'                => ( isset( $attributes['marginBottom'] ) ? (int) $attributes['marginBottom'] : 0 ) . 'px',
		'--footer-accent-color'        => ! empty( $attributes['accentColor'] ) ? $attributes['accentColor'] : '#503AA8',
		'--footer-max-width'           => ( isset( $attributes['maxWidth'] ) ? (int) $attributes['maxWidth'] : 1200 ) . 'px',
		'--footer-font-family'         => ! empty( $attributes['fontFamily'] ) ? $attributes['fontFamily'] : $typography['fontFamily'],
		'--footer-base-font-size'      => $typography['baseFontSize'] . 'px',
		'--footer-heading-font-size'   => $typography['headingFontSize'] . 'px',
		'--footer-heading-font-weight' => $typography['headingFontWeight'],
		'--footer-nav-font-weight'     => $typography['navFontWeight'],
		'--footer-link-font-weight'    => $typography['linkFontWeight'],
		'--footer-cta-font-weight'     => $typography['ctaFontWeight'],
	)
);

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'website-footer-block',
		'style' => $style_string,
	)
);

$html  = '<footer ' . $wrapper_attributes . '>';
$html .= '<div class="website-footer-block__container">';
$html .= adaire_footer_render_top_bar( $attributes );
$html .= adaire_footer_render_columns_section( $attributes );
$html .= adaire_footer_render_bottom_bar( $attributes );
$html .= '</div>'; // .website-footer-block__container
$html .= '</footer>';

echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every dynamic value above is escaped at the point of interpolation.
