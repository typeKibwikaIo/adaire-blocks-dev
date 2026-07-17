import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps, ColorPalette } from '@wordpress/block-editor';
import { Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const fieldTypes = [ 'text', 'email', 'tel', 'date', 'time', 'textarea', 'select', 'checkbox', 'file' ];
const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'form-block') : __('Select ', 'form-block')}{label}</Button>} /></MediaUploadCheck>;
const normalizeName = (label = '') => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field';

export default function Edit({ attributes, setAttributes }) {
  const a = attributes;
  const fields = a.fields && a.fields.length ? a.fields : [{"label":"Name","name":"name","type":"text","required":true,"width":"half"},{"label":"Email","name":"email","type":"email","required":true,"width":"half"},{"label":"Phone","name":"phone","type":"tel","required":false,"width":"half"},{"label":"Date","name":"date","type":"date","required":true,"width":"half"},{"label":"Time","name":"time","type":"time","required":true,"width":"half"},{"label":"Service","name":"service","type":"select","required":false,"width":"half","options":"Consultation, Demo, Support"},{"label":"Notes","name":"notes","type":"textarea","required":false,"width":"full"}];
  const updateField = (index, patch) => setAttributes({ fields: fields.map((field, i) => i === index ? { ...field, ...patch } : field) });
  const addField = () => setAttributes({ fields: [...fields, { label: 'New field', name: 'new_field_' + (fields.length + 1), type: 'text', required: false, width: 'half' }] });
  const removeField = (index) => setAttributes({ fields: fields.filter((_, i) => i !== index) });
  const blockProps = useBlockProps({ className: 'adaire-booking-form', style: {
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
      <PanelBody title={__('Content', 'form-block')} initialOpen={true}>
        <TextControl label={__('Destination email', 'form-block')} value={a.destinationEmail || ''} onChange={set(setAttributes, 'destinationEmail')} />
        <TextControl label={__('Success message', 'form-block')} value={a.successMessage || ''} onChange={set(setAttributes, 'successMessage')} />
        <TextControl label={__('Redirect URL', 'form-block')} value={a.redirectUrl || ''} onChange={set(setAttributes, 'redirectUrl')} />
        <SelectControl label={__('Layout', 'form-block')} value={a.layout || 'two'} options={[{label:'1 column',value:'one'},{label:'2 columns',value:'two'}]} onChange={set(setAttributes, 'layout')} />
      </PanelBody>
      <PanelBody title={__('Form fields', 'form-block')} initialOpen={false}>
        {fields.map((field, index) => <div className="adaire-field-editor" key={index} style={{ borderTop: '1px solid #ddd', paddingTop: '12px', marginTop: '12px' }}>
          <TextControl label={__('Label', 'form-block')} value={field.label || ''} onChange={(value) => updateField(index, { label: value, name: field.name || normalizeName(value) })} />
          <TextControl label={__('Name', 'form-block')} value={field.name || ''} onChange={(value) => updateField(index, { name: value })} />
          <SelectControl label={__('Type', 'form-block')} value={field.type || 'text'} options={fieldTypes.map((type) => ({ label: type, value: type }))} onChange={(value) => updateField(index, { type: value })} />
          {field.type === 'select' && <TextareaControl label={__('Options, comma separated', 'form-block')} value={field.options || ''} onChange={(value) => updateField(index, { options: value })} />}
          <SelectControl label={__('Width', 'form-block')} value={field.width || 'half'} options={[{ label: 'Half', value: 'half' }, { label: 'Full', value: 'full' }]} onChange={(value) => updateField(index, { width: value })} />
          <SelectControl label={__('Required', 'form-block')} value={field.required ? 'yes' : 'no'} options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]} onChange={(value) => updateField(index, { required: value === 'yes' })} />
          <Button variant="secondary" isDestructive onClick={() => removeField(index)}>{__('Remove field', 'form-block')}</Button>
        </div>)}
        <Button variant="primary" onClick={addField}>{__('Add field', 'form-block')}</Button>
      </PanelBody>
      <PanelBody title={__('Button and background', 'form-block')} initialOpen={false}>
        <SelectControl label={__('Background type', 'form-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'form-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'form-block')} value={a.backgroundGradient || a.gradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
        <TextControl label={__('Button width', 'form-block')} help={__('Use CSS values like auto, 100%, 180px.', 'form-block')} value={a.buttonWidth || 'auto'} onChange={set(setAttributes, 'buttonWidth')} />
        <TextControl label={__('Button height', 'form-block')} help={__('Use CSS values like auto, 48px, 3rem.', 'form-block')} value={a.buttonHeight || 'auto'} onChange={set(setAttributes, 'buttonHeight')} />
        <SelectControl label={__('Button hover effect', 'form-block')} value={a.buttonHoverEffect || 'lift'} options={[{ label: 'Lift', value: 'lift' }, { label: 'Glow', value: 'glow' }, { label: 'Darken', value: 'darken' }, { label: 'None', value: 'none' }]} onChange={set(setAttributes, 'buttonHoverEffect')} />
        <p>{__('Button hover text', 'form-block')}</p><ColorPalette value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
        <p>{__('Button hover background', 'form-block')}</p><ColorPalette value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
      </PanelBody>
      <PanelBody title={__('Style', 'form-block')} initialOpen={false}>
        <p>{__('Accent color', 'form-block')}</p><ColorPalette value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
        <p>{__('Background color', 'form-block')}</p><ColorPalette value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
        <p>{__('Text color', 'form-block')}</p><ColorPalette value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
        <RangeControl label={__('Padding', 'form-block')} value={a.padding || a.formPadding || 28} onChange={(v) => setAttributes({ padding: v, formPadding: v })} min={0} max={120} />
        <RangeControl label={__('Radius', 'form-block')} value={a.borderRadius || a.cardRadius || a.buttonRadius || 18} onChange={(v) => setAttributes({ borderRadius: v, cardRadius: v, buttonRadius: v })} min={0} max={80} />
      </PanelBody>
    </InspectorControls>
    <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-layout={a.layout || 'two'}>
      <RichText tagName="p" className="adaire-booking-form__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} />
      <RichText tagName="h2" className="adaire-booking-form__heading" value={a.heading} onChange={set(setAttributes, 'heading')} />
      <RichText tagName="p" className="adaire-booking-form__text" value={a.text} onChange={set(setAttributes, 'text')} />
      <div className="adaire-booking-form__grid">{fields.map((field, index) => <label className={field.width === 'full' ? 'is-wide' : ''} key={index}>{field.label}{field.type === 'textarea' ? <textarea disabled /> : field.type === 'select' ? <select disabled>{(field.options || '').split(',').map((option) => <option key={option}>{option.trim()}</option>)}</select> : <input type={field.type || 'text'} disabled />}</label>)}</div>
      <RichText tagName="span" className="adaire-booking-form__button" value={a.buttonText} onChange={set(setAttributes, 'buttonText')} />
    </section>
  </>);
}

