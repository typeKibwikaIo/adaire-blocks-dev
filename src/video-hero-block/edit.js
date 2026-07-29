import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	RangeControl,
	ButtonGroup,
	ToggleControl,
	SelectControl,
	ColorPicker,
	BaseControl
} from '@wordpress/components';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { THREE_TIERS } from '../components/DeviceSwitcher';

// Maps the shared DeviceSwitcher tier keys onto this block's flat, per-device
// attributes. Desktop uses the un-suffixed base attribute (e.g. titleFontSize),
// tablet/mobile use the "…Tablet"/"…Mobile" siblings — the exact shape save.js
// and view.js already read.
const DEVICE_SUFFIX = { desktop: '', tablet: 'Tablet', mobile: 'Mobile' };

// Per-device fallbacks, kept in sync with block.json defaults.
const DEVICE_DEFAULTS = {
	titleFontSize: { desktop: 48, tablet: 36, mobile: 28 },
	descriptionFontSize: { desktop: 18, tablet: 16, mobile: 14 },
	titleScrollingGap: { desktop: 300, tablet: 200, mobile: 150 },
};

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState('desktop');

	const {
		videos = [],
		transitionDuration = 8000,
		autoPlay = true,
		showControls = true,
		backgroundColor = "#000000",
		textColor = "#ffffff",
		titleFontSize = 48,
		titleFontSizeUnit = "px",
		titleFontWeight = "700",
		descriptionFontSize = 18,
		descriptionFontSizeUnit = "px",
		overlayOpacity = 0.3,
		navArrowLeftColor = "rgba(255, 255, 255, 0.7)",
		blockId,
		navArrowLeftColorHover = "rgba(255, 255, 255, 1)",
		navArrowRightColor = "rgba(138, 43, 226, 0.8)",
		navArrowRightColorHover = "rgba(138, 43, 226, 1)",
		navArrowLeftBgColor = "rgba(255, 255, 255, 0.1)",
		navArrowLeftBgColorHover = "rgba(255, 255, 255, 0.2)",
		navArrowRightBgColor = "rgba(255, 255, 255, 0.1)",
		navArrowRightBgColorHover = "rgba(255, 255, 255, 0.2)",
		navArrowLeftBgOpacity = 0.1,
		navArrowLeftBgOpacityHover = 0.2,
		navArrowRightBgOpacity = 0.1,
		navArrowRightBgOpacityHover = 0.2,
		navArrowLeftBgBlur = 0,
		navArrowLeftBgBlurHover = 0,
		navArrowRightBgBlur = 0,
		navArrowRightBgBlurHover = 0,
		titleScrollingSpeed = 100,
		overlayType = "solid",
		overlayGradientStart = "#ff0000",
		overlayGradientEnd = "#0000ff",
		overlayGradientDirection = "to bottom",
		overlayGradientStartOpacity = 0.5,
		overlayGradientEndOpacity = 0.3,
		cursorColor = "#ffffff",
		cursorBgColor = "#ffffff",
		cursorBgOpacity = 0.1
	} = attributes;

	// Read/write the active breakpoint's flat attribute for a given base name.
	const getDeviceAttr = (base) => {
		const key = base + DEVICE_SUFFIX[deviceType];
		return attributes[key] ?? DEVICE_DEFAULTS[base]?.[deviceType];
	};
	const setDeviceAttr = (base, value) => {
		const key = base + DEVICE_SUFFIX[deviceType];
		setAttributes({ [key]: value });
	};

	// Helper function to convert hex color to RGB and apply opacity (same as save.js)
	const applyOpacityToColor = (colorString, opacity) => {
		if (!colorString) return `rgba(255, 255, 255, ${opacity})`;

		// Handle hex colors (e.g., #ff0000 or #f00)
		if (colorString.startsWith('#')) {
			const hex = colorString.replace('#', '');
			let r, g, b;

			if (hex.length === 3) {
				// Short hex format (#f00)
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 6) {
				// Full hex format (#ff0000)
				r = parseInt(hex.substr(0, 2), 16);
				g = parseInt(hex.substr(2, 2), 16);
				b = parseInt(hex.substr(4, 2), 16);
			} else {
				// Invalid hex, fallback
				return `rgba(255, 255, 255, ${opacity})`;
			}

			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}

		// Handle existing rgba/rgb strings
		const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (match) {
			const r = match[1];
			const g = match[2];
			const b = match[3];
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}

		// Fallback if parsing fails
		return `rgba(255, 255, 255, ${opacity})`;
	};

	// Helper function to generate overlay background (same as save.js)
	const getOverlayBackground = () => {
		if (overlayType === 'gradient') {
			const startColor = applyOpacityToColor(overlayGradientStart, overlayGradientStartOpacity || 0.5);
			const endColor = applyOpacityToColor(overlayGradientEnd, overlayGradientEndOpacity || 0.3);
			return `linear-gradient(${overlayGradientDirection || 'to bottom'}, ${startColor}, ${endColor})`;
		} else {
			return `rgba(0, 0, 0, ${overlayOpacity || 0.3})`;
		}
	};

	// Ensure videos are properly initialized
	useEffect(() => {
		// Always set videos if they don't exist or are empty
		if (!videos || videos.length === 0) {
			const defaultVideos = [
				{
					id: 1,
					title: "Premium whitelabel design",
					description: "Watch this incredible video showcasing our latest work and creative process.",
					videoUrl: "https://vimeo.com/1118056227",
					videoType: "vimeo",
					thumbnail: "",
					thumbnailId: 0,
					autoplay: true,
					muted: true,
					useImage: false,
					imageUrl: "",
					imageId: 0
				},
				{
					id: 2,
					title: "Bring your ideas to life",
					description: "Explore our creative journey and see how we bring ideas to life through innovative design.",
					videoUrl: "https://youtu.be/vhpOhHEhVOg",
					videoType: "youtube",
					thumbnail: "",
					thumbnailId: 0,
					autoplay: true,
					muted: true,
					useImage: false,
					imageUrl: "",
					imageId: 0
				},
				{
					id: 3,
					title: "Award Winning Design",
					description: "Get an exclusive look behind the scenes of our creative process and team collaboration.",
					videoUrl: "https://youtu.be/iUtnZpzkbG8",
					videoType: "youtube",
					thumbnail: "",
					thumbnailId: 0,
					autoplay: true,
					muted: true,
					useImage: false,
					imageUrl: "",
					imageId: 0
				}
			];
			setAttributes({ videos: defaultVideos });
		} else {
			// Force a save to ensure videos are persisted by making a small change
			// Add a timestamp to force a change and trigger save
			const videosWithTimestamp = videos.map(video => ({
				...video,
				_lastModified: Date.now()
			}));
			setAttributes({ videos: videosWithTimestamp });
		}
	}, []); // Empty dependency array - only run once on mount


	// Helper function to extract video ID from URL
	const getVideoId = (url, type) => {
		if (type === 'youtube') {
			const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
			return match ? match[1] : '';
		} else if (type === 'vimeo') {
			const match = url.match(/(?:vimeo\.com\/)([0-9]+)/);
			return match ? match[1] : '';
		}
		return '';
	};

	// Helper function to get thumbnail URL
	const getThumbnailUrl = (videoId, type) => {
		if (type === 'youtube') {
			return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
		} else if (type === 'vimeo') {
			// Vimeo requires API call for thumbnails, so we'll use a placeholder
			return '';
		}
		return '';
	};

	const updateVideo = (index, field, value) => {
		const currentVideos = videos || [];
		const newVideos = [...currentVideos];

		// Ensure the video exists
		if (!newVideos[index]) {
			newVideos[index] = {
				id: index + 1,
				title: "New Video",
				description: "Add your video description here.",
				videoUrl: "",
				videoType: "youtube",
				thumbnail: "",
				thumbnailId: 0,
				autoplay: true,
				muted: true,
				useImage: false,
				imageUrl: "",
				imageId: 0
			};
		}

		// Update the specific field
		newVideos[index][field] = value;

		// Auto-update thumbnail for YouTube videos
		if (field === 'videoUrl' && newVideos[index].videoType === 'youtube') {
			const videoId = getVideoId(value, 'youtube');
			if (videoId) {
				newVideos[index].thumbnail = getThumbnailUrl(videoId, 'youtube');
			}
		}

		setAttributes({ videos: newVideos });
	};

	const addVideo = () => {
		const newVideo = {
			id: (videos ? videos.length : 0) + 1,
			title: "New Video",
			description: "Add your video description here.",
			videoUrl: "",
			videoType: "youtube",
			thumbnail: "",
			thumbnailId: 0,
			autoplay: true,
			muted: true,
			useImage: false,
			imageUrl: "",
			imageId: 0
		};

		const newVideos = [...(videos || []), newVideo];
		setAttributes({ videos: newVideos });
	};

	const removeVideo = (index) => {
		if (videos && videos.length > 1) {
			const newVideos = videos.filter((_, i) => i !== index);
			setAttributes({ videos: newVideos });
		}
	};

	const moveVideoUp = (index) => {
		if (index > 0 && videos) {
			const newVideos = [...videos];
			const temp = newVideos[index];
			newVideos[index] = newVideos[index - 1];
			newVideos[index - 1] = temp;
			setAttributes({ videos: newVideos });
		}
	};

	const moveVideoDown = (index) => {
		if (index < (videos ? videos.length - 1 : 0) && videos) {
			const newVideos = [...videos];
			const temp = newVideos[index];
			newVideos[index] = newVideos[index + 1];
			newVideos[index + 1] = temp;
			setAttributes({ videos: newVideos });
		}
	};

	const deviceLabel = THREE_TIERS.find((t) => t.key === deviceType)?.label || 'Desktop';

	const fontSizeUnitOptions = [
		{ label: 'px', value: 'px' },
		{ label: 'em', value: 'em' },
		{ label: 'rem', value: 'rem' },
		{ label: '%', value: '%' },
		{ label: 'vw', value: 'vw' },
		{ label: 'vh', value: 'vh' }
	];

	return (
		<div {...useBlockProps()} style={{ height: "95vh" }}>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>
				{/* ---------------- CONTENT ---------------- */}
				{(videos || []).map((video, index) => (
					<PanelBody
						section="content"
						key={index}
						title={__('Video', 'adaire-blocks') + ' ' + (index + 1)}
						initialOpen={index === 0}
					>
						<TextControl
							label={__('Video Title', 'adaire-blocks')}
							value={video.title || ''}
							onChange={(value) => updateVideo(index, 'title', value)}
						/>

						<TextareaControl
							label={__('Video Description', 'adaire-blocks')}
							value={video.description || ''}
							onChange={(value) => updateVideo(index, 'description', value)}
						/>

						<SelectControl
							label={__('Video Type', 'adaire-blocks')}
							value={video.videoType || 'youtube'}
							options={[
								{ label: 'YouTube', value: 'youtube' },
								{ label: 'Vimeo', value: 'vimeo' },
								{ label: __('WordPress (Media Library)', 'adaire-blocks'), value: 'wordpress' }
							]}
							onChange={(value) => updateVideo(index, 'videoType', value)}
						/>

						{video.videoType === 'wordpress' ? (
							<BaseControl label={__('Video File', 'adaire-blocks')}>
								<MediaUploadCheck>
									<MediaUpload
										onSelect={(media) => updateVideo(index, 'videoUrl', media.url)}
										allowedTypes={['video']}
										render={({ open }) => (
											<div className="video-upload-control">
												{video.videoUrl ? (
													<>
														<video
															src={video.videoUrl}
															muted
															style={{ maxWidth: '100%', maxHeight: '160px', display: 'block', marginBottom: '8px' }}
														/>
														<Button onClick={open} variant="secondary">
															{__('Replace Video', 'adaire-blocks')}
														</Button>
														<Button
															onClick={() => updateVideo(index, 'videoUrl', '')}
															variant="link"
															isDestructive
															style={{ marginLeft: '8px' }}
														>
															{__('Remove', 'adaire-blocks')}
														</Button>
													</>
												) : (
													<Button onClick={open} variant="primary">
														{__('Select Video', 'adaire-blocks')}
													</Button>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
							</BaseControl>
						) : (
							<TextControl
								label={__('Video URL', 'adaire-blocks')}
								value={video.videoUrl || ''}
								onChange={(value) => updateVideo(index, 'videoUrl', value)}
								help={__('Enter YouTube or Vimeo URL', 'adaire-blocks')}
							/>
						)}

						<ToggleControl
							label={__('Autoplay', 'adaire-blocks')}
							checked={video.autoplay !== false}
							onChange={(value) => updateVideo(index, 'autoplay', value)}
						/>

						<ToggleControl
							label={__('Muted', 'adaire-blocks')}
							checked={video.muted !== false}
							onChange={(value) => updateVideo(index, 'muted', value)}
						/>

						<ToggleControl
							label={__('Use Static Image Instead of Video', 'adaire-blocks')}
							checked={video.useImage === true}
							onChange={(value) => updateVideo(index, 'useImage', value)}
							help={__('Toggle to use a static background image instead of video', 'adaire-blocks')}
						/>

						{video.useImage && (
							<>
								<BaseControl label={__('Background Image', 'adaire-blocks')}>
									<MediaUploadCheck>
										<MediaUpload
											onSelect={(media) => {
												updateVideo(index, 'imageUrl', media.url);
												updateVideo(index, 'imageId', media.id);
											}}
											allowedTypes={['image']}
											value={video.imageId || 0}
											render={({ open }) => (
												<div className="image-upload-control">
													{video.imageUrl ? (
														<div className="image-preview">
															<img src={video.imageUrl} alt="Background" style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px' }} />
															<Button onClick={open} variant="secondary" style={{ marginTop: '10px' }}>
																{__('Change Image', 'adaire-blocks')}
															</Button>
															<Button
																onClick={() => {
																	updateVideo(index, 'imageUrl', '');
																	updateVideo(index, 'imageId', 0);
																}}
																variant="link"
																isDestructive
																style={{ marginTop: '5px' }}
															>
																{__('Remove Image', 'adaire-blocks')}
															</Button>
														</div>
													) : (
														<Button onClick={open} variant="primary">
															{__('Select Background Image', 'adaire-blocks')}
														</Button>
													)}
												</div>
											)}
										/>
									</MediaUploadCheck>
								</BaseControl>
							</>
						)}

						<div className="video-controls">
							{(videos && videos.length > 1) && (
								<>
									<div className="reorder-controls">
										<ButtonGroup>
											<Button
												onClick={() => moveVideoUp(index)}
												disabled={index === 0}
												label={__('Move Up', 'adaire-blocks')}
											>
												↑ {__('Up', 'adaire-blocks')}
											</Button>
											<Button
												onClick={() => moveVideoDown(index)}
												disabled={index === (videos ? videos.length - 1 : 0)}
												label={__('Move Down', 'adaire-blocks')}
											>
												↓ {__('Down', 'adaire-blocks')}
											</Button>
										</ButtonGroup>
									</div>
									<Button isDestructive onClick={() => removeVideo(index)}>
										{__('Remove Video', 'adaire-blocks')}
									</Button>
								</>
							)}
						</div>
					</PanelBody>
				))}

				<PanelBody section="content" title={__('Add New Video', 'adaire-blocks')}>
					<Button isPrimary onClick={addVideo}>
						{__('Add Video', 'adaire-blocks')}
					</Button>
				</PanelBody>

				<PanelBody section="content" title={__('Block Settings', 'adaire-blocks')} initialOpen={false}>
					<TextControl
						label={__('Block ID', 'adaire-blocks')}
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help={__('Add a custom ID to this block for CSS targeting or anchor links.', 'adaire-blocks')}
					/>
				</PanelBody>

				{/* ---------------- LAYOUT ---------------- */}
				<PanelBody section="layout" title={__('Video Slider Settings', 'adaire-blocks')} initialOpen={true}>
					<RangeControl
						label={__('Transition Duration (ms)', 'adaire-blocks')}
						value={transitionDuration}
						onChange={(value) => setAttributes({ transitionDuration: value })}
						min={3000}
						max={25000}
						step={500}
					/>
					<ToggleControl
						label={__('Auto Play', 'adaire-blocks')}
						checked={autoPlay}
						onChange={(value) => setAttributes({ autoPlay: value })}
					/>
					<ToggleControl
						label={__('Show Controls', 'adaire-blocks')}
						checked={showControls}
						onChange={(value) => setAttributes({ showControls: value })}
					/>
				</PanelBody>

				{/* ---------------- STYLE ---------------- */}
				<PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={true}>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__('Breakpoint', 'adaire-blocks')}
						tiers={THREE_TIERS}
					/>
					<p style={{ marginBottom: '12px', fontSize: '12px', color: '#757575' }}>
						{__('Editing:', 'adaire-blocks')} {deviceLabel} — {__('the editor preview shows desktop.', 'adaire-blocks')}
					</p>

					<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
						<div style={{ flex: 1 }}>
							<TextControl
								label={__('Title Font Size', 'adaire-blocks')}
								type="number"
								value={getDeviceAttr('titleFontSize')}
								onChange={(value) => {
									if (value === '') {
										setDeviceAttr('titleFontSize', '');
									} else {
										const num = parseFloat(value);
										if (!isNaN(num)) {
											setDeviceAttr('titleFontSize', num);
										}
									}
								}}
								min={12}
								max={120}
								step={1}
							/>
						</div>
						<div style={{ flex: '0 0 auto' }}>
							<SelectControl
								value={titleFontSizeUnit}
								onChange={(value) => setAttributes({ titleFontSizeUnit: value })}
								options={fontSizeUnitOptions}
							/>
						</div>
					</div>

					<SelectControl
						label={__('Title Font Weight', 'adaire-blocks')}
						value={titleFontWeight}
						onChange={(value) => setAttributes({ titleFontWeight: value })}
						options={[
							{ label: __('Light (300)', 'adaire-blocks'), value: '300' },
							{ label: __('Normal (400)', 'adaire-blocks'), value: '400' },
							{ label: __('Medium (500)', 'adaire-blocks'), value: '500' },
							{ label: __('Semi Bold (600)', 'adaire-blocks'), value: '600' },
							{ label: __('Bold (700)', 'adaire-blocks'), value: '700' },
							{ label: __('Extra Bold (800)', 'adaire-blocks'), value: '800' },
							{ label: __('Black (900)', 'adaire-blocks'), value: '900' }
						]}
					/>

					<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
						<div style={{ flex: 1 }}>
							<TextControl
								label={__('Description Font Size', 'adaire-blocks')}
								type="number"
								value={getDeviceAttr('descriptionFontSize')}
								onChange={(value) => {
									if (value === '') {
										setDeviceAttr('descriptionFontSize', '');
									} else {
										const num = parseFloat(value);
										if (!isNaN(num)) {
											setDeviceAttr('descriptionFontSize', num);
										}
									}
								}}
								min={8}
								max={48}
								step={1}
							/>
						</div>
						<div style={{ flex: '0 0 auto' }}>
							<SelectControl
								value={descriptionFontSizeUnit}
								onChange={(value) => setAttributes({ descriptionFontSizeUnit: value })}
								options={fontSizeUnitOptions}
							/>
						</div>
					</div>

					<RangeControl
						label={__('Title Scrolling Gap', 'adaire-blocks')}
						value={getDeviceAttr('titleScrollingGap')}
						onChange={(value) => setDeviceAttr('titleScrollingGap', value)}
						min={0}
						max={1000}
						step={10}
						help={__('Space between repeated text copies in the scrolling animation', 'adaire-blocks')}
					/>

					<RangeControl
						label={__('Title Scrolling Speed', 'adaire-blocks')}
						value={titleScrollingSpeed}
						onChange={(value) => setAttributes({ titleScrollingSpeed: value })}
						min={20}
						max={500}
						step={10}
						help={__('Speed of the scrolling animation in pixels per second', 'adaire-blocks')}
					/>
				</PanelBody>

				<PanelBody section="style" priority="high" title={__('Colors', 'adaire-blocks')} initialOpen={false}>
					<BaseControl label={__('Background Color', 'adaire-blocks')}>
						<ColorPicker
							color={backgroundColor}
							onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
							disableAlpha
						/>
					</BaseControl>
					<BaseControl label={__('Text Color', 'adaire-blocks')}>
						<ColorPicker
							color={textColor}
							onChangeComplete={(color) => setAttributes({ textColor: color.hex })}
							disableAlpha
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Video Overlay', 'adaire-blocks')} initialOpen={false}>
					<SelectControl
						label={__('Overlay Type', 'adaire-blocks')}
						value={overlayType}
						onChange={(value) => setAttributes({ overlayType: value })}
						options={[
							{ label: __('Solid Color', 'adaire-blocks'), value: 'solid' },
							{ label: __('Gradient', 'adaire-blocks'), value: 'gradient' }
						]}
					/>
					{overlayType === 'solid' && (
						<RangeControl
							label={__('Overlay Opacity', 'adaire-blocks')}
							value={overlayOpacity}
							onChange={(value) => setAttributes({ overlayOpacity: value })}
							min={0}
							max={1}
							step={0.1}
							help={__('Opacity of the solid overlay (0 = transparent, 1 = opaque)', 'adaire-blocks')}
						/>
					)}
					{overlayType === 'gradient' && (
						<>
							<BaseControl label={__('Gradient Start Color', 'adaire-blocks')}>
								<ColorPicker
									color={overlayGradientStart}
									onChangeComplete={(color) => setAttributes({ overlayGradientStart: color.hex })}
									disableAlpha
								/>
							</BaseControl>
							<RangeControl
								label={__('Start Color Opacity', 'adaire-blocks')}
								value={overlayGradientStartOpacity}
								onChange={(value) => setAttributes({ overlayGradientStartOpacity: value })}
								min={0}
								max={1}
								step={0.1}
								help={__('Opacity of the gradient start color (0 = transparent, 1 = opaque)', 'adaire-blocks')}
							/>
							<BaseControl label={__('Gradient End Color', 'adaire-blocks')}>
								<ColorPicker
									color={overlayGradientEnd}
									onChangeComplete={(color) => setAttributes({ overlayGradientEnd: color.hex })}
									disableAlpha
								/>
							</BaseControl>
							<RangeControl
								label={__('End Color Opacity', 'adaire-blocks')}
								value={overlayGradientEndOpacity}
								onChange={(value) => setAttributes({ overlayGradientEndOpacity: value })}
								min={0}
								max={1}
								step={0.1}
								help={__('Opacity of the gradient end color (0 = transparent, 1 = opaque)', 'adaire-blocks')}
							/>
							<SelectControl
								label={__('Gradient Direction', 'adaire-blocks')}
								value={overlayGradientDirection}
								onChange={(value) => setAttributes({ overlayGradientDirection: value })}
								options={[
									{ label: __('To Bottom', 'adaire-blocks'), value: 'to bottom' },
									{ label: __('To Top', 'adaire-blocks'), value: 'to top' },
									{ label: __('To Right', 'adaire-blocks'), value: 'to right' },
									{ label: __('To Left', 'adaire-blocks'), value: 'to left' },
									{ label: __('To Bottom Right', 'adaire-blocks'), value: 'to bottom right' },
									{ label: __('To Bottom Left', 'adaire-blocks'), value: 'to bottom left' },
									{ label: __('To Top Right', 'adaire-blocks'), value: 'to top right' },
									{ label: __('To Top Left', 'adaire-blocks'), value: 'to top left' }
								]}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Navigation Arrow Colors', 'adaire-blocks')} initialOpen={false}>
					<BaseControl label={__('Left Arrow Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowLeftColor}
							onChangeComplete={(color) => setAttributes({ navArrowLeftColor: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Left Arrow Hover Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowLeftColorHover}
							onChangeComplete={(color) => setAttributes({ navArrowLeftColorHover: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Right Arrow Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowRightColor}
							onChangeComplete={(color) => setAttributes({ navArrowRightColor: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Right Arrow Hover Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowRightColorHover}
							onChangeComplete={(color) => setAttributes({ navArrowRightColorHover: color.hex })}
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Navigation Arrow Background Colors', 'adaire-blocks')} initialOpen={false}>
					<BaseControl label={__('Left Arrow Background Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowLeftBgColor}
							onChangeComplete={(color) => setAttributes({ navArrowLeftBgColor: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Left Arrow Background Hover Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowLeftBgColorHover}
							onChangeComplete={(color) => setAttributes({ navArrowLeftBgColorHover: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Right Arrow Background Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowRightBgColor}
							onChangeComplete={(color) => setAttributes({ navArrowRightBgColor: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Right Arrow Background Hover Color', 'adaire-blocks')}>
						<ColorPicker
							color={navArrowRightBgColorHover}
							onChangeComplete={(color) => setAttributes({ navArrowRightBgColorHover: color.hex })}
						/>
					</BaseControl>

					<RangeControl
						label={__('Left Arrow Background Opacity', 'adaire-blocks')}
						value={navArrowLeftBgOpacity}
						onChange={(value) => setAttributes({ navArrowLeftBgOpacity: value })}
						min={0}
						max={1}
						step={0.1}
					/>
					<RangeControl
						label={__('Left Arrow Background Opacity (Hover)', 'adaire-blocks')}
						value={navArrowLeftBgOpacityHover}
						onChange={(value) => setAttributes({ navArrowLeftBgOpacityHover: value })}
						min={0}
						max={1}
						step={0.1}
					/>
					<RangeControl
						label={__('Right Arrow Background Opacity', 'adaire-blocks')}
						value={navArrowRightBgOpacity}
						onChange={(value) => setAttributes({ navArrowRightBgOpacity: value })}
						min={0}
						max={1}
						step={0.1}
					/>
					<RangeControl
						label={__('Right Arrow Background Opacity (Hover)', 'adaire-blocks')}
						value={navArrowRightBgOpacityHover}
						onChange={(value) => setAttributes({ navArrowRightBgOpacityHover: value })}
						min={0}
						max={1}
						step={0.1}
					/>
					<RangeControl
						label={__('Left Arrow Background Blur', 'adaire-blocks')}
						value={navArrowLeftBgBlur}
						onChange={(value) => setAttributes({ navArrowLeftBgBlur: value })}
						min={0}
						max={20}
						step={1}
					/>
					<RangeControl
						label={__('Left Arrow Background Blur (Hover)', 'adaire-blocks')}
						value={navArrowLeftBgBlurHover}
						onChange={(value) => setAttributes({ navArrowLeftBgBlurHover: value })}
						min={0}
						max={20}
						step={1}
					/>
					<RangeControl
						label={__('Right Arrow Background Blur', 'adaire-blocks')}
						value={navArrowRightBgBlur}
						onChange={(value) => setAttributes({ navArrowRightBgBlur: value })}
						min={0}
						max={20}
						step={1}
					/>
					<RangeControl
						label={__('Right Arrow Background Blur (Hover)', 'adaire-blocks')}
						value={navArrowRightBgBlurHover}
						onChange={(value) => setAttributes({ navArrowRightBgBlurHover: value })}
						min={0}
						max={20}
						step={1}
					/>
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Cursor', 'adaire-blocks')} initialOpen={false}>
					<BaseControl label={__('Cursor Color', 'adaire-blocks')} help={__('Colors the cursor ring, arrow glyph, and border.', 'adaire-blocks')}>
						<ColorPicker
							color={cursorColor}
							onChangeComplete={(color) => setAttributes({ cursorColor: color.hex })}
						/>
					</BaseControl>
					<BaseControl label={__('Cursor Background Color', 'adaire-blocks')}>
						<ColorPicker
							color={cursorBgColor}
							onChangeComplete={(color) => setAttributes({ cursorBgColor: color.hex })}
							disableAlpha
						/>
					</BaseControl>
					<RangeControl
						label={__('Cursor Background Opacity', 'adaire-blocks')}
						value={cursorBgOpacity}
						onChange={(value) => setAttributes({ cursorBgOpacity: value })}
						min={0}
						max={1}
						step={0.1}
					/>
				</PanelBody>
			</InspectorTabs>

			<div className="video-hero-editor" style={{
				backgroundColor: backgroundColor,
				color: textColor,
				height: '100%',
				position: 'relative',
				overflow: 'hidden'
			}}>
				<div className="video-container" style={{ position: 'relative', height: '100%' }}>
					{/* Video Preview */}
					<div className="video-preview" style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						background: 'linear-gradient(45deg, #333, #666)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '18px',
						color: '#fff'
					}}>
						{videos && videos[0] ? (
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '24px', marginBottom: '10px' }}>
									{videos[0].videoType === 'youtube' ? '📺' : '🎬'} {videos[0].title}
								</div>
								<div style={{ fontSize: '14px', opacity: 0.8 }}>
									{videos[0].description}
								</div>
							</div>
						) : (
							<div>Add videos to see preview</div>
						)}
					</div>

					{/* Overlay */}
					<div className="video-overlay" style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						background: getOverlayBackground(),
						pointerEvents: 'none'
					}}></div>

					{/* Content */}
					<div className="video-content" style={{
						position: 'absolute',
						bottom: '40px',
						left: '40px',
						right: '40px',
						zIndex: 2
					}}>
						{videos && videos[0] && (
							<>
								<h1 style={{
									fontSize: `${titleFontSize}${titleFontSizeUnit}`,
									fontWeight: titleFontWeight,
									margin: '0 0 10px 0'
								}}>
									{videos[0].title}
								</h1>
								<p style={{
									fontSize: `${descriptionFontSize}${descriptionFontSizeUnit}`,
									margin: '0 0 20px 0',
									opacity: 0.9
								}}>
									{videos[0].description}
								</p>
							</>
						)}
					</div>

					{/* Navigation Indicators */}
					{videos && videos.length > 1 && (
						<div className="video-indicators" style={{
							position: 'absolute',
							bottom: '20px',
							right: '40px',
							display: 'flex',
							gap: '10px',
							zIndex: 2
						}}>
							{videos.map((_, index) => (
								<div key={index} style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									backgroundColor: index === 0 ? textColor : 'rgba(255, 255, 255, 0.5)',
									cursor: 'pointer'
								}}></div>
							))}
						</div>
					)}

					{/* Navigation Cursor */}
					<div className="video-cursor" style={{
						position: 'absolute',
						top: '50%',
						right: '40px',
						transform: 'translateY(-50%)',
						zIndex: 2,
						background: 'rgba(255, 255, 255, 0.2)',
						padding: '10px 15px',
						borderRadius: '20px',
						fontSize: '14px',
						backdropFilter: 'blur(10px)'
					}}>
						Next
					</div>
				</div>
			</div>
		</div>
	);
}
