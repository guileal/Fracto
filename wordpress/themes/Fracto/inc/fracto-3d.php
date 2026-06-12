<?php
/**
 * Fracto 3D — shortcodes, WPBakery e enqueue de assets standalone.
 *
 * Assets compilados em: themes/Fracto/assets/3d/
 * Manifesto: wordpress/wp-assets.manifest.jsonc → npm run build:wp → assets/wp-registry.json
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

require_once get_stylesheet_directory() . '/inc/fracto-registry.php';

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

function fracto3d_sanitize_asset_id( $asset_id ) {
	$asset_id = sanitize_key( (string) $asset_id );
	return in_array( $asset_id, fracto3d_registered_asset_ids(), true ) ? $asset_id : '';
}

function fracto3d_wpbakery_category() {
	return 'Fracto Widgets';
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
	wp_enqueue_style( fracto3d_asset_style_handle( $asset_id ) );
	wp_enqueue_script( fracto3d_asset_script_handle( $asset_id ) );
}

/**
 * @param array<string,mixed> $asset Registry entry.
 * @return array<string, array<string, string>>
 */
function fracto3d_grid_shortcode_atts_defaults( $asset ) {
	$defaults = array(
		'cols'            => '',
		'rows'            => '',
		'light_intensity' => '',
		'light_color'     => '',
		'low_power'       => 'false',
	);

	$options = isset( $asset['gridOptions'] ) && is_array( $asset['gridOptions'] ) ? $asset['gridOptions'] : array();
	if ( in_array( 'cube_color', $options, true ) ) {
		$defaults['cube_color'] = '';
	}

	return $defaults;
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

	$asset = fracto3d_get_registry_asset( $asset_id );
	if ( ! $asset ) {
		return '';
	}

	$type = isset( $asset['type'] ) ? (string) $asset['type'] : '';

	if ( $type === 'grid' ) {
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

	if ( $type === 'logo' ) {
		return '<div data-fracto-3d="' . esc_attr( $asset_id ) . '"></div>';
	}

	return '';
}

add_action( 'wp_enqueue_scripts', 'fracto3d_register_all_assets' );
function fracto3d_register_all_assets() {
	$base = fracto3d_assets_base_uri();

	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( empty( $asset['id'] ) ) {
			continue;
		}

		$asset_id = (string) $asset['id'];
		$rel_css  = $asset_id . '/' . $asset_id . '.css';
		$rel_js   = $asset_id . '/' . $asset_id . '.min.js';

		wp_register_style(
			fracto3d_asset_style_handle( $asset_id ),
			$base . $rel_css,
			array(),
			fracto3d_asset_version( $rel_css )
		);

		wp_register_script(
			fracto3d_asset_script_handle( $asset_id ),
			$base . $rel_js,
			array(),
			fracto3d_asset_version( $rel_js ),
			true
		);
	}
}

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

/**
 * Shortcode genérico — tag mapeada via wp-registry.json.
 *
 * @param array<string,string>|string $atts Shortcode attributes.
 * @param string|null                 $content Inner content.
 * @param string                      $tag Shortcode tag.
 */
function fracto3d_asset_shortcode( $atts, $content = '', $tag = '' ) {
	$asset = fracto3d_get_registry_asset_by_shortcode( $tag );
	if ( ! $asset || empty( $asset['id'] ) ) {
		return '';
	}

	$asset_id = (string) $asset['id'];
	$type     = isset( $asset['type'] ) ? (string) $asset['type'] : '';

	fracto3d_enqueue_asset( $asset_id );

	if ( $type === 'grid' ) {
		$defaults = fracto3d_grid_shortcode_atts_defaults( $asset );
		$atts     = shortcode_atts( $defaults, $atts, $tag );

		$inner = fracto3d_render_asset_inner_markup(
			$asset_id,
			array(
				'cols'            => $atts['cols'],
				'rows'            => $atts['rows'],
				'light_intensity' => $atts['light_intensity'],
				'light_color'     => $atts['light_color'],
				'cube_color'      => isset( $atts['cube_color'] ) ? $atts['cube_color'] : '',
				'low_power'       => $atts['low_power'],
			)
		);

		return '<div class="fracto-3d-wrapper" style="position: relative !important; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 0 !important; pointer-events: none !important; overflow: hidden !important;">' . $inner . '</div>';
	}

	if ( $type === 'logo' ) {
		shortcode_atts( array( 'model' => 'default' ), $atts, $tag );
		return fracto3d_render_asset_inner_markup( $asset_id );
	}

	return '';
}

add_action( 'init', 'fracto3d_register_shortcodes' );
function fracto3d_register_shortcodes() {
	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( empty( $asset['shortcode'] ) ) {
			continue;
		}
		add_shortcode( (string) $asset['shortcode'], 'fracto3d_asset_shortcode' );
	}
}

/**
 * @return array<int, array<string, mixed>>
 */
function fracto3d_grid_vc_params( $asset ) {
	$params = array(
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
	);

	$options = isset( $asset['gridOptions'] ) && is_array( $asset['gridOptions'] ) ? $asset['gridOptions'] : array();
	if ( in_array( 'cube_color', $options, true ) ) {
		array_splice(
			$params,
			1,
			0,
			array(
				array(
					'type'       => 'colorpicker',
					'heading'    => 'Cor do Quadrado',
					'param_name' => 'cube_color',
					'value'      => '',
				),
			)
		);
	}

	return $params;
}

add_action( 'vc_before_init', 'fracto3d_register_vc_maps' );
function fracto3d_register_vc_maps() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}

	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( empty( $asset['shortcode'] ) || empty( $asset['vcName'] ) ) {
			continue;
		}

		$type = isset( $asset['type'] ) ? (string) $asset['type'] : '';
		$desc = ! empty( $asset['description'] ) ? (string) $asset['description'] : '';

		if ( $type === 'grid' ) {
			vc_map(
				array(
					'name'        => (string) $asset['vcName'],
					'base'        => (string) $asset['shortcode'],
					'category'    => fracto3d_wpbakery_category(),
					'icon'        => 'icon-wpb-images-stack',
					'description' => $desc,
					'params'      => fracto3d_grid_vc_params( $asset ),
				)
			);
			continue;
		}

		if ( $type === 'logo' ) {
			vc_map(
				array(
					'name'        => (string) $asset['vcName'],
					'base'        => (string) $asset['shortcode'],
					'category'    => fracto3d_wpbakery_category(),
					'icon'        => 'icon-wpb-images-stack',
					'description' => $desc,
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
	}
}

$row_bg_inc = get_stylesheet_directory() . '/inc/fracto-row-background.php';
if ( is_readable( $row_bg_inc ) ) {
	require_once $row_bg_inc;
}
