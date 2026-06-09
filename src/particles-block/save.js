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

export default function save({ attributes }) {
  const { sectionHeight, backgroundColor, textColor, textContent, particles, gradientOverlay, textAnimationDuration, blockId } = attributes;

  return (
    <section
      {...useBlockProps.save({
        style: { 
          backgroundColor: backgroundColor || '#0a0a0a',
          minHeight: `${sectionHeight}vh`,
          position: 'relative',
          overflow: 'hidden'
        },
        id: blockId || undefined
      })}
	      className="ad-particles-block"
      data-text-anim-duration={typeof textAnimationDuration === 'number' ? textAnimationDuration : undefined}
    >
      {/* Particles - Each positioned independently */}
      {particles.map((particle) => (
        <div
          key={particle.id}
			className={`ad-particles-block__particle ad-particles-block__particle-item ${particle.type === 'dynamic' ? 'ad-particles-block__dynamic-particle' : ''}`}
          data-speed={particle.speed}
          data-mobile-size={particle.mobileSize || particle.size}
          data-animation-enabled={particle.animationEnabled !== false}
          data-particle-type={particle.type || 'normal'}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: particle.type === 'dynamic' ? 3 : 1
          }}
        >
          {particle.imageUrl ? (
            <img 
              src={particle.imageUrl} 
              alt="Particle" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
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
          
          {/* Dynamic Particle Overlay */}
          {particle.type === 'dynamic' && (
				<div 
					className="ad-particles-block__dynamic-particle-overlay"
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
          )}
        </div>
      ))}

      {/* Gradient Overlay */}
		<div 
			className="ad-particles-block__gradient-overlay"
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

      {/* Text Content Wrapper for Pinning */}
		<div className="ad-particles-block__text-content-wrapper" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Text Content Overlay - On Top */}
			<div className="ad-particles-block__text-content-overlay" style={{ 
          textAlign: 'left',
          color: textColor || '#ffffff',
          maxWidth: '600px',
          width: '90%'
        }}>
          {textContent.map((text, index) => (
            <div key={text.id} className="ad-particles-block__text-section" data-index={index} data-appear={typeof text.appearAtPercent === 'number' ? text.appearAtPercent : ''} data-disappear={typeof text.disappearAtPercent === 'number' ? text.disappearAtPercent : ''}>
              <h2
                style={{
                  fontSize: attributes.titleFontSize ? `${attributes.titleFontSize}px` : undefined,
                  fontFamily: attributes.titleFontFamily && attributes.titleFontFamily !== 'custom'
                    ? attributes.titleFontFamily
                    : attributes.titleFontFamilyCustom || undefined,
                  fontWeight: attributes.titleFontWeight || 'normal',
                  marginTop: attributes.titleMarginTop ? `${attributes.titleMarginTop}px` : undefined,
                  marginBottom: attributes.titleMarginBottom ? `${attributes.titleMarginBottom}px` : undefined,
                }}
              >
                {text.title}
              </h2>
              <p
                style={{
                  fontSize: attributes.textFontSize ? `${attributes.textFontSize}px` : undefined,
                  fontFamily: attributes.textFontFamily && attributes.textFontFamily !== 'custom'
                    ? attributes.textFontFamily
                    : attributes.textFontFamilyCustom || undefined,
                  fontWeight: attributes.textFontWeight || 'normal',
                  marginTop: attributes.textMarginTop ? `${attributes.textMarginTop}px` : undefined,
                  marginBottom: attributes.textMarginBottom ? `${attributes.textMarginBottom}px` : undefined,
                }}
              >
                {text.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



