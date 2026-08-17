import { __ } from '@wordpress/i18n';
import {
    ColorPalette,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    useBlockProps,
} from '@wordpress/block-editor';
import {
    Button,
    PanelBody,
    RangeControl,
    SelectControl,
    TextControl,
    TextareaControl,
    ToggleControl,
} from '@wordpress/components';
import InspectorTabs from '../components/InspectorTabs';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const a = attributes;
    const hasPdf = !!a.pdfUrl;

    const blockProps = useBlockProps({
        className: `adaire-pdf-reader${a.shadow ? ' has-shadow' : ''}`,
        style: {
            '--ad-accent': a.accentColor,
            '--ad-bg': a.backgroundType === 'gradient' ? a.backgroundGradient : a.backgroundColor,
            '--ad-color': a.textColor,
            '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
            '--ad-button-color': a.buttonColor || a.accentColor,
            '--ad-button-width': a.buttonWidth || 'auto',
            '--ad-button-height': a.buttonHeight || 'auto',
            '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
            '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
            '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
            '--ad-frame-border': a.frameBorderColor || '#e5e7eb',
            '--ad-radius': (a.borderRadius || 18) + 'px',
        },
    });

    const onSelectPdf = (media) => setAttributes({
        pdfUrl: media.url,
        fileName: media.filename || media.title || a.fileName,
    });

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
                <PanelBody section="content" title={__('PDF File', 'adaire-blocks')} initialOpen={true}>
                    <MediaUploadCheck>
                        <MediaUpload
                            allowedTypes={['application/pdf']}
                            value={a.pdfUrl}
                            onSelect={onSelectPdf}
                            render={({ open }) => (
                                <Button variant="secondary" onClick={open} style={{ width: '100%', marginBottom: '8px' }}>
                                    {hasPdf ? __('Replace PDF', 'adaire-blocks') : __('Select PDF', 'adaire-blocks')}
                                </Button>
                            )}
                        />
                    </MediaUploadCheck>
                    {hasPdf && (
                        <Button variant="link" isDestructive onClick={() => setAttributes({ pdfUrl: '' })} style={{ marginBottom: '12px' }}>
                            {__('Remove PDF', 'adaire-blocks')}
                        </Button>
                    )}
                    <TextControl label={__('File name', 'adaire-blocks')} value={a.fileName || ''} onChange={(v) => setAttributes({ fileName: v })} />
                    <TextControl label={__('File size', 'adaire-blocks')} value={a.fileSize || ''} onChange={(v) => setAttributes({ fileSize: v })} />
                    <TextControl label={__('Page count', 'adaire-blocks')} value={a.pageCount || ''} onChange={(v) => setAttributes({ pageCount: v })} />
                    <TextControl label={__('Password hint', 'adaire-blocks')} value={a.passwordHint || ''} onChange={(v) => setAttributes({ passwordHint: v })} />
                    <TextareaControl
                        label={__('Fallback message', 'adaire-blocks')}
                        help={__('Shown instead of the viewer when no PDF has been uploaded yet.', 'adaire-blocks')}
                        value={a.fallbackMessage || ''}
                        onChange={(v) => setAttributes({ fallbackMessage: v })}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Buttons', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl label={__('Show download button', 'adaire-blocks')} checked={!!a.showDownload} onChange={(v) => setAttributes({ showDownload: v })} />
                    <ToggleControl label={__('Show open button', 'adaire-blocks')} checked={!!a.showOpen} onChange={(v) => setAttributes({ showOpen: v })} />
                    <ToggleControl label={__('Show icon on buttons', 'adaire-blocks')} checked={!!a.showIcon} onChange={(v) => setAttributes({ showIcon: v })} />
                    <TextControl
                        label={__('Open button URL override', 'adaire-blocks')}
                        help={__('Optional. Leave blank to open the uploaded PDF directly.', 'adaire-blocks')}
                        value={a.buttonUrl === '#' ? '' : (a.buttonUrl || '')}
                        onChange={(v) => setAttributes({ buttonUrl: v || '#' })}
                    />
                </PanelBody>

                <PanelBody section="layout" title={__('Viewer', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl label={__('Viewer height', 'adaire-blocks')} value={a.viewerHeight || 640} onChange={(v) => setAttributes({ viewerHeight: v })} min={240} max={1200} />
                    <RangeControl label={__('Corner radius', 'adaire-blocks')} value={a.borderRadius || 18} onChange={(v) => setAttributes({ borderRadius: v })} min={0} max={80} />
                    <ToggleControl label={__('Shadow', 'adaire-blocks')} checked={!!a.shadow} onChange={(v) => setAttributes({ shadow: v })} />
                </PanelBody>

                <PanelBody section="layout" title={__('Button Size', 'adaire-blocks')} initialOpen={false}>
                    <TextControl label={__('Button width', 'adaire-blocks')} help={__('Use CSS values like auto, 100%, 180px.', 'adaire-blocks')} value={a.buttonWidth || 'auto'} onChange={(v) => setAttributes({ buttonWidth: v })} />
                    <TextControl label={__('Button height', 'adaire-blocks')} help={__('Use CSS values like auto, 48px, 3rem.', 'adaire-blocks')} value={a.buttonHeight || 'auto'} onChange={(v) => setAttributes({ buttonHeight: v })} />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Colors', 'adaire-blocks')} initialOpen={false}>
                    <p>{__('Accent color', 'adaire-blocks')}</p>
                    <ColorPalette value={a.accentColor} onChange={(v) => setAttributes({ accentColor: v || '#d52940' })} />
                    <p>{__('Background color', 'adaire-blocks')}</p>
                    <ColorPalette value={a.backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '#111827' })} />
                    <p>{__('Text color', 'adaire-blocks')}</p>
                    <ColorPalette value={a.textColor} onChange={(v) => setAttributes({ textColor: v || '#ffffff' })} />
                    <SelectControl
                        label={__('Background type', 'adaire-blocks')}
                        value={a.backgroundType || 'solid'}
                        options={[
                            { label: 'Solid color', value: 'solid' },
                            { label: 'Gradient', value: 'gradient' },
                            { label: 'Image', value: 'image' },
                        ]}
                        onChange={(v) => setAttributes({ backgroundType: v })}
                    />
                    {a.backgroundType === 'image' && (
                        <MediaUploadCheck>
                            <MediaUpload
                                allowedTypes={['image']}
                                value={a.backgroundImage}
                                onSelect={(m) => setAttributes({ backgroundImage: m.url })}
                                render={({ open }) => (
                                    <Button variant="secondary" onClick={open}>
                                        {a.backgroundImage ? __('Change background image', 'adaire-blocks') : __('Select background image', 'adaire-blocks')}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                    )}
                    {a.backgroundType === 'gradient' && (
                        <TextControl label={__('Gradient CSS', 'adaire-blocks')} value={a.backgroundGradient || ''} onChange={(v) => setAttributes({ backgroundGradient: v })} />
                    )}
                    <p>{__('Frame border color', 'adaire-blocks')}</p>
                    <ColorPalette value={a.frameBorderColor} onChange={(v) => setAttributes({ frameBorderColor: v || '#e5e7eb' })} />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Button Style', 'adaire-blocks')} initialOpen={false}>
                    <p>{__('Button color', 'adaire-blocks')}</p>
                    <ColorPalette value={a.buttonColor} onChange={(v) => setAttributes({ buttonColor: v || a.accentColor })} />
                    <SelectControl
                        label={__('Button hover effect', 'adaire-blocks')}
                        value={a.buttonHoverEffect || 'lift'}
                        options={[
                            { label: 'Lift', value: 'lift' },
                            { label: 'Glow', value: 'glow' },
                            { label: 'Darken', value: 'darken' },
                            { label: 'None', value: 'none' },
                        ]}
                        onChange={(v) => setAttributes({ buttonHoverEffect: v })}
                    />
                    <p>{__('Button hover text', 'adaire-blocks')}</p>
                    <ColorPalette value={a.buttonHoverColor} onChange={(v) => setAttributes({ buttonHoverColor: v || '#ffffff' })} />
                    <p>{__('Button hover background', 'adaire-blocks')}</p>
                    <ColorPalette value={a.buttonHoverBackgroundColor} onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || '#111827' })} />
                    <p>{__('Button hover border', 'adaire-blocks')}</p>
                    <ColorPalette value={a.buttonHoverBorderColor} onChange={(v) => setAttributes({ buttonHoverBorderColor: v || '#111827' })} />
                </PanelBody>
            </InspectorTabs>

            <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}>
                <RichText tagName="p" className="adaire-pdf-reader__eyebrow" value={a.eyebrow} onChange={(v) => setAttributes({ eyebrow: v })} placeholder={__('Eyebrow…', 'adaire-blocks')} />
                <RichText tagName="h2" className="adaire-pdf-reader__heading" value={a.heading} onChange={(v) => setAttributes({ heading: v })} placeholder={__('Heading…', 'adaire-blocks')} />
                <RichText tagName="p" className="adaire-pdf-reader__text" value={a.text} onChange={(v) => setAttributes({ text: v })} placeholder={__('Description…', 'adaire-blocks')} />

                {!hasPdf && (
                    <div className="adaire-pdf-reader__upload-box">
                        <p>{a.fallbackMessage || __('No PDF has been uploaded yet.', 'adaire-blocks')}</p>
                        <MediaUploadCheck>
                            <MediaUpload
                                allowedTypes={['application/pdf']}
                                value={a.pdfUrl}
                                onSelect={onSelectPdf}
                                render={({ open }) => (
                                    <Button variant="primary" onClick={open}>
                                        {__('Upload PDF', 'adaire-blocks')}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                    </div>
                )}

                {hasPdf && (
                    <>
                        <iframe
                            className="adaire-pdf-reader__viewer"
                            src={a.pdfUrl}
                            title={a.fileName || __('PDF document', 'adaire-blocks')}
                            style={{ minHeight: (a.viewerHeight || 640) + 'px' }}
                        />
                        {(a.fileName || a.fileSize || a.pageCount) && (
                            <p className="adaire-pdf-reader__meta">
                                {[a.fileName, a.fileSize, a.pageCount ? a.pageCount + ' ' + __('pages', 'adaire-blocks') : ''].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        {a.passwordHint && (
                            <p className="adaire-pdf-reader__meta">{__('Password:', 'adaire-blocks')} {a.passwordHint}</p>
                        )}
                        <div className="adaire-pdf-reader__actions">
                            {a.showDownload && (
                                <a className="adaire-pdf-reader__button" href={a.pdfUrl} download>
                                    {a.showIcon ? '↓ ' : ''}
                                    <RichText tagName="span" value={a.buttonText} onChange={(v) => setAttributes({ buttonText: v })} />
                                </a>
                            )}
                            {a.showOpen && (
                                <a className="adaire-pdf-reader__button is-secondary" href={a.buttonUrl && a.buttonUrl !== '#' ? a.buttonUrl : a.pdfUrl} target="_blank" rel="noreferrer">
                                    {a.showIcon ? '↗ ' : ''}{__('Open', 'adaire-blocks')}
                                </a>
                            )}
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
