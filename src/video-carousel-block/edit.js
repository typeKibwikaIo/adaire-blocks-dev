import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
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
import { desktop, tablet, mobile, plus, trash, chevronUp, chevronDown } from '@wordpress/icons';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import BootstrapIconPicker from '../icon-box-block/BootstrapIconPicker';

const Edit = ({ attributes, setAttributes, clientId }) => {
	const {
		blockId,
		items,
		cardHeight,
		cardGap,
		slidesPerView,
		loop,
		mobilePeekPercent,
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
		metaTextAlign,
		responsiveMetaTextAlign,
		nameFontSize,
		responsiveNameFontSize,
		positionFontSize,
		responsivePositionFontSize,
		nameColor,
		positionColor,
		socialIconSize,
		responsiveSocialIconSize,
		socialIconColor,
		socialIconHoverColor,
		metaBgColor,
	} = attributes;

	const normalizeDimension = (dimension, defaults) => {
		// Legacy: number => px
		if (typeof dimension === 'number') {
			return { value: dimension, unit: 'px' };
		}
		if (typeof dimension === 'object' && dimension !== null) {
			return {
				value: dimension?.value ?? defaults.value,
				unit: dimension?.unit ?? defaults.unit,
			};
		}
		return defaults;
	};

	// Supports legacy numeric values and new { value, unit } values for responsive dimensions
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

	const cardHeightDefaults = {
		desktop: { value: 460, unit: 'px' },
		tablet: { value: 400, unit: 'px' },
		mobile: { value: 350, unit: 'px' },
		smartwatch: { value: 300, unit: 'px' },
	};
	const normalizedCardHeight = normalizeResponsiveDimension(cardHeight, cardHeightDefaults);
	const currentCardHeight = normalizedCardHeight?.[deviceType]?.value ?? cardHeightDefaults[deviceType].value;
	const currentCardHeightUnit = normalizedCardHeight?.[deviceType]?.unit ?? cardHeightDefaults[deviceType].unit;

	const [deviceType, setDeviceType] = useState('desktop');
	const [iconPicker, setIconPicker] = useState({ itemId: null, slot: null });

	// Helpers for responsive values (per breakpoint) - using DeviceSwitcher helpers
	const getResponsiveValue = (obj, fallback) => {
		return getDeviceValue(obj, deviceType, fallback);
	};

	const setResponsiveValue = (key, value) => {
		setAttributes({
			[key]: updateDeviceAttribute(attributes[key], deviceType, value),
		});
	};

	const currentMetaTextAlign = getResponsiveValue(
		responsiveMetaTextAlign,
		metaTextAlign || 'left'
	);
	const currentNameFontSize = getResponsiveValue(
		responsiveNameFontSize,
		nameFontSize || 16
	);
	const currentPositionFontSize = getResponsiveValue(
		responsivePositionFontSize,
		positionFontSize || 14
	);
	const currentSocialIconSize = getResponsiveValue(
		responsiveSocialIconSize,
		socialIconSize || 18
	);
	const currentListPaddingLeft = getResponsiveValue(
		listPaddingLeft,
		10
	);

	// Generate block ID on mount
	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: `video-carousel-${clientId}` });
		}
	}, [clientId, blockId, setAttributes]);

	const blockProps = useBlockProps({
		className: 'adaire-video-carousel',
		style: {
			'--adaire-video-carousel-card-height': `${normalizedCardHeight.desktop.value}${normalizedCardHeight.desktop.unit}`,
			'--adaire-video-carousel-card-height-tablet': `${normalizedCardHeight.tablet.value}${normalizedCardHeight.tablet.unit}`,
			'--adaire-video-carousel-card-height-mobile': `${normalizedCardHeight.mobile.value}${normalizedCardHeight.mobile.unit}`,
			'--adaire-video-carousel-card-height-watch': `${normalizedCardHeight.smartwatch.value}${normalizedCardHeight.smartwatch.unit}`,
			'--adaire-video-carousel-gap': `${getDeviceValue(cardGap, 'desktop', 24)}px`,
			'--adaire-video-carousel-gap-tablet': `${getDeviceValue(cardGap, 'tablet', 20)}px`,
			'--adaire-video-carousel-gap-mobile': `${getDeviceValue(cardGap, 'mobile', 16)}px`,
			'--adaire-video-carousel-gap-watch': `${getDeviceValue(cardGap, 'smartwatch', 12)}px`,
			'--adaire-video-carousel-slides-per-view-desktop': `${slidesPerView?.desktop ?? 4}`,
			'--adaire-video-carousel-slides-per-view-tablet': `${slidesPerView?.tablet ?? 3}`,
			'--adaire-video-carousel-slides-per-view-mobile': `${slidesPerView?.mobile ?? 2}`,
			'--adaire-video-carousel-slides-per-view-watch': `${slidesPerView?.smartwatch ?? 1}`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			'--container-max-width-watch': `${containerMaxWidth?.smartwatch?.value ?? 100}${containerMaxWidth?.smartwatch?.unit ?? '%'}`,
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
			'--adaire-video-carousel-drag-cursor-size': `${getDeviceValue(dragCursorSize, 'desktop', 80)}px`,
			'--adaire-video-carousel-drag-cursor-size-tablet': `${getDeviceValue(dragCursorSize, 'tablet', 70)}px`,
			'--adaire-video-carousel-drag-cursor-size-mobile': `${getDeviceValue(dragCursorSize, 'mobile', 60)}px`,
			'--adaire-video-carousel-drag-cursor-size-watch': `${getDeviceValue(dragCursorSize, 'smartwatch', 50)}px`,
			'--adaire-video-carousel-drag-cursor-font-size': `${getDeviceValue(dragCursorFontSize, 'desktop', 16)}px`,
			'--adaire-video-carousel-drag-cursor-font-size-tablet': `${getDeviceValue(dragCursorFontSize, 'tablet', 14)}px`,
			'--adaire-video-carousel-drag-cursor-font-size-mobile': `${getDeviceValue(dragCursorFontSize, 'mobile', 12)}px`,
			'--adaire-video-carousel-drag-cursor-font-size-watch': `${getDeviceValue(dragCursorFontSize, 'smartwatch', 10)}px`,
			'--adaire-video-carousel-drag-cursor-font-weight': dragCursorFontWeight,
			'--adaire-video-carousel-drag-cursor-color': dragCursorColor,
			'--adaire-video-carousel-drag-cursor-bg': dragCursorBgColor,
			'--adaire-video-carousel-drag-cursor-text-transform': dragCursorTextTransform,
			'--adaire-video-carousel-meta-align-desktop': getDeviceValue(responsiveMetaTextAlign, 'desktop', metaTextAlign || 'left'),
			'--adaire-video-carousel-meta-align-tablet': getDeviceValue(responsiveMetaTextAlign, 'tablet', metaTextAlign || 'left'),
			'--adaire-video-carousel-meta-align-mobile': getDeviceValue(responsiveMetaTextAlign, 'mobile', metaTextAlign || 'left'),
			'--adaire-video-carousel-meta-align-watch': getDeviceValue(responsiveMetaTextAlign, 'smartwatch', metaTextAlign || 'left'),
			'--adaire-video-carousel-name-font-size-desktop': `${getDeviceValue(responsiveNameFontSize, 'desktop', nameFontSize || 20)}px`,
			'--adaire-video-carousel-name-font-size-tablet': `${getDeviceValue(responsiveNameFontSize, 'tablet', nameFontSize || 18)}px`,
			'--adaire-video-carousel-name-font-size-mobile': `${getDeviceValue(responsiveNameFontSize, 'mobile', nameFontSize || 16)}px`,
			'--adaire-video-carousel-name-font-size-watch': `${getDeviceValue(responsiveNameFontSize, 'smartwatch', nameFontSize || 14)}px`,
			'--adaire-video-carousel-position-font-size-desktop': `${getDeviceValue(responsivePositionFontSize, 'desktop', positionFontSize || 18)}px`,
			'--adaire-video-carousel-position-font-size-tablet': `${getDeviceValue(responsivePositionFontSize, 'tablet', positionFontSize || 16)}px`,
			'--adaire-video-carousel-position-font-size-mobile': `${getDeviceValue(responsivePositionFontSize, 'mobile', positionFontSize || 14)}px`,
			'--adaire-video-carousel-position-font-size-watch': `${getDeviceValue(responsivePositionFontSize, 'smartwatch', positionFontSize || 12)}px`,
			'--adaire-video-carousel-name-color': nameColor || '#ffffff',
			'--adaire-video-carousel-position-color': positionColor || '#d1d5db',
			'--adaire-video-carousel-meta-bg': metaBgColor || 'rgba(15, 23, 42, 0.9)',
			'--adaire-video-carousel-social-icon-size-desktop': `${getDeviceValue(responsiveSocialIconSize, 'desktop', socialIconSize || 20)}px`,
			'--adaire-video-carousel-social-icon-size-tablet': `${getDeviceValue(responsiveSocialIconSize, 'tablet', socialIconSize || 18)}px`,
			'--adaire-video-carousel-social-icon-size-mobile': `${getDeviceValue(responsiveSocialIconSize, 'mobile', socialIconSize || 18)}px`,
			'--adaire-video-carousel-social-icon-size-watch': `${getDeviceValue(responsiveSocialIconSize, 'smartwatch', socialIconSize || 16)}px`,
			'--adaire-video-carousel-social-icon-color': socialIconColor || '#ffffff',
			'--adaire-video-carousel-social-icon-hover-color': socialIconHoverColor || '#e5e7eb',
		},
	});

	const addItem = () => {
		const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
		const newItem = {
			id: newId,
			title: __('New video', 'video-carousel-block'),
			videoUrl: '',
			posterUrl: '',
		};
		setAttributes({ items: [...items, newItem] });
	};

	const updateItem = (id, field, value) => {
		const updated = items.map((item) =>
			item.id === id ? { ...item, [field]: value } : item
		);
		setAttributes({ items: updated });
	};

	const deleteItem = (id) => {
		const updated = items.filter((item) => item.id !== id);
		setAttributes({ items: updated });
	};

	const openIconPicker = (itemId, slot) => {
		setIconPicker({ itemId, slot });
	};

	const handleIconSelect = (iconClass) => {
		if (!iconPicker.itemId || !iconPicker.slot) return;
		const field = `${iconPicker.slot}IconClass`;
		const updated = items.map((item) =>
			item.id === iconPicker.itemId ? { ...item, [field]: iconClass } : item
		);
		setAttributes({ items: updated });
		setIconPicker({ itemId: null, slot: null });
	};

	const moveItem = (index, direction) => {
		const newItems = [...items];
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= items.length) return;
		[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
		setAttributes({ items: newItems });
	};

	return (
		<>
			<InspectorControls>
				<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} />
				<PanelBody title={__('Videos', 'video-carousel-block')} initialOpen={true}>
					<Button
						variant="primary"
						icon={plus}
						onClick={addItem}
						style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }}
					>
						{__('Add Video', 'video-carousel-block')}
					</Button>

					{items.map((item, index) => (
						<div
							key={item.id}
							style={{
								border: '1px solid #ddd',
								borderRadius: 4,
								padding: 12,
								marginBottom: 12,
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: 8,
								}}
							>
								<strong>{sprintf(__('Video %d', 'video-carousel-block'), index + 1)}</strong>
								<div style={{ display: 'flex', gap: 4 }}>
									<Button
										icon={chevronUp}
										size="small"
										onClick={() => moveItem(index, -1)}
										disabled={index === 0}
									/>
									<Button
										icon={chevronDown}
										size="small"
										onClick={() => moveItem(index, 1)}
										disabled={index === items.length - 1}
									/>
									<Button
										icon={trash}
										isDestructive
										size="small"
										onClick={() => deleteItem(item.id)}
									/>
								</div>
							</div>
							<TextControl
								label={__('Title / Name', 'video-carousel-block')}
								value={item.title}
								onChange={(value) => updateItem(item.id, 'title', value)}
							/>
							<TextControl
								label={__('Position', 'video-carousel-block')}
								value={item.position || ''}
								onChange={(value) => updateItem(item.id, 'position', value)}
							/>
							<div style={{ marginTop: 8, marginBottom: 8 }}>
								<p style={{ marginBottom: 4, fontWeight: 600 }}>
									{__('Video', 'video-carousel-block')}
								</p>
								<MediaUploadCheck>
									<MediaUpload
										onSelect={(media) => {
											const url =
												media?.url ||
												media?.source_url ||
												media?.media_details?.file ||
												'';
											const newItems = items.map((it) =>
												it.id === item.id
													? {
															...it,
															videoUrl: media ? url : '',
															videoId: media ? media.id || 0 : 0,
													  }
													: it
											);
											setAttributes({ items: newItems });
										}}
										allowedTypes={['video']}
										value={item.videoId}
										render={({ open }) => (
											<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
												<Button variant="secondary" onClick={open}>
													{item.videoUrl
														? __('Change video', 'video-carousel-block')
														: __('Select video', 'video-carousel-block')}
												</Button>
												{item.videoUrl && (
													<>
														<span style={{ fontSize: 11, color: '#16a34a' }}>
															{__('Video selected', 'video-carousel-block')}
														</span>
														<Button
															isDestructive
															variant="link"
															onClick={() => {
																const newItems = items.map((it) =>
																	it.id === item.id
																		? {
																				...it,
																				videoUrl: '',
																				videoId: 0,
																		  }
																		: it
																);
																setAttributes({ items: newItems });
															}}
														>
															{__('Remove', 'video-carousel-block')}
														</Button>
													</>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
								{item.videoUrl && (
									<p style={{ marginTop: 4, fontSize: 11, color: '#6b6b6b' }}>
										{item.videoUrl}
									</p>
								)}
							</div>

							<div style={{ marginTop: 8 }}>
								<p style={{ marginBottom: 4, fontWeight: 600 }}>
									{__('Poster Image (optional)', 'video-carousel-block')}
								</p>
								<MediaUploadCheck>
									<MediaUpload
										onSelect={(media) => {
											const url =
												media?.url ||
												media?.source_url ||
												media?.sizes?.full?.url ||
												'';
											const newItems = items.map((it) =>
												it.id === item.id
													? {
															...it,
															posterUrl: media ? url : '',
															posterId: media ? media.id || 0 : 0,
													  }
													: it
											);
											setAttributes({ items: newItems });
										}}
										allowedTypes={['image']}
										value={item.posterId}
										render={({ open }) => (
											<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
												<Button variant="secondary" onClick={open}>
													{item.posterUrl
														? __('Change poster', 'video-carousel-block')
														: __('Select poster', 'video-carousel-block')}
												</Button>
												{item.posterUrl && (
													<Button
														isDestructive
														variant="link"
														onClick={() => {
															const newItems = items.map((it) =>
																it.id === item.id
																	? {
																			...it,
																			posterUrl: '',
																			posterId: 0,
																	  }
																	: it
															);
															setAttributes({ items: newItems });
														}}
													>
														{__('Remove', 'video-carousel-block')}
													</Button>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
								{item.posterUrl && (
									<p style={{ marginTop: 4, fontSize: 11, color: '#6b6b6b' }}>
										{item.posterUrl}
									</p>
								)}
							</div>

							<div style={{ marginTop: 12 }}>
								<p style={{ marginBottom: 4, fontWeight: 600 }}>
									{__('Image-only card', 'video-carousel-block')}
								</p>
								<ToggleControl
									label={__('Use image instead of video', 'video-carousel-block')}
									checked={!!item.useImageOnly}
									onChange={(value) => {
										const newItems = items.map((it) => {
											if (it.id !== item.id) return it;
											const updated = {
												...it,
												useImageOnly: value,
											};
											// If switching to image-only, clear video/poster so only the image shows
											if (value) {
												updated.videoUrl = '';
												updated.videoId = 0;
												updated.posterUrl = '';
												updated.posterId = 0;
											}
											return updated;
										});
										setAttributes({ items: newItems });
									}}
									help={__(
										'When enabled, this card will render a static image instead of a video.',
										'video-carousel-block'
									)}
								/>
								{item.useImageOnly && (
									<div style={{ marginTop: 8 }}>
										<p style={{ marginBottom: 4, fontWeight: 600 }}>
											{__('Card Image', 'video-carousel-block')}
										</p>
										<MediaUploadCheck>
											<MediaUpload
												onSelect={(media) => {
													const url =
														media?.url ||
														media?.source_url ||
														media?.sizes?.full?.url ||
														media?.media_details?.sizes?.full?.source_url ||
														'';
													const newItems = items.map((it) =>
														it.id === item.id
															? {
																	...it,
																	imageUrl: media ? url : '',
																	imageId: media ? media.id || 0 : 0,
															  }
															: it
													);
													setAttributes({ items: newItems });
												}}
												allowedTypes={['image']}
												value={item.imageId}
												render={({ open }) => (
													<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
														<Button variant="secondary" onClick={open}>
															{item.imageUrl
																? __('Change image', 'video-carousel-block')
																: __('Select image', 'video-carousel-block')}
														</Button>
														{item.imageUrl && (
															<Button
																isDestructive
																variant="link"
																onClick={() => {
																	const newItems = items.map((it) =>
																		it.id === item.id
																			? {
																					...it,
																					imageUrl: '',
																					imageId: 0,
																			  }
																			: it
																	);
																	setAttributes({ items: newItems });
																}}
															>
																{__('Remove', 'video-carousel-block')}
															</Button>
														)}
													</div>
												)}
											/>
										</MediaUploadCheck>
										{item.imageUrl && (
											<p style={{ marginTop: 4, fontSize: 11, color: '#6b6b6b' }}>
												{item.imageUrl}
											</p>
										)}
									</div>
								)}
							</div>

							<div style={{ marginTop: 12 }}>
								<p style={{ marginBottom: 4, fontWeight: 600 }}>
									{__('Social Icons', 'video-carousel-block')}
								</p>
								<div style={{ marginBottom: 8 }}>
									<p style={{ marginBottom: 4 }}>
										{__('Icon 1', 'video-carousel-block')}
									</p>
									<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<Button
											variant="secondary"
											onClick={() => openIconPicker(item.id, 'social1')}
										>
											{item.social1IconClass ? (
												<>
													<i className={item.social1IconClass} style={{ marginRight: 6 }} />
													{__('Change icon', 'video-carousel-block')}
												</>
											) : (
												__('Select icon', 'video-carousel-block')
											)}
										</Button>
										{item.social1IconClass && (
											<span style={{ fontSize: 11, color: '#6b6b6b' }}>
												{item.social1IconClass}
											</span>
										)}
									</div>
								</div>
								<TextControl
									label={__('Icon 1 URL', 'video-carousel-block')}
									placeholder="https://"
									value={item.social1Url || ''}
									onChange={(value) => updateItem(item.id, 'social1Url', value)}
								/>
								<div style={{ marginBottom: 8 }}>
									<p style={{ marginBottom: 4 }}>
										{__('Icon 2', 'video-carousel-block')}
									</p>
									<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<Button
											variant="secondary"
											onClick={() => openIconPicker(item.id, 'social2')}
										>
											{item.social2IconClass ? (
												<>
													<i className={item.social2IconClass} style={{ marginRight: 6 }} />
													{__('Change icon', 'video-carousel-block')}
												</>
											) : (
												__('Select icon', 'video-carousel-block')
											)}
										</Button>
										{item.social2IconClass && (
											<span style={{ fontSize: 11, color: '#6b6b6b' }}>
												{item.social2IconClass}
											</span>
										)}
									</div>
								</div>
								<TextControl
									label={__('Icon 2 URL', 'video-carousel-block')}
									placeholder="https://"
									value={item.social2Url || ''}
									onChange={(value) => updateItem(item.id, 'social2Url', value)}
								/>
								<div style={{ marginBottom: 8 }}>
									<p style={{ marginBottom: 4 }}>
										{__('Icon 3', 'video-carousel-block')}
									</p>
									<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<Button
											variant="secondary"
											onClick={() => openIconPicker(item.id, 'social3')}
										>
											{item.social3IconClass ? (
												<>
													<i className={item.social3IconClass} style={{ marginRight: 6 }} />
													{__('Change icon', 'video-carousel-block')}
												</>
											) : (
												__('Select icon', 'video-carousel-block')
											)}
										</Button>
										{item.social3IconClass && (
											<span style={{ fontSize: 11, color: '#6b6b6b' }}>
												{item.social3IconClass}
											</span>
										)}
									</div>
								</div>
								<TextControl
									label={__('Icon 3 URL', 'video-carousel-block')}
									placeholder="https://"
									value={item.social3Url || ''}
									onChange={(value) => updateItem(item.id, 'social3Url', value)}
								/>
							</div>
						</div>
					))}
				</PanelBody>

				<PanelBody title={__('Layout', 'video-carousel-block')} initialOpen={false}>
					<RangeControl
						label={sprintf(
							__('Card Height (%s)', 'video-carousel-block'),
							normalizedCardHeight.unit || 'px'
						)}
						value={normalizedCardHeight.value}
						onChange={(value) =>
							setAttributes({
								cardHeight: {
									...(normalizedCardHeight || {}),
									value,
								},
							})
						}
						min={0}
						max={1000}
						step={5}
					/>
					<BaseControl label={__('Card Height Unit', 'video-carousel-block')}>
						<ButtonGroup>
							{['px', 'vh', 'vw', 'rem', '%', 'auto'].map((u) => (
								<Button
									key={u}
									isSmall
									isPrimary={(normalizedCardHeight.unit || 'px') === u}
									onClick={() =>
										setAttributes({
											cardHeight: {
												...(normalizedCardHeight || {}),
												unit: u,
											},
										})
									}
								>
									{u}
								</Button>
							))}
						</ButtonGroup>
					</BaseControl>
					<RangeControl
						label={__('Gap Between Cards', 'video-carousel-block')}
						value={cardGap}
						onChange={(value) => setAttributes({ cardGap: value })}
						min={4}
						max={48}
						step={2}
					/>

					<BaseControl label={__('Cards per view', 'video-carousel-block')}>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Big Desktop (â‰¥ 1921px)', 'video-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.bigDesktop ?? slidesPerView?.desktop ?? 5}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											bigDesktop: value,
										},
									})
								}
								min={1}
								max={12}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Desktop (1301â€“1920px)', 'video-carousel-block')}</strong>
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
							<strong>{__('Small Laptop (1025â€“1300px)', 'video-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.smallLaptop ?? slidesPerView?.desktop ?? 4}
								onChange={(value) =>
									setAttributes({
										slidesPerView: {
											...slidesPerView,
											smallLaptop: value,
										},
									})
								}
								min={1}
								max={12}
							/>
						</div>
						<div style={{ marginBottom: 8 }}>
							<strong>{__('Tablet (601â€“1024px)', 'video-carousel-block')}</strong>
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
							<strong>{__('Mobile (â‰¤ 600px)', 'video-carousel-block')}</strong>
							<RangeControl
								value={slidesPerView?.mobile ?? 2}
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
						label={__('Enable Loop', 'video-carousel-block')}
						checked={!!loop}
						onChange={(value) => setAttributes({ loop: value })}
						help={__('Enable infinite loop scrolling', 'video-carousel-block')}
					/>

					<RangeControl
						label={__('Mobile next card visibility (%)', 'video-carousel-block')}
						value={mobilePeekPercent ?? 20}
						onChange={(value) => setAttributes({ mobilePeekPercent: value })}
						min={0}
						max={50}
						step={5}
						help={__('How much of the next card should be visible on mobile.', 'video-carousel-block')}
					/>
				</PanelBody>

				<PanelBody title={__('Container', 'video-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Mode', 'video-carousel-block')}</p>
					<ButtonGroup style={{ marginBottom: '16px' }}>
						{[
							{ label: __('Full Width', 'video-carousel-block'), value: 'full' },
							{ label: __('Constrained', 'video-carousel-block'), value: 'constrained' },
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
								{__('Max Width', 'video-carousel-block')}
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
									icon={smallLaptopIcon}
									isPrimary={deviceType === 'smallLaptop'}
									onClick={() => setDeviceType('smallLaptop')}
								/>
								<Button
									icon={desktop}
									isPrimary={deviceType === 'desktop'}
									onClick={() => setDeviceType('desktop')}
								/>
								<Button
									icon={bigDesktopIcon}
									isPrimary={deviceType === 'bigDesktop'}
									onClick={() => setDeviceType('bigDesktop')}
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
						label={__('Margin Top', 'video-carousel-block')}
						value={marginTop}
						onChange={(value) => setAttributes({ marginTop: value })}
						min={0}
						max={120}
					/>
					<RangeControl
						label={__('Margin Bottom', 'video-carousel-block')}
						value={marginBottom}
						onChange={(value) => setAttributes({ marginBottom: value })}
						min={0}
						max={120}
					/>
				</PanelBody>

				<PanelBody title={__('List Padding', 'video-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>
						{__('Padding Left', 'video-carousel-block')}
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
							icon={smallLaptopIcon}
							isPrimary={deviceType === 'smallLaptop'}
							onClick={() => setDeviceType('smallLaptop')}
						/>
						<Button
							icon={desktop}
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						/>
						<Button
							icon={bigDesktopIcon}
							isPrimary={deviceType === 'bigDesktop'}
							onClick={() => setDeviceType('bigDesktop')}
						/>
					</ButtonGroup>
					<RangeControl
						label={sprintf(
							__('Padding Left (%s, px)', 'video-carousel-block'),
							deviceType
						)}
						value={currentListPaddingLeft}
						onChange={(value) => setResponsiveValue('listPaddingLeft', value)}
						min={0}
						max={200}
						step={1}
					/>
				</PanelBody>

				<PanelBody title={__('Drag Cursor', 'video-carousel-block')} initialOpen={false}>
					<TextControl
						label={__('Cursor Text', 'video-carousel-block')}
						value={dragCursorText}
						onChange={(value) => setAttributes({ dragCursorText: value })}
					/>
					<RangeControl
						label={__('Cursor Size', 'video-carousel-block')}
						value={dragCursorSize}
						onChange={(value) => setAttributes({ dragCursorSize: value })}
						min={40}
						max={150}
					/>
					<RangeControl
						label={__('Font Size', 'video-carousel-block')}
						value={dragCursorFontSize}
						onChange={(value) => setAttributes({ dragCursorFontSize: value })}
						min={10}
						max={32}
					/>
					<BaseControl label={__('Font Weight', 'video-carousel-block')}>
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
						label={__('Text Transform', 'video-carousel-block')}
						value={dragCursorTextTransform}
						options={[
							{ label: __('Uppercase', 'video-carousel-block'), value: 'uppercase' },
							{ label: __('Lowercase', 'video-carousel-block'), value: 'lowercase' },
							{ label: __('Capitalize', 'video-carousel-block'), value: 'capitalize' },
							{ label: __('None', 'video-carousel-block'), value: 'none' },
						]}
						onChange={(value) => setAttributes({ dragCursorTextTransform: value })}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__('Drag Cursor Colors', 'video-carousel-block')}
					colorSettings={[
						{
							label: __('Cursor Background', 'video-carousel-block'),
							value: dragCursorBgColor,
							onChange: (value) => setAttributes({ dragCursorBgColor: value }),
						},
						{
							label: __('Cursor Text', 'video-carousel-block'),
							value: dragCursorColor,
							onChange: (value) => setAttributes({ dragCursorColor: value }),
						},
					]}
				/>

				<PanelBody title={__('Meta Layout & Typography (Responsive)', 'video-carousel-block')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>
						{__('Breakpoint', 'video-carousel-block')}
					</p>
					<ButtonGroup style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
						<Button
							isPrimary={deviceType === 'mobile'}
							onClick={() => setDeviceType('mobile')}
						>
							{__('Mobile', 'video-carousel-block')}
						</Button>
						<Button
							isPrimary={deviceType === 'tablet'}
							onClick={() => setDeviceType('tablet')}
						>
							{__('Tablet', 'video-carousel-block')}
						</Button>
						<Button
							isPrimary={deviceType === 'smallLaptop'}
							onClick={() => setDeviceType('smallLaptop')}
						>
							{__('Small Laptop', 'video-carousel-block')}
						</Button>
						<Button
							isPrimary={deviceType === 'desktop'}
							onClick={() => setDeviceType('desktop')}
						>
							{__('Desktop', 'video-carousel-block')}
						</Button>
						<Button
							isPrimary={deviceType === 'bigDesktop'}
							onClick={() => setDeviceType('bigDesktop')}
						>
							{__('Big Desktop', 'video-carousel-block')}
						</Button>
					</ButtonGroup>
					<SelectControl
						label={sprintf(
							/* translators: %s is breakpoint name */
							__('Text Alignment (%s)', 'video-carousel-block'),
							deviceType
						)}
						value={currentMetaTextAlign}
						options={[
							{ label: __('Left', 'video-carousel-block'), value: 'left' },
							{ label: __('Center', 'video-carousel-block'), value: 'center' },
							{ label: __('Right', 'video-carousel-block'), value: 'right' },
						]}
						onChange={(value) => {
							setAttributes({ metaTextAlign: value });
							setResponsiveValue('responsiveMetaTextAlign', value);
						}}
					/>
					<RangeControl
						label={sprintf(
							__('Name Font Size (%s, px)', 'video-carousel-block'),
							deviceType
						)}
						value={currentNameFontSize}
						onChange={(value) => {
							setAttributes({ nameFontSize: value });
							setResponsiveValue('responsiveNameFontSize', value);
						}}
						min={10}
						max={40}
					/>
					<RangeControl
						label={sprintf(
							__('Position Font Size (%s, px)', 'video-carousel-block'),
							deviceType
						)}
						value={currentPositionFontSize}
						onChange={(value) => {
							setAttributes({ positionFontSize: value });
							setResponsiveValue('responsivePositionFontSize', value);
						}}
						min={8}
						max={32}
					/>
					<RangeControl
						label={sprintf(
							__('Social Icon Size (%s, px)', 'video-carousel-block'),
							deviceType
						)}
						value={currentSocialIconSize}
						onChange={(value) => {
							setAttributes({ socialIconSize: value });
							setResponsiveValue('responsiveSocialIconSize', value);
						}}
						min={10}
						max={40}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__('Meta Colors', 'video-carousel-block')}
					colorSettings={[
						{
							label: __('Meta Background', 'video-carousel-block'),
							value: metaBgColor,
							onChange: (value) => setAttributes({ metaBgColor: value }),
						},
						{
							label: __('Name Color', 'video-carousel-block'),
							value: nameColor,
							onChange: (value) => setAttributes({ nameColor: value }),
						},
						{
							label: __('Position Color', 'video-carousel-block'),
							value: positionColor,
							onChange: (value) => setAttributes({ positionColor: value }),
						},
						{
							label: __('Social Icon Color', 'video-carousel-block'),
							value: socialIconColor,
							onChange: (value) => setAttributes({ socialIconColor: value }),
						},
						{
							label: __('Social Icon Hover Color', 'video-carousel-block'),
							value: socialIconHoverColor,
							onChange: (value) => setAttributes({ socialIconHoverColor: value }),
						},
					]}
				/>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={`adaire-video-carousel__container ${
						containerMode === 'constrained' ? 'is-constrained' : ''
					}`}
				>
					<div className="adaire-video-carousel__wrapper">
						<div className="adaire-video-carousel__track">
							{items.map((item) => (
								<div
									key={item.id}
									className="adaire-video-carousel__slide"
								>
									<div className="adaire-video-carousel__card">
										<div className="adaire-video-carousel__video">
											{item.useImageOnly && item.imageUrl ? (
												<img
													src={item.imageUrl}
													alt={item.title || ''}
												/>
											) : item.videoUrl ? (
												<video
													src={item.videoUrl}
													poster={item.posterUrl || undefined}
													controls
												/>
											) : (
												<div className="adaire-video-carousel__placeholder">
													<span>{__('Add a video or image', 'video-carousel-block')}</span>
												</div>
											)}
										</div>
										{(item.title || item.position || item.social1Url || item.social2Url || item.social3Url) && (
											<div className="adaire-video-carousel__meta">
												<div className="adaire-video-carousel__meta-text">
													{item.title && (
														<p className="adaire-video-carousel__title">
															{item.title}
														</p>
													)}
													{item.position && (
														<p className="adaire-video-carousel__position">
															{item.position}
														</p>
													)}
												</div>
												<div className="adaire-video-carousel__meta-icons">
													{item.social1Url && item.social1IconClass && (
														<span title={item.social1Url}>
															<i className={item.social1IconClass} />
														</span>
													)}
													{item.social2Url && item.social2IconClass && (
														<span title={item.social2Url}>
															<i className={item.social2IconClass} />
														</span>
													)}
													{item.social3Url && item.social3IconClass && (
														<span title={item.social3Url}>
															<i className={item.social3IconClass} />
														</span>
													)}
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Drag cursor preview in editor */}
				<div className="adaire-video-carousel__drag-cursor adaire-video-carousel__drag-cursor--preview">
					{dragCursorText}
				</div>
			</div>

			{iconPicker.slot && (
				<BootstrapIconPicker
					isOpen={true}
					currentIcon={(() => {
						const item = items.find((it) => it.id === iconPicker.itemId);
						if (!item) return '';
						const field = `${iconPicker.slot}IconClass`;
						return item[field] || '';
					})()}
					onSelect={handleIconSelect}
					onClose={() => setIconPicker({ itemId: null, slot: null })}
				/>
			)}
		</>
	);
};

export default Edit;





