import { useBlockProps, ColorPalette } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl, RangeControl, BaseControl, Button, __experimentalBoxControl as BoxControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, THREE_TIERS, BreakpointNote } from '../components/DeviceSwitcher';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import { PANEL, LABEL } from '../components/inspector-vocabulary';
import ButtonIcon, { BUTTON_ICON_OPTIONS } from './icons';
import BoundColorPalette from '../components/BoundColorPalette';

const FONT_FAMILY_OPTIONS = [
  { label: 'Default (inherit theme)', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

export default function Edit({ attributes, setAttributes }) {
  const [deviceType, setDeviceType] = useState('desktop');
  const [activeZone, setActiveZone] = useState(null);

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

  // Helper to get device-specific values
  const getDeviceFontSize = () => getDeviceValue(fontSize, deviceType, deviceType === 'desktop' ? 18 : deviceType === 'tablet' ? 16 : 14);
  const getDevicePadding = () => buttonPadding?.[deviceType] || buttonPadding?.desktop || { top: '10px', right: '20px', bottom: '10px', left: '20px' };
  const getDeviceMargin = () => buttonMargin?.[deviceType] || buttonMargin?.desktop || { top: '20px', right: '0px', bottom: '20px', left: '0px' };
  const getDeviceLineHeight = () => getDeviceValue(lineHeight, deviceType, 'normal');
  const getDeviceLetterSpacing = () => getDeviceValue(letterSpacing, deviceType, 'normal');

  const blockProps = useBlockProps({
    className: 'adaire-button-block',
    style: {
      '--button-color': buttonColor || '#000000',
      // Theme-color inheritance (ADAB-014) — see matching comment in
      // save.js. Must stay in sync with save.js's fallback chain so the
      // editor preview matches the persisted markup (block validity check).
      '--button-bg-color': buttonBackgroundColor || 'var(--wp--preset--color--primary, #ff4242)',
      '--button-hover-color': buttonHoverColor || '#ffffff',
      '--button-hover-bg-color': buttonHoverBackgroundColor || 'var(--wp--preset--color--secondary, var(--wp--preset--color--primary, #e63939))',
      '--button-underline-color': underlineColor || 'var(--wp--preset--color--secondary, #ff4242)',
      '--button-blur': blurAmount ? `${blurAmount}px` : '0px',
      '--button-font-size': `${getDeviceValue(fontSize, 'desktop', 18)}px`,
      '--button-font-size-tablet': `${getDeviceValue(fontSize, 'tablet', 16)}px`,
      '--button-font-size-mobile': `${getDeviceValue(fontSize, 'mobile', 14)}px`,
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
      '--button-letter-spacing': getDeviceValue(letterSpacing, 'desktop', 'normal'),
      '--button-letter-spacing-tablet': getDeviceValue(letterSpacing, 'tablet', 'normal'),
      '--button-letter-spacing-mobile': getDeviceValue(letterSpacing, 'mobile', 'normal'),
      '--button-text-transform': textTransform || 'none',
      '--button-font-family': fontFamily || '',
    }
  });

  return (
    <>
      <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
        <PanelBody section="content" title={ PANEL.CONTENT } initialOpen={true}>
          <TextControl
            label="Button Text"
            value={buttonText}
            onChange={(value) => setAttributes({ buttonText: value })}
            placeholder="Enter button text..."
          />

          <TextControl
            label="Button Link"
            value={buttonLink}
            onChange={(value) => setAttributes({ buttonLink: value })}
            placeholder="https://example.com"
            type="url"
          />

          <ToggleControl
            label="Open in new tab"
            checked={openInNewTab}
            onChange={(value) => setAttributes({ openInNewTab: value })}
            help={openInNewTab ? 'Link will open in a new tab' : 'Link will open in the same tab'}
          />

          <TextControl
            label={ LABEL.BLOCK_ID }
            value={blockId}
            onChange={(value) => setAttributes({ blockId: value })}
            help="Add a custom ID to this block for CSS targeting or anchor links."
          />
        </PanelBody>

        {/*
          Spec §4: the icon asset itself is Content. Its visibility and position
          are structural, so they live in Layout > Structure — which is why this
          panel is gated on showIcon rather than owning the toggle.
        */}
        {showIcon && (
          <PanelBody section="content" title={ PANEL.ICON } initialOpen={false}>
            <SelectControl
              label={ PANEL.ICON }
              value={iconType || 'arrow-diagonal'}
              options={BUTTON_ICON_OPTIONS}
              onChange={(value) => setAttributes({ iconType: value })}
            />
          </PanelBody>
        )}

        <PanelBody section="layout" title={ PANEL.RESPONSIVE } initialOpen={false}>
          <DeviceSwitcher
            deviceType={deviceType}
            setDeviceType={setDeviceType}
            label={ LABEL.BREAKPOINT }
            tiers={THREE_TIERS}
          />
        </PanelBody>

        <PanelBody section="layout" title={ PANEL.STRUCTURE } initialOpen={false}>
          <ToggleControl
            label="Show Icon"
            checked={showIcon}
            onChange={(value) => setAttributes({ showIcon: value })}
            help={showIcon ? 'Icon will be visible' : 'Icon will be hidden'}
          />

          {showIcon && (
            <SelectControl
              label="Icon Position"
              value={iconPosition || 'right'}
              options={[
                { label: 'Right of text', value: 'right' },
                { label: 'Left of text', value: 'left' },
                { label: 'Inline (no gap)', value: 'inline' }
              ]}
              onChange={(value) => setAttributes({ iconPosition: value })}
              help="Left/Right move the icon using flex order; Inline keeps it after the text but removes the spacing gap."
            />
          )}

          <RangeControl
            label={ LABEL.Z_INDEX }
            value={zIndex}
            onChange={(value) => setAttributes({ zIndex: value })}
            min={0}
            max={100}
            step={1}
          />
        </PanelBody>

        {/* Variant is a pure CSS preset — Style, not Layout (spec §3). */}
        <PanelBody section="style" title={ PANEL.VARIANT } initialOpen={false}>
          <SelectControl
            label="Button Style"
            value={buttonStyle}
            options={[
              { label: 'Underline', value: 'underline' },
              { label: 'Background Fill', value: 'fill' },
              { label: 'Border', value: 'border' },
              { label: 'Gradient', value: 'gradient' },
              { label: 'Glass Effect', value: 'glass' }
            ]}
            onChange={(value) => setAttributes({ buttonStyle: value })}
          />
        </PanelBody>

        <PanelBody section="style" title={ PANEL.COLORS } initialOpen={false}>
          <BaseControl label="Button Color">
            <BoundColorPalette
              value={buttonColor}
              onChange={(v) => setAttributes({ buttonColor: v || "" })}
            />
          </BaseControl>

          <BaseControl
            label="Button Background Color"
            help={
              !buttonBackgroundColor
                ? "Inheriting the theme's primary color (or the default fill color if the theme defines none)."
                : buttonBackgroundColor === 'transparent'
                  ? 'Explicitly transparent.'
                  : undefined
            }
          >
            <BoundColorPalette
              value={buttonBackgroundColor || ""}
              onChange={(v) => setAttributes({ buttonBackgroundColor: v || "" })}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {buttonBackgroundColor && (
                <Button
                  isSmall
                  onClick={() => setAttributes({ buttonBackgroundColor: '' })}
                >
                  Use Theme Color
                </Button>
              )}
              {buttonBackgroundColor !== 'transparent' && (
                <Button
                  isSmall
                  isDestructive
                  onClick={() => setAttributes({ buttonBackgroundColor: 'transparent' })}
                >
                  Make Transparent
                </Button>
              )}
            </div>
          </BaseControl>

          <BaseControl label="Hover Text Color">
            <BoundColorPalette
              value={buttonHoverColor}
              onChange={(v) => setAttributes({ buttonHoverColor: v || "" })}
            />
          </BaseControl>

          <BaseControl
            label="Hover Background Color"
            help={
              !buttonHoverBackgroundColor
                ? "Inheriting the theme's secondary color (falling back to primary, then the default hover color)."
                : buttonHoverBackgroundColor === 'transparent'
                  ? 'Explicitly transparent.'
                  : undefined
            }
          >
            <BoundColorPalette
              value={buttonHoverBackgroundColor || ""}
              onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || "" })}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {buttonHoverBackgroundColor && (
                <Button
                  isSmall
                  onClick={() => setAttributes({ buttonHoverBackgroundColor: '' })}
                >
                  Use Theme Color
                </Button>
              )}
              {buttonHoverBackgroundColor !== 'transparent' && (
                <Button
                  isSmall
                  isDestructive
                  onClick={() => setAttributes({ buttonHoverBackgroundColor: 'transparent' })}
                >
                  Make Transparent
                </Button>
              )}
            </div>
          </BaseControl>

          <BaseControl
            label="Underline Color"
            help={!underlineColor ? "Inheriting the theme's secondary color." : undefined}
          >
            <BoundColorPalette
              value={underlineColor}
              onChange={(v) => setAttributes({ underlineColor: v || "" })}
            />
            {underlineColor && (
              <Button
                isSmall
                onClick={() => setAttributes({ underlineColor: '' })}
                style={{ marginTop: '8px' }}
              >
                Use Theme Color
              </Button>
            )}
          </BaseControl>

          <BaseControl
            label="Border Color"
            help={!borderColor ? "Inheriting the theme's secondary color." : undefined}
          >
            <BoundColorPalette
              value={borderColor}
              onChange={(v) => setAttributes({ borderColor: v || "" })}
            />
            {borderColor && (
              <Button
                isSmall
                onClick={() => setAttributes({ borderColor: '' })}
                style={{ marginTop: '8px' }}
              >
                Use Theme Color
              </Button>
            )}
          </BaseControl>

          <BaseControl
            label="Hover Border Color"
            help={!buttonHoverBorderColor ? "Inheriting the theme's secondary color (falling back to Border Color)." : undefined}
          >
            <BoundColorPalette
              value={buttonHoverBorderColor || borderColor}
              onChange={(v) => setAttributes({ buttonHoverBorderColor: v || "" })}
            />
            {buttonHoverBorderColor && (
              <Button
                isSmall
                onClick={() => setAttributes({ buttonHoverBorderColor: '' })}
                style={{ marginTop: '8px' }}
              >
                Use Theme Color
              </Button>
            )}
          </BaseControl>
        </PanelBody>

        <PanelBody section="style" title={ PANEL.BORDER } initialOpen={false}>
          {/*
            ADAB-014: border controls used to be gated behind
            `buttonStyle === 'border'`. They're now always visible — the
            underlying borderWidth/borderColor/borderStyle/buttonHoverBorderColor
            attributes apply visually to the --border variant's rendering in
            style.scss (unchanged from before, see comment there for why
            border rendering itself stays scoped to that one variant), but
            users on any other style can still pre-configure border values
            here ahead of switching styles, or use them if a future style
            variant reads them. Surfacing them for every buttonStyle just
            removes a controls/attributes mismatch (the attributes already
            existed unconditionally; only the UI was gated).
          */}
          <RangeControl
            label={ LABEL.BORDER_WIDTH }
            value={borderWidth}
            onChange={(value) => setAttributes({ borderWidth: value })}
            min={0}
            max={10}
            step={1}
            help={buttonStyle !== 'border' ? 'Only visually applied when Button Style is set to "Border".' : undefined}
          />

          <SelectControl
            label={ LABEL.BORDER_STYLE }
            value={borderStyle}
            options={[
              { label: 'Solid', value: 'solid' },
              { label: 'Dashed', value: 'dashed' },
              { label: 'Dotted', value: 'dotted' },
              { label: 'Double', value: 'double' },
              { label: 'Groove', value: 'groove' },
              { label: 'Ridge', value: 'ridge' },
              { label: 'Inset', value: 'inset' },
              { label: 'Outset', value: 'outset' }
            ]}
            onChange={(value) => setAttributes({ borderStyle: value })}
          />

          <RangeControl
            label={ LABEL.BORDER_RADIUS }
            value={borderRadius}
            onChange={(value) => setAttributes({ borderRadius: value })}
            min={0}
            max={50}
            step={1}
          />

        </PanelBody>

        {/*
          Effects sit in Layout, not Style: the hover animations here (scale,
          bounce, shake, slide-underline) move the button relative to what's
          around it, which is the Layout test in BLOCK_SETTINGS_SPEC.md §3.
        */}
        <PanelBody section="layout" title={ PANEL.EFFECTS } initialOpen={false}>
          <RangeControl
            label="Blur Amount"
            value={blurAmount}
            onChange={(value) => setAttributes({ blurAmount: value })}
            min={0}
            max={20}
            step={1}
          />

          <SelectControl
            label="Hover Animation"
            value={hoverAnimation}
            options={[
              { label: 'Slide Underline', value: 'slide-underline' },
              { label: 'Scale', value: 'scale' },
              { label: 'Bounce', value: 'bounce' },
              { label: 'Glow', value: 'glow' },
              { label: 'Shake', value: 'shake' },
              { label: 'None', value: 'none' }
            ]}
            onChange={(value) => setAttributes({ hoverAnimation: value })}
          />
        </PanelBody>

        <PanelBody section="style" title={ PANEL.TYPOGRAPHY } initialOpen={false}>
          <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />

          <RangeControl
            label={ LABEL.FONT_SIZE }
            value={getDeviceFontSize()}
            onChange={(value) => setAttributes({ fontSize: updateDeviceAttribute(fontSize, deviceType, value) })}
            min={deviceType === 'mobile' ? 10 : 12}
            max={48}
            step={1}
          />

          <UnitControl
            label={`Line Height - ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`}
            value={getDeviceLineHeight()}
            onChange={(value) => setAttributes({ lineHeight: updateDeviceAttribute(lineHeight, deviceType, value) })}
          />

          <UnitControl
            label={`Letter Spacing - ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`}
            value={getDeviceLetterSpacing()}
            onChange={(value) => setAttributes({ letterSpacing: updateDeviceAttribute(letterSpacing, deviceType, value) })}
          />

          <SelectControl
            label="Text Transform"
            value={textTransform}
            options={[
              { label: 'None', value: 'none' },
              { label: 'Uppercase', value: 'uppercase' },
              { label: 'Lowercase', value: 'lowercase' },
              { label: 'Capitalize', value: 'capitalize' }
            ]}
            onChange={(value) => setAttributes({ textTransform: value })}
          />

          <SelectControl
            label={ LABEL.FONT_FAMILY }
            value={fontFamily || ''}
            options={FONT_FAMILY_OPTIONS}
            onChange={(value) => setAttributes({ fontFamily: value })}
            help="Applies to the button label."
          />

          <SelectControl
            label={ LABEL.FONT_WEIGHT }
            value={fontWeight}
            options={[
              { label: 'Thin (100)', value: '100' },
              { label: 'Extra Light (200)', value: '200' },
              { label: 'Light (300)', value: '300' },
              { label: 'Normal (400)', value: '400' },
              { label: 'Medium (500)', value: '500' },
              { label: 'Semi Bold (600)', value: '600' },
              { label: 'Bold (700)', value: '700' },
              { label: 'Extra Bold (800)', value: '800' },
              { label: 'Black (900)', value: '900' }
            ]}
            onChange={(value) => setAttributes({ fontWeight: value })}
            help="Choose the font weight for the button text."
          />
        </PanelBody>

        <PanelBody section="style" title={ PANEL.SPACING } initialOpen={false}>
          <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />

          <BoxControl
            label={ LABEL.PADDING }
            values={getDevicePadding()}
            onChange={(value) => setAttributes({ buttonPadding: updateDeviceAttribute(buttonPadding, deviceType, value) })}
            units={[
              { value: 'px', label: 'px', default: 0 },
              { value: 'em', label: 'em', default: 0 },
              { value: 'rem', label: 'rem', default: 0 },
            ]}
          />

          <BoxControl
            label={ LABEL.MARGIN }
            values={getDeviceMargin()}
            onChange={(value) => setAttributes({ buttonMargin: updateDeviceAttribute(buttonMargin, deviceType, value) })}
            units={[
              { value: 'px', label: 'px', default: 0 },
              { value: 'em', label: 'em', default: 0 },
              { value: 'rem', label: 'rem', default: 0 },
            ]}
          />
        </PanelBody>
      </InspectorTabs>

      <div {...blockProps}>
        <QuickZone
          id="button-text"
          label="Button"
          activeZone={activeZone}
          setActiveZone={setActiveZone}
          content={
            <>
              <TextControl
                label="Button Text"
                value={buttonText}
                onChange={(value) => setAttributes({ buttonText: value })}
                placeholder="Enter button text..."
              />
              <ToggleControl
                label="Show Icon"
                checked={showIcon}
                onChange={(value) => setAttributes({ showIcon: value })}
              />
            </>
          }
        >
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
        </QuickZone>
      </div>
    </>
  );
}
