/**
 * Header block deprecations — most recent first.
 *
 * v3  Frozen copy of the static save() that shipped before the Header block
 *     became a dynamic block (block.json "render": "file:./render.php").
 *     Has the full var set (topbar-justify/gap, search size/color, all
 *     per-button override colors) and flat navItems-only navigation — no
 *     navigationSource attribute existed yet, so migrate() backfills it to
 *     'legacy' to match the new default and keep frontend output identical
 *     (frontend rendering reads block.json defaults directly and never runs
 *     this migrate(), so the block.json default is the real safety net —
 *     this is just for editor-side validation/recovery).
 * v2  Saved after first feature round (topBarFontSize, search vars, per-button
 *     type classes) but before topBarLayout justify/gap vars were added.
 * v1  Original save — no new vars, no per-button type classes.
 */
import { useBlockProps, RichText } from '@wordpress/block-editor';
import HeaderIcon from './icon-utils';

// ─── shared helpers ────────────────────────────────────────────────────────────

function getActionRadius(shape) {
    switch (shape) {
        case 'square':  return '0px';
        case 'rounded': return '10px';
        case 'pill':
        default:        return '999px';
    }
}

function Logo({ attributes }) {
    const content = attributes.logoType === 'image' && attributes.logoImageUrl ? (
        <img src={attributes.logoImageUrl} alt={attributes.logoImageAlt || attributes.logoText} />
    ) : (
        <span className="adaire-header-logo-text">{attributes.logoText}</span>
    );
    return (
        <div className="adaire-header-logo">
            {attributes.linkLogoHome
                ? <a href={attributes.logoUrl || '/'} className="adaire-header-logo-link">{content}</a>
                : content}
            {attributes.showTagline && <span className="adaire-header-tagline">{attributes.tagline}</span>}
        </div>
    );
}

function Nav({ attributes, items }) {
    if (!attributes.showNav || attributes.layout === 'minimal') return null;
    return (
        <nav className={`adaire-header-nav is-${attributes.navOrientation}`} aria-label="Header navigation">
            {(items || attributes.navItems || []).map((item, index) => (
                <a key={index} className="adaire-header-nav-item" href={item.url || '#'}>
                    <HeaderIcon name={item.icon} /><span>{item.label}</span>
                </a>
            ))}
        </nav>
    );
}

function Search({ attributes }) {
    if (!attributes.showSearch) return null;
    return (
        <div className={`adaire-header-search is-${attributes.searchMode}`}>
            <button className="adaire-header-search-button" type="button" aria-label="Open search">
                <HeaderIcon name="search" />
            </button>
            <form className="adaire-header-search-form" role="search" method="get" action="/">
                <input type="search" name="s" placeholder={attributes.searchPlaceholder} />
            </form>
        </div>
    );
}

function Socials({ attributes }) {
    if (!attributes.showSocial) return null;
    return (
        <div className="adaire-header-socials">
            {(attributes.socialLinks || []).map((item, index) => (
                <a key={index} href={item.url || '#'} aria-label={item.platform}>
                    {item.platform.charAt(0)}
                </a>
            ))}
        </div>
    );
}

// ─── v3 ────────────────────────────────────────────────────────────────────────
// Frozen copy of the pre-dynamic-block save.js. Full var set, flat
// navItems-only navigation (no WP-menu support).

function getHeaderStyleV3(attributes) {
    const background = attributes.transparentHeader
        ? 'transparent'
        : attributes.useGradient ? attributes.gradientBackground : attributes.backgroundColor;

    const topBarJustifyMap = {
        'space-between': 'space-between',
        'left':          'flex-start',
        'center':        'center',
        'right':         'flex-end',
    };
    const topBarJustify = topBarJustifyMap[attributes.topBarLayout] || 'space-between';

    const styles = {
        '--adaire-header-background': background,
        '--adaire-header-text-color': attributes.textColor,
        '--adaire-header-hover-color': attributes.hoverColor,
        '--adaire-header-border-color': attributes.borderColor,
        '--adaire-header-border-width': attributes.borderBottom ? `${attributes.borderThickness}px` : '0px',
        '--adaire-header-padding-top': `${attributes.paddingTop}px`,
        '--adaire-header-padding-bottom': `${attributes.paddingBottom}px`,
        '--adaire-header-max-width': attributes.maxWidthMode === 'contained' ? `${attributes.maxWidth}px` : '100%',
        '--adaire-header-nav-gap': `${attributes.navSpacing}px`,
        '--adaire-header-nav-font-size': `${attributes.navFontSize}px`,
        '--adaire-header-nav-font-weight': attributes.navFontWeight,
        '--adaire-header-letter-spacing': `${attributes.letterSpacing}px`,
        '--adaire-header-text-transform': attributes.textTransform,
        '--adaire-header-logo-width': `${attributes.logoWidth}px`,
        '--adaire-header-mobile-logo-width': `${attributes.mobileLogoWidth}px`,
        '--adaire-header-topbar-bg': attributes.topBarBackgroundColor,
        '--adaire-header-topbar-color': attributes.topBarTextColor,
        '--adaire-header-topbar-font-size': `${attributes.topBarFontSize || 13}px`,
        '--adaire-header-topbar-justify': topBarJustify,
        '--adaire-header-topbar-gap': attributes.topBarLayout === 'space-between' ? '24px' : '12px',
        '--adaire-header-social-size': `${attributes.socialIconSize}px`,
        '--adaire-header-social-color': attributes.socialIconColor,
        '--adaire-header-nav-icon-color': attributes.navIconColor,
        '--adaire-header-z-index': attributes.zIndex,
        '--adaire-header-action-radius': getActionRadius(attributes.buttonShape),
        '--adaire-header-hamburger-border': attributes.hamburgerBorder ? '1px solid ' + attributes.hamburgerBorderColor : 'none',
        '--adaire-header-hamburger-border-radius': `${attributes.hamburgerBorderRadius}px`,
        '--adaire-header-search-icon-size': `${attributes.searchIconSize || 18}px`,
        '--adaire-header-search-btn-size': `${attributes.searchButtonSize || 38}px`,
    };

    if (attributes.searchIconColor) styles['--adaire-header-search-icon-color'] = attributes.searchIconColor;
    if (attributes.searchIconBgColor) styles['--adaire-header-search-btn-bg'] = attributes.searchIconBgColor;
    if (attributes.signInBgColor) styles['--adaire-header-signin-bg'] = attributes.signInBgColor;
    if (attributes.signInTextColor) styles['--adaire-header-signin-text'] = attributes.signInTextColor;
    if (attributes.signInBorderColor) styles['--adaire-header-signin-border'] = attributes.signInBorderColor;
    if (attributes.signUpBgColor) styles['--adaire-header-signup-bg'] = attributes.signUpBgColor;
    if (attributes.signUpTextColor) styles['--adaire-header-signup-text'] = attributes.signUpTextColor;
    if (attributes.signUpBorderColor) styles['--adaire-header-signup-border'] = attributes.signUpBorderColor;
    if (attributes.ctaBgColor) styles['--adaire-header-cta-bg'] = attributes.ctaBgColor;
    if (attributes.ctaTextColor) styles['--adaire-header-cta-text'] = attributes.ctaTextColor;
    if (attributes.ctaBorderColor) styles['--adaire-header-cta-border'] = attributes.ctaBorderColor;

    const marginCss = boxToCssV3(attributes.gutenblocksMargin);
    const paddingCss = boxToCssV3(attributes.gutenblocksPadding);
    if (marginCss) styles.margin = marginCss;
    if (paddingCss) styles.padding = paddingCss;

    return styles;
}

function boxToCssV3(box) {
    if (!box || typeof box !== 'object') return '';
    const { top = '', right = '', bottom = '', left = '' } = box;
    if (!top && !right && !bottom && !left) return '';
    return `${top || '0'} ${right || '0'} ${bottom || '0'} ${left || '0'}`;
}

function HeaderActionV3({ show, text, url, newTab, style, icon, label, iconPosition = 'left', buttonType = '' }) {
    if (!show) return null;
    const typeClass = buttonType ? ` adaire-header-action--${buttonType}` : '';
    return (
        <a
            className={`adaire-header-action${typeClass} is-${style} icon-${iconPosition === 'right' ? 'right' : 'left'}`}
            href={url || '#'}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            aria-label={label || text}
        >
            {iconPosition === 'right'
                ? <><span>{text}</span><HeaderIcon name={icon} /></>
                : <><HeaderIcon name={icon} /><span>{text}</span></>}
        </a>
    );
}

const deprecatedV3 = {
    migrate(attributes) {
        return { ...attributes, navigationSource: attributes.navigationSource || 'legacy' };
    },

    save({ attributes }) {
        const blockProps = useBlockProps.save({
            className: `adaire-header-block is-${attributes.stickyBehavior} mobile-${attributes.mobileMenuStyle} ${attributes.boxShadow ? 'has-shadow' : ''}`,
            style: getHeaderStyleV3(attributes),
        });

        const items      = attributes.navItems || [];
        const leftItems  = items.slice(0, Math.ceil(items.length / 2));
        const rightItems = items.slice(Math.ceil(items.length / 2));

        return (
            <header {...blockProps} data-sticky-behavior={attributes.stickyBehavior} data-mobile-menu-style={attributes.mobileMenuStyle}>
                {attributes.showTopBar && (
                    <div className="adaire-header-topbar">
                        <RichText.Content tagName="span" value={attributes.topBarLeft} />
                        <RichText.Content tagName="span" value={attributes.topBarRight} />
                    </div>
                )}
                <div className={`adaire-header-inner layout-${attributes.layout}`}>
                    <button className="adaire-header-mobile-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                    {attributes.layout === 'split' ? (
                        <>
                            <Nav attributes={attributes} items={leftItems} />
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} items={rightItems} />
                        </>
                    ) : (
                        <>
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} />
                        </>
                    )}
                    <div className="adaire-header-actions">
                        {attributes.searchPosition !== 'end' && <Search attributes={attributes} />}
                        <Socials attributes={attributes} />
                        <HeaderActionV3 show={attributes.showSignIn} text={attributes.signInText} url={attributes.signInUrl} newTab={attributes.signInNewTab} style={attributes.signInStyle} icon={attributes.signInIcon} label="Sign in" buttonType="signin" />
                        <HeaderActionV3 show={attributes.showSignUp} text={attributes.signUpText} url={attributes.signUpUrl} newTab={attributes.signUpNewTab} style={attributes.signUpStyle} icon={attributes.signUpIcon} label="Sign up" buttonType="signup" />
                        <HeaderActionV3 show={attributes.showCta} text={attributes.ctaText} url={attributes.ctaUrl} newTab={attributes.ctaNewTab} style={attributes.ctaStyle} icon={attributes.ctaIcon} iconPosition={attributes.ctaIconPosition} label="Get started" buttonType="cta" />
                        {attributes.searchPosition === 'end' && <Search attributes={attributes} />}
                    </div>
                </div>
            </header>
        );
    },
};

// ─── v2 ────────────────────────────────────────────────────────────────────────
// Has: topBarFontSize, search size/color vars, per-button type classes,
//      searchPosition ordering.
// Missing: --adaire-header-topbar-justify, --adaire-header-topbar-gap.

function getHeaderStyleV2(attributes) {
    const background = attributes.transparentHeader
        ? 'transparent'
        : attributes.useGradient ? attributes.gradientBackground : attributes.backgroundColor;

    const styles = {
        '--adaire-header-background':          background,
        '--adaire-header-text-color':          attributes.textColor,
        '--adaire-header-hover-color':         attributes.hoverColor,
        '--adaire-header-border-color':        attributes.borderColor,
        '--adaire-header-border-width':        attributes.borderBottom ? `${attributes.borderThickness}px` : '0px',
        '--adaire-header-padding-top':         `${attributes.paddingTop}px`,
        '--adaire-header-padding-bottom':      `${attributes.paddingBottom}px`,
        '--adaire-header-max-width':           attributes.maxWidthMode === 'contained' ? `${attributes.maxWidth}px` : '100%',
        '--adaire-header-nav-gap':             `${attributes.navSpacing}px`,
        '--adaire-header-nav-font-size':       `${attributes.navFontSize}px`,
        '--adaire-header-nav-font-weight':     attributes.navFontWeight,
        '--adaire-header-letter-spacing':      `${attributes.letterSpacing}px`,
        '--adaire-header-text-transform':      attributes.textTransform,
        '--adaire-header-logo-width':          `${attributes.logoWidth}px`,
        '--adaire-header-mobile-logo-width':   `${attributes.mobileLogoWidth}px`,
        '--adaire-header-topbar-bg':           attributes.topBarBackgroundColor,
        '--adaire-header-topbar-color':        attributes.topBarTextColor,
        '--adaire-header-topbar-font-size':    `${attributes.topBarFontSize || 13}px`,
        // NOTE: no --adaire-header-topbar-justify / --adaire-header-topbar-gap
        '--adaire-header-social-size':         `${attributes.socialIconSize}px`,
        '--adaire-header-social-color':        attributes.socialIconColor,
        '--adaire-header-nav-icon-color':      attributes.navIconColor,
        '--adaire-header-z-index':             attributes.zIndex,
        '--adaire-header-action-radius':       getActionRadius(attributes.buttonShape),
        '--adaire-header-hamburger-border':    attributes.hamburgerBorder ? '1px solid ' + attributes.hamburgerBorderColor : 'none',
        '--adaire-header-hamburger-border-radius': `${attributes.hamburgerBorderRadius}px`,
        '--adaire-header-search-icon-size':    `${attributes.searchIconSize || 18}px`,
        '--adaire-header-search-btn-size':     `${attributes.searchButtonSize || 38}px`,
    };

    if (attributes.searchIconColor)  styles['--adaire-header-search-icon-color'] = attributes.searchIconColor;
    if (attributes.searchIconBgColor) styles['--adaire-header-search-btn-bg']    = attributes.searchIconBgColor;
    if (attributes.signInBgColor)    styles['--adaire-header-signin-bg']         = attributes.signInBgColor;
    if (attributes.signInTextColor)  styles['--adaire-header-signin-text']       = attributes.signInTextColor;
    if (attributes.signInBorderColor) styles['--adaire-header-signin-border']    = attributes.signInBorderColor;
    if (attributes.signUpBgColor)    styles['--adaire-header-signup-bg']         = attributes.signUpBgColor;
    if (attributes.signUpTextColor)  styles['--adaire-header-signup-text']       = attributes.signUpTextColor;
    if (attributes.signUpBorderColor) styles['--adaire-header-signup-border']    = attributes.signUpBorderColor;
    if (attributes.ctaBgColor)       styles['--adaire-header-cta-bg']            = attributes.ctaBgColor;
    if (attributes.ctaTextColor)     styles['--adaire-header-cta-text']          = attributes.ctaTextColor;
    if (attributes.ctaBorderColor)   styles['--adaire-header-cta-border']        = attributes.ctaBorderColor;

    return styles;
}

function HeaderActionV2({ show, text, url, newTab, style, icon, label, iconPosition = 'left', buttonType = '' }) {
    if (!show) return null;
    const typeClass = buttonType ? ` adaire-header-action--${buttonType}` : '';
    return (
        <a
            className={`adaire-header-action${typeClass} is-${style} icon-${iconPosition === 'right' ? 'right' : 'left'}`}
            href={url || '#'}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            aria-label={label || text}
        >
            {iconPosition === 'right'
                ? <><span>{text}</span><HeaderIcon name={icon} /></>
                : <><HeaderIcon name={icon} /><span>{text}</span></>}
        </a>
    );
}

const deprecatedV2 = {
    migrate(attributes) { return attributes; },

    save({ attributes }) {
        const blockProps = useBlockProps.save({
            className: `adaire-header-block is-${attributes.stickyBehavior} mobile-${attributes.mobileMenuStyle} ${attributes.boxShadow ? 'has-shadow' : ''}`,
            style: getHeaderStyleV2(attributes),
        });

        const items      = attributes.navItems || [];
        const leftItems  = items.slice(0, Math.ceil(items.length / 2));
        const rightItems = items.slice(Math.ceil(items.length / 2));

        return (
            <header {...blockProps} data-sticky-behavior={attributes.stickyBehavior} data-mobile-menu-style={attributes.mobileMenuStyle}>
                {attributes.showTopBar && (
                    <div className="adaire-header-topbar">
                        <RichText.Content tagName="span" value={attributes.topBarLeft} />
                        <RichText.Content tagName="span" value={attributes.topBarRight} />
                    </div>
                )}
                <div className={`adaire-header-inner layout-${attributes.layout}`}>
                    <button className="adaire-header-mobile-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                    {attributes.layout === 'split' ? (
                        <>
                            <Nav attributes={attributes} items={leftItems} />
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} items={rightItems} />
                        </>
                    ) : (
                        <>
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} />
                        </>
                    )}
                    <div className="adaire-header-actions">
                        {attributes.searchPosition !== 'end' && <Search attributes={attributes} />}
                        <Socials attributes={attributes} />
                        <HeaderActionV2 show={attributes.showSignIn} text={attributes.signInText} url={attributes.signInUrl} newTab={attributes.signInNewTab} style={attributes.signInStyle} icon={attributes.signInIcon} label="Sign in" buttonType="signin" />
                        <HeaderActionV2 show={attributes.showSignUp} text={attributes.signUpText} url={attributes.signUpUrl} newTab={attributes.signUpNewTab} style={attributes.signUpStyle} icon={attributes.signUpIcon} label="Sign up" buttonType="signup" />
                        <HeaderActionV2 show={attributes.showCta} text={attributes.ctaText} url={attributes.ctaUrl} newTab={attributes.ctaNewTab} style={attributes.ctaStyle} icon={attributes.ctaIcon} iconPosition={attributes.ctaIconPosition} label="Get started" buttonType="cta" />
                        {attributes.searchPosition === 'end' && <Search attributes={attributes} />}
                    </div>
                </div>
            </header>
        );
    },
};

// ─── v1 ────────────────────────────────────────────────────────────────────────
// Original save — no new CSS vars, no per-button type classes.

function getHeaderStyleV1(attributes) {
    const background = attributes.transparentHeader
        ? 'transparent'
        : attributes.useGradient ? attributes.gradientBackground : attributes.backgroundColor;

    return {
        '--adaire-header-background':          background,
        '--adaire-header-text-color':          attributes.textColor,
        '--adaire-header-hover-color':         attributes.hoverColor,
        '--adaire-header-border-color':        attributes.borderColor,
        '--adaire-header-border-width':        attributes.borderBottom ? `${attributes.borderThickness}px` : '0px',
        '--adaire-header-padding-top':         `${attributes.paddingTop}px`,
        '--adaire-header-padding-bottom':      `${attributes.paddingBottom}px`,
        '--adaire-header-max-width':           attributes.maxWidthMode === 'contained' ? `${attributes.maxWidth}px` : '100%',
        '--adaire-header-nav-gap':             `${attributes.navSpacing}px`,
        '--adaire-header-nav-font-size':       `${attributes.navFontSize}px`,
        '--adaire-header-nav-font-weight':     attributes.navFontWeight,
        '--adaire-header-letter-spacing':      `${attributes.letterSpacing}px`,
        '--adaire-header-text-transform':      attributes.textTransform,
        '--adaire-header-logo-width':          `${attributes.logoWidth}px`,
        '--adaire-header-mobile-logo-width':   `${attributes.mobileLogoWidth}px`,
        '--adaire-header-topbar-bg':           attributes.topBarBackgroundColor,
        '--adaire-header-topbar-color':        attributes.topBarTextColor,
        '--adaire-header-social-size':         `${attributes.socialIconSize}px`,
        '--adaire-header-social-color':        attributes.socialIconColor,
        '--adaire-header-nav-icon-color':      attributes.navIconColor,
        '--adaire-header-z-index':             attributes.zIndex,
        '--adaire-header-action-radius':       getActionRadius(attributes.buttonShape),
        '--adaire-header-hamburger-border':    attributes.hamburgerBorder ? '1px solid ' + attributes.hamburgerBorderColor : 'none',
        '--adaire-header-hamburger-border-radius': `${attributes.hamburgerBorderRadius}px`,
    };
}

function HeaderActionV1({ show, text, url, newTab, style, icon, label, iconPosition = 'left' }) {
    if (!show) return null;
    return (
        <a
            className={`adaire-header-action is-${style} icon-${iconPosition === 'right' ? 'right' : 'left'}`}
            href={url || '#'}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            aria-label={label || text}
        >
            {iconPosition === 'right'
                ? <><span>{text}</span><HeaderIcon name={icon} /></>
                : <><HeaderIcon name={icon} /><span>{text}</span></>}
        </a>
    );
}

const deprecatedV1 = {
    migrate(attributes) { return attributes; },

    save({ attributes }) {
        const blockProps = useBlockProps.save({
            className: `adaire-header-block is-${attributes.stickyBehavior} mobile-${attributes.mobileMenuStyle} ${attributes.boxShadow ? 'has-shadow' : ''}`,
            style: getHeaderStyleV1(attributes),
        });

        const items      = attributes.navItems || [];
        const leftItems  = items.slice(0, Math.ceil(items.length / 2));
        const rightItems = items.slice(Math.ceil(items.length / 2));

        return (
            <header {...blockProps} data-sticky-behavior={attributes.stickyBehavior} data-mobile-menu-style={attributes.mobileMenuStyle}>
                {attributes.showTopBar && (
                    <div className="adaire-header-topbar">
                        <RichText.Content tagName="span" value={attributes.topBarLeft} />
                        <RichText.Content tagName="span" value={attributes.topBarRight} />
                    </div>
                )}
                <div className={`adaire-header-inner layout-${attributes.layout}`}>
                    <button className="adaire-header-mobile-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                    {attributes.layout === 'split' ? (
                        <>
                            <Nav attributes={attributes} items={leftItems} />
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} items={rightItems} />
                        </>
                    ) : (
                        <>
                            <Logo attributes={attributes} />
                            <Nav attributes={attributes} />
                        </>
                    )}
                    <div className="adaire-header-actions">
                        <Search attributes={attributes} />
                        <Socials attributes={attributes} />
                        <HeaderActionV1 show={attributes.showSignIn} text={attributes.signInText} url={attributes.signInUrl} newTab={attributes.signInNewTab} style={attributes.signInStyle} icon={attributes.signInIcon} label="Sign in" />
                        <HeaderActionV1 show={attributes.showSignUp} text={attributes.signUpText} url={attributes.signUpUrl} newTab={attributes.signUpNewTab} style={attributes.signUpStyle} icon={attributes.signUpIcon} label="Sign up" />
                        <HeaderActionV1 show={attributes.showCta} text={attributes.ctaText} url={attributes.ctaUrl} newTab={attributes.ctaNewTab} style={attributes.ctaStyle} icon={attributes.ctaIcon} iconPosition={attributes.ctaIconPosition} label="Get started" />
                    </div>
                </div>
            </header>
        );
    },
};

// Most recent first
export default [ deprecatedV3, deprecatedV2, deprecatedV1 ];
