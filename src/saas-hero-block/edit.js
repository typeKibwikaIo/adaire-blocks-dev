import { MediaUpload, MediaUploadCheck, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { BaseControl, Button, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, __experimentalBoxControl as BoxControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import { PANEL, LABEL } from '../components/inspector-vocabulary';
import BootstrapIconPicker from './BootstrapIconPicker';
import DeviceSwitcher, { BreakpointNote, THREE_TIERS } from '../components/DeviceSwitcher';
import useEditorDevice, { hasCanvasPreset } from '../components/useEditorDevice';
import {
  getStyleVars,
  getBgTypeClass,
  resolveSentinel,
  buildPresetPatch,
  resolveRatingIcon,
  RatingBadgeView,
} from './shared';

const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });
const media = (label, value, onChange, allowedTypes = ['image']) => <MediaUploadCheck><MediaUpload allowedTypes={allowedTypes} value={value} onSelect={(m) => onChange(m.url)} render={({ open }) => <Button variant="secondary" onClick={open}>{value ? __('Change ', 'adaire-blocks') : __('Select ', 'adaire-blocks')}{label}</Button>} /></MediaUploadCheck>;

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
  { label: __('None', 'adaire-blocks'), value: 'none' },
  { label: __('Uppercase', 'adaire-blocks'), value: 'uppercase' },
  { label: __('Lowercase', 'adaire-blocks'), value: 'lowercase' },
  { label: __('Capitalize', 'adaire-blocks'), value: 'capitalize' },
];

const FONT_WEIGHT_OPTIONS = [
  { label: __('Thin (100)', 'adaire-blocks'), value: '100' },
  { label: __('Extra Light (200)', 'adaire-blocks'), value: '200' },
  { label: __('Light (300)', 'adaire-blocks'), value: '300' },
  { label: __('Normal (400)', 'adaire-blocks'), value: '400' },
  { label: __('Medium (500)', 'adaire-blocks'), value: '500' },
  { label: __('Semi Bold (600)', 'adaire-blocks'), value: '600' },
  { label: __('Bold (700)', 'adaire-blocks'), value: '700' },
  { label: __('Extra Bold (800)', 'adaire-blocks'), value: '800' },
  { label: __('Black (900)', 'adaire-blocks'), value: '900' },
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
          label={__('Font size', 'adaire-blocks')}
          value={a[`${prefix}FontSize`] || ''}
          onChange={set(setAttributes, `${prefix}FontSize`)}
        />
      )}
      <SelectControl
        label={__('Font weight', 'adaire-blocks')}
        value={a[`${prefix}FontWeight`] || '400'}
        options={FONT_WEIGHT_OPTIONS}
        onChange={set(setAttributes, `${prefix}FontWeight`)}
      />
      <UnitControl
        label={__('Line height', 'adaire-blocks')}
        value={a[`${prefix}LineHeight`] || ''}
        onChange={set(setAttributes, `${prefix}LineHeight`)}
      />
      <UnitControl
        label={__('Letter spacing', 'adaire-blocks')}
        value={a[`${prefix}LetterSpacing`] || ''}
        onChange={set(setAttributes, `${prefix}LetterSpacing`)}
      />
      <SelectControl
        label={__('Text transform', 'adaire-blocks')}
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
            <Button variant="tertiary" size="small" isDestructive onClick={() => remove(i)}>{__('Remove', 'adaire-blocks')}</Button>
          </div>
          {renderItem(item, (patch) => update(i, patch), i)}
        </div>
      ))}
      <Button variant="secondary" onClick={add}>{addLabel}</Button>
    </div>
  );
}

export default function Edit({ attributes, setAttributes, isSelected }) {
  const [activeZone, setActiveZone] = useState(null);
  const [ratingIconPickerIndex, setRatingIconPickerIndex] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  useEditorDevice(deviceType, setDeviceType);
  const a = attributes;
  const responsivePadding = a.responsivePadding || {};
  const updateResponsive = (attrName, value) => setAttributes({
    [attrName]: { ...(a[attrName] || {}), [deviceType]: value },
  });

  const blockProps = useBlockProps({
    className: [
      'adaire-saas-hero',
      `layout-${a.layoutStyle || 'centered'}`,
      getBgTypeClass(a),
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
        label={__('Background type', 'adaire-blocks')}
        value={a.backgroundType || 'solid'}
        options={[
          { label: __('Solid color', 'adaire-blocks'), value: 'solid' },
          { label: __('Gradient', 'adaire-blocks'), value: 'gradient' },
          { label: __('Image', 'adaire-blocks'), value: 'image' },
        ]}
        onChange={set(setAttributes, 'backgroundType')}
      />
      {(a.backgroundType || 'solid') === 'solid' && (
        <AdaireColorControl label={__('Background color', 'adaire-blocks')} value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#ffffff' })} />
      )}
      {a.backgroundType === 'gradient' && (
        <TextControl
          label={__('Gradient CSS', 'adaire-blocks')}
          value={a.backgroundGradient || ''}
          onChange={set(setAttributes, 'backgroundGradient')}
          help={__('e.g. linear-gradient(135deg, #6366f1, #8b5cf6)', 'adaire-blocks')}
        />
      )}
      {a.backgroundType === 'image' && (
        <>
          {media(__('background image', 'adaire-blocks'), a.backgroundImage, (v) => setAttributes({ backgroundImage: v }))}
          {a.backgroundImage && <Button variant="link" isDestructive onClick={() => setAttributes({ backgroundImage: '' })}>{__('Remove image', 'adaire-blocks')}</Button>}
          <SelectControl
            label={__('Image size', 'adaire-blocks')}
            value={a.backgroundImageSize || 'cover'}
            options={[{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' }]}
            onChange={set(setAttributes, 'backgroundImageSize')}
          />
          <SelectControl
            label={__('Image position', 'adaire-blocks')}
            value={a.backgroundImagePosition || 'center'}
            options={[{ label: 'Center', value: 'center' }, { label: 'Top', value: 'top' }, { label: 'Bottom', value: 'bottom' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
            onChange={set(setAttributes, 'backgroundImagePosition')}
          />
        </>
      )}
    </>
  );

  // The colour and typography halves are separate groups because the spec puts
  // them in separate Style panels (§6.5: colour before typography). The QuickZone
  // popover still renders both together, so nothing changes on canvas.
  const colorControls = (
    <>
      <AdaireColorControl label={__('Accent color', 'adaire-blocks')} value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#6366f1' })} />
      <AdaireColorControl label={__('Text color', 'adaire-blocks')} value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#111827' })} />
      <AdaireColorControl label={__('Gradient Start', 'adaire-blocks')} value={a.gradientStart} onChange={(v) => setAttributes({ gradientStart: v || '#6366f1' })} />
      <AdaireColorControl label={__('Gradient End', 'adaire-blocks')} value={a.gradientEnd} onChange={(v) => setAttributes({ gradientEnd: v || '#8b5cf6' })} />
      <AdaireColorControl label={__('Pill Background', 'adaire-blocks')} value={a.pillBg} onChange={(v) => setAttributes({ pillBg: v || '#dbeafe' })} />
      <AdaireColorControl label={__('Pill Text Color', 'adaire-blocks')} value={a.pillColor} onChange={(v) => setAttributes({ pillColor: v || '#1e40af' })} />
    </>
  );

  const typographyControls = (
    <>
      <RangeControl label={ LABEL.FONT_SIZE } value={a.fontSize || 16} onChange={set(setAttributes, 'fontSize')} min={10} max={80} />

      <SelectControl
        label={ LABEL.FONT_FAMILY }
        value={a.fontFamily || ''}
        options={FONT_FAMILY_OPTIONS}
        onChange={set(setAttributes, 'fontFamily')}
        help={__('Applies to all text in this block.', 'adaire-blocks')}
      />

      <TypographySubsection title={__('Eyebrow', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="eyebrow" />
      <TypographySubsection title={__('Heading', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="heading" />
      <TypographySubsection title={__('Body text', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="bodyText" hasFontSize={false} />
      <TypographySubsection title={__('Pill', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="pill" />
      <TypographySubsection title={__('Button', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="button" />
      <TypographySubsection title={__('Micro copy', 'adaire-blocks')} a={a} setAttributes={setAttributes} prefix="microCopy" />
    </>
  );

  // Section padding and the radius beside it are both Style (spec §4).
  const sectionSpacingControls = (
    <>
      <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
      <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
      {!hasCanvasPreset(deviceType) && (
        <p className="components-base-control__help">{__('This breakpoint has no matching canvas preview width — the editor canvas will not resize to match while you edit it.', 'adaire-blocks')}</p>
      )}
      <RangeControl
        label={ LABEL.PADDING }
        value={responsivePadding[deviceType] ?? responsivePadding.desktop ?? a.padding ?? 80}
        onChange={(v) => updateResponsive('responsivePadding', v)}
        min={0}
        max={200}
      />
      <BoxControl
        label={ LABEL.MARGIN }
        values={a.margin}
        onChange={(v) => setAttributes({ margin: v })}
      />
    </>
  );

  const radiusControls = (
    <RangeControl label={__('Global Border Radius', 'adaire-blocks')} value={a.borderRadius || 12} onChange={set(setAttributes, 'borderRadius')} min={0} max={50} />
  );

  const structureControls = (
    <SelectControl
      label={__('Layout Style', 'adaire-blocks')}
      value={a.layoutStyle || 'centered'}
      options={[
        { label: __('Centered', 'adaire-blocks'), value: 'centered' },
        { label: __('Split Layout (Left)', 'adaire-blocks'), value: 'split-left' },
        { label: __('Split Layout (Right)', 'adaire-blocks'), value: 'split-right' },
      ]}
      onChange={set(setAttributes, 'layoutStyle')}
    />
  );

  const ctaStyleControls = (
    <>
      <AdaireColorControl label={__('Primary button color', 'adaire-blocks')} value={a.buttonPrimaryColor} onChange={(v) => setAttributes({ buttonPrimaryColor: v })} />
      <AdaireColorControl label={__('Primary button background', 'adaire-blocks')} value={a.buttonPrimaryBg} onChange={(v) => setAttributes({ buttonPrimaryBg: v })} />
      <AdaireColorControl label={__('Secondary button color', 'adaire-blocks')} value={a.buttonSecondaryColor} onChange={(v) => setAttributes({ buttonSecondaryColor: v })} />
      <AdaireColorControl label={__('Secondary button background', 'adaire-blocks')} value={a.buttonSecondaryBg} onChange={(v) => setAttributes({ buttonSecondaryBg: v })} />
      <AdaireColorControl label={__('Hover text color', 'adaire-blocks')} value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v })} />
      <AdaireColorControl label={__('Hover background color', 'adaire-blocks')} value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v })} />
      <AdaireColorControl label={__('Hover border color', 'adaire-blocks')} value={a.buttonHoverBorderColor} onChange={(v) => setAttributes({ buttonHoverBorderColor: v })} />
    </>
  );

  const ctaAlignmentControls = (
    <SelectControl
      label={ LABEL.ALIGNMENT }
      value={a.ctaAlignment || 'center'}
      options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
      onChange={set(setAttributes, 'ctaAlignment')}
    />
  );

  const ctaSpacingControls = (
    <>
      <RangeControl label={__('Gap Between Buttons', 'adaire-blocks')} value={a.ctaGap ?? 16} onChange={set(setAttributes, 'ctaGap')} min={0} max={60} />
      <RangeControl label={__('Button Padding (Vertical)', 'adaire-blocks')} value={a.ctaPaddingV ?? 14} onChange={set(setAttributes, 'ctaPaddingV')} min={0} max={40} />
      <RangeControl label={__('Button Padding (Horizontal)', 'adaire-blocks')} value={a.ctaPaddingH ?? 32} onChange={set(setAttributes, 'ctaPaddingH')} min={0} max={80} />
      <RangeControl label={__('Spacing Above Image', 'adaire-blocks')} value={a.mediaSpacing ?? 48} onChange={set(setAttributes, 'mediaSpacing')} min={0} max={120} />
    </>
  );

  const borderControls = (
    <>
      { radiusControls }
      <RangeControl
        label={__('Button Border Radius', 'adaire-blocks')}
        value={resolveSentinel(a.ctaBorderRadius, a.borderRadius ?? 12)}
        onChange={set(setAttributes, 'ctaBorderRadius')}
        min={0}
        max={50}
        help={__('Defaults to the global border radius until changed here.', 'adaire-blocks')}
      />
      <RangeControl
        label={__('Image Border Radius', 'adaire-blocks')}
        value={resolveSentinel(a.mediaBorderRadius, a.borderRadius ?? 12)}
        onChange={set(setAttributes, 'mediaBorderRadius')}
        min={0}
        max={60}
      />
    </>
  );

  // The on-canvas Media QuickZone keeps offering all three media treatments
  // together, even though the Inspector now files them under Effects, Border
  // and Spacing respectively.
  const mediaControls = (
    <>
      <ToggleControl label={__('Drop shadow', 'adaire-blocks')} checked={a.mediaShadow !== false} onChange={set(setAttributes, 'mediaShadow')} />
      <RangeControl
        label={__('Image Border Radius', 'adaire-blocks')}
        value={resolveSentinel(a.mediaBorderRadius, a.borderRadius ?? 12)}
        onChange={set(setAttributes, 'mediaBorderRadius')}
        min={0}
        max={60}
      />
      <RangeControl label={__('Spacing Above Image', 'adaire-blocks')} value={a.mediaSpacing ?? 48} onChange={set(setAttributes, 'mediaSpacing')} min={0} max={120} />
    </>
  );

  const mediaShadowControls = (
    <ToggleControl label={__('Drop shadow', 'adaire-blocks')} checked={a.mediaShadow !== false} onChange={set(setAttributes, 'mediaShadow')} />
  );

  return (<>
    <InspectorTabs attributes={a} setAttributes={setAttributes}>
      {/* Content: what the hero says and shows. */}
      <PanelBody section="content" title={ PANEL.CONTENT } initialOpen={true}>
        {a.showPill && <TextControl label={__('Pill Text', 'adaire-blocks')} value={a.pillText || ''} onChange={set(setAttributes, 'pillText')} />}

        {a.showCta !== false && (
        <>
        <SelectControl
          label={__('CTA Type', 'adaire-blocks')}
          value={a.ctaType || 'dual-buttons'}
          options={[
            { label: __('Dual Buttons', 'adaire-blocks'), value: 'dual-buttons' },
            { label: __('Single Button', 'adaire-blocks'), value: 'single-button' },
          ]}
          onChange={set(setAttributes, 'ctaType')}
        />
        {a.ctaType === 'dual-buttons' && (
          <>
            <TextControl label={__('Primary Button Text', 'adaire-blocks')} value={a.primaryButtonText || ''} onChange={set(setAttributes, 'primaryButtonText')} />
            <URLInput label={__('Primary Button URL', 'adaire-blocks')} value={a.primaryButtonUrl || ''} onChange={set(setAttributes, 'primaryButtonUrl')} />
            <TextControl label={__('Secondary Button Text', 'adaire-blocks')} value={a.secondaryButtonText || ''} onChange={set(setAttributes, 'secondaryButtonText')} />
            <URLInput label={__('Secondary Button URL', 'adaire-blocks')} value={a.secondaryButtonUrl || ''} onChange={set(setAttributes, 'secondaryButtonUrl')} />
          </>
        )}
        {a.ctaType === 'single-button' && (
          <>
            <TextControl label={__('Button Text', 'adaire-blocks')} value={a.singleButtonText || ''} onChange={set(setAttributes, 'singleButtonText')} />
            <URLInput label={__('Button URL', 'adaire-blocks')} value={a.singleButtonUrl || ''} onChange={set(setAttributes, 'singleButtonUrl')} />
            <TextControl label={__('Micro-copy Link', 'adaire-blocks')} value={a.microCopy || ''} onChange={set(setAttributes, 'microCopy')} />
          </>
        )}
        <p className="adaire-help-note">{__('Clearing a button’s text hides just that button — useful for showing only one of the two.', 'adaire-blocks')}</p>
        </>
        )}
      </PanelBody>

      <PanelBody section="content" title={ PANEL.MEDIA } initialOpen={false}>
        {! a.showHeroImage && (
          <p className="adaire-help-note">
            {__('This image is hidden on the front end. Turn on "Show Hero Image" in Layout > Structure to display it.', 'adaire-blocks')}
          </p>
        )}
        {media(__('Hero Image', 'adaire-blocks'), a.heroImageUrl, (v) => setAttributes({ heroImageUrl: v }))}
      </PanelBody>

      {/*
        The badge list is editable whether or not the block is currently showing
        it. Gating the content behind the Layout toggle meant this panel rendered
        empty, so there was no way to set the badges up before turning them on —
        and no hint that the toggle was what was missing.
      */}
      <PanelBody section="content" title={ PANEL.BADGES } initialOpen={false}>
        {! a.showRatingBadges && (
          <p className="adaire-help-note">
            {__('These badges are hidden on the front end. Turn on "Show Ratings & Badges" in Layout > Structure to display them.', 'adaire-blocks')}
          </p>
        )}

        <RepeaterField
          items={a.ratingBadges}
              onChange={(items) => setAttributes({ ratingBadges: items })}
              addLabel={__('Add badge', 'adaire-blocks')}
              newItem={{ icon: 'bi bi-star-fill', imageUrl: '', text: '5.0/5', subtext: __('Reviews', 'adaire-blocks') }}
              renderItem={(item, update, idx) => (
                <>
                  <BaseControl label={__('Icon', 'adaire-blocks')} __nextHasNoMarginBottom>
                    <Button
                      variant="secondary"
                      onClick={() => setRatingIconPickerIndex(idx)}
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
                      disabled={!!item.imageUrl}
                    >
                      <i className={resolveRatingIcon(item)} style={{ marginRight: '8px' }} aria-hidden="true" />
                      {item.imageUrl ? __('Using uploaded image below', 'adaire-blocks') : __('Choose icon', 'adaire-blocks')}
                    </Button>
                  </BaseControl>
                  <div className="adaire-repeater__media-row">
                    {media(__('badge image', 'adaire-blocks'), item.imageUrl, (url) => update({ imageUrl: url }))}
                    {item.imageUrl && (
                      <Button variant="tertiary" isDestructive size="small" onClick={() => update({ imageUrl: '' })}>
                        {__('Remove image (use icon instead)', 'adaire-blocks')}
                      </Button>
                    )}
                  </div>
                  <p className="adaire-help-note">{__('An uploaded image, if set, replaces the icon for this badge.', 'adaire-blocks')}</p>
                  <TextControl label={__('Text', 'adaire-blocks')} value={item.text || ''} onChange={(v) => update({ text: v })} />
                  <TextControl label={__('Subtext', 'adaire-blocks')} value={item.subtext || ''} onChange={(v) => update({ subtext: v })} />
                </>
              )}
        />
      </PanelBody>

      {/* Layout: structure, then alignment, then spacing (spec 6.5). */}
      <PanelBody section="layout" title={ PANEL.STRUCTURE } initialOpen={true}>
        {structureControls}

        {/*
          Show/hide toggles are Layout, not Content (spec 4) - switching one off
          removes the element from the DOM. The text and media they reveal stay
          in the Content tab.
        */}
        <ToggleControl label={__('Show Top Pill', 'adaire-blocks')} checked={a.showPill} onChange={set(setAttributes, 'showPill')} />
        <ToggleControl
          label={__('Show Call to Action', 'adaire-blocks')}
          checked={a.showCta !== false}
          onChange={set(setAttributes, 'showCta')}
          help={__('Turn off to hide the buttons / email form entirely.', 'adaire-blocks')}
        />
        <ToggleControl label={__('Show Hero Image', 'adaire-blocks')} checked={a.showHeroImage} onChange={set(setAttributes, 'showHeroImage')} />
        <ToggleControl label={__('Show Ratings & Badges', 'adaire-blocks')} checked={!!a.showRatingBadges} onChange={set(setAttributes, 'showRatingBadges')} />

        {/* Split layouts already imply left/right image position via the Layout
            Style control above - showing a second position control here would
            just duplicate it, so it's only offered for the centered layout. */}
        {a.showHeroImage && (a.layoutStyle || 'centered') === 'centered' && (
          <SelectControl
            label={__('Image Position', 'adaire-blocks')}
            value={a.imagePosition || 'below'}
            options={[
              { label: __('Below Text', 'adaire-blocks'), value: 'below' },
              { label: __('Above Text', 'adaire-blocks'), value: 'above' },
            ]}
            onChange={set(setAttributes, 'imagePosition')}
          />
        )}

        {/*
          The decision to run a decoration at all adds or removes a DOM node, so
          the toggles are Layout; the colours and opacity that dress them are
          Style, over in the Effects panel (spec 4).
        */}

        <SelectControl
          label={__('Industry preset', 'adaire-blocks')}
          value={a.effectsPreset || 'none'}
          options={[
            { label: __('None', 'adaire-blocks'), value: 'none' },
            { label: __('Sports', 'adaire-blocks'), value: 'sports' },
            { label: __('Gym / Fitness', 'adaire-blocks'), value: 'gym' },
            { label: __('E-commerce', 'adaire-blocks'), value: 'ecommerce' },
            { label: __('Business', 'adaire-blocks'), value: 'business' },
            { label: __('Medical / Hospital', 'adaire-blocks'), value: 'medical' },
            { label: __('Gaming', 'adaire-blocks'), value: 'gaming' },
            { label: __('Custom', 'adaire-blocks'), value: 'custom' },
          ]}
          onChange={(v) => setAttributes(buildPresetPatch(v))}
          help={__('Presets just set the toggles below — tweak anything afterward.', 'adaire-blocks')}
        />
        <ToggleControl label={__('Dot pattern', 'adaire-blocks')} checked={!!a.effectDotPattern} onChange={set(setAttributes, 'effectDotPattern')} />
        <ToggleControl label={__('Gradient overlay', 'adaire-blocks')} checked={!!a.effectGradientOverlay} onChange={set(setAttributes, 'effectGradientOverlay')} />
        <ToggleControl label={__('Abstract shapes', 'adaire-blocks')} checked={!!a.effectAbstractShapes} onChange={set(setAttributes, 'effectAbstractShapes')} />
        <ToggleControl label={__('Glow', 'adaire-blocks')} checked={!!a.effectGlow} onChange={set(setAttributes, 'effectGlow')} />
        <ToggleControl label={__('Blur blob', 'adaire-blocks')} checked={!!a.effectBlur} onChange={set(setAttributes, 'effectBlur')} />
        <ToggleControl label={__('Floating elements', 'adaire-blocks')} checked={!!a.effectFloatingElements} onChange={set(setAttributes, 'effectFloatingElements')} />
        <ToggleControl label={__('Animated accents', 'adaire-blocks')} checked={!!a.effectAnimatedAccents} onChange={set(setAttributes, 'effectAnimatedAccents')} />
        <p className="adaire-help-note">{__('All effects are off by default, purely decorative (aria-hidden), and respect reduced-motion settings.', 'adaire-blocks')}</p>
      </PanelBody>

      <PanelBody section="layout" title={ PANEL.ALIGNMENT } initialOpen={false}>
        {a.showCta !== false && ctaAlignmentControls}
        {a.showRatingBadges && (
          <SelectControl
            label={__('Ratings & Badges Alignment', 'adaire-blocks')}
            value={a.ratingBadgesAlignment || 'center'}
            options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
            onChange={set(setAttributes, 'ratingBadgesAlignment')}
          />
        )}
      </PanelBody>

      <PanelBody section="style" title={ PANEL.SPACING } initialOpen={false}>
        {sectionSpacingControls}
        {ctaSpacingControls}
      </PanelBody>

      {/* Style: colour, then typography, then borders and effects. */}
      <PanelBody section="style" title={ PANEL.BACKGROUND } initialOpen={false}>
        {backgroundControls}
      </PanelBody>

      <PanelBody section="style" title={ PANEL.COLORS } initialOpen={false}>
        {colorControls}
        <ToggleControl label={__('Use Gradient on Headline', 'adaire-blocks')} checked={a.useGradientHeadline} onChange={set(setAttributes, 'useGradientHeadline')} />
        {ctaStyleControls}
      </PanelBody>

      <PanelBody section="style" title={ PANEL.TYPOGRAPHY } initialOpen={false}>
        {typographyControls}
      </PanelBody>

      <PanelBody section="style" title={ PANEL.BORDER } initialOpen={false}>
        {borderControls}
      </PanelBody>

      <PanelBody section="layout" title={ PANEL.EFFECTS } initialOpen={false}>
        {mediaShadowControls}
        {a.effectGradientOverlay && (
          <>
            <AdaireColorControl label={__('Overlay color 1', 'adaire-blocks')} value={a.effectGradientOverlayColor1} onChange={(v) => setAttributes({ effectGradientOverlayColor1: v })} />
            <AdaireColorControl label={__('Overlay color 2', 'adaire-blocks')} value={a.effectGradientOverlayColor2} onChange={(v) => setAttributes({ effectGradientOverlayColor2: v })} />
            <RangeControl label={__('Overlay opacity %', 'adaire-blocks')} value={a.effectGradientOverlayOpacity ?? 30} onChange={set(setAttributes, 'effectGradientOverlayOpacity')} min={0} max={100} />
          </>
        )}
        {a.effectGlow && <AdaireColorControl label={__('Glow color', 'adaire-blocks')} value={a.effectGlowColor} onChange={(v) => setAttributes({ effectGlowColor: v })} />}
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
        label={__('Section', 'adaire-blocks')}
        activeZone={activeZone}
        setActiveZone={setActiveZone}
        content={(
          <>
            <p className="adaire-qz-subhead">{__('Layout', 'adaire-blocks')}</p>
            {structureControls}
            <p className="adaire-qz-subhead">{__('Background', 'adaire-blocks')}</p>
            {backgroundControls}
            <p className="adaire-qz-subhead">{__('Colors & Typography', 'adaire-blocks')}</p>
            {colorControls}
            {typographyControls}
            <p className="adaire-qz-subhead">{__('Spacing', 'adaire-blocks')}</p>
            {sectionSpacingControls}
            {radiusControls}
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
              content={<TextControl label={__('Pill Text', 'adaire-blocks')} value={a.pillText} onChange={set(setAttributes, 'pillText')} />}
            >
              <div className="adaire-saas-hero__pill">
                <RichText tagName="span" value={a.pillText} onChange={set(setAttributes, 'pillText')} />
              </div>
            </QuickZone>
          )}

          {/*
            Rendered in the editor whether or not the badges are switched on, so
            there is something to click and edit. When they're off it's drawn
            dimmed and labelled, and save.js still emits nothing — the canvas
            says "hidden", it doesn't pretend the front end shows this.
          */}
          <QuickZone
            id="saas-hero-ratings"
            label={a.showRatingBadges ? __('Ratings', 'adaire-blocks') : __('Ratings (hidden)', 'adaire-blocks')}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
            content={(
              <>
                <ToggleControl
                  label={__('Show Ratings & Badges', 'adaire-blocks')}
                  checked={!!a.showRatingBadges}
                  onChange={set(setAttributes, 'showRatingBadges')}
                />
                <SelectControl
                  label={__('Alignment', 'adaire-blocks')}
                  value={a.ratingBadgesAlignment || 'center'}
                  options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
                  onChange={set(setAttributes, 'ratingBadgesAlignment')}
                />
              </>
            )}
          >
            <div
              className={`adaire-saas-hero__ratings${a.showRatingBadges ? '' : ' adaire-is-editor-hidden'}`}
              title={a.showRatingBadges ? undefined : __('Hidden on the front end', 'adaire-blocks')}
            >
              {(a.ratingBadges || []).map((badge, i) => <RatingBadgeView key={i} badge={badge} />)}
            </div>
          </QuickZone>

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              <QuickZone
                id="saas-hero-eyebrow"
                label="Eyebrow"
                activeZone={activeZone}
                setActiveZone={setActiveZone}
                content={<TextControl label={__('Eyebrow', 'adaire-blocks')} value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} />}
              >
                <RichText tagName="p" className="adaire-saas-hero__eyebrow" value={a.eyebrow} onChange={set(setAttributes, 'eyebrow')} />
              </QuickZone>

              <QuickZone
                id="saas-hero-heading"
                label="Heading"
                activeZone={activeZone}
                setActiveZone={setActiveZone}
                content={<TextControl label={__('Heading', 'adaire-blocks')} value={a.heading} onChange={set(setAttributes, 'heading')} />}
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
                content={<TextareaControl label={__('Text', 'adaire-blocks')} value={a.text} onChange={set(setAttributes, 'text')} />}
              >
                <RichText tagName="p" className="adaire-saas-hero__text" value={a.text} onChange={set(setAttributes, 'text')} />
              </QuickZone>

              {a.showCta !== false && (
                <QuickZone
                  id="saas-hero-cta"
                  label={__('CTA', 'adaire-blocks')}
                  activeZone={activeZone}
                  setActiveZone={setActiveZone}
                  content={(
                    <>
                      <ToggleControl
                        label={__('Show call to action', 'adaire-blocks')}
                        checked={a.showCta !== false}
                        onChange={set(setAttributes, 'showCta')}
                      />
                      <p className="adaire-qz-subhead">{__('Colors', 'adaire-blocks')}</p>
                      {ctaStyleControls}
                      <p className="adaire-qz-subhead">{__('Spacing & Alignment', 'adaire-blocks')}</p>
                      {ctaAlignmentControls}
                      {ctaSpacingControls}
                    </>
                  )}
                >
                  <div className="adaire-saas-hero__cta">
                    {a.ctaType === 'dual-buttons' && (
                      <>
                        {a.primaryButtonText && (
                          <a href={a.primaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                            {a.primaryButtonText}
                          </a>
                        )}
                        {a.secondaryButtonText && (
                          <a href={a.secondaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                            {a.secondaryButtonText}
                          </a>
                        )}
                      </>
                    )}
                    {a.ctaType === 'single-button' && (
                      <>
                        {a.singleButtonText && (
                          <a href={a.singleButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                            {a.singleButtonText}
                          </a>
                        )}
                        {a.microCopy && <p className="adaire-saas-hero__micro-copy">{a.microCopy}</p>}
                      </>
                    )}
                  </div>
                </QuickZone>
              )}
            </div>

            {a.showHeroImage && a.heroImageUrl && (
              <QuickZone
                id="saas-hero-media"
                label={__('Media', 'adaire-blocks')}
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

        </div>
      </QuickZone>
    </section>
  </>);
}
