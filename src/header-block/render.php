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

if ( ! function_exists( 'adaire_header_get_effective_background_type' ) ) {
	/**
	 * Resolves which of the three mutually-exclusive background modes
	 * ("color" | "gradient" | "image") is active. Reads the explicit
	 * backgroundType attribute when present; for content saved before
	 * that attribute existed, infers it from whichever legacy field is
	 * populated (image > gradient > color) so old headers keep rendering
	 * exactly as they did before.
	 */
	function adaire_header_get_effective_background_type( $attributes ) {
		if ( ! empty( $attributes['backgroundType'] ) ) {
			return $attributes['backgroundType'];
		}
		if ( ! empty( $attributes['bgImageUrl'] ) ) {
			return 'image';
		}
		if ( ! empty( $attributes['useGradient'] ) ) {
			return 'gradient';
		}
		return 'color';
	}
}

if ( ! function_exists( 'adaire_header_get_style_vars' ) ) {
	/**
	 * Mirrors save.js getHeaderStyle() (same CSS var names/values, same
	 * conditional inclusion logic) with one intentional improvement: it now
	 * also emits background-image vars when backgroundType resolves to
	 * "image", because save.js/the original frontend never rendered the
	 * background image at all (it only ever showed in the editor canvas).
	 * That silent gap is fixed here rather than preserved.
	 */
	function adaire_header_get_style_vars( $attributes ) {
		$bg_type = adaire_header_get_effective_background_type( $attributes );

		if ( ! empty( $attributes['transparentHeader'] ) ) {
			$background = 'transparent';
		} elseif ( 'image' === $bg_type && ! empty( $attributes['bgImageUrl'] ) ) {
			// Background-color CSS var stays empty so a partially-transparent
			// image doesn't get an opaque color layer painted behind it.
			$background = 'transparent';
		} elseif ( 'gradient' === $bg_type ) {
			$background = $attributes['gradientBackground'];
		} else {
			$background = $attributes['backgroundColor'];
		}

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
			'--adaire-header-font-family'              => ! empty( $attributes['fontFamily'] ) ? $attributes['fontFamily'] : 'inherit',
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
			'--adaire-header-cart-size'                  => ( ! empty( $attributes['cartIconSize'] ) ? $attributes['cartIconSize'] : 18 ) . 'px',
			'--adaire-header-payment-size'                => ( ! empty( $attributes['paymentIconSize'] ) ? $attributes['paymentIconSize'] : 22 ) . 'px',
			'--adaire-header-nav-icon-color'             => $attributes['navIconColor'],
			'--adaire-header-z-index'                    => $attributes['zIndex'],
			'--adaire-header-action-radius'              => ( isset( $attributes['buttonBorderRadius'] ) && (int) $attributes['buttonBorderRadius'] >= 0 )
				? (int) $attributes['buttonBorderRadius'] . 'px'
				: adaire_header_get_action_radius( $attributes['buttonShape'] ),
			'--adaire-header-hamburger-border'           => ! empty( $attributes['hamburgerBorder'] ) ? ( '1px solid ' . $attributes['hamburgerBorderColor'] ) : 'none',
			'--adaire-header-hamburger-border-radius'    => $attributes['hamburgerBorderRadius'] . 'px',
			'--adaire-header-hamburger-size'             => ( ! empty( $attributes['hamburgerSize'] ) ? (int) $attributes['hamburgerSize'] : 42 ) . 'px',
			'--adaire-header-hamburger-order'            => ( isset( $attributes['hamburgerPosition'] ) && 'right' === $attributes['hamburgerPosition'] ) ? '1' : '0',
			'--adaire-header-search-icon-size'           => ( ! empty( $attributes['searchIconSize'] ) ? $attributes['searchIconSize'] : 18 ) . 'px',
			'--adaire-header-search-btn-size'            => ( ! empty( $attributes['searchButtonSize'] ) ? $attributes['searchButtonSize'] : 38 ) . 'px',
		);

		if ( ! empty( $attributes['searchIconColor'] ) ) {
			$styles['--adaire-header-search-icon-color'] = $attributes['searchIconColor'];
		}
		if ( ! empty( $attributes['searchIconBgColor'] ) ) {
			$styles['--adaire-header-search-btn-bg'] = $attributes['searchIconBgColor'];
		}
		if ( ! empty( $attributes['searchInputBgColor'] ) ) {
			$styles['--adaire-header-search-input-bg'] = $attributes['searchInputBgColor'];
		}
		if ( ! empty( $attributes['searchInputBorderColor'] ) ) {
			$styles['--adaire-header-search-input-border'] = $attributes['searchInputBorderColor'];
		}
		if ( ! empty( $attributes['searchInputTextColor'] ) ) {
			$styles['--adaire-header-search-input-text'] = $attributes['searchInputTextColor'];
		}
		if ( ! empty( $attributes['searchPlaceholderColor'] ) ) {
			$styles['--adaire-header-search-placeholder-color'] = $attributes['searchPlaceholderColor'];
		}
		if ( ! empty( $attributes['searchContainerBgColor'] ) ) {
			$styles['--adaire-header-search-container-bg'] = $attributes['searchContainerBgColor'];
		}
		if ( ! empty( $attributes['cartIconColor'] ) ) {
			$styles['--adaire-header-cart-color'] = $attributes['cartIconColor'];
		}
		if ( ! empty( $attributes['paymentIconColor'] ) ) {
			$styles['--adaire-header-payment-color'] = $attributes['paymentIconColor'];
		}
		if ( ! empty( $attributes['navShowDots'] ) ) {
			$styles['--adaire-header-dot-size']    = ( ! empty( $attributes['navDotSize'] ) ? $attributes['navDotSize'] : 6 ) . 'px';
			$styles['--adaire-header-dot-spacing'] = ( isset( $attributes['navDotSpacing'] ) ? $attributes['navDotSpacing'] : 8 ) . 'px';
			if ( ! empty( $attributes['navDotColor'] ) ) {
				$styles['--adaire-header-dot-color'] = $attributes['navDotColor'];
			}
		}
		if ( ! empty( $attributes['ctaHoverBgColor'] ) ) {
			$styles['--adaire-header-cta-hover-bg'] = $attributes['ctaHoverBgColor'];
		}
		if ( ! empty( $attributes['ctaHoverTextColor'] ) ) {
			$styles['--adaire-header-cta-hover-text'] = $attributes['ctaHoverTextColor'];
		}
		if ( isset( $attributes['buttonPaddingVertical'] ) && (int) $attributes['buttonPaddingVertical'] >= 0 ) {
			$styles['--adaire-header-action-padding-y'] = (int) $attributes['buttonPaddingVertical'] . 'px';
		}
		if ( isset( $attributes['ctaBorderRadius'] ) && (int) $attributes['ctaBorderRadius'] >= 0 ) {
			$styles['--adaire-header-cta-radius'] = (int) $attributes['ctaBorderRadius'] . 'px';
		}
		if ( isset( $attributes['ctaPaddingVertical'] ) && (int) $attributes['ctaPaddingVertical'] >= 0 ) {
			$styles['--adaire-header-cta-padding-y'] = (int) $attributes['ctaPaddingVertical'] . 'px';
		}
		if ( isset( $attributes['ctaPaddingHorizontal'] ) && (int) $attributes['ctaPaddingHorizontal'] >= 0 ) {
			$styles['--adaire-header-cta-padding-x'] = (int) $attributes['ctaPaddingHorizontal'] . 'px';
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
		if ( ! empty( $attributes['signInFontSize'] ) ) {
			$styles['--adaire-header-signin-font-size'] = intval( $attributes['signInFontSize'] ) . 'px';
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
		if ( ! empty( $attributes['signUpFontSize'] ) ) {
			$styles['--adaire-header-signup-font-size'] = intval( $attributes['signUpFontSize'] ) . 'px';
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
		if ( ! empty( $attributes['ctaFontSize'] ) ) {
			$styles['--adaire-header-cta-font-size'] = intval( $attributes['ctaFontSize'] ) . 'px';
		}

		if ( 'image' === $bg_type && empty( $attributes['transparentHeader'] ) && ! empty( $attributes['bgImageUrl'] ) ) {
			$styles['--adaire-header-bg-image']       = 'url(' . esc_url( $attributes['bgImageUrl'] ) . ')';
			$styles['--adaire-header-bg-size']        = ! empty( $attributes['bgSize'] ) ? $attributes['bgSize'] : 'cover';
			$styles['--adaire-header-bg-position']    = ! empty( $attributes['bgPosition'] ) ? $attributes['bgPosition'] : 'center center';
			$styles['--adaire-header-bg-repeat']      = ! empty( $attributes['bgRepeat'] ) ? $attributes['bgRepeat'] : 'no-repeat';
			$styles['--adaire-header-bg-attachment']  = ! empty( $attributes['bgAttachment'] ) ? $attributes['bgAttachment'] : 'scroll';
		}

		$margin_css  = adaire_header_box_to_css( isset( $attributes['gutenblocksMargin'] ) ? $attributes['gutenblocksMargin'] : null );
		$padding_css = adaire_header_box_to_css( isset( $attributes['gutenblocksPadding'] ) ? $attributes['gutenblocksPadding'] : null );
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

if ( ! function_exists( 'adaire_header_social_icon_svg' ) ) {
	/**
	 * PHP port of icon-utils.js's socialIconPaths/SocialIcon — same path data,
	 * mirrored byte-for-byte. Falls back to the original single-letter
	 * placeholder for any platform name that isn't one of the six known ones
	 * (e.g. a custom platform typed into the "Other" option).
	 */
	function adaire_header_social_icon_svg( $platform ) {
		$key = strtolower( (string) $platform );

		$paths = array(
			'facebook'  => '<path fill="currentColor" d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94Z"/>',
			'instagram' => '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/>',
			'x'         => '<path fill="currentColor" d="M3 3l7.5 8.6L3.4 21h2.4l5.9-6.8L16.9 21H21l-7.9-9.1L20.6 3h-2.4l-5.4 6.2L7.1 3H3Z"/>',
			'youtube'   => '<rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z"/>',
			'linkedin'  => '<rect x="2.5" y="2.5" width="19" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.2" cy="7.6" r="1.3" fill="currentColor"/><path fill="currentColor" d="M6 10.6h2.4V18H6v-7.4Zm4.3 0h2.3v1.1c.5-.8 1.3-1.3 2.4-1.3 1.8 0 3 1.2 3 3.5V18h-2.4v-3.6c0-1-.4-1.7-1.4-1.7-.8 0-1.3.6-1.5 1.1-.1.2-.1.5-.1.8V18h-2.3v-7.4Z"/>',
			'tiktok'    => '<path fill="currentColor" d="M14.5 2h2.4c.2 1.3 1 2.7 2.3 3.5 1 .6 2.1.9 3.3 1v2.5c-1.6 0-3.2-.5-4.5-1.4v6.7c0 3.2-2.6 5.7-5.8 5.7S6.4 17.5 6.4 14.3c0-3 2.2-5.4 5.1-5.7v2.6c-1.4.3-2.5 1.6-2.5 3.1 0 1.7 1.4 3.1 3.2 3.1s3.2-1.4 3.2-3.1V2Z"/>',
		);

		if ( empty( $paths[ $key ] ) ) {
			$initial = '' !== $platform ? mb_substr( $platform, 0, 1 ) : '?';
			return '<span class="adaire-header-social-fallback">' . esc_html( $initial ) . '</span>';
		}

		return '<svg class="adaire-header-social-icon" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' . $paths[ $key ] . '</svg>';
	}
}

if ( ! function_exists( 'adaire_header_cart_icon_svg' ) ) {
	/**
	 * PHP port of icon-utils.js CartIcon() — same path data, mirrored
	 * byte-for-byte (ADAB-016).
	 */
	function adaire_header_cart_icon_svg() {
		$c = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

		return '<svg class="adaire-header-icon adaire-header-cart-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">'
			. '<circle ' . $c . ' cx="9" cy="21" r="1" /><circle ' . $c . ' cx="19" cy="21" r="1" />'
			. '<path ' . $c . ' d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21.5 8H5.1" />'
			. '</svg>';
	}
}

if ( ! function_exists( 'adaire_header_payment_icon_svg' ) ) {
	/**
	 * PHP port of icon-utils.js's paymentIconPaths/PaymentIcon — same shapes,
	 * mirrored byte-for-byte (ADAB-016). Falls back to a single-letter
	 * placeholder for any method name that isn't one of the known ones.
	 */
	function adaire_header_payment_icon_svg( $method ) {
		$key = strtolower( (string) $method );

		$paths = array(
			'visa'             => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15.5" text-anchor="middle" font-size="7" font-weight="700" font-style="italic" fill="currentColor" stroke="none">VISA</text>',
			'mastercard'       => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9.5" cy="12" r="4.2" fill="currentColor" opacity="0.55"/><circle cx="14.5" cy="12" r="4.2" fill="currentColor" opacity="0.85"/>',
			'paypal'           => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="currentColor" stroke="none" d="M9.3 8.2h3.1c1.9 0 3.1 1 2.8 2.7-.3 1.9-1.8 2.9-3.7 2.9h-1.1l-.5 2.8H8l1.3-8.4Zm1.5 4.2h.8c.9 0 1.6-.4 1.7-1.3.1-.8-.4-1.1-1.3-1.1h-.7l-.5 2.4Z"/>',
			'american express' => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15" text-anchor="middle" font-size="5.5" font-weight="700" fill="currentColor" stroke="none">AMEX</text>',
			'apple pay'        => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15" text-anchor="middle" font-size="5.5" font-weight="700" fill="currentColor" stroke="none">Pay</text>',
			'google pay'       => '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor" stroke="none">GPay</text>',
		);

		if ( empty( $paths[ $key ] ) ) {
			$initial = '' !== $method ? mb_substr( $method, 0, 1 ) : '?';
			return '<span class="adaire-header-payment-fallback">' . esc_html( $initial ) . '</span>';
		}

		return '<svg class="adaire-header-payment-icon" width="1.6em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' . $paths[ $key ] . '</svg>';
	}
}

if ( ! function_exists( 'adaire_header_render_cart' ) ) {
	/**
	 * WooCommerce cart icon (ADAB-016). Guarded behind class_exists(
	 * 'WooCommerce' ) so sites without WooCommerce never get a broken/fatal
	 * link — they get a non-functional placeholder icon instead (same
	 * visual slot, so layout doesn't jump if WooCommerce is later
	 * installed), with no count badge and no link.
	 */
	function adaire_header_render_cart( $attributes ) {
		if ( empty( $attributes['showCartIcon'] ) ) {
			return '';
		}

		$show_count = ! isset( $attributes['cartShowCount'] ) || $attributes['cartShowCount'];
		$icon_html  = adaire_header_cart_icon_svg();

		if ( class_exists( 'WooCommerce' ) && function_exists( 'wc_get_cart_url' ) ) {
			$count = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
			$badge = ( $show_count ) ? '<span class="adaire-header-cart-count">' . esc_html( $count ) . '</span>' : '';

			return '<a class="adaire-header-cart" href="' . esc_url( wc_get_cart_url() ) . '" aria-label="' . esc_attr__( 'View cart', 'header-block' ) . '">' . $icon_html . $badge . '</a>';
		}

		// WooCommerce not active — render a non-functional placeholder so the
		// toggle never fatals or links somewhere broken. No count badge since
		// there's no real cart to count.
		return '<span class="adaire-header-cart is-disabled" aria-hidden="true">' . $icon_html . '</span>';
	}
}

if ( ! function_exists( 'adaire_header_render_payment_icons' ) ) {
	/**
	 * Payment method trust badges (ADAB-016). Mirrors
	 * adaire_header_render_socials()'s structure but for the paymentIcons
	 * array (method name only, no per-icon URL/color — these are static
	 * badges, not links).
	 */
	function adaire_header_render_payment_icons( $attributes ) {
		if ( empty( $attributes['showPaymentIcons'] ) ) {
			return '';
		}

		$icons = ( isset( $attributes['paymentIcons'] ) && is_array( $attributes['paymentIcons'] ) ) ? $attributes['paymentIcons'] : array();

		$out = '<div class="adaire-header-payment-icons">';
		foreach ( $icons as $item ) {
			$method = isset( $item['method'] ) ? $item['method'] : '';
			$out   .= '<span aria-label="' . esc_attr( $method ) . '">' . adaire_header_payment_icon_svg( $method ) . '</span>';
		}
		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_nav_dot' ) ) {
	/**
	 * Optional menu-indicator dot. Disabled unless navShowDots is explicitly
	 * turned on — size/spacing/color travel via CSS vars set in
	 * adaire_header_get_style_vars(); position (before/after the label)
	 * is expressed as a class so style.scss can apply the right margin side.
	 */
	function adaire_header_render_nav_dot( $attributes ) {
		if ( empty( $attributes['navShowDots'] ) ) {
			return '';
		}
		$position = ( isset( $attributes['navDotPosition'] ) && 'before' === $attributes['navDotPosition'] ) ? 'before' : 'after';
		return '<span class="adaire-header-nav-dot is-' . $position . '" aria-hidden="true"></span>';
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

if ( ! function_exists( 'adaire_header_label_from_url' ) ) {
	/**
	 * Derives a human-readable label from a menu item's URL, used when WP
	 * has nothing usable for the title (see adaire_header_friendly_menu_label()).
	 */
	function adaire_header_label_from_url( $url ) {
		$path = trim( (string) wp_parse_url( (string) $url, PHP_URL_PATH ), '/' );
		if ( '' === $path ) {
			return __( 'Menu item', 'header-block' );
		}
		$segments = explode( '/', $path );
		$slug     = end( $segments );
		$slug     = str_replace( array( '-', '_' ), ' ', $slug );
		$slug     = trim( $slug );
		return '' !== $slug ? ucwords( $slug ) : __( 'Menu item', 'header-block' );
	}
}

if ( ! function_exists( 'adaire_header_friendly_menu_label' ) ) {
	/**
	 * wp_get_nav_menu_items()/wp_setup_nav_menu_item() falls back to a raw
	 * "#123 (no title)" string when a menu item has no custom label AND its
	 * linked object has no title (deleted/trashed/genuinely-untitled target).
	 * That debug-style string (with a raw DB post ID) should never reach a
	 * site visitor or the editor preview, so swap it for a label derived
	 * from the item's URL instead. A real custom label or resolved object
	 * title always takes priority and passes through unchanged.
	 */
	function adaire_header_friendly_menu_label( $title, $url ) {
		$title = trim( (string) $title );
		if ( '' !== $title && ! preg_match( '/^#\d+\s*\(no title\)$/i', $title ) ) {
			return $title;
		}
		return adaire_header_label_from_url( $url );
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
					'label'    => adaire_header_friendly_menu_label( $item->title, $item->url ),
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
	 * legacy flat navItems attribute and a live WordPress menu.
	 *
	 * IMPORTANT: once a dynamic source ("primary"/"footer"/"menu") is
	 * explicitly selected, this never falls back to the legacy placeholder
	 * items, even if nothing is assigned/resolved yet. An earlier version
	 * fell back to the legacy navItems in that case, which meant a stale or
	 * unrelated placeholder menu (e.g. carried over from another
	 * environment) could silently render instead of the real selected menu.
	 * Editor preview (see useResolvedMenuTree()/renderNav() in edit.js)
	 * already shows an empty/"no menu assigned" state rather than the
	 * placeholder, so this keeps the frontend consistent with the editor.
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
				'items'   => array(),
				'dynamic' => true,
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
	function adaire_header_render_menu_node( $item, $depth, $attributes = array() ) {
		$label      = isset( $item['label'] ) ? $item['label'] : '';
		$url        = ! empty( $item['url'] ) ? $item['url'] : '#';
		$children   = ( isset( $item['children'] ) && is_array( $item['children'] ) ) ? $item['children'] : array();
		$has_kids   = ! empty( $children );
		$dot_position = ( isset( $attributes['navDotPosition'] ) && 'before' === $attributes['navDotPosition'] ) ? 'before' : 'after';
		$dot          = adaire_header_render_nav_dot( $attributes );
		$label_html   = '<span>' . esc_html( $label ) . '</span>';
		$label_inner  = ( 'before' === $dot_position ) ? ( $dot . $label_html ) : ( $label_html . $dot );

		$out = '<li class="adaire-header-menu-item' . ( $has_kids ? ' has-children' : '' ) . '">';

		if ( ! $has_kids ) {
			$out .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . $label_inner . '</a>';
			$out .= '</li>';
			return $out;
		}

		$submenu_id = 'adaire-submenu-' . ( ! empty( $item['id'] ) ? (int) $item['id'] : wp_unique_id( 'adaire-submenu-' ) );

		$out .= '<span class="adaire-header-menu-item-row">';
		$out .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . $label_inner . '</a>';
		$out .= '<button type="button" class="adaire-header-submenu-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="' . esc_attr( $submenu_id ) . '">';
		$out .= '<svg class="adaire-header-submenu-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>';
		$out .= '<span class="screen-reader-text">' . esc_html__( 'Toggle submenu', 'header-block' ) . '</span>';
		$out .= '</button>';
		$out .= '</span>';

		$out .= '<ul id="' . esc_attr( $submenu_id ) . '" class="adaire-header-submenu" data-depth="' . esc_attr( $depth + 1 ) . '">';
		foreach ( $children as $child ) {
			$out .= adaire_header_render_menu_node( $child, $depth + 1, $attributes );
		}
		$out .= '</ul>';

		$out .= '</li>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_menu_tree' ) ) {
	function adaire_header_render_menu_tree( $items, $attributes = array() ) {
		if ( empty( $items ) ) {
			return '';
		}
		$out = '<ul class="adaire-header-menu-tree" data-depth="0">';
		foreach ( $items as $item ) {
			$out .= adaire_header_render_menu_node( $item, 0, $attributes );
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
			$inner = adaire_header_render_menu_tree( $items, $attributes );
		} else {
			$show_nav_icons = ! isset( $attributes['showNavIcons'] ) || $attributes['showNavIcons'];
			$dot_position   = ( isset( $attributes['navDotPosition'] ) && 'before' === $attributes['navDotPosition'] ) ? 'before' : 'after';
			$inner          = '';
			foreach ( $items as $item ) {
				$label     = isset( $item['label'] ) ? $item['label'] : '';
				$url       = ! empty( $item['url'] ) ? $item['url'] : '#';
				$icon      = isset( $item['icon'] ) ? $item['icon'] : '';
				$icon_html = $show_nav_icons ? adaire_header_icon_svg( $icon ) : '';
				$label_html = '<span>' . esc_html( $label ) . '</span>';
				$dot        = adaire_header_render_nav_dot( $attributes );
				$content    = ( 'before' === $dot_position ) ? ( $dot . $icon_html . $label_html ) : ( $icon_html . $label_html . $dot );
				$inner     .= '<a class="adaire-header-nav-item" href="' . esc_url( $url ) . '">' . $content . '</a>';
			}
		}

		$id_attr = $nav_id ? ( ' id="' . esc_attr( $nav_id ) . '"' ) : '';

		$close_btn = '';
		if ( $nav_id && in_array( $attributes['mobileMenuStyle'] ?? 'dropdown', array( 'slide-in', 'overlay' ), true ) ) {
			$close_icon = '<svg class="adaire-header-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
			$close_btn  = '<button class="adaire-header-mobile-close" type="button" aria-label="' . esc_attr__( 'Close menu', 'header-block' ) . '">' . $close_icon . '</button>';
		}

		// Mobile-only CTA — reuses the existing "Get started" CTA settings
		// (showCta/ctaText/ctaUrl/ctaStyle/etc.), which otherwise only ever
		// render in .adaire-header-actions, a container hidden entirely on
		// mobile (see the `.adaire-header-action, .adaire-header-socials {
		// display: none }` rule in style.scss). Without this, the CTA had no
		// way to reach a mobile visitor at all. Gated on $nav_id (same as
		// $close_btn above) so the split layout's second nav half — called
		// with $nav_id === '' — doesn't render a duplicate. Shown for every
		// mobileMenuStyle (dropdown/slide-in/overlay), not just slide-in/
		// overlay like the close button, since dropdown mode benefits from
		// it too.
		$mobile_cta = '';
		if ( $nav_id && ! empty( $attributes['showCta'] ) ) {
			$show_icon_cta_mobile = ! isset( $attributes['showCtaIcon'] ) || $attributes['showCtaIcon'];
			$cta_html              = adaire_header_render_action( $attributes['showCta'], $attributes['ctaText'], $attributes['ctaUrl'], $attributes['ctaNewTab'], $attributes['ctaStyle'], $attributes['ctaIcon'], __( 'Get started', 'header-block' ), $attributes['ctaIconPosition'], 'cta', $show_icon_cta_mobile );
			$mobile_cta             = '<div class="adaire-header-nav-mobile-cta">' . $cta_html . '</div>';
		}

		return '<nav' . $id_attr . ' class="adaire-header-nav is-' . esc_attr( $attributes['navOrientation'] ) . '" aria-label="' . esc_attr__( 'Header navigation', 'header-block' ) . '">' . $close_btn . $inner . $mobile_cta . '</nav>';
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
		$layout      = isset( $attributes['searchLayoutStyle'] ) ? $attributes['searchLayoutStyle'] : 'icon-only';

		$out = '<div class="adaire-header-search is-' . esc_attr( $mode ) . ' layout-' . esc_attr( $layout ) . '">';
		if ( 'expanded' !== $layout ) {
			$out .= '<button class="adaire-header-search-button" type="button" aria-label="' . esc_attr__( 'Open search', 'header-block' ) . '">' . adaire_header_icon_svg( 'search' ) . '</button>';
		}
		$out .= '<form class="adaire-header-search-form" role="search" method="get" action="/">';
		if ( 'expanded' === $layout ) {
			$out .= '<span class="adaire-header-search-form-icon">' . adaire_header_icon_svg( 'search' ) . '</span>';
		}
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

		$links        = ( isset( $attributes['socialLinks'] ) && is_array( $attributes['socialLinks'] ) ) ? $attributes['socialLinks'] : array();
		$hover_effect = isset( $attributes['socialHoverEffect'] ) ? $attributes['socialHoverEffect'] : 'color';

		$out = '<div class="adaire-header-socials hover-' . esc_attr( $hover_effect ) . '">';
		foreach ( $links as $item ) {
			$platform   = isset( $item['platform'] ) ? $item['platform'] : '';
			$url        = ! empty( $item['url'] ) ? $item['url'] : '#';
			$style_bits = array();
			if ( ! empty( $item['bgColor'] ) ) {
				$style_bits[] = 'background:' . esc_attr( $item['bgColor'] );
			}
			if ( ! empty( $item['iconColor'] ) ) {
				$style_bits[] = 'color:' . esc_attr( $item['iconColor'] );
			}
			$style_attr = $style_bits ? ( ' style="' . implode( ';', $style_bits ) . '"' ) : '';
			$out       .= '<a href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $platform ) . '"' . $style_attr . '>' . adaire_header_social_icon_svg( $platform ) . '</a>';
		}
		$out .= '</div>';
		return $out;
	}
}

if ( ! function_exists( 'adaire_header_render_follow_us' ) ) {
	/**
	 * Top bar "Follow Us" content (requirement #8) — a flexible slot, not a
	 * fixed template: text is fully editable, the <a> wrapper and the icon
	 * are both independently optional, and the whole thing renders nothing
	 * unless topBarFollowEnabled is explicitly turned on. The legacy static
	 * "Follow us" <span> that already lives in topBarRight is untouched and
	 * keeps rendering exactly as before when this stays off.
	 */
	function adaire_header_render_follow_us( $attributes ) {
		if ( empty( $attributes['topBarFollowEnabled'] ) ) {
			return '';
		}

		$text          = isset( $attributes['topBarFollowText'] ) ? $attributes['topBarFollowText'] : '';
		$icon          = isset( $attributes['topBarFollowIcon'] ) ? $attributes['topBarFollowIcon'] : 'none';
		$icon_position = ( isset( $attributes['topBarFollowIconPosition'] ) && 'right' === $attributes['topBarFollowIconPosition'] ) ? 'right' : 'left';
		$url           = isset( $attributes['topBarFollowUrl'] ) ? trim( $attributes['topBarFollowUrl'] ) : '';

		$icon_html = ( 'none' !== $icon ) ? adaire_header_icon_svg( $icon ) : '';
		$text_html = ( '' !== $text ) ? '<span>' . wp_kses_post( $text ) . '</span>' : '';
		$inner     = ( 'right' === $icon_position ) ? ( $text_html . $icon_html ) : ( $icon_html . $text_html );

		if ( '' === $inner ) {
			return '';
		}

		$classes = 'adaire-header-follow-us icon-' . $icon_position;

		if ( '' !== $url ) {
			$target_attr = ! empty( $attributes['topBarFollowNewTab'] ) ? ' target="_blank" rel="noopener noreferrer"' : '';
			return '<a href="' . esc_url( $url ) . '" class="' . esc_attr( $classes ) . '"' . $target_attr . '>' . $inner . '</a>';
		}

		return '<span class="' . esc_attr( $classes ) . '">' . $inner . '</span>';
	}
}

if ( ! function_exists( 'adaire_header_suppress_redundant_follow_text' ) ) {
	/**
	 * The dedicated Follow Us widget (topBarFollowEnabled) and the plain
	 * topBarLeft/topBarRight text fields used to default to the exact same
	 * literal "Follow us" string, so a header using both defaults showed it
	 * twice. Once the dedicated widget is on, strip a topbar text value that
	 * is literally just that legacy default so only the dedicated widget's
	 * output remains; any text the site owner actually customized is left
	 * untouched.
	 */
	function adaire_header_suppress_redundant_follow_text( $text, $follow_enabled ) {
		if ( empty( $follow_enabled ) ) {
			return $text;
		}
		$plain = trim( wp_strip_all_tags( (string) $text ) );
		if ( '' !== $plain && 0 === strcasecmp( $plain, 'follow us' ) ) {
			return '';
		}
		return $text;
	}
}

if ( ! function_exists( 'adaire_header_autolink_contact' ) ) {
	/**
	 * Auto-converts phone numbers to tel: links and email addresses to
	 * mailto: links inside top-bar text (requirement: "phone numbers should
	 * open a phone function when clicked"). Skips entirely if the string
	 * already contains a manual link/markup-heavy content, so a site owner
	 * who already added their own <a> tag never gets double-wrapped.
	 */
	function adaire_header_autolink_contact( $html ) {
		if ( '' === $html || false !== stripos( $html, '<a' ) ) {
			return $html;
		}

		$html = preg_replace_callback(
			'/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/',
			function ( $m ) {
				return '<a href="mailto:' . esc_attr( $m[0] ) . '">' . esc_html( $m[0] ) . '</a>';
			},
			$html
		);

		$html = preg_replace_callback(
			'/\+?\d[\d\s().-]{6,}\d/',
			function ( $m ) {
				if ( false !== stripos( $m[0], '<' ) ) {
					return $m[0]; // Inside markup already inserted above (e.g. a mailto href); leave alone.
				}
				$raw    = $m[0];
				$digits = preg_replace( '/[^\d+]/', '', $raw );
				return '<a href="tel:' . esc_attr( $digits ) . '">' . esc_html( $raw ) . '</a>';
			},
			$html
		);

		return $html;
	}
}

if ( ! function_exists( 'adaire_header_render_action' ) ) {
	/**
	 * Mirrors save.js HeaderAction().
	 */
	function adaire_header_render_action( $show, $text, $url, $new_tab, $style, $icon, $label, $icon_position = 'left', $button_type = '', $show_icon = true ) {
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

		$icon_html = $show_icon ? adaire_header_icon_svg( $icon ) : '';
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
$slide_class = '';
if ( 'slide-in' === $attributes['mobileMenuStyle'] && isset( $attributes['mobileSlideDirection'] ) && 'left' === $attributes['mobileSlideDirection'] ) {
	$slide_class = ' mobile-slide-left';
}
$classes = trim( 'adaire-header-block is-' . $attributes['stickyBehavior'] . ' mobile-' . $attributes['mobileMenuStyle'] . $slide_class . $box_shadow_class );

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

// Icon-toggle gates (req #4) — all default to true so untouched blocks keep
// showing icons exactly as before.
$show_icon_signin = ! isset( $attributes['showSignInIcon'] ) || $attributes['showSignInIcon'];
$show_icon_signup = ! isset( $attributes['showSignUpIcon'] ) || $attributes['showSignUpIcon'];
$show_icon_cta    = ! isset( $attributes['showCtaIcon'] ) || $attributes['showCtaIcon'];

// Social placement (req #7) — rendered once, then dropped into exactly one
// slot. Falls back to the original 'actions' slot if a topbar-dependent
// placement is chosen but the topbar itself is off, so socials never just
// disappear.
$social_html      = adaire_header_render_socials( $attributes );
$social_placement = isset( $attributes['socialPlacement'] ) ? $attributes['socialPlacement'] : 'actions';
if ( in_array( $social_placement, array( 'topbar-left', 'topbar-right' ), true ) && empty( $attributes['showTopBar'] ) ) {
	$social_placement = 'actions';
}

// Cart icon / payment icons (ADAB-016) — same four-zone placement system as
// socials above, with the same topbar-dependent fallback to 'actions'.
$cart_html      = adaire_header_render_cart( $attributes );
$cart_placement = isset( $attributes['cartIconPlacement'] ) ? $attributes['cartIconPlacement'] : 'actions';
if ( in_array( $cart_placement, array( 'topbar-left', 'topbar-right' ), true ) && empty( $attributes['showTopBar'] ) ) {
	$cart_placement = 'actions';
}

$payment_html      = adaire_header_render_payment_icons( $attributes );
$payment_placement = isset( $attributes['paymentIconPlacement'] ) ? $attributes['paymentIconPlacement'] : 'actions';
if ( in_array( $payment_placement, array( 'topbar-left', 'topbar-right' ), true ) && empty( $attributes['showTopBar'] ) ) {
	$payment_placement = 'actions';
}

// Top bar "Follow Us" (req #8).
$follow_html     = adaire_header_render_follow_us( $attributes );
$follow_position = ( isset( $attributes['topBarFollowPosition'] ) && 'left' === $attributes['topBarFollowPosition'] ) ? 'left' : 'right';

// Search placement (req #6) — 'start'/'end' keep rendering inside
// .adaire-header-actions exactly as before; 'center' and 'floating' are new
// slots elsewhere in the markup.
$search_position = isset( $attributes['searchPosition'] ) ? $attributes['searchPosition'] : 'start';
$search_html     = adaire_header_render_search( $attributes );

$html = '<header ' . $wrapper_attributes . '>';

if ( ! empty( $attributes['showTopBar'] ) ) {
	$follow_enabled = ! empty( $attributes['topBarFollowEnabled'] );
	$topbar_left_text  = adaire_header_suppress_redundant_follow_text( $attributes['topBarLeft'], $follow_enabled );
	$topbar_right_text = adaire_header_suppress_redundant_follow_text( $attributes['topBarRight'], $follow_enabled );

	$topbar_left  = '<span>' . adaire_header_autolink_contact( wp_kses_post( $topbar_left_text ) ) . '</span>';
	$topbar_right = '<span>' . adaire_header_autolink_contact( wp_kses_post( $topbar_right_text ) ) . '</span>';

	if ( $follow_html ) {
		if ( 'left' === $follow_position ) {
			$topbar_left .= $follow_html;
		} else {
			$topbar_right .= $follow_html;
		}
	}

	if ( 'topbar-left' === $social_placement ) {
		$topbar_left .= $social_html;
	} elseif ( 'topbar-right' === $social_placement ) {
		$topbar_right .= $social_html;
	}

	if ( 'topbar-left' === $payment_placement ) {
		$topbar_left .= $payment_html;
	} elseif ( 'topbar-right' === $payment_placement ) {
		$topbar_right .= $payment_html;
	}

	if ( 'topbar-left' === $cart_placement ) {
		$topbar_left .= $cart_html;
	} elseif ( 'topbar-right' === $cart_placement ) {
		$topbar_right .= $cart_html;
	}

	$html .= '<div class="adaire-header-topbar">';
	$html .= $topbar_left;
	$html .= $topbar_right;
	$html .= '</div>';
}

$html .= '<div class="adaire-header-inner layout-' . esc_attr( $attributes['layout'] ) . '">';
$html .= adaire_header_render_mobile_toggle( $attributes, $nav_dom_id );

if ( 'before-nav' === $social_placement ) {
	$html .= $social_html;
}
if ( 'before-nav' === $payment_placement ) {
	$html .= $payment_html;
}
if ( 'before-nav' === $cart_placement ) {
	$html .= $cart_html;
}

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

if ( 'center' === $search_position ) {
	$html .= '<div class="adaire-header-search-slot">' . $search_html . '</div>';
}

$html .= '<div class="adaire-header-actions">';
if ( ! in_array( $search_position, array( 'end', 'center', 'floating' ), true ) ) {
	$html .= $search_html;
}
if ( 'actions' === $social_placement ) {
	$html .= $social_html;
}
$html .= adaire_header_render_action( $attributes['showSignIn'], $attributes['signInText'], $attributes['signInUrl'], $attributes['signInNewTab'], $attributes['signInStyle'], $attributes['signInIcon'], __( 'Sign in', 'header-block' ), 'left', 'signin', $show_icon_signin );
$html .= adaire_header_render_action( $attributes['showSignUp'], $attributes['signUpText'], $attributes['signUpUrl'], $attributes['signUpNewTab'], $attributes['signUpStyle'], $attributes['signUpIcon'], __( 'Sign up', 'header-block' ), 'left', 'signup', $show_icon_signup );
$html .= adaire_header_render_action( $attributes['showCta'], $attributes['ctaText'], $attributes['ctaUrl'], $attributes['ctaNewTab'], $attributes['ctaStyle'], $attributes['ctaIcon'], __( 'Get started', 'header-block' ), $attributes['ctaIconPosition'], 'cta', $show_icon_cta );
if ( 'actions' === $payment_placement ) {
	$html .= $payment_html;
}
if ( 'actions' === $cart_placement ) {
	$html .= $cart_html;
}
if ( 'end' === $search_position ) {
	$html .= $search_html;
}
$html .= '</div>'; // .adaire-header-actions

$html .= '</div>'; // .adaire-header-inner

if ( 'floating' === $search_position ) {
	$html .= '<div class="adaire-header-search-floating">' . $search_html . '</div>';
}

$html .= '</header>';

echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every dynamic value above is escaped at the point of interpolation.
