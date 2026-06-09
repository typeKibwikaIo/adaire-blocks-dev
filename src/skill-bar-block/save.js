import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-skill-bar', style: {
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
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-duration={a.animationDuration} data-trigger={a.animationTrigger}>{(a.skills || []).map((skill, i) => <div className="adaire-skill-bar__item" key={i} title={a.tooltip ? skill.description || skill.value + '%' : undefined}><div className="adaire-skill-bar__label"><span>{skill.icon}</span>{skill.label}<strong>{skill.value}%</strong></div><div className="adaire-skill-bar__track"><span style={{ width: skill.value + '%' }} /></div></div>)}</section>);
}
