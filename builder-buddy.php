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

    wp_localize_script( 'builder-buddy-sidebar', 'builderBuddyData', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce('builder_buddy_nonce'),
    ));
}
add_action( 'enqueue_block_editor_assets', 'builder_buddy_enqueue_assets' );

add_action('wp_ajax_ask_builder_buddy', 'builder_buddy_ask');
add_action('wp_ajax_nopriv_ask_builder_buddy', 'builder_buddy_ask');

function builder_buddy_ask() {
    
    
      // Verify nonce for security
      check_ajax_referer('builder_buddy_nonce', 'nonce');

      $message = isset($_POST['message']) ? sanitize_text_field($_POST['message']) : '';
  
      if (empty($message)) {
          wp_send_json_error(['answer' => 'No message provided.']);
      }
    
    // Get saved fetch endpoint (no default)
    $assistant_endpoint = get_option( 'builder_buddy_endpoint', '' );

    if(empty($assistant_endpoint)){
        wp_send_json_error(['answer' => 'No Assistant Endpoint URL is configured']);
    }

    $assistant_endpoint_api_key = get_option( 'builder_buddy_endpoint_api_key', '' );

    if(empty($assistant_endpoint_api_key)){
        wp_send_json_error(['answer' => 'Endpoint API Key value not found']);
    }


    // Your JSON payload
    $data = [
        'question' => $message,
        'top_k'    => 3,
        'filters'  => null,
    ];

    // Encode data to JSON safely
    $json_data = wp_json_encode( $data );

    // Prepare request arguments
    $args = [
        'method'      => 'POST',
        'headers'     => [
            'Content-Type'  => 'application/json',
            'x-api-key'     => $assistant_endpoint_api_key,
        ],
        'body'        => $json_data,
        'timeout'     => 20,
        'data_format' => 'body',
    ];

    // Make the request
    $response = wp_remote_request( $assistant_endpoint, $args );

    if (is_wp_error($response)) {
        wp_send_json_error(['answer' => 'Failed to reach assistant endpoint']);
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    wp_send_json_success($data);
}




