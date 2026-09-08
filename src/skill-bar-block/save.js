import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps.save({ className: 'adaire-skill-bar', style: {
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
    '--ad-font-size-desktop': (fontSize.desktop ?? a.labelFontSize ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? a.labelFontSize ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? a.labelFontSize ?? 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-duration={a.animationDuration} data-trigger={a.animationTrigger}>{(a.skills || []).map((skill, i) => <div className="adaire-skill-bar__item" key={i} title={a.tooltip ? skill.description || skill.value + '%' : undefined}><div className="adaire-skill-bar__label"><span>{skill.icon}</span>{skill.label}<strong>{skill.value}%</strong></div><div className="adaire-skill-bar__track"><span style={{ width: skill.value + '%' }} /></div></div>)}</section>);
}
