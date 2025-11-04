<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// Add Builder Buddy settings page to "Settings" menu
add_action( 'admin_menu', function() {
    add_options_page(
        'Builder Buddy Settings',
        'Builder Buddy',
        'manage_options',
        'builder-buddy-settings',
        'builder_buddy_settings_page'
    );
});

// Register settings
add_action( 'admin_init', function() {
   
    register_setting( 'builder_buddy_settings', 'builder_buddy_endpoint', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);

    add_settings_section(
        'builder_buddy_main_section',
        'General Settings',
        '__return_null',
        'builder_buddy_settings'
    );

    add_settings_field(
        'builder_buddy_endpoint',
        'Assistant Endpoint URL',
        function() {
            $value = get_option( 'builder_buddy_endpoint', '' );
            echo '<input type="url" name="builder_buddy_endpoint" value="' . esc_attr( $value ) . '" class="regular-text" placeholder="" />';
            echo '<p class="description">Enter the REST API endpoint for requests.</p>';
        },
        'builder_buddy_settings',
        'builder_buddy_main_section'
    ); 

});

// Render settings page
function builder_buddy_settings_page() {
    ?>
    <div class="wrap">
        <h1>Builder Buddy Settings</h1>
        <form action="options.php" method="post">
            <?php
                settings_fields( 'builder_buddy_settings' );
                do_settings_sections( 'builder_buddy_settings' );
                submit_button();
            ?>
        </form>
    </div>
    <?php

        /* Enddpoint debug code

        // Get saved fetch endpoint (no default)
        $assistant_endpoint = get_option( 'builder_buddy_endpoint', '' );

        if(!empty($assistant_endpoint)){


            // Your JSON payload
            $data = [
                //'question' => 'How do I add an accordian block?',
                'question' => 'How do I build a listing page',
                'top_k'    => 3,
                'filters'  => null,
            ];

            // Encode data to JSON safely
            $json_data = wp_json_encode( $data );

            // Value provided into the container via GitAction secrets
            $wb_config_env_value = hc_get_env_variable('WB_CONFIG');

            // Define cookie(s)
            $cookies = [
                'WB_CONFIG' => $wb_config_env_value, // replace with your actual cookie name/value
            ];

            // Build cookie header string
            $cookie_header = '';
            foreach ( $cookies as $name => $value ) {
                $cookie_header .= "{$name}={$value}; ";
            }

            // Prepare request arguments
            $args = [
                'method'      => 'POST',
                'headers'     => [
                    'Content-Type'  => 'application/json',
                    'Cookie'        => trim( $cookie_header ),
                ],
                'body'        => $json_data,
                'timeout'     => 20,
                'data_format' => 'body',
            ];

            // Make the request
            $response = wp_remote_request( $assistant_endpoint, $args );

            // Handle response
            if ( is_wp_error( $response ) ) {
                var_dump($response->get_error_message());
                echo 'a';
                error_log( 'API request failed: ' . $response->get_error_message() );
            } else {
                $code = wp_remote_retrieve_response_code( $response );
                $body = wp_remote_retrieve_body( $response );

                var_dump($code);
                // Log or decode the response
                error_log( "Response code: {$code}" );
                error_log( "Response body: {$body}" );

                // If it returns JSON
                $result = json_decode( $body, true );
                // Now $result is an array you can work with

                var_dump($result);
            }
        }*/
}
