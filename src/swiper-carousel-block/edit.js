import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	ButtonGroup,
	TextControl,
	RangeControl,
	BaseControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useState, useEffect, createElement } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import './editor.scss';

// Custom icons for small laptop and big desktop
const tabletIcon = createElement('svg', {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	xmlns: 'http://www.w3.org/2000/svg'
},
	createElement('path', {
		d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		fill: 'none'
	}),
	createElement('path', {
		d: 'M2 19H22',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		strokeLinecap: 'round'
	})
);

const desktopIcon = createElement('svg', {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	xmlns: 'http://www.w3.org/2000/svg'
},
	createElement('rect', {
		x: '3',
		y: '4',
		width: '18',
		height: '12',
		rx: '1',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		fill: 'none'
	}),
	createElement('path', {
		d: 'M8 20H16',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		strokeLinecap: 'round'
	}),
	createElement('rect', {
		x: '10',
		y: '20',
		width: '4',
		height: '2',
		rx: '0.5',
		fill: 'currentColor'
	})
);

const Edit = ({ attributes, setAttributes, clientId }) => {
	const {
		blockId,
		cardGap,
		slidesPerView,
		loop,
		mobilePeekPercent,
		slideHeight,
		listPaddingLeft,
		containerMode,
		containerMaxWidth,
		marginTop,
		marginBottom,
		dragCursorText,
		dragCursorSize,
		dragCursorFontSize,
		dragCursorFontWeight,
		dragCursorColor,
		dragCursorBgColor,
		dragCursorTextTransform,
		borderRadius,
		paginationVisible,
		paginationActiveColor,
		paginationInactiveColor,
	} = attributes;

	const [deviceType, setDeviceType] = useState('desktop');
	const [activeZone, setActiveZone] = useState(null);

    const ALLOWED_BLOCKS = ['adaire/swiper-slide'];

	// Helpers for responsive values (per breakpoint)
	const getResponsiveValue = (obj, fallback) => {
		return getDeviceValue(obj, deviceType, fallback);
	};

	const setResponsiveValue = (key, value) => {
		setAttributes({
			[key]: updateDeviceAttribute(attributes[key], deviceType, value),
		});
	};

	// Supports legacy numeric values and new { value, unit } values.
	const normalizeResponsiveDimension = (dimension, defaults) => {
		// Legacy: if stored as number per breakpoint (or number in general), treat as px.
		if (typeof dimension === 'number') {
			return {
				desktop: { value: dimension, unit: 'px' },
				tablet: { value: dimension, unit: 'px' },
				mobile: { value: dimension, unit: 'px' },
				smartwatch: { value: dimension, unit: 'px' },
			};
		}

		if (typeof dimension === 'object' && dimension !== null) {
			// If it looks like the old responsive number map: { mobile: 300, ... }
			const looksLikeNumberMap =
				typeof dimension.mobile === 'number' ||
				typeof dimension.tablet === 'number' ||
				typeof dimension.desktop === 'number';
			if (looksLikeNumberMap) {
				return {
					desktop: { value: dimension.desktop ?? defaults.desktop.value, unit: 'px' },
					tablet: { value: dimension.tablet ?? defaults.tablet.value, unit: 'px' },
					mobile: { value: dimension.mobile ?? defaults.mobile.value, unit: 'px' },
					smartwatch: { value: dimension.smartwatch ?? defaults.smartwatch.value, unit: 'px' },
				};
			}

			// New shape: { desktop: {value, unit}, ... }
			return {
				desktop: {
					value: dimension?.desktop?.value ?? defaults.desktop.value,
					unit: dimension?.desktop?.unit ?? defaults.desktop.unit,
				},
				tablet: {
					value: dimension?.tablet?.value ?? defaults.tablet.value,
					unit: dimension?.tablet?.unit ?? defaults.tablet.unit,
				},
				mobile: {
					value: dimension?.mobile?.value ?? defaults.mobile.value,
					unit: dimension?.mobile?.unit ?? defaults.mobile.unit,
				},
				smartwatch: {
					value: dimension?.smartwatch?.value ?? defaults.smartwatch.value,
					unit: dimension?.smartwatch?.unit ?? defaults.smartwatch.unit,
				},
			};
		}

		return defaults;
	};

	const slideHeightDefaults = {
		desktop: { value: 500, unit: 'px' },
		tablet: { value: 400, unit: 'px' },
		mobile: { value: 300, unit: 'px' },
		smartwatch: { value: 200, unit: 'px' },
	};

	const normalizedSlideHeight = normalizeResponsiveDimension(slideHeight, slideHeightDefaults);
	const currentSlideHeight = normalizedSlideHeight?.[deviceType]?.value ?? slideHeightDefaults[deviceType].value;
	const currentSlideHeightUnit = normalizedSlideHeight?.[deviceType]?.unit ?? slideHeightDefaults[deviceType].unit;
	const currentListPaddingLeft = getResponsiveValue(
		listPaddingLeft,
		10
	);

	// Generate block ID on mount
	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: `swiper-carousel-${clientId}` });
		}
	}, [clientId, blockId, setAttributes]);

	const blockProps = useBlockProps({
		className: 'adaire-swiper-carousel',
		style: {
			'--adaire-swiper-carousel-gap': `${getDeviceValue(cardGap, 'desktop', 24)}px`,
			'--adaire-swiper-carousel-gap-tablet': `${getDeviceValue(cardGap, 'tablet', 20)}px`,
			'--adaire-swiper-carousel-gap-mobile': `${getDeviceValue(cardGap, 'mobile', 16)}px`,
			'--adaire-swiper-carousel-gap-watch': `${getDeviceValue(cardGap, 'smartwatch', 12)}px`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			'--container-max-width-watch': `${containerMaxWidth?.smartwatch?.value ?? 100}${containerMaxWidth?.smartwatch?.unit ?? '%'}`,
			'--slide-height': `${normalizedSlideHeight.desktop.value}${normalizedSlideHeight.desktop.unit}`,
			'--slide-height-tablet': `${normalizedSlideHeight.tablet.value}${normalizedSlideHeight.tablet.unit}`,
			'--slide-height-mobile': `${normalizedSlideHeight.mobile.value}${normalizedSlideHeight.mobile.unit}`,
			'--slide-height-watch': `${normalizedSlideHeight.smartwatch.value}${normalizedSlideHeight.smartwatch.unit}`,
			'--list-padding-left': `${getDeviceValue(listPaddingLeft, 'desktop', 10)}px`,
			'--list-padding-left-tablet': `${getDeviceValue(listPaddingLeft, 'tablet', 10)}px`,
			'--list-padding-left-mobile': `${getDeviceValue(listPaddingLeft, 'mobile', 10)}px`,
			'--list-padding-left-watch': `${getDeviceValue(listPaddingLeft, 'smartwatch', 5)}px`,
			marginTop: `${getDeviceValue(marginTop, 'desktop', 0)}px`,
			marginBottom: `${getDeviceValue(marginBottom, 'desktop', 0)}px`,
			'--margin-top-tablet': `${getDeviceValue(marginTop, 'tablet', 0)}px`,
			'--margin-bottom-tablet': `${getDeviceValue(marginBottom, 'tablet', 0)}px`,
			'--margin-top-mobile': `${getDeviceValue(marginTop, 'mobile', 0)}px`,
			'--margin-bottom-mobile': `${getDeviceValue(marginBottom, 'mobile', 0)}px`,
			'--margin-top-watch': `${getDeviceValue(marginTop, 'smartwatch', 0)}px`,
			'--margin-bottom-watch': `${getDeviceValue(marginBottom, 'smartwatch', 0)}px`,
			'--adaire-swiper-carousel-drag-cursor-size': `${getDeviceValue(dragCursorSize, 'desktop', 80)}px`,
			'--adaire-swiper-carousel-drag-cursor-size-tablet': `${getDeviceValue(dragCursorSize, 'tablet', 70)}px`,
			'--adaire-swiper-carousel-drag-cursor-size-mobile': `${getDeviceValue(dragCursorSize, 'mobile', 60)}px`,
			'--adaire-swiper-carousel-drag-cursor-size-watch': `${getDeviceValue(dragCursorSize, 'smartwatch', 50)}px`,
			'--adaire-swiper-carousel-drag-cursor-font-size': `${getDeviceValue(dragCursorFontSize, 'desktop', 16)}px`,
			'--adaire-swiper-carousel-drag-cursor-font-size-tablet': `${getDeviceValue(dragCursorFontSize, 'tablet', 14)}px`,
			'--adaire-swiper-carousel-drag-cursor-font-size-mobile': `${getDeviceValue(dragCursorFontSize, 'mobile', 12)}px`,
			'--adaire-swiper-carousel-drag-cursor-font-size-watch': `${getDeviceValue(dragCursorFontSize, 'smartwatch', 10)}px`,
			'--adaire-swiper-carousel-drag-cursor-font-weight': dragCursorFontWeight,
			'--adaire-swiper-carousel-drag-cursor-color': dragCursorColor,
			'--adaire-swiper-carousel-drag-cursor-bg': dragCursorBgColor,
			'--adaire-swiper-carousel-drag-cursor-text-transform': dragCursorTextTransform,
			'--slide-border-radius': `${getDeviceValue(borderRadius, 'desktop', 0)}px`,
			'--slide-border-radius-tablet': `${getDeviceValue(borderRadius, 'tablet', 0)}px`,
			'--slide-border-radius-mobile': `${getDeviceValue(borderRadius, 'mobile', 0)}px`,
			'--slide-border-radius-watch': `${getDeviceValue(borderRadius, 'smartwatch', 0)}px`,
		},
	});

    return (
		<>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
					<PanelBody title={__('Responsive Settings', 'swiper-carousel-block')} initialOpen={false}>
						<DeviceSwitcher 
							deviceType={deviceType} 
							setDeviceType={setDeviceType}
							label="Device Preview"
						/>
					</PanelBody>
				<PanelBody title={__('Layout', 'swiper-carousel-block')} initialOpen={true}>
					<RangeControl
						label={__('Gap Between Cards', 'swiper-carousel-block')}
						value={cardGap}
						onChange={(value) => setAttributes({ cardGap: value })}
						min={4}
						max={48}
						step={2}
					/>

					<BaseControl label={__('Cards per view', 'swiper-carousel-block')}>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Big Desktop (â‰¥ 1921px)', 'swiper-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.desktop ?? slidesPerView?.desktop ?? 5}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											desktop: value,
										},
									})
								}
								min={1}
								max={12}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Desktop (1301â€“1920px)', 'swiper-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.desktop ?? 4}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											desktop: value,
										},
									})
								}
								min={1}
								max={12}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Small Laptop (1025â€“1300px)', 'swiper-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.tablet ?? slidesPerView?.desktop ?? 4}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											tablet: value,
										},
									})
								}
								min={1}
								max={12}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Tablet (601â€“1024px)', 'swiper-carousel-block')}</strong>
                    <RangeControl
								value={slidesPerView?.tablet ?? 3}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											tablet: value,
										},
									})
								}
								min={1}
								max={12}
                    />
						</div>
						<div>
							<strong>{__('Mobile (â‰¤ 600px)', 'swiper-carousel-block')}</strong>
                    <RangeControl
								value={slidesPerView?.mobile ?? 1}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											mobile: value,
										},
									})
								}
								min={1}
								max={12}
                    />
						</div>
					</BaseControl>

                    <ToggleControl
						label={__('Enable Loop', 'swiper-carousel-block')}
						checked={!!loop}
                        onChange={(value) => setAttributes({ loop: value })}
						help={__('Enable infinite loop scrolling', 'swiper-carousel-block')}
					/>

					<RangeControl
						label={__('Mobile next card visibility (%)', 'swiper-carousel-block')}
						value={mobilePeekPercent ?? 20}
						onChange={(value) => setAttributes({ mobilePeekPercent: value })}
						min={0}
						max={50}
						step={5}
						help={__('How much of the next card should be visible on mobile.', 'swiper-carousel-block')}
					/>
				</PanelBody>

				<PanelBody title={__('Slide Height (Responsive)', 'swiper-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>
						{__('Breakpoint', 'swiper-carousel-block')}
					</p>
					<ButtonGroup style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
						<Button
							icon={mobile}
							isPrimary={deviceType === 'mobile'}
							onClick={() => setDeviceType('mobile')}
						/>
						<Button
							icon={tablet}
							isPrimary={deviceType === 'tablet'}
							onClick={() => setDeviceType('tablet')}
						/>
						<Button
							icon={tabletIcon}
							isPrimary={deviceType === 'tablet'}
							onClick={() => setDeviceType('tablet')}
						/>
						<Button
							icon={desktop}
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						/>
						<Button
							icon={desktopIcon}
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						/>
					</ButtonGroup>
					<RangeControl
						label={sprintf(
							__('Slide Height (%s)', 'swiper-carousel-block'),
							deviceType
						)}
						value={currentSlideHeight}
						onChange={(value) =>
							setAttributes({
								slideHeight: {
									...(normalizedSlideHeight || {}),
									[deviceType]: {
										...(normalizedSlideHeight?.[deviceType] || {}),
										value,
									},
								},
							})
						}
						min={0}
						max={1000}
						step={10}
					/>
					<BaseControl label={__('Unit', 'swiper-carousel-block')}>
						<ButtonGroup>
							{['px', 'vh', 'vw', 'rem', '%'].map((u) => (
								<Button
									key={u}
									isSmall
									isPrimary={currentSlideHeightUnit === u}
									onClick={() =>
										setAttributes({
											slideHeight: {
												...(normalizedSlideHeight || {}),
												[deviceType]: {
													...(normalizedSlideHeight?.[deviceType] || {}),
													unit: u,
												},
											},
										})
									}
								>
									{u}
								</Button>
							))}
						</ButtonGroup>
					</BaseControl>
				</PanelBody>

				<PanelBody title={__('Container', 'swiper-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Mode', 'swiper-carousel-block')}</p>
					<ButtonGroup style={{ marginBottom: '16px' }}>
						{[
							{ label: __('Full Width', 'swiper-carousel-block'), value: 'full' },
							{ label: __('Constrained', 'swiper-carousel-block'), value: 'constrained' },
						].map((opt) => (
							<Button
								key={opt.value}
								isPrimary={containerMode === opt.value}
								isSecondary={containerMode !== opt.value}
								onClick={() => setAttributes({ containerMode: opt.value })}
							>
								{opt.label}
							</Button>
						))}
					</ButtonGroup>

					{containerMode === 'constrained' && (
						<>
							<p style={{ marginTop: 8, marginBottom: 8, fontWeight: 600 }}>
								{__('Max Width', 'swiper-carousel-block')}
							</p>
							<ButtonGroup style={{ marginBottom: 12, flexWrap: 'wrap' }}>
								<Button
									icon={mobile}
									isPrimary={deviceType === 'mobile'}
									onClick={() => setDeviceType('mobile')}
								/>
								<Button
									icon={tablet}
									isPrimary={deviceType === 'tablet'}
									onClick={() => setDeviceType('tablet')}
								/>
								<Button
									icon={tabletIcon}
									isPrimary={deviceType === 'tablet'}
									onClick={() => setDeviceType('tablet')}
								/>
								<Button
									icon={desktop}
									isPrimary={deviceType === 'desktop'}
									onClick={() => setDeviceType('desktop')}
								/>
								<Button
									icon={desktopIcon}
									isPrimary={deviceType === 'desktop'}
									onClick={() => setDeviceType('desktop')}
								/>
							</ButtonGroup>
							<div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
								<div style={{ flex: 1 }}>
									{(() => {
										const currentValObj = containerMaxWidth?.[deviceType] || {};
										const unit = currentValObj.unit ?? (deviceType === 'mobile' || deviceType === 'tablet' ? '%' : 'px');
										const rawValue = currentValObj.value ?? (deviceType === 'mobile' || deviceType === 'tablet' ? 100 : 1200);
										const min = unit === 'px' ? 200 : 10;
										const max = unit === 'px' ? 10000 : 100;

										return (
											<RangeControl
												value={rawValue}
												onChange={(newValue) =>
													setAttributes({
														containerMaxWidth: {
															...(containerMaxWidth || {}),
															[deviceType]: {
																...(containerMaxWidth?.[deviceType] || {}),
																value: newValue,
															},
														},
													})
												}
												min={min}
												max={max}
												step={unit === 'px' ? 10 : 1}
												withInputField={true}
                    />
										);
									})()}
								</div>
								<ButtonGroup>
									{['px', '%', 'rem', 'vw'].map((u) => (
										<Button
											key={u}
											isSmall
											isPrimary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === 'mobile' || deviceType === 'tablet' ? '%' : 'px')) === u
											}
											onClick={() =>
												setAttributes({
													containerMaxWidth: {
														...(containerMaxWidth || {}),
														[deviceType]: {
															...(containerMaxWidth?.[deviceType] || {}),
															unit: u,
														},
													},
												})
											}
										>
											{u}
										</Button>
									))}
								</ButtonGroup>
							</div>
						</>
					)}

					<RangeControl
						label={__('Margin Top', 'swiper-carousel-block')}
						value={marginTop}
						onChange={(value) => setAttributes({ marginTop: value })}
						min={0}
						max={120}
					/>
                        <RangeControl
						label={__('Margin Bottom', 'swiper-carousel-block')}
						value={marginBottom}
						onChange={(value) => setAttributes({ marginBottom: value })}
						min={0}
						max={120}
					/>
				</PanelBody>

				<PanelBody title={__('List Padding', 'swiper-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>
						{__('Padding Left', 'swiper-carousel-block')}
					</p>
					<ButtonGroup style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
						<Button
							icon={mobile}
							isPrimary={deviceType === 'mobile'}
							onClick={() => setDeviceType('mobile')}
						/>
						<Button
							icon={tablet}
							isPrimary={deviceType === 'tablet'}
							onClick={() => setDeviceType('tablet')}
						/>
						<Button
							icon={tabletIcon}
							isPrimary={deviceType === 'tablet'}
							onClick={() => setDeviceType('tablet')}
						/>
						<Button
							icon={desktop}
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						/>
						<Button
							icon={desktopIcon}
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						/>
					</ButtonGroup>
					<RangeControl
						label={sprintf(
							__('Padding Left (%s, px)', 'swiper-carousel-block'),
							deviceType
						)}
						value={currentListPaddingLeft}
						onChange={(value) => setResponsiveValue('listPaddingLeft', value)}
						min={0}
						max={200}
						step={1}
					/>
				</PanelBody>

				<PanelBody title={__('Drag Cursor', 'swiper-carousel-block')} initialOpen={false}>
					<TextControl
						label={__('Cursor Text', 'swiper-carousel-block')}
						value={dragCursorText}
						onChange={(value) => setAttributes({ dragCursorText: value })}
					/>
					<RangeControl
						label={__('Cursor Size', 'swiper-carousel-block')}
						value={dragCursorSize}
						onChange={(value) => setAttributes({ dragCursorSize: value })}
						min={40}
						max={150}
					/>
					<RangeControl
						label={__('Font Size', 'swiper-carousel-block')}
						value={dragCursorFontSize}
						onChange={(value) => setAttributes({ dragCursorFontSize: value })}
						min={10}
						max={32}
					/>
					<BaseControl label={__('Font Weight', 'swiper-carousel-block')}>
						<ButtonGroup>
							{['400', '500', '600', '700'].map((w) => (
								<Button
									key={w}
									isPrimary={dragCursorFontWeight === w}
									onClick={() => setAttributes({ dragCursorFontWeight: w })}
								>
									{w}
								</Button>
							))}
						</ButtonGroup>
					</BaseControl>
                    <SelectControl
						label={__('Text Transform', 'swiper-carousel-block')}
						value={dragCursorTextTransform}
                        options={[
							{ label: __('Uppercase', 'swiper-carousel-block'), value: 'uppercase' },
							{ label: __('Lowercase', 'swiper-carousel-block'), value: 'lowercase' },
							{ label: __('Capitalize', 'swiper-carousel-block'), value: 'capitalize' },
							{ label: __('None', 'swiper-carousel-block'), value: 'none' },
						]}
						onChange={(value) => setAttributes({ dragCursorTextTransform: value })}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__('Drag Cursor Colors', 'swiper-carousel-block')}
					colorSettings={[
						{
							label: __('Cursor Background', 'swiper-carousel-block'),
							value: dragCursorBgColor,
							onChange: (value) => setAttributes({ dragCursorBgColor: value }),
						},
						{
							label: __('Cursor Text', 'swiper-carousel-block'),
							value: dragCursorColor,
							onChange: (value) => setAttributes({ dragCursorColor: value }),
						},
					]}
				/>

				<PanelBody title={__('Pagination', 'swiper-carousel-block')} initialOpen={false}>
					<ToggleControl
						label={__('Show Pagination', 'swiper-carousel-block')}
						checked={paginationVisible}
						onChange={(value) => setAttributes({ paginationVisible: value })}
					/>
					{paginationVisible && (
						<PanelColorSettings
							title={__('Pagination Colors', 'swiper-carousel-block')}
							colorSettings={[
								{
									label: __('Active Indicator', 'swiper-carousel-block'),
									value: paginationActiveColor,
									onChange: (value) => setAttributes({ paginationActiveColor: value }),
								},
								{
									label: __('Inactive Indicator', 'swiper-carousel-block'),
									value: paginationInactiveColor,
									onChange: (value) => setAttributes({ paginationInactiveColor: value }),
								},
							]}
                    />
					)}
				</PanelBody>

				<PanelBody title={__('Styling', 'swiper-carousel-block')} initialOpen={false}>
                    <RangeControl
						label={__('Border Radius (px)', 'swiper-carousel-block')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                    />
                </PanelBody>
            </InspectorTabs>

			<div {...blockProps}>
				<QuickZone
					id="layout"
					label={__('Layout', 'swiper-carousel-block')}
					activeZone={activeZone}
					setActiveZone={setActiveZone}
					content={
						<>
							<RangeControl
								label={__('Gap Between Cards', 'swiper-carousel-block')}
								value={cardGap}
								onChange={(value) => setAttributes({ cardGap: value })}
								min={4}
								max={48}
								step={2}
							/>
							<RangeControl
								label={__('Slides Per View (Desktop)', 'swiper-carousel-block')}
								value={slidesPerView?.desktop ?? 4}
								onChange={(value) =>
									setAttributes({
										slidesPerView: { ...slidesPerView, desktop: value },
									})
								}
								min={1}
								max={12}
							/>
						</>
					}
				>
					<div
						className={`adaire-swiper-carousel__container ${
							containerMode === 'constrained' ? 'is-constrained' : ''
						}`}
					>
						<div className="adaire-swiper-carousel__wrapper">
							<div className="adaire-swiper-carousel__swiper swiper">
								<div className="adaire-swiper-carousel__list swiper-wrapper">
                <InnerBlocks
                    allowedBlocks={ALLOWED_BLOCKS}
                    template={[['adaire/swiper-slide']]}
                    templateLock={false}
                    renderAppender={InnerBlocks.ButtonBlockAppender}
                />
							</div>
							{paginationVisible === true && (
								<div className="swiper-pagination adaire-swiper-carousel__pagination" />
							)}
						</div>
					</div>
				</div>
				</QuickZone>

				{/* Drag cursor preview in editor */}
				<div className="adaire-swiper-carousel__drag-cursor adaire-swiper-carousel__drag-cursor--preview">
					{dragCursorText}
            </div>
        </div>
		</>
    );
};

export default Edit;



