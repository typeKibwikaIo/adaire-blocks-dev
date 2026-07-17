<?php
/**
 * Server-side render for the Header block.
 *
 * IMPORTANT — backward compatibility contract:
 * When `navigationSource` is "legacy" (the default value registered in
 * block.json, and therefore the value every block saved before this
 * refactor will resolve to), this template must produce markup, classes,
 * inline style vars, and CSS-var names that are byte-identical to the
 * previous static save.js output (now frozen as `deprecatedV3` in
 * deprecated.js). Only opt-in attributes (navigationSource set to
 * "primary"/"footer"/"menu", or non-default mobile attributes) may change
 * markup. Do not "fix" or restyle the legacy path here.
 *
 * Every function below is registered behind a function_exists() guard
 * because WordPress core `require`s this template fresh each time the
 * block renders — if the Header block appears more than once on the same
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

if ( ! function_exists( 'adaire_header_get_action_radius' ) ) {
	/**
	 * Mirrors save.js getActionRadius().
	 */
	function adaire_header_get_action_radius( $shape ) {
		switch ( $shape ) {
			case 'square':
				return '0px';
			case 'rounded':
				return '10px';
			case 'pill':
			default:
				return '999px';
		}
	}
}

if ( ! function_exists( 'adaire_header_box_to_css' ) ) {
	/**
	 * PHP port of src/components/spacing-utils.js boxToCss().
	 * A BoxControl-style { top, right, bottom, left } object becomes a CSS
	 * shorthand string, or '' when the box has no values (so untouched
	 * blocks keep producing identical markup).
	 */
	function adaire_header_box_to_css( $box ) {
		if ( empty( $box ) || ! is_array( $box ) ) {
			return '';
		}

		$top    = isset( $box['top'] ) ? $box['top'] : '';
		$right  = isset( $box['right'] ) ? $box['right'] : '';
		$bottom = isset( $box['bottom'] ) ? $box['bottom'] : '';
		$left   = isset( $box['left'] ) ? $box['left'] : '';

		if ( '' === $top && '' === $right && '' === $bottom && '' === $left ) {
			return '';
		}

		return ( $top ? $top : '0' ) . ' ' . ( $right ? $right : '0' ) . ' ' . ( $bottom ? $bottom : '0' ) . ' ' . ( $left ? $left : '0' );
	}
}

if ( ! function_exists( 'adaire_header_get_style_vars' ) ) {
	/**
	 * Mirrors save.js getHeaderStyle() exactly (same CSS var names/values,
	 * same conditional inclusion logic). Deliberately does NOT add the
	 * background-image vars that edit.js's copy of this function has —
	 * save.js never applied those to the frontend, so neither does this.
	 */
	function adaire_header_get_style_vars( $attributes ) {
		$background = ! empty( $attributes['transparentHeader'] )
			? 'transparent'
			: ( ! empty( $attributes['useGradient'] ) ? $attributes['gradientBackground'] : $attributes['backgroundColor'] );

		$topbar_justify_map = array(
			'space-between' => 'space-between',
			'left'          => 'flex-start',
			'center'        => 'center',
			'right'         => 'flex-end',
		);
		$topbar_justify = isset( $topbar_justify_map[ $attributes['topBarLayout'] ] )
			? $topbar_justify_map[ $attributes['topBarLayout'] ]
			: 'space-between';

		$styles = array(
			'--adaire-header-background'              => $background,
			'--adaire-header-text-color'               => $attributes['textColor'],
			'--adaire-header-hover-color'               => $attributes['hoverColor'],
			'--adaire-header-border-color'              => $attributes['borderColor'],
			'--adaire-header-border-width'              => ! empty( $attributes['borderBottom'] ) ? $attributes['borderThickness'] . 'px' : '0px',
			'--adaire-header-padding-top'                => $attributes['paddingTop'] . 'px',
			'--adaire-header-padding-bottom'             => $attributes['paddingBottom'] . 'px',
			'--adaire-header-max-width'                  => ( 'contained' === $attributes['maxWidthMode'] ) ? $attributes['maxWidth'] . 'px' : '100%',
			'--adaire-header-nav-gap'                    => $attributes['navSpacing'] . 'px',
			'--adaire-header-nav-font-size'              => $attributes['navFontSize'] . 'px',
			'--adaire-header-nav-font-weight'            => $attributes['navFontWeight'],
			'--adaire-header-letter-spacing'             => $attributes['letterSpacing'] . 'px',
			'--adaire-header-text-transform'             => $attributes['textTransform'],
			'--adaire-header-logo-width'                 => $attributes['logoWidth'] . 'px',
			'--adaire-header-mobile-logo-width'          => $attributes['mobileLogoWidth'] . 'px',
			'--adaire-header-topbar-bg'                  => $attributes['topBarBackgroundColor'],
			'--adaire-header-topbar-color'               => $attributes['topBarTextColor'],
			'--adaire-header-topbar-font-size'           => ( ! empty( $attributes['topBarFontSize'] ) ? $attributes['topBarFontSize'] : 13 ) . 'px',
			'--adaire-header-topbar-justify'             => $topbar_justify,
			'--adaire-header-topbar-gap'                 => ( 'space-between' === $attributes['topBarLayout'] ) ? '24px' : '12px',
			'--adaire-header-social-size'                => $attributes['socialIconSize'] . 'px',
			'--adaire-header-social-color'                => $attributes['socialIconColor'],
			'--adaire-header-nav-icon-color'             => $attributes['navIconColor'],
			'--adaire-header-z-index'                    => $attributes['zIndex'],
			'--adaire-header-action-radius'              => adaire_header_get_action_radius( $attributes['buttonShape'] ),
			'--adaire-header-hamburger-border'           => ! empty( $attributes['hamburgerBorder'] ) ? ( '1px solid ' . $attributes['hamburgerBorderColor'] ) : 'none',
			'--adaire-header-hamburger-border-radius'    => $attributes['hamburgerBorderRadius'] . 'px',
			'--adaire-header-search-icon-size'           => ( ! empty( $attributes['searchIconSize'] ) ? $attributes['searchIconSize'] : 18 ) . 'px',
			'--adaire-header-search-btn-size'            => ( ! empty( $attributes['searchButtonSize'] ) ? $attributes['searchButtonSize'] : 38 ) . 'px',
		);

		if ( ! empty( $attributes['searchIconColor'] ) ) {
			$styles['--adaire-header-search-icon-color'] = $attributes['searchIconColor'];
		}
		if ( ! empty( $attributes['searchIconBgColor'] ) ) {
			$styles['--adaire-header-search-btn-bg'] = $attributes['searchIconBgColor'];
		}
		if ( ! empty( $attributes['signInBgColor'] ) ) {
			$styles['--adaire-header-signin-bg'] = $attributes['signInBgColor'];
		}
		if ( ! empty( $attributes['signInTextColor'] ) ) {
			$styles['--adaire-header-signin-text'] = $attributes['signInTextColor'];
		}
		if ( ! empty( $attributes['signInBorderColor'] ) ) {
			$styles['--adaire-header-signin-border'] = $attributes['signInBorderColor'];
		}
		if ( ! empty( $attributes['signUpBgColor'] ) ) {
			$styles['--adaire-header-signup-bg'] = $attributes['signUpBgColor'];
		}
		if ( ! empty( $attributes['signUpTextColor'] ) ) {
			$styles['--adaire-header-signup-text'] = $attributes['signUpTextColor'];
		}
		if ( ! empty( $attributes['signUpBorderColor'] ) ) {
			$styles['--adaire-header-signup-border'] = $attributes['signUpBorderColor'];
		}
		if ( ! empty( $attributes['ctaBgColor'] ) ) {
			$styles['--adaire-header-cta-bg'] = $attributes['ctaBgColor'];
		}
		if ( ! empty( $attributes['ctaTextColor'] ) ) {
			$styles['--adaire-header-cta-text'] = $attributes['ctaTextColor'];
		}
		if ( ! empty( $attributes['ctaBorderColor'] ) ) {
			$styles['--adaire-header-cta-border'] = $attributes['ctaBorderColor'];
		}

		$margin_css  = adaire_header_box_to_css( isset( $attributes['AdaireBlocksMargin'] ) ? $attributes['AdaireBlocksMargin'] : null );
		$padding_css = adaire_header_box_to_css( isset( $attributes['AdaireBlocksPadding'] ) ? $attributes['AdaireBlocksPadding'] : null );
		if ( $margin_css ) {
			$styles['margin'] = $margin_css;
		}
		if ( $padding_css ) {
			$styles['padding'] = $padding_css;
		}

		return $styles;
	}
}

if ( ! function_exists( 'adaire_header_style_vars_to_string' ) ) {
	function adaire_header_style_vars_to_string( $style_vars ) {
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

if ( ! function_exists( 'adaire_header_icon_svg' ) ) {
	/**
	 * PHP port of icon-utils.js HeaderIcon. Markup is static/trusted (no
	 * user data interpolated), so it is safe to output directly.
	 */
	function adaire_header_icon_svg( $name ) {
		if ( empty( $name ) || 'none' === $name ) {
			return '';
		}

		$c = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

		$paths = array(
			'arrow-right' => '<path ' . $c . ' d="M5 12h14" /><path ' . $c . ' d="m12 5 7 7-7 7" />',
			'user'        => '<path ' . $c . ' d="M20 21a8 8 0 0 0-16 0" /><circle ' . $c . ' cx="12" cy="7" r="4" />',
			'user-plus'   => '<path ' . $c . ' d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle ' . $c . ' cx="9" cy="7" r="4" /><path ' . $c . ' d="M19 8v6" /><path ' . $c . ' d="M22 11h-6" />',
			'login'       => '<path ' . $c . ' d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path ' . $c . ' d="m10 17 5-5-5-5" /><path ' . $c . ' d="M15 12H3" />',
			'home'        => '<path ' . $c . ' d="m3 11 9-8 9 8" /><path ' . $c . ' d="M5 10v10h14V10" />',
			'info'        => '<circle ' . $c . ' cx="12" cy="12" r="10" /><path ' . $c . ' d="M12 16v-4" /><path ' . $c . ' d="M12 8h.01" />',
			'grid'        => '<rect ' . $c . ' x="3" y="3" width="7" height="7" /><rect ' . $c . ' x="14" y="3" width="7" height="7" /><rect ' . $c . ' x="14" y="14" width="7" height="7" /><rect ' . $c . ' x="3" y="14" width="7" height="7" />',
			'mail'        => '<rect ' . $c . ' x="3" y="5" width="18" height="14" rx="2" /><path ' . $c . ' d="m3 7 9 6 9-6" />',
			'search'      => '<circle ' . $c . ' cx="11" cy="11" r="8" /><path ' . $c . ' d="m21 21-4.3-4.3" />',
		);

		$path = isset( $paths[ $name ] ) ? $paths[ $name ] : $paths['arrow-right'];

		return '<svg class="adaire-header-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">' . $path . '</svg>';
	}
}

if ( ! function_exists( 'adaire_header_render_logo' ) ) {
	/**
	 * Mirrors save.js Logo().
	 */
	function adaire_header_render_logo( $attributes ) {
		if ( 'image' === $attributes['logoType'] && ! empty( $attributes['logoImageUrl'] ) ) {
			$alt     = ! empty( $attributes['logoImageAlt'] ) ? $attributes['logoImageAlt'] : $attributes['logoText'];
			$content = '<img src="' . esc_url( $attributes['logoImageUrl'] ) . '" alt="' . esc_attr( $alt ) . '" />';
		} else {
			$content = '<span class="adaire-header-logo-text">' . esc_html( $attributes['logoText'] ) . '</span>';
		}

		$inner = ! empty( $attributes['linkLogoHome'] )
			? ( '<a href="' . esc_url( ! empty( $attributes['logoUrl'] ) ? $attributes['logoUrl'] : '/' ) . '" class="adaire-header-logo-link">' . $content . '</a>' )
			: $content;

		$tagline = '';
		if ( ! empty( $attributes['showTagline'] ) ) {
			$tagline = '<span class="adaire-header-tagline">' . esc_html( $attributes['tagline'] ) . '</span>';
		}

		return '<div class="adaire-header-logo">' . $inner . $tagline . '</div>';
	}
}

if ( ! function_exists( 'adaire_header_register_nav_menu_locations' ) ) {
	/**
	 * Plugin-owned nav menu location slugs used to resolve the "Primary
	 * Menu" / "Footer Menu" Navigation Source options. The locations
	 * themselves are registered on 'init' from the plugin bootstrap files
	 * (not here — render.php only runs when the block actually renders,
	 * which is too late for the locations to show up on the admin
	 * Appearance > Menus screen).
	 */
	function adaire_header_register_nav_menu_locations() {
		return array(
			'primary' => 'adaire-blocks-primary',
			'footer'  => 'adaire-blocks-footer',
		);
	}
}

if ( ! function_exists( 'adaire_header_resolve_menu_object' ) ) {
	/**
	 * Resolves a WP_Term menu object for navigationSource "primary",
	 * "footer", or "menu". Returns null if nothing is assigned/selected yet
	 * so callers can gracefully fall back to the legacy navItems.
	 */
	function adaire_header_resolve_menu_object( $attributes ) {
		$source = isset( $attributes['navigationSource'] ) ? $attributes['navigationSource'] : 'legacy';

		if ( 'menu' === $source ) {
			$menu_id = ! empty( $attributes['selectedMenuId'] ) ? (int) $attributes['selectedMenuId'] : 0;
			if ( ! $menu_id ) {
				return null;
			}
			$menu = wp_get_nav_menu_object( $menu_id );
			return $menu ? $menu : null;
		}

		if ( 'primary' === $source || 'footer' === $source ) {
			$locations_map = adaire_header_register_nav_menu_locations();
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

if ( ! function_exists( 'adaire_header_build_menu_tree' ) ) {
	/**
	 * Assembles a flat wp_get_nav_menu_items() result into a nested tree via
	 * menu_item_parent, rather than using wp_nav_menu()'s default walker —
	 * this keeps full control over markup/classes/ARIA wiring.
	 */
	function adaire_header_build_menu_tree( $menu_items ) {
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

if ( ! function_exists( 'adaire_header_resolve_nav' ) ) {
	/**
	 * Single entry point used by the nav renderer: decides between the
	 * legacy flat navItems attribute and a live WordPress menu, and always
	 * falls back to legacy items if a menu source is selected but nothing
	 * is actually assigned yet (so the header never silently renders empty
	 * just because a theme location isn't configured).
	 *
	 * @return array{items: array, dynamic: bool}
	 */
	function adaire_header_resolve_nav( $attributes ) {
		$source       = isset( $attributes['navigationSource'] ) ? $attributes['navigationSource'] : 'legacy';
		$legacy_items = ( isset( $attributes['navItems'] ) && is_array( $attributes['navItems'] ) ) ? $attributes['navItems'] : array();

		if ( 'legacy' === $source || empty( $source ) ) {
			return array(
				'items'   => $legacy_items,
				'dynamic' => false,
			);
		}

		$menu = adaire_header_resolve_menu_object( $attributes );
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
			'items'   => adaire_header_build_menu_tree( $menu_items ),
			'dynamic' => true,
		);
	}
}

if ( ! function_exists( 'adaire_header_render_menu_node' ) ) {
	/**
	 * Renders one nested WP-menu node (and recursively its children) as an
	 * accessible disclosure: a real, always-navigable <a> for the item
	 * itself, plus — only when it has children — a separate
	 * aria-expanded/aria-haspopup/aria-controls <button> that reveals the
	 * submenu. Supports unlimited depth via recursion.
	 */
	function adaire_header_render_menu_node( $item, $depth ) {
		$label    = isset( $item['label'] ) ? $item['label'] : '';
		$url      = ! empty( $item['url'] ) ? $item['url'] : '#';
		$children = ( isset( $item['children'] ) && is_array( $item['children'] ) ) ? $item['children'] : array();
		$has_kids = ! empty( $children );

		$out = '<li class="adaire-header-menu-item' . ( $has_kids ? ' has-children' : '' ) . '">';

		if ( ! $has_kids ) {
			$out .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>';
			$out .= '</li>';
			return $out;
		}

		$submenu_id = 'adaire-submenu-' . ( ! empty( $item['id'] ) ? (int) $item['id'] : wp_unique_id( 'adaire-submenu-' ) );

		$out .= '<span class="adaire-header-menu-item-row">';
		$out .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>';
		$out .= '<button type="button" class="adaire-header-submenu-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="' . esc_attr( $submenu_id ) . '">';
		$out .= '<svg class="adaire-header-submenu-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>';
		$out .= '<span class="screen-reader-text">' . esc_html__( 'Toggle submenu', 'header-block' ) . '</span>';
		$out .= '</button>';
		$out .= '</span>';

		$out .= '<ul id="' . esc_attr( $submenu_id ) . '" class="adaire-header-submenu" data-depth="' . esc_attr( $depth + 1 ) . '">';
		foreach ( $children as $child ) {
			$out .= adaire_header_render_menu_node( $child, $depth + 1 );
		}
		$out .= '</ul>';

		$out .= '</li>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_menu_tree' ) ) {
	function adaire_header_render_menu_tree( $items ) {
		if ( empty( $items ) ) {
			return '';
		}
		$out = '<ul class="adaire-header-menu-tree" data-depth="0">';
		foreach ( $items as $item ) {
			$out .= adaire_header_render_menu_node( $item, 0 );
		}
		$out .= '</ul>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_nav' ) ) {
	/**
	 * Mirrors save.js Nav(), with an additional branch for WP-menu-sourced
	 * nested trees. $items, when passed explicitly, lets the split layout
	 * hand in a left/right half of either a flat legacy list or a
	 * top-level tree-node list — both are plain numeric arrays so slicing
	 * behaves identically either way.
	 */
	function adaire_header_render_nav( $attributes, $resolved, $items = null, $nav_id = '' ) {
		if ( empty( $attributes['showNav'] ) || 'minimal' === $attributes['layout'] ) {
			return '';
		}

		$items = ( null === $items ) ? $resolved['items'] : $items;

		if ( $resolved['dynamic'] ) {
			$inner = adaire_header_render_menu_tree( $items );
		} else {
			$inner = '';
			foreach ( $items as $item ) {
				$label = isset( $item['label'] ) ? $item['label'] : '';
				$url   = ! empty( $item['url'] ) ? $item['url'] : '#';
				$icon  = isset( $item['icon'] ) ? $item['icon'] : '';
				$inner .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . adaire_header_icon_svg( $icon ) . '<span>' . esc_html( $label ) . '</span></a>';
			}
		}

		$id_attr = $nav_id ? ( ' id="' . esc_attr( $nav_id ) . '"' ) : '';

		return '<nav' . $id_attr . ' class="adaire-header-nav is-' . esc_attr( $attributes['navOrientation'] ) . '" aria-label="' . esc_attr__( 'Header navigation', 'header-block' ) . '">' . $inner . '</nav>';
	}
}

if ( ! function_exists( 'adaire_header_render_search' ) ) {
	/**
	 * Mirrors save.js Search(). The form action is intentionally left as
	 * the literal "/" (matching current behaviour exactly) rather than
	 * home_url( '/' ) — fixing that is out of scope for this refactor.
	 */
	function adaire_header_render_search( $attributes ) {
		if ( empty( $attributes['showSearch'] ) ) {
			return '';
		}

		$mode        = isset( $attributes['searchMode'] ) ? $attributes['searchMode'] : 'expand';
		$placeholder = isset( $attributes['searchPlaceholder'] ) ? $attributes['searchPlaceholder'] : '';

		$out  = '<div class="adaire-header-search is-' . esc_attr( $mode ) . '">';
		$out .= '<button class="adaire-header-search-button" type="button" aria-label="' . esc_attr__( 'Open search', 'header-block' ) . '">' . adaire_header_icon_svg( 'search' ) . '</button>';
		$out .= '<form class="adaire-header-search-form" role="search" method="get" action="/">';
		$out .= '<input type="search" name="s" placeholder="' . esc_attr( $placeholder ) . '" />';
		$out .= '</form>';
		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_socials' ) ) {
	/**
	 * Mirrors save.js Socials().
	 */
	function adaire_header_render_socials( $attributes ) {
		if ( empty( $attributes['showSocial'] ) ) {
			return '';
		}

		$links = ( isset( $attributes['socialLinks'] ) && is_array( $attributes['socialLinks'] ) ) ? $attributes['socialLinks'] : array();

		$out = '<div class="adaire-header-socials">';
		foreach ( $links as $item ) {
			$platform = isset( $item['platform'] ) ? $item['platform'] : '';
			$url      = ! empty( $item['url'] ) ? $item['url'] : '#';
			$initial  = '' !== $platform ? mb_substr( $platform, 0, 1 ) : '';
			$out     .= '<a href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $platform ) . '">' . esc_html( $initial ) . '</a>';
		}
		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_action' ) ) {
	/**
	 * Mirrors save.js HeaderAction().
	 */
	function adaire_header_render_action( $show, $text, $url, $new_tab, $style, $icon, $label, $icon_position = 'left', $button_type = '' ) {
		if ( empty( $show ) ) {
			return '';
		}

		$type_class = $button_type ? ( ' adaire-header-action--' . $button_type ) : '';
		$icon_pos   = ( 'right' === $icon_position ) ? 'right' : 'left';

		$attrs  = ' class="adaire-header-action' . esc_attr( $type_class ) . ' is-' . esc_attr( $style ) . ' icon-' . $icon_pos . '"';
		$attrs .= ' href="' . esc_url( $url ? $url : '#' ) . '"';
		if ( $new_tab ) {
			$attrs .= ' target="_blank" rel="noopener noreferrer"';
		}
		$attrs .= ' aria-label="' . esc_attr( $label ? $label : $text ) . '"';

		$icon_html = adaire_header_icon_svg( $icon );
		$text_html = '<span>' . esc_html( $text ) . '</span>';
		$inner     = ( 'right' === $icon_pos ) ? ( $text_html . $icon_html ) : ( $icon_html . $text_html );

		return '<a' . $attrs . '>' . $inner . '</a>';
	}
}

if ( ! function_exists( 'adaire_header_render_mobile_toggle' ) ) {
	/**
	 * Mirrors save.js's hardcoded 3-<span> hamburger button exactly when
	 * hamburgerIconStyle is "bars" (the default) so existing pages keep
	 * the same class attribute. Non-default icon styles add an extra class
	 * for style.scss to target — they never change the DOM shape, only CSS.
	 */
	function adaire_header_render_mobile_toggle( $attributes, $nav_id = '' ) {
		$icon_style       = isset( $attributes['hamburgerIconStyle'] ) ? $attributes['hamburgerIconStyle'] : 'bars';
		$icon_style_class = ( 'bars' !== $icon_style ) ? ( ' icon-style-' . $icon_style ) : '';
		$controls_attr    = $nav_id ? ( ' aria-controls="' . esc_attr( $nav_id ) . '"' ) : '';

		return '<button class="adaire-header-mobile-toggle' . esc_attr( $icon_style_class ) . '" type="button" aria-label="' . esc_attr__( 'Toggle menu', 'header-block' ) . '" aria-expanded="false"' . $controls_attr . '><span></span><span></span><span></span></button>';
	}
}

// ---------------------------------------------------------------------
// Render.
// ---------------------------------------------------------------------

$style_string = adaire_header_style_vars_to_string( adaire_header_get_style_vars( $attributes ) );
$box_shadow_class = ! empty( $attributes['boxShadow'] ) ? ' has-shadow' : '';
$classes = trim( 'adaire-header-block is-' . $attributes['stickyBehavior'] . ' mobile-' . $attributes['mobileMenuStyle'] . $box_shadow_class );

$resolved  = adaire_header_resolve_nav( $attributes );
$nav_dom_id = wp_unique_id( 'adaire-header-nav-' );

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                       => $classes,
		'style'                       => $style_string,
		'data-sticky-behavior'        => $attributes['stickyBehavior'],
		'data-mobile-menu-style'      => $attributes['mobileMenuStyle'],
		'data-mobile-breakpoint'      => isset( $attributes['mobileBreakpoint'] ) ? (int) $attributes['mobileBreakpoint'] : 782,
		'data-mobile-slide-direction' => isset( $attributes['mobileSlideDirection'] ) ? $attributes['mobileSlideDirection'] : 'right',
		'data-close-on-outside-click' => ( ! isset( $attributes['mobileCloseOnOutsideClick'] ) || $attributes['mobileCloseOnOutsideClick'] ) ? 'true' : 'false',
		'data-close-on-escape'        => ( ! isset( $attributes['mobileCloseOnEscape'] ) || $attributes['mobileCloseOnEscape'] ) ? 'true' : 'false',
	)
);

$html = '<header ' . $wrapper_attributes . '>';

if ( ! empty( $attributes['showTopBar'] ) ) {
	$html .= '<div class="adaire-header-topbar">';
	$html .= '<span>' . wp_kses_post( $attributes['topBarLeft'] ) . '</span>';
	$html .= '<span>' . wp_kses_post( $attributes['topBarRight'] ) . '</span>';
	$html .= '</div>';
}

$html .= '<div class="adaire-header-inner layout-' . esc_attr( $attributes['layout'] ) . '">';
$html .= adaire_header_render_mobile_toggle( $attributes, $nav_dom_id );

if ( 'split' === $attributes['layout'] ) {
	$total      = count( $resolved['items'] );
	$half       = (int) ceil( $total / 2 );
	$left_items  = array_slice( $resolved['items'], 0, $half );
	$right_items = array_slice( $resolved['items'], $half );

	$html .= adaire_header_render_nav( $attributes, $resolved, $left_items, $nav_dom_id );
	$html .= adaire_header_render_logo( $attributes );
	$html .= adaire_header_render_nav( $attributes, $resolved, $right_items );
} else {
	$html .= adaire_header_render_logo( $attributes );
	$html .= adaire_header_render_nav( $attributes, $resolved, null, $nav_dom_id );
}

$html .= '<div class="adaire-header-actions">';
if ( 'end' !== $attributes['searchPosition'] ) {
	$html .= adaire_header_render_search( $attributes );
}
$html .= adaire_header_render_socials( $attributes );
$html .= adaire_header_render_action( $attributes['showSignIn'], $attributes['signInText'], $attributes['signInUrl'], $attributes['signInNewTab'], $attributes['signInStyle'], $attributes['signInIcon'], __( 'Sign in', 'header-block' ), 'left', 'signin' );
$html .= adaire_header_render_action( $attributes['showSignUp'], $attributes['signUpText'], $attributes['signUpUrl'], $attributes['signUpNewTab'], $attributes['signUpStyle'], $attributes['signUpIcon'], __( 'Sign up', 'header-block' ), 'left', 'signup' );
$html .= adaire_header_render_action( $attributes['showCta'], $attributes['ctaText'], $attributes['ctaUrl'], $attributes['ctaNewTab'], $attributes['ctaStyle'], $attributes['ctaIcon'], __( 'Get started', 'header-block' ), $attributes['ctaIconPosition'], 'cta' );
if ( 'end' === $attributes['searchPosition'] ) {
	$html .= adaire_header_render_search( $attributes );
}
$html .= '</div>'; // .adaire-header-actions

$html .= '</div>'; // .adaire-header-inner
$html .= '</header>';

echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every dynamic value above is escaped at the point of interpolation.

