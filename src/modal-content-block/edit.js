import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

const TEMPLATE = [
    ['core/heading',   { level: 3, placeholder: __('Modal title…', 'modal-block') }],
    ['core/paragraph', { placeholder: __('Add description, media, or any other blocks…', 'modal-block') }],
];

export default function Edit({ attributes, setAttributes }) {
    const { contentPadding } = attributes;

    const pad = {
        top:    contentPadding?.top    ?? 24,
        right:  contentPadding?.right  ?? 24,
        bottom: contentPadding?.bottom ?? 24,
        left:   contentPadding?.left   ?? 24,
    };

    const setPad = (side, value) =>
        setAttributes({ contentPadding: { ...pad, [side]: value } });

    const blockProps = useBlockProps({
        className: 'adaire-modal-content-block',
        style: {
            '--content-padding-top':    `${pad.top}px`,
            '--content-padding-right':  `${pad.right}px`,
            '--content-padding-bottom': `${pad.bottom}px`,
            '--content-padding-left':   `${pad.left}px`,
        },
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        template: TEMPLATE,
        templateLock: false,
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Content Padding', 'modal-block')} initialOpen={true}>
                    <RangeControl
                        label={__('Top (px)',    'modal-block')}
                        value={pad.top}
                        onChange={(v) => setPad('top', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Right (px)',  'modal-block')}
                        value={pad.right}
                        onChange={(v) => setPad('right', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Bottom (px)', 'modal-block')}
                        value={pad.bottom}
                        onChange={(v) => setPad('bottom', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Left (px)',   'modal-block')}
                        value={pad.left}
                        onChange={(v) => setPad('left', v)}
                        min={0} max={80} step={2}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...innerBlocksProps} />
        </>
    );
}
