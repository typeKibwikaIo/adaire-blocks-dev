# Adaire Blocks License System Implementation

## Overview
A comprehensive license activation system has been added to the Adaire Blocks plugin that integrates with the provided API endpoints for license validation, activation, and deactivation.

## Components Implemented

### 1. Database Layer (`includes/class-adaire-blocks-license.php`)
- **Database Table**: `wp_adaire_blocks_licenses`
  - Stores license keys, activation tokens, status, and usage statistics
  - Automatically created on plugin activation
- **License Management Class**: `AdaireBlocksLicense`
  - Singleton pattern for global access
  - Handles all API communication with license server
  - Manages license validation, activation, and deactivation
  - Automatic license validation every 24 hours

### 2. Admin Interface (`admin/license-page.php`)
- **License Management Page**: Accessible via Adaire Blocks > License
- **Features**:
  - License status display with activation counts
  - License key input and activation
  - Deactivation functionality
  - Manual license validation
  - User-friendly error messages and success feedback

### 3. JavaScript Layer (`admin/js/license-page.js`)
- **AJAX Communication**: Handles all license operations via AJAX
- **User Experience**:
  - Loading states during operations
  - Success/error message display
  - Form validation
  - Confirmation dialogs for destructive actions

### 4. Plugin Integration (`adaire-blocks.php`)
- **License Checking**: Integrated into block registration system
- **Premium Block Protection**: Premium blocks are hidden when license is inactive
- **Admin Notices**: License activation reminders in admin dashboard
- **Helper Functions**: 
  - `adaire_blocks_is_premium_available()` - Check if premium features are available
  - `adaire_render_license_notice()` - Display license activation notices

## API Integration

### Endpoints Used
1. **Validate**: `https://adaire.dev/ad/wp-json/lmfwc/v2/licenses/validate/{license_key}`
2. **Activate**: `https://adaire.dev/ad/wp-json/lmfwc/v2/licenses/activate/{license_key}`
3. **Deactivate**: `https://adaire.dev/ad/wp-json/lmfwc/v2/licenses/deactivate/{license_key}?token={token}`

### Response Handling
- **Success Responses**: Properly parsed and stored in database
- **Error Responses**: Gracefully handled with user-friendly messages
- **Network Errors**: Logged but don't invalidate existing licenses
- **Activation Limits**: Properly detected and displayed to users

## Security Features
- **Nonce Verification**: All AJAX requests protected with WordPress nonces
- **Capability Checks**: Only users with `manage_options` can manage licenses
- **Input Sanitization**: All user inputs properly sanitized
- **SQL Injection Protection**: Uses WordPress database abstraction layer

## User Experience
- **Graceful Degradation**: Plugin works with limited functionality when license is inactive
- **Clear Messaging**: Users understand what features require activation
- **Easy Activation**: Simple license key input with one-click activation
- **Status Visibility**: Clear indication of license status and remaining activations

## Premium Block Protection
The following blocks are protected and require active license:
- video-hero-block
- portfolio-block
- particles-block
- services-block
- posts-grid-block
- project-block
- scroll-text-block
- questions-block

## Error Handling
- **Network Errors**: Graceful handling of API connectivity issues
- **Invalid Responses**: Proper validation of API responses
- **License Limits**: Clear messaging when activation limits are reached
- **Database Errors**: Proper error logging and user feedback

## Files Created/Modified
- `includes/class-adaire-blocks-license.php` (NEW)
- `admin/license-page.php` (NEW)
- `admin/css/license-page.css` (NEW)
- `admin/js/license-page.js` (NEW)
- `adaire-blocks.php` (MODIFIED)

## Usage
1. Users can access license management via **Adaire Blocks > License** in WordPress admin
2. Enter license key and click "Activate License"
3. System validates with API and stores activation token
4. Premium blocks become available immediately
5. License status is automatically validated every 24 hours
6. Users can deactivate license to free up activation slots

## Testing Recommendations
1. Test license activation with valid key
2. Test activation limit handling
3. Test network error scenarios
4. Test license deactivation
5. Verify premium blocks are hidden when license inactive
6. Test admin notices display correctly
