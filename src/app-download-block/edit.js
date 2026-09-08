import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps, ColorPalette } from '@wordpress/block-editor';
import { Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import DeviceSwitcher, { BreakpointNote, THREE_TIERS } from '../components/DeviceSwitcher';
import useEditorDevice, { hasCanvasPreset } from '../components/useEditorDevice';

const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'adaire-blocks') : __('Select ', 'adaire-blocks')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const [deviceType, setDeviceType] = useState('desktop');
  useEditorDevice(deviceType, setDeviceType);

  const updateResponsive = (attrName, value) => setAttributes({
    [attrName]: { ...(a[attrName] || {}), [deviceType]: value },
  });

  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps({ className: 'adaire-app-download', style: {
    '--ad-accent': a.accentColor,
    '--ad-bg': a.backgroundType === 'gradient' ? a.backgroundGradient : a.backgroundColor,
    '--ad-color': a.textColor,
    '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
    '--ad-button-color': a.buttonColor || a.accentColor,
    '--ad-button-width': a.buttonWidth || 'auto',
    '--ad-button-height': a.buttonHeight || 'auto',
    '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
    '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
    '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
    '--ad-radius-desktop': (radius.desktop ?? 18) + 'px',
    '--ad-radius-tablet': (radius.tablet ?? radius.desktop ?? 18) + 'px',
    '--ad-radius-mobile': (radius.mobile ?? radius.tablet ?? radius.desktop ?? 18) + 'px',
    '--ad-padding-desktop': (padding.desktop ?? 28) + 'px',
    '--ad-padding-tablet': (padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-padding-mobile': (padding.mobile ?? padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-font-size-desktop': (fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? 16) + 'px'
  } });
  return (<>
    <InspectorControls>
      <PanelBody title={__('Content', 'adaire-blocks')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'adaire-blocks')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        {media(__('App screenshot', 'adaire-blocks'), a.screenshotUrl, (v) => setAttributes({ screenshotUrl: v }))}<TextControl label={__('App Store URL', 'adaire-blocks')} value={a.appStoreUrl || ''} onChange={set(setAttributes, 'appStoreUrl')} /><TextControl label={__('Google Play URL', 'adaire-blocks')} value={a.googlePlayUrl || ''} onChange={set(setAttributes, 'googlePlayUrl')} /><TextControl label={__('QR image URL', 'adaire-blocks')} value={a.qrUrl || ''} onChange={set(setAttributes, 'qrUrl')} /><SelectControl label={__('Platform', 'adaire-blocks')} value={a.platform || 'both'} options={[{label:'Both',value:'both'},{label:'iOS',value:'ios'},{label:'Android',value:'android'}]} onChange={set(setAttributes, 'platform')} />
      </PanelBody>
      <PanelBody title={__('Style', 'adaire-blocks')} initialOpen={false}>
        <p>{__('Accent color', 'adaire-blocks')}</p><ColorPalette value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'adaire-blocks')}</p><ColorPalette value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'adaire-blocks')}</p><ColorPalette value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <SelectControl label={__('Background type', 'adaire-blocks')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'adaire-blocks'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'adaire-blocks')} value={a.backgroundGradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'adaire-blocks')} help={__('Use CSS values like auto, 100%, 180px.', 'adaire-blocks')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'adaire-blocks')} help={__('Use CSS values like auto, 48px, 3rem.', 'adaire-blocks')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'adaire-blocks')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'adaire-blocks')}</p><ColorPalette value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'adaire-blocks')}</p><ColorPalette value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
      <PanelBody title={__('Responsive', 'adaire-blocks')} initialOpen={false}>
        <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
        <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
        {!hasCanvasPreset(deviceType) && (
          <p className="components-base-control__help">{__('This breakpoint has no matching canvas preview width — the editor canvas will not resize to match while you edit it.', 'adaire-blocks')}</p>
        )}
        <RangeControl label={__('Font size', 'adaire-blocks')} value={fontSize[deviceType] ?? fontSize.desktop ?? 16} onChange={(v) => updateResponsive('responsiveFontSize', v)} min={10} max={80} />
        <RangeControl label={__('Padding', 'adaire-blocks')} value={padding[deviceType] ?? padding.desktop ?? 28} onChange={(v) => updateResponsive('responsivePadding', v)} min={0} max={120} />
        <RangeControl label={__('Radius', 'adaire-blocks')} value={radius[deviceType] ?? radius.desktop ?? 18} onChange={(v) => updateResponsive('responsiveBorderRadius', v)} min={0} max={80} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-app-download__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-app-download__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-app-download__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-app-download__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
