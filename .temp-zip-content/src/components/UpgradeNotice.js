import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { external } from '@wordpress/icons';
import './UpgradeNotice.scss';

const UpgradeNotice = ({ 
    itemType = 'item', 
    message, 
    blockName, 
    variant = 'inline',
    customUrl = 'https://adaireblocks.com/blocks'
}) => {
    // Use custom message if provided, otherwise fallback to default
    const displayMessage = message || __(`Go pro to add more ${itemType}s`, 'adaire-blocks');
    
    if (variant === 'inline') {
        // Compact inline notice for editor panels
        return (
            <div className="adaire-upgrade-notice adaire-upgrade-notice--inline">
                <div className="adaire-upgrade-notice__content">
                    <span className="adaire-upgrade-notice__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                            <path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z" fill="currentColor"/>
                        </svg>
                    </span>
                    <span className="adaire-upgrade-notice__text">
                        {displayMessage}
                    </span>
                    <Button
                        variant="link"
                        icon={external}
                        href={customUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adaire-upgrade-notice__button"
                        style={{ padding: '4px 8px', minHeight: 'auto', fontSize: '12px' }}
                    >
                        {__('Upgrade', 'adaire-blocks')}
                    </Button>
                </div>
            </div>
        );
    }
    
    // Full notice for other contexts
    return (
        <div className="adaire-upgrade-notice adaire-upgrade-notice--full">
            <div className="adaire-upgrade-notice__content">
                <span className="adaire-upgrade-notice__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                        <path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z" fill="currentColor"/>
                    </svg>
                </span>
                <span className="adaire-upgrade-notice__text">
                    <strong>{__('Premium Feature', 'adaire-blocks')}</strong>
                    <p>{displayMessage}</p>
                </span>
                <Button
                    variant="primary"
                    icon={external}
                    href={customUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="adaire-upgrade-notice__button"
                >
                    {__('Upgrade Now', 'adaire-blocks')}
                </Button>
            </div>
        </div>
    );
};

export default UpgradeNotice;




