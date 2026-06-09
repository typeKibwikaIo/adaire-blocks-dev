import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const colors = [ { name: 'Adaire Red', color: '#d52940' }, { name: 'Dark', color: '#111827' }, { name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#2563eb' } ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'pdf-upload-block') : __('Select ', 'pdf-upload-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-pdf-upload', style: {
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
      <PanelBody title={__('Content', 'pdf-upload-block')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'pdf-upload-block')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        {media(__('PDF file', 'pdf-upload-block'), a.pdfUrl, (v) => setAttributes({ pdfUrl: v }), ['application/pdf'])}<TextControl label={__('File size', 'pdf-upload-block')} value={a.fileSize || ''} onChange={set(setAttributes, 'fileSize')} /><TextControl label={__('Page count', 'pdf-upload-block')} value={a.pageCount || ''} onChange={set(setAttributes, 'pageCount')} /><TextControl label={__('Password hint', 'pdf-upload-block')} value={a.passwordHint || ''} onChange={set(setAttributes, 'passwordHint')} /><ToggleControl label={__('Show download button', 'pdf-upload-block')} checked={!!a.showDownload} onChange={set(setAttributes, 'showDownload')} /><RangeControl label={__('Viewer height', 'pdf-upload-block')} value={a.viewerHeight || 640} onChange={set(setAttributes, 'viewerHeight')} min={240} max={1200} />
      </PanelBody>
      <PanelBody title={__('Style', 'pdf-upload-block')} initialOpen={false}>
        <p>{__('Accent color', 'pdf-upload-block')}</p><ColorPalette colors={colors} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'pdf-upload-block')}</p><ColorPalette colors={colors} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'pdf-upload-block')}</p><ColorPalette colors={colors} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'pdf-upload-block')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'pdf-upload-block')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'pdf-upload-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'pdf-upload-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'pdf-upload-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'pdf-upload-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'pdf-upload-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'pdf-upload-block')} help={__('Use CSS values like auto, 100%, 180px.', 'pdf-upload-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'pdf-upload-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'pdf-upload-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'pdf-upload-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'pdf-upload-block')}</p><ColorPalette colors={colors} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'pdf-upload-block')}</p><ColorPalette colors={colors} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-pdf-upload__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-pdf-upload__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-pdf-upload__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-pdf-upload__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
