import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import './style.scss';

export default function Edit({ attributes, clientId }) {
    const { tabIndex } = attributes;

    // Get the parent tabs block's active tab
    const { parentActiveTab } = useSelect((select) => {
        const { getBlockParents, getBlock } = select('core/block-editor');
        const parents = getBlockParents(clientId);
        
        // Find the tabs block in the parent chain
        let tabsBlock = null;
        for (let i = 0; i < parents.length; i++) {
            const parent = getBlock(parents[i]);
            if (parent && parent.name === 'create-block/tabs-block') {
                tabsBlock = parent;
                break;
            }
        }
        
        return {
            parentActiveTab: tabsBlock?.attributes?.activeTab ?? 0,
        };
    }, [clientId]);

    const isActive = tabIndex === parentActiveTab;

    // Debug logging
    const blockProps = useBlockProps({
        className: `adaire-tab-panel ${isActive ? 'is-active' : ''}`,
        'data-tab-index': tabIndex,
        style: {
            display: isActive ? 'block' : 'none',
            height: isActive ? 'auto' : '0',
            overflow: isActive ? 'visible' : 'hidden',
            opacity: isActive ? 1 : 0,
            visibility: isActive ? 'visible' : 'hidden',
            position: isActive ? 'relative' : 'absolute',
            top: isActive ? 'auto' : 0,
            left: isActive ? 'auto' : 0,
            right: isActive ? 'auto' : 0,
        },
    });

    const DEMO_TEMPLATES = [
        // Tab 0 — Features
        [
            ['core/heading', { level: 3, content: 'Powerful Features Built for Everyone', style: { color: { text: '#503AA8' } }, textColor: undefined }],
            ['core/paragraph', { content: 'Our block gives you everything you need to create beautiful tabbed layouts — no coding required. Organise your content into clear sections that visitors can navigate with a single click.' }],
            ['core/list', { values: '<li>Fully responsive on all screen sizes</li><li>Smooth animated tab transitions</li><li>Customisable colours, fonts, and spacing</li><li>Horizontal and vertical tab layouts</li>' }],
        ],
        // Tab 1 — Pricing
        [
            ['core/heading', { level: 3, content: 'Simple, Transparent Pricing', style: { color: { text: '#503AA8' } }, textColor: undefined }],
            ['core/paragraph', { content: 'Use the Tabbed Content block to showcase different pricing tiers side by side. Switch between monthly and annual plans, or compare free vs premium features — all within the same block.' }],
            ['core/paragraph', { content: 'Pair this block with the Pricing Table block for a complete, conversion-ready pricing section that keeps your page clean and scannable.' }],
        ],
        // Tab 2 — FAQ
        [
            ['core/heading', { level: 3, content: 'Frequently Asked Questions', style: { color: { text: '#503AA8' } }, textColor: undefined }],
            ['core/paragraph', { content: 'Use tabs to group your FAQs by topic, making it easy for visitors to find the answers they need without scrolling through a long page.' }],
            ['core/paragraph', { content: '<strong>How do I add a new tab?</strong> Select the Tabbed Content block and click the "Add Tab" button in the block toolbar or settings panel.' }],
            ['core/paragraph', { content: '<strong>Can I reorder tabs?</strong> Yes — use the arrow buttons next to each tab title in the settings panel to move tabs left or right.' }],
        ],
    ];

    const template = DEMO_TEMPLATES[tabIndex] ?? DEMO_TEMPLATES[0];

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-tab-panel__content' },
        {
            template,
            templateLock: false,
            renderAppender: isActive ? undefined : false,
        }
    );

    return (
        <div {...blockProps}>
            <div {...innerBlocksProps} />
        </div>
    );
}




