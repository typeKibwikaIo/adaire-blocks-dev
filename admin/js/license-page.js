/**
 * License Management JavaScript for Adaire Blocks
 *
 * @package AdaireBlocks
 */

(function($) {
    'use strict';

    class AdaireLicenseManager {
        constructor() {
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            $(document).on('submit', '#adaire-license-form', this.handleLicenseActivation.bind(this));
            $(document).on('click', '#activate-license', this.handleLicenseActivation.bind(this));
            $(document).on('click', '#deactivate-license', this.handleLicenseDeactivation.bind(this));
            $(document).on('click', '#validate-license', this.handleLicenseValidation.bind(this));
            $(document).on('click', '#refresh-status', this.handleRefreshStatus.bind(this));
        }

        handleLicenseActivation(e) {
            e.preventDefault();
            const licenseKey = $('#license-key').val().trim();
            if (!licenseKey) {
                this.showMessage('error', adaireLicense.strings.licenseKeyRequired);
                return;
            }
            this.activateLicense(licenseKey);
        }

        handleLicenseDeactivation(e) {
            e.preventDefault();
            if (!confirm(adaireLicense.strings.confirmDeactivate)) return;
            this.deactivateLicense();
        }

        handleLicenseValidation(e) {
            e.preventDefault();
            this.validateLicense();
        }

        handleRefreshStatus(e) {
            e.preventDefault();
            this.validateLicense();
        }

        activateLicense(licenseKey) {
            const $button = $('#activate-license');
            const $container = $('.adaire-license-container');
            this.setLoading($button, adaireLicense.strings.activating);
            $container.addClass('adaire-license-loading');

            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_activate_license',
                    license_key: licenseKey,
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.showMessage('success', 'License activated successfully!');
                        this.applyLicenseStatus('active', response.data);
                    } else {
                        this.showMessage('error', (response.data && response.data.message) || 'License activation failed');
                    }
                },
                error: (xhr) => {
                    const msg = xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
                    this.showMessage('error', msg || 'Network error during activation');
                },
                complete: () => {
                    this.removeLoading($button, adaireLicense.strings.activate);
                    $container.removeClass('adaire-license-loading');
                }
            });
        }

        deactivateLicense() {
            const $button = $('#deactivate-license');
            const $container = $('.adaire-license-container');
            this.setLoading($button, adaireLicense.strings.deactivating);
            $container.addClass('adaire-license-loading');

            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_deactivate_license',
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.showMessage('success', 'License deactivated successfully!');
                        localStorage.removeItem('adaire_activation_token');
                        localStorage.removeItem('adaire_license_key');
                        this.applyLicenseStatus('inactive', { message: 'License is inactive', licenseKey: '' });
                    } else {
                        this.showMessage('error', (response.data && response.data.message) || 'License deactivation failed');
                    }
                },
                error: (xhr) => {
                    const msg = xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
                    this.showMessage('error', msg || 'Network error during deactivation');
                },
                complete: () => {
                    this.removeLoading($button, adaireLicense.strings.deactivate);
                    $container.removeClass('adaire-license-loading');
                }
            });
        }

        validateLicense() {
            const $button = $('#validate-license');
            const $container = $('.adaire-license-container');
            this.setLoading($button, adaireLicense.strings.validating);
            $container.addClass('adaire-license-loading');

            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_validate_license',
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.showMessage('success', 'License validation successful!');
                        const licenseInfo = (response.data && response.data.data) || response.data;
                        this.applyLicenseStatus('active', licenseInfo);
                    } else {
                        this.showMessage('error', (response.data && response.data.message) || 'License validation failed');
                    }
                },
                error: (xhr) => {
                    const msg = xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
                    this.showMessage('error', msg || 'Network error during validation');
                },
                complete: () => {
                    this.removeLoading($button, adaireLicense.strings.validate);
                    $container.removeClass('adaire-license-loading');
                }
            });
        }

        getSavedLicenseKey() {
            const licenseKeyElement = document.querySelector('input[name="license_key"]');
            if (licenseKeyElement && licenseKeyElement.value && licenseKeyElement.value.trim()) {
                return licenseKeyElement.value.trim();
            }
            const savedKey = localStorage.getItem('adaire_license_key');
            if (savedKey && savedKey.trim()) return savedKey.trim();
            const pageData = document.querySelector('[data-license-key]');
            if (pageData) {
                const key = pageData.getAttribute('data-license-key');
                if (key && key.trim()) return key.trim();
            }
            return null;
        }

        setLoading($button, text) {
            $button.prop('disabled', true);
            $button.data('original-text', $button.html());
            $button.html(`<span class="dashicons dashicons-update"></span> ${text}`);
        }

        removeLoading($button, originalText) {
            $button.prop('disabled', false);
            $button.html($button.data('original-text') || originalText);
        }

        applyLicenseStatus(status, data) {
            const $statusBadge = $('.adaire-license-status-badge');
            $statusBadge
                .removeClass('status-active status-inactive')
                .addClass(`status-${status}`)
                .text(status.charAt(0).toUpperCase() + status.slice(1));

            const $statusCardContent = $('.adaire-license-card').eq(0).find('.adaire-license-card-content');
            if (status === 'active') {
                const d = (data && data.data) || data || {};
                const remaining     = d.remainingActivations  !== undefined ? d.remainingActivations  : (d.remaining_activations  !== undefined ? d.remaining_activations  : '-');
                const timesActivated = d.timesActivated        !== undefined ? d.timesActivated        : (d.times_activated        !== undefined ? d.times_activated        : '-');
                const timesMax      = d.timesActivatedMax      !== undefined ? d.timesActivatedMax      : (d.times_activated_max   !== undefined ? d.times_activated_max   : '-');
                const lastChecked   = d.lastChecked || d.last_checked || new Date().toISOString();

                $statusCardContent.html(
                    `<div class="adaire-license-info">
                        <p><strong>Status:</strong> <span class="status-active">Active</span></p>
                        <p><strong>Remaining Activations:</strong> ${remaining}</p>
                        <p><strong>Times Activated:</strong> ${timesActivated} / ${timesMax}</p>
                        <p><strong>Last Checked:</strong> ${this.formatDate(lastChecked)}</p>
                    </div>`
                );
            } else {
                $statusCardContent.html(
                    `<div class="adaire-license-info">
                        <p><strong>Status:</strong> <span class="status-inactive">Inactive</span></p>
                        <p class="adaire-license-message">${(data && data.message) || 'License is inactive'}</p>
                    </div>`
                );
            }

            const $actionsCardContent = $('.adaire-license-card').eq(1).find('.adaire-license-card-content');
            if (status === 'active') {
                $actionsCardContent.html(
                    `<div class="adaire-license-actions">
                        <button type="button" class="button button-secondary" id="validate-license">
                            <span class="dashicons dashicons-yes-alt"></span>
                            Validate License
                        </button>
                        <button type="button" class="button button-secondary" id="deactivate-license">
                            <span class="dashicons dashicons-dismiss"></span>
                            Deactivate License
                        </button>
                        <button type="button" class="button button-secondary" id="refresh-status">
                            <span class="dashicons dashicons-update"></span>
                            Refresh Status
                        </button>
                    </div>`
                );
            } else {
                $actionsCardContent.html(
                    `<form id="adaire-license-form" class="adaire-license-form" method="post" action="#">
                        <div class="adaire-license-input-group">
                            <label for="license-key">License Key</label>
                            <input type="text" id="license-key" name="license_key" placeholder="Enter your license key" value="${(data && data.licenseKey) ? this.escapeHtml(data.licenseKey) : ''}" required>
                            <p class="description">Enter your GutenBlocks license key to activate the plugin.</p>
                        </div>
                        <div class="adaire-license-actions">
                            <button type="submit" class="button button-primary" id="activate-license">
                                <span class="dashicons dashicons-yes"></span>
                                Activate License
                            </button>
                            <button type="button" class="button button-secondary" id="refresh-status">
                                <span class="dashicons dashicons-update"></span>
                                Refresh Status
                            </button>
                        </div>
                    </form>`
                );
            }

            const $container = $('.adaire-license-container');
            if ($container.length) {
                $container.attr('data-license-key', status === 'active' ? (this.getSavedLicenseKey() || '') : '');
            }
        }

        formatDate(dateStr) {
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                return d.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true
                });
            } catch(e) {
                return dateStr;
            }
        }

        escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        showMessage(type, message) {
            const $messagesContainer = $('#adaire-license-messages');
            const iconClass = type === 'success' ? 'dashicons-yes-alt' : 'dashicons-warning';
            const $message = $(`
                <div class="adaire-license-message-item ${type}">
                    <span class="dashicons ${iconClass}"></span>
                    <span>${message}</span>
                </div>
            `);
            $messagesContainer.append($message);
            if (type === 'success') {
                setTimeout(() => {
                    $message.fadeOut(300, function() { $(this).remove(); });
                }, 5000);
            }
            $('html, body').animate({ scrollTop: $message.offset().top - 100 }, 500);
        }

        clearMessages() {
            $('#adaire-license-messages').empty();
        }
    }

    $(document).ready(function() {
        new AdaireLicenseManager();
    });

})(jQuery);
