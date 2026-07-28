import { useBlockProps } from '@wordpress/block-editor';

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

// Background collage — deterministic scatter so N images spread across the
// full intro zone with no obvious grid/repeat pattern. Coordinates are
// percentages of the intro-zone wrapper (not the whole, much-taller
// section), so the collage always stays visually confined to the intro
// area regardless of entry count. Purely a function of index/count —
// nothing stored, nothing to desync.
//
// x maps into two side bands (10-30% and 70-90%) that structurally skip
// the center — where the intro title/description sits (~29-71% of the
// zone width) — rather than computing over the full width and nudging
// collisions afterward, which just piles values up at the exclusion
// boundary instead of avoiding it. Verified by direct computation (not
// just "coprime with the modulus", which isn't sufficient on its own —
// see the multiplier note on the previous version of this formula) that
// multiplier 9 (mod 40) and 29 (mod 80) give even spacing within their
// ranges for both 6 and 9 entries.
const getBackgroundLayout = (index) => {
  const xBand = (index * 9) % 40;
  const x = xBand < 20 ? 10 + xBand : 70 + (xBand - 20);
  const y = 10 + ((index * 29) % 80);
  return { x, y };
};

const SHAPE_TYPES = [ 'circle', 'triangle', 'square' ];

// Decorative ambient shapes — deterministic scatter, purely a function of
// (index, seed), nothing stored. `seed` distinguishes one container's set
// from another (intro zone vs. each entry-slice) so neighboring containers
// don't render identical layouts. Coordinates are percentages of whichever
// container renders them (always a bounded, known-height box — the intro
// zone or a single entry-slice — never the whole variable-height section),
// same containment principle as getBackgroundLayout. Verified by direct
// computation across several seeds before shipping.
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

// Renders `count` ambient shapes for one container (intro zone or a single
// entry-slice). `seed` must be unique per container so their layouts differ.
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

export default function save({ attributes }) {
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
      {/* Intro zone — a bounded (100vh) container holding the section intro
          text and the decorative background collage together. overflow:hidden
          keeps both the collage's resting position AND its parallax drift
          confined here, so it never bleeds into the entries below. */}
      <div className="ad-particles-block__intro-zone">
        {/* Decorative ambient shapes — continuous CSS-only drift, purely
            background texture. Bottom of the stack (z-index 0). */}
        {shapesEnabled !== false && renderShapes( 0, shapeCount, shapeColor )}

        {/* Section intro — a one-time heading/description marking the
            transition from the background collage to the scrolling entries.
            Rendered once, in normal flow, ahead of the entries loop. */}
        {(sectionIntroTitle || sectionIntroDescription) && (
          <div
            className="ad-particles-block__section-intro"
            style={{ position: 'relative', zIndex: 10, color: textColor || '#ffffff' }}
          >
            {sectionIntroTitle && <h2 style={titleStyle}>{sectionIntroTitle}</h2>}
            {sectionIntroDescription && <p style={textStyle}>{sectionIntroDescription}</p>}
          </div>
        )}

        {/* Background images — one per entry, auto-arranged decorative
            collage. Position is computed from index/count, never stored,
            and is a percentage of THIS zone, not the whole section. */}
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

      {/* Entry slices — one per entry, in normal document flow, each given a
          fixed scroll distance (entryScrollHeight). The entry's foreground
          image + text pair is simply centered within its own slice — no
          coordinates stored or computed, order is entirely index-driven. */}
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
  );
}
