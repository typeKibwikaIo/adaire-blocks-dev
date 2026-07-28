import { useBlockProps, PanelColorSettings, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, RangeControl, Button, TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { arrowUp, arrowDown } from '@wordpress/icons';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { THREE_TIERS } from '../components/DeviceSwitcher';
import AdaireColorControl from '../components/AdaireColorControl';

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return 'rgba(0, 0, 0, 1)';
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 'rgba(0, 0, 0, 1)';

  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(0, 0, 0, 1)';

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Resolve an image's size for a given tier, falling back through the cascade.
const getImageSize = (image, tier) => {
  if (tier === 'mobile') {
    return image?.mobileSize ?? image?.tabletSize ?? image?.desktopSize ?? 40;
  }
  if (tier === 'tablet') {
    return image?.tabletSize ?? image?.desktopSize ?? 40;
  }
  return image?.desktopSize ?? 40;
};

// Background collage — same deterministic scatter used in save.js, kept in
// sync so the editor preview matches the front end. Coordinates are a
// percentage of the intro-zone wrapper, not the whole section, so the
// collage stays visually confined to the intro area. See save.js for why
// the step multipliers are chosen the way they are.
const getBackgroundLayout = (index) => {
  const xBand = (index * 9) % 40;
  const x = xBand < 20 ? 10 + xBand : 70 + (xBand - 20);
  const y = 10 + ((index * 29) % 80);
  return { x, y };
};

const SHAPE_TYPES = [ 'circle', 'triangle', 'square' ];

// Decorative ambient shapes — same deterministic scatter used in save.js,
// kept in sync so the editor preview matches the front end. See save.js
// for why the step multipliers are chosen the way they are.
const getShapeLayout = (index, seed) => {
  const i = index + seed * 7;
  const xBand = (i * 9) % 40;
  const x = xBand < 20 ? 10 + xBand : 70 + (xBand - 20);
  const y = 15 + ((i * 29) % 70);
  return {
    x,
    y,
    type: SHAPE_TYPES[ i % 3 ],
    size: 20 + ((i * 13) % 40),
    duration: 18 + ((i * 7) % 12),
    delay: (i * 3) % 10,
  };
};

const renderShapes = ( seed, count, color ) => {
  const safeCount = typeof count === 'number' && count > 0 ? count : 0;
  const shapeColor = color || '#ffffff';
  return Array.from( { length: safeCount } ).map( ( _, index ) => {
    const shape = getShapeLayout( index, seed );
    return (
      <div
        key={ `shape-${ seed }-${ index }` }
        className={ `ad-particles-block__shape ad-particles-block__shape--${ shape.type }` }
        aria-hidden="true"
        style={ {
          position: 'absolute',
          left: `${ shape.x }%`,
          top: `${ shape.y }%`,
          width: `${ shape.size }px`,
          height: `${ shape.size }px`,
          // Circle/square are outlined via a plain CSS border (color set
          // here); a border can't follow a clip-path silhouette though, so
          // the triangle draws its own outline via an inner SVG stroke
          // instead — see the conditional child below.
          borderColor: shape.type !== 'triangle' ? shapeColor : undefined,
          pointerEvents: 'none',
          zIndex: 0,
          animationDuration: `${ shape.duration }s`,
          animationDelay: `${ shape.delay }s`,
        } }
      >
        { shape.type === 'triangle' && (
          <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
            <polygon points="50,6 6,94 94,94" fill="none" stroke={ shapeColor } strokeWidth="6" strokeLinejoin="round" />
          </svg>
        ) }
      </div>
    );
  } );
};

const DEFAULT_IMAGE = { url: '', desktopSize: 160, tabletSize: 120, mobileSize: 80, speed: 1 };

export default function Edit({ attributes, setAttributes }) {
  const {
    entryScrollHeight, backgroundColor, textColor, entries, gradientOverlay,
    textAnimationDuration, blockId, sectionIntroTitle, sectionIntroDescription,
    shapesEnabled, shapeCount, shapeColor,
  } = attributes;
  const safeEntries = Array.isArray(entries) ? entries : [];
  const [deviceType, setDeviceType] = useState('desktop');

  const blockProps = useBlockProps({
    className: 'ad-particles-block',
    style: {
      backgroundColor: backgroundColor || '#0a0a0a',
      position: 'relative',
      overflow: 'hidden'
    }
  });

  const updateEntry = (index, field, value) => {
    const newEntries = [...safeEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setAttributes({ entries: newEntries });
  };

  const updateEntryImage = (index, imageKey, field, value) => {
    const newEntries = [...safeEntries];
    newEntries[index] = {
      ...newEntries[index],
      [imageKey]: { ...(newEntries[index][imageKey] || {}), [field]: value }
    };
    setAttributes({ entries: newEntries });
  };

  const addEntry = () => {
    const newEntry = {
      id: Date.now(),
      title: 'New Entry',
      description: 'Add your description here.',
      backgroundImage: {
        ...DEFAULT_IMAGE,
        animationEnabled: true,
      },
      foregroundImage: {
        ...DEFAULT_IMAGE,
        desktopSize: 420,
        tabletSize: 300,
        mobileSize: 180,
        speed: 0,
      },
    };
    setAttributes({ entries: [...safeEntries, newEntry] });
  };

  const removeEntry = (index) => {
    setAttributes({ entries: safeEntries.filter((_, i) => i !== index) });
  };

  const reorderEntry = (fromIndex, toIndex) => {
    const newEntries = [...safeEntries];
    const [movedItem] = newEntries.splice(fromIndex, 1);
    newEntries.splice(toIndex, 0, movedItem);
    setAttributes({ entries: newEntries });
  };

  const titleStyle = {
    fontSize: attributes.titleFontSize ? `${attributes.titleFontSize}px` : undefined,
    fontFamily: attributes.titleFontFamily && attributes.titleFontFamily !== 'custom'
      ? attributes.titleFontFamily
      : attributes.titleFontFamilyCustom || undefined,
    fontWeight: attributes.titleFontWeight || 'normal',
    marginTop: attributes.titleMarginTop ? `${attributes.titleMarginTop}px` : undefined,
    marginBottom: attributes.titleMarginBottom ? `${attributes.titleMarginBottom}px` : undefined,
  };

  const textStyle = {
    fontSize: attributes.textFontSize ? `${attributes.textFontSize}px` : undefined,
    fontFamily: attributes.textFontFamily && attributes.textFontFamily !== 'custom'
      ? attributes.textFontFamily
      : attributes.textFontFamilyCustom || undefined,
    fontWeight: attributes.textFontWeight || 'normal',
    marginTop: attributes.textMarginTop ? `${attributes.textMarginTop}px` : undefined,
    marginBottom: attributes.textMarginBottom ? `${attributes.textMarginBottom}px` : undefined,
  };

  const FONT_FAMILIES = [
	{ label: 'Default', value: 'inherit' },
	{ label: 'Serif', value: 'serif' },
	{ label: 'Sans-serif', value: 'sans-serif' },
	{ label: 'Monospace', value: 'monospace' },
	{ label: 'Cursive', value: 'cursive' },
	{ label: 'Fantasy', value: 'fantasy' },
	{ label: 'System UI', value: 'system-ui' },
	{ label: 'Custom...', value: 'custom' },
];

  const GRADIENT_DIRECTIONS = [
    { label: 'To Right', value: 'to right' },
    { label: 'To Left', value: 'to left' },
    { label: 'To Bottom', value: 'to bottom' },
    { label: 'To Top', value: 'to top' },
    { label: 'To Bottom Right', value: 'to bottom right' },
    { label: 'To Bottom Left', value: 'to bottom left' },
    { label: 'To Top Right', value: 'to top right' },
    { label: 'To Top Left', value: 'to top left' },
    { label: 'Custom Angle', value: 'custom' },
  ];

  return (
    <>
      <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
        <PanelBody section="content" title="Section Intro" initialOpen={true}>
          <p style={{ fontSize: '12px', color: '#757575' }}>
            {__('A one-time heading/description that marks the transition from the background image collage to the scrolling entries below. Displays once, not per-entry.', 'adaire-blocks')}
          </p>
          <TextControl
            label="Title"
            value={sectionIntroTitle}
            onChange={(value) => setAttributes({ sectionIntroTitle: value })}
            placeholder="Enter section intro title..."
          />
          <TextControl
            label="Description"
            value={sectionIntroDescription}
            onChange={(value) => setAttributes({ sectionIntroDescription: value })}
            placeholder="Enter section intro description..."
          />
        </PanelBody>

        <PanelBody section="content" title="Entries" initialOpen={true}>
          <p style={{ fontSize: '12px', color: '#757575' }}>
            {__('Each entry pairs a background image, a foreground scroll-reveal image, and its own title/description. Entries automatically stack in order as you scroll — no manual positioning needed. Image pickers, sizes, and motion are in the Layout and Style tabs.', 'adaire-blocks')}
          </p>
          {safeEntries.map((entry, index) => (
            <div key={entry.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>Entry {index + 1}</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {index > 0 && (
                    <Button
                      icon={arrowUp}
                      onClick={() => reorderEntry(index, index - 1)}
                      isSmall
                      variant="secondary"
                      label={__('Move Up', 'adaire-blocks')}
                    />
                  )}
                  {index < safeEntries.length - 1 && (
                    <Button
                      icon={arrowDown}
                      onClick={() => reorderEntry(index, index + 1)}
                      isSmall
                      variant="secondary"
                      label={__('Move Down', 'adaire-blocks')}
                    />
                  )}
                </div>
              </div>

              <TextControl
                label="Title"
                value={entry.title}
                onChange={(value) => updateEntry(index, 'title', value)}
                placeholder="Enter title..."
              />

              <TextControl
                label="Description"
                value={entry.description}
                onChange={(value) => updateEntry(index, 'description', value)}
                placeholder="Enter description..."
              />

              <Button
                onClick={() => removeEntry(index)}
                isDestructive
                isSmall
                style={{ marginTop: '10px' }}
              >
                Remove Entry
              </Button>
            </div>
          ))}

          <Button onClick={addEntry} isPrimary>
            Add Entry
          </Button>
        </PanelBody>

        <PanelBody section="content" title="Block ID" initialOpen={false}>
          <TextControl
            label="Block ID"
            value={blockId}
            onChange={(value) => setAttributes({ blockId: value })}
            help="Add a custom ID to this block for CSS targeting or anchor links."
          />
        </PanelBody>

        <PanelBody section="layout" title="Section Settings" initialOpen={true}>
          <RangeControl
            label="Scroll Distance per Entry (vh)"
            help="How much the visitor scrolls through each entry before advancing to the next. Total section height is this Ã— the number of entries."
            value={entryScrollHeight}
            onChange={(value) => setAttributes({ entryScrollHeight: value })}
            min={50}
            max={400}
            step={10}
          />
        </PanelBody>

        <PanelBody section="layout" title="Entries — Size & Motion" initialOpen={false}>
          <DeviceSwitcher
            deviceType={deviceType}
            setDeviceType={setDeviceType}
            tiers={THREE_TIERS}
            label={__('Size', 'adaire-blocks')}
          />
          {safeEntries.map((entry, index) => {
            const sizeField = deviceType === 'desktop' ? 'desktopSize' : deviceType === 'tablet' ? 'tabletSize' : 'mobileSize';
            const sizeLabel = THREE_TIERS.find((t) => t.key === deviceType)?.label || 'Desktop';
            const bg = entry.backgroundImage || {};
            const fg = entry.foregroundImage || {};
            return (
              <div key={entry.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px' }}>Entry {index + 1}</h4>

                <p style={{ fontWeight: 600, margin: '0 0 6px' }}>{__('Background Image', 'adaire-blocks')}</p>
                <RangeControl
                  label={`Size (px) - ${sizeLabel}`}
                  value={getImageSize(bg, deviceType)}
                  onChange={(value) => updateEntryImage(index, 'backgroundImage', sizeField, value)}
                  min={10}
                  max={800}
                  step={5}
                />
                <RangeControl
                  label="Speed"
                  value={bg.speed}
                  onChange={(value) => updateEntryImage(index, 'backgroundImage', 'speed', value)}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <SelectControl
                  label="Animation"
                  value={bg.animationEnabled !== false ? 'enabled' : 'disabled'}
                  options={[
                    { label: 'Enabled', value: 'enabled' },
                    { label: 'Disabled', value: 'disabled' }
                  ]}
                  onChange={(value) => updateEntryImage(index, 'backgroundImage', 'animationEnabled', value === 'enabled')}
                />

                <p style={{ fontWeight: 600, margin: '16px 0 6px' }}>{__('Foreground Image', 'adaire-blocks')}</p>
                <RangeControl
                  label={`Size (px) - ${sizeLabel}`}
                  value={getImageSize(fg, deviceType)}
                  onChange={(value) => updateEntryImage(index, 'foregroundImage', sizeField, value)}
                  min={10}
                  max={800}
                  step={5}
                />
                <RangeControl
                  label="Speed"
                  value={fg.speed}
                  onChange={(value) => updateEntryImage(index, 'foregroundImage', 'speed', value)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
            );
          })}
        </PanelBody>

        <PanelColorSettings
          section="style"
          priority="high"
          title="Colors"
          initialOpen={true}
          colorSettings={[
            {
              value: backgroundColor,
              onChange: (value) => setAttributes({ backgroundColor: value || '#0a0a0a' }),
              label: __('Background Color', 'adaire-blocks'),
            },
            {
              value: textColor,
              onChange: (value) => setAttributes({ textColor: value || '#ffffff' }),
              label: __('Text Color', 'adaire-blocks'),
            },
          ]}
        />

        <PanelBody section="style" priority="medium" title="Entries — Images" initialOpen={false}>
          {safeEntries.map((entry, index) => {
            const bg = entry.backgroundImage || {};
            const fg = entry.foregroundImage || {};
            return (
              <div key={entry.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px' }}>Entry {index + 1}</h4>

                <p style={{ fontWeight: 600, margin: '0 0 6px' }}>{__('Background Image', 'adaire-blocks')}</p>
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) => updateEntryImage(index, 'backgroundImage', 'url', media.url)}
                    allowedTypes={['image']}
                    value={bg.url}
                    render={({ open }) => (
                      <div>
                        {bg.url && (
                          <img
                            src={bg.url}
                            alt="Background"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', margin: '5px 0', display: 'block' }}
                          />
                        )}
                        <Button onClick={open} isSecondary>
                          {bg.url ? 'Change Image' : 'Select Image'}
                        </Button>
                        {bg.url && (
                          <Button
                            variant="tertiary"
                            isDestructive
                            onClick={() => updateEntryImage(index, 'backgroundImage', 'url', '')}
                            style={{ marginLeft: '5px' }}
                          >
                            {__('Remove Image', 'adaire-blocks')}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>

                <p style={{ fontWeight: 600, margin: '16px 0 6px' }}>{__('Foreground Image', 'adaire-blocks')}</p>
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) => updateEntryImage(index, 'foregroundImage', 'url', media.url)}
                    allowedTypes={['image']}
                    value={fg.url}
                    render={({ open }) => (
                      <div>
                        {fg.url && (
                          <img
                            src={fg.url}
                            alt="Foreground"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', margin: '5px 0', display: 'block' }}
                          />
                        )}
                        <Button onClick={open} isSecondary>
                          {fg.url ? 'Change Image' : 'Select Image'}
                        </Button>
                        {fg.url && (
                          <Button
                            variant="tertiary"
                            isDestructive
                            onClick={() => updateEntryImage(index, 'foregroundImage', 'url', '')}
                            style={{ marginLeft: '5px' }}
                          >
                            {__('Remove Image', 'adaire-blocks')}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
              </div>
            );
          })}
        </PanelBody>

        <PanelBody section="style" priority="medium" title="Text Animation" initialOpen={false}>
          <RangeControl
            label="Text Animation Duration (seconds)"
            help="Controls how fast text appears and disappears."
            value={typeof textAnimationDuration === 'number' ? textAnimationDuration : 0.6}
            onChange={(value) => setAttributes({ textAnimationDuration: value })}
            min={0.1}
            max={2}
            step={0.05}
          />
        </PanelBody>

        <PanelBody section="style" priority="medium" title="Decorative Shapes" initialOpen={false}>
          <p style={{ fontSize: '12px', color: '#757575' }}>
            {__('Subtle ambient circles/triangles/squares drifting behind the background collage and each entry. Position, type, and timing are automatic — nothing to configure per-shape.', 'adaire-blocks')}
          </p>
          <ToggleControl
            label="Enable Shapes"
            checked={shapesEnabled !== false}
            onChange={(value) => setAttributes({ shapesEnabled: value })}
          />
          {shapesEnabled !== false && (
            <>
              <RangeControl
                label="Shapes per Section"
                help="How many shapes appear in the intro area and in each entry, independently."
                value={typeof shapeCount === 'number' ? shapeCount : 3}
                onChange={(value) => setAttributes({ shapeCount: value })}
                min={0}
                max={8}
                step={1}
              />
              <AdaireColorControl
                label="Shape Color"
                value={shapeColor || '#ffffff'}
                enableAlpha
                onChange={(value) => setAttributes({ shapeColor: value || '#ffffff' })}
              />
            </>
          )}
        </PanelBody>

        <PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={false}>
          <h4>Title Settings</h4>
          <RangeControl
            label={__('Title Font Size (px)', 'adaire-blocks')}
            value={attributes.titleFontSize}
            min={16}
            max={120}
            onChange={(value) => setAttributes({ titleFontSize: value })}
          />
          <SelectControl
            label={__('Title Font Family', 'adaire-blocks')}
            value={attributes.titleFontFamily}
            options={FONT_FAMILIES}
            onChange={(value) => setAttributes({ titleFontFamily: value })}
          />
          {attributes.titleFontFamily === 'custom' && (
            <TextControl
              label={__('Custom Title Font Family', 'adaire-blocks')}
              value={attributes.titleFontFamilyCustom || ''}
              onChange={(value) => setAttributes({ titleFontFamilyCustom: value })}
            />
          )}
          <SelectControl
            label={__('Title Font Weight', 'adaire-blocks')}
            value={attributes.titleFontWeight || 'normal'}
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Bold', value: 'bold' },
              { label: '100 (Thin)', value: '100' },
              { label: '200 (Extra Light)', value: '200' },
              { label: '300 (Light)', value: '300' },
              { label: '400 (Regular)', value: '400' },
              { label: '500 (Medium)', value: '500' },
              { label: '600 (Semi Bold)', value: '600' },
              { label: '700 (Bold)', value: '700' },
              { label: '800 (Extra Bold)', value: '800' },
              { label: '900 (Black)', value: '900' },
            ]}
            onChange={(value) => setAttributes({ titleFontWeight: value })}
          />
          <RangeControl
            label={__('Title Top Margin (px)', 'adaire-blocks')}
            value={attributes.titleMarginTop || 0}
            min={0}
            max={100}
            onChange={(value) => setAttributes({ titleMarginTop: value })}
          />
          <RangeControl
            label={__('Title Bottom Margin (px)', 'adaire-blocks')}
            value={attributes.titleMarginBottom || 20}
            min={0}
            max={100}
            onChange={(value) => setAttributes({ titleMarginBottom: value })}
          />

          <h4>Description Settings</h4>
          <RangeControl
            label={__('Text Font Size (px)', 'adaire-blocks')}
            value={attributes.textFontSize}
            min={10}
            max={60}
            onChange={(value) => setAttributes({ textFontSize: value })}
          />
          <SelectControl
            label={__('Text Font Family', 'adaire-blocks')}
            value={attributes.textFontFamily}
            options={FONT_FAMILIES}
            onChange={(value) => setAttributes({ textFontFamily: value })}
          />
          {attributes.textFontFamily === 'custom' && (
            <TextControl
              label={__('Custom Text Font Family', 'adaire-blocks')}
              value={attributes.textFontFamilyCustom || ''}
              onChange={(value) => setAttributes({ textFontFamilyCustom: value })}
            />
          )}
          <SelectControl
            label={__('Text Font Weight', 'adaire-blocks')}
            value={attributes.textFontWeight || 'normal'}
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Bold', value: 'bold' },
              { label: '100 (Thin)', value: '100' },
              { label: '200 (Extra Light)', value: '200' },
              { label: '300 (Light)', value: '300' },
              { label: '400 (Regular)', value: '400' },
              { label: '500 (Medium)', value: '500' },
              { label: '600 (Semi Bold)', value: '600' },
              { label: '700 (Bold)', value: '700' },
              { label: '800 (Extra Bold)', value: '800' },
              { label: '900 (Black)', value: '900' },
            ]}
            onChange={(value) => setAttributes({ textFontWeight: value })}
          />
          <RangeControl
            label={__('Text Top Margin (px)', 'adaire-blocks')}
            value={attributes.textMarginTop || 0}
            min={0}
            max={100}
            onChange={(value) => setAttributes({ textMarginTop: value })}
          />
          <RangeControl
            label={__('Text Bottom Margin (px)', 'adaire-blocks')}
            value={attributes.textMarginBottom || 0}
            min={0}
            max={100}
            onChange={(value) => setAttributes({ textMarginBottom: value })}
          />
        </PanelBody>

        <PanelBody section="style" priority="high" title="Gradient Overlay" initialOpen={false}>
          <AdaireColorControl
            label="Start Color"
            value={gradientOverlay?.startColor || '#000000'}
            enableAlpha={false}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                startColor: value || '#000000',
              }
            })}
          />
          <RangeControl
            label="Start Color Opacity"
            value={gradientOverlay?.startOpacity ?? 0.5}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                startOpacity: value
              }
            })}
            min={0}
            max={1}
            step={0.1}
          />
          <AdaireColorControl
            label="End Color"
            value={gradientOverlay?.endColor || '#000000'}
            enableAlpha={false}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                endColor: value || '#000000',
              }
            })}
          />
          <RangeControl
            label="End Color Opacity"
            value={gradientOverlay?.endOpacity ?? 0.5}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                endOpacity: value
              }
            })}
            min={0}
            max={1}
            step={0.1}
          />
          <SelectControl
            label="Direction"
            value={gradientOverlay?.direction || 'to bottom'}
            options={GRADIENT_DIRECTIONS}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                direction: value
              }
            })}
          />
          {gradientOverlay?.direction === 'custom' && (
            <RangeControl
              label="Custom Angle (degrees)"
              value={gradientOverlay?.angle || 0}
              onChange={(value) => setAttributes({
                gradientOverlay: {
                  ...gradientOverlay,
                  angle: value
                }
              })}
              min={0}
              max={360}
              step={1}
            />
          )}
          <RangeControl
            label="Start Stop (%)"
            value={gradientOverlay?.startStop || 0}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                startStop: value
              }
            })}
            min={0}
            max={100}
            step={1}
          />
          <RangeControl
            label="End Stop (%)"
            value={gradientOverlay?.endStop || 100}
            onChange={(value) => setAttributes({
              gradientOverlay: {
                ...gradientOverlay,
                endStop: value
              }
            })}
            min={0}
            max={100}
            step={1}
          />
        </PanelBody>
      </InspectorTabs>

      <section {...blockProps}>
        {/* Intro zone — bounded (100vh) container holding the intro text
            and the decorative background collage together, matches save.js */}
        <div className="ad-particles-block__intro-zone">
          {/* Decorative ambient shapes — matches save.js */}
          {shapesEnabled !== false && renderShapes( 0, shapeCount, shapeColor )}

          {/* Section intro — renders once, ahead of the entries, not per-entry */}
          {(sectionIntroTitle || sectionIntroDescription) && (
            <div
              className="ad-particles-block__section-intro"
              style={{ position: 'relative', zIndex: 10, color: textColor || '#ffffff' }}
            >
              {sectionIntroTitle && <h2 style={titleStyle}>{sectionIntroTitle}</h2>}
              {sectionIntroDescription && <p style={textStyle}>{sectionIntroDescription}</p>}
            </div>
          )}

          {/* Background images — auto-arranged collage, matches save.js */}
          {safeEntries.map((entry, index) => {
            const bg = entry.backgroundImage || {};
            const { x, y } = getBackgroundLayout(index);
            return (
              <div
                key={`bg-${entry.id}`}
                className="ad-particles-block__particle-item ad-particles-block__background-image"
                aria-hidden="true"
                data-tablet-size={getImageSize(bg, 'tablet')}
                data-mobile-size={getImageSize(bg, 'mobile')}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${getImageSize(bg, 'desktop')}px`,
                  height: `${getImageSize(bg, 'desktop')}px`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                {bg.url ? (
                  <img
                    src={bg.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', backgroundColor: '#666', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px'
                  }}>
                    No Image
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Entry slices — every entry's text is always visible here (static
            list preview; the scroll-driven reveal in view.js never runs in
            the editor, and doesn't need to for a site owner to see/edit
            every entry's content). */}
        {safeEntries.map((entry, entryIndex) => {
          const fg = entry.foregroundImage || {};
          return (
            <div
              key={`slice-${entry.id}`}
              className="ad-particles-block__entry-slice"
              style={{ minHeight: `${entryScrollHeight || 150}vh` }}
            >
              {shapesEnabled !== false && renderShapes( entryIndex + 1, shapeCount, shapeColor )}

              <div className="ad-particles-block__entry-pair">
                <div
                  className="ad-particles-block__particle-item ad-particles-block__foreground-image"
                  aria-hidden="true"
                  data-tablet-size={getImageSize(fg, 'tablet')}
                  data-mobile-size={getImageSize(fg, 'mobile')}
                  style={{
                    width: `${getImageSize(fg, 'desktop')}px`,
                    height: `${getImageSize(fg, 'desktop')}px`,
                    pointerEvents: 'none',
                    flex: '0 0 auto',
                  }}
                >
                  {fg.url ? (
                    <img
                      src={fg.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', backgroundColor: '#666', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px'
                    }}>
                      No Image
                    </div>
                  )}
                  <div
                    className="ad-particles-block__foreground-image-overlay"
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: '8px', opacity: 1, transition: 'opacity 0.3s ease'
                    }}
                  />
                </div>

                <div
                  className="ad-particles-block__entry-text"
                  style={{ color: textColor || '#ffffff' }}
                >
                  <h2 style={titleStyle}>{entry.title}</h2>
                  <p style={textStyle}>{entry.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Gradient Overlay */}
        <div
          className="ad-particles-block__gradient-overlay"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            background: gradientOverlay && gradientOverlay.startColor && gradientOverlay.endColor ?
              `linear-gradient(${gradientOverlay.direction === 'custom' ? `${gradientOverlay.angle || 0}deg` : (gradientOverlay.direction || 'to bottom')},
                ${hexToRgba(gradientOverlay.startColor, gradientOverlay.startOpacity ?? 0.5)} ${gradientOverlay.startStop || 0}%,
                ${hexToRgba(gradientOverlay.endColor, gradientOverlay.endOpacity ?? 0.5)} ${gradientOverlay.endStop || 100}%)` :
              'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 100%)'
          }}
        />
      </section>
    </>
  );
}
