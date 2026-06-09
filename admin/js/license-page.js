/**
 * License Management JavaScript for Adaire Blocks
 *
 * @package AdaireBlocks
 */

(function($) {
    'use strict';

    class AdaireLicenseManager {
        constructor() {
            // Validation server URL - handles all license operations securely
            // This URL is passed from PHP configuration
            this.validationServerUrl = adaireLicense.validationServerUrl || 'https://adaireblocks.com/validation-server';
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            // License form submission
            $(document).on('submit', '#adaire-license-form', this.handleLicenseActivation.bind(this));
            
            // Activate license button
            $(document).on('click', '#activate-license', this.handleLicenseActivation.bind(this));
            
            // Deactivate license button
            $(document).on('click', '#deactivate-license', this.handleLicenseDeactivation.bind(this));
            
            // Validate license button
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
            
            if (!confirm(adaireLicense.strings.confirmDeactivate)) {
                return;
            }

            this.deactivateLicense();
        }

        handleLicenseValidation(e) {
            e.preventDefault();
            this.validateLicense();
        }


        handleRefreshStatus(e) {
            e.preventDefault();
            this.refreshStatus();
        }

        handleHealthCheck(e) {
            e.preventDefault();
            this.healthCheck();
        }

        activateLicense(licenseKey) {
            const $button = $('#activate-license');
            const $container = $('.adaire-license-container');
            
            this.setLoading($button, adaireLicense.strings.activating);
            $container.addClass('adaire-license-loading');
            
            // First, activate the license to get the token
            this.performActivation(licenseKey)
                .then(activationData => {
                    // Now validate to get the updated license status
                    return this.validateAfterActivation(licenseKey).then(validationData => {
                        // Combine activation data with validation data
                        return {
                            ...activationData,
                            data: {
                                ...activationData.data,
                                timesActivated: validationData.timesActivated,
                                timesActivatedMax: validationData.timesActivatedMax,
                                remainingActivations: validationData.remainingActivations
                            }
                        };
                    });
                })
                .then(combinedData => {
                    this.showMessage('success', 'License activated successfully!');
                    // Save the activation result with updated validation data to WordPress database
                    this.saveActivationResult(licenseKey, combinedData);
                })
                .catch(error => {
                    console.error('[Adaire License] Activation Process Error:', {
                        error: error,
                        message: error.message,
                        stack: error.stack,
                        licenseKey: licenseKey
                    });
                    this.showMessage('error', error.message || 'License activation failed');
                })
                .finally(() => {
                    this.removeLoading($button, adaireLicense.strings.activate);
                    $container.removeClass('adaire-license-loading');
                });
        }

        validateLicenseForActivation(licenseKey) {
            return new Promise((resolve, reject) => {
                const fullUrl = `${this.validationServerUrl}/?action=validate&license_key=${encodeURIComponent(licenseKey)}`;
                
                fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    return response.text().then(text => {
                        try {
                            const jsonData = JSON.parse(text);
                            
                            if (response.ok && jsonData.success) {
                                if (jsonData.data && jsonData.data.errors) {
                                    const errorMessages = [];
                                    Object.keys(jsonData.data.errors).forEach(key => {
                                        if (Array.isArray(jsonData.data.errors[key])) {
                                            errorMessages.push(...jsonData.data.errors[key]);
                                        } else {
                                            errorMessages.push(jsonData.data.errors[key]);
                                        }
                                    });
                                    const errorMsg = errorMessages.join('; ') || 'License validation failed';
                                    console.error('[Adaire License] Validation Error:', {
                                        errorMessages: errorMessages,
                                        fullResponse: jsonData,
                                        url: fullUrl,
                                        status: response.status
                                    });
                                    reject(new Error(errorMsg));
                                } else {
                                    resolve(jsonData.data);
                                }
                            } else {
                                console.error('[Adaire License] Validation Failed:', {
                                    message: jsonData.message,
                                    fullResponse: jsonData,
                                    url: fullUrl,
                                    status: response.status,
                                    ok: response.ok
                                });
                                reject(new Error(jsonData.message || 'License validation failed'));
                            }
                        } catch (e) {
                            console.error('[Adaire License] Validation Parse Error:', {
                                error: e,
                                responseText: text,
                                url: fullUrl,
                                status: response.status
                            });
                            reject(new Error('Invalid validation response from server'));
                        }
                    });
                })
                .catch(error => {
                    console.error('[Adaire License] Validation Network Error:', {
                        error: error,
                        message: error.message,
                        stack: error.stack,
                        url: fullUrl
                    });
                    reject(new Error('Network error during validation: ' + error.message));
                });
            });
        }

        validateAfterActivation(licenseKey) {
            return new Promise((resolve, reject) => {
                const fullUrl = `${this.validationServerUrl}/?action=validate&license_key=${encodeURIComponent(licenseKey)}`;
                
                fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    return response.text().then(text => {
                        try {
                            const jsonData = JSON.parse(text);
                            
                            if (response.ok && jsonData.success) {
                                // Extract validation data from response
                                const validationData = jsonData.data.data || jsonData.data;
                                resolve(validationData);
                            } else {
                                console.error('[Adaire License] Post-Activation Validation Failed:', {
                                    message: jsonData.message,
                                    fullResponse: jsonData,
                                    url: fullUrl,
                                    status: response.status,
                                    ok: response.ok
                                });
                                reject(new Error(jsonData.message || 'Post-activation validation failed'));
                            }
                        } catch (e) {
                            console.error('[Adaire License] Post-Activation Validation Parse Error:', {
                                error: e,
                                responseText: text,
                                url: fullUrl,
                                status: response.status
                            });
                            reject(new Error('Invalid validation response'));
                        }
                    });
                })
                .catch(error => {
                    console.error('[Adaire License] Post-Activation Validation Network Error:', {
                        error: error,
                        message: error.message,
                        stack: error.stack,
                        url: fullUrl
                    });
                    reject(new Error('Network error during post-activation validation: ' + error.message));
                });
            });
        }

        performActivation(licenseKey) {
            return new Promise((resolve, reject) => {
                const fullUrl = `${this.validationServerUrl}/?action=activate&license_key=${encodeURIComponent(licenseKey)}`;
                
                fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    return response.text().then(text => {
                        try {
                            const jsonData = JSON.parse(text);
                            
                            if (response.ok && jsonData.success) {
                                if (jsonData.data && jsonData.data.errors) {
                                    const errorMessages = [];
                                    Object.keys(jsonData.data.errors).forEach(key => {
                                        if (Array.isArray(jsonData.data.errors[key])) {
                                            errorMessages.push(...jsonData.data.errors[key]);
                                        } else {
                                            errorMessages.push(jsonData.data.errors[key]);
                                        }
                                    });
                                    const errorMsg = errorMessages.join('; ') || 'License activation failed';
                                    console.error('[Adaire License] Activation Error:', {
                                        errorMessages: errorMessages,
                                        fullResponse: jsonData,
                                        url: fullUrl,
                                        status: response.status
                                    });
                                    reject(new Error(errorMsg));
                                } else if (jsonData.data) {
                                    // Extract token from various possible locations
                                    const token = jsonData.data.token || 
                                                  jsonData.data.activationData?.token || 
                                                  jsonData.data.data?.activationData?.token ||
                                                  jsonData.data.data?.token;
                                    
                                    if (token) {
                                        // Extract license data from the activation response
                                        const licenseData = jsonData.data.data || jsonData.data;
                                        
                                        // Return activation data with token
                                        const activationResult = {
                                            ...jsonData,
                                            data: {
                                                ...jsonData.data,
                                                token: token  // Ensure token is at the top level
                                            }
                                        };
                                        resolve(activationResult);
                                    } else {
                                        console.error('[Adaire License] Activation Failed - No Token:', {
                                            fullResponse: jsonData,
                                            url: fullUrl,
                                            status: response.status
                                        });
                                        reject(new Error('License activation failed - no token received'));
                                    }
                                } else {
                                    console.error('[Adaire License] Activation Failed - No Data:', {
                                        fullResponse: jsonData,
                                        url: fullUrl,
                                        status: response.status
                                    });
                                    reject(new Error('License activation failed - no data received'));
                                }
                            } else {
                                console.error('[Adaire License] Activation Failed:', {
                                    message: jsonData.message,
                                    fullResponse: jsonData,
                                    url: fullUrl,
                                    status: response.status,
                                    ok: response.ok
                                });
                                reject(new Error(jsonData.message || 'License activation failed'));
                            }
                        } catch (e) {
                            console.error('[Adaire License] Activation Parse Error:', {
                                error: e,
                                responseText: text,
                                url: fullUrl,
                                status: response.status
                            });
                            reject(new Error('Invalid activation response from server'));
                        }
                    });
                })
                .catch(error => {
                    console.error('[Adaire License] Activation Network Error:', {
                        error: error,
                        message: error.message,
                        stack: error.stack,
                        url: fullUrl
                    });
                    reject(new Error('Network error during activation: ' + error.message));
                });
            });
        }

        deactivateLicense() {
            const $button = $('#deactivate-license');
            const $container = $('.adaire-license-container');
            
            // Get the activation token from the saved license data
            const licenseKey = this.getSavedLicenseKey();
            const activationToken = this.getActivationToken();
            
            if (!licenseKey) {
                this.showMessage('error', 'No license key found. Please activate the license first.');
                return;
            }
            
            // Build URL with or without token parameter
            let fullUrl;
            if (activationToken) {
                fullUrl = `${this.validationServerUrl}/?action=deactivate&license_key=${encodeURIComponent(licenseKey)}&token=${encodeURIComponent(activationToken)}`;
            } else {
                fullUrl = `${this.validationServerUrl}/?action=deactivate&license_key=${encodeURIComponent(licenseKey)}`;
            }
            
            this.setLoading($button, adaireLicense.strings.deactivating);
            $container.addClass('adaire-license-loading');
            
            // GET request with fetch for deactivation
            fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                return response.text().then(text => {
                    try {
                        const jsonData = JSON.parse(text);
                        
                        if (response.ok && jsonData.success) {
                            // Check if there are errors in the data
                            if (jsonData.data && jsonData.data.errors) {
                                const errorMessages = [];
                                Object.keys(jsonData.data.errors).forEach(key => {
                                    if (Array.isArray(jsonData.data.errors[key])) {
                                        errorMessages.push(...jsonData.data.errors[key]);
                                    } else {
                                        errorMessages.push(jsonData.data.errors[key]);
                                    }
                                });
                                const errorMsg = errorMessages.join('; ') || 'License deactivation failed';
                                console.error('[Adaire License] Deactivation Error:', {
                                    errorMessages: errorMessages,
                                    fullResponse: jsonData,
                                    url: fullUrl,
                                    status: response.status
                                });
                                this.showMessage('error', errorMsg);
                            } else {
                                // Successful deactivation
                                const message = activationToken ? 
                                    'License deactivated successfully!' : 
                                    'License deactivated successfully (without token)!';
                                this.showMessage('success', message);
                                // Save the deactivation result to WordPress database
                                this.saveDeactivationResult();
                            }
                        } else {
                            console.error('[Adaire License] Deactivation Failed:', {
                                message: jsonData.message,
                                fullResponse: jsonData,
                                url: fullUrl,
                                status: response.status,
                                ok: response.ok
                            });
                            this.showMessage('error', jsonData.message || 'License deactivation failed');
                        }
                    } catch (e) {
                        console.error('[Adaire License] Deactivation Parse Error:', {
                            error: e,
                            responseText: text,
                            url: fullUrl,
                            status: response.status
                        });
                        this.showMessage('error', 'Invalid response from server');
                    }
                });
            })
            .catch(error => {
                console.error('[Adaire License] Deactivation Network Error:', {
                    error: error,
                    message: error.message,
                    stack: error.stack,
                    url: fullUrl
                });
                this.showMessage('error', 'Network error: ' + error.message);
            })
            .finally(() => {
                this.removeLoading($button, adaireLicense.strings.deactivate);
                $container.removeClass('adaire-license-loading');
            });
        }

        validateLicense() {
            const $button = $('#validate-license');
            const $container = $('.adaire-license-container');
            
            // Get the license key from saved data or input
            const licenseKey = this.getSavedLicenseKey();
            
            if (!licenseKey) {
                this.showMessage('error', 'No license key found. Please activate a license first.');
                return;
            }
            
            const fullUrl = `${this.validationServerUrl}/?action=validate&license_key=${encodeURIComponent(licenseKey)}`;
            
            this.setLoading($button, adaireLicense.strings.validating);
            $container.addClass('adaire-license-loading');
            
            // GET request with fetch for validation
            fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                return response.text().then(text => {
                    try {
                        const jsonData = JSON.parse(text);
                        
                        if (response.ok && jsonData.success) {
                            // Check if there are errors in the data
                            if (jsonData.data && jsonData.data.errors) {
                                const errorMessages = [];
                                Object.keys(jsonData.data.errors).forEach(key => {
                                    if (Array.isArray(jsonData.data.errors[key])) {
                                        errorMessages.push(...jsonData.data.errors[key]);
                                    } else {
                                        errorMessages.push(jsonData.data.errors[key]);
                                    }
                                });
                                const errorMsg = errorMessages.join('; ') || 'License validation failed';
                                console.error('[Adaire License] Validation Error:', {
                                    errorMessages: errorMessages,
                                    fullResponse: jsonData,
                                    url: fullUrl,
                                    status: response.status
                                });
                                this.showMessage('error', errorMsg);
                            } else {
                                // Successful validation
                                this.showMessage('success', 'License validation successful!');
                                // Update license data with validation results
                                this.updateLicenseData(jsonData.data);
                            }
                        } else {
                            console.error('[Adaire License] Validation Failed:', {
                                message: jsonData.message,
                                fullResponse: jsonData,
                                url: fullUrl,
                                status: response.status,
                                ok: response.ok
                            });
                            this.showMessage('error', jsonData.message || 'License validation failed');
                        }
                    } catch (e) {
                        console.error('[Adaire License] Validation Parse Error:', {
                            error: e,
                            responseText: text,
                            url: fullUrl,
                            status: response.status
                        });
                        this.showMessage('error', 'Invalid response from server');
                    }
                });
            })
            .catch(error => {
                console.error('[Adaire License] Validation Network Error:', {
                    error: error,
                    message: error.message,
                    stack: error.stack,
                    url: fullUrl
                });
                this.showMessage('error', 'Network error: ' + error.message);
            })
            .finally(() => {
                this.removeLoading($button, adaireLicense.strings.validate);
                $container.removeClass('adaire-license-loading');
            });
        }


        refreshStatus() {
			this.validateLicense();
		}


        getSavedLicenseKey() {
            // Try to get license key from the page data or localStorage
            const licenseKeyElement = document.querySelector('input[name="license_key"]');
            if (licenseKeyElement && licenseKeyElement.value && licenseKeyElement.value.trim()) {
                return licenseKeyElement.value.trim();
            }
            
            // Try localStorage as fallback
            const savedKey = localStorage.getItem('adaire_license_key');
            if (savedKey && savedKey.trim()) {
                return savedKey.trim();
            }
            
            // Try to get from page data attributes
            const pageData = document.querySelector('[data-license-key]');
            if (pageData) {
                const key = pageData.getAttribute('data-license-key');
                if (key && key.trim()) {
                    return key.trim();
                }
            }
            
            return null;
        }

        getActivationToken() {
            // Try to get activation token from localStorage or page data
            const savedToken = localStorage.getItem('adaire_activation_token');
            if (savedToken) {
                return savedToken;
            }
            
            // Try to get from page data if available
            const tokenElement = document.querySelector('[data-activation-token]');
            if (tokenElement) {
                return tokenElement.getAttribute('data-activation-token');
            }
            
            return null;
        }

        saveDeactivationResult() {
            // Clear the activation token from localStorage
            localStorage.removeItem('adaire_activation_token');
            localStorage.removeItem('adaire_license_key');
            
            // Send deactivation result to WordPress
            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_save_deactivation',
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
                    if (response.success) {
                        // Update UI to reflect inactive state without reload
                        this.applyLicenseStatus('inactive', {
                            message: 'License is inactive',
                            licenseKey: ''
                        });
                    } else {
                        this.showMessage('error', 'License deactivated but failed to save status. Please refresh the page manually.');
                    }
                },
                error: (xhr, status, error) => {
                    console.error('[Adaire License] Save Deactivation AJAX Error:', {
                        xhr: xhr,
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        statusCode: xhr.status
                    });
                    this.showMessage('error', 'License deactivated but failed to save status. Please refresh the page manually.');
                }
            });
        }

		updateLicenseData(validationData) {
            // Send validation results to WordPress to update database
            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_update_license_data',
                    validation_data: validationData,
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
					if (response.success) {
						// Apply latest status to UI without reload
						const data = response.data && response.data.data ? response.data.data : response.data;
						// Use the validation data that was passed to this function
						this.applyLicenseStatus('active', validationData || data);
					} else {
                        this.showMessage('error', 'License validated but failed to update status. Please refresh the page manually.');
                    }
                },
                error: (xhr, status, error) => {
                    console.error('[Adaire License] Update License Data AJAX Error:', {
                        xhr: xhr,
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        statusCode: xhr.status,
                        validationData: validationData
                    });
                    this.showMessage('error', 'License validated but failed to update status. Please refresh the page manually.');
                }
            });
        }

		saveActivationResult(licenseKey, activationData) {
            // Save license key and token to localStorage for future use
            localStorage.setItem('adaire_license_key', licenseKey);
            const token = activationData.data?.token || activationData.data?.activationData?.token;
            if (token) {
                localStorage.setItem('adaire_activation_token', token);
            }
            
            // Send the activation result to WordPress to save in database
            $.ajax({
                url: adaireLicense.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'adaire_save_activation',
                    license_key: licenseKey,
                    activation_data: activationData, // Send as object, not stringified
                    nonce: adaireLicense.nonce
                },
                success: (response) => {
					if (response.success) {
						// Update UI to reflect active state without reload
						// Use the activation data that was passed to this function
						this.applyLicenseStatus('active', activationData?.data || activationData);
					} else {
                        this.showMessage('error', 'License activated but failed to save status. Please refresh the page manually.');
                    }
                },
                error: (xhr, status, error) => {
                    console.error('[Adaire License] Save Activation AJAX Error:', {
                        xhr: xhr,
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        statusCode: xhr.status,
                        licenseKey: licenseKey,
                        activationData: activationData
                    });
                    this.showMessage('error', 'License activated but failed to save status. Please refresh the page manually.');
                }
            });
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

		// --- UI Helpers: apply status without reloading ---
		applyLicenseStatus(status, data) {
			// Update status badge
			const $statusBadge = $('.adaire-license-status-badge');
			$statusBadge
				.removeClass('status-active status-inactive')
				.addClass(`status-${status}`)
				.text(status.charAt(0).toUpperCase() + status.slice(1));

			// Update License Status card content
			const $statusCardContent = $('.adaire-license-card').eq(0).find('.adaire-license-card-content');
			if (status === 'active') {
				// Extract data from various possible structures
				const licenseData = data.data || data;
				const remaining = licenseData.remainingActivations ?? licenseData.remaining_activations ?? '-';
				const timesActivated = licenseData.timesActivated ?? licenseData.times_activated ?? '-';
				const timesMax = licenseData.timesActivatedMax ?? licenseData.times_activated_max ?? '-';
				const lastChecked = licenseData.lastChecked || licenseData.last_checked || new Date().toISOString();
				
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

			// Update License Actions card (2nd card)
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
					`<form id="adaire-license-form" class="adaire-license-form">
						<div class="adaire-license-input-group">
							<label for="license-key">License Key</label>
							<input type="text" id="license-key" name="license_key" placeholder="Enter your license key" value="${(data && data.licenseKey) ? this.escapeHtml(data.licenseKey) : ''}" required>
							<p class="description">Enter your Adaire Blocks license key to activate the plugin.</p>
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

			// Update data-license-key attribute for persistence on page
			const $container = $('.adaire-license-container');
			if ($container.length) {
				$container.attr('data-license-key', (status === 'active' ? (data.licenseKey || this.getSavedLicenseKey() || '') : ''));
			}
		}

		formatDate(dateStr) {
			try {
				const d = new Date(dateStr);
				if (isNaN(d.getTime())) {
					return dateStr;
				}
				// Format as "Oct 22, 2025 8:36 AM"
				return d.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: '2-digit',
					hour12: true
				});
			} catch(e) {
				console.log('Adaire Blocks License: Date formatting error:', e, dateStr);
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
            
            // Auto-remove success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    $message.fadeOut(300, function() {
                        $(this).remove();
                    });
                }, 5000);
            }
            
            // Scroll to message
            $('html, body').animate({
                scrollTop: $message.offset().top - 100
            }, 500);
        }

        clearMessages() {
            $('#adaire-license-messages').empty();
        }
    }

    // Initialize when document is ready
    $(document).ready(function() {
        new AdaireLicenseManager();
    });

})(jQuery);