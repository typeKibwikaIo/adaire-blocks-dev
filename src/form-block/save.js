import { RichText, useBlockProps } from '@wordpress/block-editor';

const renderField = (field, index) => {
  const required = !!field.required;
  const name = field.name || 'field_' + index;
  const className = field.width === 'full' ? 'is-wide' : undefined;
  if (field.type === 'textarea') return <label className={className} key={index}>{field.label}<textarea name={name} required={required}></textarea></label>;
  if (field.type === 'select') return <label className={className} key={index}>{field.label}<select name={name} required={required}>{(field.options || '').split(',').map((option) => <option key={option} value={option.trim()}>{option.trim()}</option>)}</select></label>;
  if (field.type === 'checkbox') return <label className={className} key={index}><input name={name} type="checkbox" required={required} /> {field.label}</label>;
  return <label className={className} key={index}>{field.label}<input name={name} type={field.type || 'text'} required={required} /></label>;
};

export default function save({ attributes: a }) {
  const fields = a.fields && a.fields.length ? a.fields : [{"label":"Name","name":"name","type":"text","required":true,"width":"half"},{"label":"Email","name":"email","type":"email","required":true,"width":"half"},{"label":"Phone","name":"phone","type":"tel","required":false,"width":"half"},{"label":"Subject","name":"subject","type":"text","required":false,"width":"half"},{"label":"Message","name":"message","type":"textarea","required":true,"width":"full"}];
  const blockProps = useBlockProps.save({ className: 'adaire-form', style: {
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
  return (<section {...blockProps} data-success={a.successMessage} data-redirect={a.redirectUrl} data-hover={a.buttonHoverEffect || 'lift'} data-layout={a.layout || 'two'}><RichText.Content tagName="p" className="adaire-form__eyebrow" value={a.eyebrow} /><RichText.Content tagName="h2" className="adaire-form__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-form__text" value={a.text} /><form className="adaire-form__form"><div className="adaire-form__grid">{fields.map(renderField)}<input className="ad-hp" name="company" tabIndex="-1" autoComplete="off" /></div><button className="adaire-form__button" type="submit"><RichText.Content tagName="span" value={a.buttonText} /></button><p className="adaire-form__feedback" role="status"></p></form></section>);
}
