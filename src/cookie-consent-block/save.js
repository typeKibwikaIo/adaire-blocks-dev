import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-cookie-consent', style: {
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
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-version={a.consentVersion} data-days={a.durationDays} data-position={a.position} data-delay={a.autoHideDelay}><RichText.Content tagName="h2" className="adaire-cookie-consent__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-cookie-consent__text" value={a.text} /><div className="adaire-cookie-consent__prefs" hidden><label><input type="checkbox" defaultChecked /> Analytics</label><label><input type="checkbox" defaultChecked /> Marketing</label><label><input type="checkbox" defaultChecked /> Preferences</label></div><div className="adaire-cookie-consent__actions"><button data-cookie-action="accept">{a.buttonText}</button><button data-cookie-action="reject">{a.rejectText}</button><button data-cookie-action="manage">{a.manageText}</button>{a.policyUrl && <a href={a.policyUrl}>Cookie policy</a>}</div></section>);
}
