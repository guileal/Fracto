<?php
/**
 * Fracto — preset de fundo da marca na aba Background da Row (Salient / WPBakery).
 *
 * Plano A: dropdown "Fracto — Fundo da marca" (aba Background).
 * Plano B: classe na row — ex.: fracto-background-grid-black (aba Advanced → Extra Class Name).
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

/**
 * Label do grupo Background no Salient (mesma string do vc_map da row).
 */
function fracto3d_row_background_group() {
	return function_exists( 'esc_html__' )
		? esc_html__( 'Background', 'salient' )
		: 'Background';
}

add_action( 'vc_after_init', 'fracto3d_register_row_background_param', 999 );
function fracto3d_register_row_background_param() {
	if ( ! function_exists( 'vc_add_param' ) ) {
		return;
	}

	$grid_only = array(
		'element' => 'fracto_brand_bg',
		'value'   => array( 'background-grid-black', 'background-grid-light' ),
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'dropdown',
			'heading'     => 'Fracto — Fundo da marca',
			'param_name'  => 'fracto_brand_bg',
			'group'       => fracto3d_row_background_group(),
			'weight'      => 1,
			'value'       => array(
				'Nenhum'            => '',
				'Grid preto (v5)'   => 'background-grid-black',
				'Grid claro (v5)'   => 'background-grid-light',
				'Logo 3D (v7)'      => 'logo-01-black',
			),
			'std'         => '',
			'description' => 'Plano A: preset aqui. Plano B: deixe Nenhum e use Extra Class Name → fracto-background-grid-black, fracto-background-grid-light ou fracto-logo-01-black.',
		)
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'textfield',
			'heading'     => 'Fracto — Intensidade da luz',
			'param_name'  => 'fracto_bg_light_intensity',
			'group'       => fracto3d_row_background_group(),
			'value'       => '',
			'description' => 'Opcional. Ex.: 0.10 (grid). Vazio = padrão do asset.',
			'dependency'  => $grid_only,
		)
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'colorpicker',
			'heading'     => 'Fracto — Cor da luz',
			'param_name'  => 'fracto_bg_light_color',
			'group'       => fracto3d_row_background_group(),
			'value'       => '',
			'dependency'  => $grid_only,
		)
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'textfield',
			'heading'     => 'Fracto — Colunas (grid)',
			'param_name'  => 'fracto_bg_cols',
			'group'       => fracto3d_row_background_group(),
			'value'       => '',
			'dependency'  => $grid_only,
		)
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'textfield',
			'heading'     => 'Fracto — Linhas (grid)',
			'param_name'  => 'fracto_bg_rows',
			'group'       => fracto3d_row_background_group(),
			'value'       => '',
			'dependency'  => $grid_only,
		)
	);

	vc_add_param(
		'vc_row',
		array(
			'type'        => 'checkbox',
			'heading'     => 'Fracto — Modo economia (grid)',
			'param_name'  => 'fracto_bg_low_power',
			'group'       => fracto3d_row_background_group(),
			'value'       => array( 'Ativar' => 'true' ),
			'dependency'  => $grid_only,
		)
	);
}

add_action( 'wp_enqueue_scripts', 'fracto3d_register_row_background_styles' );
function fracto3d_register_row_background_styles() {
	wp_register_style(
		'fracto3d-row-background',
		get_stylesheet_directory_uri() . '/inc/fracto-row-background.css',
		array(),
		fracto3d_theme_file_version( 'inc/fracto-row-background.css' )
	);
}

/**
 * Monta HTML do fundo 3D para injetar na row.
 *
 * @param string               $asset_id Asset registado.
 * @param array<string,string> $options  Opções do grid (cols, rows, etc.).
 */
function fracto3d_render_row_background_markup( $asset_id, $options = array() ) {
	$inner = fracto3d_render_asset_inner_markup( $asset_id, $options );
	if ( $inner === '' ) {
		return '';
	}

	return '<div class="fracto-row-brand-bg" aria-hidden="true">' . $inner . '</div>';
}

/**
 * Plano A (dropdown) ou Plano B (classe CSS na row).
 *
 * @param array<string, mixed> $atts   Atributos da vc_row.
 * @param string               $output HTML renderizado (para detetar classes no markup).
 */
function fracto3d_resolve_row_asset_id( $atts, $output ) {
	if ( ! empty( $atts['fracto_brand_bg'] ) ) {
		$from_dropdown = fracto3d_sanitize_asset_id( $atts['fracto_brand_bg'] );
		if ( $from_dropdown !== '' ) {
			return $from_dropdown;
		}
	}

	$el_class = isset( $atts['el_class'] ) ? (string) $atts['el_class'] : '';
	$from_el  = fracto3d_detect_asset_from_classes( $el_class );
	if ( $from_el !== '' ) {
		return $from_el;
	}

	if ( preg_match( '/class="([^"]*)"/i', $output, $match ) ) {
		return fracto3d_detect_asset_from_classes( $match[1] );
	}

	return '';
}

/**
 * @param array<string, mixed> $atts Atributos da vc_row.
 * @return array<string, string>
 */
function fracto3d_row_grid_options_from_atts( $atts ) {
	return array(
		'cols'            => isset( $atts['fracto_bg_cols'] ) ? (string) $atts['fracto_bg_cols'] : '',
		'rows'            => isset( $atts['fracto_bg_rows'] ) ? (string) $atts['fracto_bg_rows'] : '',
		'light_intensity' => isset( $atts['fracto_bg_light_intensity'] ) ? (string) $atts['fracto_bg_light_intensity'] : '',
		'light_color'     => isset( $atts['fracto_bg_light_color'] ) ? (string) $atts['fracto_bg_light_color'] : '',
		'low_power'       => ( isset( $atts['fracto_bg_low_power'] ) && $atts['fracto_bg_low_power'] === 'true' ) ? 'true' : 'false',
	);
}

/**
 * Marca a row exterior (não row-bg-wrap) com classe utilitária.
 */
function fracto3d_mark_row_with_brand_class( $output, $class_token ) {
	$patterns = array(
		'/(<div[^>]*class=")([^"]*\brow\b[^"]*\bvc_row\b[^"]*)(")/i',
		'/(<div[^>]*class=")([^"]*\bvc_row\b[^"]*\brow\b[^"]*)(")/i',
		'/(<div[^>]*class=")([^"]*\brow\b[^"]*)(")/i',
	);

	foreach ( $patterns as $pattern ) {
		if ( preg_match( $pattern, $output, $match, PREG_OFFSET_CAPTURE ) ) {
			$full   = $match[0][0];
			$pos    = $match[0][1];
			$marked = $match[1][0] . $match[2][0] . ' ' . esc_attr( $class_token ) . $match[3][0];
			return substr_replace( $output, $marked, $pos, strlen( $full ) );
		}
	}

	return $output;
}

/**
 * Injeta markup 3D na row e marca classes utilitárias.
 */
function fracto3d_apply_row_brand_background( $output, $asset_id, $grid_options ) {
	$bg_html = fracto3d_render_row_background_markup( $asset_id, $grid_options );
	if ( $bg_html === '' ) {
		return $output;
	}

	if ( strpos( $output, 'fracto-row-brand-bg' ) !== false ) {
		return $output;
	}

	$class_token = 'fracto-row-has-brand-bg fracto-row-brand-bg--' . sanitize_html_class( $asset_id );

	// Salient: 3D só dentro de row-bg-wrap (camada de background), nunca nas colunas.
	if ( preg_match( '/(<div class="row-bg-wrap[^"]*"[^>]*>)/i', $output, $wrap_match, PREG_OFFSET_CAPTURE ) ) {
		$pos    = $wrap_match[0][1] + strlen( $wrap_match[0][0] );
		$output = substr( $output, 0, $pos ) . $bg_html . substr( $output, $pos );
	} elseif ( preg_match( '/(<div class="row_col_wrap_12[^"]*"[^>]*>)/i', $output, $col_match, PREG_OFFSET_CAPTURE ) ) {
		$pos    = $col_match[0][1];
		$output = substr( $output, 0, $pos ) . $bg_html . substr( $output, $pos );
	} else {
		return $output;
	}

	return fracto3d_mark_row_with_brand_class( $output, $class_token );
}

/**
 * Identifica o shortcode base do WPBakery sem chamar settings() sem argumentos
 * (Salient/js_composer exige 1 parâmetro em settings()).
 */
function fracto3d_wpbakery_shortcode_base( $obj ) {
	if ( is_string( $obj ) ) {
		return $obj;
	}

	if ( ! is_object( $obj ) ) {
		return '';
	}

	if ( method_exists( $obj, 'getShortcode' ) ) {
		$tag = $obj->getShortcode();
		if ( is_string( $tag ) && $tag !== '' ) {
			return $tag;
		}
	}

	if ( isset( $obj->settings ) && is_array( $obj->settings ) && ! empty( $obj->settings['base'] ) ) {
		return (string) $obj->settings['base'];
	}

	if ( method_exists( $obj, 'settings' ) ) {
		$base = $obj->settings( 'base' );
		if ( is_string( $base ) && $base !== '' ) {
			return $base;
		}
	}

	$class = get_class( $obj );
	if ( stripos( $class, 'Vc_Row' ) !== false ) {
		return 'vc_row';
	}

	return '';
}

add_filter( 'vc_shortcode_output', 'fracto3d_inject_row_brand_background', 10, 3 );
function fracto3d_inject_row_brand_background( $output, $obj, $atts ) {
	if ( ! is_string( $output ) || ! is_array( $atts ) ) {
		return $output;
	}

	if ( fracto3d_wpbakery_shortcode_base( $obj ) !== 'vc_row' ) {
		return $output;
	}

	$asset_id = fracto3d_resolve_row_asset_id( $atts, $output );
	if ( $asset_id === '' ) {
		return $output;
	}

	fracto3d_enqueue_asset( $asset_id );
	wp_enqueue_style( 'fracto3d-row-background' );

	return fracto3d_apply_row_brand_background( $output, $asset_id, fracto3d_row_grid_options_from_atts( $atts ) );
}
