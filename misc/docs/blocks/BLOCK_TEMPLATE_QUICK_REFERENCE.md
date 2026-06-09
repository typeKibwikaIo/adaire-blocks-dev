# Block Template - Quick Reference Card

Copy-paste snippets for common patterns used in the template.

## 📋 Block.json Attributes

### Container Mode & Max Width
```json
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
}
```

### Responsive Margins (Object Pattern)
```json
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
}
```

### Simple Margins (Number Pattern)
```json
"marginTop": { "type": "number", "default": 0 },
"marginRight": { "type": "number", "default": 0 },
"marginBottom": { "type": "number", "default": 0 },
"marginLeft": { "type": "number", "default": 0 }
```

### Responsive Padding
```json
"paddingTop": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"paddingRight": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"paddingBottom": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"paddingLeft": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
}
```

## 🎨 Edit.js Imports

```javascript
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { 
    PanelBody, 
    Button, 
    ButtonGroup, 
    TextControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
```

## 🎛️ Edit.js - Device Type State

```javascript
const [deviceType, setDeviceType] = useState('desktop');
```

## 🖌️ Edit.js - blockProps Style

### Container Max Width CSS Variables
```javascript
'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
```

### Responsive Margins (Object Pattern)
```javascript
// Desktop (inline for editor)
marginTop: `${marginTop?.desktop ?? 0}px`,
marginRight: `${marginRight?.desktop ?? 0}px`,
marginBottom: `${marginBottom?.desktop ?? 0}px`,
marginLeft: `${marginLeft?.desktop ?? 0}px`,

// Tablet & Mobile (CSS variables)
'--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
'--margin-right-tablet': `${marginRight?.tablet ?? 0}px`,
'--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
'--margin-left-tablet': `${marginLeft?.tablet ?? 0}px`,

'--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
'--margin-right-mobile': `${marginRight?.mobile ?? 0}px`,
'--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
'--margin-left-mobile': `${marginLeft?.mobile ?? 0}px`,
```

### Simple Margins (Number Pattern)
```javascript
marginTop: `${marginTop}px`,
marginRight: `${marginRight}px`,
marginBottom: `${marginBottom}px`,
marginLeft: `${marginLeft}px`,
```

### Responsive Padding
```javascript
// Desktop (inline for editor)
paddingTop: `${paddingTop?.desktop ?? 0}px`,
paddingRight: `${paddingRight?.desktop ?? 0}px`,
paddingBottom: `${paddingBottom?.desktop ?? 0}px`,
paddingLeft: `${paddingLeft?.desktop ?? 0}px`,

// Tablet & Mobile (CSS variables)
'--padding-top-tablet': `${paddingTop?.tablet ?? 0}px`,
'--padding-right-tablet': `${paddingRight?.tablet ?? 0}px`,
'--padding-bottom-tablet': `${paddingBottom?.tablet ?? 0}px`,
'--padding-left-tablet': `${paddingLeft?.tablet ?? 0}px`,

'--padding-top-mobile': `${paddingTop?.mobile ?? 0}px`,
'--padding-right-mobile': `${paddingRight?.mobile ?? 0}px`,
'--padding-bottom-mobile': `${paddingBottom?.mobile ?? 0}px`,
'--padding-left-mobile': `${paddingLeft?.mobile ?? 0}px`,
```

## 🎚️ InspectorControls - Container Settings Panel

```javascript
<PanelBody title={__('Container Settings', 'your-block-name')} initialOpen={true}>
    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
        {__('Container Mode', 'your-block-name')}
    </p>
    <ButtonGroup>
        {[
            { label: __('Full Width', 'your-block-name'), value: 'full' },
            { label: __('Constrained', 'your-block-name'), value: 'constrained' },
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
                {__('Max Width', 'your-block-name')}
            </p>
            <ButtonGroup style={{ marginBottom: '12px' }}>
                <Button
                    icon={desktop}
                    isPrimary={deviceType === 'desktop'}
                    onClick={() => setDeviceType('desktop')}
                    label={__('Desktop', 'your-block-name')}
                />
                <Button
                    icon={tablet}
                    isPrimary={deviceType === 'tablet'}
                    onClick={() => setDeviceType('tablet')}
                    label={__('Tablet', 'your-block-name')}
                />
                <Button
                    icon={mobile}
                    isPrimary={deviceType === 'mobile'}
                    onClick={() => setDeviceType('mobile')}
                    label={__('Mobile', 'your-block-name')}
                />
            </ButtonGroup>
            <div style={{ display: 'flex', gap: '8px' }}>
                <TextControl
                    type="number"
                    value={
                        containerMaxWidth?.[deviceType]?.value ?? 
                        (deviceType === 'desktop' ? 1200 : 100)
                    }
                    onChange={(v) =>
                        setAttributes({
                            containerMaxWidth: {
                                ...(containerMaxWidth || {}),
                                [deviceType]: {
                                    ...(containerMaxWidth?.[deviceType] || {}),
                                    value: Number(v),
                                },
                            },
                        })
                    }
                />
                <ButtonGroup>
                    {['px', '%', 'rem', 'vw'].map((u) => (
                        <Button
                            key={u}
                            isPrimary={
                                (containerMaxWidth?.[deviceType]?.unit ??
                                    (deviceType === 'desktop' ? 'px' : '%')) === u
                            }
                            isSecondary={
                                (containerMaxWidth?.[deviceType]?.unit ??
                                    (deviceType === 'desktop' ? 'px' : '%')) !== u
                            }
                            onClick={() =>
                                setAttributes({
                                    containerMaxWidth: {
                                        ...(containerMaxWidth || {}),
                                        [deviceType]: {
                                            ...(containerMaxWidth?.[deviceType] || {}),
                                            unit: u,
                                        },
                                    },
                                })
                            }
                        >
                            {u}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>
        </>
    )}
</PanelBody>
```

## 🎚️ InspectorControls - Margins Panel (BoxControl)

```javascript
<PanelBody title={__('Margins', 'your-block-name')} initialOpen={false}>
    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
        {__('Device', 'your-block-name')}
    </p>
    <ButtonGroup style={{ marginBottom: '12px' }}>
        <Button
            icon={desktop}
            isPrimary={deviceType === 'desktop'}
            onClick={() => setDeviceType('desktop')}
            label={__('Desktop', 'your-block-name')}
        />
        <Button
            icon={tablet}
            isPrimary={deviceType === 'tablet'}
            onClick={() => setDeviceType('tablet')}
            label={__('Tablet', 'your-block-name')}
        />
        <Button
            icon={mobile}
            isPrimary={deviceType === 'mobile'}
            onClick={() => setDeviceType('mobile')}
            label={__('Mobile', 'your-block-name')}
        />
    </ButtonGroup>
    <BoxControl
        label={__('Margin', 'your-block-name')}
        values={{
            top: `${marginTop?.[deviceType] ?? 0}px`,
            right: `${marginRight?.[deviceType] ?? 0}px`,
            bottom: `${marginBottom?.[deviceType] ?? 0}px`,
            left: `${marginLeft?.[deviceType] ?? 0}px`,
        }}
        onChange={(value) => {
            setAttributes({
                marginTop: { ...(marginTop || {}), [deviceType]: parseInt(value.top) || 0 },
                marginRight: { ...(marginRight || {}), [deviceType]: parseInt(value.right) || 0 },
                marginBottom: { ...(marginBottom || {}), [deviceType]: parseInt(value.bottom) || 0 },
                marginLeft: { ...(marginLeft || {}), [deviceType]: parseInt(value.left) || 0 },
            });
        }}
    />
</PanelBody>
```

## 🎚️ InspectorControls - Margins Panel (RangeControls)

```javascript
<PanelBody title={__('Margins', 'your-block-name')} initialOpen={false}>
    <RangeControl
        label={__('Margin Top', 'your-block-name')}
        value={marginTop}
        onChange={(v) => setAttributes({ marginTop: v })}
        min={0}
        max={200}
    />
    <RangeControl
        label={__('Margin Right', 'your-block-name')}
        value={marginRight}
        onChange={(v) => setAttributes({ marginRight: v })}
        min={0}
        max={200}
    />
    <RangeControl
        label={__('Margin Bottom', 'your-block-name')}
        value={marginBottom}
        onChange={(v) => setAttributes({ marginBottom: v })}
        min={0}
        max={200}
    />
    <RangeControl
        label={__('Margin Left', 'your-block-name')}
        value={marginLeft}
        onChange={(v) => setAttributes({ marginLeft: v })}
        min={0}
        max={200}
    />
</PanelBody>
```

## 📱 SCSS - Container Styles

```scss
.your-block {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    
    &__container {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        
        &.is-constrained {
            max-width: var(--container-max-width, 1200px) !important;
        }
    }
    
    // Responsive container max-width for tablet
    @media (max-width: 1024px) {
        &__container.is-constrained {
            max-width: var(--container-max-width-tablet, var(--container-max-width, 100%)) !important;
        }
    }
    
    // Responsive container max-width for mobile
    @media (max-width: 768px) {
        &__container.is-constrained {
            max-width: var(--container-max-width-mobile, var(--container-max-width-tablet, 100%)) !important;
        }
    }
}
```

## 📱 SCSS - Responsive Margins

```scss
.your-block {
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
}
```

## 📱 SCSS - Responsive Padding

```scss
.your-block {
    @media (max-width: 1024px) {
        padding-top: var(--padding-top-tablet, 0) !important;
        padding-right: var(--padding-right-tablet, 0) !important;
        padding-bottom: var(--padding-bottom-tablet, 0) !important;
        padding-left: var(--padding-left-tablet, 0) !important;
    }
    
    @media (max-width: 768px) {
        padding-top: var(--padding-top-mobile, 0) !important;
        padding-right: var(--padding-right-mobile, 0) !important;
        padding-bottom: var(--padding-bottom-mobile, 0) !important;
        padding-left: var(--padding-left-mobile, 0) !important;
    }
}
```

## 🏷️ JSX - Block Wrapper

```jsx
<div {...blockProps} data-block-id={blockId}>
    <div className={`your-block__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
        {/* Your content here */}
    </div>
</div>
```

## 🔑 Key Patterns Summary

| Pattern | Use Case | Example Block |
|---------|----------|---------------|
| Object margins | Full responsive control | posts-grid-block |
| Simple margins | Non-responsive margins | tabs-block |
| Horizontal margins only | Left/right responsive only | accordion-block |
| Container max width | All blocks | All blocks |
| BoxControl | Better UX for spacing | posts-grid-block |
| RangeControl | Simple number values | tabs-block, accordion-block |

## 💾 Save.js - Same as Edit.js

The `save.js` file uses the **exact same style object** as `edit.js`. Just copy the entire `style` object from `blockProps` in edit.js to `blockProps.save()` in save.js.

---

**Pro Tip**: Keep this reference open while building your block for quick copy-paste access to these patterns! 🚀

