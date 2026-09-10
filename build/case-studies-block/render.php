<?php
/**
 * Server-side render for the Case Studies block.
 *
 * All case studies are managed exclusively from Case Studies Management —
 * the `adaire_case_study` custom post type registered in
 * includes/class-adaire-case-studies-cpt.php — so this always queries it
 * live at render time. There is no manual per-block data source anymore;
 * the block's own (legacy) `caseStudies` attribute, if present from an
 * older saved version of this block, is ignored.
 *
 * The actual query + card markup helpers (adaire_case_studies_from_cpt(),
 * adaire_case_studies_render_card(), adaire_case_studies_format_dimension())
 * live in includes/case-studies-render-helpers.php, loaded once from the
 * main plugin file, so the block grid and the single case-study page
 * template (templates/single-adaire_case_study.php) always agree on what a
 * "study" looks like.
 *
 * @var array    $attributes Block attributes (already merged with block.json defaults).
 * @var string   $content    Unused — this block has no InnerBlocks.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ---------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------

$a = is_array( $attributes ) ? $attributes : array();

// Always sourced live from Case Studies Management — see the file header.
$case_studies = adaire_case_studies_from_cpt();

$enable_carousel     = ! empty( $a['enableCarousel'] );
$initial_count       = isset( $a['initialCount'] ) ? (int) $a['initialCount'] : 8;
$show_filters        = ! empty( $a['showFilters'] );
$show_load_more      = ! empty( $a['showLoadMore'] );
$show_header         = ! isset( $a['showHeader'] ) || ! empty( $a['showHeader'] );
$show_search         = ! isset( $a['showSearch'] ) || ! empty( $a['showSearch'] );
$show_category_pills = ! isset( $a['showCategoryPills'] ) || ! empty( $a['showCategoryPills'] );
$show_sort           = ! isset( $a['showSort'] ) || ! empty( $a['showSort'] );
$show_submit_button  = ! empty( $a['showSubmitButton'] );

// Unique industries / capabilities for the filter dropdowns.
$industries_seen   = array();
$capabilities_seen  = array();
foreach ( $case_studies as $study ) {
	if ( ! empty( $study['industries'] ) && is_array( $study['industries'] ) ) {
		foreach ( $study['industries'] as $ind ) {
			if ( $ind && '' !== trim( $ind ) ) {
				$industries_seen[ $ind ] = true;
			}
		}
	}
	if ( ! empty( $study['capabilities'] ) && is_array( $study['capabilities'] ) ) {
		foreach ( $study['capabilities'] as $cap ) {
			if ( $cap && '' !== trim( $cap ) ) {
				$capabilities_seen[ $cap ] = true;
			}
		}
	}
}
$industries = array_keys( $industries_seen );
sort( $industries );
$capabilities = array_keys( $capabilities_seen );
sort( $capabilities );

$style_vars = array(
	'--cs-columns'                            => isset( $a['columns'] ) ? $a['columns'] : 4,
	'--cs-columns-big-desktop'                => isset( $a['columnsBigDesktop'] ) ? $a['columnsBigDesktop'] : ( isset( $a['columns'] ) ? $a['columns'] : 4 ),
	'--cs-columns-small-laptop'                => isset( $a['columnsSmallLaptop'] ) ? $a['columnsSmallLaptop'] : ( isset( $a['columns'] ) ? $a['columns'] : 4 ),
	'--cs-columns-tablet'                      => isset( $a['columnsTablet'] ) ? $a['columnsTablet'] : 2,
	'--cs-columns-mobile'                      => isset( $a['columnsMobile'] ) ? $a['columnsMobile'] : 1,
	'--cs-gap'                                 => ( isset( $a['gap'] ) ? $a['gap'] : 24 ) . 'px',
	'--cs-card-height-big-desktop'             => adaire_case_studies_format_dimension( isset( $a['cardHeight']['bigDesktop'] ) ? $a['cardHeight']['bigDesktop'] : null, 340, 'px' ),
	'--cs-card-height'                         => adaire_case_studies_format_dimension( isset( $a['cardHeight']['desktop'] ) ? $a['cardHeight']['desktop'] : null, 320, 'px' ),
	'--cs-card-height-small-laptop'            => adaire_case_studies_format_dimension( isset( $a['cardHeight']['smallLaptop'] ) ? $a['cardHeight']['smallLaptop'] : null, 300, 'px' ),
	'--cs-card-height-tablet'                  => adaire_case_studies_format_dimension( isset( $a['cardHeight']['tablet'] ) ? $a['cardHeight']['tablet'] : null, 280, 'px' ),
	'--cs-card-height-mobile'                  => adaire_case_studies_format_dimension( isset( $a['cardHeight']['mobile'] ) ? $a['cardHeight']['mobile'] : null, 240, 'px' ),
	'--cs-card-border-radius'                  => ( isset( $a['cardBorderRadius'] ) ? $a['cardBorderRadius'] : 0 ) . 'px',
	'--cs-card-bg-color'                       => isset( $a['cardBackgroundColor'] ) ? $a['cardBackgroundColor'] : '#374151',
	'--cs-card-shadow'                         => isset( $a['cardShadow'] ) ? $a['cardShadow'] : 'none',
	'--cs-card-hover-shadow'                   => isset( $a['cardHoverShadow'] ) ? $a['cardHoverShadow'] : 'none',
	'--cs-overlay-color'                       => isset( $a['overlayColor'] ) ? $a['overlayColor'] : 'rgba(0, 0, 0, 0.4)',
	'--cs-overlay-hover-color'                 => isset( $a['overlayHoverColor'] ) ? $a['overlayHoverColor'] : 'rgba(0, 0, 0, 0.6)',
	'--cs-title-color'                         => isset( $a['titleColor'] ) ? $a['titleColor'] : '#ffffff',
	'--cs-title-font-size-big-desktop'         => adaire_case_studies_format_dimension( isset( $a['titleFontSize']['bigDesktop'] ) ? $a['titleFontSize']['bigDesktop'] : null, 22, 'px' ),
	'--cs-title-font-size'                     => adaire_case_studies_format_dimension( isset( $a['titleFontSize']['desktop'] ) ? $a['titleFontSize']['desktop'] : null, 20, 'px' ),
	'--cs-title-font-size-small-laptop'        => adaire_case_studies_format_dimension( isset( $a['titleFontSize']['smallLaptop'] ) ? $a['titleFontSize']['smallLaptop'] : null, 19, 'px' ),
	'--cs-title-font-size-tablet'              => adaire_case_studies_format_dimension( isset( $a['titleFontSize']['tablet'] ) ? $a['titleFontSize']['tablet'] : null, 18, 'px' ),
	'--cs-title-font-size-mobile'              => adaire_case_studies_format_dimension( isset( $a['titleFontSize']['mobile'] ) ? $a['titleFontSize']['mobile'] : null, 16, 'px' ),
	'--cs-title-font-weight'                   => isset( $a['titleFontWeight'] ) ? $a['titleFontWeight'] : '600',
	'--cs-title-line-height'                   => isset( $a['titleLineHeight'] ) ? $a['titleLineHeight'] : 1.3,
	'--cs-title-letter-spacing'                => ( isset( $a['titleLetterSpacing'] ) ? $a['titleLetterSpacing'] : 0 ) . 'px',
	'--cs-description-color'                   => isset( $a['descriptionColor'] ) ? $a['descriptionColor'] : '#ffffff',
	'--cs-description-font-size-big-desktop'   => adaire_case_studies_format_dimension( isset( $a['descriptionFontSize']['bigDesktop'] ) ? $a['descriptionFontSize']['bigDesktop'] : null, 14, 'px' ),
	'--cs-description-font-size'               => adaire_case_studies_format_dimension( isset( $a['descriptionFontSize']['desktop'] ) ? $a['descriptionFontSize']['desktop'] : null, 14, 'px' ),
	'--cs-description-font-size-small-laptop'  => adaire_case_studies_format_dimension( isset( $a['descriptionFontSize']['smallLaptop'] ) ? $a['descriptionFontSize']['smallLaptop'] : null, 13, 'px' ),
	'--cs-description-font-size-tablet'        => adaire_case_studies_format_dimension( isset( $a['descriptionFontSize']['tablet'] ) ? $a['descriptionFontSize']['tablet'] : null, 13, 'px' ),
	'--cs-description-font-size-mobile'        => adaire_case_studies_format_dimension( isset( $a['descriptionFontSize']['mobile'] ) ? $a['descriptionFontSize']['mobile'] : null, 12, 'px' ),
	'--cs-description-font-weight'             => isset( $a['descriptionFontWeight'] ) ? $a['descriptionFontWeight'] : '400',
	'--cs-description-line-height'             => isset( $a['descriptionLineHeight'] ) ? $a['descriptionLineHeight'] : 1.5,
	'--cs-description-letter-spacing'          => ( isset( $a['descriptionLetterSpacing'] ) ? $a['descriptionLetterSpacing'] : 0 ) . 'px',
	'--cs-description-max-lines'               => isset( $a['descriptionMaxLines'] ) ? $a['descriptionMaxLines'] : 3,
	'--cs-filter-label-color'                  => isset( $a['filterLabelColor'] ) ? $a['filterLabelColor'] : '#6b7280',
	'--cs-filter-label-font-size'              => ( isset( $a['filterLabelFontSize'] ) ? $a['filterLabelFontSize'] : 14 ) . 'px',
	'--cs-filter-border-color'                 => isset( $a['filterBorderColor'] ) ? $a['filterBorderColor'] : '#e5e7eb',
	'--cs-filter-bg-color'                      => isset( $a['filterBackgroundColor'] ) ? $a['filterBackgroundColor'] : '#ffffff',
	'--cs-filter-border-radius'                => ( isset( $a['filterBorderRadius'] ) ? $a['filterBorderRadius'] : 4 ) . 'px',
	'--cs-load-more-color'                     => isset( $a['loadMoreButtonColor'] ) ? $a['loadMoreButtonColor'] : '#1f2937',
	'--cs-load-more-bg-color'                  => isset( $a['loadMoreButtonBgColor'] ) ? $a['loadMoreButtonBgColor'] : 'transparent',
	'--cs-load-more-hover-color'                => isset( $a['loadMoreButtonHoverColor'] ) ? $a['loadMoreButtonHoverColor'] : '#7c3aed',
	'--cs-load-more-font-size'                  => ( isset( $a['loadMoreFontSize'] ) ? $a['loadMoreFontSize'] : 16 ) . 'px',
	'--cs-load-more-font-weight'                => isset( $a['loadMoreFontWeight'] ) ? $a['loadMoreFontWeight'] : '500',
	'--cs-hover-scale'                          => isset( $a['hoverScale'] ) ? $a['hoverScale'] : 1.02,
	'--cs-hover-transition'                     => ( isset( $a['hoverTransitionDuration'] ) ? $a['hoverTransitionDuration'] : 0.3 ) . 's',
	'--cs-content-padding'                      => ( isset( $a['contentPadding'] ) ? $a['contentPadding'] : 24 ) . 'px',
	'--container-max-width-big-desktop'        => adaire_case_studies_format_dimension( isset( $a['containerMaxWidth']['bigDesktop'] ) ? $a['containerMaxWidth']['bigDesktop'] : null, 1400, 'px' ),
	'--container-max-width'                     => adaire_case_studies_format_dimension( isset( $a['containerMaxWidth']['desktop'] ) ? $a['containerMaxWidth']['desktop'] : null, 1200, 'px' ),
	'--container-max-width-small-laptop'        => adaire_case_studies_format_dimension( isset( $a['containerMaxWidth']['smallLaptop'] ) ? $a['containerMaxWidth']['smallLaptop'] : null, 1200, 'px' ),
	'--container-max-width-tablet'              => adaire_case_studies_format_dimension( isset( $a['containerMaxWidth']['tablet'] ) ? $a['containerMaxWidth']['tablet'] : null, 100, '%' ),
	'--container-max-width-mobile'              => adaire_case_studies_format_dimension( isset( $a['containerMaxWidth']['mobile'] ) ? $a['containerMaxWidth']['mobile'] : null, 100, '%' ),
	'--cs-carousel-card-width-big-desktop'      => adaire_case_studies_format_dimension( isset( $a['carouselCardWidth']['bigDesktop'] ) ? $a['carouselCardWidth']['bigDesktop'] : null, 440, 'px' ),
	'--cs-carousel-card-width'                   => adaire_case_studies_format_dimension( isset( $a['carouselCardWidth']['desktop'] ) ? $a['carouselCardWidth']['desktop'] : null, 400, 'px' ),
	'--cs-carousel-card-width-small-laptop'      => adaire_case_studies_format_dimension( isset( $a['carouselCardWidth']['smallLaptop'] ) ? $a['carouselCardWidth']['smallLaptop'] : null, 360, 'px' ),
	'--cs-carousel-card-width-tablet'            => adaire_case_studies_format_dimension( isset( $a['carouselCardWidth']['tablet'] ) ? $a['carouselCardWidth']['tablet'] : null, 320, 'px' ),
	'--cs-carousel-card-width-mobile'            => adaire_case_studies_format_dimension( isset( $a['carouselCardWidth']['mobile'] ) ? $a['carouselCardWidth']['mobile'] : null, 280, 'px' ),
	'--cs-drag-cursor-size'                      => ( isset( $a['dragCursorSize'] ) ? $a['dragCursorSize'] : 80 ) . 'px',
	'--cs-drag-cursor-bg'                        => isset( $a['dragCursorBgColor'] ) ? $a['dragCursorBgColor'] : '#ffffff',
	'--cs-drag-cursor-color'                      => isset( $a['dragCursorColor'] ) ? $a['dragCursorColor'] : '#1f2937',
	'--cs-drag-cursor-font-size'                  => ( isset( $a['dragCursorFontSize'] ) ? $a['dragCursorFontSize'] : 14 ) . 'px',
	'--cs-drag-cursor-font-weight'                => isset( $a['dragCursorFontWeight'] ) ? $a['dragCursorFontWeight'] : '500',
	'--cs-drag-cursor-text-transform'             => isset( $a['dragCursorTextTransform'] ) ? $a['dragCursorTextTransform'] : 'none',
);

$style_pairs = array();
foreach ( $style_vars as $prop => $value ) {
	if ( '' === $value || null === $value ) {
		continue;
	}
	$style_pairs[] = $prop . ':' . $value;
}
$style_string = implode( ';', $style_pairs ) . ';';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                   => 'ad-case-studies-block' . ( $enable_carousel ? ' is-carousel-mode' : '' ),
		'style'                   => $style_string,
		'data-case-studies'       => wp_json_encode( $case_studies ),
		'data-initial-count'      => $initial_count,
		'data-load-more-count'    => isset( $a['loadMoreCount'] ) ? (int) $a['loadMoreCount'] : 4,
		'data-animation-duration' => isset( $a['animationDuration'] ) ? $a['animationDuration'] : 0.5,
		'data-animation-ease'     => isset( $a['animationEase'] ) ? $a['animationEase'] : 'power2.inOut',
		'data-show-filters'       => $show_filters ? 'true' : 'false',
		'data-show-load-more'     => $show_load_more ? 'true' : 'false',
		'data-enable-carousel'    => $enable_carousel ? 'true' : 'false',
		'data-drag-cursor-text'   => isset( $a['dragCursorText'] ) ? $a['dragCursorText'] : 'Drag',
		'data-next-label'         => isset( $a['nextLabel'] ) ? $a['nextLabel'] : 'Next',
		// Fallback preview image shown in the popup only for studies with no
		// Website URL set (so there's nothing to embed in the live iframe).
		'data-popup-fallback-image'     => isset( $a['popupImageUrl'] ) ? $a['popupImageUrl'] : '',
		'data-popup-fallback-image-alt' => isset( $a['popupImageAlt'] ) ? $a['popupImageAlt'] : '',
		'data-site-name'          => get_bloginfo( 'name' ),
		'data-current-year'       => gmdate( 'Y' ),
		'data-show-search'        => $show_search ? 'true' : 'false',
		'data-show-category-pills' => $show_category_pills ? 'true' : 'false',
		'data-show-sort'          => $show_sort ? 'true' : 'false',
	)
);

$container_classes = 'ad-case-studies__container' . ( ( isset( $a['containerMode'] ) ? $a['containerMode'] : 'full' ) === 'constrained' ? ' is-constrained' : '' );

ob_start();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<div class="<?php echo esc_attr( $container_classes ); ?>">
		<?php if ( $show_header ) : ?>
			<div class="ad-case-studies__header">
				<?php if ( ! empty( $a['headerEyebrow'] ) ) : ?>
					<span class="ad-case-studies__header-eyebrow"><?php echo esc_html( $a['headerEyebrow'] ); ?></span>
				<?php endif; ?>
				<?php if ( ! empty( $a['headerHeading'] ) ) : ?>
					<h2 class="ad-case-studies__header-heading"><?php echo esc_html( $a['headerHeading'] ); ?></h2>
				<?php endif; ?>
				<?php if ( ! empty( $a['headerDescription'] ) ) : ?>
					<p class="ad-case-studies__header-description"><?php echo esc_html( $a['headerDescription'] ); ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<?php if ( $show_search ) : ?>
			<div class="ad-case-studies__search">
				<svg class="ad-case-studies__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M14 14L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<input type="search" class="ad-case-studies__search-input" placeholder="<?php echo esc_attr( isset( $a['searchPlaceholder'] ) ? $a['searchPlaceholder'] : 'Search' ); ?>" aria-label="<?php esc_attr_e( 'Search case studies', 'adaire-blocks' ); ?>" />
			</div>
		<?php endif; ?>

		<?php if ( $show_category_pills || $show_sort || $show_submit_button ) : ?>
			<div class="ad-case-studies__toolbar">
				<?php if ( $show_category_pills ) : ?>
					<div class="ad-case-studies__pills" role="tablist" aria-label="<?php esc_attr_e( 'Filter by category', 'adaire-blocks' ); ?>">
						<button type="button" class="ad-case-studies__pill is-active" data-pill-value=""><?php esc_html_e( 'All', 'adaire-blocks' ); ?></button>
						<?php foreach ( $industries as $ind ) : ?>
							<button type="button" class="ad-case-studies__pill" data-pill-value="<?php echo esc_attr( $ind ); ?>"><?php echo esc_html( $ind ); ?></button>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<div class="ad-case-studies__toolbar-right">
					<?php if ( $show_sort ) : ?>
						<div class="ad-case-studies__sort">
							<select class="ad-case-studies__sort-select" aria-label="<?php esc_attr_e( 'Sort case studies', 'adaire-blocks' ); ?>">
								<option value="newest"><?php esc_html_e( 'Newest', 'adaire-blocks' ); ?></option>
								<option value="popular"><?php esc_html_e( 'Most Liked', 'adaire-blocks' ); ?></option>
							</select>
						</div>
					<?php endif; ?>
					<?php if ( $show_submit_button ) : ?>
						<a class="ad-case-studies__submit-btn" href="<?php echo esc_url( isset( $a['submitButtonUrl'] ) ? $a['submitButtonUrl'] : '#' ); ?>"><?php echo esc_html( isset( $a['submitButtonText'] ) ? $a['submitButtonText'] : 'Showcase your site' ); ?></a>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>

		<?php if ( $show_filters ) : ?>
			<div class="ad-case-studies__filters">
				<div class="ad-case-studies__filter-group">
					<select class="ad-case-studies__filter-select" data-filter-type="industry" aria-label="<?php echo esc_attr( isset( $a['industryFilterLabel'] ) ? $a['industryFilterLabel'] : 'Industry' ); ?>">
						<option value=""><?php esc_html_e( 'All Industries', 'adaire-blocks' ); ?></option>
						<?php foreach ( $industries as $ind ) : ?>
							<option value="<?php echo esc_attr( $ind ); ?>"><?php echo esc_html( $ind ); ?></option>
						<?php endforeach; ?>
					</select>
					<svg class="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</div>
				<div class="ad-case-studies__filter-group">
					<select class="ad-case-studies__filter-select" data-filter-type="capability" aria-label="<?php echo esc_attr( isset( $a['capabilityFilterLabel'] ) ? $a['capabilityFilterLabel'] : 'Capability' ); ?>">
						<option value=""><?php esc_html_e( 'All Capabilities', 'adaire-blocks' ); ?></option>
						<?php foreach ( $capabilities as $cap ) : ?>
							<option value="<?php echo esc_attr( $cap ); ?>"><?php echo esc_html( $cap ); ?></option>
						<?php endforeach; ?>
					</select>
					<svg class="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</div>
			</div>
		<?php endif; ?>

		<div class="ad-case-studies__grid<?php echo $enable_carousel ? ' ad-case-studies__carousel' : ''; ?>">
			<?php
			foreach ( $case_studies as $index => $study ) :
				$is_initially_hidden = ! $enable_carousel && $index >= $initial_count;
				echo adaire_case_studies_render_card( $study, $index, $is_initially_hidden ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the helper.
			endforeach;
			?>
		</div>

		<?php if ( ! $enable_carousel && $show_load_more && count( $case_studies ) > $initial_count ) : ?>
			<div class="ad-case-studies__load-more-wrapper">
				<button class="ad-case-studies__load-more-btn" type="button"><?php echo esc_html( isset( $a['loadMoreText'] ) ? $a['loadMoreText'] : 'Load More' ); ?></button>
				<div class="ad-case-studies__loading-spinner" style="display:none">
					<svg class="ad-case-studies__spinner-svg" viewBox="0 0 50 50"><circle class="ad-case-studies__spinner-circle" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle></svg>
				</div>
			</div>
		<?php endif; ?>
	</div>

	<?php if ( $enable_carousel ) : ?>
		<div class="ad-case-studies__drag-cursor" aria-hidden="true"><span><?php echo esc_html( isset( $a['dragCursorText'] ) ? $a['dragCursorText'] : 'Drag' ); ?></span></div>
	<?php endif; ?>
</div>
<?php
echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- all dynamic values above are escaped at the point of interpolation.
