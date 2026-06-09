import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Custom hook to check block limits and provide upgrade notice
 * 
 * @param {string} blockName - The block name (e.g., 'accordion-block')
 * @param {Array} items - The current items array to check length against
 * @param {string} itemType - The type of item (e.g., 'accordion', 'logo', 'tab')
 * @returns {Object} - { isLimitReached, showUpgradeNotice, upgradeMessage }
 */
export const useBlockLimits = (blockName, items = [], itemType = 'item') => {
    // Get plugin configuration from WordPress data
    const pluginConfig = useSelect((select) => {
        // Try to get from editor settings or global WordPress data
        const editorSettings = select('core/editor')?.getEditorSettings?.();
        return editorSettings?.adaireBlocksConfig || null;
    }, []);

    // Check if we're in premium mode (no limits)
    const isPremium = pluginConfig?.isPremium || false;
    
    // If premium, no limits
    if (isPremium) {
        return {
            isLimitReached: false,
            showUpgradeNotice: false,
            upgradeMessage: '',
            maxItems: Infinity,
            currentCount: items.length
        };
    }

    // Get block configuration for free version
    const blockConfig = pluginConfig?.blocks?.[blockName] || null;
    
    // If no configuration found, assume no limits (fallback to premium behavior)
    if (!blockConfig) {
        return {
            isLimitReached: false,
            showUpgradeNotice: false,
            upgradeMessage: '',
            maxItems: Infinity,
            currentCount: items.length
        };
    }

    const limits = blockConfig.limits || {};
    const maxItems = limits.maxItems || Infinity;
    
    const isLimitReached = items.length >= maxItems;
    
    const upgradeMessage = blockConfig.upgradeMessage || 
        __(`Go pro to add more ${itemType}s`, 'adaire-blocks');
    
    const showUpgradeNotice = isLimitReached && maxItems !== Infinity;

    return {
        isLimitReached,
        showUpgradeNotice,
        upgradeMessage,
        maxItems,
        currentCount: items.length
    };
};

export default useBlockLimits;



