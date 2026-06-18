<?php
/**
 * Divisor de blocos Fracto — scroll scrub + WPBakery.
 *
 * Assets: themes/Fracto/assets/ui/block-divider/
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

function fracto_block_divider_assets_uri() {
	return trailingslashit( get_stylesheet_directory_uri() . '/assets/ui/block-divider' );
}

function fracto_block_divider_asset_version( $filename ) {
	$file = get_stylesheet_directory() . '/assets/ui/block-divider/' . ltrim( $filename, '/' );
	return file_exists( $file ) ? (string) filemtime( $file ) : '1.0.0';
}

function fracto_block_divider_variants() {
	return array(
		'default'  => 'Padrão (preto → branco)',
		'inverted' => 'Invertido (branco → preto)',
		'sparse'   => 'Esparso',
		'dense'    => 'Denso',
	);
}

function fracto_block_divider_sanitize_variant( $variant ) {
	$variant = sanitize_key( (string) $variant );
	$variants = fracto_block_divider_variants();
	return isset( $variants[ $variant ] ) ? $variant : 'default';
}

function fracto_block_divider_register_assets() {
	wp_register_style(
		'fracto-block-divider',
		fracto_block_divider_assets_uri() . 'block-divider.css',
		array(),
		fracto_block_divider_asset_version( 'block-divider.css' )
	);

	wp_register_script(
		'fracto-block-divider',
		fracto_block_divider_assets_uri() . 'block-divider.min.js',
		array(),
		fracto_block_divider_asset_version( 'block-divider.min.js' ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'fracto_block_divider_register_assets' );

function fracto_block_divider_enqueue() {
	wp_enqueue_style( 'fracto-block-divider' );
	wp_enqueue_script( 'fracto-block-divider' );
}

/**
 * @param array<string,string>|string $atts Shortcode attributes.
 */
function fracto_block_divider_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'variant'     => 'default',
			'complete_at' => '0.4',
			'accent_color'=> '',
		),
		$atts,
		'fracto_block_divider'
	);

	$variant      = fracto_block_divider_sanitize_variant( $atts['variant'] );
	$complete_at  = (float) $atts['complete_at'];
	$complete_at  = max( 0.05, min( 1.0, $complete_at ) );
	$accent_color = sanitize_hex_color( (string) $atts['accent_color'] );

	fracto_block_divider_enqueue();

	$attrs = array(
		'class'                   => 'fracto-block-divider',
		'data-fracto-block-divider' => $variant,
		'data-complete-at'        => (string) $complete_at,
	);

	if ( $accent_color ) {
		$attrs['data-accent-color'] = $accent_color;
		$attrs['style']             = '--fracto-divider-accent: ' . $accent_color . ';';
	}

	$attr_html = '';
	foreach ( $attrs as $key => $value ) {
		$attr_html .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $value ) );
	}

	return '<div class="fracto-block-divider-wrap"><div' . $attr_html . '></div></div>';
}
add_shortcode( 'fracto_block_divider', 'fracto_block_divider_shortcode' );

function fracto_block_divider_is_wpbakery_editing() {
	if ( function_exists( 'vc_is_frontend_editor' ) && vc_is_frontend_editor() ) {
		return true;
	}
	if ( function_exists( 'vc_is_page_editable' ) && vc_is_page_editable() ) {
		return true;
	}
	if ( is_admin() && isset( $_GET['vc_editable'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return true;
	}
	return false;
}

add_action( 'wp_enqueue_scripts', 'fracto_block_divider_editor_assets', 30 );
function fracto_block_divider_editor_assets() {
	if ( ! fracto_block_divider_is_wpbakery_editing() ) {
		return;
	}
	fracto_block_divider_enqueue();
}

add_action( 'vc_front_enqueue_js_css', 'fracto_block_divider_vc_front_enqueue' );
function fracto_block_divider_vc_front_enqueue() {
	fracto_block_divider_enqueue();
}

add_action( 'vc_before_init', 'fracto_block_divider_register_vc_map' );
function fracto_block_divider_register_vc_map() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}

	$variant_options = array();
	foreach ( fracto_block_divider_variants() as $id => $label ) {
		$variant_options[ $label ] = $id;
	}

	vc_map(
		array(
			'name'        => 'Divisor de blocos (Fracto)',
			'base'        => 'fracto_block_divider',
			'category'    => 'Fracto Widgets',
			'icon'        => 'icon-wpb-ui-separator',
			'description' => 'Transição pixelada preto/branco com formação no scroll (piscar tech).',
			'params'      => array(
				array(
					'type'       => 'dropdown',
					'heading'    => 'Variante',
					'param_name' => 'variant',
					'value'      => $variant_options,
					'std'        => 'default',
				),
				array(
					'type'       => 'textfield',
					'heading'    => 'Formação completa aos (0–1)',
					'param_name' => 'complete_at',
					'value'      => '0.4',
					'description'=> '0.4 = blocos montados aos 40% do percurso até a secção entrar no viewport.',
				),
				array(
					'type'       => 'colorpicker',
					'heading'    => 'Cor accent (laranja)',
					'param_name' => 'accent_color',
					'description'=> 'Opcional. Default #f26522.',
				),
			),
		)
	);
}
