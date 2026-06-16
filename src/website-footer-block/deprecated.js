/**
 * Website Footer block deprecations — most recent first.
 *
 * v1  Frozen copy of the static save() that shipped before the Footer block
 *     became a dynamic block (block.json "render": "file:./render.php").
 *     No block.json attribute schema changed as part of that conversion —
 *     columnsSection/topBar/bottomBar were already unschema'd bare objects
 *     before this refactor and still are — so migrate() is a no-op identity
 *     function and this entry doesn't need its own `attributes` key
 *     (Gutenberg falls back to the current block.json attributes when
 *     parsing a deprecated entry that omits one). This save() must stay
 *     byte-identical to what shipped previously so already-published pages
 *     keep validating against it.
 */
import { useBlockProps, RichText } from '@wordpress/block-editor';

// ─── shared helpers ────────────────────────────────────────────────────────────

function getFontSizeClassV1(size) {
    const sizes = { small: 'small', medium: 'medium', large: 'large' };
    return sizes[size] || 'medium';
}

function getIconSvgV1(icon) {
    const icons = {
        twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
        facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
    };
    return icons[icon] || icons.twitter;
}

// ─── v1 ────────────────────────────────────────────────────────────────────────
// Frozen copy of the pre-dynamic-block save.js, verbatim.

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
        const {
            backgroundColor,
            backgroundImage,
            backgroundGradient,
            backgroundType,
            textColor,
            accentColor,
            paddingTop,
            paddingBottom,
            marginTop,
            marginBottom,
            maxWidth,
            showTopBar,
            showColumnsSection,
            showBottomBar,
            topBar,
            columnsSection,
            bottomBar
        } = attributes;

        const typography = {
            fontFamily: 'inherit',
            baseFontSize: 14,
            headingFontSize: 16,
            headingFontWeight: '600',
            navFontWeight: '400',
            linkFontWeight: '400',
            ctaFontWeight: '500',
            ...attributes.typography
        };

        const blockProps = useBlockProps.save({
            className: 'website-footer-block',
            style: {
                backgroundColor: backgroundType === 'solid' ? (backgroundColor || '#1a1a1a') : backgroundType === 'gradient' ? backgroundGradient : 'transparent',
                backgroundImage: backgroundType === 'image' ? `url(${backgroundImage})` : 'none',
                backgroundSize: backgroundType === 'image' ? 'cover' : 'auto',
                backgroundPosition: backgroundType === 'image' ? 'center' : 'auto',
                backgroundRepeat: backgroundType === 'image' ? 'no-repeat' : 'repeat',
                color: textColor || '#ffffff',
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                marginTop: `${marginTop}px`,
                marginBottom: `${marginBottom}px`,
                '--footer-accent-color': accentColor || '#D52940',
                '--footer-max-width': `${maxWidth}px`,
                '--footer-font-family': typography.fontFamily,
                '--footer-base-font-size': `${typography.baseFontSize}px`,
                '--footer-heading-font-size': `${typography.headingFontSize}px`,
                '--footer-heading-font-weight': typography.headingFontWeight,
                '--footer-nav-font-weight': typography.navFontWeight,
                '--footer-link-font-weight': typography.linkFontWeight,
                '--footer-cta-font-weight': typography.ctaFontWeight
            }
        });

        const getFontSizeClass = getFontSizeClassV1;
        const getIconSvg = getIconSvgV1;

        return (
            <footer {...blockProps}>
                <div className="website-footer-block__container">
                    {/* Top Bar */}
                    {showTopBar && (
                        <div
                            className={`website-footer-block__top-bar website-footer-block__top-bar--${getFontSizeClass(topBar.fontSize)}`}
                            style={{
                                textAlign: topBar.alignment === 'space-between' ? 'left' : topBar.alignment,
                                backgroundColor: topBar.backgroundColor || 'transparent',
                                padding: `${topBar.paddingVertical}px 0`,
                                borderBottom: topBar.showDivider ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >
                            <div className="website-footer-block__top-bar-content">
                                <div className="website-footer-block__top-bar-copyright">
                                    {topBar.showCopyright && (
                                        <RichText.Content
                                            value={topBar.copyrightText}
                                            tagName="p"
                                        />
                                    )}
                                    {topBar.showContactLink && (
                                        <>
                                            <span className="website-footer-block__separator"> | </span>
                                            <RichText.Content
                                                value={topBar.contactLinkText}
                                                tagName="a"
                                                href={topBar.contactLinkUrl}
                                            />
                                        </>
                                    )}
                                </div>
                                {topBar.showSocialMedia && (
                                    <div className="website-footer-block__top-bar-social">
                                        {topBar.socialLinks.map((link) => (
                                            <div key={link.id} className="website-footer-block__social-link-wrapper">
                                                {link.displayStyle === 'icon' ? (
                                                    <a
                                                        href={link.url}
                                                        className="website-footer-block__social-icon"
                                                        aria-label={link.label}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        dangerouslySetInnerHTML={{ __html: getIconSvg(link.platform) }}
                                                    />
                                                ) : (
                                                    <RichText.Content
                                                        value={link.label}
                                                        tagName="a"
                                                        href={link.url}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Columns Section */}
                    {showColumnsSection && (
                        <div className="website-footer-block__columns-section">
                            <div
                                className="website-footer-block__columns-grid"
                                style={{
                                    gap: `${columnsSection.columnGap}px`,
                                    alignItems: { top: 'flex-start', center: 'center', bottom: 'flex-end' }[columnsSection.verticalAlignment] || 'flex-start',
                                }}
                            >
                                {columnsSection.columns.map((column) => (
                                    <div
                                        key={column.id}
                                        className={`website-footer-block__column website-footer-block__column--${column.type}`}
                                        style={{
                                            textAlign: column.textAlign,
                                            flexBasis: column.width !== 'auto' ? column.width : 'auto',
                                            '--mobile-priority': column.mobilePriority || 999,
                                            color: column.textColor || undefined
                                        }}
                                    >
                                        {column.showHeading && (
                                            <RichText.Content
                                                tagName={column.headingTag}
                                                className="website-footer-block__column-heading"
                                                value={column.headingText}
                                                style={{ color: column.headingColor || undefined }}
                                            />
                                        )}

                                        {/* Brand Column Content */}
                                        {column.type === 'brand' && (
                                            <>
                                                {column.brandLogo && (
                                                    <img
                                                        className="brand-logo"
                                                        src={column.brandLogo}
                                                        alt={column.brandName}
                                                        style={{ maxWidth: `${column.brandLogoWidth}px` }}
                                                    />
                                                )}
                                                <RichText.Content
                                                    tagName="div"
                                                    className="website-footer-block__brand-name"
                                                    value={column.brandName}
                                                />
                                                <RichText.Content
                                                    tagName="p"
                                                    className="website-footer-block__brand-description"
                                                    value={column.description}
                                                />
                                                {column.showCta && (
                                                    <RichText.Content
                                                        tagName="a"
                                                        className={`website-footer-block__cta website-footer-block__cta--${column.ctaStyle}`}
                                                        value={column.ctaText}
                                                        href={column.ctaUrl}
                                                        style={{
                                                            backgroundColor: column.ctaStyle === 'button' ? column.ctaBackgroundColor : 'transparent',
                                                            color: column.ctaStyle === 'button' ? column.ctaTextColor : 'inherit',
                                                            '--cta-hover-bg': column.ctaHoverBackgroundColor || column.ctaBackgroundColor,
                                                            '--cta-hover-color': column.ctaHoverColor || column.ctaTextColor
                                                        }}
                                                    >
                                                        {column.ctaIcon && column.ctaIconPosition === 'left' && (
                                                            <span style={{ marginRight: '8px' }}>{column.ctaIcon}</span>
                                                        )}
                                                        <span className="cta-text-content"></span>
                                                        {column.ctaIcon && column.ctaIconPosition === 'right' && (
                                                            <span style={{ marginLeft: '8px' }}>{column.ctaIcon}</span>
                                                        )}
                                                    </RichText.Content>
                                                )}
                                            </>
                                        )}

                                        {/* Nav Column Content */}
                                        {column.type === 'nav' && (
                                            <ul
                                                className={`website-footer-block__nav-list website-footer-block__nav-list--${column.listStyle}`}
                                                style={{ gap: `${column.itemSpacing}px` }}
                                            >
                                                {column.navItems.map((item) => (
                                                    <li key={item.id}>
                                                        <RichText.Content
                                                            tagName="a"
                                                            value={item.label}
                                                            href={item.url}
                                                            style={{
                                                                color: column.linkColor || 'var(--footer-accent-color, #D52940)',
                                                                '--link-hover-color': column.linkHoverColor || '#ffffff'
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Social Column Content */}
                                        {column.type === 'social' && (
                                            <div className={`website-footer-block__social-list website-footer-block__social-list--${column.displayStyle || 'vertical'}`}>
                                                {(column.socialItems || []).map((item) => (
                                                    <div key={item.id}>
                                                        {(column.displayStyle || 'vertical') === 'vertical' ? (
                                                            <RichText.Content
                                                                tagName="a"
                                                                value={item.label}
                                                                href={item.url}
                                                                style={{ color: column.iconColor || undefined }}
                                                            />
                                                        ) : (
                                                            <a
                                                                href={item.url}
                                                                className="website-footer-block__social-icon"
                                                                aria-label={item.label}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                dangerouslySetInnerHTML={{ __html: getIconSvg(item.icon || item.platform) }}
                                                                style={{
                                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: `${(column.iconSize || 24) + 12}px`, height: `${(column.iconSize || 24) + 12}px`,
                                                                    borderRadius: '50%',
                                                                    color: column.iconColor || 'inherit',
                                                                    backgroundColor: column.iconBgColor || 'rgba(255,255,255,0.1)',
                                                                    fontSize: `${column.iconSize || 24}px`,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Custom Column Content */}
                                        {column.type === 'custom' && (
                                            <RichText.Content
                                                tagName="div"
                                                className="website-footer-block__custom-content"
                                                value={column.customContent}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Bar */}
                    {showBottomBar && (
                        <div
                            className="website-footer-block__bottom-bar"
                            style={{
                                textAlign: bottomBar.alignment === 'space-between' ? 'left' : bottomBar.alignment,
                                backgroundColor: bottomBar.backgroundColor || 'transparent',
                                padding: `${bottomBar.paddingVertical}px 0`,
                                borderTop: bottomBar.showDivider ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >
                            <div className="website-footer-block__bottom-bar-content">
                                <div className="website-footer-block__bottom-bar-copyright"
                                    style={{ color: bottomBar.textColor || undefined }}>
                                    {bottomBar.showCopyright && (
                                        <RichText.Content
                                            value={bottomBar.copyrightText}
                                            tagName="p"
                                        />
                                    )}
                                </div>
                                {bottomBar.showPrivacyPolicy && (
                                    <div className="website-footer-block__bottom-bar-legal">
                                        {bottomBar.legalLinks.map((link, index) => (
                                            <span key={link.id} className="website-footer-block__legal-link-wrapper">
                                                {index > 0 && <span className="website-footer-block__separator">{bottomBar.separator}</span>}
                                                <RichText.Content
                                                    value={link.label}
                                                    tagName="a"
                                                    href={link.url}
                                                    style={{ color: bottomBar.legalLinkColor || undefined }}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {bottomBar.showSocialIcons && (
                                    <div className="website-footer-block__bottom-bar-social">
                                        {bottomBar.socialIcons.map((link) => (
                                            <a
                                                key={link.id}
                                                href={link.url}
                                                className="website-footer-block__social-icon"
                                                aria-label={link.label}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                dangerouslySetInnerHTML={{ __html: getIconSvg(link.icon) }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </footer>
        );
    },
};

export default [deprecatedV1];
