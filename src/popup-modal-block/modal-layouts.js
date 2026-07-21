/**
 * Popup Modal content-layout presets — starter InnerBlocks templates for the
 * modal body. Unlike bento-grid-block's presets (which control CSS grid
 * placement), these just set sensible starting content; users can freely
 * add/remove/reorder blocks afterward like any other InnerBlocks area.
 *
 * Each template ships with inline styling (typography / spacing / colour /
 * button styles) so a freshly-inserted modal already looks polished on any
 * theme, rather than a stack of unstyled default blocks.
 *
 * Shared palette:
 *   heading  #1f2937   body  #6b7280   accent  #7c3aed
 *
 * `defaultAttrs` (optional) lets a preset also set other block attributes
 * when chosen — e.g. Exit-Intent Lead Capture defaults the open trigger to
 * exit-intent.
 */

// ─── Reusable style fragments ─────────────────────────────────────────────────

const HEADING = (fontSize, marginBottom = '12px') => ({
    style: {
        typography: { fontSize, fontWeight: '700', lineHeight: '1.25' },
        spacing: { margin: { top: '0', bottom: marginBottom } },
        color: { text: '#1f2937' },
    },
});

const BODY = (marginBottom = '20px') => ({
    style: {
        typography: { fontSize: '16px', lineHeight: '1.6' },
        spacing: { margin: { top: '0', bottom: marginBottom } },
        color: { text: '#6b7280' },
    },
});

const EYEBROW = {
    style: {
        typography: {
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
        },
        spacing: { margin: { top: '0', bottom: '8px' } },
        color: { text: '#7c3aed' },
    },
};

const FINEPRINT = {
    style: {
        typography: { fontSize: '13px', lineHeight: '1.5' },
        spacing: { margin: { top: '16px', bottom: '0' } },
        color: { text: '#9ca3af' },
    },
};

const PRIMARY_BUTTON = (text) => [
    'core/button',
    {
        text,
        style: {
            color: { background: '#111827', text: '#ffffff' },
            border: { radius: '8px' },
            spacing: { padding: { top: '12px', bottom: '12px', left: '28px', right: '28px' } },
            typography: { fontWeight: '600' },
        },
    },
];

// ─── Presets ──────────────────────────────────────────────────────────────────

export const MODAL_LAYOUTS = [
    {
        id: 'basic',
        label: 'Basic Content Modal',
        bestFor: 'Notices, announcements and simple calls to action',
        template: [
            ['core/heading', { level: 3, content: "We'd Love to Hear From You", ...HEADING('1.6rem') }],
            ['core/paragraph', { content: 'Have a question or want to learn more about what we do? Reach out and our team will get back to you within one business day.', ...BODY() }],
            ['core/buttons', {}, [PRIMARY_BUTTON('Get in Touch')]],
        ],
    },
    {
        id: 'image-content-split',
        label: 'Image + Content Split',
        bestFor: 'Promotions, product launches and lead generation',
        template: [
            ['core/columns', {
                verticalAlignment: 'center',
                style: { spacing: { blockGap: { top: '0', left: '28px' } } },
            }, [
                ['core/column', { width: '45%', verticalAlignment: 'center' }, [
                    ['core/image', { alt: 'Featured product', style: { border: { radius: '12px' } } }],
                ]],
                ['core/column', { width: '55%', verticalAlignment: 'center' }, [
                    ['core/heading', { level: 3, content: 'Introducing Our New Collection', ...HEADING('1.5rem') }],
                    ['core/paragraph', { content: "Thoughtfully designed and built to last. Discover the pieces everyone's talking about — available now for a limited time.", ...BODY() }],
                    ['core/buttons', {}, [PRIMARY_BUTTON('Shop the Collection')]],
                ]],
            ]],
        ],
    },
    {
        id: 'newsletter-signup',
        label: 'Newsletter Signup',
        bestFor: 'Email capture and content subscriptions',
        template: [
            ['core/heading', { level: 3, content: 'Join Our Newsletter', textAlign: 'center', ...HEADING('1.75rem') }],
            ['core/paragraph', { content: 'Get the latest updates, exclusive offers and fresh ideas delivered straight to your inbox every week.', align: 'center', ...BODY('20px') }],
            ['core/shortcode', { text: '' }],
            ['core/paragraph', { content: 'No spam, ever. Unsubscribe anytime.', align: 'center', ...FINEPRINT }],
        ],
    },
    {
        id: 'promotional-offer',
        label: 'Promotional Offer',
        bestFor: 'E-commerce campaigns and discount codes',
        template: [
            ['core/paragraph', { content: 'LIMITED TIME OFFER', align: 'center', ...EYEBROW }],
            ['core/heading', {
                level: 2, content: '20% OFF', textAlign: 'center',
                style: {
                    typography: { fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', letterSpacing: '-0.02em' },
                    spacing: { margin: { top: '0', bottom: '8px' } },
                    color: { text: '#111827' },
                },
            }],
            ['core/paragraph', {
                content: 'Your first order', align: 'center',
                style: {
                    typography: { fontSize: '18px' },
                    spacing: { margin: { top: '0', bottom: '20px' } },
                    color: { text: '#6b7280' },
                },
            }],
            ['core/paragraph', {
                content: 'Use code <strong>WELCOME20</strong> at checkout', align: 'center',
                style: {
                    typography: { fontSize: '15px', letterSpacing: '0.02em' },
                    spacing: { margin: { top: '0', bottom: '24px' } },
                    color: { text: '#1f2937' },
                },
            }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [PRIMARY_BUTTON('Shop the Offer')]],
            ['core/paragraph', { content: 'No thanks, maybe later', align: 'center', className: 'adaire-modal-close-trigger', ...FINEPRINT }],
        ],
    },
    {
        id: 'video-modal',
        label: 'Video Modal',
        bestFor: 'Product demos, testimonials and explainer videos',
        template: [
            ['core/embed', { style: { spacing: { margin: { bottom: '20px' } } } }],
            ['core/heading', { level: 4, content: 'See It in Action', ...HEADING('1.35rem', '8px') }],
            ['core/paragraph', { content: 'Watch a two-minute walkthrough and see how our platform helps teams ship faster.', ...BODY('0') }],
        ],
    },
    {
        id: 'announcement',
        label: 'Announcement Modal',
        bestFor: 'Business notices and urgent updates',
        template: [
            ['core/heading', { level: 3, content: 'Holiday Hours Update', textAlign: 'center', ...HEADING('1.5rem') }],
            ['core/paragraph', { content: 'Our offices will be closed December 24–26. Orders placed during this time will be processed on the next business day.', align: 'center', ...BODY('24px') }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [
                PRIMARY_BUTTON('Learn More'),
                ['core/button', {
                    text: 'Close',
                    className: 'adaire-modal-close-trigger is-style-outline',
                    style: {
                        border: { radius: '8px', width: '1px', color: '#d1d5db' },
                        color: { text: '#374151' },
                        spacing: { padding: { top: '12px', bottom: '12px', left: '28px', right: '28px' } },
                        typography: { fontWeight: '600' },
                    },
                }],
            ]],
        ],
    },
    {
        id: 'exit-intent-lead-capture',
        label: 'Exit-Intent Lead Capture',
        bestFor: 'Recovering abandoning visitors',
        defaultAttrs: { autoOpen: 'exit-intent' },
        template: [
            ['core/heading', { level: 3, content: 'Before You Go…', textAlign: 'center', ...HEADING('1.75rem') }],
            ['core/paragraph', { content: 'Grab our free guide — <strong>10 Proven Tips to Boost Your Conversions</strong> — and start seeing results today.', align: 'center', ...BODY('20px') }],
            ['core/shortcode', { text: '' }],
            ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [PRIMARY_BUTTON('Send Me the Free Guide')]],
        ],
    },
];

export function getModalLayout(id) {
    return MODAL_LAYOUTS.find((layout) => layout.id === id) || MODAL_LAYOUTS[0];
}
