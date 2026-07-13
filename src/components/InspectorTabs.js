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
 *   │  HIGH PRIORITY                  │  ← most-used styling (colors, type)
 *   │   ▾ Colors                      │
 *   │  MEDIUM PRIORITY                │  ← border, spacing, effects…
 *   └────────────────────────────────┘
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
 * the Gutenblocks free-tier reorg that haven't been tagged yet) fall back to the
 * legacy keyword classifier below, so their behavior is unchanged.
 */

import { InspectorControls } from '@wordpress/block-editor';
import {
	TabPanel,
	PanelBody,
} from '@wordpress/components';
import { Children, isValidElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './InspectorTabs.scss';

const STYLE_ORDER = [ 'high', 'medium' ];
const STYLE_LABELS = {
	high:   __( 'Appearance' ),
	medium: __( 'Effects & Spacing' ),
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
		const priority = props.priority === 'high' ? 'high' : 'medium';
		return { section: explicitSection, priority };
	}

	const legacyPriority = props ? classifyTitle( props.title ) : null;
	if ( legacyPriority ) {
		return { section: 'style', priority: legacyPriority };
	}
	return { section: 'layout', priority: 'medium' };
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

	const hasStyle = styleGroups.high.length > 0 || styleGroups.medium.length > 0;

	return (
		<InspectorControls>
			<TabPanel
				className="adaire-inspector-tabs"
				activeClass="is-active"
				tabs={ [
					{
						name: 'content',
						title: (
							<span className="adaire-tab-title">
								{ ContentIcon }
								{ __( 'Content' ) }
							</span>
						),
						className: 'adaire-inspector-tab',
					},
					{
						name: 'layout',
						title: (
							<span className="adaire-tab-title">
								{ LayoutIcon }
								{ __( 'Layout' ) }
							</span>
						),
						className: 'adaire-inspector-tab',
					},
					{
						name: 'style',
						title: (
							<span className="adaire-tab-title">
								{ StyleIcon }
								{ __( 'Style' ) }
							</span>
						),
						className: 'adaire-inspector-tab',
					},
				] }
			>
				{ ( tab ) => {
					if ( tab.name === 'content' ) {
						return (
							<div className="adaire-inspector-tabs__panel">
								{ contentChildren.length > 0
									? contentChildren
									: <p className="adaire-inspector-empty">{ __( 'This block has no content settings — see the Layout and Style tabs.' ) }</p> }
							</div>
						);
					}

					if ( tab.name === 'layout' ) {
						return (
							<div className="adaire-inspector-tabs__panel">
								{ layoutChildren.length > 0
									? layoutChildren
									: <p className="adaire-inspector-empty">{ __( 'This block has no layout settings — see the other tabs.' ) }</p> }
							</div>
						);
					}

					return (
						<div className="adaire-inspector-tabs__panel">
							{ hasStyle
								? STYLE_ORDER.map( ( priority ) => {
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
								} )
								: <p className="adaire-inspector-empty">{ __( 'This block has no style settings.' ) }</p> }
						</div>
					);
				} }
			</TabPanel>
		</InspectorControls>
	);
}
