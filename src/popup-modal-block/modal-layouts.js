/**
 * Popup Modal content-layout presets — starter InnerBlocks templates for the
 * modal body. Unlike bento-grid-block's presets (which control CSS grid
 * placement), these just set sensible starting content; users can freely
 * add/remove/reorder blocks afterward like any other InnerBlocks area.
 *
 * `defaultAttrs` (optional) lets a preset also set other block attributes
 * when chosen — e.g. Exit-Intent Lead Capture defaults the open trigger to
 * exit-intent.
 */

export const MODAL_LAYOUTS = [
    {
        id: 'basic',
        label: 'Basic Content Modal',
        bestFor: 'Notices, announcements and simple calls to action',
        template: [
            ['core/heading', { level: 3, placeholder: 'Modal heading…' }],
            ['core/paragraph', { placeholder: 'Supporting text, image, video or custom content.' }],
            ['core/buttons', {}, [['core/button', { text: 'Primary Button' }]]],
        ],
    },
    {
        id: 'image-content-split',
        label: 'Image + Content Split',
        bestFor: 'Promotions, product launches and lead generation',
        template: [
            ['core/columns', {}, [
                ['core/column', { width: '45%' }, [['core/image', {}]]],
                ['core/column', { width: '55%' }, [
                    ['core/heading', { level: 3, placeholder: 'Heading' }],
                    ['core/paragraph', { placeholder: 'Copy' }],
                    ['core/buttons', {}, [['core/button', { text: 'Get Started' }]]],
                ]],
            ]],
        ],
    },
    {
        id: 'newsletter-signup',
        label: 'Newsletter Signup',
        bestFor: 'Email capture and content subscriptions',
        template: [
            ['core/heading', { level: 3, placeholder: 'Join Our Newsletter', textAlign: 'center' }],
            ['core/paragraph', { placeholder: 'Get updates and offers.', align: 'center' }],
            ['core/shortcode', { text: '' }],
            ['core/paragraph', { placeholder: 'No spam. Unsubscribe anytime.', align: 'center', fontSize: 'small' }],
        ],
    },
    {
        id: 'promotional-offer',
        label: 'Promotional Offer',
        bestFor: 'E-commerce campaigns and discount codes',
        template: [
            ['core/paragraph', { placeholder: 'LIMITED OFFER', align: 'center' }],
            ['core/heading', { level: 2, placeholder: '20% OFF', textAlign: 'center' }],
            ['core/paragraph', { placeholder: 'Your first purchase', align: 'center' }],
            ['core/paragraph', { placeholder: 'Use code: WELCOME20', align: 'center' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [['core/button', { text: 'Shop the Offer' }]]],
            ['core/paragraph', { placeholder: 'No thanks', align: 'center', fontSize: 'small', className: 'adaire-modal-close-trigger' }],
        ],
    },
    {
        id: 'video-modal',
        label: 'Video Modal',
        bestFor: 'Product demos, testimonials and explainer videos',
        template: [
            ['core/embed', {}],
            ['core/heading', { level: 4, placeholder: 'Heading' }],
            ['core/paragraph', { placeholder: 'Description' }],
        ],
    },
    {
        id: 'announcement',
        label: 'Announcement Modal',
        bestFor: 'Business notices and urgent updates',
        template: [
            ['core/heading', { level: 3, placeholder: 'Important Update', textAlign: 'center' }],
            ['core/paragraph', { placeholder: 'Service changes, opening hours or event details.', align: 'center' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [
                ['core/button', { text: 'Learn More' }],
                ['core/button', { text: 'Close', className: 'adaire-modal-close-trigger is-style-outline' }],
            ]],
        ],
    },
    {
        id: 'exit-intent-lead-capture',
        label: 'Exit-Intent Lead Capture',
        bestFor: 'Recovering abandoning visitors',
        defaultAttrs: { autoOpen: 'exit-intent' },
        template: [
            ['core/heading', { level: 3, placeholder: 'Before You Leave…', textAlign: 'center' }],
            ['core/paragraph', { placeholder: 'Download our free guide or claim a special offer.', align: 'center' }],
            ['core/shortcode', { text: '' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [['core/button', { text: 'Get the Free Guide' }]]],
        ],
    },
];

export function getModalLayout(id) {
    return MODAL_LAYOUTS.find((layout) => layout.id === id) || MODAL_LAYOUTS[0];
}
