import { RichText, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function BrandColumn({ attributes, setAttributes, isSelected }) {
    const {
        brandLogo,
        brandLogoWidth,
        brandName,
        description,
        showCta,
        ctaText,
        ctaUrl,
        ctaStyle,
        ctaBackgroundColor,
        ctaTextColor,
        textAlign
    } = attributes;

    const columnProps = useBlockProps({
        className: 'website-footer-block__column website-footer-block__column--brand',
        style: { textAlign }
    });

    return (
        <div {...columnProps}>
            {brandLogo && (
                <div className="website-footer-block__brand-logo">
                    <img 
                        src={brandLogo} 
                        alt={brandName} 
                        style={{ maxWidth: `${brandLogoWidth}px` }}
                    />
                </div>
            )}
            
            <RichText
                tagName="div"
                className="website-footer-block__brand-name"
                value={brandName}
                onChange={(value) => setAttributes({ brandName: value })}
                placeholder={__('Brand name', 'website-footer-block')}
                withoutInteractiveFormatting
            />
            
            <RichText
                tagName="p"
                className="website-footer-block__brand-description"
                value={description}
                onChange={(value) => setAttributes({ description: value })}
                placeholder={__('Description', 'website-footer-block')}
                allowedFormats={['bold', 'italic', 'link']}
            />
            
            {showCta && (
                <div className="website-footer-block__brand-cta">
                    <RichText
                        tagName={ctaStyle === 'button' ? 'a' : 'a'}
                        className={`website-footer-block__cta website-footer-block__cta--${ctaStyle}`}
                        value={ctaText}
                        onChange={(value) => setAttributes({ ctaText: value })}
                        placeholder={__('Call to action', 'website-footer-block')}
                        href={ctaUrl}
                        style={{
                            backgroundColor: ctaStyle === 'button' ? ctaBackgroundColor : 'transparent',
                            color: ctaStyle === 'button' ? ctaTextColor : 'inherit'
                        }}
                    />
                </div>
            )}
        </div>
    );
}