/**
 * InspectorTabs — structured block inspector sidebar.
 *
 * Splits every Adaire Blocks block into three tabs:
 *   • Content  — the block's own text/data/items
 *   • Layout   — structural arrangement (columns, ordering, variant, container/alignment)
 *   • Style    — colors, typography, gradients, shadows, spacing/effects
 *
 * There is deliberately no Advanced tab. WordPress's own native "Advanced"
 * panel already renders HTML Anchor / Additional CSS Class(es) for any block
 * with supports.anchor / supports.customClassName, and renders below every
 * block's InspectorControls regardless of which of these tabs is active —
 * a custom Advanced tab here just duplicated it. Any block-specific control
 * that used to live there (e.g. a Block ID field, Z-Index) belongs in
 * Content or Style instead, tagged accordingly.
 *
 *   ┌────────────────────────────────┐
 *   │  Content  │  Layout  │  Style  │
 *   ├────────────────────────────────┤
 *   │  APPEARANCE                     │  ← most-used styling (background,
 *   │   ▾ Colors                      │     colours, typography)
 *   │  EFFECTS                        │  ← border, shadow, overlay…
 *   └────────────────────────────────┘
 *
 * A tab with no panels is hidden rather than rendered empty (spec §8), and
 * panels are ordered within their tab by the shared vocabulary in
 * `inspector-vocabulary.js` (spec §6.5) rather than by authoring order.
 *
 * Usage inside a block's Edit():
 *   <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
 *       <PanelBody section="content" title="Testimonials">…item management…</PanelBody>
 *       <PanelBody section="layout"  title="Container Settings">…</PanelBody>
 *       <PanelBody section="style"   title="Typography">…</PanelBody>
 *   </InspectorTabs>
 *
 * Panels tagged with an explicit `section` prop ("content" | "layout" | "style")
 * are placed deliberately. A `priority` prop ("high" | "medium") further orders
 * panels within the Style tab. Panels with no `section` prop (blocks outside
 * the AdaireBlocks free-tier reorg that haven't been tagged yet) fall back to the
 * legacy keyword classifier below, so their behavior is unchanged.
 */

import { InspectorControls } from '@wordpress/block-editor';
import {
	TabPanel,
	PanelBody,
} from '@wordpress/components';
import { Children, isValidElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { panelOrder, STYLE_PRIORITY } from './inspector-vocabulary';
import './InspectorTabs.scss';

const STYLE_ORDER = [ 'high', 'medium' ];
const STYLE_LABELS = {
	high:   __( 'Appearance' ),
	// Not "Effects & Spacing" — padding, margin and gap are Layout settings
	// (BLOCK_SETTINGS_SPEC.md §4), so nothing spacing-related lands here.
	medium: __( 'Effects' ),
};

// Legacy fallback only: used when a panel has no explicit `section` prop.
// A panel whose title matches one of these keywords is treated as "styling"
// and moved into the Style tab; everything else falls back to Layout, exactly
// as it did before the Content tab existed — this keeps every block outside
// the free-tier reorg working unchanged until it's explicitly tagged.
const HIGH_KEYWORDS = [
	'color', 'colour', 'background', 'typography', 'font',
	'appearance', 'headline', 'hover', 'gradient', 'palette',
	'text settings', 'text style',
];
const MEDIUM_KEYWORDS = [
	'border', 'shadow', 'spacing', 'radius', 'gap',
	'effect', 'overlay', 'styl', 'design', 'animation',
	'margin', 'padding', 'width', 'height', 'size', 'underline',
];

// Tab glyphs (Elementor-style).
const ContentIcon = (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
		<path d="M5 4h14v3H5z" stroke="currentColor" strokeWidth="1.6" />
		<path d="M5 11h14M5 15h14M5 19h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
	</svg>
);

const LayoutIcon = (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
		<rect x="3" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
		<rect x="14" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
	</svg>
);

const StyleIcon = (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
		<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
		<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
	</svg>
);

/**
 * Legacy fallback: decide which tab/priority a panel belongs to based on its
 * title, for panels with no explicit `section` prop.
 * Returns 'high' | 'medium' for styling panels, or null to keep it in Layout.
 */
function classifyTitle( title ) {
	if ( ! title || typeof title !== 'string' ) {
		return null;
	}
	const t = title.toLowerCase();
	if ( HIGH_KEYWORDS.some( ( k ) => t.includes( k ) ) ) {
		return 'high';
	}
	if ( MEDIUM_KEYWORDS.some( ( k ) => t.includes( k ) ) ) {
		return 'medium';
	}
	return null;
}

const VALID_SECTIONS = [ 'content', 'layout', 'style' ];

/**
 * Classify a single child element into { section, priority }.
 * An explicit `section` prop always wins. Without one, fall back to the
 * legacy keyword classifier (style vs layout only — content is never guessed).
 */
function classifyChild( child ) {
	const props = isValidElement( child ) ? child.props : null;
	const explicitSection = props && VALID_SECTIONS.includes( props.section )
		? props.section
		: null;

	if ( explicitSection ) {
		// An explicit `priority` wins; otherwise a canonical Style panel title
		// carries its own priority (inspector-vocabulary.js) so blocks don't
		// each decide where "Typography" sits in the Style tab.
		const priority = props.priority === 'high' || props.priority === 'medium'
			? props.priority
			: ( STYLE_PRIORITY[ props.title ] || 'medium' );
		return { section: explicitSection, priority };
	}

	const legacyPriority = props ? classifyTitle( props.title ) : null;
	if ( legacyPriority ) {
		return { section: 'style', priority: legacyPriority };
	}
	return { section: 'layout', priority: 'medium' };
}

/**
 * Order a tab's panels by the shared vocabulary (spec §6.5). Panels whose title
 * isn't in the canonical list sort last and keep their authored order, so a
 * block-specific panel still renders where the author put it relative to its
 * peers.
 *
 * @param {string} tab      'content' | 'layout' | 'style'.
 * @param {Array}  children Panel elements.
 * @return {Array} Sorted panels.
 */
function sortPanels( tab, children ) {
	return children
		.map( ( child, i ) => ( {
			child,
			i,
			rank: panelOrder( tab, isValidElement( child ) ? child.props.title : null ),
		} ) )
		.sort( ( a, b ) => ( a.rank - b.rank ) || ( a.i - b.i ) )
		.map( ( entry ) => entry.child );
}

export default function InspectorTabs( {
	attributes = {},
	setAttributes = () => {},
	stylePanels = [],
	children,
} ) {
	// Partition the block's own panels into Content / Layout / Style(+priority).
	const contentChildren = [];
	const layoutChildren = [];
	const styleGroups = { high: [], medium: [] };

	Children.toArray( children ).forEach( ( child ) => {
		const { section, priority } = classifyChild( child );
		if ( section === 'content' ) {
			contentChildren.push( child );
		} else if ( section === 'style' ) {
			styleGroups[ priority ].push( child );
		} else {
			layoutChildren.push( child );
		}
	} );

	// Explicitly-passed style panels (legacy API) keep working.
	stylePanels.forEach( ( panel, i ) => {
		const priority = panel.priority === 'high' ? 'high' : 'medium';
		styleGroups[ priority ].push(
			<PanelBody
				key={ `adaire-sp-${ i }-${ panel.title }` }
				title={ panel.title }
				initialOpen={ panel.initialOpen ?? false }
			>
				{ panel.content }
			</PanelBody>
		);
	} );

	// Order every tab's panels by the shared vocabulary (spec §6.5).
	const contentPanels = sortPanels( 'content', contentChildren );
	const layoutPanels = sortPanels( 'layout', layoutChildren );
	STYLE_ORDER.forEach( ( priority ) => {
		styleGroups[ priority ] = sortPanels( 'style', styleGroups[ priority ] );
	} );

	const hasStyle = styleGroups.high.length > 0 || styleGroups.medium.length > 0;

	// Spec §8: a tab with no applicable settings is hidden, not shown empty.
	const tabDefs = [
		{ name: 'content', label: __( 'Content' ), icon: ContentIcon, has: contentPanels.length > 0 },
		{ name: 'layout',  label: __( 'Layout' ),  icon: LayoutIcon,  has: layoutPanels.length > 0 },
		{ name: 'style',   label: __( 'Style' ),   icon: StyleIcon,   has: hasStyle },
	].filter( ( tab ) => tab.has );

	// A block with no panels at all has nothing to render — don't leave an
	// empty tab strip behind.
	if ( tabDefs.length === 0 ) {
		return null;
	}

	return (
		<InspectorControls>
			<TabPanel
				className={ `adaire-inspector-tabs has-${ tabDefs.length }-tabs` }
				activeClass="is-active"
				tabs={ tabDefs.map( ( tab ) => ( {
					name: tab.name,
					title: (
						<span className="adaire-tab-title">
							{ tab.icon }
							{ tab.label }
						</span>
					),
					className: 'adaire-inspector-tab',
				} ) ) }
			>
				{ ( tab ) => {
					if ( tab.name === 'content' ) {
						return (
							<div className="adaire-inspector-tabs__panel">
								{ contentPanels }
							</div>
						);
					}

					if ( tab.name === 'layout' ) {
						return (
							<div className="adaire-inspector-tabs__panel">
								{ layoutPanels }
							</div>
						);
					}

					return (
						<div className="adaire-inspector-tabs__panel">
							{ STYLE_ORDER.map( ( priority ) => {
								const panels = styleGroups[ priority ];
								if ( panels.length === 0 ) return null;

								return (
									<div key={ priority } className={ `adaire-priority-group is-${ priority }` }>
										<div className={ `adaire-priority-label is-${ priority }` }>
											{ STYLE_LABELS[ priority ] }
										</div>
										{ panels }
									</div>
								);
							} ) }
						</div>
					);
				} }
			</TabPanel>
		</InspectorControls>
	);
}

