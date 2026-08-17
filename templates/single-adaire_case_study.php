<?php
/**
 * Fallback single-case-study template — premium portfolio showcase layout.
 *
 * Served via AdaireCaseStudiesCPT::single_template() (template_include
 * filter) whenever the active theme doesn't provide its own
 * single-adaire_case_study.php. Structure:
 *   1. Centered title + author byline + like count + tags.
 *   2. One large, centered, browser-chrome-framed showcase image (the Hero
 *      Image — the post's Featured Image) — the project's main preview,
 *      not a small thumbnail. This is the same image used everywhere the
 *      case study is represented (grid card, popup, nav previews).
 *   3. The free-form write-up: whatever the author built in the native
 *      block editor (post_content) — text, images, galleries, video,
 *      quotes, or anything else the project needs. No fixed sections.
 *   4. A compact Client/Country/Language/Technology detail row, copyright,
 *      and "More by [author]" / "Similar case studies" grids.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<?php while ( have_posts() ) : ?>
	<?php
	the_post();
	$post_id = get_the_ID();

	$client        = get_post_meta( $post_id, '_adaire_case_client', true );
	$country       = get_post_meta( $post_id, '_adaire_case_country', true );
	$language      = get_post_meta( $post_id, '_adaire_case_language', true );
	$technology    = get_post_meta( $post_id, '_adaire_case_technology', true );
	$summary       = get_post_meta( $post_id, '_adaire_case_summary', true );
	$link_url      = get_post_meta( $post_id, '_adaire_case_link_url', true );
	$open_new_tab  = (bool) get_post_meta( $post_id, '_adaire_case_open_in_new_tab', true );
	$likes         = (int) get_post_meta( $post_id, '_adaire_case_likes', true );

	$industry_terms   = get_the_terms( $post_id, 'adaire_case_industry' );
	$industries       = is_array( $industry_terms ) ? wp_list_pluck( $industry_terms, 'name' ) : array();
	$capability_terms = get_the_terms( $post_id, 'adaire_case_capability' );
	$capabilities     = is_array( $capability_terms ) ? wp_list_pluck( $capability_terms, 'name' ) : array();

	// Hero Image: the uploaded Featured Image wins if set, otherwise falls
	// back to the Hero Image URL field — see
	// AdaireCaseStudiesCPT::get_hero_image_url(). Either way this is the
	// single canonical preview used everywhere this case study is shown
	// (grid card, popup, nav previews, and here). The Website URL is never
	// used to generate this.
	$hero_image = class_exists( 'AdaireCaseStudiesCPT' )
		? AdaireCaseStudiesCPT::get_hero_image_url( $post_id, 'full' )
		: get_the_post_thumbnail_url( $post_id, 'full' );

	$author_id      = get_the_author_meta( 'ID' );
	$author_name    = get_the_author_meta( 'display_name' );
	$author_avatar  = get_avatar_url( $author_id, array( 'size' => 48 ) );
	$author_profile = get_author_posts_url( $author_id );

	$info_rows = array(
		__( 'Client', 'adaire-blocks' )     => $client,
		__( 'Country', 'adaire-blocks' )    => $country,
		__( 'Language', 'adaire-blocks' )   => $language,
		__( 'Technology', 'adaire-blocks' ) => $technology,
	);
	?>
	<article <?php post_class( 'adaire-cs-single' ); ?>>

		<header class="adaire-cs-single__head">
			<h1 class="adaire-cs-single__title"><?php the_title(); ?></h1>

			<?php if ( has_excerpt() ) : ?>
				<p class="adaire-cs-single__subtitle"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>

			<div class="adaire-cs-single__byline">
				<?php if ( $author_avatar ) : ?>
					<img class="adaire-cs-single__byline-avatar" src="<?php echo esc_url( $author_avatar ); ?>" alt="" width="28" height="28" />
				<?php endif; ?>
				<a class="adaire-cs-single__byline-name" href="<?php echo esc_url( $author_profile ); ?>"><?php echo esc_html( $author_name ); ?></a>
				<span class="adaire-cs-single__byline-likes">
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 21s-6.7-4.35-9.33-8.2C.6 9.77 1.6 6.2 4.8 5.02c2-.74 4-.1 5.2 1.53A4.65 4.65 0 0115.2 5c3.2 1.18 4.2 4.75 2.13 7.8C18.7 16.65 12 21 12 21z"/></svg>
					<?php echo (int) $likes; ?>
				</span>
			</div>

			<?php if ( ! empty( $industries ) || ! empty( $capabilities ) ) : ?>
				<div class="adaire-cs-single__tags">
					<?php foreach ( $industries as $ind ) : ?>
						<span class="adaire-cs-single__tag"><?php echo esc_html( $ind ); ?></span>
					<?php endforeach; ?>
					<?php foreach ( $capabilities as $cap ) : ?>
						<span class="adaire-cs-single__tag"><?php echo esc_html( $cap ); ?></span>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</header>

		<div class="adaire-cs-single__showcase">
			<div class="adaire-cs-single__browser-frame">
				<div class="adaire-cs-single__browser-bar">
					<span></span><span></span><span></span>
					<?php if ( $link_url ) : ?>
						<span class="adaire-cs-single__browser-url"><?php echo esc_html( wp_parse_url( $link_url, PHP_URL_HOST ) ); ?></span>
					<?php endif; ?>
				</div>
				<?php if ( $hero_image ) : ?>
					<img class="adaire-cs-single__showcase-image" src="<?php echo esc_url( $hero_image ); ?>" alt="<?php the_title_attribute(); ?>" />
				<?php else : ?>
					<?php
					$placeholder_color    = function_exists( 'adaire_case_studies_placeholder_color' ) ? adaire_case_studies_placeholder_color( $post_id ) : '#374151';
					$placeholder_initials = function_exists( 'adaire_case_studies_placeholder_initials' ) ? adaire_case_studies_placeholder_initials( get_the_title() ) : '•';
					?>
					<div class="adaire-cs-single__showcase-image adaire-cs-single__showcase-image--placeholder" style="background:<?php echo esc_attr( $placeholder_color ); ?>;">
						<span class="adaire-cs-single__showcase-initials"><?php echo esc_html( $placeholder_initials ); ?></span>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<?php if ( $link_url ) : ?>
			<div class="adaire-cs-single__preview-actions">
				<a class="adaire-cs-single__btn adaire-cs-single__btn--primary" href="<?php echo esc_url( $link_url ); ?>" target="<?php echo $open_new_tab ? '_blank' : '_self'; ?>" rel="noopener"><?php esc_html_e( 'Visit Live Site', 'adaire-blocks' ); ?></a>
			</div>
		<?php endif; ?>

		<div class="adaire-cs-single__container">

			<?php if ( $summary ) : ?>
				<p class="adaire-cs-single__summary"><?php echo nl2br( esc_html( $summary ) ); ?></p>
			<?php endif; ?>

			<?php if ( trim( wp_strip_all_tags( get_the_content() ) ) ) : ?>
				<section class="adaire-cs-single__section">
					<div class="adaire-cs-single__section-body adaire-cs-single__content"><?php the_content(); ?></div>
				</section>
			<?php endif; ?>

			<?php if ( array_filter( $info_rows ) ) : ?>
				<dl class="adaire-cs-single__info-grid">
					<?php foreach ( $info_rows as $label => $value ) : ?>
						<?php if ( '' === trim( (string) $value ) ) { continue; } ?>
						<div class="adaire-cs-single__info-item">
							<dt><?php echo esc_html( $label ); ?></dt>
							<dd><?php echo esc_html( $value ); ?></dd>
						</div>
					<?php endforeach; ?>
				</dl>
			<?php endif; ?>

			<p class="adaire-cs-single__copyright">
				<?php
				printf(
					/* translators: 1: client or site name, 2: current year */
					esc_html__( '© %2$s %1$s. All rights reserved.', 'adaire-blocks' ),
					esc_html( $client ? $client : get_bloginfo( 'name' ) ),
					esc_html( gmdate( 'Y' ) )
				);
				?>
			</p>

			<?php
			$all_studies = function_exists( 'adaire_case_studies_from_cpt' ) ? adaire_case_studies_from_cpt() : array();
			$current     = null;
			foreach ( $all_studies as $s ) {
				if ( (int) $s['id'] === $post_id ) {
					$current = $s;
					break;
				}
			}
			$related = ( $current && function_exists( 'adaire_case_studies_related' ) )
				? adaire_case_studies_related( $all_studies, $current, 3 )
				: array(
					'more_by_author' => array(),
					'similar'        => array(),
				);
			?>

			<?php if ( ! empty( $related['more_by_author'] ) ) : ?>
				<section class="adaire-cs-single__more">
					<h2><?php echo esc_html( sprintf( /* translators: %s: author name */ __( 'More by %s', 'adaire-blocks' ), $author_name ) ); ?></h2>
					<div class="adaire-cs-more-grid">
						<?php foreach ( $related['more_by_author'] as $index => $study ) : ?>
							<?php echo adaire_case_studies_render_card( $study, $index, false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the helper. ?>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endif; ?>

			<?php if ( ! empty( $related['similar'] ) ) : ?>
				<section class="adaire-cs-single__more">
					<h2><?php esc_html_e( 'Similar case studies', 'adaire-blocks' ); ?></h2>
					<div class="adaire-cs-more-grid">
						<?php foreach ( $related['similar'] as $index => $study ) : ?>
							<?php echo adaire_case_studies_render_card( $study, $index, false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the helper. ?>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endif; ?>
		</div>
	</article>
<?php endwhile; ?>

<?php get_footer(); ?>
