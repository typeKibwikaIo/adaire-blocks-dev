import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const colors = [ { name: 'Adaire Red', color: '#d52940' }, { name: 'Dark', color: '#111827' }, { name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#2563eb' } ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'saas-hero-block') : __('Select ', 'saas-hero-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-saas-hero', style: {
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
      <PanelBody title={__('Content', 'saas-hero-block')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'saas-hero-block')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        {media(__('Hero image', 'saas-hero-block'), a.heroImageUrl, (v) => setAttributes({ heroImageUrl: v }))}<TextControl label={__('Secondary CTA text', 'saas-hero-block')} value={a.secondaryButtonText || ''} onChange={set(setAttributes, 'secondaryButtonText')} /><TextControl label={__('Secondary CTA URL', 'saas-hero-block')} value={a.secondaryButtonUrl || ''} onChange={set(setAttributes, 'secondaryButtonUrl')} /><TextControl label={__('Announcement', 'saas-hero-block')} value={a.announcementText || ''} onChange={set(setAttributes, 'announcementText')} /><SelectControl label={__('Alignment', 'saas-hero-block')} value={a.alignment || 'left'} options={[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}]} onChange={set(setAttributes, 'alignment')} /><ToggleControl label={__('Typewriter headline', 'saas-hero-block')} checked={!!a.typewriter} onChange={set(setAttributes, 'typewriter')} />
      </PanelBody>
      <PanelBody title={__('Style', 'saas-hero-block')} initialOpen={false}>
        <p>{__('Accent color', 'saas-hero-block')}</p><ColorPalette colors={colors} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'saas-hero-block')}</p><ColorPalette colors={colors} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'saas-hero-block')}</p><ColorPalette colors={colors} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'saas-hero-block')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'saas-hero-block')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'saas-hero-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'saas-hero-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'saas-hero-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'saas-hero-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'saas-hero-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'saas-hero-block')} help={__('Use CSS values like auto, 100%, 180px.', 'saas-hero-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'saas-hero-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'saas-hero-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'saas-hero-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'saas-hero-block')}</p><ColorPalette colors={colors} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'saas-hero-block')}</p><ColorPalette colors={colors} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-saas-hero__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-saas-hero__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-saas-hero__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-saas-hero__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
