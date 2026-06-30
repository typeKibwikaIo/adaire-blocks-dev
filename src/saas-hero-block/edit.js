import { MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { BaseControl, Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import BootstrapIconPicker from './BootstrapIconPicker';
import {
  getTrustItems,
  getStyleVars,
  getBgTypeClass,
  resolveSentinel,
  buildPresetPatch,
  resolveRatingIcon,
  resolveFeatureIcon,
  TrustLogo,
  RatingBadgeView,
  SecurityFeatureView,
  FaqItemView,
} from './shared';

const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'saas-hero-block') : __('Select ', 'saas-hero-block')}{label}</Button>} /></MediaUploadCheck>;

const FONT_FAMILY_OPTIONS = [
  { label: 'Default (inherit theme)', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const TEXT_TRANSFORM_OPTIONS = [
  { label: __('None', 'saas-hero-block'), value: 'none' },
  { label: __('Uppercase', 'saas-hero-block'), value: 'uppercase' },
  { label: __('Lowercase', 'saas-hero-block'), value: 'lowercase' },
  { label: __('Capitalize', 'saas-hero-block'), value: 'capitalize' },
];

const FONT_WEIGHT_OPTIONS = [
  { label: __('Thin (100)', 'saas-hero-block'), value: '100' },
  { label: __('Extra Light (200)', 'saas-hero-block'), value: '200' },
  { label: __('Light (300)', 'saas-hero-block'), value: '300' },
  { label: __('Normal (400)', 'saas-hero-block'), value: '400' },
  { label: __('Medium (500)', 'saas-hero-block'), value: '500' },
  { label: __('Semi Bold (600)', 'saas-hero-block'), value: '600' },
  { label: __('Bold (700)', 'saas-hero-block'), value: '700' },
  { label: __('Extra Bold (800)', 'saas-hero-block'), value: '800' },
  { label: __('Black (900)', 'saas-hero-block'), value: '900' },
];

// ─── Reusable per-role typography subsection — title + (optional) Font Size
// + Font Weight + Line Height + Letter Spacing + Text Transform, all bound
// to `${prefix}FontSize` / `${prefix}FontWeight` / etc. on `attributes`.
// `hasFontSize` is false for bodyText, which has no FontSize attribute in
// block.json (its size is controlled by the legacy global `fontSize`). ────
function TypographySubsection({ title, a, setAttributes, prefix, hasFontSize = true }) {
  return (
    <>
      <p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{title}</p>
      {hasFontSize && (
        <TextControl
          label={__('Font size', 'saas-hero-block')}
          value={a[`${prefix}FontSize`] || ''}
          onChange={set(setAttributes, `${prefix}FontSize`)}
        />
      )}
      <SelectControl
        label={__('Font weight', 'saas-hero-block')}
        value={a[`${prefix}FontWeight`] || '400'}
        options={FONT_WEIGHT_OPTIONS}
        onChange={set(setAttributes, `${prefix}FontWeight`)}
      />
      <UnitControl
        label={__('Line height', 'saas-hero-block')}
        value={a[`${prefix}LineHeight`] || ''}
        onChange={set(setAttributes, `${prefix}LineHeight`)}
      />
      <UnitControl
        label={__('Letter spacing', 'saas-hero-block')}
        value={a[`${prefix}LetterSpacing`] || ''}
        onChange={set(setAttributes, `${prefix}LetterSpacing`)}
      />
      <SelectControl
        label={__('Text transform', 'saas-hero-block')}
        value={a[`${prefix}TextTransform`] || 'none'}
        options={TEXT_TRANSFORM_OPTIONS}
        onChange={set(setAttributes, `${prefix}TextTransform`)}
      />
    </>
  );
}

// ─── Generic add/remove/reorder list editor used by every repeater-style
// inspector panel (Trusted By, Ratings, Security features, FAQ). ──────────
function RepeaterField({ items, onChange, renderItem, addLabel, newItem }) {
  const list = Array.isArray(items) ? items : [];
  const update = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  };
  const add = () => onChange([...list, { ...newItem }]);

  return (
    <div className="adaire-repeater">
      {list.map((item, i) => (
        <div className="adaire-repeater__item" key={i}>
          <div className="adaire-repeater__row-head">
            <span className="adaire-repeater__index">{i + 1}</span>
            <Button variant="tertiary" size="small" onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
            <Button variant="tertiary" size="small" onClick={() => move(i, 1)} disabled={i === list.length - 1}>↓</Button>
            <Button variant="tertiary" size="small" isDestructive onClick={() => remove(i)}>{__('Remove', 'saas-hero-block')}</Button>
          </div>
          {renderItem(item, (patch) => update(i, patch), i)}
        </div>
      ))}
      <Button variant="secondary" onClick={add}>{addLabel}</Button>
    </div>
  );
}

export default function Edit({ attributes, setAttributes, isSelected, clientId }) {
  const [activeZone, setActiveZone] = useState(null);
  const [ratingIconPickerIndex, setRatingIconPickerIndex] = useState(null);
  const [securityIconPickerIndex, setSecurityIconPickerIndex] = useState(null);
  const a = attributes;
  const trustItemsResolved = getTrustItems(a);

  // ── Block Interaction: selecting the block should also surface its
  // Inspector settings automatically, in whichever editor shell is hosting
  // it (post editor vs. site editor both expose their own sidebar store).
  const editPost = useDispatch('core/edit-post');
  const editSite = useDispatch('core/edit-site');
  useEffect(() => {
    if (!isSelected) return;
    try {
      if (editPost && typeof editPost.openGeneralSidebar === 'function') {
        editPost.openGeneralSidebar('edit-post/block');
      } else if (editSite && typeof editSite.openGeneralSidebar === 'function') {
        editSite.openGeneralSidebar('edit-site/block-inspector');
      }
    } catch (e) {
      // Sidebar store isn't available in this editor shell (e.g. widgets
      // screen) — selection still works natively, just without auto-open.
    }
  }, [isSelected, clientId]);

  const blockProps = useBlockProps({
    className: [
      'adaire-saas-hero',
      `layout-${a.layoutStyle || 'centered'}`,
      getBgTypeClass(a),
      a.trustCarousel ? 'has-trust-carousel' : '',
      isSelected ? 'is-block-selected' : '',
      a.effectFloatingElements ? 'has-floating-elements' : '',
    ].filter(Boolean).join(' '),
    style: getStyleVars(a),
  });

  // ─── Reusable control blocks — defined once, rendered in BOTH the
  // Inspector and the matching QuickZone popover, so the two surfaces are
  // structurally incapable of drifting out of sync. ──────────────────────

  const backgroundControls = (
    <>
      <SelectControl
        label={__('Background type', 'saas-hero-block')}
        value={a.backgroundType || 'solid'}
        options={[
          { label: __('Solid color', 'saas-hero-block'), value: 'solid' },
          { label: __('Gradient', 'saas-hero-block'), value: 'gradient' },
          { label: __('Image', 'saas-hero-block'), value: 'image' },
        ]}
        onChange={set(setAttributes, 'backgroundType')}
      />
      {(a.backgroundType || 'solid') === 'solid' && (
        <AdaireColorControl label={__('Background color', 'saas-hero-block')} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#ffffff' })} />
      )}
      {a.backgroundType === 'gradient' && (
        <TextControl
          label={__('Gradient CSS', 'saas-hero-block')}
          value={a.backgroundGradient || ''}
          onChange={set(setAttributes, 'backgroundGradient')}
          help={__('e.g. linear-gradient(135deg, #6366f1, #8b5cf6)', 'saas-hero-block')}
        />
      )}
      {a.backgroundType === 'image' && (
        <>
          {media(__('background image', 'saas-hero-block'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
          {a.backgroundImage && <Button variant="link" isDestructive onClick={() => setAttributes({ backgroundImage: '' })}>{__('Remove image', 'saas-hero-block')}</Button>}
          <SelectControl
            label={__('Image size', 'saas-hero-block')}
            value={a.backgroundImageSize || 'cover'}
            options={[{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' }]}
            onChange={set(setAttributes, 'backgroundImageSize')}
          />
          <SelectControl
            label={__('Image position', 'saas-hero-block')}
            value={a.backgroundImagePosition || 'center'}
            options={[{ label: 'Center', value: 'center' }, { label: 'Top', value: 'top' }, { label: 'Bottom', value: 'bottom' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
            onChange={set(setAttributes, 'backgroundImagePosition')}
          />
        </>
      )}
    </>
  );

  const colorTypographyControls = (
    <>
      <AdaireColorControl label={__('Accent color', 'saas-hero-block')} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#6366f1' })} />
      <AdaireColorControl label={__('Text color', 'saas-hero-block')} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#111827' })} />
      <RangeControl label={__('Font size', 'saas-hero-block')} value={a.fontSize || 16} onChange={set(setAttributes, 'fontSize')} min={10} max={80} />

      <SelectControl
        label={__('Font family', 'saas-hero-block')}
        value={a.fontFamily || ''}
        options={FONT_FAMILY_OPTIONS}
        onChange={set(setAttributes, 'fontFamily')}
        help={__('Applies to all text in this block.', 'saas-hero-block')}
      />

      <TypographySubsection title={__('Eyebrow', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="eyebrow" />
      <TypographySubsection title={__('Heading', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="heading" />
      <TypographySubsection title={__('Body text', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="bodyText" hasFontSize={false} />
      <TypographySubsection title={__('Pill', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="pill" />
      <TypographySubsection title={__('Button', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="button" />
      <TypographySubsection title={__('Trust bar title', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="trustTitle" />
      <TypographySubsection title={__('Trust logos', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="trustLogo" />
      <TypographySubsection title={__('Micro copy', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="microCopy" />
      <TypographySubsection title={__('Security title', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="securityTitle" />
      <TypographySubsection title={__('FAQ title', 'saas-hero-block')} a={a} setAttributes={setAttributes} prefix="faqTitle" />
    </>
  );

  const spacingControls = (
    <>
      <RangeControl label={__('Section padding', 'saas-hero-block')} value={a.padding || 80} onChange={set(setAttributes, 'padding')} min={0} max={200} />
      <RangeControl label={__('Global border radius', 'saas-hero-block')} value={a.borderRadius || 12} onChange={set(setAttributes, 'borderRadius')} min={0} max={50} />
    </>
  );

  const layoutControls = (
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
  );

  const ctaStyleControls = (
    <>
      <AdaireColorControl label={__('Primary button color', 'saas-hero-block')} value={a.buttonPrimaryColor} onChange={(v) => setAttributes({ buttonPrimaryColor: v })} />
      <AdaireColorControl label={__('Primary button background', 'saas-hero-block')} value={a.buttonPrimaryBg} onChange={(v) => setAttributes({ buttonPrimaryBg: v })} />
      <AdaireColorControl label={__('Secondary button color', 'saas-hero-block')} value={a.buttonSecondaryColor} onChange={(v) => setAttributes({ buttonSecondaryColor: v })} />
      <AdaireColorControl label={__('Secondary button background', 'saas-hero-block')} value={a.buttonSecondaryBg} onChange={(v) => setAttributes({ buttonSecondaryBg: v })} />
      <AdaireColorControl label={__('Hover text color', 'saas-hero-block')} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v })} />
      <AdaireColorControl label={__('Hover background color', 'saas-hero-block')} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v })} />
      <AdaireColorControl label={__('Hover border color', 'saas-hero-block')} value={a.buttonHoverBorderColor} onChange={(v) => setAttributes({ buttonHoverBorderColor: v })} />
    </>
  );

  const ctaSpacingControls = (
    <>
      <SelectControl
        label={__('Alignment', 'saas-hero-block')}
        value={a.ctaAlignment || 'center'}
        options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
        onChange={set(setAttributes, 'ctaAlignment')}
      />
      <RangeControl label={__('Gap between buttons', 'saas-hero-block')} value={a.ctaGap ?? 16} onChange={set(setAttributes, 'ctaGap')} min={0} max={60} />
      <RangeControl label={__('Button padding (vertical)', 'saas-hero-block')} value={a.ctaPaddingV ?? 14} onChange={set(setAttributes, 'ctaPaddingV')} min={0} max={40} />
      <RangeControl label={__('Button padding (horizontal)', 'saas-hero-block')} value={a.ctaPaddingH ?? 32} onChange={set(setAttributes, 'ctaPaddingH')} min={0} max={80} />
      <RangeControl
        label={__('Button border radius', 'saas-hero-block')}
        value={resolveSentinel(a.ctaBorderRadius, a.borderRadius ?? 12)}
        onChange={set(setAttributes, 'ctaBorderRadius')}
        min={0}
        max={50}
        help={__('Defaults to the global border radius until changed here.', 'saas-hero-block')}
      />
    </>
  );

  const mediaControls = (
    <>
      <ToggleControl label={__('Drop shadow', 'saas-hero-block')} checked={a.mediaShadow !== false} onChange={set(setAttributes, 'mediaShadow')} />
      <RangeControl
        label={__('Image border radius', 'saas-hero-block')}
        value={resolveSentinel(a.mediaBorderRadius, a.borderRadius ?? 12)}
        onChange={set(setAttributes, 'mediaBorderRadius')}
        min={0}
        max={60}
      />
      <RangeControl label={__('Spacing above image', 'saas-hero-block')} value={a.mediaSpacing ?? 48} onChange={set(setAttributes, 'mediaSpacing')} min={0} max={120} />
    </>
  );

  const trustStyleControls = (
    <>
      <SelectControl
        label={__('Logo layout', 'saas-hero-block')}
        value={a.trustLayout || 'row'}
        options={[{ label: __('Row (wraps)', 'saas-hero-block'), value: 'row' }, { label: __('One per line', 'saas-hero-block'), value: 'one-per-line' }]}
        onChange={set(setAttributes, 'trustLayout')}
      />
      <RangeControl label={__('Item width (0 = auto)', 'saas-hero-block')} value={a.trustItemWidth || 0} onChange={set(setAttributes, 'trustItemWidth')} min={0} max={320} />
      <RangeControl label={__('Item spacing', 'saas-hero-block')} value={a.trustItemGap ?? 32} onChange={set(setAttributes, 'trustItemGap')} min={0} max={100} />
      <RangeControl label={__('Logo max height', 'saas-hero-block')} value={a.trustLogoMaxHeight ?? 32} onChange={set(setAttributes, 'trustLogoMaxHeight')} min={12} max={120} />
      <ToggleControl label={__('Enable scrolling carousel', 'saas-hero-block')} checked={!!a.trustCarousel} onChange={set(setAttributes, 'trustCarousel')} />
      {a.trustCarousel && (
        <>
          <ToggleControl label={__('Autoplay', 'saas-hero-block')} checked={a.trustCarouselAutoplay !== false} onChange={set(setAttributes, 'trustCarouselAutoplay')} />
          <RangeControl label={__('Speed (seconds per loop)', 'saas-hero-block')} value={a.trustCarouselSpeed ?? 30} onChange={set(setAttributes, 'trustCarouselSpeed')} min={5} max={120} />
          <SelectControl
            label={__('Direction', 'saas-hero-block')}
            value={a.trustCarouselDirection || 'left'}
            options={[{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
            onChange={set(setAttributes, 'trustCarouselDirection')}
          />
          <ToggleControl label={__('Pause on hover', 'saas-hero-block')} checked={a.trustCarouselPauseOnHover !== false} onChange={set(setAttributes, 'trustCarouselPauseOnHover')} />
          <RangeControl label={__('Visible items', 'saas-hero-block')} value={a.trustCarouselVisibleItems ?? 5} onChange={set(setAttributes, 'trustCarouselVisibleItems')} min={2} max={10} />
        </>
      )}
    </>
  );

  return (<>
    <InspectorTabs attributes={a} setAttributes={setAttributes}>
      {/* ── Layout tab: content & structure ───────────────────────────── */}
      <PanelBody title={__('Layout', 'saas-hero-block')} initialOpen={true}>
        {layoutControls}
      </PanelBody>

      <PanelBody title={__('Top Pill', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show Top Pill', 'saas-hero-block')} checked={a.showPill} onChange={set(setAttributes, 'showPill')} />
        {a.showPill && <TextControl label={__('Pill Text', 'saas-hero-block')} value={a.pillText || ''} onChange={set(setAttributes, 'pillText')} />}
      </PanelBody>

      <PanelBody title={__('Headline', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Use Gradient on Headline', 'saas-hero-block')} checked={a.useGradientHeadline} onChange={set(setAttributes, 'useGradientHeadline')} />
      </PanelBody>

      <PanelBody title={__('CTA Content', 'saas-hero-block')} initialOpen={false}>
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
      </PanelBody>

      <PanelBody title={__('Media Asset', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show Hero Image', 'saas-hero-block')} checked={a.showHeroImage} onChange={set(setAttributes, 'showHeroImage')} />
        {a.showHeroImage && media(__('Hero Image', 'saas-hero-block'), a.heroImageUrl, (v) => setAttributes({ heroImageUrl: v }))}
        {/* Split layouts already imply left/right image position via the Layout
            control above — showing a second position control here would just
            duplicate it, so it's only offered for the centered layout. */}
        {a.showHeroImage && (a.layoutStyle || 'centered') === 'centered' && (
          <SelectControl
            label={__('Image Position', 'saas-hero-block')}
            value={a.imagePosition || 'below'}
            options={[
              { label: __('Below Text', 'saas-hero-block'), value: 'below' },
              { label: __('Above Text', 'saas-hero-block'), value: 'above' },
            ]}
            onChange={set(setAttributes, 'imagePosition')}
          />
        )}
      </PanelBody>

      <PanelBody title={__('Trusted By', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show Trust Bar', 'saas-hero-block')} checked={a.showTrustBar} onChange={set(setAttributes, 'showTrustBar')} />
        {a.showTrustBar && (
          <>
            <TextControl label={__('Trust Bar Title', 'saas-hero-block')} value={a.trustBarTitle || ''} onChange={set(setAttributes, 'trustBarTitle')} />
            <RepeaterField
              items={trustItemsResolved}
              onChange={(items) => setAttributes({ trustItems: items })}
              addLabel={__('Add company', 'saas-hero-block')}
              newItem={{ name: __('New company', 'saas-hero-block'), logoUrl: '', url: '' }}
              renderItem={(item, update) => (
                <>
                  <TextControl label={__('Name', 'saas-hero-block')} value={item.name || ''} onChange={(v) => update({ name: v })} />
                  {media(__('logo', 'saas-hero-block'), item.logoUrl, (v) => update({ logoUrl: v }))}
                  {item.logoUrl && <Button variant="link" isDestructive onClick={() => update({ logoUrl: '' })}>{__('Remove logo (use name text instead)', 'saas-hero-block')}</Button>}
                  <TextControl label={__('Link URL (optional)', 'saas-hero-block')} value={item.url || ''} onChange={(v) => update({ url: v })} />
                </>
              )}
            />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('Hero Effects & Decorations', 'saas-hero-block')} initialOpen={false}>
        <SelectControl
          label={__('Industry preset', 'saas-hero-block')}
          value={a.effectsPreset || 'none'}
          options={[
            { label: __('None', 'saas-hero-block'), value: 'none' },
            { label: __('Sports', 'saas-hero-block'), value: 'sports' },
            { label: __('Gym / Fitness', 'saas-hero-block'), value: 'gym' },
            { label: __('E-commerce', 'saas-hero-block'), value: 'ecommerce' },
            { label: __('Business', 'saas-hero-block'), value: 'business' },
            { label: __('Medical / Hospital', 'saas-hero-block'), value: 'medical' },
            { label: __('Gaming', 'saas-hero-block'), value: 'gaming' },
            { label: __('Custom', 'saas-hero-block'), value: 'custom' },
          ]}
          onChange={(v) => setAttributes(buildPresetPatch(v))}
          help={__('Presets just set the toggles below — tweak anything afterward.', 'saas-hero-block')}
        />
        <ToggleControl label={__('Dot pattern', 'saas-hero-block')} checked={!!a.effectDotPattern} onChange={set(setAttributes, 'effectDotPattern')} />
        <ToggleControl label={__('Gradient overlay', 'saas-hero-block')} checked={!!a.effectGradientOverlay} onChange={set(setAttributes, 'effectGradientOverlay')} />
        {a.effectGradientOverlay && (
          <>
            <AdaireColorControl label={__('Overlay color 1', 'saas-hero-block')} value={a.effectGradientOverlayColor1} onChange={(v) => setAttributes({ effectGradientOverlayColor1: v })} />
            <AdaireColorControl label={__('Overlay color 2', 'saas-hero-block')} value={a.effectGradientOverlayColor2} onChange={(v) => setAttributes({ effectGradientOverlayColor2: v })} />
            <RangeControl label={__('Overlay opacity %', 'saas-hero-block')} value={a.effectGradientOverlayOpacity ?? 30} onChange={set(setAttributes, 'effectGradientOverlayOpacity')} min={0} max={100} />
          </>
        )}
        <ToggleControl label={__('Abstract shapes', 'saas-hero-block')} checked={!!a.effectAbstractShapes} onChange={set(setAttributes, 'effectAbstractShapes')} />
        <ToggleControl label={__('Glow', 'saas-hero-block')} checked={!!a.effectGlow} onChange={set(setAttributes, 'effectGlow')} />
        {a.effectGlow && <AdaireColorControl label={__('Glow color', 'saas-hero-block')} value={a.effectGlowColor} onChange={(v) => setAttributes({ effectGlowColor: v })} />}
        <ToggleControl label={__('Blur blob', 'saas-hero-block')} checked={!!a.effectBlur} onChange={set(setAttributes, 'effectBlur')} />
        <ToggleControl label={__('Floating elements', 'saas-hero-block')} checked={!!a.effectFloatingElements} onChange={set(setAttributes, 'effectFloatingElements')} />
        <ToggleControl label={__('Animated accents', 'saas-hero-block')} checked={!!a.effectAnimatedAccents} onChange={set(setAttributes, 'effectAnimatedAccents')} />
        <p className="adaire-help-note">{__('All effects are off by default, purely decorative (aria-hidden), and respect reduced-motion settings.', 'saas-hero-block')}</p>
      </PanelBody>

      <PanelBody title={__('Ratings & Badges', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show ratings / app-store badges', 'saas-hero-block')} checked={!!a.showRatingBadges} onChange={set(setAttributes, 'showRatingBadges')} />
        {a.showRatingBadges && (
          <>
            <SelectControl
              label={__('Alignment', 'saas-hero-block')}
              value={a.ratingBadgesAlignment || 'center'}
              options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
              onChange={set(setAttributes, 'ratingBadgesAlignment')}
            />
            <RepeaterField
              items={a.ratingBadges}
              onChange={(items) => setAttributes({ ratingBadges: items })}
              addLabel={__('Add badge', 'saas-hero-block')}
              newItem={{ icon: 'bi bi-star-fill', imageUrl: '', text: '5.0/5', subtext: __('Reviews', 'saas-hero-block') }}
              renderItem={(item, update, idx) => (
                <>
                  <BaseControl label={__('Icon', 'saas-hero-block')} __nextHasNoMarginBottom>
                    <Button
                      variant="secondary"
                      onClick={() => setRatingIconPickerIndex(idx)}
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
                      disabled={!!item.imageUrl}
                    >
                      <i className={resolveRatingIcon(item)} style={{ marginRight: '8px' }} aria-hidden="true" />
                      {item.imageUrl ? __('Using uploaded image below', 'saas-hero-block') : __('Choose icon', 'saas-hero-block')}
                    </Button>
                  </BaseControl>
                  <div className="adaire-repeater__media-row">
                    {media(__('badge image', 'saas-hero-block'), item.imageUrl, (url) => update({ imageUrl: url }))}
                    {item.imageUrl && (
                      <Button variant="tertiary" isDestructive size="small" onClick={() => update({ imageUrl: '' })}>
                        {__('Remove image (use icon instead)', 'saas-hero-block')}
                      </Button>
                    )}
                  </div>
                  <p className="adaire-help-note">{__('An uploaded image, if set, replaces the icon for this badge.', 'saas-hero-block')}</p>
                  <TextControl label={__('Text', 'saas-hero-block')} value={item.text || ''} onChange={(v) => update({ text: v })} />
                  <TextControl label={__('Subtext', 'saas-hero-block')} value={item.subtext || ''} onChange={(v) => update({ subtext: v })} />
                </>
              )}
            />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('Security Panel', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show security / partner panel', 'saas-hero-block')} checked={!!a.showSecurityPanel} onChange={set(setAttributes, 'showSecurityPanel')} />
        {a.showSecurityPanel && (
          <>
            <TextControl label={__('Title', 'saas-hero-block')} value={a.securityPanelTitle || ''} onChange={set(setAttributes, 'securityPanelTitle')} />
            <TextControl label={__('Partner name', 'saas-hero-block')} value={a.securityPanelPartnerName || ''} onChange={set(setAttributes, 'securityPanelPartnerName')} />
            <TextareaControl label={__('Description', 'saas-hero-block')} value={a.securityPanelText || ''} onChange={set(setAttributes, 'securityPanelText')} />
            <RepeaterField
              items={a.securityFeatures}
              onChange={(items) => setAttributes({ securityFeatures: items })}
              addLabel={__('Add feature', 'saas-hero-block')}
              newItem={{ icon: 'bi bi-check-circle-fill', imageUrl: '', title: __('New feature', 'saas-hero-block'), text: '' }}
              renderItem={(item, update, idx) => (
                <>
                  <BaseControl label={__('Icon', 'saas-hero-block')} __nextHasNoMarginBottom>
                    <Button
                      variant="secondary"
                      onClick={() => setSecurityIconPickerIndex(idx)}
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
                      disabled={!!item.imageUrl}
                    >
                      <i className={resolveFeatureIcon(item)} style={{ marginRight: '8px' }} aria-hidden="true" />
                      {item.imageUrl ? __('Using uploaded image below', 'saas-hero-block') : __('Choose icon', 'saas-hero-block')}
                    </Button>
                  </BaseControl>
                  <div className="adaire-repeater__media-row">
                    {media(__('badge image', 'saas-hero-block'), item.imageUrl, (url) => update({ imageUrl: url }))}
                    {item.imageUrl && (
                      <Button variant="tertiary" isDestructive size="small" onClick={() => update({ imageUrl: '' })}>
                        {__('Remove image (use icon instead)', 'saas-hero-block')}
                      </Button>
                    )}
                  </div>
                  <p className="adaire-help-note">{__('An uploaded image, if set, replaces the icon for this feature.', 'saas-hero-block')}</p>
                  <TextControl label={__('Title', 'saas-hero-block')} value={item.title || ''} onChange={(v) => update({ title: v })} />
                  <TextareaControl label={__('Text', 'saas-hero-block')} value={item.text || ''} onChange={(v) => update({ text: v })} />
                </>
              )}
            />
          </>
        )}
      </PanelBody>

      <PanelBody title={__('FAQ', 'saas-hero-block')} initialOpen={false}>
        <ToggleControl label={__('Show FAQ accordion', 'saas-hero-block')} checked={!!a.showFaq} onChange={set(setAttributes, 'showFaq')} />
        {a.showFaq && (
          <>
            <TextControl label={__('Title', 'saas-hero-block')} value={a.faqTitle || ''} onChange={set(setAttributes, 'faqTitle')} />
            <ToggleControl label={__('First question open by default', 'saas-hero-block')} checked={a.faqOpenFirst !== false} onChange={set(setAttributes, 'faqOpenFirst')} />
            <RepeaterField
              items={a.faqItems}
              onChange={(items) => setAttributes({ faqItems: items })}
              addLabel={__('Add question', 'saas-hero-block')}
              newItem={{ question: __('New question', 'saas-hero-block'), answer: '' }}
              renderItem={(item, update) => (
                <>
                  <TextControl label={__('Question', 'saas-hero-block')} value={item.question || ''} onChange={(v) => update({ question: v })} />
                  <TextareaControl label={__('Answer', 'saas-hero-block')} value={item.answer || ''} onChange={(v) => update({ answer: v })} />
                </>
              )}
            />
          </>
        )}
      </PanelBody>

      {/* ── Style tab (auto-routed by InspectorTabs via title keywords) ── */}
      <PanelBody title={__('Background', 'saas-hero-block')} initialOpen={false}>
        {backgroundControls}
      </PanelBody>

      <PanelBody title={__('Colors & Typography', 'saas-hero-block')} initialOpen={false}>
        {colorTypographyControls}
      </PanelBody>

      <PanelBody title={__('Headline Gradient Colors', 'saas-hero-block')} initialOpen={false}>
        <AdaireColorControl label={__('Gradient Start', 'saas-hero-block')} value={a.gradientStart} onChange={(v) => setAttributes({ gradientStart: v || '#6366f1' })} />
        <AdaireColorControl label={__('Gradient End', 'saas-hero-block')} value={a.gradientEnd} onChange={(v) => setAttributes({ gradientEnd: v || '#8b5cf6' })} />
      </PanelBody>

      <PanelBody title={__('Top Pill Colors', 'saas-hero-block')} initialOpen={false}>
        <AdaireColorControl label={__('Pill Background', 'saas-hero-block')} value={a.pillBg} onChange={(v) => setAttributes({ pillBg: v || '#dbeafe' })} />
        <AdaireColorControl label={__('Pill Text Color', 'saas-hero-block')} value={a.pillColor} onChange={(v) => setAttributes({ pillColor: v || '#1e40af' })} />
      </PanelBody>

      <PanelBody title={__('CTA Colors & Hover', 'saas-hero-block')} initialOpen={false}>
        {ctaStyleControls}
      </PanelBody>

      <PanelBody title={__('CTA Spacing & Alignment', 'saas-hero-block')} initialOpen={false}>
        {ctaSpacingControls}
      </PanelBody>

      <PanelBody title={__('Media Shadow & Spacing', 'saas-hero-block')} initialOpen={false}>
        {mediaControls}
      </PanelBody>

      <PanelBody title={__('Trusted By Spacing & Styling', 'saas-hero-block')} initialOpen={false}>
        {trustStyleControls}
      </PanelBody>

      <PanelBody title={__('Security Panel Colors', 'saas-hero-block')} initialOpen={false}>
        <AdaireColorControl label={__('Panel background', 'saas-hero-block')} value={a.securityPanelBg} onChange={(v) => setAttributes({ securityPanelBg: v || '#f8fafc' })} />
        <AdaireColorControl label={__('Panel text color', 'saas-hero-block')} value={a.securityPanelTextColor} onChange={(v) => setAttributes({ securityPanelTextColor: v || '#111827' })} />
      </PanelBody>

      <PanelBody title={__('Global Spacing & Radius', 'saas-hero-block')} initialOpen={false}>
        {spacingControls}
      </PanelBody>
    </InspectorTabs>

    <BootstrapIconPicker
      isOpen={ratingIconPickerIndex !== null}
      onClose={() => setRatingIconPickerIndex(null)}
      onSelect={(iconClass) => {
        if (ratingIconPickerIndex !== null) {
          const next = (a.ratingBadges || []).slice();
          next[ratingIconPickerIndex] = { ...next[ratingIconPickerIndex], icon: iconClass };
          setAttributes({ ratingBadges: next });
        }
      }}
      currentIcon={ratingIconPickerIndex !== null ? (a.ratingBadges || [])[ratingIconPickerIndex]?.icon : ''}
    />

    <BootstrapIconPicker
      isOpen={securityIconPickerIndex !== null}
      onClose={() => setSecurityIconPickerIndex(null)}
      onSelect={(iconClass) => {
        if (securityIconPickerIndex !== null) {
          const next = (a.securityFeatures || []).slice();
          next[securityIconPickerIndex] = { ...next[securityIconPickerIndex], icon: iconClass };
          setAttributes({ securityFeatures: next });
        }
      }}
      currentIcon={securityIconPickerIndex !== null ? (a.securityFeatures || [])[securityIconPickerIndex]?.icon : ''}
    />

    <section {...blockProps}>
      {a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" />}
      {a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" />}
      {a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" />}
      {a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" />}
      {a.effectAbstractShapes && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
          <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
        </div>
      )}
      {a.effectFloatingElements && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
          <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
        </div>
      )}
      {a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" />}

      <QuickZone
        id="saas-hero-section"
        label={__('Section', 'saas-hero-block')}
        activeZone={activeZone}
        setActiveZone={setActiveZone}
        content={(
          <>
            <p className="adaire-qz-subhead">{__('Layout', 'saas-hero-block')}</p>
            {layoutControls}
            <p className="adaire-qz-subhead">{__('Background', 'saas-hero-block')}</p>
            {backgroundControls}
            <p className="adaire-qz-subhead">{__('Colors & Typography', 'saas-hero-block')}</p>
            {colorTypographyControls}
            <p className="adaire-qz-subhead">{__('Spacing', 'saas-hero-block')}</p>
            {spacingControls}
          </>
        )}
      >
        <div className="adaire-saas-hero__container">
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

          {a.showRatingBadges && (
            <QuickZone
              id="saas-hero-ratings"
              label={__('Ratings', 'saas-hero-block')}
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={(
                <SelectControl
                  label={__('Alignment', 'saas-hero-block')}
                  value={a.ratingBadgesAlignment || 'center'}
                  options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
                  onChange={set(setAttributes, 'ratingBadgesAlignment')}
                />
              )}
            >
              <div className="adaire-saas-hero__ratings">
                {(a.ratingBadges || []).map((badge, i) => <RatingBadgeView key={i} badge={badge} />)}
              </div>
            </QuickZone>
          )}

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

              <QuickZone
                id="saas-hero-cta"
                label={__('CTA', 'saas-hero-block')}
                activeZone={activeZone}
                setActiveZone={setActiveZone}
                content={(
                  <>
                    <p className="adaire-qz-subhead">{__('Colors', 'saas-hero-block')}</p>
                    {ctaStyleControls}
                    <p className="adaire-qz-subhead">{__('Spacing & Alignment', 'saas-hero-block')}</p>
                    {ctaSpacingControls}
                  </>
                )}
              >
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
                      <input type="email" placeholder={a.emailPlaceholder || 'Enter your email'} readOnly />
                      <button type="button">{a.submitButtonText || 'Get Started'}</button>
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
              </QuickZone>
            </div>

            {a.showHeroImage && a.heroImageUrl && (
              <QuickZone
                id="saas-hero-media"
                label={__('Media', 'saas-hero-block')}
                activeZone={activeZone}
                setActiveZone={setActiveZone}
                content={mediaControls}
              >
                <div className={`adaire-saas-hero__media adaire-saas-hero__media--${a.imagePosition || 'below'}`}>
                  <img src={a.heroImageUrl} alt="Hero" />
                </div>
              </QuickZone>
            )}
          </div>

          {a.showTrustBar && (
            <QuickZone
              id="saas-hero-trust"
              label={__('Trusted By', 'saas-hero-block')}
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={trustStyleControls}
            >
              <div className={`adaire-saas-hero__trust-bar trust-layout-${a.trustLayout || 'row'} ${a.trustCarousel ? 'is-carousel' : ''} ${a.trustCarousel && a.trustCarouselAutoplay === false ? 'is-autoplay-off' : ''} ${a.trustCarousel && a.trustCarouselPauseOnHover === false ? '' : 'is-pause-on-hover'}`}>
                <RichText tagName="p" className="adaire-saas-hero__trust-title" value={a.trustBarTitle} onChange={set(setAttributes, 'trustBarTitle')} />
                <div className="adaire-saas-hero__trust-logos-wrap">
                  <div className="adaire-saas-hero__trust-logos">
                    {(trustItemsResolved || []).map((item, i) => <TrustLogo key={i} item={item} />)}
                  </div>
                  {a.trustCarousel && (
                    <div className="adaire-saas-hero__trust-logos adaire-saas-hero__trust-logos--clone" aria-hidden="true">
                      {(trustItemsResolved || []).map((item, i) => <TrustLogo key={`clone-${i}`} item={item} />)}
                    </div>
                  )}
                </div>
              </div>
            </QuickZone>
          )}

          {a.showSecurityPanel && (
            <QuickZone
              id="saas-hero-security"
              label={__('Security Panel', 'saas-hero-block')}
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={(
                <>
                  <AdaireColorControl label={__('Panel background', 'saas-hero-block')} value={a.securityPanelBg} onChange={(v) => setAttributes({ securityPanelBg: v || '#f8fafc' })} />
                  <AdaireColorControl label={__('Panel text color', 'saas-hero-block')} value={a.securityPanelTextColor} onChange={(v) => setAttributes({ securityPanelTextColor: v || '#111827' })} />
                </>
              )}
            >
              <div className="adaire-saas-hero__security">
                <h3 className="adaire-saas-hero__security-title">
                  {a.securityPanelTitle}{a.securityPanelPartnerName ? ` ${a.securityPanelPartnerName}` : ''}
                </h3>
                {a.securityPanelText && <p className="adaire-saas-hero__security-text">{a.securityPanelText}</p>}
                <div className="adaire-saas-hero__security-grid">
                  {(a.securityFeatures || []).map((feature, i) => <SecurityFeatureView key={i} feature={feature} />)}
                </div>
              </div>
            </QuickZone>
          )}

          {a.showFaq && (
            <QuickZone
              id="saas-hero-faq"
              label={__('FAQ', 'saas-hero-block')}
              activeZone={activeZone}
              setActiveZone={setActiveZone}
              content={<TextControl label={__('Title', 'saas-hero-block')} value={a.faqTitle || ''} onChange={set(setAttributes, 'faqTitle')} />}
            >
              <div className="adaire-saas-hero__faq">
                <h3 className="adaire-saas-hero__faq-title">{a.faqTitle}</h3>
                <div className="adaire-saas-hero__faq-list">
                  {(a.faqItems || []).map((item, i) => <FaqItemView key={i} item={item} defaultOpen={a.faqOpenFirst !== false && i === 0} />)}
                </div>
              </div>
            </QuickZone>
          )}
        </div>
      </QuickZone>
    </section>
  </>);
}
