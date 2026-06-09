import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        logoImageUrl,
        logoImageAlt,
        backgroundColor,
        textColor,
        linkColor,
        bottomDividerColor,
        responsivePadding,
        columnGap,
        itemSpacing,
        rowGap,
        rowMarginBottom,
        locations,
        menuItems,
        socialItems,
        copyrightText,
        legalLinks,
        responsiveLogoWidth,
        responsiveSectionTitleFontSize,
        responsiveSectionTitleFontWeight,
        responsiveLinkFontSize,
        responsiveLinkFontWeight,
        responsiveLocationTitleFontSize,
        responsiveLocationTitleFontWeight,
        responsiveLocationItemLabelFontSize,
        responsiveLocationItemLabelFontWeight,
        responsiveLocationItemTextFontSize,
        responsiveLocationItemTextFontWeight,
        responsiveCopyrightFontSize,
        responsiveCopyrightFontWeight,
        responsiveLegalLinkFontSize,
        responsiveLegalLinkFontWeight,
    } = attributes;

    const blockProps = useBlockProps.save({
        className: 'adaire-footer',
        id: blockId || undefined,
        style: {
            '--footer-bg-color': backgroundColor,
            '--footer-text-color': textColor,
            '--footer-link-color': linkColor,
            '--footer-bottom-divider-color':
                bottomDividerColor || 'rgba(0, 0, 0, 0.1)',
            '--footer-padding-top-mobile': responsivePadding.mobile.top,
            '--footer-padding-right-mobile': responsivePadding.mobile.right,
            '--footer-padding-bottom-mobile': responsivePadding.mobile.bottom,
            '--footer-padding-left-mobile': responsivePadding.mobile.left,
            '--footer-padding-top-tablet': responsivePadding.tablet.top,
            '--footer-padding-right-tablet': responsivePadding.tablet.right,
            '--footer-padding-bottom-tablet': responsivePadding.tablet.bottom,
            '--footer-padding-left-tablet': responsivePadding.tablet.left,
            '--footer-padding-top-small-laptop': responsivePadding.smallLaptop.top,
            '--footer-padding-right-small-laptop': responsivePadding.smallLaptop.right,
            '--footer-padding-bottom-small-laptop': responsivePadding.smallLaptop.bottom,
            '--footer-padding-left-small-laptop': responsivePadding.smallLaptop.left,
            '--footer-padding-top-desktop': responsivePadding.desktop.top,
            '--footer-padding-right-desktop': responsivePadding.desktop.right,
            '--footer-padding-bottom-desktop': responsivePadding.desktop.bottom,
            '--footer-padding-left-desktop': responsivePadding.desktop.left,
            '--footer-padding-top-big-desktop': responsivePadding.bigDesktop.top,
            '--footer-padding-right-big-desktop': responsivePadding.bigDesktop.right,
            '--footer-padding-bottom-big-desktop': responsivePadding.bigDesktop.bottom,
            '--footer-padding-left-big-desktop': responsivePadding.bigDesktop.left,
            '--footer-column-gap-mobile': columnGap.mobile,
            '--footer-column-gap-tablet': columnGap.tablet,
            '--footer-column-gap-small-laptop': columnGap.smallLaptop,
            '--footer-column-gap-desktop': columnGap.desktop,
            '--footer-column-gap-big-desktop': columnGap.bigDesktop,
            '--footer-item-spacing-mobile': itemSpacing.mobile,
            '--footer-item-spacing-tablet': itemSpacing.tablet,
            '--footer-item-spacing-small-laptop': itemSpacing.smallLaptop,
            '--footer-item-spacing-desktop': itemSpacing.desktop,
            '--footer-item-spacing-big-desktop': itemSpacing.bigDesktop,
            '--footer-row-gap-mobile': rowGap.mobile,
            '--footer-row-gap-tablet': rowGap.tablet,
            '--footer-row-gap-small-laptop': rowGap.smallLaptop,
            '--footer-row-gap-desktop': rowGap.desktop,
            '--footer-row-gap-big-desktop': rowGap.bigDesktop,
            '--footer-row-margin-bottom-mobile': rowMarginBottom.mobile,
            '--footer-row-margin-bottom-tablet': rowMarginBottom.tablet,
            '--footer-row-margin-bottom-small-laptop': rowMarginBottom.smallLaptop,
            '--footer-row-margin-bottom-desktop': rowMarginBottom.desktop,
            '--footer-row-margin-bottom-big-desktop': rowMarginBottom.bigDesktop,
            '--footer-logo-width-mobile': responsiveLogoWidth.mobile,
            '--footer-logo-width-tablet': responsiveLogoWidth.tablet,
            '--footer-logo-width-small-laptop': responsiveLogoWidth.smallLaptop,
            '--footer-logo-width-desktop': responsiveLogoWidth.desktop,
            '--footer-logo-width-big-desktop': responsiveLogoWidth.bigDesktop,
            '--footer-section-title-font-size-mobile': responsiveSectionTitleFontSize.mobile,
            '--footer-section-title-font-size-tablet': responsiveSectionTitleFontSize.tablet,
            '--footer-section-title-font-size-small-laptop': responsiveSectionTitleFontSize.smallLaptop,
            '--footer-section-title-font-size-desktop': responsiveSectionTitleFontSize.desktop,
            '--footer-section-title-font-size-big-desktop': responsiveSectionTitleFontSize.bigDesktop,
            '--footer-section-title-font-weight-mobile': responsiveSectionTitleFontWeight.mobile,
            '--footer-section-title-font-weight-tablet': responsiveSectionTitleFontWeight.tablet,
            '--footer-section-title-font-weight-small-laptop': responsiveSectionTitleFontWeight.smallLaptop,
            '--footer-section-title-font-weight-desktop': responsiveSectionTitleFontWeight.desktop,
            '--footer-section-title-font-weight-big-desktop': responsiveSectionTitleFontWeight.bigDesktop,
            '--footer-link-font-size-mobile': responsiveLinkFontSize.mobile,
            '--footer-link-font-size-tablet': responsiveLinkFontSize.tablet,
            '--footer-link-font-size-small-laptop': responsiveLinkFontSize.smallLaptop,
            '--footer-link-font-size-desktop': responsiveLinkFontSize.desktop,
            '--footer-link-font-size-big-desktop': responsiveLinkFontSize.bigDesktop,
            '--footer-link-font-weight-mobile': responsiveLinkFontWeight.mobile,
            '--footer-link-font-weight-tablet': responsiveLinkFontWeight.tablet,
            '--footer-link-font-weight-small-laptop': responsiveLinkFontWeight.smallLaptop,
            '--footer-link-font-weight-desktop': responsiveLinkFontWeight.desktop,
            '--footer-link-font-weight-big-desktop': responsiveLinkFontWeight.bigDesktop,
            '--footer-location-title-font-size-mobile': responsiveLocationTitleFontSize.mobile,
            '--footer-location-title-font-size-tablet': responsiveLocationTitleFontSize.tablet,
            '--footer-location-title-font-size-small-laptop': responsiveLocationTitleFontSize.smallLaptop,
            '--footer-location-title-font-size-desktop': responsiveLocationTitleFontSize.desktop,
            '--footer-location-title-font-size-big-desktop': responsiveLocationTitleFontSize.bigDesktop,
            '--footer-location-title-font-weight-mobile': responsiveLocationTitleFontWeight.mobile,
            '--footer-location-title-font-weight-tablet': responsiveLocationTitleFontWeight.tablet,
            '--footer-location-title-font-weight-small-laptop': responsiveLocationTitleFontWeight.smallLaptop,
            '--footer-location-title-font-weight-desktop': responsiveLocationTitleFontWeight.desktop,
            '--footer-location-title-font-weight-big-desktop': responsiveLocationTitleFontWeight.bigDesktop,
            '--footer-location-item-label-font-size-mobile': responsiveLocationItemLabelFontSize.mobile,
            '--footer-location-item-label-font-size-tablet': responsiveLocationItemLabelFontSize.tablet,
            '--footer-location-item-label-font-size-small-laptop': responsiveLocationItemLabelFontSize.smallLaptop,
            '--footer-location-item-label-font-size-desktop': responsiveLocationItemLabelFontSize.desktop,
            '--footer-location-item-label-font-size-big-desktop': responsiveLocationItemLabelFontSize.bigDesktop,
            '--footer-location-item-label-font-weight-mobile': responsiveLocationItemLabelFontWeight.mobile,
            '--footer-location-item-label-font-weight-tablet': responsiveLocationItemLabelFontWeight.tablet,
            '--footer-location-item-label-font-weight-small-laptop': responsiveLocationItemLabelFontWeight.smallLaptop,
            '--footer-location-item-label-font-weight-desktop': responsiveLocationItemLabelFontWeight.desktop,
            '--footer-location-item-label-font-weight-big-desktop': responsiveLocationItemLabelFontWeight.bigDesktop,
            '--footer-location-item-text-font-size-mobile': responsiveLocationItemTextFontSize.mobile,
            '--footer-location-item-text-font-size-tablet': responsiveLocationItemTextFontSize.tablet,
            '--footer-location-item-text-font-size-small-laptop': responsiveLocationItemTextFontSize.smallLaptop,
            '--footer-location-item-text-font-size-desktop': responsiveLocationItemTextFontSize.desktop,
            '--footer-location-item-text-font-size-big-desktop': responsiveLocationItemTextFontSize.bigDesktop,
            '--footer-location-item-text-font-weight-mobile': responsiveLocationItemTextFontWeight.mobile,
            '--footer-location-item-text-font-weight-tablet': responsiveLocationItemTextFontWeight.tablet,
            '--footer-location-item-text-font-weight-small-laptop': responsiveLocationItemTextFontWeight.smallLaptop,
            '--footer-location-item-text-font-weight-desktop': responsiveLocationItemTextFontWeight.desktop,
            '--footer-location-item-text-font-weight-big-desktop': responsiveLocationItemTextFontWeight.bigDesktop,
            '--footer-copyright-font-size-mobile': responsiveCopyrightFontSize.mobile,
            '--footer-copyright-font-size-tablet': responsiveCopyrightFontSize.tablet,
            '--footer-copyright-font-size-small-laptop': responsiveCopyrightFontSize.smallLaptop,
            '--footer-copyright-font-size-desktop': responsiveCopyrightFontSize.desktop,
            '--footer-copyright-font-size-big-desktop': responsiveCopyrightFontSize.bigDesktop,
            '--footer-copyright-font-weight-mobile': responsiveCopyrightFontWeight.mobile,
            '--footer-copyright-font-weight-tablet': responsiveCopyrightFontWeight.tablet,
            '--footer-copyright-font-weight-small-laptop': responsiveCopyrightFontWeight.smallLaptop,
            '--footer-copyright-font-weight-desktop': responsiveCopyrightFontWeight.desktop,
            '--footer-copyright-font-weight-big-desktop': responsiveCopyrightFontWeight.bigDesktop,
            '--footer-legal-link-font-size-mobile': responsiveLegalLinkFontSize.mobile,
            '--footer-legal-link-font-size-tablet': responsiveLegalLinkFontSize.tablet,
            '--footer-legal-link-font-size-small-laptop': responsiveLegalLinkFontSize.smallLaptop,
            '--footer-legal-link-font-size-desktop': responsiveLegalLinkFontSize.desktop,
            '--footer-legal-link-font-size-big-desktop': responsiveLegalLinkFontSize.bigDesktop,
            '--footer-legal-link-font-weight-mobile': responsiveLegalLinkFontWeight.mobile,
            '--footer-legal-link-font-weight-tablet': responsiveLegalLinkFontWeight.tablet,
            '--footer-legal-link-font-weight-small-laptop': responsiveLegalLinkFontWeight.smallLaptop,
            '--footer-legal-link-font-weight-desktop': responsiveLegalLinkFontWeight.desktop,
            '--footer-legal-link-font-weight-big-desktop': responsiveLegalLinkFontWeight.bigDesktop,
        },
    });

    return (
        <div {...blockProps}>
            <div className="adaire-footer__inner">

            <div className='adaire-footer__row'> 
                {/* Needs to be a row */}
                {/* Image container takes 50% of the width */}
            {logoImageUrl && (
                    <div className="adaire-footer__logo">
                        <img src={logoImageUrl} alt={logoImageAlt || ''} />
                    </div>
                )}
                {/* columns takes the other 50% */}
                <div className="adaire-footer__columns">

                    <div className="adaire-footer__column adaire-footer__column--locations">
                        <div className="adaire-footer__locations">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className={`adaire-footer__location ${location.open ? 'is-open' : ''}`}
                                    data-location-id={location.id}
                                >
                                    <button
                                        type="button"
                                        className="adaire-footer__location-header"
                                        aria-expanded={location.open ? 'true' : 'false'}
                                    >
                                        <span className="adaire-footer__location-icon">
                                            {location.open ? 'âˆ’' : '+'}
                                        </span>
                                        <span className="adaire-footer__location-title">{location.title}</span>
                                    </button>
                                    {location.items && location.items.length > 0 && (
                                        <div className="adaire-footer__location-panel">
                                            {location.items.map((item) => (
                                                <div key={item.id} className="adaire-footer__location-item">
                                                    {item.label && (
                                                        <div className="adaire-footer__location-item-label">{item.label}</div>
                                                    )}
                                                    {item.address && (
                                                        <div className="adaire-footer__location-item-address">
                                                            {item.address.split('\n').map((line, i) => (
                                                                <div key={i}>{line}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.phone && (
                                                        <div className="adaire-footer__location-item-phone">{item.phone}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="adaire-footer__column adaire-footer__column--menu">
                        <div className="adaire-footer__section-title">MENU</div>
                        <ul className="adaire-footer__menu">
                            {menuItems.map((item) => (
                                <li key={item.id}>
                                    <a href={item.url}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="adaire-footer__column adaire-footer__column--social">
                        <div className="adaire-footer__section-title">SOCIAL</div>
                        <ul className="adaire-footer__social">
                            {socialItems.map((item) => (
                                <li key={item.id}>
                                    <a href={item.url}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>


                <div className="adaire-footer__bottom">
                    <div className="adaire-footer__copyright">{copyrightText}</div>
                    <div className="adaire-footer__legal">
                        {legalLinks.map((item) => (
                            <a key={item.id} href={item.url} className="adaire-footer__legal-link">
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}




