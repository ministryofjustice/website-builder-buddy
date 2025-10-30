<?php
/**
 * Plugin Name: Website Builder Buddy
 * Description: Adds a friendly sidebar chatbot called Builder Buddy to the Gutenberg editor.
 * Author:      Ministry of Justice - Robert Lowe
 * Author URI:  https://github.com/ministryofjustice
 * License:     MIT Licence
 * License URI: https://opensource.org/licenses/MIT
 * Copyright:   Crown Copyright (c) Ministry of Justice
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include admin settings page
require_once plugin_dir_path( __FILE__ ) . 'inc/admin-settings.php';

function builder_buddy_enqueue_assets() {
	$plugin_url = plugin_dir_url( __FILE__ );

    wp_enqueue_script(
        'builder-buddy-sidebar',
        $plugin_url . 'build/index.js',
        array( 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' ),
        true
    );

    wp_enqueue_style(
        'builder-buddy-style',
        $plugin_url . 'build/style.min.css',
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/style.min.css' )
    );

    // Get saved search endpoint (no default)
    $search_endpoint = get_option( 'builder_buddy_search_endpoint', '' );

    wp_localize_script( 'builder-buddy-sidebar', 'builderBuddyData', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'searchEndpoint' => esc_url( $search_endpoint ),
    ));
}
add_action( 'enqueue_block_editor_assets', 'builder_buddy_enqueue_assets' );

add_action('wp_ajax_fetch_doc', 'builder_buddy_fetch_doc');
add_action('wp_ajax_nopriv_fetch_doc', 'builder_buddy_fetch_doc');

function builder_buddy_fetch_doc() {
    $doc_id = sanitize_text_field($_GET['doc_id']);
    if (!$doc_id) {
        wp_send_json_error('Missing doc_id');
    }

    // Get saved fetch endpoint (no default)
    $fetch_endpoint = get_option( 'builder_buddy_fetch_endpoint', '' );

    if(empty($fetch_endpoint)){
        wp_send_json_error('No Fetch API URL is configured');
    }

    $api_url = $fetch_endpoint . $doc_id;
    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        wp_send_json_error('Failed to reach API');
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    wp_send_json_success($data);
}




