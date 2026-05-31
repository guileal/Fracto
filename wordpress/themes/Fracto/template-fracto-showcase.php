<?php
/**
 * Template Name: Fracto Showcase
 *
 * Demonstração dos dois assets 3D standalone.
 * Caminho: wp-content/themes/Fracto/template-fracto-showcase.php
 *
 * @package Fracto
 */

get_header();
?>

<main id="fracto-showcase" class="fracto-showcase">
	<section class="fracto-showcase__grid" aria-hidden="true">
		<?php echo do_shortcode( '[fracto3d_grid]' ); ?>
	</section>

	<section class="fracto-showcase__logo">
		<?php echo do_shortcode( '[fracto3d_logo]' ); ?>
	</section>
</main>

<style>
	.fracto-showcase {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
	}

	.fracto-showcase__grid {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.fracto-showcase__logo {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		pointer-events: none;
	}
</style>

<?php
get_footer();
