# Adaire Blocks - License Activation System

## Overview
The Adaire Blocks plugin includes a license activation system that validates and manages premium features through an external API.

## How It Works

### 1. License Input
- Users enter their license key in the WordPress admin under **Adaire Blocks > License**
- License keys are validated against the external API endpoint

### 2. Activation Process
- **Validation**: License key is validated to check status and limits
- **Activation**: If valid, the license is activated and a token is generated
- **Storage**: License data and activation token are stored in the database

### 3. API Endpoints
- **Validate**: `GET /wp-json/lmfwc/v2/licenses/validate/{license_key}`
- **Activate**: `GET /wp-json/lmfwc/v2/licenses/activate/{license_key}`
- **Deactivate**: `GET /wp-json/lmfwc/v2/licenses/deactivate/{license_key}?token={token}`

### 4. Authentication
- Uses query parameters: `consumer_key` and `consumer_secret`
- No basic authentication headers required

### 5. License Limits
- Each license has a maximum activation limit (varies by license type)
- System tracks remaining activations and times activated
- Auto-deactivation occurs when `timesActivated` reaches 0

### 6. Database Storage
- Table: `wp_adaire_blocks_licenses`
- Stores: license key, activation token, status, activation counts
- Automatically created on plugin activation

## User Experience
1. Enter license key → Click "Activate License"
2. System validates and activates automatically
3. Premium features become available
4. License status displayed in admin panel

## Technical Notes
- Built with PHP backend and JavaScript frontend
- Uses WordPress AJAX for seamless user experience
- Comprehensive logging for debugging
- Handles various API response formats and error states

