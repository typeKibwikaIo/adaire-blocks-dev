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
  const fields = a.fields && a.fields.length ? a.fields : [{"label":"Name","name":"name","type":"text","required":true,"width":"half"},{"label":"Email","name":"email","type":"email","required":true,"width":"half"},{"label":"Phone","name":"phone","type":"tel","required":false,"width":"half"},{"label":"Date","name":"date","type":"date","required":true,"width":"half"},{"label":"Time","name":"time","type":"time","required":true,"width":"half"},{"label":"Service","name":"service","type":"select","required":false,"width":"half","options":"Consultation, Demo, Support"},{"label":"Notes","name":"notes","type":"textarea","required":false,"width":"full"}];
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const blockProps = useBlockProps.save({ className: 'adaire-booking-form', style: {
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
    '--ad-font-size': (a.fontSize || 16) + 'px'
  } });
  return (<section {...blockProps} data-success={a.successMessage} data-redirect={a.redirectUrl} data-hover={a.buttonHoverEffect || 'lift'} data-layout={a.layout || 'two'}><RichText.Content tagName="p" className="adaire-booking-form__eyebrow" value={a.eyebrow} /><RichText.Content tagName="h2" className="adaire-booking-form__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-booking-form__text" value={a.text} /><form className="adaire-booking-form__form"><div className="adaire-booking-form__grid">{fields.map(renderField)}<input className="ad-hp" name="company" tabIndex="-1" autoComplete="off" /></div><button className="adaire-booking-form__button" type="submit"><RichText.Content tagName="span" value={a.buttonText} /></button><p className="adaire-booking-form__feedback" role="status"></p></form></section>);
}
