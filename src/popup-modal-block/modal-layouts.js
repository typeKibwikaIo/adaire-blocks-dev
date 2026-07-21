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
            ['core/heading', { level: 3, content: "We'd Love to Hear From You" }],
            ['core/paragraph', { content: 'Have a question or want to learn more about what we do? Reach out and our team will get back to you within one business day.' }],
            ['core/buttons', {}, [['core/button', { text: 'Get in Touch' }]]],
        ],
    },
    {
        id: 'image-content-split',
        label: 'Image + Content Split',
        bestFor: 'Promotions, product launches and lead generation',
        template: [
            ['core/columns', {}, [
                ['core/column', { width: '45%' }, [['core/image', { alt: 'Featured product' }]]],
                ['core/column', { width: '55%' }, [
                    ['core/heading', { level: 3, content: 'Introducing Our New Collection' }],
                    ['core/paragraph', { content: "Thoughtfully designed and built to last. Discover the pieces everyone's talking about — available now for a limited time." }],
                    ['core/buttons', {}, [['core/button', { text: 'Shop the Collection' }]]],
                ]],
            ]],
        ],
    },
    {
        id: 'newsletter-signup',
        label: 'Newsletter Signup',
        bestFor: 'Email capture and content subscriptions',
        template: [
            ['core/heading', { level: 3, content: 'Join Our Newsletter', textAlign: 'center' }],
            ['core/paragraph', { content: 'Get the latest updates, exclusive offers and fresh ideas delivered straight to your inbox every week.', align: 'center' }],
            ['core/shortcode', { text: '' }],
            ['core/paragraph', { content: 'No spam, ever. Unsubscribe anytime.', align: 'center', fontSize: 'small' }],
        ],
    },
    {
        id: 'promotional-offer',
        label: 'Promotional Offer',
        bestFor: 'E-commerce campaigns and discount codes',
        template: [
            ['core/paragraph', { content: 'LIMITED TIME OFFER', align: 'center' }],
            ['core/heading', { level: 2, content: '20% OFF', textAlign: 'center' }],
            ['core/paragraph', { content: 'Your first order', align: 'center' }],
            ['core/paragraph', { content: 'Use code <strong>WELCOME20</strong> at checkout', align: 'center' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [['core/button', { text: 'Shop the Offer' }]]],
            ['core/paragraph', { content: 'No thanks, maybe later', align: 'center', fontSize: 'small', className: 'adaire-modal-close-trigger' }],
        ],
    },
    {
        id: 'video-modal',
        label: 'Video Modal',
        bestFor: 'Product demos, testimonials and explainer videos',
        template: [
            ['core/embed', {}],
            ['core/heading', { level: 4, content: 'See It in Action' }],
            ['core/paragraph', { content: 'Watch a two-minute walkthrough and see how our platform helps teams ship faster.' }],
        ],
    },
    {
        id: 'announcement',
        label: 'Announcement Modal',
        bestFor: 'Business notices and urgent updates',
        template: [
            ['core/heading', { level: 3, content: 'Holiday Hours Update', textAlign: 'center' }],
            ['core/paragraph', { content: 'Our offices will be closed December 24–26. Orders placed during this time will be processed on the next business day.', align: 'center' }],
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
            ['core/heading', { level: 3, content: 'Before You Go…', textAlign: 'center' }],
            ['core/paragraph', { content: 'Grab our free guide — <strong>10 Proven Tips to Boost Your Conversions</strong> — and start seeing results today.', align: 'center' }],
            ['core/shortcode', { text: '' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [['core/button', { text: 'Send Me the Free Guide' }]]],
        ],
    },
];

export function getModalLayout(id) {
    return MODAL_LAYOUTS.find((layout) => layout.id === id) || MODAL_LAYOUTS[0];
}
