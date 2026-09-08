/**
 * Flip Card content presets — starter front/back content by use-case.
 * Analogous to popup-modal-block's MODAL_LAYOUTS and services-block's
 * CONTENT_PRESETS: picking one seeds BOTH faces (front + back) with sensible,
 * pre-styled starter blocks. Users can freely edit/add/remove blocks on each
 * face afterward like any other InnerBlocks area.
 *
 * `defaultAttrs` (optional) also sets flip-card block attributes when chosen
 * (e.g. face background colours) so the card looks polished immediately.
 *
 * Shared palette:  heading #1f2937   body #6b7280   accent #7c3aed
 */

// ─── Reusable block fragments ─────────────────────────────────────────────────

const H = (
	content,
	{ level = 3, fontSize = '1.4rem', align = 'center', color = '#1f2937', marginBottom = '10px' } = {}
) => [
	'core/heading',
	{
		level,
		content,
		textAlign: align,
		style: {
			typography: { fontSize, fontWeight: '700', lineHeight: '1.25' },
			spacing: { margin: { top: '0', bottom: marginBottom } },
			color: { text: color },
		},
	},
];

const P = (
	content,
	{ align = 'center', color = '#6b7280', fontSize = '15px', marginBottom = '0' } = {}
) => [
	'core/paragraph',
	{
		content,
		align,
		style: {
			typography: { fontSize, lineHeight: '1.6' },
			spacing: { margin: { top: '0', bottom: marginBottom } },
			color: { text: color },
		},
	},
];

const EYEBROW = (content, color = '#7c3aed') => [
	'core/paragraph',
	{
		content,
		align: 'center',
		style: {
			typography: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' },
			spacing: { margin: { top: '0', bottom: '8px' } },
			color: { text: color },
		},
	},
];

// Adaire "Button (Free)" block, centred inside a card face (see flipcard style.scss).
// variant: 'dark' (default) = dark button for light faces; 'light' = white button for dark/accent faces.
const BUTTON = (text, variant = 'dark') => [
	'create-block/button-block',
	{
		buttonText: text,
		buttonLink: '#',
		buttonStyle: 'fill',
		borderRadius: 8,
		fontWeight: '600',
		showIcon: true,
		iconType: 'arrow-right',
		iconPosition: 'right',
		buttonMargin: {
			desktop: { top: '18px', right: '0px', bottom: '0px', left: '0px' },
			tablet: { top: '16px', right: '0px', bottom: '0px', left: '0px' },
			mobile: { top: '12px', right: '0px', bottom: '0px', left: '0px' },
		},
		...(variant === 'light'
			? {
					buttonBackgroundColor: '#ffffff',
					buttonColor: '#111827',
					buttonHoverBackgroundColor: 'rgba(255,255,255,0.85)',
					buttonHoverColor: '#111827',
					borderColor: '#ffffff',
					buttonHoverBorderColor: '#ffffff',
			  }
			: {
					buttonBackgroundColor: '#111827',
					buttonColor: '#ffffff',
					buttonHoverBackgroundColor: '#000000',
					buttonHoverColor: '#ffffff',
					borderColor: '#111827',
					buttonHoverBorderColor: '#111827',
			  }),
	},
];

// Light-on-dark body text for accent/dark back faces.
const P_LIGHT = (content, opts = {}) => P(content, { color: 'rgba(255,255,255,0.85)', ...opts });

// ─── Presets ──────────────────────────────────────────────────────────────────

export const FLIPCARD_PRESETS = [
	{
		id: 'team',
		label: 'Team Member',
		bestFor: 'People, speaker & staff profiles',
		defaultAttrs: { frontBackgroundColor: '#ffffff', backBackgroundColor: '#7c3aed' },
		front: [
			[
				'core/image',
				{
					align: 'center',
					width: '125px',
					height: 'auto',
					sizeSlug: 'large',
					linkDestination: 'none',
					style: {
						border: { radius: '50%' },
						spacing: { margin: { top: 'var:preset|spacing|20', bottom: 'var:preset|spacing|20', left: '0', right: '0' } },
					},
				},
			],
			H('Alex Rivera', { marginBottom: '4px' }),
			EYEBROW('Creative Director'),
		],
		back: [
			H('Alex Rivera', { color: '#ffffff', marginBottom: '8px' }),
			P_LIGHT('15 years shaping brands people remember. Leads design across every client engagement.'),
			BUTTON('View Profile', 'light'),
		],
	},
	{
		id: 'service',
		label: 'Service',
		bestFor: 'Agency / studio service cards',
		defaultAttrs: { frontBackgroundColor: '#ffffff', backBackgroundColor: '#111827' },
		front: [
			H('🚀', { fontSize: '2.5rem', marginBottom: '12px' }),
			H('Web Development', { fontSize: '1.35rem', marginBottom: '0' }),
		],
		back: [
			H('Web Development', { color: '#ffffff', fontSize: '1.25rem', marginBottom: '8px' }),
			P_LIGHT('Custom websites and applications built to perform, scale and convert.'),
			BUTTON('Learn More', 'light'),
		],
	},
	{
		id: 'feature',
		label: 'Product Feature',
		bestFor: 'SaaS / product feature highlights',
		defaultAttrs: { frontBackgroundColor: '#f8fafc', backBackgroundColor: '#7c3aed' },
		front: [
			EYEBROW('Feature'),
			H('Realtime Collaboration', { fontSize: '1.35rem', marginBottom: '0' }),
		],
		back: [
			H('Realtime Collaboration', { color: '#ffffff', fontSize: '1.2rem', marginBottom: '8px' }),
			P_LIGHT('Work together live with comments, mentions and instant sync — no refresh needed.'),
		],
	},
	{
		id: 'stat',
		label: 'Stat / Fact',
		bestFor: 'Metrics, impact numbers & KPIs',
		defaultAttrs: { frontBackgroundColor: '#111827', backBackgroundColor: '#ffffff' },
		front: [
			H('98%', { level: 2, fontSize: '3.5rem', color: '#ffffff', marginBottom: '4px' }),
			P('Customer satisfaction', { color: 'rgba(255,255,255,0.75)' }),
		],
		back: [
			H('98% Satisfaction', { fontSize: '1.25rem', marginBottom: '8px' }),
			P('Measured across 2,000+ verified customer reviews over the last 12 months.'),
		],
	},
	{
		id: 'faq',
		label: 'FAQ',
		bestFor: 'Question on front, answer on back',
		defaultAttrs: { frontBackgroundColor: '#ffffff', backBackgroundColor: '#f8fafc' },
		front: [
			EYEBROW('FAQ'),
			H('How does billing work?', { fontSize: '1.3rem', marginBottom: '0' }),
		],
		back: [
			P('You’re billed monthly with no lock-in. Cancel or change your plan anytime from your dashboard, and any unused credit rolls over.', { fontSize: '15px', align: 'left' }),
		],
	},
	{
		id: 'pricing',
		label: 'Pricing Tier',
		bestFor: 'Plan name & price, details on flip',
		defaultAttrs: { frontBackgroundColor: '#ffffff', backBackgroundColor: '#111827' },
		front: [
			EYEBROW('Pro Plan'),
			H('$29', { level: 2, fontSize: '3rem', marginBottom: '2px' }),
			P('per month', { fontSize: '14px' }),
		],
		back: [
			H('Pro Plan Includes', { color: '#ffffff', fontSize: '1.15rem', marginBottom: '10px' }),
			[
				'core/list',
				{ style: { color: { text: 'rgba(255,255,255,0.85)' }, typography: { fontSize: '14px' } } },
				[
					['core/list-item', { content: 'Unlimited projects' }],
					['core/list-item', { content: 'Priority support' }],
					['core/list-item', { content: 'Advanced analytics' }],
				],
			],
			BUTTON('Choose Pro', 'light'),
		],
	},
];

export const getFlipcardPreset = (id) =>
	FLIPCARD_PRESETS.find((preset) => preset.id === id) || null;
