import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import { useState } from '@wordpress/element';

const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'saas-hero-block') : __('Select ', 'saas-hero-block')}{label}</Button>} /></MediaUploadCheck>;

export default function Edit({ attributes, setAttributes }) {
  const [activeZone, setActiveZone] = useState(null);
  const a = attributes;
  const blockProps = useBlockProps({ className: 'adaire-saas-hero', style: {
    '--ad-accent': a.accentColor,
    '--ad-bg': a.backgroundType === 'gradient' ? (a.backgroundGradient || a.gradient) : a.backgroundColor,
    '--ad-color': a.textColor,
    '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
    '--ad-button-primary-color': a.buttonPrimaryColor || a.accentColor,
    '--ad-button-primary-bg': a.buttonPrimaryBg || a.accentColor,
    '--ad-button-secondary-color': a.buttonSecondaryColor || '#111827',
    '--ad-button-secondary-bg': a.buttonSecondaryBg || '#ffffff',
    '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
    '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
    '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
    '--ad-radius': (a.borderRadius || a.cardRadius || a.buttonRadius || 12) + 'px',
    '--ad-padding': (a.padding || a.formPadding || 80) + 'px',
    '--ad-font-size': (a.fontSize || 16) + 'px',
    '--ad-pill-bg': a.pillBg || '#dbeafe',
    '--ad-pill-color': a.pillColor || '#1e40af',
    '--ad-gradient-start': a.gradientStart || '#6366f1',
    '--ad-gradient-end': a.gradientEnd || '#8b5cf6',
  } });

  return (<>
    <InspectorControls>
      <PanelBody title={__('Layout', 'saas-hero-block')} initialOpen={true}>
        <SelectControl
          label={__('Layout Style', 'saas-hero-block')}
          value={a.layoutStyle || 'centered'}
          options={[
            { label: __('Centered', 'saas-hero-block'), value: 'centered' },
            { label: __('Split Layout (Left)', 'saas-hero-block'), value: 'split-left' },
            { label: __('Split Layout (Right)', 'saas-hero-block'), value: 'split-right' },
          ]}
          onChange={set(setAttributes, 'layoutStyle')}
        />
      </PanelBody>

      <PanelBody title={__('Top Pill', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl
          label={__('Show Top Pill', 'saas-hero-block')}
          checked={a.showPill}
          onChange={set(setAttributes, 'showPill')}
        />
        {a.showPill && (
          <>
            <TextControl
              label={__('Pill Text', 'saas-hero-block')}
              value={a.pillText || ''}
              onChange={set(setAttributes, 'pillText')}
            />
            <AdaireColorControl label={__('Pill Background', 'saas-hero-block')} value={a.pillBg} onChange={(v) => setAttributes({ pillBg: v || '#dbeafe' })} />
            <AdaireColorControl label={__('Pill Text Color', 'saas-hero-block')} value={a.pillColor} onChange={(v) => setAttributes({ pillColor: v || '#1e40af' })} />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('Headline', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl
          label={__('Use Gradient on Headline', 'saas-hero-block')}
          checked={a.useGradientHeadline}
          onChange={set(setAttributes, 'useGradientHeadline')}
        />
        {a.useGradientHeadline && (
          <>
            <AdaireColorControl label={__('Gradient Start', 'saas-hero-block')} value={a.gradientStart} onChange={(v) => setAttributes({ gradientStart: v || '#6366f1' })} />
            <AdaireColorControl label={__('Gradient End', 'saas-hero-block')} value={a.gradientEnd} onChange={(v) => setAttributes({ gradientEnd: v || '#8b5cf6' })} />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('CTA Module', 'saas-hero-block')} initialOpen={false}>
        <SelectControl
          label={__('CTA Type', 'saas-hero-block')}
          value={a.ctaType || 'dual-buttons'}
          options={[
            { label: __('Dual Buttons', 'saas-hero-block'), value: 'dual-buttons' },
            { label: __('Email Form', 'saas-hero-block'), value: 'email-form' },
            { label: __('Single Button', 'saas-hero-block'), value: 'single-button' },
          ]}
          onChange={set(setAttributes, 'ctaType')}
        />
        {a.ctaType === 'dual-buttons' && (
          <>
            <TextControl label={__('Primary Button Text', 'saas-hero-block')} value={a.primaryButtonText || ''} onChange={set(setAttributes, 'primaryButtonText')} />
            <URLInput label={__('Primary Button URL', 'saas-hero-block')} value={a.primaryButtonUrl || ''} onChange={set(setAttributes, 'primaryButtonUrl')} />
            <TextControl label={__('Secondary Button Text', 'saas-hero-block')} value={a.secondaryButtonText || ''} onChange={set(setAttributes, 'secondaryButtonText')} />
            <URLInput label={__('Secondary Button URL', 'saas-hero-block')} value={a.secondaryButtonUrl || ''} onChange={set(setAttributes, 'secondaryButtonUrl')} />
          </>
        )}
        {a.ctaType === 'email-form' && (
          <>
            <TextControl label={__('Email Placeholder', 'saas-hero-block')} value={a.emailPlaceholder || ''} onChange={set(setAttributes, 'emailPlaceholder')} />
            <TextControl label={__('Submit Button Text', 'saas-hero-block')} value={a.submitButtonText || ''} onChange={set(setAttributes, 'submitButtonText')} />
          </>
        )}
        {a.ctaType === 'single-button' && (
          <>
            <TextControl label={__('Button Text', 'saas-hero-block')} value={a.singleButtonText || ''} onChange={set(setAttributes, 'singleButtonText')} />
            <URLInput label={__('Button URL', 'saas-hero-block')} value={a.singleButtonUrl || ''} onChange={set(setAttributes, 'singleButtonUrl')} />
            <TextControl label={__('Micro-copy Link', 'saas-hero-block')} value={a.microCopy || ''} onChange={set(setAttributes, 'microCopy')} />
          </>
        )}
        <AdaireColorControl label={__('Primary Button Color', 'saas-hero-block')} value={a.buttonPrimaryColor} onChange={(v) => setAttributes({ buttonPrimaryColor: v })} />
        <AdaireColorControl label={__('Primary Button Background', 'saas-hero-block')} value={a.buttonPrimaryBg} onChange={(v) => setAttributes({ buttonPrimaryBg: v })} />
        <AdaireColorControl label={__('Secondary Button Color', 'saas-hero-block')} value={a.buttonSecondaryColor} onChange={(v) => setAttributes({ buttonSecondaryColor: v })} />
        <AdaireColorControl label={__('Secondary Button Background', 'saas-hero-block')} value={a.buttonSecondaryBg} onChange={(v) => setAttributes({ buttonSecondaryBg: v })} />
      </PanelBody>

      <PanelBody title={__('Media Asset', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl
          label={__('Show Hero Image', 'saas-hero-block')}
          checked={a.showHeroImage}
          onChange={set(setAttributes, 'showHeroImage')}
        />
        {a.showHeroImage && media(__('Hero Image', 'saas-hero-block'), a.heroImageUrl, (v) => setAttributes({ heroImageUrl: v }))}
        <SelectControl
          label={__('Image Position', 'saas-hero-block')}
          value={a.imagePosition || 'below'}
          options={[
            { label: __('Below Text', 'saas-hero-block'), value: 'below' },
            { label: __('Right of Text', 'saas-hero-block'), value: 'right' },
            { label: __('Left of Text', 'saas-hero-block'), value: 'left' },
          ]}
          onChange={set(setAttributes, 'imagePosition')}
        />
      </PanelBody>

      <PanelBody title={__('Trust Bar', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl
          label={__('Show Trust Bar', 'saas-hero-block')}
          checked={a.showTrustBar}
          onChange={set(setAttributes, 'showTrustBar')}
        />
        {a.showTrustBar && (
          <>
            <TextControl label={__('Trust Bar Title', 'saas-hero-block')} value={a.trustBarTitle || ''} onChange={set(setAttributes, 'trustBarTitle')} />
            <TextareaControl label={__('Logo Names (one per line)', 'saas-hero-block')} value={a.trustLogos || ''} onChange={set(setAttributes, 'trustLogos')} />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('Style', 'saas-hero-block')} initialOpen={false}>
        <AdaireColorControl label={__('Accent color', 'saas-hero-block')} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#6366f1' })} />
        <AdaireColorControl label={__('Background color', 'saas-hero-block')} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#ffffff' })} />
        <AdaireColorControl label={__('Text color', 'saas-hero-block')} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#111827' })} />
        <RangeControl label={__('Font size', 'saas-hero-block')} value={a.fontSize || 16} onChange={set(setAttributes, 'fontSize')} min={10} max={80} />
        <RangeControl label={__('Padding', 'saas-hero-block')} value={a.padding || 80} onChange={set(setAttributes, 'padding')} min={0} max={200} />
        <RangeControl label={__('Border Radius', 'saas-hero-block')} value={a.borderRadius || 12} onChange={set(setAttributes, 'borderRadius')} min={0} max={50} />
        <SelectControl label={__('Background type', 'saas-hero-block')} value={a.backgroundType || 'solid'} options={[{ label: 'Solid color', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }]} onChange={set(setAttributes, 'backgroundType')} />
        {a.backgroundType === 'image' && media(__('Background image', 'saas-hero-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
        {a.backgroundType === 'gradient' && <TextControl label={__('Gradient CSS', 'saas-hero-block')} value={a.backgroundGradient || ''} onChange={set(setAttributes, 'backgroundGradient')} />}
      </PanelBody>
    </InspectorControls>

    <section {...blockProps} className={`adaire-saas-hero layout-${a.layoutStyle || 'centered'}`}>
      <div className="adaire-saas-hero__container">
        {/* Top Pill */}
        {a.showPill && (
          <QuickZone
            id="saas-hero-pill"
            label="Top Pill"
            activeZone={activeZone}
            setActiveZone={setActiveZone}
            content={<TextControl label={__('Pill Text', 'saas-hero-block')} value={a.pillText} onChange={set(setAttributes, 'pillText')} />}
          >
            <div className="adaire-saas-hero__pill">
              <RichText tagName="span" value={a.pillText} onChange={set(setAttributes, 'pillText')} />
            </div>
          </QuickZone>
        )}

        {/* Main Content */}
        <div className="adaire-saas-hero__content">
          <div className="adaire-saas-hero__text">
            <QuickZone
              id="saas-hero-eyebrow"
              label="Eyebrow"
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={<TextControl label={__('Eyebrow', 'saas-hero-block')} value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} />}
            >
              <RichText tagName="p" className="adaire-saas-hero__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} />
            </QuickZone>

            <QuickZone
              id="saas-hero-heading"
              label="Heading"
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={<TextControl label={__('Heading', 'saas-hero-block')} value={a.heading} onChange={set(setAttributes, 'heading')} />}
            >
              <RichText
                tagName="h1"
                className={`adaire-saas-hero__heading ${a.useGradientHeadline ? 'has-gradient' : ''}`}
                value={a.heading}
                onChange={set(setAttributes, 'heading')}
              />
            </QuickZone>

            <QuickZone
              id="saas-hero-text"
              label="Text"
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={<TextareaControl label={__('Text', 'saas-hero-block')} value={a.text} onChange={set(setAttributes, 'text')} />}
            >
              <RichText tagName="p" className="adaire-saas-hero__text" value={a.text} onChange={set(setAttributes, 'text')} />
            </QuickZone>

            {/* CTA Module */}
            <div className="adaire-saas-hero__cta">
              {a.ctaType === 'dual-buttons' && (
                <>
                  <a href={a.primaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    {a.primaryButtonText}
                  </a>
                  <a href={a.secondaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                    {a.secondaryButtonText}
                  </a>
                </>
              )}
              {a.ctaType === 'email-form' && (
                <div className="adaire-saas-hero__email-form">
                  <input type="email" placeholder={a.emailPlaceholder || 'Enter your email'} />
                  <button type="submit">{a.submitButtonText || 'Get Started'}</button>
                </div>
              )}
              {a.ctaType === 'single-button' && (
                <>
                  <a href={a.singleButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    {a.singleButtonText}
                  </a>
                  {a.microCopy && <p className="adaire-saas-hero__micro-copy">{a.microCopy}</p>}
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          {a.showHeroImage && a.heroImageUrl && (
            <div className={`adaire-saas-hero__media adaire-saas-hero__media--${a.imagePosition || 'below'}`}>
              <img src={a.heroImageUrl} alt="Hero" />
            </div>
          )}
        </div>

        {/* Trust Bar */}
        {a.showTrustBar && (
          <div className="adaire-saas-hero__trust-bar">
            <p className="adaire-saas-hero__trust-title">{a.trustBarTitle || 'Trusted by'}</p>
            <div className="adaire-saas-hero__trust-logos">
              {a.trustLogos && a.trustLogos.split('\n').map((logo, index) => (
                <span key={index} className="adaire-saas-hero__trust-logo">{logo}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  </>);
}