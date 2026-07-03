import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';
import ButtonIcon from './icons';

export default function save({ attributes }) {
  const {
    buttonText,
    buttonLink,
    openInNewTab,
    blockId,
    // Styling attributes
    buttonColor,
    buttonBackgroundColor,
    buttonHoverColor,
    buttonHoverBackgroundColor,
    buttonStyle,
    underlineColor,
    blurAmount,
    fontSize,
    showIcon,
    iconType,
    iconPosition,
    hoverAnimation,
    buttonPadding,
    buttonMargin,
    zIndex,
    borderRadius,
    fontWeight,
    borderWidth,
    borderColor,
    borderStyle,
    buttonHoverBorderColor,
    lineHeight,
    letterSpacing,
    textTransform,
    fontFamily
  } = attributes;

  return (
    <div {...useBlockProps.save({
      className: 'adaire-button-block',
      id: blockId || undefined,
      style: {
        '--button-color': buttonColor || '#ffffff',
        '--button-bg-color': buttonBackgroundColor || 'var(--wp--preset--color--primary, #ff4242)',
        '--button-hover-color': buttonHoverColor || '#ffffff',
        '--button-hover-bg-color': buttonHoverBackgroundColor || 'var(--wp--preset--color--secondary, var(--wp--preset--color--primary, #e63939))',
        '--button-underline-color': underlineColor || 'var(--wp--preset--color--secondary, #ff4242)',
        '--button-blur': blurAmount ? `${blurAmount}px` : '0px',
        '--button-font-size': `${getDeviceValue(fontSize, 'desktop', 18)}px`,
        '--button-font-size-tablet': `${getDeviceValue(fontSize, 'tablet', 16)}px`,
        '--button-font-size-mobile': `${getDeviceValue(fontSize, 'mobile', 14)}px`,
        '--button-font-size-watch': `${getDeviceValue(fontSize, 'smartwatch', 12)}px`,
        '--button-padding-top': buttonPadding?.desktop?.top || '10px',
        '--button-padding-right': buttonPadding?.desktop?.right || '20px',
        '--button-padding-bottom': buttonPadding?.desktop?.bottom || '10px',
        '--button-padding-left': buttonPadding?.desktop?.left || '20px',
        '--button-padding-top-tablet': buttonPadding?.tablet?.top || '8px',
        '--button-padding-right-tablet': buttonPadding?.tablet?.right || '16px',
        '--button-padding-bottom-tablet': buttonPadding?.tablet?.bottom || '8px',
        '--button-padding-left-tablet': buttonPadding?.tablet?.left || '16px',
        '--button-padding-top-mobile': buttonPadding?.mobile?.top || '6px',
        '--button-padding-right-mobile': buttonPadding?.mobile?.right || '12px',
        '--button-padding-bottom-mobile': buttonPadding?.mobile?.bottom || '6px',
        '--button-padding-left-mobile': buttonPadding?.mobile?.left || '12px',
        '--button-padding-top-watch': buttonPadding?.smartwatch?.top || '4px',
        '--button-padding-right-watch': buttonPadding?.smartwatch?.right || '8px',
        '--button-padding-bottom-watch': buttonPadding?.smartwatch?.bottom || '4px',
        '--button-padding-left-watch': buttonPadding?.smartwatch?.left || '8px',
        '--button-margin-top': buttonMargin?.desktop?.top || '20px',
        '--button-margin-right': buttonMargin?.desktop?.right || '0px',
        '--button-margin-bottom': buttonMargin?.desktop?.bottom || '20px',
        '--button-margin-left': buttonMargin?.desktop?.left || '0px',
        '--button-margin-top-tablet': buttonMargin?.tablet?.top || '16px',
        '--button-margin-right-tablet': buttonMargin?.tablet?.right || '0px',
        '--button-margin-bottom-tablet': buttonMargin?.tablet?.bottom || '16px',
        '--button-margin-left-tablet': buttonMargin?.tablet?.left || '0px',
        '--button-margin-top-mobile': buttonMargin?.mobile?.top || '12px',
        '--button-margin-right-mobile': buttonMargin?.mobile?.right || '0px',
        '--button-margin-bottom-mobile': buttonMargin?.mobile?.bottom || '12px',
        '--button-margin-left-mobile': buttonMargin?.mobile?.left || '0px',
        '--button-margin-top-watch': buttonMargin?.smartwatch?.top || '8px',
        '--button-margin-right-watch': buttonMargin?.smartwatch?.right || '0px',
        '--button-margin-bottom-watch': buttonMargin?.smartwatch?.bottom || '8px',
        '--button-margin-left-watch': buttonMargin?.smartwatch?.left || '0px',
        '--button-z-index': zIndex || '1',
        '--button-border-radius': borderRadius ? `${borderRadius}px` : '0px',
        '--button-font-weight': fontWeight || '500',
        '--button-border-width': borderWidth ? `${borderWidth}px` : '2px',
        '--button-border-color': borderColor || 'var(--wp--preset--color--secondary, #ff4242)',
        '--button-border-style': borderStyle || 'solid',
        '--button-hover-border-color': buttonHoverBorderColor || borderColor || 'var(--wp--preset--color--secondary, #ff4242)',
        '--button-line-height': getDeviceValue(lineHeight, 'desktop', 'normal'),
        '--button-line-height-tablet': getDeviceValue(lineHeight, 'tablet', 'normal'),
        '--button-line-height-mobile': getDeviceValue(lineHeight, 'mobile', 'normal'),
        '--button-line-height-watch': getDeviceValue(lineHeight, 'smartwatch', 'normal'),
        '--button-letter-spacing': getDeviceValue(letterSpacing, 'desktop', 'normal'),
        '--button-letter-spacing-tablet': getDeviceValue(letterSpacing, 'tablet', 'normal'),
        '--button-letter-spacing-mobile': getDeviceValue(letterSpacing, 'mobile', 'normal'),
        '--button-letter-spacing-watch': getDeviceValue(letterSpacing, 'smartwatch', 'normal'),
        '--button-text-transform': textTransform || 'none',
        '--button-font-family': fontFamily || '',
      }
    })}>
      <a
        href={buttonLink}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={`adaire-button-block__link adaire-button-block__link--${buttonStyle || 'underline'} adaire-button-block__link--${hoverAnimation || 'slide-underline'} adaire-button-block__link--icon-${iconPosition || 'right'}`}
      >
        {buttonText}
        {showIcon !== false && (
          <span className="adaire-button-block__icon" aria-hidden="true">
            <ButtonIcon type={iconType} />
          </span>
        )}
      </a>
    </div>
  );
}

