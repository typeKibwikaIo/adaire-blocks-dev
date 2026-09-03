/**
 * Shared inspector vocabulary — see AGENTS/BLOCK_SETTINGS_SPEC.md §6.2 and §6.5.
 *
 * The spec requires that the same setting is called the same thing in every
 * block ("Gap" is not "Spacing" here and "Gutter" there), and that panels appear
 * in a predictable order within their tab. Hard-coding titles per block is how
 * the drift happened in the first place, so every block imports its panel titles
 * from here instead.
 *
 * Usage:
 *   import { PANEL, LABEL, panelOrder } from '../components/inspector-vocabulary';
 *   <PanelBody section="layout" title={ PANEL.SPACING }>…</PanelBody>
 *
 * Adding a name: add it here first, with a comment saying which tab it belongs
 * to. If no existing name fits, that is usually a sign the panel is doing two
 * jobs and should be split along the §3 categorisation rule.
 */

import { __ } from '@wordpress/i18n';

/**
 * Canonical panel titles, grouped by the tab that owns them.
 *
 * Panel titles are deliberately short nouns — the tab already supplies the
 * context, so "Spacing" beats "Container Spacing Settings".
 */
export const PANEL = {
	// ── Content ────────────────────────────────────────────────────────────
	CONTENT: __( 'Content', 'adaire-blocks' ),
	MEDIA: __( 'Media', 'adaire-blocks' ),
	ICON: __( 'Icon', 'adaire-blocks' ),
	ITEMS: __( 'Items', 'adaire-blocks' ),
	LINK: __( 'Link', 'adaire-blocks' ),
	BADGES: __( 'Ratings & Badges', 'adaire-blocks' ),

	// ── Layout ─────────────────────────────────────────────────────────────
	RESPONSIVE: __( 'Responsive', 'adaire-blocks' ),
	STRUCTURE: __( 'Structure', 'adaire-blocks' ),
	ALIGNMENT: __( 'Alignment', 'adaire-blocks' ),
	DIMENSIONS: __( 'Dimensions', 'adaire-blocks' ),
	// EFFECTS is Layout, not Style: the hover treatments blocks offer here
	// (scale, bounce, shake, slide) move an element relative to its
	// neighbours, which is the Layout test. See spec §4.
	EFFECTS: __( 'Effects', 'adaire-blocks' ),

	// ── Style ──────────────────────────────────────────────────────────────
	// VARIANT is the block's visual preset (fill / outline / glass …). It is
	// Style, not Layout: a preset that only swaps CSS treatments. A setting
	// that actually rearranges elements is STRUCTURE, in the Layout tab.
	VARIANT: __( 'Variant', 'adaire-blocks' ),
	BACKGROUND: __( 'Background', 'adaire-blocks' ),
	COLORS: __( 'Colors', 'adaire-blocks' ),
	TYPOGRAPHY: __( 'Typography', 'adaire-blocks' ),
	BORDER: __( 'Border', 'adaire-blocks' ),
	// SPACING is Style: padding, margin and gap are CSS presentation applied
	// to elements that already exist. See spec §4.
	SPACING: __( 'Spacing', 'adaire-blocks' ),
};

/**
 * Canonical control labels for settings that recur across blocks.
 *
 * Only settings that appear in more than one block belong here — a control
 * unique to a single block can name itself inline.
 */
export const LABEL = {
	BREAKPOINT: __( 'Breakpoint', 'adaire-blocks' ),
	COLUMNS: __( 'Columns', 'adaire-blocks' ),
	GAP: __( 'Gap', 'adaire-blocks' ),
	PADDING: __( 'Padding', 'adaire-blocks' ),
	MARGIN: __( 'Margin', 'adaire-blocks' ),
	ALIGNMENT: __( 'Alignment', 'adaire-blocks' ),
	BLOCK_ID: __( 'Block ID', 'adaire-blocks' ),
	Z_INDEX: __( 'Z-Index', 'adaire-blocks' ),
	FONT_FAMILY: __( 'Font Family', 'adaire-blocks' ),
	FONT_SIZE: __( 'Font Size', 'adaire-blocks' ),
	FONT_WEIGHT: __( 'Font Weight', 'adaire-blocks' ),
	BORDER_WIDTH: __( 'Border Width', 'adaire-blocks' ),
	BORDER_STYLE: __( 'Border Style', 'adaire-blocks' ),
	BORDER_RADIUS: __( 'Border Radius', 'adaire-blocks' ),
	ICON_SIZE: __( 'Icon Size', 'adaire-blocks' ),
};

/**
 * Declared panel order within each tab (spec §6.5).
 *
 * Layout runs structure → alignment → dimensions → effects; Style runs colour →
 * typography → borders → spacing. `Responsive` leads the Layout tab because it scopes
 * every control beneath it — a user has to pick the breakpoint before the
 * values below mean anything.
 *
 * A block only uses the subset of panels it actually has; the order of the ones
 * it does have must match this list.
 */
export const PANEL_ORDER = {
	content: [ PANEL.CONTENT, PANEL.MEDIA, PANEL.ICON, PANEL.ITEMS, PANEL.LINK, PANEL.BADGES ],
	layout: [ PANEL.RESPONSIVE, PANEL.STRUCTURE, PANEL.ALIGNMENT, PANEL.DIMENSIONS, PANEL.EFFECTS ],
	style: [ PANEL.VARIANT, PANEL.BACKGROUND, PANEL.COLORS, PANEL.TYPOGRAPHY, PANEL.BORDER, PANEL.SPACING ],
};

/**
 * Style-tab priority for each canonical Style panel, so blocks don't each pick
 * their own. High = the panels users reach for constantly (background, colour,
 * type); medium = the finishing touches.
 */
export const STYLE_PRIORITY = {
	[ PANEL.VARIANT ]: 'high',
	[ PANEL.BACKGROUND ]: 'high',
	[ PANEL.COLORS ]: 'high',
	[ PANEL.TYPOGRAPHY ]: 'high',
	[ PANEL.BORDER ]: 'medium',
	[ PANEL.SPACING ]: 'medium',
};

/**
 * Sort index for a panel title within its tab. Unknown titles sort last, in
 * their original relative order, so a block with a genuinely block-specific
 * panel still renders sensibly.
 *
 * @param {string} tab   One of 'content' | 'layout' | 'style'.
 * @param {string} title Panel title.
 * @return {number} Sort index.
 */
export function panelOrder( tab, title ) {
	const order = PANEL_ORDER[ tab ] || [];
	const index = order.indexOf( title );
	return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
