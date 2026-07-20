<?php
/**
 * Server-side render for the Cookie Banner block (Pro).
 *
 * This block is dynamic specifically so its consent categories always
 * reflect the site-wide list managed on the Cookie Categories admin page
 * (admin/cookie-categories-page.php) rather than a per-block copy frozen at
 * save time — see that file's adaire_get_cookie_categories(). Every other
 * attribute still comes from the block instance as usual.
 *
 * Every function below is registered behind a function_exists() guard
 * because WordPress core `require`s this template fresh each time the block
 * renders — if the block appears more than once on the same page/request,
 * this file loads more than once, and unguarded `function foo() {}`
 * declarations would cause a fatal redeclaration error.
 *
 * @var array    $attributes Block attributes (already merged with block.json defaults).
 * @var string   $content    Inner block content. Unused — this block has no innerBlocks.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'adaire_cookie_banner_responsive_vars' ) ) {
	/**
	 * PHP port of shared.js responsiveVars() — a {desktop,tablet,mobile}
	 * attribute becomes three CSS custom properties, falling back gracefully
	 * so an untouched attribute still renders sane defaults.
	 */
	function adaire_cookie_banner_responsive_vars( $obj, $name, $fallback_unit = 'px' ) {
		$d = isset( $obj['desktop'] ) && is_array( $obj['desktop'] ) ? $obj['desktop'] : array();
		$t = isset( $obj['tablet'] ) && is_array( $obj['tablet'] ) ? $obj['tablet'] : $d;
		$m = isset( $obj['mobile'] ) && is_array( $obj['mobile'] ) ? $obj['mobile'] : $t;

		$d_value = isset( $d['value'] ) ? $d['value'] : 0;
		$d_unit  = isset( $d['unit'] ) ? $d['unit'] : $fallback_unit;
		$t_value = isset( $t['value'] ) ? $t['value'] : $d_value;
		$t_unit  = isset( $t['unit'] ) ? $t['unit'] : $d_unit;
		$m_value = isset( $m['value'] ) ? $m['value'] : $t_value;
		$m_unit  = isset( $m['unit'] ) ? $m['unit'] : $t_unit;

		return array(
			"--ccb-{$name}"         => $d_value . $d_unit,
			"--ccb-{$name}-tablet"  => $t_value . $t_unit,
			"--ccb-{$name}-mobile"  => $m_value . $m_unit,
		);
	}
}

if ( ! function_exists( 'adaire_cookie_banner_style_vars' ) ) {
	/**
	 * PHP port of shared.js getStyleVars().
	 */
	function adaire_cookie_banner_style_vars( $a ) {
		$vars = array(
			'--ccb-bg'            => $a['backgroundColor'] ?: '#111827',
			'--ccb-text'          => $a['textColor'] ?: '#f9fafb',
			'--ccb-heading'       => $a['headingColor'] ?: '#f9fafb',
			'--ccb-accent'        => $a['accentColor'] ?: '#6366f1',
			'--ccb-btn-text'      => $a['primaryButtonTextColor'] ?: '#ffffff',
			'--ccb-btn2-bg'       => $a['secondaryButtonBg'] ?: 'transparent',
			'--ccb-btn2-text'     => $a['secondaryButtonTextColor'] ?: '#a5b4fc',
			'--ccb-border-color'  => $a['borderColor'] ?: '#e5e7eb',
			'--ccb-border-width'  => ( ! empty( $a['showBorder'] ) ? ( $a['borderWidth'] ?? 1 ) : 0 ) . 'px',
			'--ccb-radius'        => ( $a['borderRadius'] ?? 14 ) . 'px',
			'--ccb-gap'           => ( $a['gap'] ?? 12 ) . 'px',
			'--ccb-max-width'     => ( $a['maxWidth'] ?? 480 ) . 'px',
			'--ccb-font-family'   => $a['fontFamily'] ?: 'inherit',
			'--ccb-font-weight'   => $a['fontWeight'] ?: '400',
			'--ccb-line-height'   => $a['lineHeight'] ?: '1.5',
			'--ccb-anim-duration' => ( $a['animationDuration'] ?? 400 ) . 'ms',
			'--ccb-overlay'       => $a['overlayColor'] ?: 'rgba(15,23,42,0.55)',
			'--ccb-z-index'       => $a['zIndex'] ?? 999999,
		);

		$vars = array_merge(
			$vars,
			adaire_cookie_banner_responsive_vars( $a['headingFontSize'] ?? array(), 'heading-fs' ),
			adaire_cookie_banner_responsive_vars( $a['bodyFontSize'] ?? array(), 'body-fs' ),
			adaire_cookie_banner_responsive_vars( $a['padding'] ?? array(), 'padding' )
		);

		$pairs = array();
		foreach ( $vars as $name => $value ) {
			$pairs[] = esc_attr( $name ) . ':' . esc_attr( $value );
		}
		return implode( ';', $pairs );
	}
}

if ( ! function_exists( 'adaire_cookie_banner_icon_svg' ) ) {
	function adaire_cookie_banner_icon_svg() {
		return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a2.5 2.5 0 0 1-3.44-2.94A2.5 2.5 0 0 1 15 4.6 9 9 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="13" cy="8.5" r="1" fill="currentColor" /><circle cx="15.5" cy="13" r="1" fill="currentColor" /><circle cx="10" cy="14.5" r="1" fill="currentColor" /></svg>';
	}
}

if ( ! function_exists( 'adaire_cookie_banner_sliders_svg' ) ) {
	function adaire_cookie_banner_sliders_svg() {
		return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /><circle cx="14" cy="7" r="2" stroke="currentColor" stroke-width="1.5" /><circle cx="8" cy="17" r="2" stroke="currentColor" stroke-width="1.5" /></svg>';
	}
}

$a = wp_parse_args(
	$attributes,
	array(
		'showOverlay'              => false,
		'closeButtonEnabled'       => false,
		'showIcon'                 => true,
		'bannerTitle'              => '',
		'description'              => '',
		'additionalInfo'           => '',
		'cookiePolicyUrl'          => '',
		'cookiePolicyText'         => '',
		'privacyPolicyUrl'         => '',
		'privacyPolicyText'        => '',
		'termsUrl'                 => '',
		'termsText'                => '',
		'manageText'               => 'Manage Preferences',
		'rejectAllText'            => 'Reject All',
		'acceptAllText'            => 'Accept All',
		'savePreferencesText'      => 'Save Preferences',
		'reopenButtonEnabled'      => true,
		'reopenButtonPosition'     => 'bottom-left',
		'reopenButtonText'         => 'Cookie Settings',
		'layoutType'               => 'floating-bottom-right',
		'displayDensity'           => 'expanded',
		'alignment'                => 'center',
		'showShadow'               => true,
		'shadowIntensity'          => 'strong',
		'buttonShape'              => 'rounded',
		'buttonSize'               => 'md',
		'entranceAnimation'        => 'slide-up',
		'bannerWidth'              => 'contained',
		'consentVersion'           => '1',
		'consentExpirationDays'    => 180,
		'autoHide'                 => false,
		'autoHideDelay'            => 300,
		'googleConsentMode'        => false,
		'blockScriptsUntilConsent' => true,
	)
);

$categories = adaire_get_cookie_categories();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                     => 'adaire-cookie-banner',
		'style'                     => adaire_cookie_banner_style_vars( $a ),
		'data-layout'               => $a['layoutType'],
		'data-density'              => $a['displayDensity'],
		'data-align'                => $a['alignment'],
		'data-shadow'               => $a['showShadow'] ? $a['shadowIntensity'] : 'none',
		'data-shape'                => $a['buttonShape'],
		'data-btn-size'             => $a['buttonSize'],
		'data-anim'                 => $a['entranceAnimation'],
		'data-width'                => $a['bannerWidth'],
		'data-consent-version'      => $a['consentVersion'],
		'data-consent-days'         => $a['consentExpirationDays'],
		'data-auto-hide'            => $a['autoHide'] ? '1' : '0',
		'data-auto-hide-delay'      => $a['autoHideDelay'],
		'data-google-consent-mode'  => $a['googleConsentMode'] ? '1' : '0',
		'data-block-scripts'        => $a['blockScriptsUntilConsent'] ? '1' : '0',
		'data-categories'           => wp_json_encode(
			array_map(
				static function ( $cat ) {
					return array(
						'key'            => $cat['key'],
						'required'       => ! empty( $cat['required'] ),
						'defaultChecked' => ! empty( $cat['defaultChecked'] ),
					);
				},
				$categories
			)
		),
	)
);

$html = '<div ' . $wrapper_attributes . '>';

if ( $a['showOverlay'] ) {
	$html .= '<div class="adaire-cookie-banner__overlay" data-cookie-action="dismiss-overlay"></div>';
}

$html .= '<div class="adaire-cookie-banner__panel" role="dialog" aria-live="polite" aria-label="' . esc_attr__( 'Cookie consent', 'adaire-blocks' ) . '">';

if ( $a['closeButtonEnabled'] ) {
	$html .= '<button type="button" class="adaire-cookie-banner__close" data-cookie-action="dismiss" aria-label="' . esc_attr__( 'Close', 'adaire-blocks' ) . '">&times;</button>';
}

$html .= '<div class="adaire-cookie-banner__header">';
if ( $a['showIcon'] ) {
	$html .= '<span class="adaire-cookie-banner__icon" aria-hidden="true">' . adaire_cookie_banner_icon_svg() . '</span>';
}
$html .= '<p class="adaire-cookie-banner__title">' . wp_kses_post( $a['bannerTitle'] ) . '</p>';
$html .= '</div>';

$html .= '<p class="adaire-cookie-banner__description">' . wp_kses_post( $a['description'] ) . '</p>';

$html .= '<div class="adaire-cookie-banner__prefs" hidden>';
foreach ( $categories as $cat ) {
	$key      = isset( $cat['key'] ) ? $cat['key'] : '';
	$label    = isset( $cat['label'] ) ? $cat['label'] : $key;
	$desc     = isset( $cat['description'] ) ? $cat['description'] : '';
	$required = ! empty( $cat['required'] );
	$checked  = ! empty( $cat['defaultChecked'] );

	$html .= '<label class="adaire-cookie-banner__pref-row">';
	$html .= '<input type="checkbox" data-category="' . esc_attr( $key ) . '"' . ( $checked ? ' checked' : '' ) . ( $required ? ' disabled' : '' ) . ' />';
	$html .= '<span><strong>' . esc_html( $label ) . '</strong>' . ( $required ? ' ' . esc_html__( '(always active)', 'adaire-blocks' ) : '' );
	if ( $desc ) {
		$html .= '<em class="adaire-cookie-banner__cat-desc">' . esc_html( $desc ) . '</em>';
	}
	$html .= '</span></label>';
}
$html .= '<div class="adaire-cookie-banner__prefs-actions">';
$html .= '<button type="button" class="adaire-cookie-banner__btn adaire-cookie-banner__btn--primary" data-cookie-action="save-prefs">' . esc_html( $a['savePreferencesText'] ) . '</button>';
$html .= '</div>';
$html .= '</div>'; // .adaire-cookie-banner__prefs

if ( $a['additionalInfo'] ) {
	$html .= '<p class="adaire-cookie-banner__additional">' . wp_kses_post( $a['additionalInfo'] ) . '</p>';
}

if ( $a['cookiePolicyUrl'] || $a['privacyPolicyUrl'] || $a['termsUrl'] ) {
	$html .= '<div class="adaire-cookie-banner__links">';
	if ( $a['cookiePolicyUrl'] ) {
		$html .= '<a href="' . esc_url( $a['cookiePolicyUrl'] ) . '">' . esc_html( $a['cookiePolicyText'] ) . '</a>';
	}
	if ( $a['privacyPolicyUrl'] ) {
		$html .= '<a href="' . esc_url( $a['privacyPolicyUrl'] ) . '">' . esc_html( $a['privacyPolicyText'] ) . '</a>';
	}
	if ( $a['termsUrl'] ) {
		$html .= '<a href="' . esc_url( $a['termsUrl'] ) . '">' . esc_html( $a['termsText'] ) . '</a>';
	}
	$html .= '</div>';
}

$html .= '<div class="adaire-cookie-banner__actions">';
$html .= '<button type="button" class="adaire-cookie-banner__btn adaire-cookie-banner__btn--ghost" data-cookie-action="manage">' . esc_html( $a['manageText'] ) . '</button>';
$html .= '<div class="adaire-cookie-banner__actions-primary">';
$html .= '<button type="button" class="adaire-cookie-banner__btn adaire-cookie-banner__btn--outline" data-cookie-action="reject">' . esc_html( $a['rejectAllText'] ) . '</button>';
$html .= '<button type="button" class="adaire-cookie-banner__btn adaire-cookie-banner__btn--primary" data-cookie-action="accept">' . esc_html( $a['acceptAllText'] ) . '</button>';
$html .= '</div>';
$html .= '</div>'; // .adaire-cookie-banner__actions

$html .= '</div>'; // .adaire-cookie-banner__panel

if ( $a['reopenButtonEnabled'] ) {
	// Icon-only round tab, matching the free Cookie Notice block's
	// __reopen button — text stays as the aria-label only.
	$html .= '<button type="button" class="adaire-cookie-banner__reopen" data-cookie-action="reopen" data-reopen-position="' . esc_attr( $a['reopenButtonPosition'] ) . '" aria-label="' . esc_attr( $a['reopenButtonText'] ) . '">';
	$html .= adaire_cookie_banner_sliders_svg();
	$html .= '</button>';
}

$html .= '</div>'; // .adaire-cookie-banner

echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every dynamic value above is escaped at the point of interpolation.
