<?php
/**
 * Fallback single-case-study template.
 *
 * Served via AdaireCaseStudiesCPT::single_template() (template_include
 * filter) whenever the active theme doesn't provide its own
 * single-adaire_case_study.php. Layout follows the reference case-study
 * pages at adaire.com/case-studies/: hero image, title, short subtitle
 * (post excerpt), a Project Summary paragraph, a Client/Country/Industry/
 * Language/Technology info grid, the long-form Challenge/Solution/Results
 * write-up (the post's own content — written with normal WordPress
 * blocks), and a "Read more case studies" grid at the bottom.
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

	$client     = get_post_meta( $post_id, '_adaire_case_client', true );
	$country    = get_post_meta( $post_id, '_adaire_case_country', true );
	$language   = get_post_meta( $post_id, '_adaire_case_language', true );
	$technology = get_post_meta( $post_id, '_adaire_case_technology', true );
	$summary    = get_post_meta( $post_id, '_adaire_case_summary', true );

	$industry_terms = get_the_terms( $post_id, 'adaire_case_industry' );
	$industry       = ( is_array( $industry_terms ) && ! empty( $industry_terms ) ) ? $industry_terms[0]->name : '';

	$hero_image = get_the_post_thumbnail_url( $post_id, 'full' );

	$info_rows = array(
		__( 'Client', 'adaire-blocks' )     => $client,
		__( 'Country', 'adaire-blocks' )    => $country,
		__( 'Industry', 'adaire-blocks' )   => $industry,
		__( 'Language', 'adaire-blocks' )   => $language,
		__( 'Technology', 'adaire-blocks' ) => $technology,
	);
	?>
	<article <?php post_class( 'adaire-cs-single' ); ?>>

		<header
			class="adaire-cs-single__hero<?php echo $hero_image ? '' : ' adaire-cs-single__hero--no-image'; ?>"
			<?php if ( $hero_image ) : ?>
				style="background-image:url(<?php echo esc_url( $hero_image ); ?>)"
			<?php endif; ?>
		>
			<div class="adaire-cs-single__hero-inner">
				<h1 class="adaire-cs-single__title"><?php the_title(); ?></h1>
			</div>
		</header>

		<div class="adaire-cs-single__container">
			<?php if ( has_excerpt() ) : ?>
				<p class="adaire-cs-single__subtitle"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>

			<div class="adaire-cs-single__meta">
				<?php if ( $summary ) : ?>
					<div class="adaire-cs-single__summary">
						<h2 class="adaire-cs-single__meta-label"><?php esc_html_e( 'Project Summary', 'adaire-blocks' ); ?></h2>
						<p><?php echo nl2br( esc_html( $summary ) ); ?></p>
					</div>
				<?php endif; ?>

				<dl class="adaire-cs-single__info-grid">
					<?php foreach ( $info_rows as $label => $value ) : ?>
						<?php if ( '' === trim( (string) $value ) ) { continue; } ?>
						<div class="adaire-cs-single__info-item">
							<dt><?php echo esc_html( $label ); ?></dt>
							<dd><?php echo esc_html( $value ); ?></dd>
						</div>
					<?php endforeach; ?>
				</dl>
			</div>

			<div class="adaire-cs-single__content">
				<?php the_content(); ?>
			</div>

			<?php
			$more_studies = function_exists( 'adaire_case_studies_from_cpt' )
				? adaire_case_studies_from_cpt(
					array(
						'exclude'        => array( $post_id ),
						'posts_per_page' => 8,
					)
				)
				: array();
			?>

			<?php if ( ! empty( $more_studies ) ) : ?>
				<section class="adaire-cs-single__more">
					<h2><?php esc_html_e( 'Read more case studies', 'adaire-blocks' ); ?></h2>
					<div class="adaire-cs-more-grid">
						<?php foreach ( $more_studies as $study ) : ?>
							<a
								class="adaire-cs-more-card"
								href="<?php echo esc_url( $study['permalink'] ); ?>"
								<?php if ( ! empty( $study['backgroundImage'] ) ) : ?>
									style="background-image:url(<?php echo esc_url( $study['backgroundImage'] ); ?>)"
								<?php endif; ?>
							>
								<span class="adaire-cs-more-card__overlay">
									<span class="adaire-cs-more-card__title"><?php echo esc_html( $study['title'] ); ?></span>
									<span class="adaire-cs-more-card__description"><?php echo esc_html( $study['description'] ); ?></span>
								</span>
							</a>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endif; ?>
		</div>
	</article>
<?php endwhile; ?>

<?php get_footer(); ?>
