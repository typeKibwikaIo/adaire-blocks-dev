import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    PanelColorSettings,
    RichText,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
    Button,
    ButtonGroup,
    SelectControl,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, createElement, useCallback } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';

// Custom icons for small laptop and big desktop
const smallLaptopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
},
    createElement('path', {
        d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none',
    }),
    createElement('path', {
        d: 'M2 19H22',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
    }),
);

const bigDesktopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
},
    createElement('rect', {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '1',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none',
    }),
    createElement('path', {
        d: 'M8 20H16',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
    }),
    createElement('rect', {
        x: '10',
        y: '20',
        width: '4',
        height: '2',
        rx: '0.5',
        fill: 'currentColor',
    }),
);

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'footer-block') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'footer-block') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'footer-block') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'footer-block') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'footer-block') },
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        logoImageId,
        logoImageUrl,
        logoImageAlt,
        responsiveLogoWidth,
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

    const [deviceType, setDeviceType] = useState('desktop');

    // Generate block ID
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `footer-${clientId}` });
        }
    }, [blockId, clientId, setAttributes]);

    const updateResponsiveAttribute = useCallback((attr, breakpoint, value) => {
        setAttributes({
            [attr]: {
                ...attributes[attr],
                [breakpoint]: value,
            },
        });
    }, [attributes, setAttributes]);

    const updateLocation = (index, field, value) => {
        const newLocations = [...locations];
        newLocations[index] = { ...newLocations[index], [field]: value };
        setAttributes({ locations: newLocations });
    };

    const addLocationItem = (locationIndex) => {
        const newLocations = [...locations];
        const newItem = {
            id: `loc-${locationIndex}-item-${Date.now()}`,
            label: '',
            address: '',
            phone: '',
        };
        newLocations[locationIndex].items = [...(newLocations[locationIndex].items || []), newItem];
        setAttributes({ locations: newLocations });
    };

    const updateLocationItem = (locationIndex, itemIndex, field, value) => {
        const newLocations = [...locations];
        newLocations[locationIndex].items[itemIndex] = {
            ...newLocations[locationIndex].items[itemIndex],
            [field]: value,
        };
        setAttributes({ locations: newLocations });
    };

    const removeLocationItem = (locationIndex, itemIndex) => {
        const newLocations = [...locations];
        newLocations[locationIndex].items.splice(itemIndex, 1);
        setAttributes({ locations: newLocations });
    };

    const addLocation = () => {
        const newLocation = {
            id: `loc-${Date.now()}`,
            title: 'New Location',
            open: false,
            items: [],
        };
        setAttributes({ locations: [...locations, newLocation] });
    };

    const removeLocation = (index) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setAttributes({ locations: newLocations });
    };

    const updateMenuItem = (index, field, value) => {
        const newItems = [...menuItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setAttributes({ menuItems: newItems });
    };

    const addMenuItem = () => {
        const newItem = {
            id: `menu-${Date.now()}`,
            label: 'New Menu Item',
            url: '#',
        };
        setAttributes({ menuItems: [...menuItems, newItem] });
    };

    const removeMenuItem = (index) => {
        const newItems = menuItems.filter((_, i) => i !== index);
        setAttributes({ menuItems: newItems });
    };

    const updateSocialItem = (index, field, value) => {
        const newItems = [...socialItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setAttributes({ socialItems: newItems });
    };

    const addSocialItem = () => {
        const newItem = {
            id: `social-${Date.now()}`,
            label: 'New Social',
            url: '#',
        };
        setAttributes({ socialItems: [...socialItems, newItem] });
    };

    const removeSocialItem = (index) => {
        const newItems = socialItems.filter((_, i) => i !== index);
        setAttributes({ socialItems: newItems });
    };

    const updateLegalLink = (index, field, value) => {
        const newItems = [...legalLinks];
        newItems[index] = { ...newItems[index], [field]: value };
        setAttributes({ legalLinks: newItems });
    };

    const addLegalLink = () => {
        const newItem = {
            id: `legal-${Date.now()}`,
            label: 'New Link',
            url: '#',
        };
        setAttributes({ legalLinks: [...legalLinks, newItem] });
    };

    const removeLegalLink = (index) => {
        const newItems = legalLinks.filter((_, i) => i !== index);
        setAttributes({ legalLinks: newItems });
    };

    const blockProps = useBlockProps({
        className: 'adaire-footer',
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
        <>
            <InspectorControls>
                <PanelBody title={__('Device Type', 'footer-block')} initialOpen={false}>
                    <ButtonGroup>
                        {BREAKPOINTS.map((bp) => (
                            <Button
                                key={bp.name}
                                isPrimary={deviceType === bp.name}
                                onClick={() => setDeviceType(bp.name)}
                                icon={bp.icon}
                                label={bp.label}
                            >
                                {bp.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </PanelBody>

                <PanelBody title={__('Logo', 'footer-block')} initialOpen={true}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={(media) => {
                                const url = media?.url || media?.source_url || '';
                                setAttributes({
                                    logoImageId: media?.id || 0,
                                    logoImageUrl: url,
                                    logoImageAlt: media?.alt || '',
                                });
                            }}
                            allowedTypes={['image']}
                            value={logoImageId}
                            render={({ open }) => (
                                <div>
                                    <Button variant="secondary" onClick={open}>
                                        {logoImageUrl ? __('Change Logo', 'footer-block') : __('Select Logo', 'footer-block')}
                                    </Button>
                                    {logoImageUrl && (
                                        <div style={{ marginTop: 12 }}>
                                            <img
                                                src={logoImageUrl}
                                                alt={logoImageAlt}
                                                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                                            />
                                            <Button
                                                isDestructive
                                                variant="link"
                                                onClick={() => setAttributes({ logoImageId: 0, logoImageUrl: '', logoImageAlt: '' })}
                                                style={{ marginTop: 8 }}
                                            >
                                                {__('Remove Logo', 'footer-block')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                    <TextControl
                        label={__('Alt Text', 'footer-block')}
                        value={logoImageAlt}
                        onChange={(value) => setAttributes({ logoImageAlt: value })}
                    />
                    <UnitControl
                        label={__('Logo Width', 'footer-block')}
                        value={responsiveLogoWidth[deviceType]}
                        onChange={(value) => updateResponsiveAttribute('responsiveLogoWidth', deviceType, value)}
                    />
                </PanelBody>

                <PanelBody title={__('Colors', 'footer-block')} initialOpen={false}>
                    <PanelColorSettings
                        title={__('Colors', 'footer-block')}
                        colorSettings={[
                            {
                                value: backgroundColor,
                                onChange: (value) => setAttributes({ backgroundColor: value }),
                                label: __('Background Color', 'footer-block'),
                            },
                            {
                                value: textColor,
                                onChange: (value) => setAttributes({ textColor: value }),
                                label: __('Text Color', 'footer-block'),
                            },
                            {
                                value: linkColor,
                                onChange: (value) => setAttributes({ linkColor: value }),
                                label: __('Link Color', 'footer-block'),
                            },
                            {
                                value: bottomDividerColor,
                                onChange: (value) => setAttributes({ bottomDividerColor: value }),
                                label: __('Bottom Section Divider', 'footer-block'),
                            },
                        ]}
                    />
                </PanelBody>

                <PanelBody title={__('Spacing', 'footer-block')} initialOpen={false}>
                    <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px' }}>{__('Padding', 'footer-block')}</p>
                    <BoxControl
                        label={__('Padding', 'footer-block')}
                        values={{
                            top: responsivePadding[deviceType].top,
                            right: responsivePadding[deviceType].right,
                            bottom: responsivePadding[deviceType].bottom,
                            left: responsivePadding[deviceType].left,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                responsivePadding: {
                                    ...responsivePadding,
                                    [deviceType]: value,
                                },
                            });
                        }}
                    />
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #ddd' }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px' }}>{__('Layout Spacing', 'footer-block')}</p>
                        <UnitControl
                            label={__('Row Gap (Logo â†” Columns)', 'footer-block')}
                            value={rowGap[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('rowGap', deviceType, value)}
                            help={__('Space between logo and columns row', 'footer-block')}
                        />
                        <UnitControl
                            label={__('Row Bottom Margin', 'footer-block')}
                            value={rowMarginBottom[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('rowMarginBottom', deviceType, value)}
                            help={__('Space below the logo/columns row', 'footer-block')}
                        />
                        <UnitControl
                            label={__('Column Gap (Between Lists)', 'footer-block')}
                            value={columnGap[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('columnGap', deviceType, value)}
                            help={__('Space between location, menu, and social columns', 'footer-block')}
                        />
                        <UnitControl
                            label={__('Item Spacing (Within Lists)', 'footer-block')}
                            value={itemSpacing[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('itemSpacing', deviceType, value)}
                            help={__('Space between items in each list', 'footer-block')}
                        />
                    </div>
                </PanelBody>

                <PanelBody title={__('Locations', 'footer-block')} initialOpen={false}>
                    {locations.map((location, locIndex) => (
                        <div key={location.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 4 }}>
                            <TextControl
                                label={__('Location Title', 'footer-block')}
                                value={location.title}
                                onChange={(value) => updateLocation(locIndex, 'title', value)}
                            />
                            <Button
                                variant="secondary"
                                onClick={() => updateLocation(locIndex, 'open', !location.open)}
                                style={{ marginTop: 8, marginBottom: 8 }}
                            >
                                {location.open ? __('Collapse', 'footer-block') : __('Expand', 'footer-block')}
                            </Button>
                            {location.items && location.items.map((item, itemIndex) => (
                                <div key={item.id} style={{ border: '1px solid #eee', padding: 8, marginTop: 8, borderRadius: 4 }}>
                                    <TextControl
                                        label={__('Label', 'footer-block')}
                                        value={item.label}
                                        onChange={(value) => updateLocationItem(locIndex, itemIndex, 'label', value)}
                                    />
                                    <TextareaControl
                                        label={__('Address', 'footer-block')}
                                        value={item.address}
                                        onChange={(value) => updateLocationItem(locIndex, itemIndex, 'address', value)}
                                    />
                                    <TextControl
                                        label={__('Phone', 'footer-block')}
                                        value={item.phone}
                                        onChange={(value) => updateLocationItem(locIndex, itemIndex, 'phone', value)}
                                    />
                                    <Button
                                        isDestructive
                                        variant="link"
                                        onClick={() => removeLocationItem(locIndex, itemIndex)}
                                        style={{ marginTop: 8 }}
                                    >
                                        {__('Remove Item', 'footer-block')}
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="secondary"
                                onClick={() => addLocationItem(locIndex)}
                                style={{ marginTop: 8 }}
                            >
                                {__('Add Location Item', 'footer-block')}
                            </Button>
                            <Button
                                isDestructive
                                variant="link"
                                onClick={() => removeLocation(locIndex)}
                                style={{ marginTop: 8 }}
                            >
                                {__('Remove Location', 'footer-block')}
                            </Button>
                        </div>
                    ))}
                    <Button variant="primary" onClick={addLocation}>
                        {__('Add Location', 'footer-block')}
                    </Button>
                </PanelBody>

                <PanelBody title={__('Menu Items', 'footer-block')} initialOpen={false}>
                    {menuItems.map((item, index) => (
                        <div key={item.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 4 }}>
                            <TextControl
                                label={__('Label', 'footer-block')}
                                value={item.label}
                                onChange={(value) => updateMenuItem(index, 'label', value)}
                            />
                            <TextControl
                                label={__('URL', 'footer-block')}
                                value={item.url}
                                onChange={(value) => updateMenuItem(index, 'url', value)}
                            />
                            <Button
                                isDestructive
                                variant="link"
                                onClick={() => removeMenuItem(index)}
                                style={{ marginTop: 8 }}
                            >
                                {__('Remove', 'footer-block')}
                            </Button>
                        </div>
                    ))}
                    <Button variant="primary" onClick={addMenuItem}>
                        {__('Add Menu Item', 'footer-block')}
                    </Button>
                </PanelBody>

                <PanelBody title={__('Social Links', 'footer-block')} initialOpen={false}>
                    {socialItems.map((item, index) => (
                        <div key={item.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 4 }}>
                            <TextControl
                                label={__('Label', 'footer-block')}
                                value={item.label}
                                onChange={(value) => updateSocialItem(index, 'label', value)}
                            />
                            <TextControl
                                label={__('URL', 'footer-block')}
                                value={item.url}
                                onChange={(value) => updateSocialItem(index, 'url', value)}
                            />
                            <Button
                                isDestructive
                                variant="link"
                                onClick={() => removeSocialItem(index)}
                                style={{ marginTop: 8 }}
                            >
                                {__('Remove', 'footer-block')}
                            </Button>
                        </div>
                    ))}
                    <Button variant="primary" onClick={addSocialItem}>
                        {__('Add Social Link', 'footer-block')}
                    </Button>
                </PanelBody>

                <PanelBody title={__('Copyright & Legal', 'footer-block')} initialOpen={false}>
                    <TextareaControl
                        label={__('Copyright Text', 'footer-block')}
                        value={copyrightText}
                        onChange={(value) => setAttributes({ copyrightText: value })}
                    />
                    {legalLinks.map((item, index) => (
                        <div key={item.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 4 }}>
                            <TextControl
                                label={__('Label', 'footer-block')}
                                value={item.label}
                                onChange={(value) => updateLegalLink(index, 'label', value)}
                            />
                            <TextControl
                                label={__('URL', 'footer-block')}
                                value={item.url}
                                onChange={(value) => updateLegalLink(index, 'url', value)}
                            />
                            <Button
                                isDestructive
                                variant="link"
                                onClick={() => removeLegalLink(index)}
                                style={{ marginTop: 8 }}
                            >
                                {__('Remove', 'footer-block')}
                            </Button>
                        </div>
                    ))}
                    <Button variant="primary" onClick={addLegalLink}>
                        {__('Add Legal Link', 'footer-block')}
                    </Button>
                </PanelBody>

                <PanelBody title={__('Typography', 'footer-block')} initialOpen={false}>
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px', color: '#1e1e1e' }}>{__('Section Titles (MENU, SOCIAL)', 'footer-block')}</p>
                        <UnitControl
                            label={__('Font Size', 'footer-block')}
                            value={responsiveSectionTitleFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveSectionTitleFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Font Weight', 'footer-block')}
                            value={responsiveSectionTitleFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveSectionTitleFontWeight', deviceType, value)}
                        />
                    </div>

                    <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid #ddd' }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px', color: '#1e1e1e' }}>{__('Menu & Social Links', 'footer-block')}</p>
                        <UnitControl
                            label={__('Font Size', 'footer-block')}
                            value={responsiveLinkFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLinkFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Font Weight', 'footer-block')}
                            value={responsiveLinkFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLinkFontWeight', deviceType, value)}
                        />
                    </div>

                    <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid #ddd' }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px', color: '#1e1e1e' }}>{__('Location Accordion', 'footer-block')}</p>
                        <UnitControl
                            label={__('Title Font Size', 'footer-block')}
                            value={responsiveLocationTitleFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationTitleFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Title Font Weight', 'footer-block')}
                            value={responsiveLocationTitleFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationTitleFontWeight', deviceType, value)}
                        />
                        <UnitControl
                            label={__('Item Label Font Size', 'footer-block')}
                            value={responsiveLocationItemLabelFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationItemLabelFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Item Label Font Weight', 'footer-block')}
                            value={responsiveLocationItemLabelFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationItemLabelFontWeight', deviceType, value)}
                        />
                        <UnitControl
                            label={__('Item Text Font Size', 'footer-block')}
                            value={responsiveLocationItemTextFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationItemTextFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Item Text Font Weight', 'footer-block')}
                            value={responsiveLocationItemTextFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLocationItemTextFontWeight', deviceType, value)}
                        />
                    </div>

                    <div style={{ paddingTop: 20, borderTop: '1px solid #ddd' }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '13px', color: '#1e1e1e' }}>{__('Footer Bottom', 'footer-block')}</p>
                        <UnitControl
                            label={__('Copyright Font Size', 'footer-block')}
                            value={responsiveCopyrightFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveCopyrightFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Copyright Font Weight', 'footer-block')}
                            value={responsiveCopyrightFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveCopyrightFontWeight', deviceType, value)}
                        />
                        <UnitControl
                            label={__('Legal Links Font Size', 'footer-block')}
                            value={responsiveLegalLinkFontSize[deviceType]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLegalLinkFontSize', deviceType, value)}
                        />
                        <SelectControl
                            label={__('Legal Links Font Weight', 'footer-block')}
                            value={responsiveLegalLinkFontWeight[deviceType]}
                            options={[
                                { label: '100', value: '100' }, { label: '200', value: '200' },
                                { label: '300', value: '300' }, { label: '400', value: '400' },
                                { label: '500', value: '500' }, { label: '600', value: '600' },
                                { label: '700', value: '700' }, { label: '800', value: '800' },
                                { label: '900', value: '900' },
                            ]}
                            onChange={(value) => updateResponsiveAttribute('responsiveLegalLinkFontWeight', deviceType, value)}
                        />
                    </div>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className="adaire-footer__inner">
                    <div className="adaire-footer__row">
                        {logoImageUrl && (
                            <div className="adaire-footer__logo">
                                <img src={logoImageUrl} alt={logoImageAlt} />
                            </div>
                        )}
                        <div className="adaire-footer__columns">
                            <div className="adaire-footer__column adaire-footer__column--locations">
                            <div className="adaire-footer__locations">
                                {locations.map((location) => (
                                    <div
                                        key={location.id}
                                        className={`adaire-footer__location ${location.open ? 'is-open' : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className="adaire-footer__location-header"
                                            onClick={() => {
                                                const newLocations = locations.map((loc) =>
                                                    loc.id === location.id ? { ...loc, open: !loc.open } : loc
                                                );
                                                setAttributes({ locations: newLocations });
                                            }}
                                        >
                                            <span className="adaire-footer__location-icon">
                                                {location.open ? 'âˆ’' : '+'}
                                            </span>
                                            <span className="adaire-footer__location-title">{location.title}</span>
                                        </button>
                                        {location.open && location.items && location.items.length > 0 && (
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
        </>
    );
}




