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
    register_setting( 'builder_buddy_settings', 'builder_buddy_search_endpoint', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);

    register_setting( 'builder_buddy_settings', 'builder_buddy_fetch_endpoint', [
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
        'builder_buddy_search_endpoint',
        'Search API URL',
        function() {
            $value = get_option( 'builder_buddy_search_endpoint', '' );
            echo '<input type="url" name="builder_buddy_search_endpoint" value="' . esc_attr( $value ) . '" class="regular-text" placeholder="https://example.com/wp-json/wp/v2/search" />';
            echo '<p class="description">Enter the REST API endpoint for search requests.</p>';
        },
        'builder_buddy_settings',
        'builder_buddy_main_section'
    );

    add_settings_field(
        'builder_buddy_fetch_endpoint',
        'Fetch API URL',
        function() {
            $value = get_option( 'builder_buddy_fetch_endpoint', '' );
            echo '<input type="url" name="builder_buddy_fetch_endpoint" value="' . esc_attr( $value ) . '" class="regular-text" placeholder="" />';
            echo '<p class="description">Enter the REST API endpoint for fetch requests.</p>';
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
}
