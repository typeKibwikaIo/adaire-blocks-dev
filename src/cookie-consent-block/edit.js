import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const colors = [ { name: 'Adaire Red', color: '#d52940' }, { name: 'Dark', color: '#111827' }, { name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#2563eb' } ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'cookie-consent-block') : __('Select ', 'cookie-consent-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-cookie-consent', style: {
    '--ad-accent': a.accentColor,
    '--ad-bg': a.backgroundType === 'gradient' ? (a.backgroundGradient || a.gradient) : a.backgroundColor,
    '--ad-color': a.textColor,
    '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
    '--ad-button-color': a.buttonColor || a.accentColor,
    '--ad-button-width': a.buttonWidth || 'auto',
    '--ad-button-height': a.buttonHeight || 'auto',
    '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
    '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
    '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
    '--ad-radius': (a.borderRadius || a.cardRadius || a.buttonRadius || 18) + 'px',
    '--ad-padding': (a.padding || a.formPadding || 28) + 'px',
    '--ad-font-size': (a.fontSize || 16) + 'px'
  } });
  return (<>
    <InspectorControls>
      <PanelBody title={__('Content', 'cookie-consent-block')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'cookie-consent-block')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <TextControl label={__('Cookie policy URL', 'cookie-consent-block')} value={a.policyUrl || ''} onChange={set(setAttributes, 'policyUrl')} /><TextControl label={__('Reject text', 'cookie-consent-block')} value={a.rejectText || ''} onChange={set(setAttributes, 'rejectText')} /><TextControl label={__('Manage text', 'cookie-consent-block')} value={a.manageText || ''} onChange={set(setAttributes, 'manageText')} /><RangeControl label={__('Consent duration days', 'cookie-consent-block')} value={a.durationDays || 180} onChange={set(setAttributes, 'durationDays')} min={1} max={730} /><SelectControl label={__('Position', 'cookie-consent-block')} value={a.position || 'bottom'} options={[{label:'Bottom bar',value:'bottom'},{label:'Corner',value:'corner'},{label:'Modal',value:'modal'}]} onChange={set(setAttributes, 'position')} />
      </PanelBody>
      <PanelBody title={__('Style', 'cookie-consent-block')} initialOpen={false}>
        <p>{__('Accent color', 'cookie-consent-block')}</p><ColorPalette colors={colors} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'cookie-consent-block')}</p><ColorPalette colors={colors} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'cookie-consent-block')}</p><ColorPalette colors={colors} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'cookie-consent-block')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'cookie-consent-block')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'cookie-consent-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'cookie-consent-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'cookie-consent-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'cookie-consent-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'cookie-consent-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'cookie-consent-block')} help={__('Use CSS values like auto, 100%, 180px.', 'cookie-consent-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'cookie-consent-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'cookie-consent-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'cookie-consent-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'cookie-consent-block')}</p><ColorPalette colors={colors} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'cookie-consent-block')}</p><ColorPalette colors={colors} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-cookie-consent__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-cookie-consent__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-cookie-consent__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-cookie-consent__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
