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

function fracto3d_theme_file_version( $relative_path ) {
	$file = get_stylesheet_directory() . '/' . ltrim( $relative_path, '/' );
	return file_exists( $file ) ? (string) filemtime( $file ) : '1.0.0';
}

/**
 * IDs de assets 3D registados.
 *
 * @return string[]
 */
function fracto3d_registered_asset_ids() {
	return array( 'background-grid-black', 'background-grid-light', 'logo-01-black' );
}

function fracto3d_sanitize_asset_id( $asset_id ) {
	$asset_id = sanitize_key( (string) $asset_id );
	return in_array( $asset_id, fracto3d_registered_asset_ids(), true ) ? $asset_id : '';
}

function fracto3d_wpbakery_category() {
	return 'Fracto Widgets';
}

/**
 * Plano B — classes CSS na row (Extra Class Name) → asset 3D.
 *
 * @return array<string, string> class => asset_id
 */
function fracto3d_row_class_asset_map() {
	return array(
		'fracto-background-grid-black' => 'background-grid-black',
		'fracto-background-grid-light' => 'background-grid-light',
		'fracto-logo-01-black'         => 'logo-01-black',
	);
}

/**
 * Resolve asset a partir de classes (el_class ou string de classes).
 */
function fracto3d_detect_asset_from_classes( $class_string ) {
	$class_string = trim( (string) $class_string );
	if ( $class_string === '' ) {
		return '';
	}

	$tokens = preg_split( '/\s+/', $class_string );
	if ( ! is_array( $tokens ) ) {
		return '';
	}

	foreach ( fracto3d_row_class_asset_map() as $row_class => $asset_id ) {
		if ( in_array( $row_class, $tokens, true ) ) {
			return fracto3d_sanitize_asset_id( $asset_id );
		}
	}

	return '';
}

function fracto3d_mark_asset_needed( $asset_id ) {
	global $fracto3d_pending_assets;

	$asset_id = fracto3d_sanitize_asset_id( $asset_id );
	if ( $asset_id === '' ) {
		return;
	}

	if ( ! is_array( $fracto3d_pending_assets ) ) {
		$fracto3d_pending_assets = array();
	}

	$fracto3d_pending_assets[ $asset_id ] = true;
}

function fracto3d_is_wpbakery_editing() {
	if ( function_exists( 'vc_is_frontend_editor' ) && vc_is_frontend_editor() ) {
		return true;
	}

	if ( function_exists( 'vc_is_inline' ) && vc_is_inline() ) {
		return true;
	}

	if ( ! empty( $_GET['vc_editable'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return true;
	}

	if ( ! empty( $_GET['vc_action'] ) && 'vc_inline' === $_GET['vc_action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return true;
	}

	return false;
}

function fracto3d_enqueue_asset( $asset_id ) {
	$asset_id = fracto3d_sanitize_asset_id( $asset_id );
	if ( $asset_id === '' ) {
		return;
	}

	fracto3d_mark_asset_needed( $asset_id );

	if ( $asset_id === 'background-grid-black' ) {
		wp_enqueue_style( 'fracto3d-background-grid-black-css' );
		wp_enqueue_script( 'fracto3d-background-grid-black-js' );
		return;
	}

	if ( $asset_id === 'background-grid-light' ) {
		wp_enqueue_style( 'fracto3d-background-grid-light-css' );
		wp_enqueue_script( 'fracto3d-background-grid-light-js' );
		return;
	}

	if ( $asset_id === 'logo-01-black' ) {
		wp_enqueue_style( 'fracto3d-logo-01-black-css' );
		wp_enqueue_script( 'fracto3d-logo-01-black-js' );
	}
}

/**
 * Markup interno do asset (sem wrapper de row/shortcode).
 *
 * @param string               $asset_id Asset registado.
 * @param array<string,string> $options  Opções do grid.
 */
function fracto3d_render_asset_inner_markup( $asset_id, $options = array() ) {
	$asset_id = fracto3d_sanitize_asset_id( $asset_id );
	if ( $asset_id === '' ) {
		return '';
	}

	if ( $asset_id === 'background-grid-black' || $asset_id === 'background-grid-light' ) {
		$html  = '<div data-fracto-3d="' . esc_attr( $asset_id ) . '" style="position: absolute !important; width: 100% !important; height: 100% !important;"';
		if ( ! empty( $options['cols'] ) ) {
			$html .= ' data-cols="' . esc_attr( $options['cols'] ) . '"';
		}
		if ( ! empty( $options['rows'] ) ) {
			$html .= ' data-rows="' . esc_attr( $options['rows'] ) . '"';
		}
		if ( ! empty( $options['light_intensity'] ) ) {
			$html .= ' data-light-intensity="' . esc_attr( $options['light_intensity'] ) . '"';
		}
		if ( ! empty( $options['light_color'] ) ) {
			$html .= ' data-light-color="' . esc_attr( $options['light_color'] ) . '"';
		}
		if ( ! empty( $options['cube_color'] ) ) {
			$html .= ' data-cube-color="' . esc_attr( $options['cube_color'] ) . '"';
		}
		if ( ! empty( $options['low_power'] ) && $options['low_power'] === 'true' ) {
			$html .= ' data-low-power="true"';
		}
		$html .= '></div>';
		return $html;
	}

	if ( $asset_id === 'logo-01-black' ) {
		return '<div data-fracto-3d="logo-01-black"></div>';
	}

	return '';
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
		'fracto3d-background-grid-light-css',
		$base . 'background-grid-light/background-grid-light.css',
		array(),
		fracto3d_asset_version( 'background-grid-light/background-grid-light.css' )
	);

	wp_register_script(
		'fracto3d-background-grid-light-js',
		$base . 'background-grid-light/background-grid-light.min.js',
		array(),
		fracto3d_asset_version( 'background-grid-light/background-grid-light.min.js' ),
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

/**
 * Garante scripts mesmo quando o shortcode enfileira após wp_enqueue_scripts (row filter).
 */
add_action( 'wp_footer', 'fracto3d_enqueue_pending_assets', 1 );
function fracto3d_enqueue_pending_assets() {
	global $fracto3d_pending_assets;

	if ( empty( $fracto3d_pending_assets ) || ! is_array( $fracto3d_pending_assets ) ) {
		return;
	}

	foreach ( array_keys( $fracto3d_pending_assets ) as $asset_id ) {
		fracto3d_enqueue_asset( $asset_id );
	}
}

/**
 * Frontend editor WPBakery — carrega bundles antes do iframe renderizar.
 */
add_action( 'wp_enqueue_scripts', 'fracto3d_editor_assets', 30 );
function fracto3d_editor_assets() {
	if ( ! fracto3d_is_wpbakery_editing() ) {
		return;
	}

	foreach ( fracto3d_registered_asset_ids() as $asset_id ) {
		fracto3d_enqueue_asset( $asset_id );
	}

	wp_enqueue_style( 'fracto3d-row-background' );
}

add_action( 'vc_front_enqueue_js_css', 'fracto3d_vc_front_enqueue' );
function fracto3d_vc_front_enqueue() {
	foreach ( fracto3d_registered_asset_ids() as $asset_id ) {
		fracto3d_enqueue_asset( $asset_id );
	}

	wp_enqueue_style( 'fracto3d-row-background' );
}

add_shortcode( 'fracto3d_grid', 'fracto3d_grid_shortcode' );
function fracto3d_grid_shortcode( $atts ) {
	fracto3d_enqueue_asset( 'background-grid-black' );

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

	$inner = fracto3d_render_asset_inner_markup(
		'background-grid-black',
		array(
			'cols'            => $atts['cols'],
			'rows'            => $atts['rows'],
			'light_intensity' => $atts['light_intensity'],
			'light_color'     => $atts['light_color'],
			'low_power'       => $atts['low_power'],
		)
	);

	return '<div class="fracto-3d-wrapper" style="position: relative !important; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 0 !important; pointer-events: none !important; overflow: hidden !important;">' . $inner . '</div>';
}

add_shortcode( 'fracto3d_grid_light', 'fracto3d_grid_light_shortcode' );
function fracto3d_grid_light_shortcode( $atts ) {
	fracto3d_enqueue_asset( 'background-grid-light' );

	$atts = shortcode_atts(
		array(
			'cols'            => '',
			'rows'            => '',
			'light_intensity' => '',
			'light_color'     => '',
			'cube_color'      => '',
			'low_power'       => 'false',
		),
		$atts,
		'fracto3d_grid_light'
	);

	$inner = fracto3d_render_asset_inner_markup(
		'background-grid-light',
		array(
			'cols'            => $atts['cols'],
			'rows'            => $atts['rows'],
			'light_intensity' => $atts['light_intensity'],
			'light_color'     => $atts['light_color'],
			'cube_color'      => $atts['cube_color'],
			'low_power'       => $atts['low_power'],
		)
	);

	return '<div class="fracto-3d-wrapper" style="position: relative !important; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 0 !important; pointer-events: none !important; overflow: hidden !important;">' . $inner . '</div>';
}

add_shortcode( 'fracto3d_logo', 'fracto3d_logo_shortcode' );
function fracto3d_logo_shortcode( $atts ) {
	fracto3d_enqueue_asset( 'logo-01-black' );

	shortcode_atts(
		array(
			'model' => 'default',
		),
		$atts,
		'fracto3d_logo'
	);

	return fracto3d_render_asset_inner_markup( 'logo-01-black' );
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
			'category'    => fracto3d_wpbakery_category(),
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

add_action( 'vc_before_init', 'fracto3d_grid_light_vc_map' );
function fracto3d_grid_light_vc_map() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}

	vc_map(
		array(
			'name'        => 'Background 3D Claro (Fracto)',
			'base'        => 'fracto3d_grid_light',
			'category'    => fracto3d_wpbakery_category(),
			'icon'        => 'icon-wpb-images-stack',
			'description' => 'Fundo interativo 3D claro — grade /v5 em fundo branco (background-grid-light).',
			'params'      => array(
				array(
					'type'       => 'colorpicker',
					'heading'    => 'Cor da Iluminação',
					'param_name' => 'light_color',
					'value'      => '',
				),
				array(
					'type'       => 'colorpicker',
					'heading'    => 'Cor do Quadrado',
					'param_name' => 'cube_color',
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
			'category'    => fracto3d_wpbakery_category(),
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

$row_bg_inc = get_stylesheet_directory() . '/inc/fracto-row-background.php';
if ( is_readable( $row_bg_inc ) ) {
	require_once $row_bg_inc;
}
