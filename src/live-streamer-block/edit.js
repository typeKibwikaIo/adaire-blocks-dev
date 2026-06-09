import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const colors = [ { name: 'Adaire Red', color: '#d52940' }, { name: 'Dark', color: '#111827' }, { name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#2563eb' } ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'live-streamer-block') : __('Select ', 'live-streamer-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-live-streamer', style: {
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
      <PanelBody title={__('Content', 'live-streamer-block')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'live-streamer-block')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <TextControl label={__('Stream URL', 'live-streamer-block')} value={a.streamUrl || ''} onChange={set(setAttributes, 'streamUrl')} /><TextareaControl label={__('Embed code', 'live-streamer-block')} value={a.embedCode || ''} onChange={set(setAttributes, 'embedCode')} /><SelectControl label={__('Platform', 'live-streamer-block')} value={a.platform || 'youtube'} options={[{label:'YouTube',value:'youtube'},{label:'Twitch',value:'twitch'},{label:'Vimeo',value:'vimeo'},{label:'Facebook',value:'facebook'},{label:'Instagram',value:'instagram'},{label:'TikTok',value:'tiktok'},{label:'Snapchat',value:'snapchat'},{label:'Custom',value:'custom'}]} onChange={set(setAttributes, 'platform')} /><ToggleControl label={__('Live now', 'live-streamer-block')} checked={!!a.isLive} onChange={set(setAttributes, 'isLive')} /><TextControl label={__('Next stream date/time', 'live-streamer-block')} value={a.nextStreamDate || ''} onChange={set(setAttributes, 'nextStreamDate')} /><ToggleControl label={__('Show chat', 'live-streamer-block')} checked={!!a.showChat} onChange={set(setAttributes, 'showChat')} />
      </PanelBody>
      <PanelBody title={__('Style', 'live-streamer-block')} initialOpen={false}>
        <p>{__('Accent color', 'live-streamer-block')}</p><ColorPalette colors={colors} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'live-streamer-block')}</p><ColorPalette colors={colors} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'live-streamer-block')}</p><ColorPalette colors={colors} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'live-streamer-block')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'live-streamer-block')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'live-streamer-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'live-streamer-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'live-streamer-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'live-streamer-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'live-streamer-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'live-streamer-block')} help={__('Use CSS values like auto, 100%, 180px.', 'live-streamer-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'live-streamer-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'live-streamer-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'live-streamer-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'live-streamer-block')}</p><ColorPalette colors={colors} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'live-streamer-block')}</p><ColorPalette colors={colors} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><RichText tagName="p" className="adaire-live-streamer__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} /><RichText tagName="h2" className="adaire-live-streamer__heading" value={a.heading} onChange={set(setAttributes, 'heading')} /><RichText tagName="p" className="adaire-live-streamer__text" value={a.text} onChange={set(setAttributes, 'text')} /><RichText tagName="span" className="adaire-live-streamer__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} /></section>
  </>);
}
