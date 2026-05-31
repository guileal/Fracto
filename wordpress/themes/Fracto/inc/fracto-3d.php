<?php
/**
 * Fracto 3D — shortcodes, WPBakery e enqueue de assets standalone.
 *
 * Assets compilados em: themes/Fracto/assets/3d/
 * Gerados com: npm run build:wp (na raiz do repo Vue)
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

function fracto3d_assets_base_uri() {
	return trailingslashit( get_stylesheet_directory_uri() . '/assets/3d' );
}

function fracto3d_asset_version( $relative_path ) {
	$file = get_stylesheet_directory() . '/assets/3d/' . ltrim( $relative_path, '/' );
	return file_exists( $file ) ? (string) filemtime( $file ) : '1.0.0';
}

add_action( 'wp_enqueue_scripts', 'fracto3d_register_all_assets' );
function fracto3d_register_all_assets() {
	$base = fracto3d_assets_base_uri();

	wp_register_style(
		'fracto3d-background-grid-black-css',
		$base . 'background-grid-black/background-grid-black.css',
		array(),
		fracto3d_asset_version( 'background-grid-black/background-grid-black.css' )
	);

	wp_register_script(
		'fracto3d-background-grid-black-js',
		$base . 'background-grid-black/background-grid-black.min.js',
		array(),
		fracto3d_asset_version( 'background-grid-black/background-grid-black.min.js' ),
		true
	);

	wp_register_style(
		'fracto3d-logo-01-black-css',
		$base . 'logo-01-black/logo-01-black.css',
		array(),
		fracto3d_asset_version( 'logo-01-black/logo-01-black.css' )
	);

	wp_register_script(
		'fracto3d-logo-01-black-js',
		$base . 'logo-01-black/logo-01-black.min.js',
		array(),
		fracto3d_asset_version( 'logo-01-black/logo-01-black.min.js' ),
		true
	);
}

add_shortcode( 'fracto3d_grid', 'fracto3d_grid_shortcode' );
function fracto3d_grid_shortcode( $atts ) {
	wp_enqueue_style( 'fracto3d-background-grid-black-css' );
	wp_enqueue_script( 'fracto3d-background-grid-black-js' );

	$atts = shortcode_atts(
		array(
			'cols'            => '',
			'rows'            => '',
			'light_intensity' => '',
			'light_color'     => '',
			'low_power'       => 'false',
		),
		$atts,
		'fracto3d_grid'
	);

	$html  = '<div class="fracto-3d-wrapper" style="position: relative !important; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 0 !important; pointer-events: none !important; overflow: hidden !important;">';
	$html .= '<div data-fracto-3d="background-grid-black" style="position: absolute !important; width: 100% !important; height: 100% !important;"';

	if ( $atts['cols'] ) {
		$html .= ' data-cols="' . esc_attr( $atts['cols'] ) . '"';
	}
	if ( $atts['rows'] ) {
		$html .= ' data-rows="' . esc_attr( $atts['rows'] ) . '"';
	}
	if ( $atts['light_intensity'] ) {
		$html .= ' data-light-intensity="' . esc_attr( $atts['light_intensity'] ) . '"';
	}
	if ( $atts['light_color'] ) {
		$html .= ' data-light-color="' . esc_attr( $atts['light_color'] ) . '"';
	}
	if ( $atts['low_power'] === 'true' ) {
		$html .= ' data-low-power="true"';
	}

	$html .= '></div></div>';

	return $html;
}

add_shortcode( 'fracto3d_logo', 'fracto3d_logo_shortcode' );
function fracto3d_logo_shortcode( $atts ) {
	wp_enqueue_style( 'fracto3d-logo-01-black-css' );
	wp_enqueue_script( 'fracto3d-logo-01-black-js' );

	$atts = shortcode_atts(
		array(
			'model' => 'default',
		),
		$atts,
		'fracto3d_logo'
	);

	return '<div data-fracto-3d="logo-01-black"></div>';
}

add_action( 'vc_before_init', 'fracto3d_grid_vc_map' );
function fracto3d_grid_vc_map() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}

	vc_map(
		array(
			'name'        => 'Background 3D (Fracto)',
			'base'        => 'fracto3d_grid',
			'category'    => 'Design & Efeitos',
			'icon'        => 'icon-wpb-images-stack',
			'description' => 'Fundo interativo 3D — hero /v5 (background-grid-black).',
			'params'      => array(
				array(
					'type'       => 'colorpicker',
					'heading'    => 'Cor da Iluminação',
					'param_name' => 'light_color',
					'value'      => '',
				),
				array(
					'type'       => 'textfield',
					'heading'    => 'Intensidade da Luz',
					'param_name' => 'light_intensity',
					'value'      => '',
				),
				array(
					'type'       => 'textfield',
					'heading'    => 'Colunas (Densidade)',
					'param_name' => 'cols',
					'value'      => '',
				),
				array(
					'type'       => 'textfield',
					'heading'    => 'Linhas (Densidade)',
					'param_name' => 'rows',
					'value'      => '',
				),
				array(
					'type'       => 'checkbox',
					'heading'    => 'Modo de Economia',
					'param_name' => 'low_power',
					'value'      => array( 'Ativar' => 'true' ),
				),
			),
		)
	);
}

add_action( 'vc_before_init', 'fracto3d_logo_vc_map' );
function fracto3d_logo_vc_map() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}

	vc_map(
		array(
			'name'        => 'Objeto 3D (Logo)',
			'base'        => 'fracto3d_logo',
			'category'    => 'Design & Efeitos',
			'icon'        => 'icon-wpb-images-stack',
			'description' => 'Isotipo 3D animado — /v7 (logo-01-black).',
			'params'      => array(
				array(
					'type'       => 'dropdown',
					'heading'    => 'Escolher Modelo',
					'param_name' => 'model',
					'value'      => array(
						'Logo Padrão' => 'default',
					),
					'std'        => 'default',
				),
			),
		)
	);
}
