/**
 * Particles (particles-block) deprecations — most recent first.
 *
 * v2  Frozen copy of the save() that shipped after Text Color was made to
 *     apply directly to the title/description <h2>/<p> elements (fixing a
 *     theme-CSS-specificity bug) but before that single shared `textColor`
 *     was split into independent `titleColor`/`descriptionColor` attributes
 *     (2026-07-31). `migrate` copies the old shared value into both new
 *     attributes so previously-set colors are preserved rather than
 *     silently resetting to the schema default on next edit.
 *
 * v1  Frozen copy of the save() that shipped before Text Color was made to
 *     apply directly to the title/description <h2>/<p> elements. `color`
 *     was only set on the wrapping `.ad-particles-block__section-intro` /
 *     `.ad-particles-block__entry-text` div and relied on CSS inheritance
 *     to reach the heading/paragraph — but a theme's own `h2 { color: ... }`
 *     rule (e.g. from theme.json global styles) beats an inherited value
 *     regardless of specificity, so the Text Color control could silently
 *     have no visible effect on titles/names. Same `textColor`-to-two-colors
 *     migration as v2, since that attribute rename/split postdates this
 *     version too.
 *
 * Both entries declare an explicit `attributes` schema with the old
 * `textColor` field — they can no longer fall back to the current
 * block.json attributes now that `titleColor`/`descriptionColor` have
 * replaced it there.
 */
import { useBlockProps } from '@wordpress/block-editor';

const LEGACY_ATTRIBUTES = {
  align: { type: 'string', default: 'full' },
  entryScrollHeight: { type: 'number', default: 150 },
  backgroundColor: { type: 'string', default: '#0a0a0a' },
  textColor: { type: 'string', default: '#ffffff' },
  sectionIntroTitle: { type: 'string', default: 'Meet the Team' },
  sectionIntroDescription: {
    type: 'string',
    default: 'We’re a passionate team of creatives and technologists dedicated to crafting meaningful digital experiences that drive results.',
  },
  entries: {
    type: 'array',
    default: [
      { id: 1, title: 'Team Member 1', description: 'Role Title', backgroundImage: { url: '', desktopSize: 160, tabletSize: 120, mobileSize: 80, speed: 0.3, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
      { id: 2, title: 'Team Member 2', description: 'Role Title', backgroundImage: { url: '', desktopSize: 185, tabletSize: 130, mobileSize: 80, speed: 2, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
      { id: 3, title: 'Team Member 3', description: 'Role Title', backgroundImage: { url: '', desktopSize: 175, tabletSize: 125, mobileSize: 80, speed: 1.5, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
      { id: 4, title: 'Team Member 4', description: 'Role Title', backgroundImage: { url: '', desktopSize: 145, tabletSize: 110, mobileSize: 80, speed: 2, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
      { id: 5, title: 'Team Member 5', description: 'Role Title', backgroundImage: { url: '', desktopSize: 150, tabletSize: 125, mobileSize: 100, speed: 1.5, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
      { id: 6, title: 'Team Member 6', description: 'Role Title', backgroundImage: { url: '', desktopSize: 160, tabletSize: 130, mobileSize: 100, speed: 2, animationEnabled: true }, foregroundImage: { url: '', desktopSize: 420, tabletSize: 300, mobileSize: 180, speed: 0 } },
    ],
  },
  titleFontSize: { type: 'number', default: 65 },
  titleFontFamily: { type: 'string', default: 'inherit', enum: [ 'inherit', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'custom' ] },
  titleFontFamilyCustom: { type: 'string', default: '' },
  textFontSize: { type: 'number', default: 22 },
  textFontFamily: { type: 'string', default: 'inherit', enum: [ 'inherit', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'custom' ] },
  textFontFamilyCustom: { type: 'string', default: '' },
  titleFontWeight: { type: 'string', default: 'normal', enum: [ 'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900' ] },
  textFontWeight: { type: 'string', default: 'normal', enum: [ 'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900' ] },
  titleMarginTop: { type: 'number', default: 0 },
  titleMarginBottom: { type: 'number', default: 1 },
  textMarginTop: { type: 'number', default: 0 },
  textMarginBottom: { type: 'number', default: 0 },
  gradientOverlay: {
    type: 'object',
    default: { startColor: '#000000', endColor: '#000000', startOpacity: 0.8, endOpacity: 0.4, direction: 'to bottom', angle: 0, startStop: 46, endStop: 100 },
  },
  textAnimationDuration: { type: 'number', default: 0.6 },
  shapesEnabled: { type: 'boolean', default: true },
  shapeCount: { type: 'number', default: 3 },
  shapeColor: { type: 'string', default: '#ffffff' },
  blockId: { type: 'string', default: '' },
};

function migrateTextColor( attributes ) {
  const { textColor, ...rest } = attributes;
  return {
    ...rest,
    titleColor: textColor || '#ffffff',
    descriptionColor: textColor || '#ffffff',
  };
}

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

const getImageSize = (image, tier) => {
  if (tier === 'mobile') {
    return image?.mobileSize ?? image?.tabletSize ?? image?.desktopSize ?? 40;
  }
  if (tier === 'tablet') {
    return image?.tabletSize ?? image?.desktopSize ?? 40;
  }
  return image?.desktopSize ?? 40;
};

const getBackgroundLayout = (index) => {
  const xBand = (index * 9) % 40;
  const x = xBand < 20 ? 10 + xBand : 70 + (xBand - 20);
  const y = 10 + ((index * 29) % 80);
  return { x, y };
};

const SHAPE_TYPES = [ 'circle', 'triangle', 'square' ];

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

const deprecatedV2 = {
  attributes: LEGACY_ATTRIBUTES,
  migrate: migrateTextColor,

  save({ attributes }) {
    const {
      entryScrollHeight, backgroundColor, textColor, entries, gradientOverlay,
      textAnimationDuration, blockId, sectionIntroTitle, sectionIntroDescription,
      shapesEnabled, shapeCount, shapeColor,
    } = attributes;
    const safeEntries = Array.isArray(entries) ? entries : [];

    const titleStyle = {
      color: textColor || '#ffffff',
      fontSize: attributes.titleFontSize ? `${attributes.titleFontSize}px` : undefined,
      fontFamily: attributes.titleFontFamily && attributes.titleFontFamily !== 'custom'
        ? attributes.titleFontFamily
        : attributes.titleFontFamilyCustom || undefined,
      fontWeight: attributes.titleFontWeight || 'normal',
      marginTop: attributes.titleMarginTop ? `${attributes.titleMarginTop}px` : undefined,
      marginBottom: attributes.titleMarginBottom ? `${attributes.titleMarginBottom}px` : undefined,
    };

    const textStyle = {
      color: textColor || '#ffffff',
      fontSize: attributes.textFontSize ? `${attributes.textFontSize}px` : undefined,
      fontFamily: attributes.textFontFamily && attributes.textFontFamily !== 'custom'
        ? attributes.textFontFamily
        : attributes.textFontFamilyCustom || undefined,
      fontWeight: attributes.textFontWeight || 'normal',
      marginTop: attributes.textMarginTop ? `${attributes.textMarginTop}px` : undefined,
      marginBottom: attributes.textMarginBottom ? `${attributes.textMarginBottom}px` : undefined,
    };

    return (
      <section
        {...useBlockProps.save({
          className: 'ad-particles-block',
          style: {
            backgroundColor: backgroundColor || '#0a0a0a',
            position: 'relative',
            overflow: 'hidden'
          },
          id: blockId || undefined
        })}
        data-text-anim-duration={typeof textAnimationDuration === 'number' ? textAnimationDuration : undefined}
      >
        <div className="ad-particles-block__intro-zone">
          {shapesEnabled !== false && renderShapes( 0, shapeCount, shapeColor )}

          {(sectionIntroTitle || sectionIntroDescription) && (
            <div
              className="ad-particles-block__section-intro"
              style={{ position: 'relative', zIndex: 10, color: textColor || '#ffffff' }}
            >
              {sectionIntroTitle && <h2 style={titleStyle}>{sectionIntroTitle}</h2>}
              {sectionIntroDescription && <p style={textStyle}>{sectionIntroDescription}</p>}
            </div>
          )}

          {safeEntries.map((entry, index) => {
            const bg = entry.backgroundImage || {};
            const { x, y } = getBackgroundLayout(index);
            return (
              <div
                key={`bg-${entry.id}`}
                className="ad-particles-block__particle-item ad-particles-block__background-image"
                aria-hidden="true"
                data-speed={bg.speed}
                data-tablet-size={getImageSize(bg, 'tablet')}
                data-mobile-size={getImageSize(bg, 'mobile')}
                data-animation-enabled={bg.animationEnabled !== false}
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
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#666',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    No Image
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
                  data-speed={fg.speed}
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
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#666',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      No Image
                    </div>
                  )}
                  <div
                    className="ad-particles-block__foreground-image-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '8px',
                      opacity: 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                </div>

                <div className="ad-particles-block__entry-text" style={{ color: textColor || '#ffffff' }}>
                  <h2 style={titleStyle}>{entry.title}</h2>
                  <p style={textStyle}>{entry.description}</p>
                </div>
              </div>
            </div>
          );
        })}

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
    );
  },
};

const deprecatedV1 = {
  attributes: LEGACY_ATTRIBUTES,
  migrate: migrateTextColor,

  save({ attributes }) {
    const {
      entryScrollHeight, backgroundColor, textColor, entries, gradientOverlay,
      textAnimationDuration, blockId, sectionIntroTitle, sectionIntroDescription,
      shapesEnabled, shapeCount, shapeColor,
    } = attributes;
    const safeEntries = Array.isArray(entries) ? entries : [];

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

    return (
      <section
        {...useBlockProps.save({
          className: 'ad-particles-block',
          style: {
            backgroundColor: backgroundColor || '#0a0a0a',
            position: 'relative',
            overflow: 'hidden'
          },
          id: blockId || undefined
        })}
        data-text-anim-duration={typeof textAnimationDuration === 'number' ? textAnimationDuration : undefined}
      >
        <div className="ad-particles-block__intro-zone">
          {shapesEnabled !== false && renderShapes( 0, shapeCount, shapeColor )}

          {(sectionIntroTitle || sectionIntroDescription) && (
            <div
              className="ad-particles-block__section-intro"
              style={{ position: 'relative', zIndex: 10, color: textColor || '#ffffff' }}
            >
              {sectionIntroTitle && <h2 style={titleStyle}>{sectionIntroTitle}</h2>}
              {sectionIntroDescription && <p style={textStyle}>{sectionIntroDescription}</p>}
            </div>
          )}

          {safeEntries.map((entry, index) => {
            const bg = entry.backgroundImage || {};
            const { x, y } = getBackgroundLayout(index);
            return (
              <div
                key={`bg-${entry.id}`}
                className="ad-particles-block__particle-item ad-particles-block__background-image"
                aria-hidden="true"
                data-speed={bg.speed}
                data-tablet-size={getImageSize(bg, 'tablet')}
                data-mobile-size={getImageSize(bg, 'mobile')}
                data-animation-enabled={bg.animationEnabled !== false}
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
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#666',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    No Image
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
                  data-speed={fg.speed}
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
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#666',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      No Image
                    </div>
                  )}
                  <div
                    className="ad-particles-block__foreground-image-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '8px',
                      opacity: 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                </div>

                <div className="ad-particles-block__entry-text" style={{ color: textColor || '#ffffff' }}>
                  <h2 style={titleStyle}>{entry.title}</h2>
                  <p style={textStyle}>{entry.description}</p>
                </div>
              </div>
            </div>
          );
        })}

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
    );
  },
};

export default [ deprecatedV2, deprecatedV1 ];
