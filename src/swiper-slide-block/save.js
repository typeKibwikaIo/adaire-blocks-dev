import { useBlockProps, RichText, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
		imageUrl,
		header,
		text,
		overlayType,
		overlayColor,
		overlayGradient,
		textColor,
		backgroundSize,
		backgroundPosition,
		backgroundRepeat,
		slideBorderRadius,
		slideHoverBorderRadius,
		responsiveHeaderFontSize,
		responsiveHeaderFontWeight,
		responsiveHeaderLineHeight,
		responsiveHeaderLetterSpacing,
		responsiveHeaderTextTransform,
		responsiveHeaderColor,
		responsiveHeaderMarginBottom,
		responsiveTextFontSize,
		responsiveTextFontWeight,
		responsiveTextLineHeight,
		responsiveTextLetterSpacing,
		responsiveTextTextTransform,
		responsiveTextColor,
		responsiveTextMarginBottom,
	} = attributes;

    const styles = {
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: backgroundSize,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        color: textColor,
        borderRadius: `${slideBorderRadius}px`,
        '--hover-border-radius': `${slideHoverBorderRadius}px`,
		// Header typography CSS variables
		'--header-font-size-mobile': responsiveHeaderFontSize?.mobile || '28px',
		'--header-font-size-tablet': responsiveHeaderFontSize?.tablet || responsiveHeaderFontSize?.mobile || '30px',
		'--header-font-size-small-laptop': responsiveHeaderFontSize?.smallLaptop || responsiveHeaderFontSize?.desktop || '32px',
		'--header-font-size-desktop': responsiveHeaderFontSize?.desktop || '32px',
		'--header-font-size-big-desktop': responsiveHeaderFontSize?.bigDesktop || responsiveHeaderFontSize?.desktop || '32px',
		'--header-font-weight-mobile': responsiveHeaderFontWeight?.mobile || '700',
		'--header-font-weight-tablet': responsiveHeaderFontWeight?.tablet || responsiveHeaderFontWeight?.mobile || '700',
		'--header-font-weight-small-laptop': responsiveHeaderFontWeight?.smallLaptop || responsiveHeaderFontWeight?.desktop || '700',
		'--header-font-weight-desktop': responsiveHeaderFontWeight?.desktop || '700',
		'--header-font-weight-big-desktop': responsiveHeaderFontWeight?.bigDesktop || responsiveHeaderFontWeight?.desktop || '700',
		'--header-line-height-mobile': responsiveHeaderLineHeight?.mobile || '1.2',
		'--header-line-height-tablet': responsiveHeaderLineHeight?.tablet || responsiveHeaderLineHeight?.mobile || '1.2',
		'--header-line-height-small-laptop': responsiveHeaderLineHeight?.smallLaptop || responsiveHeaderLineHeight?.desktop || '1.2',
		'--header-line-height-desktop': responsiveHeaderLineHeight?.desktop || '1.2',
		'--header-line-height-big-desktop': responsiveHeaderLineHeight?.bigDesktop || responsiveHeaderLineHeight?.desktop || '1.2',
		'--header-letter-spacing-mobile': responsiveHeaderLetterSpacing?.mobile || '0px',
		'--header-letter-spacing-tablet': responsiveHeaderLetterSpacing?.tablet || responsiveHeaderLetterSpacing?.mobile || '0px',
		'--header-letter-spacing-small-laptop': responsiveHeaderLetterSpacing?.smallLaptop || responsiveHeaderLetterSpacing?.desktop || '0px',
		'--header-letter-spacing-desktop': responsiveHeaderLetterSpacing?.desktop || '0px',
		'--header-letter-spacing-big-desktop': responsiveHeaderLetterSpacing?.bigDesktop || responsiveHeaderLetterSpacing?.desktop || '0px',
		'--header-text-transform-mobile': responsiveHeaderTextTransform?.mobile || 'none',
		'--header-text-transform-tablet': responsiveHeaderTextTransform?.tablet || responsiveHeaderTextTransform?.mobile || 'none',
		'--header-text-transform-small-laptop': responsiveHeaderTextTransform?.smallLaptop || responsiveHeaderTextTransform?.desktop || 'none',
		'--header-text-transform-desktop': responsiveHeaderTextTransform?.desktop || 'none',
		'--header-text-transform-big-desktop': responsiveHeaderTextTransform?.bigDesktop || responsiveHeaderTextTransform?.desktop || 'none',
		'--header-color-mobile': responsiveHeaderColor?.mobile || '#ffffff',
		'--header-color-tablet': responsiveHeaderColor?.tablet || responsiveHeaderColor?.mobile || '#ffffff',
		'--header-color-small-laptop': responsiveHeaderColor?.smallLaptop || responsiveHeaderColor?.desktop || '#ffffff',
		'--header-color-desktop': responsiveHeaderColor?.desktop || '#ffffff',
		'--header-color-big-desktop': responsiveHeaderColor?.bigDesktop || responsiveHeaderColor?.desktop || '#ffffff',
		'--header-margin-bottom-mobile': responsiveHeaderMarginBottom?.mobile || '10px',
		'--header-margin-bottom-tablet': responsiveHeaderMarginBottom?.tablet || responsiveHeaderMarginBottom?.mobile || '10px',
		'--header-margin-bottom-small-laptop': responsiveHeaderMarginBottom?.smallLaptop || responsiveHeaderMarginBottom?.desktop || '10px',
		'--header-margin-bottom-desktop': responsiveHeaderMarginBottom?.desktop || '10px',
		'--header-margin-bottom-big-desktop': responsiveHeaderMarginBottom?.bigDesktop || responsiveHeaderMarginBottom?.desktop || '10px',
		// Text typography CSS variables
		'--text-font-size-mobile': responsiveTextFontSize?.mobile || '16px',
		'--text-font-size-tablet': responsiveTextFontSize?.tablet || responsiveTextFontSize?.mobile || '17px',
		'--text-font-size-small-laptop': responsiveTextFontSize?.smallLaptop || responsiveTextFontSize?.desktop || '18px',
		'--text-font-size-desktop': responsiveTextFontSize?.desktop || '18px',
		'--text-font-size-big-desktop': responsiveTextFontSize?.bigDesktop || responsiveTextFontSize?.desktop || '18px',
		'--text-font-weight-mobile': responsiveTextFontWeight?.mobile || '400',
		'--text-font-weight-tablet': responsiveTextFontWeight?.tablet || responsiveTextFontWeight?.mobile || '400',
		'--text-font-weight-small-laptop': responsiveTextFontWeight?.smallLaptop || responsiveTextFontWeight?.desktop || '400',
		'--text-font-weight-desktop': responsiveTextFontWeight?.desktop || '400',
		'--text-font-weight-big-desktop': responsiveTextFontWeight?.bigDesktop || responsiveTextFontWeight?.desktop || '400',
		'--text-line-height-mobile': responsiveTextLineHeight?.mobile || '1.5',
		'--text-line-height-tablet': responsiveTextLineHeight?.tablet || responsiveTextLineHeight?.mobile || '1.5',
		'--text-line-height-small-laptop': responsiveTextLineHeight?.smallLaptop || responsiveTextLineHeight?.desktop || '1.5',
		'--text-line-height-desktop': responsiveTextLineHeight?.desktop || '1.5',
		'--text-line-height-big-desktop': responsiveTextLineHeight?.bigDesktop || responsiveTextLineHeight?.desktop || '1.5',
		'--text-letter-spacing-mobile': responsiveTextLetterSpacing?.mobile || '0px',
		'--text-letter-spacing-tablet': responsiveTextLetterSpacing?.tablet || responsiveTextLetterSpacing?.mobile || '0px',
		'--text-letter-spacing-small-laptop': responsiveTextLetterSpacing?.smallLaptop || responsiveTextLetterSpacing?.desktop || '0px',
		'--text-letter-spacing-desktop': responsiveTextLetterSpacing?.desktop || '0px',
		'--text-letter-spacing-big-desktop': responsiveTextLetterSpacing?.bigDesktop || responsiveTextLetterSpacing?.desktop || '0px',
		'--text-text-transform-mobile': responsiveTextTextTransform?.mobile || 'none',
		'--text-text-transform-tablet': responsiveTextTextTransform?.tablet || responsiveTextTextTransform?.mobile || 'none',
		'--text-text-transform-small-laptop': responsiveTextTextTransform?.smallLaptop || responsiveTextTextTransform?.desktop || 'none',
		'--text-text-transform-desktop': responsiveTextTextTransform?.desktop || 'none',
		'--text-text-transform-big-desktop': responsiveTextTextTransform?.bigDesktop || responsiveTextTextTransform?.desktop || 'none',
		'--text-color-mobile': responsiveTextColor?.mobile || '#ffffff',
		'--text-color-tablet': responsiveTextColor?.tablet || responsiveTextColor?.mobile || '#ffffff',
		'--text-color-small-laptop': responsiveTextColor?.smallLaptop || responsiveTextColor?.desktop || '#ffffff',
		'--text-color-desktop': responsiveTextColor?.desktop || '#ffffff',
		'--text-color-big-desktop': responsiveTextColor?.bigDesktop || responsiveTextColor?.desktop || '#ffffff',
		'--text-margin-bottom-mobile': responsiveTextMarginBottom?.mobile || '0px',
		'--text-margin-bottom-tablet': responsiveTextMarginBottom?.tablet || responsiveTextMarginBottom?.mobile || '0px',
		'--text-margin-bottom-small-laptop': responsiveTextMarginBottom?.smallLaptop || responsiveTextMarginBottom?.desktop || '0px',
		'--text-margin-bottom-desktop': responsiveTextMarginBottom?.desktop || '0px',
		'--text-margin-bottom-big-desktop': responsiveTextMarginBottom?.bigDesktop || responsiveTextMarginBottom?.desktop || '0px',
    };

    const overlayStyles = {
        background: overlayType === 'gradient' ? overlayGradient : overlayColor,
    };

    const innerBlocksProps = useInnerBlocksProps.save({
        className: 'swiper-slide-buttons'
    });

    return (
        <div {...useBlockProps.save({ className: 'swiper-slide splide__slide', style: styles })}>
            <div className="splide-slide-overlay" style={overlayStyles}></div>
            <div className="splide-slide-content">
                <RichText.Content tagName="h3" value={header} style={{ color: textColor }} />
                <RichText.Content tagName="p" value={text} style={{ color: textColor }} />
                <div {...innerBlocksProps} />
            </div>
        </div>
    );
}



