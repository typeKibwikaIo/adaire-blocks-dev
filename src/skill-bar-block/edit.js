import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const colors = [ { name: 'Adaire Red', color: '#d52940' }, { name: 'Dark', color: '#111827' }, { name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#2563eb' } ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'skill-bar-block') : __('Select ', 'skill-bar-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-skill-bar', style: {
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
      <PanelBody title={__('Content', 'skill-bar-block')} initialOpen={true}>
        <TextControl label={__('CTA URL', 'skill-bar-block')} value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <URLInput value={a.buttonUrl || ''} onChange={set(setAttributes, 'buttonUrl')} />
        <TextareaControl label={__('Skills JSON', 'skill-bar-block')} help={__('Edit rows as JSON with label, value, icon, category, description.', 'skill-bar-block')} value={JSON.stringify(a.skills || [], null, 2)} onChange={(v) => { try { setAttributes({ skills: JSON.parse(v) }); } catch(e) {} }} /><SelectControl label={__('Orientation', 'skill-bar-block')} value={a.orientation || 'horizontal'} options={[{label:'Horizontal',value:'horizontal'},{label:'Vertical',value:'vertical'}]} onChange={set(setAttributes, 'orientation')} /><RangeControl label={__('Animation duration', 'skill-bar-block')} value={a.animationDuration || 1200} onChange={set(setAttributes, 'animationDuration')} min={100} max={5000} />
      </PanelBody>
      <PanelBody title={__('Style', 'skill-bar-block')} initialOpen={false}>
        <p>{__('Accent color', 'skill-bar-block')}</p><ColorPalette colors={colors} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'skill-bar-block')}</p><ColorPalette colors={colors} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'skill-bar-block')}</p><ColorPalette colors={colors} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Font size', 'skill-bar-block')} value={a.fontSize || a.labelFontSize || 16} onChange={(v) => setAttributes({ fontSize: v, labelFontSize: v })} min={10} max={80} />
        <TextControl label={__('Font weight', 'skill-bar-block')} value={a.fontWeight || a.labelFontWeight || '700'} onChange={(v) => setAttributes({ fontWeight: v, labelFontWeight: v })} />
        <RangeControl label={__('Padding', 'skill-bar-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'skill-bar-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      <SelectControl label={__('Background type', 'skill-bar-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'skill-bar-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'skill-bar-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'skill-bar-block')} help={__('Use CSS values like auto, 100%, 180px.', 'skill-bar-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'skill-bar-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'skill-bar-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'skill-bar-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'skill-bar-block')}</p><ColorPalette colors={colors} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'skill-bar-block')}</p><ColorPalette colors={colors} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}>{(a.skills || []).map((skill, i) => <div className="adaire-skill-bar__item" key={i}><div className="adaire-skill-bar__label"><span>{skill.icon}</span>{skill.label}<strong>{skill.value}%</strong></div><div className="adaire-skill-bar__track"><span style={{ width: skill.value + '%' }} /></div></div>)}</section>
  </>);
}
