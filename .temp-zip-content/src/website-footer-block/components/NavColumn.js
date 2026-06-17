import { RichText, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function NavColumn({ attributes, setAttributes, isSelected }) {
    const {
        navItems,
        listStyle,
        itemSpacing,
        textAlign
    } = attributes;

    const columnProps = useBlockProps({
        className: 'website-footer-block__column website-footer-block__column--nav',
        style: { textAlign }
    });

    const updateNavItem = (index, field, value) => {
        const newItems = [...navItems];
        newItems[index][field] = value;
        setAttributes({ navItems: newItems });
    };

    const removeNavItem = (index) => {
        const newItems = navItems.filter((_, i) => i !== index);
        setAttributes({ navItems: newItems });
    };

    const addNavItem = () => {
        const newItem = {
            id: Date.now(),
            label: __('New Link', 'website-footer-block'),
            url: '#'
        };
        setAttributes({ navItems: [...navItems, newItem] });
    };

    return (
        <div {...columnProps}>
            <ul 
                className={`website-footer-block__nav-list website-footer-block__nav-list--${listStyle}`}
                style={{ gap: `${itemSpacing}px` }}
            >
                {navItems.map((item, index) => (
                    <li 
                        key={item.id} 
                        className="website-footer-block__nav-item"
                        style={{ '--item-spacing': `${itemSpacing}px` }}
                    >
                        <RichText
                            tagName="a"
                            className="website-footer-block__nav-link"
                            value={item.label}
                            onChange={(value) => updateNavItem(index, 'label', value)}
                            href={item.url}
                            placeholder={__('Link text', 'website-footer-block')}
                            withoutInteractiveFormatting
                        />
                        {isSelected && (
                            <button
                                className="website-footer-block__remove-item"
                                onClick={() => removeNavItem(index)}
                                aria-label={__('Remove link', 'website-footer-block')}
                            >
                                ×
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {isSelected && (
                <button
                    className="website-footer-block__add-item"
                    onClick={addNavItem}
                >
                    {__('+ Add Link', 'website-footer-block')}
                </button>
            )}
        </div>
    );
}