import { useState, useRef, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useBlockProps, MediaUpload, MediaUploadCheck, RichText } from '@wordpress/block-editor';
import {
    Button, ColorPicker, PanelBody, Popover,
    RangeControl, SelectControl, TextControl,
    ToggleControl, ColorPalette,
} from '@wordpress/components';
import QuickZone, { PenIcon, CloseIcon, isMediaLibraryOpen } from '../components/QuickZone';
import { __ } from '@wordpress/i18n';
import HeaderIcon, { iconOptions } from './icon-utils';
import InspectorTabs from '../components/InspectorTabs';
import { boxToCss } from '../components/spacing-utils';

// â”€â”€â”€ Option maps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Background position grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Style helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getActionRadius( shape ) {
    switch ( shape ) {
        case 'square':  return '0px';
        case 'rounded': return '10px';
        case 'pill':
        default:        return '999px';
    }
}

function getHeaderStyle( attributes ) {
    const background = attributes.transparentHeader
        ? 'transparent'
        : attributes.useGradient
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
    if ( attributes.signInBgColor )     styles['--adaire-header-signin-bg']          = attributes.signInBgColor;
    if ( attributes.signInTextColor )   styles['--adaire-header-signin-text']        = attributes.signInTextColor;
    if ( attributes.signInBorderColor ) styles['--adaire-header-signin-border']      = attributes.signInBorderColor;
    if ( attributes.signUpBgColor )     styles['--adaire-header-signup-bg']          = attributes.signUpBgColor;
    if ( attributes.signUpTextColor )   styles['--adaire-header-signup-text']        = attributes.signUpTextColor;
    if ( attributes.signUpBorderColor ) styles['--adaire-header-signup-border']      = attributes.signUpBorderColor;
    if ( attributes.ctaBgColor )        styles['--adaire-header-cta-bg']             = attributes.ctaBgColor;
    if ( attributes.ctaTextColor )      styles['--adaire-header-cta-text']           = attributes.ctaTextColor;
    if ( attributes.ctaBorderColor )    styles['--adaire-header-cta-border']         = attributes.ctaBorderColor;

    // Background image
    if ( attributes.bgImageUrl ) {
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

// â”€â”€â”€ Logo sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LogoPreview({ attributes }) {
    const logoContent = attributes.logoType === 'image' && attributes.logoImageUrl ? (
        // Apply width directly so the slider is live in the editor (CSS vars may not cascade
        // immediately inside the block sandbox â€” inline style is always reactive).
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

// â”€â”€â”€ Header canvas preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    const renderNav = ( items = visibleNavItems ) => {
        if ( ! attributes.showNav || attributes.layout === 'minimal' ) {
            return null;
        }

        if ( isDynamicNav ) {
            // Live WP-menu data is resolved server-side by render.php — the
            // editor canvas can't (and shouldn't try to) replicate that nested
            // tree here, so show an informational placeholder instead.
            return (
                <nav className={ `adaire-header-nav is-${ attributes.navOrientation }` }>
                    <span className="adaire-header-nav-item adaire-header-nav-item--dynamic-note">
                        { __( 'Live WordPress menu — preview on the published page', 'header-block' ) }
                    </span>
                </nav>
            );
        }

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
                            <HeaderIcon name={ item.icon } />
                            <RichText
                                tagName="span"
                                value={ item.label }
                                allowedFormats={ [] }
                                onChange={ value => updateNavItem( index, 'label', value ) }
                                placeholder="Menu item"
                            />
                        </span>
                    </QuickZone>
                ) ) }
            </nav>
        );
    };

    return (
        <>
            { attributes.showTopBar && (
                <div className="adaire-header-topbar">
                    <RichText tagName="span" value={ attributes.topBarLeft }  onChange={ v => setAttributes({ topBarLeft: v }) }  placeholder="Top bar left" />
                    <RichText tagName="span" value={ attributes.topBarRight } onChange={ v => setAttributes({ topBarRight: v }) } placeholder="Top bar right" />
                </div>
            ) }

            <div className={ `adaire-header-inner layout-${ attributes.layout }` }>
                <button
                    className={ `adaire-header-mobile-toggle${ attributes.hamburgerIconStyle && attributes.hamburgerIconStyle !== 'bars' ? ` icon-style-${ attributes.hamburgerIconStyle }` : '' }` }
                    type="button"
                    aria-label="Toggle menu"
                >
                    <span/><span/><span/>
                </button>

                { attributes.layout === 'split' ? (
                    <>
                        { renderNav( leftItems ) }
                        {/* Logo Zone */}
                        <LogoZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
                        { renderNav( rightItems ) }
                    </>
                ) : (
                    <>
                        {/* Logo Zone */}
                        <LogoZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
                        { renderNav() }
                    </>
                ) }

                {/* Actions Zone */}
                <ActionsZone attributes={ attributes } setAttributes={ setAttributes } activeZone={ activeZone } setActiveZone={ setActiveZone } />
            </div>
        </>
    );
}

// â”€â”€â”€ Logo Quick-Edit Zone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Actions Quick-Edit Zone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ActionsZone({ attributes, setAttributes, activeZone, setActiveZone }) {
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
                { attributes.showSearch && attributes.searchPosition !== 'end' && (
                    <button className="adaire-header-search-button" type="button">
                        <HeaderIcon name="search" />
                    </button>
                ) }
                { attributes.showSocial && (
                    <div className="adaire-header-socials">
                        { ( attributes.socialLinks || [] ).map( ( item, i ) => (
                            <span key={ i }>{ item.platform.charAt( 0 ) }</span>
                        ) ) }
                    </div>
                ) }
                { attributes.showSignIn && (
                    <span className={ `adaire-header-action adaire-header-action--signin is-${ attributes.signInStyle }` }>
                        <HeaderIcon name={ attributes.signInIcon } />
                        <span>{ attributes.signInText }</span>
                    </span>
                ) }
                { attributes.showSignUp && (
                    <span className={ `adaire-header-action adaire-header-action--signup is-${ attributes.signUpStyle }` }>
                        <HeaderIcon name={ attributes.signUpIcon } />
                        <span>{ attributes.signUpText }</span>
                    </span>
                ) }
                { attributes.showCta && (
                    <span className={ `adaire-header-action adaire-header-action--cta is-${ attributes.ctaStyle } icon-${ attributes.ctaIconPosition === 'right' ? 'right' : 'left' }` }>
                        { attributes.ctaIconPosition === 'right'
                            ? <><span>{ attributes.ctaText }</span><HeaderIcon name={ attributes.ctaIcon } /></>
                            : <><HeaderIcon name={ attributes.ctaIcon } /><span>{ attributes.ctaText }</span></>
                        }
                    </span>
                ) }
                { attributes.showSearch && attributes.searchPosition === 'end' && (
                    <button className="adaire-header-search-button" type="button">
                        <HeaderIcon name="search" />
                    </button>
                ) }
            </div>
        </QuickZone>
    );
}

// â”€â”€â”€ Background Quick-Edit chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// A floating chip at bottom-center of the header for background controls.

function BgZone({ attributes, setAttributes, activeZone, setActiveZone }) {
    const ref    = useRef( null );
    const isOpen = activeZone === 'background';

    const toggle = ( e ) => {
        e.stopPropagation();
        setActiveZone( isOpen ? null : 'background' );
    };

    // Same close management as QuickZone â€” suppress WP auto-close so MediaUpload works
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
                            {/* Color section */}
                            <p className="adaire-header-qpop__section-label">Color</p>
                            <ToggleControl
                                label="Transparent"
                                checked={ attributes.transparentHeader }
                                onChange={ v => setAttributes({ transparentHeader: v }) }
                            />
                            { !attributes.transparentHeader && (
                                <>
                                    <ToggleControl
                                        label="Use gradient"
                                        checked={ attributes.useGradient }
                                        onChange={ v => setAttributes({ useGradient: v }) }
                                    />
                                    { attributes.useGradient ? (
                                        <TextControl
                                            label="Gradient CSS"
                                            value={ attributes.gradientBackground }
                                            onChange={ v => setAttributes({ gradientBackground: v }) }
                                        />
                                    ) : (
                                        <>
                                            <p style={{ marginBottom: 6 }}>Background color</p>
                                            <ColorPalette
                                                value={ attributes.backgroundColor }
                                                onChange={ v => setAttributes({ backgroundColor: v || '#ffffff' }) }
                                            />
                                        </>
                                    ) }
                                </>
                            ) }

                            <hr />

                            {/* Image section */}
                            <p className="adaire-header-qpop__section-label">Image</p>
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
                                    {/* Position grid */}
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
                        </div>
                    </div>
                </Popover>
            ) }
        </>
    );
}

// â”€â”€â”€ Main Edit component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // â”€â”€ Inspector style panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const stylePanels = [
        {
            title: __( 'Colors', 'header-block' ),
            priority: 'high',
            content: (
                <>
                    <ToggleControl label="Transparent header"    checked={ attributes.transparentHeader } onChange={ v => setAttributes({ transparentHeader: v }) } />
                    <ToggleControl label="Use gradient background" checked={ attributes.useGradient }      onChange={ v => setAttributes({ useGradient: v }) } />
                    { attributes.useGradient
                        ? <TextControl label="Gradient CSS" value={ attributes.gradientBackground } onChange={ v => setAttributes({ gradientBackground: v }) } />
                        : <ColorPicker color={ attributes.backgroundColor } onChange={ v => setAttributes({ backgroundColor: v }) } enableAlpha />
                    }
                    <p>Text color</p>
                    <ColorPicker color={ attributes.textColor }  onChange={ v => setAttributes({ textColor: v }) }  enableAlpha />
                    <p>Hover color</p>
                    <ColorPicker color={ attributes.hoverColor } onChange={ v => setAttributes({ hoverColor: v }) } enableAlpha />
                </>
            ),
        },
        {
            title: __( 'Background Image', 'header-block' ),
            priority: 'high',
            content: (
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
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes } stylePanels={ stylePanels }>

                {/* â”€â”€ Layout tab panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    <RangeControl  label="Mobile logo width"   value={ attributes.mobileLogoWidth } min={ 40 } max={ 260 } onChange={ v => setAttributes({ mobileLogoWidth: v }) } />
                    <ToggleControl label="Link logo to homepage" checked={ attributes.linkLogoHome } onChange={ v => setAttributes({ linkLogoHome: v }) } />
                    { attributes.linkLogoHome && <TextControl label="Logo URL" value={ attributes.logoUrl } onChange={ v => setAttributes({ logoUrl: v }) } /> }
                </PanelBody>

                <PanelBody title={ __( 'Navigation', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show navigation" checked={ attributes.showNav }         onChange={ v => setAttributes({ showNav: v }) } />
                    <SelectControl label="Orientation"     value={ attributes.navOrientation }    options={ [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] } onChange={ v => setAttributes({ navOrientation: v }) } />
                    <RangeControl  label="Item spacing"    value={ attributes.navSpacing }         min={ 0 } max={ 80 } onChange={ v => setAttributes({ navSpacing: v }) } />

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
                        <SelectControl label="Icon"  value={ attributes.signInIcon }  options={ iconOptions }     onChange={ v => setAttributes({ signInIcon: v }) } />
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>Sign In colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.signInBgColor }     onChange={ v => setAttributes({ signInBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.signInTextColor }   onChange={ v => setAttributes({ signInTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.signInBorderColor } onChange={ v => setAttributes({ signInBorderColor: v || '' }) } />
                    </div>
                    {/* Sign Up */}
                    <div className="adaire-header-control-group">
                        <ToggleControl label="Show Sign Up" checked={ attributes.showSignUp } onChange={ v => setAttributes({ showSignUp: v }) } />
                        <TextControl   label="Sign Up text"  value={ attributes.signUpText }  onChange={ v => setAttributes({ signUpText: v }) } />
                        <TextControl   label="Sign Up URL"   value={ attributes.signUpUrl }   onChange={ v => setAttributes({ signUpUrl: v }) } />
                        <ToggleControl label="Open in new tab" checked={ attributes.signUpNewTab } onChange={ v => setAttributes({ signUpNewTab: v }) } />
                        <SelectControl label="Style" value={ attributes.signUpStyle } options={ ctaStyleOptions } onChange={ v => setAttributes({ signUpStyle: v }) } />
                        <SelectControl label="Icon"  value={ attributes.signUpIcon }  options={ iconOptions }     onChange={ v => setAttributes({ signUpIcon: v }) } />
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>Sign Up colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.signUpBgColor }     onChange={ v => setAttributes({ signUpBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.signUpTextColor }   onChange={ v => setAttributes({ signUpTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.signUpBorderColor } onChange={ v => setAttributes({ signUpBorderColor: v || '' }) } />
                    </div>
                    {/* CTA */}
                    <div className="adaire-header-control-group">
                        <ToggleControl label="Show CTA" checked={ attributes.showCta } onChange={ v => setAttributes({ showCta: v }) } />
                        <TextControl   label="Button text" value={ attributes.ctaText } onChange={ v => setAttributes({ ctaText: v }) } />
                        <TextControl   label="Button URL"  value={ attributes.ctaUrl }  onChange={ v => setAttributes({ ctaUrl: v }) } />
                        <ToggleControl label="Open in new tab" checked={ attributes.ctaNewTab } onChange={ v => setAttributes({ ctaNewTab: v }) } />
                        <SelectControl label="Button style"    value={ attributes.ctaStyle }        options={ ctaStyleOptions }    onChange={ v => setAttributes({ ctaStyle: v }) } />
                        <SelectControl label="Button icon"     value={ attributes.ctaIcon }         options={ iconOptions }        onChange={ v => setAttributes({ ctaIcon: v }) } />
                        <SelectControl label="Icon position"   value={ attributes.ctaIconPosition } options={ iconPositionOptions } onChange={ v => setAttributes({ ctaIconPosition: v }) } />
                        <p style={{ marginBottom: 4, fontWeight: 600 }}>CTA colors</p>
                        <p style={{ marginBottom: 4 }}>Background</p><ColorPalette value={ attributes.ctaBgColor }     onChange={ v => setAttributes({ ctaBgColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Text</p>      <ColorPalette value={ attributes.ctaTextColor }   onChange={ v => setAttributes({ ctaTextColor: v || '' }) } />
                        <p style={{ marginBottom: 4 }}>Border</p>    <ColorPalette value={ attributes.ctaBorderColor } onChange={ v => setAttributes({ ctaBorderColor: v || '' }) } />
                    </div>
                    <SelectControl label="Button shape" value={ attributes.buttonShape } options={ buttonShapeOptions } onChange={ v => setAttributes({ buttonShape: v }) } help={ __( 'Applies to Sign In, Sign Up and CTA buttons', 'header-block' ) } />
                </PanelBody>

                <PanelBody title={ __( 'Mobile', 'header-block' ) } initialOpen={ false }>
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
                    <TextControl   label="Placeholder"      value={ attributes.searchPlaceholder }        onChange={ v => setAttributes({ searchPlaceholder: v }) } />
                    <SelectControl label="Position"         value={ attributes.searchPosition || 'start' } options={ [{ label: 'Before buttons', value: 'start' }, { label: 'After buttons', value: 'end' }] } onChange={ v => setAttributes({ searchPosition: v }) } />
                    <RangeControl  label="Icon size"        value={ attributes.searchIconSize || 18 }      min={ 12 } max={ 32 } onChange={ v => setAttributes({ searchIconSize: v }) } />
                    <RangeControl  label="Button size"      value={ attributes.searchButtonSize || 38 }    min={ 28 } max={ 60 } onChange={ v => setAttributes({ searchButtonSize: v }) } />
                    <p style={{ marginBottom: 8 }}>Icon color</p>
                    <ColorPalette value={ attributes.searchIconColor }   onChange={ v => setAttributes({ searchIconColor: v || '' }) } />
                    <p style={{ marginBottom: 8 }}>Button background</p>
                    <ColorPalette value={ attributes.searchIconBgColor } onChange={ v => setAttributes({ searchIconBgColor: v || '' }) } />
                </PanelBody>

                <PanelBody title={ __( 'Social Icons', 'header-block' ) } initialOpen={ false }>
                    <ToggleControl label="Show social icons" checked={ attributes.showSocial } onChange={ v => setAttributes({ showSocial: v }) } />
                    { ( attributes.socialLinks || [] ).map( ( item, index ) => (
                        <div className="adaire-header-control-group" key={ index }>
                            <SelectControl label={ `Platform ${ index + 1 }` } value={ item.platform } options={ platformOptions.map( p => ({ label: p, value: p }) ) } onChange={ v => updateSocialItem( index, 'platform', v ) } />
                            <TextControl   label="URL"                         value={ item.url }      onChange={ v => updateSocialItem( index, 'url',      v ) } />
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
                            { label: 'Grouped â€” Left',           value: 'left'          },
                            { label: 'Grouped â€” Center',         value: 'center'        },
                            { label: 'Grouped â€” Right',          value: 'right'         },
                        ] }
                        onChange={ v => setAttributes({ topBarLayout: v }) }
                    />
                    <TextControl  label="Left content"  value={ attributes.topBarLeft }  onChange={ v => setAttributes({ topBarLeft: v }) } />
                    <TextControl  label="Right content" value={ attributes.topBarRight } onChange={ v => setAttributes({ topBarRight: v }) } />
                    <RangeControl label="Font size"     value={ attributes.topBarFontSize } min={ 10 } max={ 24 } onChange={ v => setAttributes({ topBarFontSize: v }) } />
                    <p style={{ marginBottom: 8 }}>Background color</p>
                    <ColorPicker color={ attributes.topBarBackgroundColor } onChange={ v => setAttributes({ topBarBackgroundColor: v }) } enableAlpha />
                    <p style={{ marginBottom: 8 }}>Text color</p>                    <ColorPicker color={ attributes.topBarTextColor } onChange={ v => setAttributes({ topBarTextColor: v }) } enableAlpha />
                </PanelBody>

            </InspectorTabs>

            <HeaderPreview
                attributes={ attributes }
                setAttributes={ setAttributes }
                activeZone={ activeZone }
                setActiveZone={ setActiveZone }
            />
        </>
    );
}