import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

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
    hoverAnimation,
    buttonPadding,
    buttonMargin,
    zIndex,
    borderRadius,
    fontWeight,
    borderWidth,
    borderColor,
    borderStyle,
    buttonHoverBorderColor
  } = attributes;

  return (
    <div {...useBlockProps.save({ 
      className: 'adaire-button-block',
      id: blockId || undefined,
      style: {
        '--button-color': buttonColor || '#ffffff',
        '--button-bg-color': buttonBackgroundColor || 'transparent',
        '--button-hover-color': buttonHoverColor || '#ffffff',
        '--button-hover-bg-color': buttonHoverBackgroundColor || 'transparent',
        '--button-underline-color': underlineColor || '#ff4242',
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
        '--button-border-color': borderColor || '#ff4242',
        '--button-border-style': borderStyle || 'solid',
        '--button-hover-border-color': buttonHoverBorderColor || borderColor || '#ff4242',
      }
    })}>
      <a
        href={buttonLink}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={`adaire-button-block__link adaire-button-block__link--${buttonStyle || 'underline'} adaire-button-block__link--${hoverAnimation || 'slide-underline'}`}
      >
        {buttonText}
        {showIcon !== false && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </a>
    </div>
  );
} 


