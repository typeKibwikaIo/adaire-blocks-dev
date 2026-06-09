# Changelog - Version 1.1.1

**Release Date:** October 20, 2025

## 🎉 New Features

### License Activation System
- **Complete license management system** integrated into the plugin
- **License validation, activation, and deactivation** through external API
- **Automatic license status checking** and premium feature management
- **User-friendly license admin page** with real-time status updates

## 🔧 Technical Improvements

### License Management
- **Database integration** with automatic table creation (`wp_adaire_blocks_licenses`)
- **AJAX-powered license operations** for seamless user experience
- **Comprehensive error handling** and logging for debugging
- **Token-based activation system** with secure storage

### API Integration
- **External license API integration** with query parameter authentication
- **Support for multiple API endpoints**: validate, activate, deactivate
- **Dynamic license limits** based on license type (no hardcoded limits)
- **Auto-deactivation** when license reaches maximum activations

### User Experience
- **Intuitive license admin interface** under Adaire Blocks menu
- **Real-time license status display** with activation counts
- **Automatic license data refresh** on page load
- **Comprehensive error messages** and success notifications

## 🛠️ Code Quality

### Backend (PHP)
- **Singleton pattern implementation** for license management classes
- **Extensive logging system** for API requests and responses
- **Robust error handling** for various API response formats
- **Secure database operations** with proper sanitization

### Frontend (JavaScript)
- **Promise-based API calls** for better error handling
- **localStorage integration** for license key and token persistence
- **Dynamic UI updates** based on license status
- **Comprehensive console logging** for debugging

## 🔒 Security Features

- **Query parameter authentication** instead of basic auth headers
- **License key sanitization** and validation
- **Secure token storage** in database
- **Input validation** and sanitization throughout

## 📊 Database Changes

- **New table**: `wp_adaire_blocks_licenses`
  - Stores license keys, activation tokens, and status
  - Tracks activation counts and limits
  - Automatically created on plugin activation

## 🎯 Premium Features Integration

- **License-based block access control**
- **Premium feature gating** based on license status
- **Automatic feature enabling/disabling** based on license validation
- **Admin notices** for license status and errors

## 🐛 Bug Fixes

- **Fixed URL doubling issues** in license key processing
- **Resolved authentication problems** with external API
- **Fixed license key sanitization** for keys with spaces
- **Corrected activation token extraction** from nested API responses
- **Fixed database serialization issues** during license saving

## 📝 Documentation

- **License activation guide** (`LICENSE_ACTIVATION.md`)
- **Comprehensive system summary** (`LICENSE_SYSTEM_SUMMARY.md`)
- **Inline code documentation** throughout license system

## 🔄 Migration Notes

- **No migration required** - license system is additive
- **Existing installations** will automatically get license functionality
- **Database table created** automatically on plugin update
- **No breaking changes** to existing functionality

---

**Note:** This version introduces the complete license activation system while maintaining full backward compatibility with existing installations.

