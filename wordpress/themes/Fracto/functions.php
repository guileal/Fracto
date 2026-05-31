<?php
/**
 * Fracto Child Theme — bootstrap.
 *
 * IMPORTANTE: este ficheiro deve conter APENAS o require abaixo.
 * Não mantenhas código antigo de fracto3d_* aqui — vive em inc/fracto-3d.php
 *
 * @package Fracto
 */

defined( 'ABSPATH' ) || exit;

$fracto_inc = get_stylesheet_directory() . '/inc/fracto-3d.php';

if ( is_readable( $fracto_inc ) ) {
	require_once $fracto_inc;
} elseif ( is_admin() ) {
	add_action(
		'admin_notices',
		static function () {
			echo '<div class="notice notice-error"><p><strong>Fracto:</strong> falta o ficheiro <code>inc/fracto-3d.php</code>. Copie a pasta <code>themes/Fracto/</code> completa do repo.</p></div>';
		}
	);
}
