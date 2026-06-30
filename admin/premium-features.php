<?php
/**
 * Premium Features Marker File
 * 
 * This file serves as a marker to identify the premium version of Adaire Blocks.
 * The presence of this file tells the plugin configuration system that this is
 * the premium/pro version with all features unlocked.
 * 
 * @package AdaireBlocks
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Premium version marker constant
define('ADAIRE_BLOCKS_PREMIUM_MARKER', true);

/**
 * This file enables:
 * - All premium blocks (video-hero, portfolio, particles, services, posts-grid, project, industries, modal, etc.)
 * - Unlimited items in all blocks (no limits)
 * - Advanced features and animations
 * - Custom styling options
 * - Conditional logic and A/B testing
 * - Performance optimizations
 * - Priority support eligibility
 */

// Log premium status for debugging
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('[Adaire Blocks] Premium features marker loaded - Premium version detected');
}

