# Block Template - Practical Example

This is a complete, working example of a "Hero Section" block built using the template.

## Example: Hero Section Block

A hero section with:
- Background image
- Heading and description
- CTA button
- Full container and spacing controls from template

### 1. block.json

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "create-block/hero-section",
    "version": "0.1.0",
    "title": "Hero Section",
    "category": "design",
    "icon": "cover-image",
    "description": "A beautiful hero section with background, heading, and call-to-action",
    "supports": {
        "html": false,
        "anchor": true,
        "align": ["wide", "full"],
        "customClassName": true
    },
    "textdomain": "hero-section",
    "editorScript": "file:./index.js",
    "editorStyle": "file:./index.css",
    "style": "file:./style-index.css",
    "attributes": {
        "blockId": { 
            "type": "string", 
            "default": "" 
        },
        
        "containerMode": { 
            "type": "string", 
            "default": "full" 
        },
        "containerMaxWidth": {
            "type": "object",
            "default": {
                "desktop": { "value": 1200, "unit": "px" },
                "tablet": { "value": 100, "unit": "%" },
                "mobile": { "value": 100, "unit": "%" }
            }
        },
        "marginTop": { 
            "type": "object",
            "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
        },
        "marginRight": { 
            "type": "object",
            "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
        },
        "marginBottom": { 
            "type": "object",
            "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
        },
        "marginLeft": { 
            "type": "object",
            "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
        },
        "paddingTop": { 
            "type": "object",
            "default": { "desktop": 80, "tablet": 60, "mobile": 40 }
        },
        "paddingRight": { 
            "type": "object",
            "default": { "desktop": 40, "tablet": 24, "mobile": 16 }
        },
        "paddingBottom": { 
            "type": "object",
            "default": { "desktop": 80, "tablet": 60, "mobile": 40 }
        },
        "paddingLeft": { 
            "type": "object",
            "default": { "desktop": 40, "tablet": 24, "mobile": 16 }
        },
        
        "heading": {
            "type": "string",
            "default": "Welcome to Our Amazing Product"
        },
        "description": {
            "type": "string",
            "default": "Discover the future of innovation with our cutting-edge solutions."
        },
        "buttonText": {
            "type": "string",
            "default": "Get Started"
        },
        "buttonUrl": {
            "type": "string",
            "default": "#"
        },
        "backgroundImage": {
            "type": "string",
            "default": ""
        },
        "backgroundColor": {
            "type": "string",
            "default": "#1a1a1a"
        },
        "textColor": {
            "type": "string",
            "default": "#ffffff"
        },
        "overlayOpacity": {
            "type": "number",
            "default": 0.5
        },
        "headingFontSize": {
            "type": "number",
            "default": 48
        },
        "descriptionFontSize": {
            "type": "number",
            "default": 18
        },
        "textAlign": {
            "type": "string",
            "default": "center"
        }
    }
}
```

### 2. edit.js

```javascript
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, InspectorControls, RichText, MediaUpload } from '@wordpress/block-editor';
import { 
    PanelBody, 
    Button, 
    ButtonGroup, 
    TextControl,
    RangeControl,
    SelectControl,
    __experimentalBoxControl as BoxControl,
    ColorPalette
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');
    
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        heading,
        description,
        buttonText,
        buttonUrl,
        backgroundImage,
        backgroundColor,
        textColor,
        overlayOpacity,
        headingFontSize,
        descriptionFontSize,
        textAlign,
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const blockProps = useBlockProps({
        className: 'hero-section',
        style: {
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            
            marginTop: `${marginTop?.desktop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? 0}px`,
            
            '--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
            '--margin-right-tablet': `${marginRight?.tablet ?? 0}px`,
            '--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
            '--margin-left-tablet': `${marginLeft?.tablet ?? 0}px`,
            '--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
            '--margin-right-mobile': `${marginRight?.mobile ?? 0}px`,
            '--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
            '--margin-left-mobile': `${marginLeft?.mobile ?? 0}px`,
            
            paddingTop: `${paddingTop?.desktop ?? 80}px`,
            paddingRight: `${paddingRight?.desktop ?? 40}px`,
            paddingBottom: `${paddingBottom?.desktop ?? 80}px`,
            paddingLeft: `${paddingLeft?.desktop ?? 40}px`,
            
            '--padding-top-tablet': `${paddingTop?.tablet ?? 60}px`,
            '--padding-right-tablet': `${paddingRight?.tablet ?? 24}px`,
            '--padding-bottom-tablet': `${paddingBottom?.tablet ?? 60}px`,
            '--padding-left-tablet': `${paddingLeft?.tablet ?? 24}px`,
            '--padding-top-mobile': `${paddingTop?.mobile ?? 40}px`,
            '--padding-right-mobile': `${paddingRight?.mobile ?? 16}px`,
            '--padding-bottom-mobile': `${paddingBottom?.mobile ?? 40}px`,
            '--padding-left-mobile': `${paddingLeft?.mobile ?? 16}px`,
            
            '--background-color': backgroundColor,
            '--text-color': textColor,
            '--overlay-opacity': overlayOpacity,
            '--heading-font-size': `${headingFontSize}px`,
            '--description-font-size': `${descriptionFontSize}px`,
            '--text-align': textAlign,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        },
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Container Settings', 'hero-section')} initialOpen={true}>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'hero-section'), value: 'full' },
                            { label: __('Constrained', 'hero-section'), value: 'constrained' },
                        ].map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={containerMode === opt.value}
                                isSecondary={containerMode !== opt.value}
                                onClick={() => setAttributes({ containerMode: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>
                    
                    {containerMode === 'constrained' && (
                        <>
                            <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                {__('Max Width', 'hero-section')}
                            </p>
                            <ButtonGroup style={{ marginBottom: '12px' }}>
                                <Button icon={desktop} isPrimary={deviceType === 'desktop'} onClick={() => setDeviceType('desktop')} />
                                <Button icon={tablet} isPrimary={deviceType === 'tablet'} onClick={() => setDeviceType('tablet')} />
                                <Button icon={mobile} isPrimary={deviceType === 'mobile'} onClick={() => setDeviceType('mobile')} />
                            </ButtonGroup>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextControl
                                    type="number"
                                    value={containerMaxWidth?.[deviceType]?.value ?? (deviceType === 'desktop' ? 1200 : 100)}
                                    onChange={(v) => setAttributes({
                                        containerMaxWidth: {
                                            ...(containerMaxWidth || {}),
                                            [deviceType]: { ...(containerMaxWidth?.[deviceType] || {}), value: Number(v) }
                                        }
                                    })}
                                />
                                <ButtonGroup>
                                    {['px', '%', 'rem', 'vw'].map((u) => (
                                        <Button
                                            key={u}
                                            isPrimary={(containerMaxWidth?.[deviceType]?.unit ?? (deviceType === 'desktop' ? 'px' : '%')) === u}
                                            onClick={() => setAttributes({
                                                containerMaxWidth: {
                                                    ...(containerMaxWidth || {}),
                                                    [deviceType]: { ...(containerMaxWidth?.[deviceType] || {}), unit: u }
                                                }
                                            })}
                                        >{u}</Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Content', 'hero-section')}>
                    <SelectControl
                        label={__('Text Alignment', 'hero-section')}
                        value={textAlign}
                        options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ]}
                        onChange={(v) => setAttributes({ textAlign: v })}
                    />
                    <TextControl
                        label={__('Button URL', 'hero-section')}
                        value={buttonUrl}
                        onChange={(v) => setAttributes({ buttonUrl: v })}
                    />
                </PanelBody>

                <PanelBody title={__('Typography', 'hero-section')}>
                    <RangeControl
                        label={__('Heading Font Size', 'hero-section')}
                        value={headingFontSize}
                        onChange={(v) => setAttributes({ headingFontSize: v })}
                        min={24}
                        max={96}
                    />
                    <RangeControl
                        label={__('Description Font Size', 'hero-section')}
                        value={descriptionFontSize}
                        onChange={(v) => setAttributes({ descriptionFontSize: v })}
                        min={14}
                        max={32}
                    />
                </PanelBody>

                <PanelBody title={__('Background', 'hero-section')}>
                    <MediaUpload
                        onSelect={(media) => setAttributes({ backgroundImage: media.url })}
                        allowedTypes={['image']}
                        render={({ open }) => (
                            <Button onClick={open} variant="secondary">
                                {backgroundImage ? __('Change Image', 'hero-section') : __('Select Image', 'hero-section')}
                            </Button>
                        )}
                    />
                    {backgroundImage && (
                        <Button onClick={() => setAttributes({ backgroundImage: '' })} isDestructive>
                            {__('Remove Image', 'hero-section')}
                        </Button>
                    )}
                    <p>{__('Background Color', 'hero-section')}</p>
                    <ColorPalette value={backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v })} />
                    <RangeControl
                        label={__('Overlay Opacity', 'hero-section')}
                        value={overlayOpacity}
                        onChange={(v) => setAttributes({ overlayOpacity: v })}
                        min={0}
                        max={1}
                        step={0.1}
                    />
                </PanelBody>

                <PanelBody title={__('Colors', 'hero-section')}>
                    <p>{__('Text Color', 'hero-section')}</p>
                    <ColorPalette value={textColor} onChange={(v) => setAttributes({ textColor: v })} />
                </PanelBody>

                <PanelBody title={__('Margins', 'hero-section')} initialOpen={false}>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button icon={desktop} isPrimary={deviceType === 'desktop'} onClick={() => setDeviceType('desktop')} />
                        <Button icon={tablet} isPrimary={deviceType === 'tablet'} onClick={() => setDeviceType('tablet')} />
                        <Button icon={mobile} isPrimary={deviceType === 'mobile'} onClick={() => setDeviceType('mobile')} />
                    </ButtonGroup>
                    <BoxControl
                        values={{
                            top: `${marginTop?.[deviceType] ?? 0}px`,
                            right: `${marginRight?.[deviceType] ?? 0}px`,
                            bottom: `${marginBottom?.[deviceType] ?? 0}px`,
                            left: `${marginLeft?.[deviceType] ?? 0}px`,
                        }}
                        onChange={(value) => setAttributes({
                            marginTop: { ...(marginTop || {}), [deviceType]: parseInt(value.top) || 0 },
                            marginRight: { ...(marginRight || {}), [deviceType]: parseInt(value.right) || 0 },
                            marginBottom: { ...(marginBottom || {}), [deviceType]: parseInt(value.bottom) || 0 },
                            marginLeft: { ...(marginLeft || {}), [deviceType]: parseInt(value.left) || 0 },
                        })}
                    />
                </PanelBody>

                <PanelBody title={__('Padding', 'hero-section')} initialOpen={false}>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button icon={desktop} isPrimary={deviceType === 'desktop'} onClick={() => setDeviceType('desktop')} />
                        <Button icon={tablet} isPrimary={deviceType === 'tablet'} onClick={() => setDeviceType('tablet')} />
                        <Button icon={mobile} isPrimary={deviceType === 'mobile'} onClick={() => setDeviceType('mobile')} />
                    </ButtonGroup>
                    <BoxControl
                        values={{
                            top: `${paddingTop?.[deviceType] ?? 80}px`,
                            right: `${paddingRight?.[deviceType] ?? 40}px`,
                            bottom: `${paddingBottom?.[deviceType] ?? 80}px`,
                            left: `${paddingLeft?.[deviceType] ?? 40}px`,
                        }}
                        onChange={(value) => setAttributes({
                            paddingTop: { ...(paddingTop || {}), [deviceType]: parseInt(value.top) || 0 },
                            paddingRight: { ...(paddingRight || {}), [deviceType]: parseInt(value.right) || 0 },
                            paddingBottom: { ...(paddingBottom || {}), [deviceType]: parseInt(value.bottom) || 0 },
                            paddingLeft: { ...(paddingLeft || {}), [deviceType]: parseInt(value.left) || 0 },
                        })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} data-block-id={blockId}>
                <div className={`hero-section__overlay`} />
                <div className={`hero-section__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                    <RichText
                        tagName="h1"
                        className="hero-section__heading"
                        value={heading}
                        onChange={(v) => setAttributes({ heading: v })}
                        placeholder={__('Enter heading...', 'hero-section')}
                    />
                    <RichText
                        tagName="p"
                        className="hero-section__description"
                        value={description}
                        onChange={(v) => setAttributes({ description: v })}
                        placeholder={__('Enter description...', 'hero-section')}
                    />
                    <div className="hero-section__button">
                        <RichText
                            tagName="span"
                            value={buttonText}
                            onChange={(v) => setAttributes({ buttonText: v })}
                            placeholder={__('Button text...', 'hero-section')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
```

### 3. style.scss

```scss
.hero-section {
    position: relative;
    background-color: var(--background-color, #1a1a1a);
    background-size: cover;
    background-position: center;
    color: var(--text-color, #ffffff);
    overflow: hidden;

    &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, var(--overlay-opacity, 0.5));
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        width: 100%;
        text-align: var(--text-align, center);
        
        &.is-constrained {
            max-width: var(--container-max-width, 1200px);
            margin-left: auto;
            margin-right: auto;
            
            @media (max-width: 1024px) {
                max-width: var(--container-max-width-tablet, 100%);
            }
            
            @media (max-width: 768px) {
                max-width: var(--container-max-width-mobile, 100%);
            }
        }
    }

    &__heading {
        font-size: var(--heading-font-size, 48px);
        font-weight: 700;
        margin: 0 0 1rem;
        line-height: 1.2;

        @media (max-width: 768px) {
            font-size: calc(var(--heading-font-size, 48px) * 0.7);
        }
    }

    &__description {
        font-size: var(--description-font-size, 18px);
        margin: 0 0 2rem;
        line-height: 1.6;
        opacity: 0.9;
    }

    &__button {
        display: inline-block;
        padding: 12px 32px;
        background: #3b82f6;
        color: #ffffff;
        border-radius: 6px;
        font-weight: 600;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
    }

    // Responsive margins
    @media (max-width: 1024px) {
        margin-top: var(--margin-top-tablet, 0) !important;
        margin-right: var(--margin-right-tablet, 0) !important;
        margin-bottom: var(--margin-bottom-tablet, 0) !important;
        margin-left: var(--margin-left-tablet, 0) !important;
    }
    
    @media (max-width: 768px) {
        margin-top: var(--margin-top-mobile, 0) !important;
        margin-right: var(--margin-right-mobile, 0) !important;
        margin-bottom: var(--margin-bottom-mobile, 0) !important;
        margin-left: var(--margin-left-mobile, 0) !important;
    }
    
    // Responsive padding
    @media (max-width: 1024px) {
        padding-top: var(--padding-top-tablet, 60px) !important;
        padding-right: var(--padding-right-tablet, 24px) !important;
        padding-bottom: var(--padding-bottom-tablet, 60px) !important;
        padding-left: var(--padding-left-tablet, 24px) !important;
    }
    
    @media (max-width: 768px) {
        padding-top: var(--padding-top-mobile, 40px) !important;
        padding-right: var(--padding-right-mobile, 16px) !important;
        padding-bottom: var(--padding-bottom-mobile, 40px) !important;
        padding-left: var(--padding-left-mobile, 16px) !important;
    }
}
```

## Key Takeaways from This Example

### ✅ What We Added
- Custom content attributes (heading, description, button)
- Background image with MediaUpload
- Typography controls (font sizes)
- Color controls
- Text alignment
- Overlay opacity

### ✅ What We Kept from Template
- Container mode (full/constrained)
- Responsive max width
- Responsive margins
- Responsive padding
- Device switcher UI
- BoxControl for spacing
- CSS variable pattern

### ✅ Best Practices Demonstrated
1. **Structured InspectorControls**: Organized into logical panels
2. **Responsive Defaults**: Sensible padding defaults for each device
3. **CSS Variables**: All values accessible via variables
4. **RichText**: Editable content in the editor
5. **Media Upload**: WordPress native image selector
6. **Fallback Values**: Always using `??` operator
7. **BEM Naming**: Consistent class structure

## Result

This example creates a fully functional, production-ready hero section block with:
- ✅ Professional container controls
- ✅ Complete responsive spacing
- ✅ Rich editing experience
- ✅ Clean, maintainable code
- ✅ WordPress best practices

Use this as a reference when building your own blocks with the template! 🚀

