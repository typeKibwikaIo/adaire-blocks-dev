/**
 * InspectorTabs — structured block inspector sidebar.
 *
 * Splits every AdaireBlocks block into two tabs:
 *   • General  — functional / content settings (the block's own panels)
 *   • Advanced — ALL styling, grouped by priority so users don't get lost:
 *
 *   ┌───────────────────────────────┐
 *   │  General  │  Advanced          │
 *   ├───────────────────────────────┤
 *   │  HIGH PRIORITY                 │  ← most-used styling (colors, type)
 *   │   ▾ Colors                     │
 *   │  MEDIUM PRIORITY               │  ← border, spacing…
 *   │  LOW PRIORITY                  │  ← margin/padding, z-index, CSS id…
 *   │   ▾ Layout (advanced styles)   │
 *   └───────────────────────────────┘
 *
 * Usage inside a block's Edit():
 *   <InspectorTabs
 *       attributes={ attributes }
 *       setAttributes={ setAttributes }
 *       stylePanels={ [
 *           { title: 'Colors',     priority: 'high',   content: <>…</> },
 *           { title: 'Typography', priority: 'high',   content: <>…</> },
 *           { title: 'Border',     priority: 'medium', content: <>…</> },
 *       ] }
 *   >
 *       <PanelBody title="Layout">…functional settings…</PanelBody>
 *   </InspectorTabs>
 */

import { InspectorControls } from '@wordpress/block-editor';
import {
	TabPanel,
	PanelBody,
	TextControl,
	__experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { Children, isValidElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './InspectorTabs.scss';

const STYLE_ORDER = [ 'high', 'medium' ];
const STYLE_LABELS = {
	high:   __( 'Appearance' ),
	medium: __( 'Effects & Spacing' ),
};

// A panel whose title matches one of these keywords is treated as "styling"
// and automatically moved out of General into the Advanced tab.
const HIGH_KEYWORDS = [
	'color', 'colour', 'background', 'typography', 'font',
	'appearance', 'headline', 'hover', 'gradient', 'palette',
	'text settings', 'text style',
];
const MEDIUM_KEYWORDS = [
	'border', 'shadow', 'spacing', 'radius', 'gap',
	'effect', 'overlay', 'styl', 'design',
	'margin', 'padding', 'width', 'height', 'size', 'underline',
];

// Tab glyphs (Elementor-style): columns for Layout, contrast for Style, gear for Advanced.
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

const AdvancedIcon = (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
		<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
		<path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.4" />
	</svg>
);

/**
 * Decide which tab/priority a panel belongs to based on its title.
 * Returns 'high' | 'medium' for styling panels, or null to keep it in General.
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

export default function InspectorTabs( {
	attributes = {},
	setAttributes = () => {},
	stylePanels = [],
	children,
} ) {
	const hasZIndex  = 'zIndex' in attributes;
	const hasMargin  = 'AdaireBlocksMargin' in attributes;
	const hasPadding = 'AdaireBlocksPadding' in attributes;

	// Built-in dev-level controls always live at the bottom (low priority).
	const builtinLayoutPanel = {
		title: __( 'Spacing & Custom CSS' ),
		priority: 'low',
		content: (
			<>
				{ hasMargin && (
					<BoxControl
						label={ __( 'Margin' ) }
						values={ attributes.AdaireBlocksMargin }
						onChange={ ( AdaireBlocksMargin ) => setAttributes( { AdaireBlocksMargin } ) }
					/>
				) }
				{ hasPadding && (
					<BoxControl
						label={ __( 'Padding' ) }
						values={ attributes.AdaireBlocksPadding }
						onChange={ ( AdaireBlocksPadding ) => setAttributes( { AdaireBlocksPadding } ) }
					/>
				) }
				{ hasZIndex && (
					<TextControl
						type="number"
						label={ __( 'Z-Index' ) }
						value={ attributes.zIndex ?? '' }
						onChange={ ( value ) =>
							setAttributes( {
								zIndex: value === '' ? undefined : Number( value ),
							} )
						}
					/>
				) }
				<TextControl
					label={ __( 'CSS ID' ) }
					value={ attributes.anchor ?? '' }
					onChange={ ( anchor ) => setAttributes( { anchor } ) }
				/>
				<TextControl
					label={ __( 'CSS Classes' ) }
					value={ attributes.className ?? '' }
					onChange={ ( className ) => setAttributes( { className } ) }
				/>
			</>
		),
	};

	// Partition the block's own panels: styling panels move to Style,
	// everything else (content / functional settings) stays in Layout.
	const layoutChildren = [];
	const styleGroups = { high: [], medium: [] };

	Children.toArray( children ).forEach( ( child ) => {
		const priority =
			isValidElement( child ) && child.props
				? classifyTitle( child.props.title )
				: null;
		if ( priority ) {
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

	// Built-in dev-level controls live in their own Advanced tab.
	const advancedChildren = [
		<PanelBody
			key="adaire-builtin-layout"
			title={ builtinLayoutPanel.title }
			initialOpen={ true }
		>
			{ builtinLayoutPanel.content }
		</PanelBody>,
	];

	const hasStyle = styleGroups.high.length > 0 || styleGroups.medium.length > 0;

	return (
		<InspectorControls>
			<TabPanel
				className="adaire-inspector-tabs"
				activeClass="is-active"
				tabs={ [
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
					{
						name: 'advanced',
						title: (
							<span className="adaire-tab-title">
								{ AdvancedIcon }
								{ __( 'Advanced' ) }
							</span>
						),
						className: 'adaire-inspector-tab',
					},
				] }
			>
				{ ( tab ) => {
					if ( tab.name === 'layout' ) {
						return (
							<div className="adaire-inspector-tabs__panel">
								{ layoutChildren.length > 0
									? layoutChildren
									: <p className="adaire-inspector-empty">{ __( 'This block has no layout settings — see the Style and Advanced tabs.' ) }</p> }
							</div>
						);
					}

					if ( tab.name === 'style' ) {
						return (
							<div className="adaire-inspector-tabs__panel adaire-inspector-tabs__panel--advanced">
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
					}

					return (
						<div className="adaire-inspector-tabs__panel">
							{ advancedChildren }
						</div>
					);
				} }
			</TabPanel>
		</InspectorControls>
	);
}

