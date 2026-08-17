import { useBlockProps, RichText, MediaUpload, MediaUploadCheck, ColorPalette } from '@wordpress/block-editor';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone, { markMediaOpening } from '../components/QuickZone';
import { PanelBody, ToggleControl, RangeControl, SelectControl, Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import BoundColorPalette from '../components/BoundColorPalette';

// ── helpers ──────────────────────────────────────────────────────────────

const ALIGN_MAP = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

// SVGs use width/height="1em" (not a fixed px value) so the glyph scales
// with whatever inline font-size the container sets from the Icon Size
// control — otherwise the icon stayed a fixed size while only its
// surrounding circle/box grew or shrank, which read as the icon being
// misaligned/floating inside its background as you adjusted the slider.
const SOCIAL_SVGS = {
    twitter:   '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
    facebook:  '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    linkedin:  '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    youtube:   '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
};

const getIconSvg = (platform) => SOCIAL_SVGS[platform] || SOCIAL_SVGS.twitter;

// Block-level Font Family control (ADAB-010) — one choice for the whole
// footer, applied via the --footer-font-family custom property at the block
// root. Not per-text-role: none of this block's existing typography surface
// (the unschema'd `typography` object's baseFontSize/headingFontSize/
// *FontWeight keys, wired in render.php but never exposed by any Inspector
// control) ever covered font family either — `typography.fontFamily`
// defaults to 'inherit' and has always been dead/unreachable from the UI.
// This new top-level `fontFamily` attribute + control is what actually lets
// a user change it; render.php prefers it over the legacy typography.fontFamily.
const FONT_FAMILY_OPTIONS = [
    { label: 'Default (inherit theme)', value: '' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

// Effective "show brand name text" state — mirrors
// adaire_footer_render_brand_column_content()'s PHP fallback exactly so the
// editor canvas and the live site never disagree: if the column has never
// had the new `showBrandName` flag set (legacy saved content), fall back to
// "show it if there's actually text" (a no-op for empty text, and preserves
// any real brand name a site owner already typed). Brand-new columns get an
// explicit `showBrandName: false` default from block.json, so the old
// placeholder "Your Brand" text never appears unless the user opts in.
const effectiveShowBrandName = (column) =>
    column.showBrandName !== undefined ? !!column.showBrandName : !!column.brandName;

// Column type options shown in the per-column QuickZone settings popover.
const columnTypeOptions = [
    { label: 'Navigation Links', value: 'nav' },
    { label: 'Brand / Logo', value: 'brand' },
    { label: 'Social Links', value: 'social' },
    { label: 'Newsletter Signup', value: 'newsletter' },
    { label: 'Buttons', value: 'buttons' },
    { label: 'Copyright Text', value: 'copyright' },
    { label: 'Widget Area', value: 'widget-area' },
    { label: 'Custom HTML', value: 'custom' },
];

// Mirrors header-menu-block's navigationSourceOptions exactly — same source
// vocabulary ('legacy' | 'primary' | 'footer' | 'menu') is read by
// adaire_footer_resolve_nav_items() in render.php.
const navigationSourceOptions = [
    { label: 'Custom (manual)',      value: 'legacy'  },
    { label: 'Primary Menu',         value: 'primary' },
    { label: 'Footer Menu',          value: 'footer'  },
    { label: 'Select existing menu', value: 'menu'    },
];

// Same plugin-owned menu-location slugs adaire_footer_register_nav_menu_locations()
// uses in render.php (and the identical slugs header-menu-block's render.php uses for
// its own Primary/Footer options) — keeps editor resolution and frontend
// resolution looking at the same WP menu locations.
const NAV_MENU_LOCATION_SLUGS = { primary: 'adaire-blocks-primary', footer: 'adaire-blocks-footer' };

function decodeEntities(html) {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// WP's wp_get_nav_menu_items() (and the REST menu-items endpoint that powers
// core.getMenuItems) falls back to a raw "#123 (no title)" string when a menu
// item has no custom label and its linked object has no title. Mirrors
// isPlaceholderMenuTitle()/friendlyMenuLabel() in header-menu-block/edit.js and
// adaire_footer_friendly_menu_label() conventions, so the editor never shows
// a raw DB id where the frontend would show a friendly fallback.
function isPlaceholderMenuTitle(title) {
    return /^#\d+\s*\(no title\)$/i.test((title || '').trim());
}

function menuLabelFromUrl(url) {
    const fallback = __('Menu item', 'adaire-blocks');
    if (!url) return fallback;
    const path = String(url).replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '').split(/[?#]/)[0];
    const trimmed = path.replace(/^\/+|\/+$/g, '');
    if (!trimmed) return fallback;
    const segments = trimmed.split('/');
    const slug = (segments[segments.length - 1] || '').replace(/[-_]+/g, ' ').trim();
    return slug ? slug.replace(/\b\w/g, (c) => c.toUpperCase()) : fallback;
}

function friendlyMenuLabel(rawTitle, url) {
    const title = (rawTitle || '').trim();
    if (title && !isPlaceholderMenuTitle(title)) return title;
    return menuLabelFromUrl(url);
}

// Renders one resolved WP-menu node (and, recursively, its children) on the
// editor canvas. Mirrors adaire_footer_render_nav_node() in render.php
// exactly — same `website-footer-block__nav-link` / `__nav-sublist` classes
// and always-visible nested-<ul> structure (footer menus have no JS-driven
// disclosure, unlike header-menu-block's dropdown nav) — so the live preview and
// the saved frontend output can never visually disagree. Uses a <span>
// rather than an <a> since this tree isn't individually editable (items come
// from the live WP menu, not column.navItems) and a real <a href> inside the
// iframed editor canvas could attempt to navigate on click.
function FooterDynamicMenuNode({ item, column }) {
    const hasKids = !!(item.children && item.children.length);
    return (
        <li style={{ listStyle: 'none' }}>
            <span
                className="website-footer-block__nav-link"
                style={{
                    // Base color goes through --link-color (consumed by
                    // style.scss's nav-link rule), not a literal `color`
                    // prop — a literal value here would out-specificity the
                    // :hover rule and the hover color below would never
                    // visibly apply, same bug already fixed for social icons.
                    '--link-color': column.linkColor || undefined,
                    '--link-hover-color': column.linkHoverColor || undefined,
                    '--link-hover-bg': column.linkHoverBackgroundColor || undefined,
                    '--link-hover-underline-color': column.linkHoverUnderlineColor || undefined,
                    '--link-underline-mode': column.linkUnderline ? 'underline' : undefined,
                    '--link-hover-underline-mode': (column.linkUnderline || column.linkHoverUnderlineColor) ? 'underline' : undefined,
                    '--link-transition-duration': (column.linkTransitionDuration != null && column.linkTransitionDuration >= 0) ? `${column.linkTransitionDuration}ms` : undefined,
                }}
            >
                {item.label}
            </span>
            {hasKids && (
                <ul className="website-footer-block__nav-sublist">
                    {item.children.map((child) => (
                        <FooterDynamicMenuNode key={child.id} item={child} column={column} />
                    ))}
                </ul>
            )}
        </li>
    );
}

// Matches the four sidebars registered in adaire-blocks.php
// (adaire-footer-widget-1..4).
const widgetAreaOptions = [
    { label: __( 'Select a widget area…', 'adaire-blocks' ), value: '' },
    { label: 'Footer Widget Area 1', value: 'adaire-footer-widget-1' },
    { label: 'Footer Widget Area 2', value: 'adaire-footer-widget-2' },
    { label: 'Footer Widget Area 3', value: 'adaire-footer-widget-3' },
    { label: 'Footer Widget Area 4', value: 'adaire-footer-widget-4' },
];

// ── component ───────────────────────────────────────────────────────────

export default function Edit({ attributes, setAttributes }) {
    const {
        backgroundColor, backgroundImage, backgroundGradient, backgroundType,
        textColor, accentColor, fontFamily,
        paddingTop, paddingBottom, marginTop, marginBottom, maxWidth,
        showTopBar, showColumnsSection, showBottomBar,
        topBar, columnsSection, bottomBar,
    } = attributes;

    const blockProps = useBlockProps({
        className: 'website-footer-block',
        style: {
            backgroundColor: backgroundType === 'solid' ? (backgroundColor || '#1a1a1a') : backgroundType === 'gradient' ? backgroundGradient : 'transparent',
            backgroundImage: backgroundType === 'image' ? `url(${backgroundImage})` : 'none',
            backgroundSize:     backgroundType === 'image' ? 'cover'    : 'auto',
            backgroundPosition: backgroundType === 'image' ? 'center'   : 'auto',
            backgroundRepeat:   backgroundType === 'image' ? 'no-repeat': 'repeat',
            color: textColor || '#ffffff',
            paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`,
            marginTop:  `${marginTop}px`,  marginBottom:  `${marginBottom}px`,
            '--footer-accent-color': accentColor || '#503AA8',
            '--footer-max-width': `${maxWidth}px`,
            '--footer-font-family': fontFamily || 'inherit',
        },
    });

    const [activeZone, setActiveZone] = useState(null);

    // Fetches the site's WP menus once, for any nav column whose
    // navigationSource isn't "legacy" — needed both to populate the "Select
    // existing menu" dropdown (source === 'menu') AND to resolve which menu
    // is assigned to the Primary/Footer theme locations (source === 'primary'
    // | 'footer', via each menu's `.locations` array) — same data source and
    // `context: 'view'` (required for `.locations` to be present) header-menu-block
    // uses for its own navigationSource resolution.
    const anyColumnNeedsMenuList = (columnsSection.columns || []).some(
        (col) => col.type === 'nav' && col.navigationSource && col.navigationSource !== 'legacy'
    );
    const wpMenus = useSelect((select) => {
        if (!anyColumnNeedsMenuList) return [];
        const coreStore = select('core');
        return coreStore && coreStore.getMenus ? coreStore.getMenus({ per_page: -1, context: 'view' }) : [];
    }, [anyColumnNeedsMenuList]);

    // ── Dynamic menu live-render (Task #8) ──────────────────────────────
    // Resolves, for every nav column whose navigationSource isn't "legacy",
    // which actual WP menu id applies — then fetches and nests that menu's
    // items so the editor canvas shows the *real* selected/assigned menu
    // instead of a placeholder, mirroring adaire_footer_resolve_nav_items()
    // + adaire_footer_build_menu_tree() in render.php so editor and frontend
    // can never disagree once a dynamic menu is assigned.
    const navColumns = columnsSection.columns || [];

    const resolvedMenuIdByColumn = useMemo(() => {
        const map = {};
        navColumns.forEach((col) => {
            if (col.type !== 'nav') return;
            const source = col.navigationSource;
            if (!source || source === 'legacy') return;
            if (source === 'menu') {
                map[col.id] = col.selectedMenuId || 0;
                return;
            }
            const slug = NAV_MENU_LOCATION_SLUGS[source];
            const match = (slug && wpMenus) ? wpMenus.find((m) => Array.isArray(m.locations) && m.locations.includes(slug)) : null;
            map[col.id] = match ? match.id : 0;
        });
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(navColumns.map((c) => [c.id, c.type, c.navigationSource, c.selectedMenuId])), wpMenus]);

    // One single useSelect call regardless of how many nav columns exist —
    // calling useSelect inside a loop/map would violate the rules of hooks
    // since column count can change between renders (add/remove column).
    // Multiple inner select() calls within one useSelect callback are fine;
    // each is tracked and re-resolved independently.
    const menuItemsByColumn = useSelect((select) => {
        const coreStore = select('core');
        const result = {};
        Object.keys(resolvedMenuIdByColumn).forEach((colId) => {
            const menuId = resolvedMenuIdByColumn[colId];
            if (!menuId) { result[colId] = []; return; }
            result[colId] = (coreStore && coreStore.getMenuItems)
                ? coreStore.getMenuItems({ menus: menuId, per_page: -1, context: 'view' })
                : null;
        });
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedMenuIdByColumn]);

    const menuTreeByColumn = useMemo(() => {
        const trees = {};
        Object.keys(menuItemsByColumn).forEach((colId) => {
            const items = menuItemsByColumn[colId];
            if (!items || !items.length) { trees[colId] = []; return; }
            const byParent = {};
            items.forEach((item) => {
                const parent = item.parent || 0;
                if (!byParent[parent]) byParent[parent] = [];
                byParent[parent].push(item);
            });
            Object.keys(byParent).forEach((k) => byParent[k].sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)));
            const build = (parentId) => (byParent[parentId] || []).map((item) => ({
                id: item.id,
                label: friendlyMenuLabel(decodeEntities((item.title && item.title.rendered) || ''), item.url),
                url: item.url,
                children: build(item.id),
            }));
            trees[colId] = build(0);
        });
        return trees;
    }, [menuItemsByColumn]);

    // True while we still don't know the outcome (menu list still resolving,
    // or items for an already-resolved menu id still resolving) — false once
    // we know for certain there's nothing assigned, so the "no menu" message
    // doesn't flash before the real content loads.
    const isMenuLoadingForColumn = (col) => {
        if (col.type !== 'nav' || !col.navigationSource || col.navigationSource === 'legacy') return false;
        if (col.navigationSource !== 'menu' && wpMenus === undefined) return true;
        const menuId = resolvedMenuIdByColumn[col.id];
        return !!menuId && menuItemsByColumn[col.id] === null;
    };

    // ── attribute updaters ──────────────────────────────────────────────

    const updateTopBar    = (u) => setAttributes({ topBar:    { ...topBar,    ...u } });
    const updateBottomBar = (u) => setAttributes({ bottomBar: { ...bottomBar, ...u } });
    const updateColumnsSection = (u) => setAttributes({ columnsSection: { ...columnsSection, ...u } });

    const updateColumn = (columnId, updates) => {
        updateColumnsSection({
            columns: columnsSection.columns.map(col =>
                col.id === columnId ? { ...col, ...updates } : col
            ),
        });
    };

    // ── column management ───────────────────────────────────────────────

    const addColumn = () => {
        const newCol = {
            id: Date.now(), type: 'nav', width: 'auto', textAlign: 'left',
            showHeading: true, headingTag: 'h3', headingText: 'New Column',
            navItems: [{ id: Date.now(), label: 'New Link', url: '#' }],
            listStyle: 'plain', itemSpacing: 12,
            mobilePriority: columnsSection.columns.length + 1,
        };
        updateColumnsSection({ columns: [...columnsSection.columns, newCol], columnCount: columnsSection.columnCount + 1 });
    };

    const removeColumn = (columnId) => {
        const next = columnsSection.columns.filter(col => col.id !== columnId);
        updateColumnsSection({ columns: next, columnCount: next.length });
    };

    const moveColumn = (columnId, dir) => {
        const cols = [...columnsSection.columns];
        const i = cols.findIndex(c => c.id === columnId);
        if (dir === 'left'  && i > 0)             [cols[i], cols[i - 1]] = [cols[i - 1], cols[i]];
        if (dir === 'right' && i < cols.length - 1) [cols[i], cols[i + 1]] = [cols[i + 1], cols[i]];
        updateColumnsSection({ columns: cols });
    };

    // ── nav item management (legacy / manual nav items) ────────────────

    const updateNavItem = (colId, idx, field, val) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        const items = [...col.navItems];
        items[idx] = { ...items[idx], [field]: val };
        updateColumn(colId, { navItems: items });
    };

    const addNavItem = (colId) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, { navItems: [...col.navItems, { id: Date.now(), label: 'New Link', url: '#' }] });
    };

    const removeNavItem = (colId, idx) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, { navItems: col.navItems.filter((_, i) => i !== idx) });
    };

    // ── social item management ──────────────────────────────────────────

    const updateSocialItem = (colId, itemId, field, val) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, {
            socialItems: col.socialItems.map(s => s.id === itemId ? { ...s, [field]: val } : s),
        });
    };

    const removeSocialItem = (colId, itemId) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, { socialItems: col.socialItems.filter(s => s.id !== itemId) });
    };

    const addSocialItem = (colId) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, {
            socialItems: [...(col.socialItems || []), {
                id: Date.now(), platform: 'twitter', label: 'Twitter', url: '#', icon: 'twitter',
            }],
        });
    };

    // Keeps `icon` in sync with `platform`. render.php prefers an explicit
    // `icon` over `platform` when both exist, so changing only `platform`
    // (the old behavior) could leave the rendered glyph stuck on the old icon.
    const updateSocialPlatform = (colId, itemId, platform) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, {
            socialItems: col.socialItems.map(s => s.id === itemId ? { ...s, platform, icon: platform } : s),
        });
    };

    // ── buttons-column item management ─────────────────────────────────

    const updateButtonsItem = (colId, itemId, field, val) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, {
            buttonsItems: (col.buttonsItems || []).map(b => b.id === itemId ? { ...b, [field]: val } : b),
        });
    };

    const removeButtonsItem = (colId, itemId) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, { buttonsItems: (col.buttonsItems || []).filter(b => b.id !== itemId) });
    };

    const addButtonsItem = (colId) => {
        const col = columnsSection.columns.find(c => c.id === colId);
        updateColumn(colId, {
            buttonsItems: [...(col.buttonsItems || []), {
                id: Date.now(), label: 'Button', url: '#', style: 'solid',
                backgroundColor: '', textColor: '', newTab: false,
            }],
        });
    };

    // ── bottom bar legal links ──────────────────────────────────────────

    const updateLegalLink = (id, field, val) => {
        updateBottomBar({
            legalLinks: bottomBar.legalLinks.map(l => l.id === id ? { ...l, [field]: val } : l),
        });
    };

    const removeLegalLink = (id) => {
        updateBottomBar({ legalLinks: bottomBar.legalLinks.filter(l => l.id !== id) });
    };

    const addLegalLink = () => {
        updateBottomBar({
            legalLinks: [...bottomBar.legalLinks, { id: Date.now(), label: 'New Link', url: '#' }],
        });
    };

    // ── top-bar social link management ──────────────────────────────────

    const updateTopBarSocialLink = (id, field, val) => {
        updateTopBar({
            socialLinks: topBar.socialLinks.map(l => l.id === id ? { ...l, [field]: val } : l),
        });
    };

    const removeTopBarSocialLink = (id) => {
        updateTopBar({ socialLinks: topBar.socialLinks.filter(l => l.id !== id) });
    };

    const addTopBarSocialLink = () => {
        updateTopBar({
            socialLinks: [...topBar.socialLinks, {
                id: Date.now(), platform: 'twitter', label: 'Twitter', url: '#', displayStyle: 'icon',
            }],
        });
    };

    // ── bottom-bar social icon management ─────────────────────────────
    // Mirrors the top-bar social-link CRUD above (and updateSocialPlatform)
    // so bottomBar.socialIcons gets the same add/remove/edit support that
    // topBar.socialLinks already had.

    const updateBottomBarSocialIcon = (id, field, val) => {
        updateBottomBar({
            socialIcons: (bottomBar.socialIcons || []).map(l => l.id === id ? { ...l, [field]: val } : l),
        });
    };

    const removeBottomBarSocialIcon = (id) => {
        updateBottomBar({ socialIcons: (bottomBar.socialIcons || []).filter(l => l.id !== id) });
    };

    const addBottomBarSocialIcon = () => {
        updateBottomBar({
            socialIcons: [...(bottomBar.socialIcons || []), {
                id: Date.now(), platform: 'twitter', label: 'Twitter', url: '#', icon: 'twitter',
            }],
        });
    };

    // Keeps `icon` in sync with `platform`, same reasoning as updateSocialPlatform.
    const updateBottomBarSocialPlatform = (id, platform) => {
        updateBottomBar({
            socialIcons: (bottomBar.socialIcons || []).map(l => l.id === id ? { ...l, platform, icon: platform } : l),
        });
    };

    const getFontSizeClass = (size) => ({ small: 'small', medium: 'medium', large: 'large' }[size] || 'medium');

    // ── reusable control block — defined once, rendered in BOTH the
    // Inspector "Footer Styling" panel and the canvas "Background" QuickZone,
    // so the two surfaces can never drift out of sync (mirrors the pattern
    // used in header-menu-block / saas-hero-block). Solid / Gradient / Image stay
    // mutually exclusive via the single `backgroundType` attribute. ────────
    const backgroundControls = (
        <>
            <SelectControl label={__('Background Type', 'adaire-blocks')} value={backgroundType}
                options={[
                    { label: __('Solid Color', 'adaire-blocks'), value: 'solid' },
                    { label: __('Gradient', 'adaire-blocks'),    value: 'gradient' },
                    { label: __('Image', 'adaire-blocks'),       value: 'image' },
                ]}
                onChange={(v) => setAttributes({ backgroundType: v })} />
            {backgroundType === 'solid' && (
                <div style={{ marginBottom: 16 }}>
                    <label>{__('Background Color', 'adaire-blocks')}</label>
                    <BoundColorPalette value={backgroundColor} onChange={(v) => setAttributes({ backgroundColor: v || '' })} />
                </div>
            )}
            {backgroundType === 'gradient' && (
                <div style={{ marginBottom: 16 }}>
                    <label>{__('Gradient', 'adaire-blocks')}</label>
                    <BoundColorPalette value={backgroundGradient} onChange={(v) => setAttributes({ backgroundGradient: v || '' })} />
                </div>
            )}
            {backgroundType === 'image' && (
                <>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={(media) => setAttributes({ backgroundImage: media.url })}
                            allowedTypes={['image']}
                            value={backgroundImage}
                            render={({ open }) => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                                    {backgroundImage && (
                                        <img src={backgroundImage} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)' }} />
                                    )}
                                    <Button variant="secondary" onClick={open}>
                                        {backgroundImage ? __('Replace Image', 'adaire-blocks') : __('Select Image', 'adaire-blocks')}
                                    </Button>
                                    {backgroundImage && (
                                        <Button variant="link" isDestructive onClick={() => setAttributes({ backgroundImage: '' })}>
                                            {__('Remove Image', 'adaire-blocks')}
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                    <TextControl label={__('Background Image URL', 'adaire-blocks')} value={backgroundImage}
                        onChange={(v) => setAttributes({ backgroundImage: v })} placeholder="https://example.com/image.jpg" />
                </>
            )}
        </>
    );

    // ── render ───────────────────────────────────────────────────────────

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>

                {/* ── Footer Styling ──────────────────────────────────── */}
                <PanelBody title={__('Footer Styling', 'adaire-blocks')} initialOpen={true}>
                    <SelectControl
                        label="Font family"
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(v) => setAttributes({ fontFamily: v })}
                        help="Applies to the entire footer block unless overridden by theme styles."
                    />
                    {backgroundControls}
                    <div style={{ marginBottom: 16 }}>
                        <label>Text Color</label>
                        <BoundColorPalette value={textColor} onChange={(v) => setAttributes({ textColor: v || '' })} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label>Accent Color</label>
                        <BoundColorPalette value={accentColor} onChange={(v) => setAttributes({ accentColor: v || '' })} />
                    </div>
                    <RangeControl label="Max Width (px)"        value={maxWidth}      onChange={(v) => setAttributes({ maxWidth: v })}      min={800} max={1600} />
                    <RangeControl label="Padding Top (px)"      value={paddingTop}    onChange={(v) => setAttributes({ paddingTop: v })}    min={0} max={120} />
                    <RangeControl label="Padding Bottom (px)"   value={paddingBottom} onChange={(v) => setAttributes({ paddingBottom: v })} min={0} max={120} />
                    <RangeControl label="Margin Top (px)"       value={marginTop}     onChange={(v) => setAttributes({ marginTop: v })}     min={0} max={100} />
                    <RangeControl label="Margin Bottom (px)"    value={marginBottom}  onChange={(v) => setAttributes({ marginBottom: v })}  min={0} max={100} />
                </PanelBody>

                {/* ── Zone Visibility ─────────────────────────────────── */}
                <PanelBody title={__('Zone Visibility', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl label="Show Top Bar"         checked={showTopBar}         onChange={(v) => setAttributes({ showTopBar: v })} />
                    <ToggleControl label="Show Columns Section" checked={showColumnsSection} onChange={(v) => setAttributes({ showColumnsSection: v })} />
                    <ToggleControl label="Show Bottom Bar"      checked={showBottomBar}      onChange={(v) => setAttributes({ showBottomBar: v })} />
                </PanelBody>

                {/* ── Top Bar Settings ────────────────────────────────── */}
                {showTopBar && (
                    <PanelBody title={__('Top Bar Settings', 'adaire-blocks')} initialOpen={false}>
                        <ToggleControl label="Show Copyright"   checked={topBar.showCopyright}   onChange={(v) => updateTopBar({ showCopyright: v })} />
                        <ToggleControl label="Show Contact Link" checked={topBar.showContactLink} onChange={(v) => updateTopBar({ showContactLink: v })} />
                        {topBar.showContactLink && (
                            <>
                                <TextControl label="Contact URL" value={topBar.contactLinkUrl || '#'} onChange={(v) => updateTopBar({ contactLinkUrl: v })} />
                                <ToggleControl
                                    label={__('Underline contact link', 'adaire-blocks')}
                                    checked={!!topBar.contactLinkUnderline}
                                    onChange={(v) => updateTopBar({ contactLinkUnderline: v })}
                                />
                                <div style={{ marginBottom: 8 }}>
                                    <label>{__('Contact Link Hover Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.contactLinkHoverColor || ''} onChange={(v) => updateTopBar({ contactLinkHoverColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <label>{__('Contact Link Hover Underline Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.contactLinkHoverUnderlineColor || ''} onChange={(v) => updateTopBar({ contactLinkHoverUnderlineColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <label>{__('Contact Link Hover Background', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.contactLinkHoverBackgroundColor || ''} onChange={(v) => updateTopBar({ contactLinkHoverBackgroundColor: v || '' })} />
                                </div>
                                <RangeControl
                                    label={__('Contact Link Hover Transition (ms)', 'adaire-blocks')}
                                    value={topBar.contactLinkTransitionDuration != null && topBar.contactLinkTransitionDuration >= 0 ? topBar.contactLinkTransitionDuration : 300}
                                    min={0} max={1000} step={50}
                                    onChange={(v) => updateTopBar({ contactLinkTransitionDuration: v })}
                                />
                            </>
                        )}
                        <ToggleControl label="Show Social Media" checked={topBar.showSocialMedia} onChange={(v) => updateTopBar({ showSocialMedia: v })} />
                        {topBar.showSocialMedia && (
                            <>
                                <p style={{ fontWeight: 600, marginBottom: 8 }}>Social Links</p>
                                {topBar.socialLinks.map((link) => (
                                    <div key={link.id} style={{ marginBottom: 10 }}>
                                        <SelectControl label="Platform" value={link.platform || 'twitter'}
                                            options={['twitter','facebook','instagram','linkedin','youtube'].map(p => ({ label: p.charAt(0).toUpperCase()+p.slice(1), value: p }))}
                                            onChange={(v) => updateTopBarSocialLink(link.id, 'platform', v)} />
                                        <TextControl label="URL" value={link.url || '#'} onChange={(v) => updateTopBarSocialLink(link.id, 'url', v)} />
                                        <Button variant="link" isDestructive onClick={() => removeTopBarSocialLink(link.id)}>Remove</Button>
                                    </div>
                                ))}
                                <Button className="adaire-qz-add-btn" onClick={addTopBarSocialLink}>+ Add Social Link</Button>

                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />
                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Icon Styling', 'adaire-blocks')}</strong>
                                <RangeControl label={__('Icon Size (px)', 'adaire-blocks')} value={topBar.iconSize || 24} min={12} max={60}
                                    onChange={(v) => updateTopBar({ iconSize: v })} />
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.iconColor || ''} onChange={(v) => updateTopBar({ iconColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Background Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.iconBgColor || ''} onChange={(v) => updateTopBar({ iconBgColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.hoverColor || ''} onChange={(v) => updateTopBar({ hoverColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Background', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.hoverBackgroundColor || ''} onChange={(v) => updateTopBar({ hoverBackgroundColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Border Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.borderColor || ''} onChange={(v) => updateTopBar({ borderColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Border Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={topBar.hoverBorderColor || ''} onChange={(v) => updateTopBar({ hoverBorderColor: v || '' })} />
                                </div>
                                <RangeControl
                                    label={__('Icon Border Radius (%)', 'adaire-blocks')}
                                    value={topBar.borderRadius != null && topBar.borderRadius >= 0 ? topBar.borderRadius : 50}
                                    min={0} max={50}
                                    onChange={(v) => updateTopBar({ borderRadius: v })}
                                    help={__('50% = circle, 0% = square', 'adaire-blocks')}
                                />
                                <RangeControl
                                    label={__('Icon Spacing (px)', 'adaire-blocks')}
                                    value={topBar.iconSpacing != null && topBar.iconSpacing >= 0 ? topBar.iconSpacing : 12}
                                    min={0} max={40}
                                    onChange={(v) => updateTopBar({ iconSpacing: v })}
                                />
                                <RangeControl
                                    label={__('Hover Transition (ms)', 'adaire-blocks')}
                                    value={topBar.transitionDuration != null && topBar.transitionDuration >= 0 ? topBar.transitionDuration : 300}
                                    min={0} max={1000} step={50}
                                    onChange={(v) => updateTopBar({ transitionDuration: v })}
                                />
                            </>
                        )}
                        <div style={{ marginBottom: 16, marginTop: 8 }}>
                            <label>Top Bar Background Color</label>
                            <BoundColorPalette value={topBar.backgroundColor || ''} onChange={(v) => updateTopBar({ backgroundColor: v || '' })} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Text / Icon Color</label>
                            <BoundColorPalette value={topBar.textColor || ''} onChange={(v) => updateTopBar({ textColor: v || '' })} />
                        </div>
                        <SelectControl label="Alignment" value={topBar.alignment}
                            options={[
                                { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }, { label: 'Space Between', value: 'space-between' },
                            ]}
                            onChange={(v) => updateTopBar({ alignment: v })} />
                        <ToggleControl label="Show Divider" checked={topBar.showDivider} onChange={(v) => updateTopBar({ showDivider: v })} />
                        <SelectControl label="Font Size" value={topBar.fontSize}
                            options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
                            onChange={(v) => updateTopBar({ fontSize: v })} />
                        <RangeControl label="Vertical Padding (px)" value={topBar.paddingVertical} min={0} max={60} onChange={(v) => updateTopBar({ paddingVertical: v })} />
                        <RangeControl label="Margin Top (px)" value={topBar.marginTop || 0} min={0} max={100} onChange={(v) => updateTopBar({ marginTop: v })} />
                        <RangeControl label="Margin Bottom (px)" value={topBar.marginBottom || 0} min={0} max={100} onChange={(v) => updateTopBar({ marginBottom: v })} />
                    </PanelBody>
                )}

                {/* ── Columns Section Settings ────────────────────────── */}
                {showColumnsSection && (
                    <PanelBody title={__('Columns Section Settings', 'adaire-blocks')} initialOpen={false}>
                        <RangeControl label="Column Gap (px)" value={columnsSection.columnGap} min={0} max={80} onChange={(v) => updateColumnsSection({ columnGap: v })} />
                        <SelectControl label="Vertical Alignment" value={columnsSection.verticalAlignment}
                            options={[
                                { label: 'Top',    value: 'top' },
                                { label: 'Center', value: 'center' },
                                { label: 'Bottom', value: 'bottom' },
                            ]}
                            onChange={(v) => updateColumnsSection({ verticalAlignment: v })} />
                    </PanelBody>
                )}

                {/* ── Brand Logo Upload ───────────────────────────────── */}
                {showColumnsSection && columnsSection.columns.filter(col => col.type === 'brand').map((column) => (
                    <PanelBody key={column.id} title={__('Brand Logo', 'adaire-blocks')} initialOpen={false}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => updateColumn(column.id, { brandLogo: media.url })}
                                allowedTypes={['image']}
                                value={column.brandLogo}
                                render={({ open }) => (
                                    <Button variant="secondary" onClick={open}>
                                        {column.brandLogo ? 'Replace Logo' : 'Select Logo'}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                        {column.brandLogo && (
                            <>
                                <Button variant="link" isDestructive onClick={() => updateColumn(column.id, { brandLogo: '' })}>Remove Logo</Button>
                                <RangeControl label="Logo Width (px)" value={column.brandLogoWidth} min={20} max={400}
                                    onChange={(v) => updateColumn(column.id, { brandLogoWidth: v })} />
                            </>
                        )}
                    </PanelBody>
                ))}

                {/* ── Tagline (ADAB-012) ───────────────────────────────── */}
                {/* The brand column's existing `description` field is the de
                    facto tagline (it's never used for anything else), so we
                    reuse it for the text itself rather than adding a second,
                    confusingly-similar free-text attribute — but we expose it
                    here under an explicit "Tagline" label/panel plus its own
                    typography + color controls, none of which existed before. */}
                {showColumnsSection && columnsSection.columns.filter(col => col.type === 'brand').map((column) => (
                    <PanelBody key={column.id} title={__('Tagline', 'adaire-blocks')} initialOpen={false}>
                        <TextControl
                            label={__('Tagline text', 'adaire-blocks')}
                            value={column.description || ''}
                            onChange={(v) => updateColumn(column.id, { description: v })}
                            help={__('Shown under the brand name/logo. Also editable directly on canvas.', 'adaire-blocks')}
                        />
                        <RangeControl
                            label={__('Font Size (px)', 'adaire-blocks')}
                            value={column.taglineFontSize != null && column.taglineFontSize >= 0 ? column.taglineFontSize : 14}
                            min={10} max={32}
                            onChange={(v) => updateColumn(column.id, { taglineFontSize: v })}
                        />
                        <SelectControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={column.taglineFontWeight || '400'}
                            options={[
                                { label: 'Light (300)',    value: '300' },
                                { label: 'Normal (400)',   value: '400' },
                                { label: 'Medium (500)',   value: '500' },
                                { label: 'Semi-Bold (600)', value: '600' },
                                { label: 'Bold (700)',     value: '700' },
                            ]}
                            onChange={(v) => updateColumn(column.id, { taglineFontWeight: v })}
                        />
                        <RangeControl
                            label={__('Line Height', 'adaire-blocks')}
                            value={column.taglineLineHeight != null && column.taglineLineHeight >= 0 ? column.taglineLineHeight : 1.6}
                            min={1} max={2.5} step={0.1}
                            onChange={(v) => updateColumn(column.id, { taglineLineHeight: v })}
                        />
                        <RangeControl
                            label={__('Letter Spacing (px)', 'adaire-blocks')}
                            value={column.taglineLetterSpacing != null && column.taglineLetterSpacing >= 0 ? column.taglineLetterSpacing : 0}
                            min={0} max={5} step={0.5}
                            onChange={(v) => updateColumn(column.id, { taglineLetterSpacing: v })}
                        />
                        <div style={{ marginBottom: 4 }}>
                            <label>{__('Tagline Color', 'adaire-blocks')}</label>
                            <BoundColorPalette value={column.taglineColor || ''} onChange={(v) => updateColumn(column.id, { taglineColor: v || '' })} />
                        </div>
                    </PanelBody>
                ))}

                {/* ── Navigation Source (nav columns) ─────────────────── */}
                {/* Mirrors the same control inside each nav column's QuickZone
                    popover, so the dynamic WP-menu source can also be set from
                    the Inspector sidebar without opening the canvas popover. */}
                {showColumnsSection && columnsSection.columns.filter(col => col.type === 'nav').map((column) => (
                    <PanelBody
                        key={column.id}
                        title={column.headingText ? `${__('Navigation Source', 'adaire-blocks')}: ${column.headingText}` : __('Navigation Source', 'adaire-blocks')}
                        initialOpen={false}
                    >
                        <SelectControl
                            label={__('Navigation Source', 'adaire-blocks')}
                            value={column.navigationSource || 'legacy'}
                            options={navigationSourceOptions}
                            onChange={(v) => updateColumn(column.id, { navigationSource: v })}
                            help={__('Pull items live from a WordPress menu, or manage them manually on canvas.', 'adaire-blocks')}
                        />
                        {column.navigationSource === 'menu' && (
                            <SelectControl
                                label={__('Menu', 'adaire-blocks')}
                                value={column.selectedMenuId || 0}
                                options={[
                                    { label: __('Select a menu…', 'adaire-blocks'), value: 0 },
                                    ...(wpMenus || []).map((menu) => ({ label: menu.name, value: menu.id })),
                                ]}
                                onChange={(v) => updateColumn(column.id, { selectedMenuId: Number(v) })}
                            />
                        )}
                        {(column.navigationSource === 'primary' || column.navigationSource === 'footer') && (
                            <p style={{ fontSize: 12, opacity: 0.75 }}>
                                {__('Assign a menu to this location under Appearance → Menus.', 'adaire-blocks')}
                            </p>
                        )}
                    </PanelBody>
                ))}

                {/* ── Bottom Bar Settings ─────────────────────────────── */}
                {showBottomBar && (
                    <PanelBody title={__('Bottom Bar Settings', 'adaire-blocks')} initialOpen={false}>
                        <ToggleControl label="Show Copyright"         checked={bottomBar.showCopyright}    onChange={(v) => updateBottomBar({ showCopyright: v })} />
                        <ToggleControl label="Show Privacy Links"     checked={bottomBar.showPrivacyPolicy} onChange={(v) => updateBottomBar({ showPrivacyPolicy: v })} />
                        {bottomBar.showPrivacyPolicy && (
                            <>
                                <p style={{ fontWeight: 600, marginBottom: 8 }}>Legal Links</p>
                                {(bottomBar.legalLinks || []).map((link) => (
                                    <div key={link.id} style={{ marginBottom: 10, padding: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: 4 }}>
                                        <TextControl label="Label" value={link.label || ''} onChange={(v) => updateLegalLink(link.id, 'label', v)} />
                                        <TextControl label="URL" value={link.url || ''} onChange={(v) => updateLegalLink(link.id, 'url', v)} />
                                        <Button variant="link" isDestructive onClick={() => removeLegalLink(link.id)}>Remove</Button>
                                    </div>
                                ))}
                                <Button className="adaire-qz-add-btn" style={{ marginBottom: 16 }} onClick={addLegalLink}>+ Add Legal Link</Button>
                            </>
                        )}
                        <ToggleControl label="Show Social Media Icons" checked={bottomBar.showSocialIcons}  onChange={(v) => updateBottomBar({ showSocialIcons: v })} />
                        {bottomBar.showSocialIcons && (
                            <>
                                <p style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Social Icons</p>
                                {(bottomBar.socialIcons || []).map((link) => (
                                    <div key={link.id} style={{ marginBottom: 10 }}>
                                        <SelectControl label="Platform" value={link.platform || 'twitter'}
                                            options={['twitter','facebook','instagram','linkedin','youtube'].map(p => ({ label: p.charAt(0).toUpperCase()+p.slice(1), value: p }))}
                                            onChange={(v) => updateBottomBarSocialPlatform(link.id, v)} />
                                        <TextControl label="URL" value={link.url || '#'} onChange={(v) => updateBottomBarSocialIcon(link.id, 'url', v)} />
                                        <Button variant="link" isDestructive onClick={() => removeBottomBarSocialIcon(link.id)}>Remove</Button>
                                    </div>
                                ))}
                                <Button className="adaire-qz-add-btn" onClick={addBottomBarSocialIcon}>+ Add Social Icon</Button>

                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />
                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Icon Styling', 'adaire-blocks')}</strong>
                                <RangeControl label={__('Icon Size (px)', 'adaire-blocks')} value={bottomBar.iconSize || 24} min={12} max={60}
                                    onChange={(v) => updateBottomBar({ iconSize: v })} />
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.iconColor || ''} onChange={(v) => updateBottomBar({ iconColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Background Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.iconBgColor || ''} onChange={(v) => updateBottomBar({ iconBgColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.hoverColor || ''} onChange={(v) => updateBottomBar({ hoverColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Background', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.hoverBackgroundColor || ''} onChange={(v) => updateBottomBar({ hoverBackgroundColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Border Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.borderColor || ''} onChange={(v) => updateBottomBar({ borderColor: v || '' })} />
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <label>{__('Icon Hover Border Color', 'adaire-blocks')}</label>
                                    <BoundColorPalette value={bottomBar.hoverBorderColor || ''} onChange={(v) => updateBottomBar({ hoverBorderColor: v || '' })} />
                                </div>
                                <RangeControl
                                    label={__('Icon Border Radius (%)', 'adaire-blocks')}
                                    value={bottomBar.borderRadius != null && bottomBar.borderRadius >= 0 ? bottomBar.borderRadius : 50}
                                    min={0} max={50}
                                    onChange={(v) => updateBottomBar({ borderRadius: v })}
                                    help={__('50% = circle, 0% = square', 'adaire-blocks')}
                                />
                                <RangeControl
                                    label={__('Icon Spacing (px)', 'adaire-blocks')}
                                    value={bottomBar.iconSpacing != null && bottomBar.iconSpacing >= 0 ? bottomBar.iconSpacing : 12}
                                    min={0} max={40}
                                    onChange={(v) => updateBottomBar({ iconSpacing: v })}
                                />
                                <RangeControl
                                    label={__('Hover Transition (ms)', 'adaire-blocks')}
                                    value={bottomBar.transitionDuration != null && bottomBar.transitionDuration >= 0 ? bottomBar.transitionDuration : 300}
                                    min={0} max={1000} step={50}
                                    onChange={(v) => updateBottomBar({ transitionDuration: v })}
                                />
                            </>
                        )}
                        <SelectControl label="Alignment" value={bottomBar.alignment}
                            options={[
                                { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }, { label: 'Space Between', value: 'space-between' },
                            ]}
                            onChange={(v) => updateBottomBar({ alignment: v })} />
                        <ToggleControl label="Show Divider" checked={bottomBar.showDivider} onChange={(v) => updateBottomBar({ showDivider: v })} />
                        <RangeControl label="Vertical Padding (px)" value={bottomBar.paddingVertical} min={0} max={60} onChange={(v) => updateBottomBar({ paddingVertical: v })} />
                        <RangeControl label="Margin Top (px)" value={bottomBar.marginTop || 0} min={0} max={100} onChange={(v) => updateBottomBar({ marginTop: v })} />
                        <RangeControl label="Margin Bottom (px)" value={bottomBar.marginBottom || 0} min={0} max={100} onChange={(v) => updateBottomBar({ marginBottom: v })} />
                        <div style={{ marginBottom: 16, marginTop: 8 }}>
                            <label>Text / Copyright Color</label>
                            <BoundColorPalette value={bottomBar.textColor || ''} onChange={(v) => updateBottomBar({ textColor: v || '' })} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Legal Links Color</label>
                            <BoundColorPalette value={bottomBar.legalLinkColor || ''} onChange={(v) => updateBottomBar({ legalLinkColor: v || '' })} />
                        </div>
                        <ToggleControl
                            label={__('Underline legal links', 'adaire-blocks')}
                            checked={!!bottomBar.legalLinkUnderline}
                            onChange={(v) => updateBottomBar({ legalLinkUnderline: v })}
                        />
                        <div style={{ marginBottom: 8 }}>
                            <label>{__('Legal Links Hover Color', 'adaire-blocks')}</label>
                            <BoundColorPalette value={bottomBar.legalLinkHoverColor || ''} onChange={(v) => updateBottomBar({ legalLinkHoverColor: v || '' })} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label>{__('Legal Links Hover Underline Color', 'adaire-blocks')}</label>
                            <BoundColorPalette value={bottomBar.legalLinkHoverUnderlineColor || ''} onChange={(v) => updateBottomBar({ legalLinkHoverUnderlineColor: v || '' })} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label>{__('Legal Links Hover Background', 'adaire-blocks')}</label>
                            <BoundColorPalette value={bottomBar.legalLinkHoverBackgroundColor || ''} onChange={(v) => updateBottomBar({ legalLinkHoverBackgroundColor: v || '' })} />
                        </div>
                        <RangeControl
                            label={__('Legal Links Hover Transition (ms)', 'adaire-blocks')}
                            value={bottomBar.legalLinkTransitionDuration != null && bottomBar.legalLinkTransitionDuration >= 0 ? bottomBar.legalLinkTransitionDuration : 300}
                            min={0} max={1000} step={50}
                            onChange={(v) => updateBottomBar({ legalLinkTransitionDuration: v })}
                        />
                        <div style={{ marginBottom: 16 }}>
                            <label>Bottom Bar Background</label>
                            <BoundColorPalette value={bottomBar.backgroundColor || ''} onChange={(v) => updateBottomBar({ backgroundColor: v || '' })} />
                        </div>
                    </PanelBody>
                )}

            </InspectorTabs>

            {/* ── PREVIEW ──────────────────────────────────────────────── */}
            <div {...blockProps}>
                <QuickZone
                    id="footer-background"
                    label={__('Background', 'adaire-blocks')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={backgroundControls}
                >
                <div className="website-footer-block__container">

                    {/* ── Top Bar ──────────────────────────────────────── */}
                    {showTopBar && (
                        <div
                            className={`website-footer-block__top-bar website-footer-block__top-bar--${getFontSizeClass(topBar.fontSize)}`}
                            style={{
                                textAlign: topBar.alignment === 'space-between' ? 'left' : topBar.alignment,
                                backgroundColor: topBar.backgroundColor || 'transparent',
                                padding: `${topBar.paddingVertical}px 0`,
                                borderBottom: topBar.showDivider ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                color: topBar.textColor || 'inherit',
                            }}
                        >
                            <div className="website-footer-block__top-bar-content">
                                <div className="website-footer-block__top-bar-copyright">
                                    {topBar.showCopyright && (
                                        <RichText tagName="p" value={topBar.copyrightText}
                                            onChange={(v) => updateTopBar({ copyrightText: v })}
                                            placeholder="© 2024 Your Company." withoutInteractiveFormatting />
                                    )}
                                    {topBar.showContactLink && (
                                        <>
                                            <span className="website-footer-block__separator"> | </span>
                                            <RichText tagName="a" className="website-footer-block__contact-link" value={topBar.contactLinkText}
                                                onChange={(v) => updateTopBar({ contactLinkText: v })}
                                                placeholder="Contact Us" withoutInteractiveFormatting
                                                style={{
                                                    '--contact-underline-mode': topBar.contactLinkUnderline ? 'underline' : undefined,
                                                    '--contact-hover-color': topBar.contactLinkHoverColor || undefined,
                                                    '--contact-hover-bg': topBar.contactLinkHoverBackgroundColor || undefined,
                                                    '--contact-hover-underline-color': topBar.contactLinkHoverUnderlineColor || undefined,
                                                    '--contact-hover-underline-mode': (topBar.contactLinkUnderline || topBar.contactLinkHoverUnderlineColor) ? 'underline' : undefined,
                                                    '--contact-transition-duration': (topBar.contactLinkTransitionDuration != null && topBar.contactLinkTransitionDuration >= 0) ? `${topBar.contactLinkTransitionDuration}ms` : undefined,
                                                }} />
                                        </>
                                    )}
                                </div>
                                {topBar.showSocialMedia && (
                                    <div
                                        className="website-footer-block__top-bar-social"
                                        style={{ gap: (topBar.iconSpacing != null && topBar.iconSpacing >= 0) ? `${topBar.iconSpacing}px` : undefined }}
                                    >
                                        {topBar.socialLinks.map((link) => (
                                            <QuickZone
                                                key={link.id}
                                                id={`footer-topbar-social-${link.id}`}
                                                label={link.label || link.platform || __('Social link', 'adaire-blocks')}
                                                activeZone={activeZone}
                                                setActiveZone={setActiveZone}
                                                content={
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                                        <SelectControl label={__('Platform (icon)', 'adaire-blocks')} value={link.platform || 'twitter'}
                                                            options={['twitter','facebook','instagram','linkedin','youtube'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
                                                            onChange={(v) => updateTopBarSocialLink(link.id, 'platform', v)} />
                                                        <TextControl label={__('Label', 'adaire-blocks')} value={link.label || ''} onChange={(v) => updateTopBarSocialLink(link.id, 'label', v)} />
                                                        <TextControl label={__('URL', 'adaire-blocks')} value={link.url || ''} onChange={(v) => updateTopBarSocialLink(link.id, 'url', v)} placeholder="https://…" />
                                                        <Button variant="link" isDestructive onClick={() => removeTopBarSocialLink(link.id)}>{__('Remove', 'adaire-blocks')}</Button>
                                                    </div>
                                                }
                                            >
                                                <div className="website-footer-block__social-link-wrapper">
                                                    <a
                                                        className="website-footer-block__social-icon"
                                                        aria-label={link.label}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            width: (topBar.iconSize || 24) + 12, height: (topBar.iconSize || 24) + 12,
                                                            borderRadius: (topBar.borderRadius != null && topBar.borderRadius >= 0) ? `${topBar.borderRadius}%` : '50%',
                                                            fontSize: `${topBar.iconSize || 24}px`,
                                                            transition: `all ${(topBar.transitionDuration != null && topBar.transitionDuration >= 0) ? topBar.transitionDuration : 300}ms ease`,
                                                            // Base color/bg/border-color go through CSS vars (consumed by
                                                            // style.scss's base &__social-icon rule), NOT as literal style
                                                            // props — a literal color/backgroundColor/border here would
                                                            // out-specificity the :hover rule and the hover colors below
                                                            // would never visibly apply.
                                                            '--social-icon-color': topBar.iconColor || '',
                                                            '--social-icon-bg': topBar.iconBgColor || '',
                                                            '--social-border-color': topBar.borderColor || '',
                                                            '--social-hover-color': topBar.hoverColor || '',
                                                            '--social-hover-bg': topBar.hoverBackgroundColor || '',
                                                            '--social-hover-border-color': topBar.hoverBorderColor || '',
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: getIconSvg(link.platform) }}
                                                    />
                                                </div>
                                            </QuickZone>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Columns Section ─────────────────────────────────── */}
                    {showColumnsSection && (
                        <div className="website-footer-block__columns-section">
                            <div
                                className="website-footer-block__columns-grid"
                                style={{
                                    gap: `${columnsSection.columnGap}px`,
                                    alignItems: ALIGN_MAP[columnsSection.verticalAlignment] || 'flex-start',
                                }}
                            >
                                {columnsSection.columns.map((column) => {
                                    const isHidden = column.visible === false;
                                    return (
                                        <div
                                            key={column.id}
                                            className={`website-footer-block__column website-footer-block__column--${column.type}`}
                                            style={{
                                                textAlign: column.textAlign,
                                                flexBasis: column.width !== 'auto' ? column.width : 'auto',
                                                position: 'relative',
                                                opacity: isHidden ? 0.45 : 1,
                                                outline: isHidden ? '1px dashed rgba(255,255,255,0.4)' : 'none',
                                                outlineOffset: isHidden ? '4px' : 0,
                                            }}
                                        >
                                            {isHidden && (
                                                <span style={{
                                                    position: 'absolute', top: -10, left: 0, fontSize: 10,
                                                    textTransform: 'uppercase', letterSpacing: 0.5,
                                                    background: '#D52940', color: '#fff', padding: '1px 6px',
                                                    borderRadius: 3, zIndex: 2,
                                                }}>
                                                    {__('Hidden', 'adaire-blocks')}
                                                </span>
                                            )}

                                            {/* ── Single QuickZone wrapping all column content ── */}
                                            <QuickZone
                                                id={`footer-col-${column.id}`}
                                                label={column.headingText || __('Column', 'adaire-blocks')}
                                                activeZone={activeZone}
                                                setActiveZone={setActiveZone}
                                                content={
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 260 }}>
                                                        {/* Column type */}
                                                        <SelectControl
                                                            label={__('Column Type', 'adaire-blocks')}
                                                            value={column.type}
                                                            options={columnTypeOptions}
                                                            onChange={(v) => updateColumn(column.id, { type: v })}
                                                        />

                                                        {/* Brand-specific: logo vs text name toggle */}
                                                        {column.type === 'brand' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>Logo</strong>
                                                                <ToggleControl
                                                                    label={__('Show logo image', 'adaire-blocks')}
                                                                    checked={column.showLogo !== false}
                                                                    onChange={(v) => updateColumn(column.id, { showLogo: v })}
                                                                    help={__('On by default — matches existing footers that already have a logo set.', 'adaire-blocks')}
                                                                />
                                                                {column.showLogo !== false && (
                                                                    <>
                                                                        <MediaUploadCheck>
                                                                            <MediaUpload
                                                                                onSelect={(media) => updateColumn(column.id, { brandLogo: media.url })}
                                                                                allowedTypes={['image']}
                                                                                value={column.brandLogo}
                                                                                render={({ open }) => (
                                                                                    <Button variant="secondary" onClick={() => { markMediaOpening(); open(); }} style={{ width: '100%' }}>
                                                                                        {column.brandLogo ? __('Replace Logo', 'adaire-blocks') : __('Upload Logo', 'adaire-blocks')}
                                                                                    </Button>
                                                                                )}
                                                                            />
                                                                        </MediaUploadCheck>
                                                                        {column.brandLogo && (
                                                                            <RangeControl label={__('Logo width (px)', 'adaire-blocks')} value={column.brandLogoWidth || 120} min={20} max={400}
                                                                                onChange={(v) => updateColumn(column.id, { brandLogoWidth: v })} />
                                                                        )}
                                                                    </>
                                                                )}
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>Brand Name</strong>
                                                                <ToggleControl
                                                                    label={__('Show brand name text', 'adaire-blocks')}
                                                                    checked={effectiveShowBrandName(column)}
                                                                    onChange={(v) => updateColumn(column.id, { showBrandName: v })}
                                                                    help={__('Off by default — turn on to type a brand name under the logo.', 'adaire-blocks')}
                                                                />
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>Call to Action</strong>
                                                                <ToggleControl label={__('Show CTA button', 'adaire-blocks')} checked={!!column.showCta}
                                                                    onChange={(v) => updateColumn(column.id, { showCta: v })} />
                                                                {!!column.showCta && (
                                                                    <>
                                                                        <TextControl label={__('CTA Link URL', 'adaire-blocks')} value={column.ctaUrl || ''}
                                                                            onChange={(v) => updateColumn(column.id, { ctaUrl: v })} placeholder="https://…" />
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{__('Background Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={column.ctaBackgroundColor || ''} onChange={(v) => updateColumn(column.id, { ctaBackgroundColor: v || '' })} />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{__('Text Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={column.ctaTextColor || ''} onChange={(v) => updateColumn(column.id, { ctaTextColor: v || '' })} />
                                                                        </div>
                                                                        <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('CTA Hover State', 'adaire-blocks')}</strong>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{__('Hover Background Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={column.ctaHoverBackgroundColor || ''} onChange={(v) => updateColumn(column.id, { ctaHoverBackgroundColor: v || '' })} />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{__('Hover Text Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={column.ctaHoverColor || ''} onChange={(v) => updateColumn(column.id, { ctaHoverColor: v || '' })} />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{__('Hover Border Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={column.ctaHoverBorderColor || ''} onChange={(v) => updateColumn(column.id, { ctaHoverBorderColor: v || '' })} />
                                                                        </div>
                                                                        <RangeControl
                                                                            label={__('Border Radius (px)', 'adaire-blocks')}
                                                                            value={column.ctaBorderRadius != null && column.ctaBorderRadius >= 0 ? column.ctaBorderRadius : 4}
                                                                            min={0} max={40}
                                                                            onChange={(v) => updateColumn(column.id, { ctaBorderRadius: v })}
                                                                        />
                                                                        <RangeControl
                                                                            label={__('Hover Transition (ms)', 'adaire-blocks')}
                                                                            value={column.ctaTransitionDuration != null && column.ctaTransitionDuration >= 0 ? column.ctaTransitionDuration : 300}
                                                                            min={0} max={1000} step={50}
                                                                            onChange={(v) => updateColumn(column.id, { ctaTransitionDuration: v })}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Widget-area-specific: area picker */}
                                                        {column.type === 'widget-area' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <SelectControl
                                                                    label={__('Widget Area', 'adaire-blocks')}
                                                                    value={column.widgetAreaId || ''}
                                                                    options={widgetAreaOptions}
                                                                    onChange={(v) => updateColumn(column.id, { widgetAreaId: v })}
                                                                />
                                                            </>
                                                        )}

                                                        {/* Nav-specific: dynamic WP menu source + list styling */}
                                                        {column.type === 'nav' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Navigation', 'adaire-blocks')}</strong>
                                                                <SelectControl
                                                                    label={__('Navigation Source', 'adaire-blocks')}
                                                                    value={column.navigationSource || 'legacy'}
                                                                    options={navigationSourceOptions}
                                                                    onChange={(v) => updateColumn(column.id, { navigationSource: v })}
                                                                    help={__('Pull items live from a WordPress menu, or manage them manually below on canvas.', 'adaire-blocks')}
                                                                />
                                                                {column.navigationSource === 'menu' && (
                                                                    <SelectControl
                                                                        label={__('Menu', 'adaire-blocks')}
                                                                        value={column.selectedMenuId || 0}
                                                                        options={[
                                                                            { label: __('Select a menu…', 'adaire-blocks'), value: 0 },
                                                                            ...(wpMenus || []).map((menu) => ({ label: menu.name, value: menu.id })),
                                                                        ]}
                                                                        onChange={(v) => updateColumn(column.id, { selectedMenuId: Number(v) })}
                                                                    />
                                                                )}
                                                                {(column.navigationSource === 'primary' || column.navigationSource === 'footer') && (
                                                                    <p style={{ fontSize: 12, opacity: 0.75 }}>
                                                                        {__('Assign a menu to this location under Appearance → Menus.', 'adaire-blocks')}
                                                                    </p>
                                                                )}
                                                                <SelectControl label={__('List Style', 'adaire-blocks')} value={column.listStyle}
                                                                    options={[
                                                                        { label: 'Plain',    value: 'plain' },
                                                                        { label: 'Bulleted', value: 'bulleted' },
                                                                        { label: 'Numbered', value: 'numbered' },
                                                                        { label: 'Dashed',   value: 'dashed' },
                                                                        { label: 'Dotted',   value: 'dotted' },
                                                                    ]}
                                                                    onChange={(v) => updateColumn(column.id, { listStyle: v })} />
                                                                <RangeControl label={__('Item Spacing (px)', 'adaire-blocks')} value={column.itemSpacing} min={0} max={40}
                                                                    onChange={(v) => updateColumn(column.id, { itemSpacing: v })} />
                                                                <ToggleControl
                                                                    label={__('Underline links', 'adaire-blocks')}
                                                                    checked={!!column.linkUnderline}
                                                                    onChange={(v) => updateColumn(column.id, { linkUnderline: v })}
                                                                    help={__('Off by default — combine with List Style above for bullets, underlines, both, or neither.', 'adaire-blocks')}
                                                                />
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Link Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.linkColor || ''} onChange={(v) => updateColumn(column.id, { linkColor: v || '' })} />
                                                                </div>
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Link Hover State', 'adaire-blocks')}</strong>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Hover Text Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.linkHoverColor || ''} onChange={(v) => updateColumn(column.id, { linkHoverColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Hover Underline Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.linkHoverUnderlineColor || ''} onChange={(v) => updateColumn(column.id, { linkHoverUnderlineColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Hover Background Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.linkHoverBackgroundColor || ''} onChange={(v) => updateColumn(column.id, { linkHoverBackgroundColor: v || '' })} />
                                                                </div>
                                                                <RangeControl
                                                                    label={__('Hover Transition (ms)', 'adaire-blocks')}
                                                                    value={column.linkTransitionDuration != null && column.linkTransitionDuration >= 0 ? column.linkTransitionDuration : 300}
                                                                    min={0} max={1000} step={50}
                                                                    onChange={(v) => updateColumn(column.id, { linkTransitionDuration: v })}
                                                                />
                                                                {(column.navigationSource || 'legacy') === 'legacy' && (
                                                                    <>
                                                                        <p style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                                                                            {__('Click a link on canvas to edit its label, URL, or remove it.', 'adaire-blocks')}
                                                                        </p>
                                                                        <Button className="adaire-qz-add-btn" onClick={() => addNavItem(column.id)}>{__('+ Add Link', 'adaire-blocks')}</Button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Social-specific: display style + icon styling + link management */}
                                                        {column.type === 'social' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Social', 'adaire-blocks')}</strong>
                                                                <SelectControl label={__('Display Style', 'adaire-blocks')} value={column.displayStyle || 'vertical'}
                                                                    options={[
                                                                        { label: 'Vertical (text)', value: 'vertical' },
                                                                        { label: 'Icons',           value: 'icons' },
                                                                    ]}
                                                                    onChange={(v) => updateColumn(column.id, { displayStyle: v })} />
                                                                <RangeControl label={__('Icon Size (px)', 'adaire-blocks')} value={column.iconSize || 24} min={12} max={60}
                                                                    onChange={(v) => updateColumn(column.id, { iconSize: v })} />
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.iconColor || ''} onChange={(v) => updateColumn(column.id, { iconColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Background Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.iconBgColor || ''} onChange={(v) => updateColumn(column.id, { iconBgColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Hover Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.socialHoverColor || ''} onChange={(v) => updateColumn(column.id, { socialHoverColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Hover Background', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.socialHoverBackgroundColor || ''} onChange={(v) => updateColumn(column.id, { socialHoverBackgroundColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Border Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.socialBorderColor || ''} onChange={(v) => updateColumn(column.id, { socialBorderColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Icon Hover Border Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.socialHoverBorderColor || ''} onChange={(v) => updateColumn(column.id, { socialHoverBorderColor: v || '' })} />
                                                                </div>
                                                                <RangeControl
                                                                    label={__('Icon Border Radius (%)', 'adaire-blocks')}
                                                                    value={column.socialBorderRadius != null && column.socialBorderRadius >= 0 ? column.socialBorderRadius : 50}
                                                                    min={0} max={50}
                                                                    onChange={(v) => updateColumn(column.id, { socialBorderRadius: v })}
                                                                    help={__('50% = circle, 0% = square', 'adaire-blocks')}
                                                                />
                                                                <RangeControl
                                                                    label={__('Icon Spacing (px)', 'adaire-blocks')}
                                                                    value={column.socialIconSpacing != null && column.socialIconSpacing >= 0 ? column.socialIconSpacing : 12}
                                                                    min={0} max={40}
                                                                    onChange={(v) => updateColumn(column.id, { socialIconSpacing: v })}
                                                                />
                                                                <RangeControl
                                                                    label={__('Hover Transition (ms)', 'adaire-blocks')}
                                                                    value={column.socialTransitionDuration != null && column.socialTransitionDuration >= 0 ? column.socialTransitionDuration : 300}
                                                                    min={0} max={1000} step={50}
                                                                    onChange={(v) => updateColumn(column.id, { socialTransitionDuration: v })}
                                                                />
                                                                <p style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                                                                    {__('Click an icon on canvas to edit its platform, label, URL, or remove it.', 'adaire-blocks')}
                                                                </p>
                                                                <Button className="adaire-qz-add-btn" onClick={() => addSocialItem(column.id)}>{__('+ Add Social Link', 'adaire-blocks')}</Button>
                                                            </>
                                                        )}

                                                        {/* Newsletter-specific */}
                                                        {column.type === 'newsletter' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Newsletter', 'adaire-blocks')}</strong>
                                                                <TextControl label={__('Email Field Name', 'adaire-blocks')} value={column.newsletterFieldName || 'email'}
                                                                    onChange={(v) => updateColumn(column.id, { newsletterFieldName: v })}
                                                                    help={__('The form field name your email provider expects.', 'adaire-blocks')} />
                                                                <TextControl label={__('Form Action URL', 'adaire-blocks')} value={column.newsletterAction || ''}
                                                                    onChange={(v) => updateColumn(column.id, { newsletterAction: v })}
                                                                    placeholder="https://example.com/subscribe" />
                                                                <TextControl label={__('Input Placeholder', 'adaire-blocks')} value={column.newsletterPlaceholder || ''}
                                                                    onChange={(v) => updateColumn(column.id, { newsletterPlaceholder: v })}
                                                                    placeholder={__('Enter your email', 'adaire-blocks')} />
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Button Background', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.newsletterButtonColor || ''} onChange={(v) => updateColumn(column.id, { newsletterButtonColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Button Text Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.newsletterButtonTextColor || ''} onChange={(v) => updateColumn(column.id, { newsletterButtonTextColor: v || '' })} />
                                                                </div>
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <label>{__('Input Border Color', 'adaire-blocks')}</label>
                                                                    <BoundColorPalette value={column.newsletterInputBorderColor || ''} onChange={(v) => updateColumn(column.id, { newsletterInputBorderColor: v || '' })} />
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* Buttons-specific: layout + per-button management */}
                                                        {column.type === 'buttons' && (
                                                            <>
                                                                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Buttons', 'adaire-blocks')}</strong>
                                                                <SelectControl label={__('Layout', 'adaire-blocks')} value={column.buttonsLayout || 'horizontal'}
                                                                    options={[{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }]}
                                                                    onChange={(v) => updateColumn(column.id, { buttonsLayout: v })} />
                                                                <p style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                                                                    {__('Click a button on canvas to edit its label, URL, style, or remove it.', 'adaire-blocks')}
                                                                </p>
                                                                <Button className="adaire-qz-add-btn" onClick={() => addButtonsItem(column.id)}>{__('+ Add Button', 'adaire-blocks')}</Button>
                                                            </>
                                                        )}

                                                        {/* Common settings */}
                                                        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                        <ToggleControl label={__('Show heading', 'adaire-blocks')} checked={column.showHeading}
                                                            onChange={(v) => updateColumn(column.id, { showHeading: v })} />
                                                        <SelectControl label={__('Text align', 'adaire-blocks')} value={column.textAlign}
                                                            options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
                                                            onChange={(v) => updateColumn(column.id, { textAlign: v })} />
                                                        <ToggleControl
                                                            label={__('Show on front end', 'adaire-blocks')}
                                                            checked={column.visible !== false}
                                                            onChange={(v) => updateColumn(column.id, { visible: v })}
                                                            help={__('Hide this column from visitors without deleting it.', 'adaire-blocks')}
                                                        />

                                                        {/* Column order */}
                                                        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <Button variant="secondary" style={{ flex: 1 }} onClick={() => moveColumn(column.id, 'left')}>← Move</Button>
                                                            <Button variant="secondary" style={{ flex: 1 }} onClick={() => moveColumn(column.id, 'right')}>Move →</Button>
                                                            <Button variant="secondary" isDestructive onClick={() => removeColumn(column.id)} style={{ paddingLeft: 10, paddingRight: 10 }}>✕</Button>
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                {/* ── Column content inside QuickZone ── */}

                                                {/* Heading */}
                                                {column.showHeading && (
                                                    <RichText tagName={column.headingTag || 'h3'} className="website-footer-block__column-heading"
                                                        value={column.headingText} onChange={(v) => updateColumn(column.id, { headingText: v })}
                                                        placeholder="Column Heading" withoutInteractiveFormatting />
                                                )}

                                                {/* Nav column */}
                                                {column.type === 'nav' && (
                                                    <>
                                                        {column.navigationSource && column.navigationSource !== 'legacy' ? (
                                                            isMenuLoadingForColumn(column) ? (
                                                                <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                                    {__('Loading menu…', 'adaire-blocks')}
                                                                </p>
                                                            ) : (menuTreeByColumn[column.id] || []).length > 0 ? (
                                                                <ul className={`website-footer-block__nav-list website-footer-block__nav-list--${column.listStyle}`}
                                                                    style={{ gap: `${column.itemSpacing}px` }}>
                                                                    {menuTreeByColumn[column.id].map((item) => (
                                                                        <FooterDynamicMenuNode key={item.id} item={item} column={column} />
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                                    {column.navigationSource === 'menu'
                                                                        ? __('No menu selected yet — choose one in the settings panel.', 'adaire-blocks')
                                                                        : __('No menu assigned to this location yet — assign one under Appearance → Menus.', 'adaire-blocks')}
                                                                </p>
                                                            )
                                                        ) : (
                                                            <ul className={`website-footer-block__nav-list website-footer-block__nav-list--${column.listStyle}`}
                                                                style={{ gap: `${column.itemSpacing}px` }}>
                                                                {(column.navItems || []).map((item, itemIndex) => (
                                                                    <li key={item.id} style={{ listStyle: 'none' }}>
                                                                        <QuickZone
                                                                            id={`footer-navitem-${column.id}-${item.id}`}
                                                                            label={item.label || __('Link', 'adaire-blocks')}
                                                                            activeZone={activeZone}
                                                                            setActiveZone={setActiveZone}
                                                                            content={
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                                                                    <TextControl label={__('Label', 'adaire-blocks')} value={item.label || ''}
                                                                                        onChange={(v) => updateNavItem(column.id, itemIndex, 'label', v)} />
                                                                                    <TextControl label={__('URL', 'adaire-blocks')} value={item.url || ''}
                                                                                        onChange={(v) => updateNavItem(column.id, itemIndex, 'url', v)} placeholder="https://…" />
                                                                                    <Button variant="link" isDestructive onClick={() => removeNavItem(column.id, itemIndex)}>{__('Remove link', 'adaire-blocks')}</Button>
                                                                                </div>
                                                                            }
                                                                        >
                                                                            <span
                                                                                className="website-footer-block__nav-link"
                                                                                style={{
                                                                                    // See FooterDynamicMenuNode above — base color
                                                                                    // goes through --link-color, not a literal
                                                                                    // `color` prop, so :hover can still win.
                                                                                    '--link-color': column.linkColor || undefined,
                                                                                    '--link-hover-color': column.linkHoverColor || undefined,
                                                                                    '--link-hover-bg': column.linkHoverBackgroundColor || undefined,
                                                                                    '--link-hover-underline-color': column.linkHoverUnderlineColor || undefined,
                                                                                    '--link-underline-mode': column.linkUnderline ? 'underline' : undefined,
                                                                                    '--link-hover-underline-mode': (column.linkUnderline || column.linkHoverUnderlineColor) ? 'underline' : undefined,
                                                                                    '--link-transition-duration': (column.linkTransitionDuration != null && column.linkTransitionDuration >= 0) ? `${column.linkTransitionDuration}ms` : undefined,
                                                                                }}
                                                                            >
                                                                                {item.label || __('Link', 'adaire-blocks')}
                                                                            </span>
                                                                        </QuickZone>
                                                                    </li>
                                                                ))}
                                                                {!(column.navItems || []).length && (
                                                                    <li style={{ listStyle: 'none', fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                                        {__('Add links via the settings panel →', 'adaire-blocks')}
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        )}
                                                    </>
                                                )}

                                                {/* Brand column */}
                                                {column.type === 'brand' && (
                                                    <>
                                                        {column.showLogo !== false && column.brandLogo ? (
                                                            <img src={column.brandLogo} alt={column.brandName}
                                                                style={{ maxWidth: `${column.brandLogoWidth || 120}px`, display: 'block', marginBottom: 8 }} />
                                                        ) : column.showLogo !== false && !column.brandLogo ? (
                                                            <div style={{ padding: '12px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 6, textAlign: 'center', fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
                                                                Click "Logo" pen → Upload Logo
                                                            </div>
                                                        ) : null}
                                                        {effectiveShowBrandName(column) && (
                                                            <RichText tagName="div" className="website-footer-block__brand-name"
                                                                value={column.brandName} onChange={(v) => updateColumn(column.id, { brandName: v })}
                                                                placeholder="Brand Name" withoutInteractiveFormatting />
                                                        )}
                                                        <RichText tagName="p" className="website-footer-block__brand-description"
                                                            value={column.description} onChange={(v) => updateColumn(column.id, { description: v })}
                                                            placeholder="Brand description…"
                                                            style={{
                                                                // Tagline typography/color (ADAB-012) — routed through CSS
                                                                // vars (consumed by style.scss's &__brand-description rule)
                                                                // rather than literal style props, same reasoning as the
                                                                // link/social-icon hover-state comments elsewhere in this
                                                                // file: keeps room for a future hover state without an
                                                                // inline literal out-specificity-ing it.
                                                                '--tagline-font-size': (column.taglineFontSize != null && column.taglineFontSize >= 0) ? `${column.taglineFontSize}px` : undefined,
                                                                '--tagline-font-weight': column.taglineFontWeight || undefined,
                                                                '--tagline-line-height': (column.taglineLineHeight != null && column.taglineLineHeight >= 0) ? column.taglineLineHeight : undefined,
                                                                '--tagline-letter-spacing': (column.taglineLetterSpacing != null && column.taglineLetterSpacing >= 0) ? `${column.taglineLetterSpacing}px` : undefined,
                                                                '--tagline-color': column.taglineColor || undefined,
                                                                // Only override the legacy 0.9 dimming once a color is
                                                                // explicitly chosen — see style.scss comment.
                                                                '--tagline-opacity': column.taglineColor ? 1 : undefined,
                                                            }} />
                                                        {column.showCta && (
                                                            <RichText tagName="a"
                                                                className={`website-footer-block__cta website-footer-block__cta--${column.ctaStyle}`}
                                                                value={column.ctaText} onChange={(v) => updateColumn(column.id, { ctaText: v })}
                                                                placeholder="Call to Action"
                                                                style={{
                                                                    backgroundColor: column.ctaStyle === 'button' ? column.ctaBackgroundColor : 'transparent',
                                                                    color: column.ctaStyle === 'button' ? column.ctaTextColor : 'inherit',
                                                                    '--cta-hover-bg': column.ctaHoverBackgroundColor || undefined,
                                                                    '--cta-hover-color': column.ctaHoverColor || undefined,
                                                                    '--cta-hover-border-color': column.ctaHoverBorderColor || undefined,
                                                                    '--cta-border-radius': (column.ctaBorderRadius != null && column.ctaBorderRadius >= 0) ? `${column.ctaBorderRadius}px` : undefined,
                                                                    '--cta-transition-duration': (column.ctaTransitionDuration != null && column.ctaTransitionDuration >= 0) ? `${column.ctaTransitionDuration}ms` : undefined,
                                                                }} />
                                                        )}
                                                    </>
                                                )}

                                                {/* Social column */}
                                                {column.type === 'social' && (
                                                    <div
                                                        className={`website-footer-block__social-list website-footer-block__social-list--${column.displayStyle || 'vertical'}`}
                                                        style={{
                                                            gap: (column.socialIconSpacing != null && column.socialIconSpacing >= 0) ? `${column.socialIconSpacing}px` : undefined,
                                                        }}
                                                    >
                                                        {(column.socialItems || []).map((item) => (
                                                            <QuickZone
                                                                key={item.id}
                                                                id={`footer-socialitem-${column.id}-${item.id}`}
                                                                label={item.label || item.platform || __('Social link', 'adaire-blocks')}
                                                                activeZone={activeZone}
                                                                setActiveZone={setActiveZone}
                                                                content={
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                                                        <SelectControl label={__('Platform (icon)', 'adaire-blocks')} value={item.platform || 'twitter'}
                                                                            options={['twitter','facebook','instagram','linkedin','youtube'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
                                                                            onChange={(v) => updateSocialPlatform(column.id, item.id, v)} />
                                                                        <TextControl label={__('Label', 'adaire-blocks')} value={item.label || ''} onChange={(v) => updateSocialItem(column.id, item.id, 'label', v)} />
                                                                        <TextControl label={__('URL', 'adaire-blocks')} value={item.url || ''} onChange={(v) => updateSocialItem(column.id, item.id, 'url', v)} placeholder="https://…" />
                                                                        <Button variant="link" isDestructive onClick={() => removeSocialItem(column.id, item.id)}>{__('Remove', 'adaire-blocks')}</Button>
                                                                    </div>
                                                                }
                                                            >
                                                                {(column.displayStyle || 'vertical') === 'vertical' ? (
                                                                    <span style={{ color: column.iconColor || 'inherit', display: 'inline-block' }}>
                                                                        {item.label || __('Social Link', 'adaire-blocks')}
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className="website-footer-block__social-icon"
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                            width: (column.iconSize || 24) + 12, height: (column.iconSize || 24) + 12,
                                                                            borderRadius: (column.socialBorderRadius != null && column.socialBorderRadius >= 0) ? `${column.socialBorderRadius}%` : '50%',
                                                                            fontSize: `${column.iconSize || 24}px`,
                                                                            transition: `all ${(column.socialTransitionDuration != null && column.socialTransitionDuration >= 0) ? column.socialTransitionDuration : 300}ms ease`,
                                                                            // See top-bar icon style comment: base color/bg/border
                                                                            // must go through CSS vars, not literal style props, or
                                                                            // the :hover rule can never out-specificity them.
                                                                            '--social-icon-color': column.iconColor || '',
                                                                            '--social-icon-bg': column.iconBgColor || '',
                                                                            '--social-border-color': column.socialBorderColor || '',
                                                                            '--social-hover-color': column.socialHoverColor || '',
                                                                            '--social-hover-bg': column.socialHoverBackgroundColor || '',
                                                                            '--social-hover-border-color': column.socialHoverBorderColor || '',
                                                                        }}
                                                                    >
                                                                        <span dangerouslySetInnerHTML={{ __html: getIconSvg(item.icon || item.platform) }} />
                                                                    </span>
                                                                )}
                                                            </QuickZone>
                                                        ))}
                                                        {!(column.socialItems || []).length && (
                                                            <span style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                                {__('Add links via the settings panel →', 'adaire-blocks')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Newsletter column */}
                                                {column.type === 'newsletter' && (
                                                    <div className="website-footer-block__newsletter">
                                                        <RichText tagName="p" className="website-footer-block__newsletter-description"
                                                            value={column.newsletterDescription} onChange={(v) => updateColumn(column.id, { newsletterDescription: v })}
                                                            placeholder={__('Newsletter description…', 'adaire-blocks')} />
                                                        <div className="website-footer-block__newsletter-field-row">
                                                            <input type="email" disabled
                                                                className="website-footer-block__newsletter-input"
                                                                placeholder={column.newsletterPlaceholder || __('Enter your email', 'adaire-blocks')}
                                                                style={column.newsletterInputBorderColor ? { borderColor: column.newsletterInputBorderColor } : undefined}
                                                                onClick={(e) => e.stopPropagation()} />
                                                            <RichText tagName="span" className="website-footer-block__newsletter-button"
                                                                value={column.newsletterButtonText} onChange={(v) => updateColumn(column.id, { newsletterButtonText: v })}
                                                                placeholder={__('Subscribe', 'adaire-blocks')} withoutInteractiveFormatting
                                                                style={{
                                                                    backgroundColor: column.newsletterButtonColor || 'var(--footer-accent-color, #503AA8)',
                                                                    color: column.newsletterButtonTextColor || '#ffffff',
                                                                }} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Buttons column */}
                                                {column.type === 'buttons' && (
                                                    <div className={`website-footer-block__buttons website-footer-block__buttons--${column.buttonsLayout || 'horizontal'}`}>
                                                        {(column.buttonsItems || []).map((item) => (
                                                            <QuickZone
                                                                key={item.id}
                                                                id={`footer-btnitem-${column.id}-${item.id}`}
                                                                label={item.label || __('Button', 'adaire-blocks')}
                                                                activeZone={activeZone}
                                                                setActiveZone={setActiveZone}
                                                                content={
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                                                        <TextControl label={__('Label', 'adaire-blocks')} value={item.label || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'label', v)} />
                                                                        <TextControl label={__('URL', 'adaire-blocks')} value={item.url || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'url', v)} placeholder="https://…" />
                                                                        <SelectControl label={__('Style', 'adaire-blocks')} value={item.style || 'solid'}
                                                                            options={[{ label: 'Solid', value: 'solid' }, { label: 'Outline', value: 'outline' }]}
                                                                            onChange={(v) => updateButtonsItem(column.id, item.id, 'style', v)} />
                                                                        <div style={{ marginBottom: 4 }}>
                                                                            <label>{__('Background', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={item.backgroundColor || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'backgroundColor', v || '')} />
                                                                        </div>
                                                                        <div style={{ marginBottom: 4 }}>
                                                                            <label>{__('Text Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={item.textColor || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'textColor', v || '')} />
                                                                        </div>
                                                                        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                        <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{__('Hover State', 'adaire-blocks')}</strong>
                                                                        <div style={{ marginBottom: 4 }}>
                                                                            <label>{__('Hover Background', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={item.hoverBackgroundColor || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'hoverBackgroundColor', v || '')} />
                                                                        </div>
                                                                        <div style={{ marginBottom: 4 }}>
                                                                            <label>{__('Hover Text Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={item.hoverTextColor || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'hoverTextColor', v || '')} />
                                                                        </div>
                                                                        <div style={{ marginBottom: 4 }}>
                                                                            <label>{__('Hover Border Color', 'adaire-blocks')}</label>
                                                                            <BoundColorPalette value={item.hoverBorderColor || ''} onChange={(v) => updateButtonsItem(column.id, item.id, 'hoverBorderColor', v || '')} />
                                                                        </div>
                                                                        <RangeControl
                                                                            label={__('Border Radius (px)', 'adaire-blocks')}
                                                                            value={item.borderRadius != null && item.borderRadius >= 0 ? item.borderRadius : 4}
                                                                            min={0} max={50}
                                                                            onChange={(v) => updateButtonsItem(column.id, item.id, 'borderRadius', v)}
                                                                        />
                                                                        <RangeControl
                                                                            label={__('Hover Transition (ms)', 'adaire-blocks')}
                                                                            value={item.transitionDuration != null && item.transitionDuration >= 0 ? item.transitionDuration : 300}
                                                                            min={0} max={1000} step={50}
                                                                            onChange={(v) => updateButtonsItem(column.id, item.id, 'transitionDuration', v)}
                                                                        />
                                                                        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0' }} />
                                                                        <ToggleControl label={__('Open in new tab', 'adaire-blocks')} checked={!!item.newTab} onChange={(v) => updateButtonsItem(column.id, item.id, 'newTab', v)} />
                                                                        <Button variant="link" isDestructive onClick={() => removeButtonsItem(column.id, item.id)}>{__('Remove', 'adaire-blocks')}</Button>
                                                                    </div>
                                                                }
                                                            >
                                                                <span
                                                                    className={`website-footer-block__buttons-item website-footer-block__buttons-item--${item.style || 'solid'}`}
                                                                    style={{
                                                                        backgroundColor: (item.style || 'solid') === 'solid' ? (item.backgroundColor || 'var(--footer-accent-color, #503AA8)') : 'transparent',
                                                                        color: item.textColor || ((item.style || 'solid') === 'solid' ? '#ffffff' : 'inherit'),
                                                                        borderColor: item.backgroundColor || 'var(--footer-accent-color, #503AA8)',
                                                                        borderRadius: (item.borderRadius != null && item.borderRadius >= 0) ? `${item.borderRadius}px` : undefined,
                                                                        transition: `all ${(item.transitionDuration != null && item.transitionDuration >= 0) ? item.transitionDuration : 300}ms ease`,
                                                                        '--buttons-hover-bg': item.hoverBackgroundColor || undefined,
                                                                        '--buttons-hover-color': item.hoverTextColor || undefined,
                                                                        '--buttons-hover-border-color': item.hoverBorderColor || undefined,
                                                                    }}>
                                                                    {item.label || __('Button', 'adaire-blocks')}
                                                                </span>
                                                            </QuickZone>
                                                        ))}
                                                        {!(column.buttonsItems || []).length && (
                                                            <span style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                                {__('Add buttons via the settings panel →', 'adaire-blocks')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Copyright column */}
                                                {column.type === 'copyright' && (
                                                    <div className="website-footer-block__copyright-block">
                                                        <RichText tagName="p" value={column.copyrightText}
                                                            onChange={(v) => updateColumn(column.id, { copyrightText: v })}
                                                            placeholder={__('© {year} Your Company. All rights reserved.', 'adaire-blocks')}
                                                            withoutInteractiveFormatting />
                                                    </div>
                                                )}

                                                {/* Widget area column */}
                                                {column.type === 'widget-area' && (
                                                    <div className="website-footer-block__widget-area-placeholder"
                                                        style={{ padding: '16px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 6, textAlign: 'center', fontSize: 12, opacity: 0.7 }}>
                                                        {column.widgetAreaId
                                                            ? (widgetAreaOptions.find((o) => o.value === column.widgetAreaId) || {}).label
                                                                + ' — ' + __('widgets render on the live site', 'adaire-blocks')
                                                            : __('Choose a widget area in the settings panel →', 'adaire-blocks')}
                                                    </div>
                                                )}

                                                {/* Custom HTML column */}
                                                {column.type === 'custom' && (
                                                    <RichText tagName="div" className="website-footer-block__custom-content"
                                                        value={column.customContent} onChange={(v) => updateColumn(column.id, { customContent: v })}
                                                        placeholder={__('Custom content…', 'adaire-blocks')} multiline />
                                                )}
                                            </QuickZone>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <Button className="website-footer-block__add-column" onClick={addColumn}>
                                    {__('+ Add Column', 'adaire-blocks')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Bottom Bar ───────────────────────────────────── */}
                    {showBottomBar && (
                        <div
                            className="website-footer-block__bottom-bar"
                            style={{
                                textAlign: bottomBar.alignment === 'space-between' ? 'left' : bottomBar.alignment,
                                backgroundColor: bottomBar.backgroundColor || 'transparent',
                                padding: `${bottomBar.paddingVertical}px 0`,
                                borderTop: bottomBar.showDivider ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            }}
                        >
                            <div className="website-footer-block__bottom-bar-content">
                                <div className="website-footer-block__bottom-bar-copyright" style={{ color: bottomBar.textColor || undefined }}>
                                    {bottomBar.showCopyright && (
                                        <RichText tagName="p" value={bottomBar.copyrightText}
                                            onChange={(v) => updateBottomBar({ copyrightText: v })}
                                            placeholder="© 2024 Your Company." withoutInteractiveFormatting />
                                    )}
                                </div>
                                {bottomBar.showPrivacyPolicy && (
                                    <div className="website-footer-block__bottom-bar-legal">
                                        {(bottomBar.legalLinks || []).map((link, index) => (
                                            <span key={link.id} className="website-footer-block__legal-link-wrapper">
                                                {index > 0 && <span className="website-footer-block__separator">{bottomBar.separator}</span>}
                                                <RichText tagName="a" className="website-footer-block__legal-link" value={link.label}
                                                    onChange={(v) => updateLegalLink(link.id, 'label', v)}
                                                    placeholder="Privacy" withoutInteractiveFormatting
                                                    style={{
                                                        color: bottomBar.legalLinkColor || undefined,
                                                        '--legal-underline-mode': bottomBar.legalLinkUnderline ? 'underline' : undefined,
                                                        '--legal-hover-color': bottomBar.legalLinkHoverColor || undefined,
                                                        '--legal-hover-bg': bottomBar.legalLinkHoverBackgroundColor || undefined,
                                                        '--legal-hover-underline-color': bottomBar.legalLinkHoverUnderlineColor || undefined,
                                                        '--legal-hover-underline-mode': (bottomBar.legalLinkUnderline || bottomBar.legalLinkHoverUnderlineColor) ? 'underline' : undefined,
                                                        '--legal-transition-duration': (bottomBar.legalLinkTransitionDuration != null && bottomBar.legalLinkTransitionDuration >= 0) ? `${bottomBar.legalLinkTransitionDuration}ms` : undefined,
                                                    }} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {bottomBar.showSocialIcons && (
                                    <div
                                        className="website-footer-block__bottom-bar-social"
                                        style={{ gap: (bottomBar.iconSpacing != null && bottomBar.iconSpacing >= 0) ? `${bottomBar.iconSpacing}px` : undefined }}
                                    >
                                        {(bottomBar.socialIcons || []).map((link) => (
                                            <QuickZone
                                                key={link.id}
                                                id={`footer-bottombar-social-${link.id}`}
                                                label={link.label || link.platform || __('Social icon', 'adaire-blocks')}
                                                activeZone={activeZone}
                                                setActiveZone={setActiveZone}
                                                content={
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                                        <SelectControl label={__('Platform (icon)', 'adaire-blocks')} value={link.platform || 'twitter'}
                                                            options={['twitter','facebook','instagram','linkedin','youtube'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
                                                            onChange={(v) => updateBottomBarSocialPlatform(link.id, v)} />
                                                        <TextControl label={__('Label', 'adaire-blocks')} value={link.label || ''} onChange={(v) => updateBottomBarSocialIcon(link.id, 'label', v)} />
                                                        <TextControl label={__('URL', 'adaire-blocks')} value={link.url || ''} onChange={(v) => updateBottomBarSocialIcon(link.id, 'url', v)} placeholder="https://…" />
                                                        <Button variant="link" isDestructive onClick={() => removeBottomBarSocialIcon(link.id)}>{__('Remove', 'adaire-blocks')}</Button>
                                                    </div>
                                                }
                                            >
                                                <span
                                                    className="website-footer-block__social-icon"
                                                    aria-label={link.label}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: (bottomBar.iconSize || 24) + 12, height: (bottomBar.iconSize || 24) + 12,
                                                        borderRadius: (bottomBar.borderRadius != null && bottomBar.borderRadius >= 0) ? `${bottomBar.borderRadius}%` : '50%',
                                                        fontSize: `${bottomBar.iconSize || 24}px`,
                                                        transition: `all ${(bottomBar.transitionDuration != null && bottomBar.transitionDuration >= 0) ? bottomBar.transitionDuration : 300}ms ease`,
                                                        // See top-bar icon style comment above: base color/bg/border
                                                        // must go through CSS vars, not literal style props, or the
                                                        // :hover rule can never out-specificity them.
                                                        '--social-icon-color': bottomBar.iconColor || '',
                                                        '--social-icon-bg': bottomBar.iconBgColor || '',
                                                        '--social-border-color': bottomBar.borderColor || '',
                                                        '--social-hover-color': bottomBar.hoverColor || '',
                                                        '--social-hover-bg': bottomBar.hoverBackgroundColor || '',
                                                        '--social-hover-border-color': bottomBar.hoverBorderColor || '',
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: getIconSvg(link.icon || link.platform) }}
                                                />
                                            </QuickZone>
                                        ))}
                                        {!(bottomBar.socialIcons || []).length && (
                                            <span style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
                                                {__('Add icons via the settings panel →', 'adaire-blocks')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                </QuickZone>
            </div>
        </>
    );
}
