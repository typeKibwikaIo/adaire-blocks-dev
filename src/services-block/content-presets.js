/**
 * Content presets for the Animated Content Carousel — starter slide sets by
 * use-case. Analogous to popup-modal-block's MODAL_LAYOUTS: picking one just
 * seeds sensible starting content (slides + a few block-level fields); the user
 * is free to edit/add/remove slides afterward.
 *
 * `defaultAttrs` (optional) also sets other block attributes when chosen —
 * e.g. a matching layoutMode and heading/preview text.
 */

const slide = (id, slideTitle, slideDescription, slideTags = [], slideUrl = '#') => ({
	id,
	slideTitle,
	slideDescription,
	slideTags,
	slideUrl,
	slideImg: '',
	slideImgId: 0,
});

export const CONTENT_PRESETS = [
	{
		id: 'services',
		label: 'Services',
		bestFor: 'Agency / studio service lists',
		defaultAttrs: {
			layoutMode: 'horizontal',
			previewText: 'Services:',
			agencyTitle: 'What We Do',
			agencyDescription:
				'End-to-end services that take your product from idea to launch and beyond.',
			ctaButtonText: 'View All Services',
		},
		slides: [
			slide(1, 'Build', 'We design and develop custom websites and applications tailored to your goals.', ['Design', 'Development', 'Strategy']),
			slide(2, 'Migrate', 'Move your data and systems to modern platforms with minimal downtime.', ['Cloud', 'Data', 'Security']),
			slide(3, 'Maintain', 'Ongoing maintenance and support so your digital assets always perform.', ['Support', 'Monitoring']),
			slide(4, 'Host', 'Reliable, secure hosting that keeps your site fast and always online.', ['Infrastructure', 'Uptime']),
		],
	},
	{
		id: 'portfolio',
		label: 'Portfolio / Work',
		bestFor: 'Case studies and project showcases',
		defaultAttrs: {
			layoutMode: 'split',
			previewText: 'Selected work:',
			agencyTitle: 'Recent Projects',
			agencyDescription: 'A selection of work across branding, product and web.',
			ctaButtonText: 'See Full Portfolio',
		},
		slides: [
			slide(1, 'Brand Refresh', 'A complete visual identity and design system for a fast-growing fintech.', ['Branding', 'Identity']),
			slide(2, 'E-commerce Platform', 'A headless storefront that lifted conversion by 38% in three months.', ['Web', 'Shopify']),
			slide(3, 'Mobile App', 'An iOS and Android app rated 4.9 stars with 200k+ downloads.', ['Product', 'Mobile']),
		],
	},
	{
		id: 'features',
		label: 'Product Features',
		bestFor: 'SaaS / product feature highlights',
		defaultAttrs: {
			layoutMode: 'fullscreen',
			previewText: 'Features:',
			agencyTitle: 'Built for teams that ship',
			agencyDescription: 'Everything you need to plan, build and launch in one place.',
			ctaButtonText: 'Start Free Trial',
		},
		slides: [
			slide(1, 'Realtime Collaboration', 'Work together live with comments, mentions and instant sync.', ['Collaboration']),
			slide(2, 'Automations', 'Remove busywork with rules that run your workflows for you.', ['Workflow', 'No-code']),
			slide(3, 'Analytics', 'Understand what matters with dashboards that update in realtime.', ['Insights', 'Reporting']),
		],
	},
	{
		id: 'testimonials',
		label: 'Testimonials',
		bestFor: 'Customer quotes and social proof',
		defaultAttrs: {
			layoutMode: 'fullscreen',
			previewText: 'Clients say:',
			agencyTitle: 'Loved by teams everywhere',
			agencyDescription: 'Don’t take our word for it — hear from the people we work with.',
			ctaButtonText: 'Read More Reviews',
		},
		slides: [
			slide(1, 'Sarah — Acme Co', '“They shipped faster than any team we’ve worked with, and the quality was outstanding.”', ['Verified client']),
			slide(2, 'James — Nova Labs', '“A genuine partner. They cared about our outcomes as much as we did.”', ['Verified client']),
			slide(3, 'Priya — Bloom', '“From strategy to launch, everything was seamless. We’d hire them again in a heartbeat.”', ['Verified client']),
		],
	},
	{
		id: 'team',
		label: 'Team / People',
		bestFor: 'Team member or speaker profiles',
		defaultAttrs: {
			layoutMode: 'horizontal',
			previewText: 'Meet the team:',
			agencyTitle: 'The People Behind the Work',
			agencyDescription: 'A small, senior team that partners closely with every client.',
			ctaButtonText: 'Join the Team',
		},
		slides: [
			slide(1, 'Alex Rivera', 'Founder & Creative Director. 15 years shaping brands people remember.', ['Strategy', 'Design']),
			slide(2, 'Dana Okafor', 'Head of Engineering. Turns ambitious ideas into resilient products.', ['Engineering']),
			slide(3, 'Mia Chen', 'Design Lead. Obsessed with the details that make products feel effortless.', ['Product Design']),
		],
	},
];

export const getContentPreset = (id) =>
	CONTENT_PRESETS.find((preset) => preset.id === id) || null;
