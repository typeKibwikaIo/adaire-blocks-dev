import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, ColorPicker, RangeControl, Button, TextControl, SelectControl } from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import { __ } from '@wordpress/i18n';

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

export default function Edit({ attributes, setAttributes }) {
  const { sectionHeight, backgroundColor, textColor, textContent, particles, gradientOverlay, textAnimationDuration, blockId } = attributes;

  const blockProps = useBlockProps({
    style: { 
      backgroundColor: backgroundColor || '#0a0a0a',
      minHeight: `${sectionHeight}vh`,
      position: 'relative',
      overflow: 'hidden'
    }
  });

  const updateParticle = (index, field, value) => {
    const newParticles = [...particles];
    newParticles[index] = { ...newParticles[index], [field]: value };
    setAttributes({ particles: newParticles });
  };

  const addParticle = () => {
    const newParticle = {
      id: Date.now(),
      imageUrl: '',
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 40 + 40,
      speed: Math.random() * 0.5 + 0.2,
      animationEnabled: true,
      type: 'normal'
    };
    setAttributes({ particles: [...particles, newParticle] });
  };

  const removeParticle = (index) => {
    const newParticles = particles.filter((_, i) => i !== index);
    setAttributes({ particles: newParticles });
  };

  const updateTextContent = (index, field, value) => {
    const newTextContent = [...textContent];
    newTextContent[index] = { ...newTextContent[index], [field]: value };
    setAttributes({ textContent: newTextContent });
  };

  const addTextContent = () => {
    const newText = {
      id: Date.now(),
      title: 'New Section',
      description: 'Add your description here.',
      appearAtPercent: 0,
      disappearAtPercent: 20
    };
    setAttributes({ textContent: [...textContent, newText] });
  };

  const removeTextContent = (index) => {
    const newTextContent = textContent.filter((_, i) => i !== index);
    setAttributes({ textContent: newTextContent });
  };

  const reorderTextContent = (fromIndex, toIndex) => {
    const newTextContent = [...textContent];
    const [movedItem] = newTextContent.splice(fromIndex, 1);
    newTextContent.splice(toIndex, 0, movedItem);
    setAttributes({ textContent: newTextContent });
  };

  const reorderParticles = (fromIndex, toIndex) => {
    const newParticles = [...particles];
    const [movedItem] = newParticles.splice(fromIndex, 1);
    newParticles.splice(toIndex, 0, movedItem);
    setAttributes({ particles: newParticles });
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
      <InspectorControls>
        <PanelBody title="Section Settings" initialOpen={true}>
          <RangeControl
            label="Section Height (vh)"
            value={sectionHeight}
            onChange={(value) => setAttributes({ sectionHeight: value })}
            min={50}
            max={1000}
            step={10}
          />
          <ColorPicker
            label="Background Color"
            color={backgroundColor}
            onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
            disableAlpha
          />
          <ColorPicker
            label="Text Color"
            color={textColor}
            onChangeComplete={(color) => setAttributes({ textColor: color.hex })}
            disableAlpha
          />
        </PanelBody>

        <PanelBody title="Text Content" initialOpen={true}>
          <RangeControl
            label="Text Animation Duration (seconds)"
            help="Controls how fast text appears and disappears."
            value={typeof textAnimationDuration === 'number' ? textAnimationDuration : 0.35}
            onChange={(value) => setAttributes({ textAnimationDuration: value })}
            min={0.1}
            max={2}
            step={0.05}
          />
          {textContent.map((text, index) => (
            <div key={text.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>Text Section {index + 1}</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {index > 0 && (
                    <Button 
                      onClick={() => reorderTextContent(index, index - 1)} 
                      isSmall
                      variant="secondary"
                    >
                      â†‘
                    </Button>
                  )}
                  {index < textContent.length - 1 && (
                    <Button 
                      onClick={() => reorderTextContent(index, index + 1)} 
                      isSmall
                      variant="secondary"
                    >
                      â†“
                    </Button>
                  )}
                </div>
              </div>
              
              <TextControl
                label="Title"
                value={text.title}
                onChange={(value) => updateTextContent(index, 'title', value)}
                placeholder="Enter title..."
              />
              
              <TextControl
                label="Description"
                value={text.description}
                onChange={(value) => updateTextContent(index, 'description', value)}
                placeholder="Enter description..."
              />

              <RangeControl
                label="Appear at Y% of section"
                help="When this text slides in (0 - 100+)."
                value={typeof text.appearAtPercent === 'number' ? text.appearAtPercent : 0}
                onChange={(value) => updateTextContent(index, 'appearAtPercent', value)}
                min={-100}
                max={200}
                step={1}
              />
              <RangeControl
                label="Disappear at Y% of section"
                help="When this text slides out (must be > appear)."
                value={typeof text.disappearAtPercent === 'number' ? text.disappearAtPercent : 20}
                onChange={(value) => updateTextContent(index, 'disappearAtPercent', value)}
                min={-100}
                max={300}
                step={1}
              />

              <Button 
                onClick={() => removeTextContent(index)} 
                isDestructive 
                isSmall
                style={{ marginTop: '10px' }}
              >
                Remove Text Section
              </Button>
            </div>
          ))}
          
          <Button onClick={addTextContent} isPrimary>
            Add Text Section
          </Button>
        </PanelBody>

        <PanelBody title="Particles" initialOpen={false}>
          {particles.map((particle, index) => (
            <div key={particle.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>Particle {index + 1}</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {index > 0 && (
                    <Button 
                      onClick={() => reorderParticles(index, index - 1)} 
                      isSmall
                      variant="secondary"
                    >
                      â†‘
                    </Button>
                  )}
                  {index < particles.length - 1 && (
                    <Button 
                      onClick={() => reorderParticles(index, index + 1)} 
                      isSmall
                      variant="secondary"
                    >
                      â†“
                    </Button>
                  )}
                </div>
              </div>
              
              <MediaUpload
                onSelect={(media) => updateParticle(index, 'imageUrl', media.url)}
                allowedTypes={['image']}
                value={particle.imageUrl}
                render={({ open }) => (
                  <div>
                    <Button onClick={open} isSecondary>
                      {particle.imageUrl ? 'Change Image' : 'Select Image'}
                    </Button>
                    {particle.imageUrl && (
                      <img 
                        src={particle.imageUrl} 
                        alt="Particle" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', margin: '5px 0' }}
                      />
                    )}
                  </div>
                )}
              />

              <RangeControl
                label="X Position (%)"
                value={particle.x}
                onChange={(value) => updateParticle(index, 'x', value)}
                min={0}
                max={100}
                step={1}
              />

              <RangeControl
                label="Y Position (%)"
                value={particle.y}
                onChange={(value) => updateParticle(index, 'y', value)}
                min={0}
                max={100}
                step={1}
              />

              <RangeControl
                label="Size (px) - Desktop"
                value={particle.size}
                onChange={(value) => updateParticle(index, 'size', value)}
                min={20}
                max={800}
                step={5}
              />
              <RangeControl
                label="Size (px) - Mobile"
                value={particle.mobileSize || particle.size}
                onChange={(value) => updateParticle(index, 'mobileSize', value)}
                min={10}
                max={400}
                step={5}
              />

              <RangeControl
                label="Speed"
                value={particle.speed}
                onChange={(value) => updateParticle(index, 'speed', value)}
                min={0}
                max={2}
                step={0.1}
              />
              
              <SelectControl
                label="Animation"
                value={particle.animationEnabled !== false ? 'enabled' : 'disabled'}
                options={[
                  { label: 'Enabled', value: 'enabled' },
                  { label: 'Disabled', value: 'disabled' }
                ]}
                onChange={(value) => updateParticle(index, 'animationEnabled', value === 'enabled')}
              />

              <SelectControl
                label="Particle Type"
                value={particle.type || 'normal'}
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Dynamic', value: 'dynamic' }
                ]}
                onChange={(value) => updateParticle(index, 'type', value)}
                help="Dynamic particles have special interactive behavior with overlays and size changes"
              />

              <Button 
                onClick={() => removeParticle(index)} 
                isDestructive 
                isSmall
                style={{ marginTop: '10px' }}
              >
                Remove Particle
              </Button>
            </div>
          ))}
          
          <Button onClick={addParticle} isPrimary>
            Add Particle
          </Button>
        </PanelBody>

        <PanelBody title={__('Typography', 'adaire-blocks')} initialOpen={false}>
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
              onChange={(value) => setAttributes({ titleFontFamily: value })}
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
              onChange={(value) => setAttributes({ textFontFamily: value })}
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

        <PanelBody title="Gradient Overlay" initialOpen={false}>
          <ColorPicker
            label="Start Color"
            color={gradientOverlay?.startColor || '#000000'}
            onChangeComplete={(color) => setAttributes({ 
              gradientOverlay: { 
                ...gradientOverlay, 
                startColor: color.hex,
                startOpacity: color.rgb?.a !== undefined ? color.rgb.a : (gradientOverlay?.startOpacity ?? 0.5)
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
          <ColorPicker
            label="End Color"
            color={gradientOverlay?.endColor || '#000000'}
            onChangeComplete={(color) => setAttributes({ 
              gradientOverlay: { 
                ...gradientOverlay, 
                endColor: color.hex,
                endOpacity: color.rgb?.a !== undefined ? color.rgb.a : (gradientOverlay?.endOpacity ?? 0.5)
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

        <PanelBody title="Block Settings" initialOpen={false}>
          <TextControl
            label="Block ID"
            value={blockId}
            onChange={(value) => setAttributes({ blockId: value })}
            help="Add a custom ID to this block for CSS targeting or anchor links."
          />
        </PanelBody>
      </InspectorControls>

      <section {...blockProps}>
        {/* Particles - Each positioned independently */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`particle-item ${particle.type === 'dynamic' ? 'dynamic-particle' : ''}`}
            data-mobile-size={particle.mobileSize || particle.size}
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
                className="dynamic-particle-overlay"
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
          className="gradient-overlay" 
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

        {/* Text Content Overlay - On Top */}
        <div className="text-content-overlay" style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          textAlign: 'left',
          color: textColor || '#ffffff',
          maxWidth: '600px',
          width: '90%'
        }}>
          {textContent.map((text, index) => (
            <div key={text.id} className="text-section" style={{ 
              display: index === 0 ? 'block' : 'none',
              opacity: index === 0 ? 1 : 0
            }}>
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
      </section>
    </>
  );
}



