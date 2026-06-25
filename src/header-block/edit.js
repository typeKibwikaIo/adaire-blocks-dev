import { useState, useRef, useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useBlockProps, MediaUpload, MediaUploadCheck, RichText, InspectorControls } from '@wordpress/block-editor';
import {
    Button, ColorPicker, GradientPicker, PanelBody, Popover,
    RangeControl, SelectControl, TextControl,
    ToggleControl, ColorPalette,
} from '@wordpress/components';
import QuickZone, { PenIcon, CloseIcon, isMediaLibraryOpen } from '../components/QuickZone';
import { __ } from '@wordpress/i18n';
import HeaderIcon, { iconOptions, SocialIcon } from './icon-utils';
import InspectorTabs from '../components/InspectorTabs';
import { boxToCss } from '../components/spacing-utils';

// ─── Option maps ──────────────────────────────────────────────────────────

const layoutOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Centered',   value: 'centered'   },
    { label: 'Stacked',    value: 'stacked'    },
    { label: 'Split',      value: 'split'      },
    { label: 'Minimal',    value: 'minimal'    },
];

const stickyOptions = [
    { label: 'Static',              value: 'static'    },
    { label: 'Sticky',              value: 'sticky'    },
    { label: 'Sticky on scroll up', value: 'scroll-up' },
    { label: 'Hide down, show up',  value: 'hide-down' },
];

const mobileStyleOptions = [
    { label: 'Dropdown',            value: 'dropdown' },
    { label: 'Slide-in',            value: 'slide-in' },
    { label: 'Full screen overlay', value: 'overlay'  },
];

const ctaStyleOptions = [
    { label: 'Filled',   value: 'filled'   },
    { label: 'Outlined', value: 'outlined' },
    { label: 'Ghost',    value: 'ghost'    },
];

const iconPositionOptions = [
    { label: 'Left',  value: 'left'  },
    { label: 'Right', value: 'right' },
];

const buttonShapeOptions = [
    { label: 'Pill',    value: 'pill'    },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Square',  value: 'square'  },
];

const platformOptions = ['Facebook','Instagram','X','YouTube','LinkedIn','TikTok'];

const topBarJustifyMap = {
    'space-between': 'space-between',
    'left':          'flex-start',
    'center':        'center',
    'right':         'flex-end',
};

const navigationSourceOptions = [
    { label: 'Custom (manual)',      value: 'legacy'  },
    { label: 'Primary Menu',         value: 'primary' },
    { label: 'Footer Menu',          value: 'footer'  },
    { label: 'Select existing menu', value: 'menu'    },
];

const hamburgerIconStyleOptions = [
    { label: 'Bars (default)', value: 'bars' },
    { label: 'Dots',           value: 'dots' },
    { label: 'Plus / X',       value: 'plus' },
];

const mobileSlideDirectionOptions = [
    { label: 'Slide from right', value: 'right' },
    { label: 'Slide from left',  value: 'left'  },
];

// ─── Background position grid ───────────────────────────────────────────

const BG_POSITIONS = [
    ['top left',    'top center',    'top right'   ],
    ['center left', 'center center', 'center right'],
    ['bottom left', 'bottom center', 'bottom right'],
];

function BgPositionPicker({ value, onChange }) {
    return (
        <div className="adaire-bgpos__wrap">
            <div className="adaire-bgpos">
                { BG_POSITIONS.flat().map( pos => (
                    <button
                        key={ pos }
                        type="button"
                        className={ `adaire-bgpos__dot${ value === pos ? ' is-active' : '' }` }
                        onClick={ () => onChange( pos ) }
                        title={ pos }
                    />
                ) ) }
            </div>
            <div className="adaire-bgpos__label-row">
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Position:</span>
                <span className="adaire-bgpos__value">{ value || 'center center' }</span>
            </div>
        </div>
    );
}

// QuickZone, PenIcon, CloseIcon imported from ../components/QuickZone

// ─── Style helpers ───────────────────────────────────────────────────────

function getActionRadius( shape ) {
    switch ( shape ) {
        case 'square':  return '0px';
        case 'rounded': return '10px';
        case 'pill':
        default:        return '999px';
    }
}

// Resolves which of the three mutually-exclusive background modes is active.
// Mirrors render.php's adaire_header_get_effective_background_type() — reads
// the explicit backgroundType attribute when set, otherwise infers it from
// whichever legacy field is populated so content saved before this attribute
// existed keeps rendering exactly as it did before (image > gradient > color).
export function getEffectiveBackgroundType( attributes ) {
    if ( attributes.backgroundType ) {
        return attributes.backgroundType;
    }
    if ( attributes.bgImageUrl ) {
        return 'image';
    }
    if ( attributes.useGradient ) {
        return 'gradient';
    }
    return 'color';
}

function getHeaderStyle( attributes ) {
    const bgType = getEffectiveBackgroundType( attributes );
    const background = attributes.transparentHeader
        ? 'transparent'
        : bgType === 'image' && attributes.bgImageUrl
            ? 'transparent'
            : bgType === 'gradient'
                ? attributes.gradientBackground
                : attributes.backgroundColor;

    const topBarJustify = topBarJustifyMap[ attributes.topBarLayout ] || 'space-between';

    const styles = {
        '--adaire-header-background':        background,
        '--adaire-header-text-color':        attributes.textColor,
        '--adaire-header-hover-color':       attributes.hoverColor,
        '--adaire-header-border-color':      attributes.borderColor,
        '--adaire-header-border-width':      attributes.borderBottom ? `${ attributes.borderThickness }px` : '0px',
        '--adaire-header-padding-top':       `${ attributes.paddingTop }px`,
        '--adaire-header-padding-bottom':    `${ attributes.paddingBottom }px`,
        '--adaire-header-max-width':         attributes.maxWidthMode === 'contained' ? `${ attributes.maxWidth }px` : '100%',
        '--adaire-header-nav-gap':           `${ attributes.navSpacing }px`,
        '--adaire-header-nav-font-size':     `${ attributes.navFontSize }px`,
        '--adaire-header-nav-font-weight':   attributes.navFontWeight,
        '--adaire-header-letter-spacing':    `${ attributes.letterSpacing }px`,
        '--adaire-header-text-transform':    attributes.textTransform,
        '--adaire-header-logo-width':        `${ attributes.logoWidth }px`,
        '--adaire-header-mobile-logo-width': `${ attributes.mobileLogoWidth }px`,
        '--adaire-header-topbar-bg':         attributes.topBarBackgroundColor,
        '--adaire-header-topbar-color':      attributes.topBarTextColor,
        '--adaire-header-topbar-font-size':  `${ attributes.topBarFontSize || 13 }px`,
        '--adaire-header-topbar-justify':    topBarJustify,
        '--adaire-header-topbar-gap':        attributes.topBarLayout === 'space-between' ? '24px' : '12px',
        '--adaire-header-social-size':       `${ attributes.socialIconSize }px`,
        '--adaire-header-social-color':      attributes.socialIconColor,
        '--adaire-header-nav-icon-color':    attributes.navIconColor,
        '--adaire-header-z-index':           attributes.zIndex,
        '--adaire-header-action-radius':     getActionRadius( attributes.buttonShape ),
        '--adaire-header-hamburger-border':       attributes.hamburgerBorder ? '1px solid ' + attributes.hamburgerBorderColor : 'none',
        '--adaire-header-hamburger-border-radius': `${ attributes.hamburgerBorderRadius }px`,
        '--adaire-header-search-icon-size':  `${ attributes.searchIconSize || 18 }px`,
        '--adaire-header-search-btn-size':   `${ attributes.searchButtonSize || 38 }px`,
    };

    if ( attributes.searchIconColor )   styles['--adaire-header-search-icon-color'] = attributes.searchIconColor;
    if ( attributes.searchIconBgColor ) styles['--adaire-header-search-btn-bg']     = attributes.searchIconBgColor;
    if ( attributes.searchInputBgColor )     styles['--adaire-header-search-input-bg']     = attributes.searchInputBgColor;
    if ( attributes.searchInputBorderColor ) styles['--adaire-header-search-input-border'] = attributes.searchInputBorderColor;
    if ( attributes.searchInputTextColor )   styles['--adaire-header-search-input-text']   = attributes.searchInputTextColor;
    if ( attributes.searchPlaceholderColor ) styles['--adaire-header-search-placeholder-color'] = attributes.searchPlaceholderColor;
    if ( attributes.searchContainerBgColor ) styles['--adaire-header-search-container-bg'] = attributes.searchContainerBgColor;
    if ( attributes.navShowDots ) {
        styles['--adaire-header-dot-size']    = `${ attributes.navDotSize || 6 }px`;
        styles['--adaire-header-dot-spacing'] = `${ attributes.navDotSpacing != null ? attributes.navDotSpacing : 8 }px`;
        if ( attributes.navDotColor ) styles['--adaire-header-dot-color'] = attributes.navDotColor;
    }
    if ( attributes.ctaHoverBgColor )   styles['--adaire-header-cta-hover-bg']   = attributes.ctaHoverBgColor;
    if ( attributes.ctaHoverTextColor ) styles['--adaire-header-cta-hover-text'] = attributes.ctaHoverTextColor;
    if ( attributes.ctaBorderRadius != null && attributes.ctaBorderRadius >= 0 )       styles['--adaire-header-cta-radius']     = `${ attributes.ctaBorderRadius }px`;
    if ( attributes.ctaPaddingVertical != null && attributes.ctaPaddingVertical >= 0 ) styles['--adaire-header-cta-padding-y']  = `${ attributes.ctaPaddingVertical }px`;
    if ( attributes.ctaPaddingHorizontal != null && attributes.ctaPaddingHorizontal >= 0 ) styles['--adaire-header-cta-padding-x'] = `${ attributes.ctaPaddingHorizontal }px`;
    if ( attributes.signInBgColor )     styles['--adaire-header-signin-bg']          = attributes.signInBgColor;
    if ( attributes.signInTextColor )   styles['--adaire-header-signin-text']        = attributes.signInTextColor;
    if ( attributes.signInBorderColor ) styles['--adaire-header-signin-border']      = attributes.signInBorderColor;
    if ( attributes.signInFontSize )    styles['--adaire-header-signin-font-size']   = `${ attributes.signInFontSize }px`;
    if ( attributes.signUpBgColor )     styles['--adaire-header-signup-bg']          = attributes.signUpBgColor;
    if ( attributes.signUpTextColor )   styles['--adaire-header-signup-text']        = attributes.signUpTextColor;
    if ( attributes.signUpBorderColor ) styles['--adaire-header-signup-border']      = attributes.signUpBorderColor;
    if ( attributes.signUpFontSize )    styles['--adaire-header-signup-font-size']   = `${ attributes.signUpFontSize }px`;
    if ( attributes.ctaBgColor )        styles['--adaire-header-cta-bg']             = attributes.ctaBgColor;
    if ( attributes.ctaTextColor )      styles['--adaire-header-cta-text']           = attributes.ctaTextColor;
    if ( attributes.ctaBorderColor )    styles['--adaire-header-cta-border']         = attributes.ctaBorderColor;
    if ( attributes.ctaFontSize )       styles['--adaire-header-cta-font-size']      = `${ attributes.ctaFontSize }px`;

    // Background image — only when it's the active exclusive background mode
    // and the header isn't transparent (matches render.php's frontend logic).
    if ( bgType === 'image' && attributes.bgImageUrl && ! attributes.transparentHeader ) {
        styles.backgroundImage      = `url(${ attributes.bgImageUrl })`;
        styles.backgroundSize       = attributes.bgSize       || 'cover';
        styles.backgroundPosition   = attributes.bgPosition   || 'center center';
        styles.backgroundRepeat     = attributes.bgRepeat     || 'no-repeat';
        styles.backgroundAttachment = attributes.bgAttachment || 'scroll';
    }

    const marginCss  = boxToCss( attributes.gutenblocksMargin );
    const paddingCss = boxToCss( attributes.gutenblocksPadding );
    if ( marginCss )  styles.margin  = marginCss;
    if ( paddingCss ) styles.padding = paddingCss;

    return styles;
}

// ─── Dynamic WP-menu resolution (req #2) ────────────────────────────────
// Mirrors render.php's adaire_header_resolve_menu_object() /
// adaire_header_build_menu_tree() exactly, but client-side via the `core`
// data store, so the editor canvas shows real menu items the instant a menu
// is selected/assigned instead of a static placeholder.

const NAV_MENU_LOCATION_SLUGS = { primary: 'adaire-blocks-primary', footer: 'adaire-blocks-footer' };

function decodeEntities( html ) {
    if ( ! html ) {
        return '';
    }
    const txt = document.createElement( 'textarea' );
    txt.innerHTML = html;
    return txt.value;
}

// WP's wp_get_nav_menu_items()/wp_setup_nav_menu_item() (and the REST API's
// menu-items endpoint, which runs the same resolution) falls back to a raw
// "#123 (no title)" string when a menu item has no custom label AND its
// linked object has no title. That debug-style string leaks a raw DB post
// ID and should never reach the editor preview or a site visitor — mirrors
// adaire_header_friendly_menu_label()/adaire_header_label_from_url() in
// render.php so editor and frontend agree.
function isPlaceholderMenuTitle( title ) {
    return /^#\d+\s*\(no title\)$/i.test( ( title || '' ).trim() );
}

function menuLabelFromUrl( url ) {
    const fallback = __( 'Menu item', 'header-block' );
    if ( ! url ) {
        return fallback;
    }
    const path = String( url ).replace( /^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '' ).split( /[?#]/ )[ 0 ];
    const trimmed = path.replace( /^\/+|\/+$/g, '' );
    if ( ! trimmed ) {
        return fallback;
    }
    const segments = trimmed.split( '/' );
    const slug = ( segments[ segments.length - 1 ] || '' ).replace( /[-_]+/g, ' ' ).trim();
    return slug ? slug.replace( /\b\w/g, ( c ) => c.toUpperCase() ) : fallback;
}

function friendlyMenuLabel( rawTitle, url ) {
    const title = ( rawTitle || '' ).trim();
    if ( title && ! isPlaceholderMenuTitle( title ) ) {
        return title;
    }
    return menuLabelFromUrl( url );
}

function useResolvedMenuTree( attributes ) {
    const navigationSource = attributes.navigationSource;
    const isDynamic = !! navigationSource && navigationSource !== 'legacy';

    const menus = useSelect( ( select ) => {
        if ( ! isDynamic || navigationSource === 'menu' ) {
            return null;
        }
        const coreStore = select( 'core' );
        return coreStore && coreStore.getMenus ? coreStore.getMenus({ per_page: -1, context: 'view' }) : null;
    }, [ isDynamic, navigationSource ] );

    const resolvedMenuId = useMemo( () => {
        if ( ! isDynamic ) {
            return 0;
        }
        if ( navigationSource === 'menu' ) {
            return attributes.selectedMenuId || 0;
        }
        const slug = NAV_MENU_LOCATION_SLUGS[ navigationSource ];
        if ( ! slug || ! menus ) {
            return 0;
        }
        const match = menus.find( ( m ) => Array.isArray( m.locations ) && m.locations.includes( slug ) );
        return match ? match.id : 0;
    }, [ isDynamic, navigationSource, attributes.selectedMenuId, menus ] );

    const menuItems = useSelect( ( select ) => {
        if ( ! isDynamic || ! resolvedMenuId ) {
            return null;
        }
        const coreStore = select( 'core' );
        return coreStore && coreStore.getMenuItems ? coreStore.getMenuItems({ menus: resolvedMenuId, per_page: -1, context: 'view' }) : null;
    }, [ isDynamic, resolvedMenuId ] );

    const tree = useMemo( () => {
        if ( ! menuItems || ! menuItems.length ) {
            return [];
        }
        const byParent = {};
        menuItems.forEach( ( item ) => {
            const parent = item.parent || 0;
            if ( ! byParent[ parent ] ) byParent[ parent ] = [];
            byParent[ parent ].push( item );
        } );
        Object.keys( byParent ).forEach( ( k ) => {
            byParent[ k ].sort( ( a, b ) => ( a.menu_order || 0 ) - ( b.menu_order || 0 ) );
        } );
        const build = ( parentId ) => ( byParent[ parentId ] || [] ).map( ( item ) => {
            const rawLabel = decodeEntities( ( item.title && item.title.rendered ) || '' );
            return {
                id: item.id,
                label: friendlyMenuLabel( rawLabel, item.url ),
                url: item.url,
                children: build( item.id ),
            };
        } );
        return build( 0 );
    }, [ menuItems ] );

    const isLoading = isDynamic && (
        ( navigationSource !== 'menu' && menus === null ) ||
        ( resolvedMenuId > 0 && menuItems === null )
    );

    return { isDynamic, isLoading, tree, resolvedMenuId };
}

function DynamicMenuNode({ item, depth, attributes, openSet, onToggle }) {
    const hasKids = !! ( item.children && item.children.length );
    const dotPosition = attributes.navDotPosition === 'before' ? 'before' : 'after';
    const dot = attributes.navShowDots
        ? <span className={ `adaire-header-nav-dot is-${ dotPosition }` } aria-hidden="true" />
        : null;
    const labelEl = <span>{ item.label }</span>;
    const labelInner = dotPosition === 'before' ? <>{ dot }{ labelEl }</> : <>{ labelEl }{ dot }</>;

    if ( ! hasKids ) {
        return (
            <li className="adaire-header-menu-item">
                <span className="adaire-header-nav-item">{ labelInner }</span>
            </li>
        );
    }

    const isOpen = openSet.has( item.id );

    return (
        <li className={ `adaire-header-menu-item has-children${ isOpen ? ' is-submenu-open' : '' }` }>
            <span className="adaire-header-menu-item-row">
                <span className="adaire-header-nav-item">{ labelInner }</span>
                <button
                    type="button"
                    className="adaire-header-submenu-toggle"
                    aria-expanded={ isOpen }
                    aria-haspopup="true"
                    onClick={ ( e ) => { e.preventDefault(); e.stopPropagation(); onToggle( item.id ); } }
                >
                    <svg className="adaire-header-submenu-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                    <span className="screen-reader-text">{ __( 'Toggle submenu', 'header-block' ) }</span>
                </button>
            </span>
            <ul className={ `adaire-header-submenu${ isOpen ? ' is-open' : '' }` } data-depth={ depth + 1 }>
                { item.children.map( ( child ) => (
                    <DynamicMenuNode key={ child.id } item={ child } depth={ depth + 1 } attributes={ attributes } openSet={ openSet } onToggle={ onToggle } />
                ) ) }
            </ul>
        </li>
    );
}

function DynamicMenuTree({ items, attributes }) {
    const [ openIds, setOpenIds ] = useState( () => new Set() );
    const onToggle = ( id ) => {
        setOpenIds( ( prev ) => {
            const next = new Set( prev );
            if ( next.has( id ) ) next.delete( id ); else next.add( id );
            return next;
        } );
    };

    if ( ! items || ! items.length ) {
        return null;
    }

    return (
        <ul className="adaire-header-menu-tree" data-depth="0">
            { items.map( ( item ) => (
                <DynamicMenuNode key={ item.id } item={ item } depth={ 0 } attributes={ attributes } openSet={ openIds } onToggle={ onToggle } />
            ) ) }
        </ul>
    );
}

// ─── Search preview (req #6) ────────────────────────────────────────────

function SearchPreview({ attributes }) {
    if ( ! attributes.showSearch ) {
        return null;
    }
    const layout = attributes.searchLayoutStyle || 'icon-only';

    return (
        <div className={ `adaire-header-search is-${ attributes.searchMode } layout-${ layout }` }>
            { layout !== 'expanded' && (
                <button className="adaire-header-search-button" type="button" aria-label={ __( 'Open search', 'header-block' ) }>
                    <HeaderIcon name="search" />
                </button>
            ) }
            <form className="adaire-header-search-form" role="search" onSubmit={ ( e ) => e.preventDefault() }>
                { layout === 'expanded' && (
                    <span className="adaire-header-search-form-icon"><HeaderIcon name="search" /></span>
                ) }
                <input type="search" readOnly placeholder={ attributes.searchPlaceholder } />
            </form>
        </div>
    );
}

// ─── Social icons preview (req #7) ──────────────────────────────────────

function SocialPreview({ attributes }) {
    if ( ! attributes.showSocial ) {
        return null;
    }
    const hoverEffect = attributes.socialHoverEffect || 'color';

    return (
        <div className={ `adaire-header-socials hover-${ hoverEffect }` }>
            { ( attributes.socialLinks || [] ).map( ( item, i ) => {
                const style = {};
                if ( item.bgColor )   style.background = item.bgColor;
                if ( item.iconColor ) style.color       = item.iconColor;
                return (
                    <span key={ i } style={ style }>
                        <SocialIcon platform={ item.platform } />
                    </span>
                );
            } ) }
        </div>
    );
}

// ─── Top bar "Follow Us" preview (req #8) ───────────────────────────────

function FollowUsPreview({ attributes }) {
    if ( ! attributes.topBarFollowEnabled ) {
        return null;
    }
    const icon         = attributes.topBarFollowIcon || 'none';
    const iconPosition = attributes.topBarFollowIconPosition === 'right' ? 'right' : 'left';
    const text         = attributes.topBarFollowText || '';

    const iconEl = icon !== 'none' ? <HeaderIcon name={ icon } /> : null;
    const textEl = text !== '' ? <span>{ text }</span> : null;

    if ( ! iconEl && ! textEl ) {
        return null;
    }

    const inner = iconPosition === 'right' ? <>{ textEl }{ iconEl }</> : <>{ iconEl }{ textEl }</>;

    return <span className={ `adaire-header-follow-us icon-${ iconPosition }` }>{ inner }</span>;
}

// ─── Social icons Quick-Edit zone (inline editing directly on the icons) ──
// Self-contained, like LogoZone/ActionsZone: builds its own update/move/
// remove/add helpers from setAttributes rather than depending on the main
// Edit() component's updateSocialItem, since it's rendered from inside
// HeaderPreview/ActionsZone, not Edit() itself.

function SocialZone({ attributes, setAttributes, activeZone, setActiveZone }) {
    if ( ! attributes.showSocial ) {
        return null;
    }

    const links = attributes.socialLinks || [];

    const updateLink = ( index, key, value ) => {
        const next = [ ...links ];
        next[ index ] = { ...next[ index ], [ key ]: value };
        setAttributes({ socialLinks: next });
    };

    const moveLink = ( index, delta ) => {
        const target = index + delta;
        if ( target < 0 || target >= links.length ) {
            return;
        }
        const next = [ ...links ];
        [ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
        setAttributes({ socialLinks: next });
    };

    const removeLink = ( index ) => {
        setAttributes({ socialLinks: links.filter( ( _, i ) => i !== index ) });
    };

    const addLink = () => {
        setAttributes({ socialLinks: [ ...links, { platform: 'Facebook', url: '#' } ] });
    };

    return (
        <QuickZone
            id="social"
            label="Social Icons"
            activeZone={ activeZone }
            setActiveZone={ setActiveZone }
            content={
                <>
                    <SelectControl
                        label="Hover effect"
                        value={ attributes.socialHoverEffect || 'color' }
                        options={ [
                            { label: 'Color',      value: 'color'      },
                            { label: 'Background', value: 'background' },
                            { label: 'Scale',      value: 'scale'      },
                            { label: 'None',        value: 'none'      },
                        ] }
                        onChange={ v => setAttributes({ socialHoverEffect: v }) }
                    />
                    <RangeControl label="Icon size" value={ attributes.socialIconSize } min={ 12 } max={ 40 } onChange={ v => setAttributes({ socialIconSize: v }) } />
                    <p style={{ marginBottom: 6 }}>Icon color (all icons)</p>
                    <ColorPicker color={ attributes.socialIconColor } onChange={ v => setAttributes({ socialIconColor: v }) } enableAlpha />

                    <hr />

                    { links.map( ( item, index ) => (
                        <div className="adaire-header-control-group" key={ index }>
                            <p className="adaire-header-qpop__section-label">Icon { index + 1 }</p>
                            <SelectControl
                                label="Platform"
                                value={ item.platform }
                                options={ platformOptions.map( p => ( { label: p, value: p } ) ) }
                                onChange={ v => updateLink( index, 'platform', v ) }
                            />
                            <TextControl label="Link URL" value={ item.url } onChange={ v => updateLink( index, 'url', v ) } />
                            <p style={{ marginBottom: 4 }}>Icon color</p>
                            <ColorPalette value={ item.iconColor } onChange={ v => updateLink( index, 'iconColor', v || '' ) } />
                            <p style={{ marginBottom: 4 }}>Background color</p>
                            <ColorPalette value={ item.bgColor } onChange={ v => updateLink( index, 'bgColor', v || '' ) } />
                            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <Button variant="secondary" disabled={ index === 0 } onClick={ () => moveLink( index, -1 ) }>Move up</Button>
                                <Button variant="secondary" disabled={ index === links.length - 1 } onClick={ () => moveLink( index, 1 ) }>Move down</Button>
                            </div>
                            <Button isDestructive variant="link" onClick={ () => removeLink( index ) }>Remove social link</Button>
                        </div>
                    ) ) }

                    <Button variant="secondary" onClick={ addLink }>Add social icon</Button>
                </>
            }
        >
            <SocialPreview attributes={ attributes } />
        </QuickZone>
    );
}

// ─── Logo sub-component ─────────────────────────────────────────────────

function LogoPreview({ attributes }) {
    const logoContent = attributes.logoType === 'image' && attributes.logoImageUrl ? (
        // Apply width directly so the slider is live in the editor (CSS vars may not cascade
        // immediately inside the block sandbox — inline style is always reactive).
        <img
            src={ attributes.logoImageUrl }
            alt={ attributes.logoImageAlt || attributes.logoText }
            style={{ width: `${ attributes.logoWidth || 160 }px`, maxWidth: '100%', height: 'auto' }}
        />
    ) : (
        <span className="adaire-header-logo-text">{ attributes.logoText }</span>
    );

    return (
        <div className="adaire-header-logo">
            { attributes.linkLogoHome
                ? <span className="adaire-header-logo-link">{ logoContent }</span>
                : logoContent
            }
            { attributes.showTagline && (
                <span className="adaire-header-tagline">{ attributes.tagline }</span>
            ) }
        </div>
    );
}

// ─── Header canvas preview ───────────────────────────────────────────────

function HeaderPreview({ attributes, setAttributes, activeZone, setActiveZone }) {
    const visibleNavItems = attributes.navItems || [];
    const leftItems  = visibleNavItems.slice( 0, Math.ceil( visibleNavItems.length / 2 ) );
    const rightItems = visibleNavItems.slice( Math.ceil( visibleNavItems.length / 2 ) );

    const updateNavItem = ( index, key, value ) => {
        const next = [ ...visibleNavItems ];
        next[ index ] = { ...next[ index ], [ key ]: value };
        setAttributes({ navItems: next });
    };

    const isDynamicNav = !! attributes.navigationSource && attributes.navigationSource !== 'legacy';
    const menuState = useResolvedMenuTree( attributes );
    const navTreeHalf  = Math.ceil( menuState.tree.length / 2 );
    const navTreeLeft  = menuState.tree.slice( 0, navTreeHalf );
    const navTreeRight = menuState.tree.slice( navTreeHalf );

    const renderNav = ( slice = 'all' ) => {
        if ( ! attributes.showNav || attributes.layout === 'minimal' ) {
            return null;
        }

        if ( isDynamicNav ) {
            const treeItems = slice === 'left' ? navTreeLeft : slice === 'right' ? navTreeRight : menuState.tree;
            return (
                <nav className={ `adaire-header-nav is-${ attributes.navOrientation }` }>
                    { menuState.isLoading && (
                        <span className="adaire-header-nav-item adaire-header-nav-item--dynamic-note">
                            { __( 'Loading menu…', 'header-block' ) }
                        </span>
                    ) }
                    { ! menuState.isLoading && treeItems.length === 0 && (
                        <span className="adaire-header-nav-item adaire-header-nav-item--dynamic-note">
                            { __( 'No menu assigned yet — select or assign one above.', 'header-block' ) }
                        </span>
                    ) }
                    { ! menuState.isLoading && treeItems.length > 0 && (
                        <DynamicMenuTree items={ treeItems } attributes={ attributes } />
                    ) }
                </nav>
            );
        }

        const items = slice === 'left' ? leftItems : slice === 'right' ? rightItems : visibleNavItems;

        return (
            <nav className={ `adaire-header-nav is-${ attributes.navOrientation }` }>
                { items.map( ( item, index ) => (
                    /* Each nav item is its own Quick-Edit zone */
                    <QuickZone
                        key={ index }
                        id={ `nav-${ index }` }
                        label={ `Menu item` }
                        activeZone={ activeZone }
                        setActiveZone={ setActiveZone }
                        content={
                            <>
                                <p className="adaire-header-qpop__section-label">Item { index + 1 }</p>
                                <TextControl
                                    label="Label"
                                    value={ item.label }
                                    onChange={ v => updateNavItem( index, 'label', v ) }
                                />
                                <TextControl
                                    label="URL"
                                    value={ item.url }
                                    onChange={ v => updateNavItem( index, 'url', v ) }
                                />
                                <SelectControl
                                    label="Icon"
                                    value={ item.icon || 'none' }
                                    options={ iconOptions }
                                    onChange={ v => updateNavItem( index, 'icon', v ) }
                                />
                                <Button
                                    isDestructive
                                    variant="link"
                                    onClick={ () => {
                                        setAttributes({ navItems: visibleNavItems.filter( ( _, i ) => i !== index ) });
                                        setActiveZone( null );
                                    } }
                                >
                                    Remove item
                                </Button>
                            </>
                        }
                    >
                        <span className="adaire-header-nav-item">
                            { attributes.navDotPosition === 'before' && attributes.navShowDots && (
                                <span className="adaire-header-nav-dot is-before" aria-hidden="true" />
                            ) }
                            { ( attributes.showNavIcons !== false ) && <HeaderIcon name={ item.icon } /> }
                            <RichText
                                tagName="span"
                                value={ item.label }
                                allowedFormats={ [] }
                                onChange={ value => updateNavItem( index, 'label', value ) }
                                placeholder="Menu item"
                            />
                            { attributes.navDotPosition !== 'before' && attributes.navShowDots && (
                                <span className="adaire-header-nav-dot is-after" aria-hidden="true" />
                            ) }
                        </span>
                    </QuickZone>
                ) ) }
            </nav>
        );
    };

    const rawSocialPlacement = attributes.socialPlacement || 'actions';
    const effectiveSocialPlacement = (
        ( rawSocialPlacement === 'topbar-left' || rawSocialPlacement === 'topbar-right' ) && ! attributes.showTopBar
    ) ? 'actions' : rawSocialPlacement;
    const followPosition = attributes.topBarFollowPosition === 'left' ? 'left' : 'right';
    const searchPosition = attributes.searchPosition || 'start';

    return (
        <>
            { attributes.showTopBar && (
                <div className="adaire-header-topbar">
                    <RichText tagName="span" value={ attributes.topBarLeft }  onChange={ v => setAttributes({ topBarLeft: v }) }  placeholder="Top bar left" />
                    { followPosition === 'left' && <FollowUsPreview attributes={ attributes } /> }
                    { effectiveSocialPlacement === 'topbar-left' && <SocialZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } /> }
                    <RichText tagName="span" value={ attributes.topBarRight } onChange={ v => setAttributes({ topBarRight: v }) } placeholder="Top bar right" />
                    { followPosition === 'right' && <FollowUsPreview attributes={ attributes } /> }
                    { effectiveSocialPlacement === 'topbar-right' && <SocialZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } /> }
                </div>
            ) }

            <div className={ `adaire-header-inner layout-${ attributes.layout }` }>
                { effectiveSocialPlacement === 'before-nav' && <SocialZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } /> }
                <button
                    className={ `adaire-header-mobile-toggle${ attributes.hamburgerIconStyle && attributes.hamburgerIconStyle !== 'bars' ? ` icon-style-${ attributes.hamburgerIconStyle }` : '' }` }
                    type="button"
                    aria-label="Toggle menu"
                >
                    <span/><span/><span/>
                </button>

                { attributes.layout === 'split' ? (
                    <>
                        { renderNav( 'left' ) }
                        {/* Logo Zone */}
                        <LogoZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
                        { renderNav( 'right' ) }
                    </>
                ) : (
                    <>
                        {/* Logo Zone */}
                        <LogoZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
                        { renderNav( 'all' ) }
                    </>
                ) }

                { searchPosition === 'center' && (
                    <div className="adaire-header-search-slot">
                        <SearchPreview attributes={ attributes } />
                    </div>
                ) }

                {/* Actions Zone */}
                <ActionsZone
                    attributes={ attributes }
                    setAttributes={ setAttributes }
                    activeZone={ activeZone }
                    setActiveZone={ setActiveZone }
                    socialPlacement={ effectiveSocialPlacement }
                    searchPosition={ searchPosition }
                />
            </div>

            { searchPosition === 'floating' && (
                <div className="adaire-header-search-floating">
                    <SearchPreview attributes={ attributes } />
                </div>
            ) }

            <BgZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
        </>
    );
}

// ─── Logo Quick-Edit Zone ────────────────────────────────────────────────

function LogoZone({ attributes, setAttributes, activeZone, setActiveZone }) {
    return (
        <QuickZone
            id="logo"
            label="Logo"
            activeZone={ activeZone }
            setActiveZone={ setActiveZone }
            content={
                <>
                    <SelectControl
                        label="Type"
                        value={ attributes.logoType }
                        options={ [{ label: 'Text', value: 'text' }, { label: 'Image', value: 'image' }] }
                        onChange={ logoType => setAttributes({ logoType }) }
                    />
                    { attributes.logoType === 'image' ? (
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ media => setAttributes({ logoImageUrl: media.url, logoImageAlt: media.alt || media.title || '' }) }
                                allowedTypes={ ['image'] }
                                value={ attributes.logoImageUrl }
                                render={ ({ open }) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        { attributes.logoImageUrl && (
                                            <img src={ attributes.logoImageUrl } alt="" style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain', borderRadius: 4 }} />
                                        ) }
                                        <Button variant="secondary" onClick={ open }>
                                            { attributes.logoImageUrl ? 'Replace logo' : 'Upload logo' }
                                        </Button>
                                    </div>
                                ) }
                            />
                        </MediaUploadCheck>
                    ) : (
                        <TextControl
                            label="Logo text"
                            value={ attributes.logoText }
                            onChange={ logoText => setAttributes({ logoText }) }
                        />
                    ) }
                    <RangeControl label="Width (px)" value={ attributes.logoWidth } min={ 40 } max={ 360 } onChange={ logoWidth => setAttributes({ logoWidth }) } />
                    <ToggleControl label="Show tagline" checked={ attributes.showTagline } onChange={ showTagline => setAttributes({ showTagline }) } />
                    { attributes.showTagline && (
                        <TextControl label="Tagline" value={ attributes.tagline } onChange={ tagline => setAttributes({ tagline }) } />
                    ) }
                </>
            }
        >
            <LogoPreview attributes={ attributes } />
        </QuickZone>
    );
}

// ─── Actions Quick-Edit Zone ─────────────────────────────────────────────

function ActionsZone({ attributes, setAttributes, activeZone, setActiveZone, socialPlacement, searchPosition }) {
    return (
        <QuickZone
            id="actions"
            label="Buttons"
            activeZone={ activeZone }
            setActiveZone={ setActiveZone }
            content={
                <>
                    {/* Sign In */}
                    <p className="adaire-header-qpop__section-label">Sign In</p>
                    <ToggleControl label="Show" checked={ attributes.showSignIn } onChange={ v => setAttributes({ showSignIn: v }) } />
                    { attributes.showSignIn && (
                        <>
                            <TextControl label="Text" value={ attributes.signInText } onChange={ v => setAttributes({ signInText: v }) } />
                            <TextControl label="URL"  value={ attributes.signInUrl }  onChange={ v => setAttributes({ signInUrl: v }) } />
                            <SelectControl label="Style" value={ attributes.signInStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ signInStyle: v }) } />
                        </>
                    ) }

                    <hr />

                    {/* Sign Up */}
                    <p className="adaire-header-qpop__section-label">Sign Up</p>
                    <ToggleControl label="Show" checked={ attributes.showSignUp } onChange={ v => setAttributes({ showSignUp: v }) } />
                    { attributes.showSignUp && (
                        <>
                            <TextControl label="Text" value={ attributes.signUpText } onChange={ v => setAttributes({ signUpText: v }) } />
                            <TextControl label="URL"  value={ attributes.signUpUrl }  onChange={ v => setAttributes({ signUpUrl: v }) } />
                            <SelectControl label="Style" value={ attributes.signUpStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ signUpStyle: v }) } />
                        </>
                    ) }

                    <hr />

                    {/* CTA */}
                    <p className="adaire-header-qpop__section-label">CTA Button</p>
                    <ToggleControl label="Show" checked={ attributes.showCta } onChange={ v => setAttributes({ showCta: v }) } />
                    { attributes.showCta && (
                        <>
                            <TextControl label="Text" value={ attributes.ctaText } onChange={ v => setAttributes({ ctaText: v }) } />
                            <TextControl label="URL"  value={ attributes.ctaUrl }  onChange={ v => setAttributes({ ctaUrl: v }) } />
                            <SelectControl label="Style" value={ attributes.ctaStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ ctaStyle: v }) } />
                            <SelectControl label="Button shape" value={ attributes.buttonShape } options={ buttonShapeOptions } onChange={ v => setAttributes({ buttonShape: v }) } />
                        </>
                    ) }
                </>
            }
        >
            <div className="adaire-header-actions">
                { searchPosition === 'start' && <SearchPreview attributes={ attributes } /> }
                { socialPlacement === 'actions' && <SocialZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } /> }
                { attributes.showSignIn && (
                    <span className={ `adaire-header-action adaire-header-action--signin is-${ attributes.signInStyle }` }>
                        { attributes.showSignInIcon !== false && <HeaderIcon name={ attributes.signInIcon } /> }
                        <span>{ attributes.signInText }</span>
                    </span>
                ) }
                { attributes.showSignUp && (
                    <span className={ `adaire-header-action adaire-header-action--signup is-${ attributes.signUpStyle }` }>
                        { attributes.showSignUpIcon !== false && <HeaderIcon name={ attributes.signUpIcon } /> }
                        <span>{ attributes.signUpText }</span>
                    </span>
                ) }
                { attributes.showCta && (
                    <span className={ `adaire-header-action adaire-header-action--cta is-${ attributes.ctaStyle } icon-${ attributes.ctaIconPosition === 'right' ? 'right' : 'left' }` }>
                        { attributes.ctaIconPosition === 'right'
                            ? <><span>{ attributes.ctaText }</span>{ attributes.showCtaIcon !== false && <HeaderIcon name={ attributes.ctaIcon } /> }</>
                            : <>{ attributes.showCtaIcon !== false && <HeaderIcon name={ attributes.ctaIcon } /> }<span>{ attributes.ctaText }</span></>
                        }
                    </span>
                ) }
                { searchPosition === 'end' && <SearchPreview attributes={ attributes } /> }
            </div>
        </QuickZone>
    );
}

// ─── Background Quick-Edit chip ──────────────────────────────────────────
// A floating chip at bottom-center of the header for background controls.

function BgZone({ attributes, setAttributes, activeZone, setActiveZone }) {
    const ref    = useRef( null );
    const isOpen = activeZone === 'background';

    const toggle = ( e ) => {
        e.stopPropagation();
        setActiveZone( isOpen ? null : 'background' );
    };

    // Same close management as QuickZone — suppress WP auto-close so MediaUpload works
    useEffect( () => {
        if ( ! isOpen ) return;
        const handleKeyDown = ( e ) => {
            if ( e.key === 'Escape' ) setActiveZone( null );
        };
        const handleMouseDown = ( e ) => {
            if ( ref.current && ref.current.contains( e.target ) ) return;
            if ( e.target.closest && e.target.closest( '.adaire-header-qpop, .adaire-qpop, .components-popover__content' ) ) return;
            setTimeout( () => {
                if ( isMediaLibraryOpen() ) return;
                setActiveZone( null );
            }, 0 );
        };
        document.addEventListener( 'keydown', handleKeyDown );
        document.addEventListener( 'mousedown', handleMouseDown, true );
        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
            document.removeEventListener( 'mousedown', handleMouseDown, true );
        };
    }, [ isOpen, setActiveZone ] );

    // BG SVG icon
    const BgIcon = () => (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
    );

    return (
        <>
            <button
                ref={ ref }
                type="button"
                className={ `adaire-qz-bg${ isOpen ? ' adaire-qz-bg--active' : '' }` }
                onClick={ toggle }
                title="Edit background"
            >
                <BgIcon />
                Background
            </button>

            { isOpen && ref.current && (
                <Popover
                    anchor={ ref.current }
                    placement="top"
                    className="adaire-header-qpop"
                    onFocusOutside={ () => {} }
                    focusOnMount="firstElement"
                    shift
                    flip
                >
                    <div className="adaire-header-qpop__inner">
                        <div className="adaire-header-qpop__head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="adaire-header-qpop__icon"><BgIcon /></span>
                                <span className="adaire-header-qpop__title">Background</span>
                            </div>
                            <button
                                type="button"
                                className="adaire-header-qpop__close"
                                onClick={ () => setActiveZone( null ) }
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="adaire-header-qpop__body">
                            <ToggleControl
                                label="Transparent"
                                checked={ attributes.transparentHeader }
                                onChange={ v => setAttributes({ transparentHeader: v }) }
                            />
                            { !attributes.transparentHeader && (
                                <>
                                    <SelectControl
                                        label="Background type"
                                        value={ getEffectiveBackgroundType( attributes ) }
                                        options={ [
                                            { label: 'Solid color', value: 'color'    },
                                            { label: 'Gradient',    value: 'gradient' },
                                            { label: 'Image',       value: 'image'    },
                                        ] }
                                        onChange={ v => setAttributes({ backgroundType: v }) }
                                    />

                                    { getEffectiveBackgroundType( attributes ) === 'color' && (
                                        <>
                                            <p style={{ marginBottom: 6 }}>Background color</p>
                                            <ColorPalette
                                                value={ attributes.backgroundColor }
                                                onChange={ v => setAttributes({ backgroundColor: v || '#ffffff' }) }
                                            />
                                        </>
                                    ) }

                                    { getEffectiveBackgroundType( attributes ) === 'gradient' && (
                                        <div>
                                            <p style={{ marginBottom: 6 }}>Gradient</p>
                                            <GradientPicker
                                                value={ attributes.gradientBackground }
                                                onChange={ v => setAttributes({ gradientBackground: v || 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }) }
                                                clearable={ false }
                                            />
                                        </div>
                                    ) }

                                    { getEffectiveBackgroundType( attributes ) === 'image' && (
                                        <>
                                            <MediaUploadCheck>
                                                <MediaUpload
                                                    onSelect={ media => setAttributes({ bgImageUrl: media.url }) }
                                                    allowedTypes={ ['image'] }
                                                    value={ attributes.bgImageUrl }
                                                    render={ ({ open }) => (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                                                            { attributes.bgImageUrl && (
                                                                <img
                                                                    src={ attributes.bgImageUrl }
                                                                    alt=""
                                                                    style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0' }}
                                                                />
                                                            ) }
                                                            <Button variant="secondary" onClick={ open }>
                                                                { attributes.bgImageUrl ? 'Replace image' : 'Upload background image' }
                                                            </Button>
                                                            { attributes.bgImageUrl && (
                                                                <Button
                                                                    variant="link"
                                                                    isDestructive
                                                                    onClick={ () => setAttributes({ bgImageUrl: '' }) }
                                                                >
                                                                    Remove image
                                                                </Button>
                                                            ) }
                                                        </div>
                                                    ) }
                                                />
                                            </MediaUploadCheck>

                                            { attributes.bgImageUrl && (
                                                <>
                                                    <p style={{ marginBottom: 6 }}>Position</p>
                                                    <BgPositionPicker
                                                        value={ attributes.bgPosition }
                                                        onChange={ v => setAttributes({ bgPosition: v }) }
                                                    />

                                                    <SelectControl
                                                        label="Size"
                                                        value={ attributes.bgSize }
                                                        options={ [
                                                            { label: 'Cover (fill)',         value: 'cover'      },
                                                            { label: 'Contain (fit inside)', value: 'contain'    },
                                                            { label: 'Auto',                 value: 'auto'       },
                                                            { label: '100% width',           value: '100% auto'  },
                                                            { label: '100% height',          value: 'auto 100%'  },
                                                        ] }
                                                        onChange={ v => setAttributes({ bgSize: v }) }
                                                    />
                                                    <SelectControl
                                                        label="Repeat"
                                                        value={ attributes.bgRepeat }
                                                        options={ [
                                                            { label: 'No repeat', value: 'no-repeat' },
                                                            { label: 'Repeat',    value: 'repeat'    },
                                                            { label: 'Repeat X',  value: 'repeat-x'  },
                                                            { label: 'Repeat Y',  value: 'repeat-y'  },
                                                        ] }
                                                        onChange={ v => setAttributes({ bgRepeat: v }) }
                                                    />
                                                    <SelectControl
                                                        label="Scroll behavior"
                                                        value={ attributes.bgAttachment }
                                                        options={ [
                                                            { label: 'Scroll with page', value: 'scroll' },
                                                            { label: 'Fixed (parallax)', value: 'fixed'  },
                                                        ] }
                                                        onChange={ v => setAttributes({ bgAttachment: v }) }
                                                    />
                                                </>
                                            ) }
                                        </>
                                    ) }
                                </>
                            ) }
                        </div>
                    </div>
                </Popover>
            ) }
        </>
    );
}

// ─── Main Edit component ─────────────────────────────────────────────────

export default function Edit({ attributes, setAttributes }) {
    const [ activeZone, setActiveZone ] = useState( null );

    const blockProps = useBlockProps({
        className: `adaire-header-block is-${ attributes.stickyBehavior } mobile-${ attributes.mobileMenuStyle } ${ attributes.boxShadow ? 'has-shadow' : '' }`,
        style: getHeaderStyle( attributes ),
    });

    const updateNavItem = ( index, key, value ) => {
        const next = [ ...( attributes.navItems || [] ) ];
        next[ index ] = { ...next[ index ], [ key ]: value };
        setAttributes({ navItems: next });
    };

    const updateSocialItem = ( index, key, value ) => {
        const next = [ ...( attributes.socialLinks || [] ) ];
        next[ index ] = { ...next[ index ], [ key ]: value };
        setAttributes({ socialLinks: next });
    };

    // Live list of registered WP menus for the "Select existing menu" navigation
    // source — only fetched when actually needed so sites with no menus (or the
    // default "legacy" navigation source) pay no extra REST cost.
    const wpMenus = useSelect( ( select ) => {
        if ( attributes.navigationSource !== 'menu' ) {
            return [];
        }
        const coreStore = select( 'core' );
        return coreStore && coreStore.getMenus ? coreStore.getMenus( { per_page: -1 } ) : [];
    }, [ attributes.navigationSource ] );

    // ── Inspector style panels ──────────────────────────────────────────
    const stylePanels = [
        {
            title: __( 'Background', 'header-block' ),
            priority: 'high',
            content: (
                <>
                    <ToggleControl label="Transparent header" checked={ attributes.transparentHeader } onChange={ v => setAttributes({ transparentHeader: v }) } />
                    { ! attributes.transparentHeader && (
                        <>
                            <SelectControl
                                label="Background type"
                                value={ getEffectiveBackgroundType( attributes ) }
                                options={ [
                                    { label: 'Solid color', value: 'color'    },
                                    { label: 'Gradient',    value: 'gradient' },
                                    { label: 'Image',       value: 'image'    },
                                ] }
                                onChange={ v => setAttributes({ backgroundType: v }) }
                            />

                            { getEffectiveBackgroundType( attributes ) === 'color' && (
                                <ColorPicker color={ attributes.backgroundColor } onChange={ v => setAttributes({ backgroundColor: v }) } enableAlpha />
                            ) }

                            { getEffectiveBackgroundType( attributes ) === 'gradient' && (
                                <GradientPicker
                                    value={ attributes.gradientBackground }
                                    onChange={ v => setAttributes({ gradientBackground: v || 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }) }
                                    clearable={ false }
                                />
                            ) }

                            { getEffectiveBackgroundType( attributes ) === 'image' && (
                                <>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            onSelect={ media => setAttributes({ bgImageUrl: media.url }) }
                                            allowedTypes={ ['image'] }
                                            value={ attributes.bgImageUrl }
                                            render={ ({ open }) => (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                                    { attributes.bgImageUrl && (
                                                        <img
                                                            src={ attributes.bgImageUrl }
                                                            alt=""
                                                            style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0' }}
                                                        />
                                                    ) }
                                                    <Button variant="secondary" onClick={ open }>
                                                        { attributes.bgImageUrl ? 'Replace image' : 'Upload background image' }
                                                    </Button>
                                                    { attributes.bgImageUrl && (
                                                        <Button variant="link" isDestructive onClick={ () => setAttributes({ bgImageUrl: '' }) }>
                                                            Remove image
                                                        </Button>
                                                    ) }
                                                </div>
                                            ) }
                                        />
                                    </MediaUploadCheck>

                                    { attributes.bgImageUrl && (
                                        <>
                                            <p style={{ marginBottom: 6 }}>Position</p>
                                            <BgPositionPicker value={ attributes.bgPosition } onChange={ v => setAttributes({ bgPosition: v }) } />

                                            <SelectControl
                                                label="Size"
                                                value={ attributes.bgSize }
                                                options={ [
                                                    { label: 'Cover (fill)',         value: 'cover'     },
                                                    { label: 'Contain (fit inside)', value: 'contain'   },
                                                    { label: 'Auto',                 value: 'auto'      },
                                                    { label: '100% width',           value: '100% auto' },
                                                    { label: '100% height',          value: 'auto 100%' },
                                                ] }
                                                onChange={ v => setAttributes({ bgSize: v }) }
                                            />
                                            <SelectControl
                                                label="Repeat"
                                                value={ attributes.bgRepeat }
                                                options={ [
                                                    { label: 'No repeat', value: 'no-repeat' },
                                                    { label: 'Repeat',    value: 'repeat'    },
                                                    { label: 'Repeat X',  value: 'repeat-x'  },
                                                    { label: 'Repeat Y',  value: 'repeat-y'  },
                                                ] }
                                                onChange={ v => setAttributes({ bgRepeat: v }) }
                                            />
                                            <SelectControl
                                                label="Scroll behavior"
                                                value={ attributes.bgAttachment }
                                                options={ [
                                                    { label: 'Scroll with page', value: 'scroll' },
                                                    { label: 'Fixed (parallax)', value: 'fixed'  },
                                                ] }
                                                onChange={ v => setAttributes({ bgAttachment: v }) }
                                            />
                                        </>
                                    ) }
                                </>
                            ) }
                        </>
                    ) }

                    <p>Text color</p>
                    <ColorPicker color={ attributes.textColor }  onChange={ v => setAttributes({ textColor: v }) }  enableAlpha />
                    <p>Hover color</p>
                    <ColorPicker color={ attributes.hoverColor } onChange={ v => setAttributes({ hoverColor: v }) } enableAlpha />
                </>
            ),
        },
        {
            title: __( 'Typography', 'header-block' ),
            priority: 'high',
            content: (
                <>
                    <RangeControl label="Nav font size"   value={ attributes.navFontSize }   min={ 10 } max={ 32 } onChange={ v => setAttributes({ navFontSize: v }) } />
                    <SelectControl label="Nav font weight" value={ attributes.navFontWeight } options={ [{ label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }, { label: 'Semi Bold', value: '600' }, { label: 'Bold', value: '700' }] } onChange={ v => setAttributes({ navFontWeight: v }) } />
                    <RangeControl label="Letter spacing"  value={ attributes.letterSpacing }  min={ -2 } max={ 8 } step={ 0.1 } onChange={ v => setAttributes({ letterSpacing: v }) } />
                    <SelectControl label="Text transform"  value={ attributes.textTransform }  options={ [{ label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Capitalize', value: 'capitalize' }] } onChange={ v => setAttributes({ textTransform: v }) } />
                </>
            ),
        },
        {
            title: __( 'Border & Shadow', 'header-block' ),
            priority: 'medium',
            content: (
                <>
                    <ToggleControl label="Border bottom"   checked={ attributes.borderBottom }    onChange={ v => setAttributes({ borderBottom: v }) } />
                    <RangeControl  label="Border thickness" value={ attributes.borderThickness }  min={ 0 } max={ 10 } onChange={ v => setAttributes({ borderThickness: v }) } />
                    <p style={{ marginBottom: 8 }}>Border color</p>
                    <ColorPalette value={ attributes.borderColor } onChange={ v => setAttributes({ borderColor: v || '' }) } />
                    <ToggleControl label="Box shadow" checked={ attributes.boxShadow } onChange={ v => setAttributes({ boxShadow: v }) } />
                </>
            ),
        },
        {
            title: __( 'Spacing & Width', 'header-block' ),
            priority: 'medium',
            content: (
                <>
                    <RangeControl label="Padding top"    value={ attributes.paddingTop }    min={ 0 } max={ 80 } onChange={ v => setAttributes({ paddingTop: v }) } />
                    <RangeControl label="Padding bottom" value={ attributes.paddingBottom } min={ 0 } max={ 80 } onChange={ v => setAttributes({ paddingBottom: v }) } />
                    <SelectControl label="Max width" value={ attributes.maxWidthMode } options={ [{ label: 'Contained', value: 'contained' }, { label: 'Full width', value: 'full' }] } onChange={ v => setAttributes({ maxWidthMode: v }) } />
                    { attributes.maxWidthMode === 'contained' && (
                        <RangeControl label="Contained width" value={ attributes.maxWidth } min={ 720 } max={ 1800 } onChange={ v => setAttributes({ maxWidth: v }) } />
                    ) }
                </>
            ),
        },
    ];

    return (
        <>
            <InspectorControls>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes } stylePanels={ stylePanels }>

                {/* ── Layout tab panels ──────────────────────────────────── */}
                <PanelBody title={ __( 'Layout', 'header-block' ) } initialOpen={ true }>
                    <SelectControl label="Layout"          value={ attributes.layout }         options={ layoutOptions } onChange={ v => setAttributes({ layout: v }) } />
                    <SelectControl label="Sticky behavior" value={ attributes.stickyBehavior } options={ stickyOptions } onChange={ v => setAttributes({ stickyBehavior: v }) } />
                </PanelBody>

                <PanelBody title={ __( 'Logo', 'header-block' ) } initialOpen={ false }>
                    <SelectControl label="Logo type" value={ attributes.logoType } options={ [{ label: 'Text', value: 'text' }, { label: 'Image', value: 'image' }] } onChange={ v => setAttributes({ logoType: v }) } />
                    { attributes.logoType === 'image' && (
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ media => setAttributes({ logoImageUrl: media.url, logoImageAlt: media.alt || media.title || '' }) }
                                allowedTypes={ ['image'] }
                                value={ attributes.logoImageUrl }
                                render={ ({ open }) => <Button variant="secondary" onClick={ open }>{ attributes.logoImageUrl ? 'Replace logo' : 'Upload logo' }</Button> }
                            />
                        </MediaUploadCheck>
                    ) }
                    <TextControl label="Logo text"             value={ attributes.logoText }       onChange={ v => setAttributes({ logoText: v }) } />
                    <ToggleControl label="Show tagline"        checked={ attributes.showTagline }  onChange={ v => setAttributes({ showTagline: v }) } />
                    { attributes.showTagline && <TextControl label="Tagline" value={ attributes.tagline } onChange={ v => setAttributes({ tagline: v }) } /> }
                    <RangeControl  label="Logo width"          value={ attributes.logoWidth }       min={ 40 } max={ 360 } onChange={ v => setAttributes({ logoWidth: v }) } />
                    <ToggleControl label="Link logo to homepage" checked={ attributes.linkLogoHome } onChange={ v => setAttributes({ linkLogoHome: v }) } />
                    { attributes.linkLogoHome && <TextControl label="Logo URL" value={ attributes.logoUrl } onChange={ v => setAttributes({ logoUrl: v }) } /> }
                </PanelBody>

                <PanelBody title={ __( 'Navigation', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show navigation" checked={ attributes.showNav }         onChange={ v => setAttributes({ showNav: v }) } />
                    <SelectControl label="Orientation"     value={ attributes.navOrientation }    options={ [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] } onChange={ v => setAttributes({ navOrientation: v }) } />
                    <RangeControl  label="Item spacing"    value={ attributes.navSpacing }         min={ 0 } max={ 80 } onChange={ v => setAttributes({ navSpacing: v }) } />
                    <ToggleControl
                        label="Show nav icons"
                        checked={ attributes.showNavIcons !== false }
                        onChange={ v => setAttributes({ showNavIcons: v }) }
                        help={ __( 'Icons are optional per requirement #4 — turn off to show labels only.', 'header-block' ) }
                    />

                    <hr />

                    {/* Dot indicators (req #3) — off by default, explicit opt-in */}
                    <p className="adaire-header-qpop__section-label">Dot indicators</p>
                    <ToggleControl
                        label="Show dot indicators"
                        checked={ !! attributes.navShowDots }
                        onChange={ v => setAttributes({ navShowDots: v }) }
                        help={ __( 'Disabled by default. Adds a small dot next to each menu item.', 'header-block' ) }
                    />
                    { attributes.navShowDots && (
                        <>
                            <SelectControl
                                label="Dot position"
                                value={ attributes.navDotPosition || 'after' }
                                options={ [{ label: 'Before label', value: 'before' }, { label: 'After label', value: 'after' }] }
                                onChange={ v => setAttributes({ navDotPosition: v }) }
                            />
                            <RangeControl label="Dot size"    value={ attributes.navDotSize != null ? attributes.navDotSize : 6 }    min={ 2 } max={ 20 } onChange={ v => setAttributes({ navDotSize: v }) } />
                            <RangeControl label="Dot spacing" value={ attributes.navDotSpacing != null ? attributes.navDotSpacing : 8 } min={ 0 } max={ 30 } onChange={ v => setAttributes({ navDotSpacing: v }) } />
                            <p style={{ marginBottom: 8 }}>Dot color</p>
                            <ColorPalette value={ attributes.navDotColor } onChange={ v => setAttributes({ navDotColor: v || '' }) } />
                        </>
                    ) }

                    <hr />

                    <SelectControl
                        label="Navigation source"
                        value={ attributes.navigationSource || 'legacy' }
                        options={ navigationSourceOptions }
                        onChange={ v => setAttributes({ navigationSource: v }) }
                        help={ __( 'Pull items live from a WordPress menu, or enter them manually below.', 'header-block' ) }
                    />
                    { attributes.navigationSource === 'menu' && (
                        <SelectControl
                            label="Menu"
                            value={ attributes.selectedMenuId || 0 }
                            options={ [
                                { label: __( 'Select a menu…', 'header-block' ), value: 0 },
                                ...( wpMenus || [] ).map( menu => ( { label: menu.name, value: menu.id } ) ),
                            ] }
                            onChange={ v => setAttributes({ selectedMenuId: Number( v ) }) }
                        />
                    ) }
                    { ( attributes.navigationSource === 'primary' || attributes.navigationSource === 'footer' ) && (
                        <p className="adaire-header-help-text">
                            { __( 'Assign a menu to this location under Appearance → Menus.', 'header-block' ) }
                        </p>
                    ) }

                    { ( ! attributes.navigationSource || attributes.navigationSource === 'legacy' ) && (
                        <>
                            <hr />
                            <p>Nav icon color</p>
                            <ColorPicker color={ attributes.navIconColor } onChange={ v => setAttributes({ navIconColor: v }) } enableAlpha />
                            { ( attributes.navItems || [] ).map( ( item, index ) => (
                                <div className="adaire-header-control-group" key={ index }>
                                    <TextControl   label={ `Item ${ index + 1 } label` } value={ item.label }        onChange={ v => updateNavItem( index, 'label', v ) } />
                                    <TextControl   label={ `Item ${ index + 1 } URL` }   value={ item.url }          onChange={ v => updateNavItem( index, 'url',   v ) } />
                                    <SelectControl label={ `Item ${ index + 1 } icon` }  value={ item.icon || 'none' } options={ iconOptions } onChange={ v => updateNavItem( index, 'icon', v ) } />
                                    <Button isDestructive variant="link" onClick={ () => setAttributes({ navItems: attributes.navItems.filter( ( _, i ) => i !== index ) }) }>
                                        Remove item
                                    </Button>
                                </div>
                            ) ) }
                            <Button variant="secondary" onClick={ () => setAttributes({ navItems: [ ...( attributes.navItems || [] ), { label: 'Menu item', url: '#', icon: 'none' } ] }) }>
                                Add nav item
                            </Button>
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Header Action Buttons', 'header-block' ) } initialOpen={ false }>
                    {/* Sign In */}
                    <div className="adaire-header-control-group">
                        <ToggleControl label="Show Sign In" checked={ attributes.showSignIn } onChange={ v => setAttributes({ showSignIn: v }) } />
                        <TextControl   label="Sign In text"  value={ attributes.signInText }  onChange={ v => setAttributes({ signInText: v }) } />
                        <TextControl   label="Sign In URL"   value={ attributes.signInUrl }   onChange={ v => setAttributes({ signInUrl: v }) } />
                        <ToggleControl label="Open in new tab" checked={ attributes.signInNewTab } onChange={ v => setAttributes({ signInNewTab: v }) } />
                        <SelectControl label="Style" value={ attributes.signInStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ signInStyle: v }) } />
                        <ToggleControl label="Show icon" checked={ attributes.showSignInIcon !== false } onChange={ v => setAttributes({ showSignInIcon: v }) } />
                        { attributes.showSignInIcon !== false && (
                            <SelectControl label="Icon"  value={ attributes.signInIcon }  options={ iconOptions }     onChange={ v => setAttributes({ signInIcon: v }) } />
                        ) }
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>Sign In colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.signInBgColor }     onChange={ v => setAttributes({ signInBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.signInTextColor }   onChange={ v => setAttributes({ signInTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.signInBorderColor } onChange={ v => setAttributes({ signInBorderColor: v || '' }) } />
                        <RangeControl label="Font size" value={ attributes.signInFontSize || 16 } min={ 10 } max={ 28 } onChange={ v => setAttributes({ signInFontSize: v }) } />
                    </div>
                    {/* Sign Up */}
                    <div className="adaire-header-control-group">
                        <ToggleControl label="Show Sign Up" checked={ attributes.showSignUp } onChange={ v => setAttributes({ showSignUp: v }) } />
                        <TextControl   label="Sign Up text"  value={ attributes.signUpText }  onChange={ v => setAttributes({ signUpText: v }) } />
                        <TextControl   label="Sign Up URL"   value={ attributes.signUpUrl }   onChange={ v => setAttributes({ signUpUrl: v }) } />
                        <ToggleControl label="Open in new tab" checked={ attributes.signUpNewTab } onChange={ v => setAttributes({ signUpNewTab: v }) } />
                        <SelectControl label="Style" value={ attributes.signUpStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ signUpStyle: v }) } />
                        <ToggleControl label="Show icon" checked={ attributes.showSignUpIcon !== false } onChange={ v => setAttributes({ showSignUpIcon: v }) } />
                        { attributes.showSignUpIcon !== false && (
                            <SelectControl label="Icon"  value={ attributes.signUpIcon }  options={ iconOptions }     onChange={ v => setAttributes({ signUpIcon: v }) } />
                        ) }
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>Sign Up colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.signUpBgColor }     onChange={ v => setAttributes({ signUpBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.signUpTextColor }   onChange={ v => setAttributes({ signUpTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.signUpBorderColor } onChange={ v => setAttributes({ signUpBorderColor: v || '' }) } />
                        <RangeControl label="Font size" value={ attributes.signUpFontSize || 16 } min={ 10 } max={ 28 } onChange={ v => setAttributes({ signUpFontSize: v }) } />
                    </div>
                    {/* CTA */}
                    <div className="adaire-header-control-group">
                        <ToggleControl label="Show CTA" checked={ attributes.showCta } onChange={ v => setAttributes({ showCta: v }) } />
                        <TextControl   label="Button text" value={ attributes.ctaText } onChange={ v => setAttributes({ ctaText: v }) } />
                        <TextControl   label="Button URL"  value={ attributes.ctaUrl }  onChange={ v => setAttributes({ ctaUrl: v }) } />
                        <ToggleControl label="Open in new tab" checked={ attributes.ctaNewTab } onChange={ v => setAttributes({ ctaNewTab: v }) } />
                        <SelectControl label="Button style"    value={ attributes.ctaStyle }        options={ ctaStyleOptions }    onChange={ v => setAttributes({ ctaStyle: v }) } />
                        <ToggleControl label="Show icon" checked={ attributes.showCtaIcon !== false } onChange={ v => setAttributes({ showCtaIcon: v }) } />
                        { attributes.showCtaIcon !== false && (
                            <>
                                <SelectControl label="Button icon"     value={ attributes.ctaIcon }         options={ iconOptions }        onChange={ v => setAttributes({ ctaIcon: v }) } />
                                <SelectControl label="Icon position"   value={ attributes.ctaIconPosition } options={ iconPositionOptions } onChange={ v => setAttributes({ ctaIconPosition: v }) } />
                            </>
                        ) }
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>CTA colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.ctaBgColor }     onChange={ v => setAttributes({ ctaBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.ctaTextColor }   onChange={ v => setAttributes({ ctaTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.ctaBorderColor } onChange={ v => setAttributes({ ctaBorderColor: v || '' }) } />
                        <RangeControl label="Font size" value={ attributes.ctaFontSize || 16 } min={ 10 } max={ 28 } onChange={ v => setAttributes({ ctaFontSize: v }) } />
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>CTA hover colors</p>
                        <p style={{ marginBottom: 4 }}>Hover background</p><ColorPalette value={ attributes.ctaHoverBgColor }   onChange={ v => setAttributes({ ctaHoverBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Hover text</p>       <ColorPalette value={ attributes.ctaHoverTextColor } onChange={ v => setAttributes({ ctaHoverTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>CTA shape &amp; spacing</p>
                        <RangeControl
                            label="Border radius"
                            value={ attributes.ctaBorderRadius != null && attributes.ctaBorderRadius >= 0 ? attributes.ctaBorderRadius : undefined }
                            min={ 0 } max={ 40 } allowReset resetFallbackValue={ undefined }
                            onChange={ v => setAttributes({ ctaBorderRadius: v == null ? -1 : v }) }
                            help={ __( 'Leave unset to use the button shape default.', 'header-block' ) }
                        />
                        <RangeControl
                            label="Vertical padding"
                            value={ attributes.ctaPaddingVertical != null && attributes.ctaPaddingVertical >= 0 ? attributes.ctaPaddingVertical : undefined }
                            min={ 0 } max={ 40 } allowReset resetFallbackValue={ undefined }
                            onChange={ v => setAttributes({ ctaPaddingVertical: v == null ? -1 : v }) }
                        />
                        <RangeControl
                            label="Horizontal padding"
                            value={ attributes.ctaPaddingHorizontal != null && attributes.ctaPaddingHorizontal >= 0 ? attributes.ctaPaddingHorizontal : undefined }
                            min={ 0 } max={ 60 } allowReset resetFallbackValue={ undefined }
                            onChange={ v => setAttributes({ ctaPaddingHorizontal: v == null ? -1 : v }) }
                        />
                    </div>
                    <SelectControl label="Button shape" value={ attributes.buttonShape } options={ buttonShapeOptions } onChange={ v => setAttributes({ buttonShape: v }) } help={ __( 'Applies to Sign In, Sign Up and CTA buttons', 'header-block' ) } />
                </PanelBody>

                <PanelBody title={ __( 'Mobile', 'header-block' ) } initialOpen={ false }>
                    <RangeControl  label="Mobile logo width"   value={ attributes.mobileLogoWidth } min={ 40 } max={ 260 } onChange={ v => setAttributes({ mobileLogoWidth: v }) } />
                    <SelectControl label="Mobile menu style"    value={ attributes.mobileMenuStyle }     options={ mobileStyleOptions } onChange={ v => setAttributes({ mobileMenuStyle: v }) } />
                    { attributes.mobileMenuStyle === 'slide-in' && (
                        <SelectControl
                            label="Slide direction"
                            value={ attributes.mobileSlideDirection || 'right' }
                            options={ mobileSlideDirectionOptions }
                            onChange={ v => setAttributes({ mobileSlideDirection: v }) }
                        />
                    ) }
                    <RangeControl
                        label="Mobile breakpoint (px)"
                        value={ attributes.mobileBreakpoint || 782 }
                        min={ 480 }
                        max={ 1024 }
                        onChange={ v => setAttributes({ mobileBreakpoint: v }) }
                        help={ __( 'Screen widths at or below this switch to the mobile menu.', 'header-block' ) }
                    />
                    <SelectControl
                        label="Hamburger icon style"
                        value={ attributes.hamburgerIconStyle || 'bars' }
                        options={ hamburgerIconStyleOptions }
                        onChange={ v => setAttributes({ hamburgerIconStyle: v }) }
                    />
                    <ToggleControl
                        label="Close on outside click"
                        checked={ attributes.mobileCloseOnOutsideClick !== false }
                        onChange={ v => setAttributes({ mobileCloseOnOutsideClick: v }) }
                    />
                    <ToggleControl
                        label="Close on Escape key"
                        checked={ attributes.mobileCloseOnEscape !== false }
                        onChange={ v => setAttributes({ mobileCloseOnEscape: v }) }
                    />
                    <ToggleControl label="Hamburger button border" checked={ attributes.hamburgerBorder } onChange={ v => setAttributes({ hamburgerBorder: v }) } />
                    { attributes.hamburgerBorder && (
                        <>
                            <div className="components-base-control">
                                <label className="components-base-control__label">Border color</label>
                                <ColorPalette value={ attributes.hamburgerBorderColor } onChange={ v => setAttributes({ hamburgerBorderColor: v }) } />
                            </div>
                            <RangeControl label="Border radius" value={ attributes.hamburgerBorderRadius } min={ 0 } max={ 30 } onChange={ v => setAttributes({ hamburgerBorderRadius: v }) } />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Search', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show search icon" checked={ attributes.showSearch }             onChange={ v => setAttributes({ showSearch: v }) } />
                    <SelectControl label="Search mode"      value={ attributes.searchMode }               options={ [{ label: 'Expand on click', value: 'expand' }, { label: 'Always visible', value: 'always' }] } onChange={ v => setAttributes({ searchMode: v }) } />
                    <SelectControl
                        label="Layout style"
                        value={ attributes.searchLayoutStyle || 'icon-only' }
                        options={ [
                            { label: 'Icon only',      value: 'icon-only' },
                            { label: 'Expanded',       value: 'expanded'  },
                            { label: 'Overlay',        value: 'overlay'   },
                            { label: 'Compact',        value: 'compact'   },
                        ] }
                        onChange={ v => setAttributes({ searchLayoutStyle: v }) }
                    />
                    <TextControl   label="Placeholder"      value={ attributes.searchPlaceholder }        onChange={ v => setAttributes({ searchPlaceholder: v }) } />
                    <SelectControl
                        label="Position"
                        value={ attributes.searchPosition || 'start' }
                        options={ [
                            { label: 'Before buttons', value: 'start'    },
                            { label: 'After buttons',  value: 'end'      },
                            { label: 'Center',         value: 'center'   },
                            { label: 'Floating',       value: 'floating' },
                        ] }
                        onChange={ v => setAttributes({ searchPosition: v }) }
                    />
                    <RangeControl  label="Icon size"        value={ attributes.searchIconSize || 18 }      min={ 12 } max={ 32 } onChange={ v => setAttributes({ searchIconSize: v }) } />
                    <RangeControl  label="Button size"      value={ attributes.searchButtonSize || 38 }    min={ 28 } max={ 60 } onChange={ v => setAttributes({ searchButtonSize: v }) } />
                    <p style={{ marginBottom: 8 }}>Icon color</p>
                    <ColorPalette value={ attributes.searchIconColor }   onChange={ v => setAttributes({ searchIconColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Button background</p>
                    <ColorPalette value={ attributes.searchIconBgColor } onChange={ v => setAttributes({ searchIconBgColor: v || '' }) } />
                    <p style={{ marginBottom: 4, fontWeight: 600 }}>Input field colors</p>
                    <p style={{ marginBottom: 8 }}>Input background</p>
                    <ColorPalette value={ attributes.searchInputBgColor } onChange={ v => setAttributes({ searchInputBgColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Input border</p>
                    <ColorPalette value={ attributes.searchInputBorderColor } onChange={ v => setAttributes({ searchInputBorderColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Input text</p>
                    <ColorPalette value={ attributes.searchInputTextColor } onChange={ v => setAttributes({ searchInputTextColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Placeholder text</p>
                    <ColorPalette value={ attributes.searchPlaceholderColor } onChange={ v => setAttributes({ searchPlaceholderColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Container background</p>
                    <ColorPalette value={ attributes.searchContainerBgColor } onChange={ v => setAttributes({ searchContainerBgColor: v || '' }) } />
                </PanelBody>

                <PanelBody title={ __( 'Social Icons', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show social icons" checked={ attributes.showSocial } onChange={ v => setAttributes({ showSocial: v }) } />
                    <SelectControl
                        label="Placement"
                        value={ attributes.socialPlacement || 'actions' }
                        options={ [
                            { label: 'With header buttons', value: 'actions'      },
                            { label: 'Before navigation',    value: 'before-nav'   },
                            { label: 'Top bar — left',       value: 'topbar-left'  },
                            { label: 'Top bar — right',      value: 'topbar-right' },
                        ] }
                        onChange={ v => setAttributes({ socialPlacement: v }) }
                        help={ __( 'Top bar placements need "Show top bar" enabled, otherwise they fall back to header buttons.', 'header-block' ) }
                    />
                    <SelectControl
                        label="Hover effect"
                        value={ attributes.socialHoverEffect || 'color' }
                        options={ [
                            { label: 'Color',      value: 'color'      },
                            { label: 'Background', value: 'background' },
                            { label: 'Scale',      value: 'scale'      },
                            { label: 'None',       value: 'none'       },
                        ] }
                        onChange={ v => setAttributes({ socialHoverEffect: v }) }
                    />
                    { ( attributes.socialLinks || [] ).map( ( item, index ) => (
                        <div className="adaire-header-control-group" key={ index }>
                            <SelectControl label={ `Platform ${ index + 1 }` } value={ item.platform } options={ platformOptions.map( p => ({ label: p, value: p }) ) } onChange={ v => updateSocialItem( index, 'platform', v ) } />
                            <TextControl   label="URL"                         value={ item.url }      onChange={ v => updateSocialItem( index, 'url',      v ) } />
                            <p style={{ marginBottom: 4 }}>Icon color</p>
                            <ColorPalette value={ item.iconColor } onChange={ v => updateSocialItem( index, 'iconColor', v || '' ) } />
                            <p style={{ marginBottom: 4 }}>Background color</p>
                            <ColorPalette value={ item.bgColor } onChange={ v => updateSocialItem( index, 'bgColor', v || '' ) } />
                            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <Button
                                    variant="secondary"
                                    disabled={ index === 0 }
                                    onClick={ () => {
                                        const next = [ ...attributes.socialLinks ];
                                        [ next[ index - 1 ], next[ index ] ] = [ next[ index ], next[ index - 1 ] ];
                                        setAttributes({ socialLinks: next });
                                    } }
                                >
                                    Move up
                                </Button>
                                <Button
                                    variant="secondary"
                                    disabled={ index === attributes.socialLinks.length - 1 }
                                    onClick={ () => {
                                        const next = [ ...attributes.socialLinks ];
                                        [ next[ index + 1 ], next[ index ] ] = [ next[ index ], next[ index + 1 ] ];
                                        setAttributes({ socialLinks: next });
                                    } }
                                >
                                    Move down
                                </Button>
                            </div>
                            <Button isDestructive variant="link" onClick={ () => setAttributes({ socialLinks: attributes.socialLinks.filter( ( _, i ) => i !== index ) }) }>
                                Remove social link
                            </Button>
                        </div>
                    ) ) }
                    <Button variant="secondary" onClick={ () => setAttributes({ socialLinks: [ ...( attributes.socialLinks || [] ), { platform: 'Facebook', url: '#' } ] }) }>
                        Add social icon
                    </Button>
                    <RangeControl label="Icon size"  value={ attributes.socialIconSize }  min={ 12 } max={ 40 } onChange={ v => setAttributes({ socialIconSize: v }) } />
                    <ColorPicker  color={ attributes.socialIconColor } onChange={ v => setAttributes({ socialIconColor: v }) } enableAlpha />
                </PanelBody>

                <PanelBody title={ __( 'Top Bar', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show top bar" checked={ attributes.showTopBar } onChange={ v => setAttributes({ showTopBar: v }) } />
                    <SelectControl
                        label="Layout"
                        value={ attributes.topBarLayout || 'space-between' }
                        options={ [
                            { label: 'Dispersed (left + right)', value: 'space-between' },
                            { label: 'Grouped — Left',           value: 'left'          },
                            { label: 'Grouped — Center',         value: 'center'        },
                            { label: 'Grouped — Right',          value: 'right'         },
                        ] }
                        onChange={ v => setAttributes({ topBarLayout: v }) }
                    />
                    <TextControl  label="Left content"  value={ attributes.topBarLeft }  onChange={ v => setAttributes({ topBarLeft: v }) } />
                    <TextControl  label="Right content" value={ attributes.topBarRight } onChange={ v => setAttributes({ topBarRight: v }) } />
                    <RangeControl label="Font size"     value={ attributes.topBarFontSize } min={ 10 } max={ 24 } onChange={ v => setAttributes({ topBarFontSize: v }) } />
                    <p style={{ marginBottom: 8 }}>Background color</p>
                    <ColorPicker color={ attributes.topBarBackgroundColor } onChange={ v => setAttributes({ topBarBackgroundColor: v }) } enableAlpha />
                    <p style={{ marginBottom: 8 }}>Text color</p>                    <ColorPicker color={ attributes.topBarTextColor } onChange={ v => setAttributes({ topBarTextColor: v }) } enableAlpha />

                    <hr />

                    {/* Follow Us (req #8) — flexible content block, off by default */}
                    <p className="adaire-header-qpop__section-label">Follow Us</p>
                    <ToggleControl
                        label="Enable Follow Us"
                        checked={ !! attributes.topBarFollowEnabled }
                        onChange={ v => setAttributes({ topBarFollowEnabled: v }) }
                        help={ __( 'Adds an editable text/icon block in the top bar, independent of the legacy left/right content above.', 'header-block' ) }
                    />
                    { attributes.topBarFollowEnabled && (
                        <>
                            <TextControl
                                label="Text"
                                value={ attributes.topBarFollowText }
                                onChange={ v => setAttributes({ topBarFollowText: v }) }
                                help={ __( 'Leave blank to show only the icon.', 'header-block' ) }
                            />
                            <TextControl
                                label="Link URL (optional)"
                                value={ attributes.topBarFollowUrl }
                                onChange={ v => setAttributes({ topBarFollowUrl: v }) }
                                help={ __( 'Leave blank to render as plain text instead of a link.', 'header-block' ) }
                            />
                            { attributes.topBarFollowUrl && (
                                <ToggleControl
                                    label="Open in new tab"
                                    checked={ !! attributes.topBarFollowNewTab }
                                    onChange={ v => setAttributes({ topBarFollowNewTab: v }) }
                                />
                            ) }
                            <SelectControl
                                label="Icon"
                                value={ attributes.topBarFollowIcon || 'none' }
                                options={ iconOptions }
                                onChange={ v => setAttributes({ topBarFollowIcon: v }) }
                            />
                            { attributes.topBarFollowIcon !== 'none' && (
                                <SelectControl
                                    label="Icon position"
                                    value={ attributes.topBarFollowIconPosition || 'left' }
                                    options={ [{ label: 'Left of text', value: 'left' }, { label: 'Right of text', value: 'right' }] }
                                    onChange={ v => setAttributes({ topBarFollowIconPosition: v }) }
                                />
                            ) }
                            <SelectControl
                                label="Position in top bar"
                                value={ attributes.topBarFollowPosition || 'right' }
                                options={ [{ label: 'Left side', value: 'left' }, { label: 'Right side', value: 'right' }] }
                                onChange={ v => setAttributes({ topBarFollowPosition: v }) }
                            />
                        </>
                    ) }
                </PanelBody>

            </InspectorTabs>
            </InspectorControls>

            <div {...blockProps}>
            <HeaderPreview
                attributes={ attributes }
                setAttributes={ setAttributes }
                activeZone={ activeZone }
                setActiveZone={ setActiveZone }
            />
            </div>
        </>
    );
}
