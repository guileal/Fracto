<?php
/**
 * Carrega wp-registry.json (gerado por npm run build:wp a partir de wp-assets.manifest.jsonc).
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

/**
 * @return array{version?:int,generatedAt?:string,assets:array<int,array<string,mixed>>}
 */
function fracto3d_load_registry() {
	static $registry = null;

	if ( is_array( $registry ) ) {
		return $registry;
	}

	$path = get_stylesheet_directory() . '/assets/wp-registry.json';
	if ( ! is_readable( $path ) ) {
		$registry = array( 'assets' => array() );
		return $registry;
	}

	$decoded = json_decode( (string) file_get_contents( $path ), true );
	if ( ! is_array( $decoded ) || ! isset( $decoded['assets'] ) || ! is_array( $decoded['assets'] ) ) {
		$registry = array( 'assets' => array() );
		return $registry;
	}

	$registry = $decoded;
	return $registry;
}

/**
 * @return array<int,array<string,mixed>>
 */
function fracto3d_registry_assets() {
	$registry = fracto3d_load_registry();
	return isset( $registry['assets'] ) && is_array( $registry['assets'] ) ? $registry['assets'] : array();
}

/**
 * @return string[]
 */
function fracto3d_registered_asset_ids() {
	$ids = array();
	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( ! empty( $asset['id'] ) ) {
			$ids[] = (string) $asset['id'];
		}
	}
	return $ids;
}

/**
 * @param string $asset_id Asset ID.
 * @return array<string,mixed>|null
 */
function fracto3d_get_registry_asset( $asset_id ) {
	$asset_id = sanitize_key( (string) $asset_id );
	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( ! empty( $asset['id'] ) && (string) $asset['id'] === $asset_id ) {
			return $asset;
		}
	}
	return null;
}

/**
 * @param string $shortcode Shortcode tag.
 * @return array<string,mixed>|null
 */
function fracto3d_get_registry_asset_by_shortcode( $shortcode ) {
	$shortcode = sanitize_key( (string) $shortcode );
	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( ! empty( $asset['shortcode'] ) && (string) $asset['shortcode'] === $shortcode ) {
			return $asset;
		}
	}
	return null;
}

/**
 * @return array<string, string> row CSS class => asset id
 */
function fracto3d_row_class_asset_map() {
	$map = array();
	foreach ( fracto3d_registry_assets() as $asset ) {
		if ( empty( $asset['rowClass'] ) || empty( $asset['id'] ) ) {
			continue;
		}
		$map[ (string) $asset['rowClass'] ] = (string) $asset['id'];
	}
	return $map;
}

/**
 * @param string $asset_id Asset ID.
 * @return string
 */
function fracto3d_asset_style_handle( $asset_id ) {
	return 'fracto3d-' . sanitize_key( (string) $asset_id ) . '-css';
}

/**
 * @param string $asset_id Asset ID.
 * @return string
 */
function fracto3d_asset_script_handle( $asset_id ) {
	return 'fracto3d-' . sanitize_key( (string) $asset_id ) . '-js';
}
