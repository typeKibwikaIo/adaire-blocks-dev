/**
 * Button (button-block) deprecations — most recent first.
 *
 * v3  Frozen copy of the save() that shipped before ADAB-014 introduced
 *     theme-color inheritance (`var(--wp--preset--color--primary, ...)` /
 *     `var(--wp--preset--color--secondary, ...)` fallback chains) for
 *     `buttonBackgroundColor`, `buttonHoverBackgroundColor`, `borderColor`,
 *     `buttonHoverBorderColor`, and `underlineColor`. ADAB-014 changes what
 *     an *unset* color attribute resolves to visually (it now falls through
 *     to the active theme's primary/secondary palette colors before hitting
 *     the old hardcoded literal), so re-running the current save() against
 *     posts saved before this change could change their rendered colors on
 *     sites that define a `primary`/`secondary` theme.json palette color —
 *     even though no attribute changed shape or stored value. This entry
 *     keeps those old posts rendering with the exact literal fallbacks they
 *     always had (`transparent`, `#ff4242`, `#e63939`), regardless of the
 *     active theme's palette. `migrate` is a no-op identity function since
 *     no attribute schema changed shape; ADAB-014 also flipped the
 *     *default* values of `buttonStyle` (underline -> fill) and
 *     `buttonBackgroundColor` (transparent -> '') in block.json, but
 *     defaults only affect brand-new block insertions — every existing
 *     post already has these attributes explicitly stored, so that part of
 *     ADAB-014 needs no deprecation entry on its own.
 *
 * v2  Frozen copy of the save() that shipped after line-height/letter-
 *     spacing/text-transform were added (v1 below) but before ADAB-010's
 *     Font Family control added a `--button-font-family` custom property to
 *     every instance unconditionally. Same reasoning as v1: purely additive
 *     attribute with a safe default, so `migrate` is a no-op identity
 *     function.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (line-height, letter-spacing, text-transform) for
 *     the button label — unconditionally, for every instance, regardless of
 *     whether the user ever opens the new typography controls. Posts saved
 *     before that change don't have those custom properties in their stored
 *     markup, so re-running the *current* save() against them would produce
 *     a style attribute with extra declarations that don't match what's
 *     stored, and Gutenberg would flag them as invalid content. No attribute
 *     schema changed shape (the new attributes are purely additive with safe
 *     defaults that reproduce the original hardcoded SCSS values), so
 *     `migrate` is a no-op identity function and this entry doesn't need its
 *     own `attributes` key (Gutenberg falls back to the current block.json
 *     attributes when parsing a deprecated entry that omits one).
 */
import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';
import ButtonIcon from './icons';

const deprecatedV3 = {
  migrate(attributes) {
    return attributes;
  },

  save({ attributes }) {
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
  },
};

const deprecatedV2 = {
  migrate(attributes) {
    return attributes;
  },

  save({ attributes }) {
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
      textTransform
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
          '--button-line-height': getDeviceValue(lineHeight, 'desktop', 'normal'),
          '--button-line-height-tablet': getDeviceValue(lineHeight, 'tablet', 'normal'),
          '--button-line-height-mobile': getDeviceValue(lineHeight, 'mobile', 'normal'),
          '--button-line-height-watch': getDeviceValue(lineHeight, 'smartwatch', 'normal'),
          '--button-letter-spacing': getDeviceValue(letterSpacing, 'desktop', 'normal'),
          '--button-letter-spacing-tablet': getDeviceValue(letterSpacing, 'tablet', 'normal'),
          '--button-letter-spacing-mobile': getDeviceValue(letterSpacing, 'mobile', 'normal'),
          '--button-letter-spacing-watch': getDeviceValue(letterSpacing, 'smartwatch', 'normal'),
          '--button-text-transform': textTransform || 'none',
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
  },
};

const deprecatedV1 = {
  migrate(attributes) {
    return attributes;
  },

  save({ attributes }) {
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
  },
};

export default [deprecatedV3, deprecatedV2, deprecatedV1];
