import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps, ColorPalette } from '@wordpress/block-editor';
import { Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'adaire-blocks') : __('Select ', 'adaire-blocks')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-reader', style: {
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
      <PanelBody title={__('Content', 'adaire-blocks')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'adaire-blocks')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <TextareaControl label={__('Cards JSON', 'adaire-blocks')} value={JSON.stringify(a.cards || [], null, 2)} onChange={(v) => { try { setAttributes({ cards: JSON.parse(v) }); } catch(e) {} }} /><SelectControl label={__('Columns', 'adaire-blocks')} value={String(a.columns || 3)} options={[{label:'1',value:'1'},{label:'2',value:'2'},{label:'3',value:'3'}]} onChange={(v) => setAttributes({ columns: Number(v) })} /><ToggleControl label={__('Hover effect', 'adaire-blocks')} checked={!!a.hoverEffect} onChange={set(setAttributes, 'hoverEffect')} />
      </PanelBody>
      <PanelBody title={__('Style', 'adaire-blocks')} initialOpen={false}>
        <p>{__('Accent color', 'adaire-blocks')}</p><ColorPalette value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'adaire-blocks')}</p><ColorPalette value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'adaire-blocks')}</p><ColorPalette value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'adaire-blocks')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'adaire-blocks')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'adaire-blocks')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'adaire-blocks')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'adaire-blocks')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'adaire-blocks'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'adaire-blocks')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'adaire-blocks')} help={__('Use CSS values like auto, 100%, 180px.', 'adaire-blocks')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'adaire-blocks')} help={__('Use CSS values like auto, 48px, 3rem.', 'adaire-blocks')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'adaire-blocks')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'adaire-blocks')}</p><ColorPalette value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'adaire-blocks')}</p><ColorPalette value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-reader__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-reader__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-reader__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-reader__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
