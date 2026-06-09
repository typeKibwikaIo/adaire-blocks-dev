import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	ColorPalette,
	GradientPicker,
	SelectControl,
	ColorPicker,
	RangeControl,
	ButtonGroup,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useState, createElement } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';

// Custom icons for small laptop and big desktop
const smallLaptopIcon = createElement('svg', {
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

const bigDesktopIcon = createElement('svg', {
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

const BREAKPOINTS = [
	{ name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks') },
	{ name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks') },
	{ name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'adaire-blocks') },
	{ name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks') },
	{ name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'adaire-blocks') },
];

// Helper component for typography sections
const TypographySection = ({ attributes, updateResponsiveAttribute, deviceType, label, fontSizeAttr, fontWeightAttr, lineHeightAttr, letterSpacingAttr, textTransformAttr, colorAttr, marginAttr }) => (
	<div className="adaire-typography-section" style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
		<p className="adaire-typography-section-name" style={{ fontWeight: 600, marginBottom: '12px' }}>{label}</p>
		<UnitControl
			label={__('Font Size', 'adaire-blocks')}
			value={attributes[fontSizeAttr]?.[deviceType] || ''}
			onChange={(val) => updateResponsiveAttribute(fontSizeAttr, deviceType, val)}
		/>
		<SelectControl
			label={__('Font Weight', 'adaire-blocks')}
			value={attributes[fontWeightAttr]?.[deviceType] || '400'}
			options={[
				{ label: '100', value: '100' }, { label: '200', value: '200' },
				{ label: '300', value: '300' }, { label: '400', value: '400' },
				{ label: '500', value: '500' }, { label: '600', value: '600' },
				{ label: '700', value: '700' }, { label: '800', value: '800' },
				{ label: '900', value: '900' }
			]}
			onChange={(val) => updateResponsiveAttribute(fontWeightAttr, deviceType, val)}
		/>
		<UnitControl
			label={__('Line Height', 'adaire-blocks')}
			value={attributes[lineHeightAttr]?.[deviceType] || ''}
			onChange={(val) => updateResponsiveAttribute(lineHeightAttr, deviceType, val)}
		/>
		<UnitControl
			label={__('Letter Spacing', 'adaire-blocks')}
			value={attributes[letterSpacingAttr]?.[deviceType] || ''}
			onChange={(val) => updateResponsiveAttribute(letterSpacingAttr, deviceType, val)}
		/>
		<SelectControl
			label={__('Text Transform', 'adaire-blocks')}
			value={attributes[textTransformAttr]?.[deviceType] || 'none'}
			options={[
				{ label: __('None', 'adaire-blocks'), value: 'none' },
				{ label: __('Uppercase', 'adaire-blocks'), value: 'uppercase' },
				{ label: __('Lowercase', 'adaire-blocks'), value: 'lowercase' },
				{ label: __('Capitalize', 'adaire-blocks'), value: 'capitalize' }
			]}
			onChange={(val) => updateResponsiveAttribute(textTransformAttr, deviceType, val)}
		/>
		<PanelColorSettings
			title={__('Text Color', 'adaire-blocks')}
			initialOpen={false}
			colorSettings={[
				{
					value: attributes[colorAttr]?.[deviceType] || '#ffffff',
					onChange: (val) => updateResponsiveAttribute(colorAttr, deviceType, val),
					label: __('Color', 'adaire-blocks'),
				}
			]}
		/>
		{marginAttr && (
			<UnitControl
				label={__('Margin Bottom', 'adaire-blocks')}
				value={attributes[marginAttr]?.[deviceType] || ''}
				onChange={(val) => updateResponsiveAttribute(marginAttr, deviceType, val)}
			/>
		)}
	</div>
);

export default function Edit({ attributes, setAttributes }) {
	const {
		imageUrl,
		imageId,
		header,
		text,
		overlayType,
		overlayColor,
		overlayGradient,
		textColor,
		backgroundSize,
		backgroundPosition,
		backgroundRepeat,
		slideBorderRadius,
		slideHoverBorderRadius,
		responsiveHeaderFontSize,
		responsiveHeaderFontWeight,
		responsiveHeaderLineHeight,
		responsiveHeaderLetterSpacing,
		responsiveHeaderTextTransform,
		responsiveHeaderColor,
		responsiveHeaderMarginBottom,
		responsiveTextFontSize,
		responsiveTextFontWeight,
		responsiveTextLineHeight,
		responsiveTextLetterSpacing,
		responsiveTextTextTransform,
		responsiveTextColor,
		responsiveTextMarginBottom,
	} = attributes;

	const [deviceType, setDeviceType] = useState('desktop');

	const updateResponsiveAttribute = (attrName, device, value) => {
		setAttributes({
			[attrName]: {
				...(attributes[attrName] || {}),
				[device]: value
			}
		});
	};

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'swiper-slide-buttons' },
		{
			allowedBlocks: ['create-block/button-block'],
			orientation: 'horizontal',
		}
	);

	const onSelectImage = (media) => {
		setAttributes({
			imageUrl: media.url,
			imageId: media.id,
		});
	};

	const styles = {
		backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
		backgroundSize: backgroundSize,
		backgroundPosition: backgroundPosition,
		backgroundRepeat: backgroundRepeat,
		color: textColor,
		position: 'relative',
		minHeight: '400px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		padding: '30px',
		borderRadius: `${slideBorderRadius}px`,
		overflow: 'hidden',

		// Typography CSS variables (for realtime preview + parity with save.js)
		'--header-font-size-mobile': responsiveHeaderFontSize?.mobile || '28px',
		'--header-font-size-tablet':
			responsiveHeaderFontSize?.tablet || responsiveHeaderFontSize?.mobile || '30px',
		'--header-font-size-small-laptop':
			responsiveHeaderFontSize?.smallLaptop || responsiveHeaderFontSize?.desktop || '32px',
		'--header-font-size-desktop': responsiveHeaderFontSize?.desktop || '32px',
		'--header-font-size-big-desktop':
			responsiveHeaderFontSize?.bigDesktop || responsiveHeaderFontSize?.desktop || '32px',

		'--header-font-weight-mobile': responsiveHeaderFontWeight?.mobile || '700',
		'--header-font-weight-tablet':
			responsiveHeaderFontWeight?.tablet || responsiveHeaderFontWeight?.mobile || '700',
		'--header-font-weight-small-laptop':
			responsiveHeaderFontWeight?.smallLaptop || responsiveHeaderFontWeight?.desktop || '700',
		'--header-font-weight-desktop': responsiveHeaderFontWeight?.desktop || '700',
		'--header-font-weight-big-desktop':
			responsiveHeaderFontWeight?.bigDesktop || responsiveHeaderFontWeight?.desktop || '700',

		'--header-line-height-mobile': responsiveHeaderLineHeight?.mobile || '1.2',
		'--header-line-height-tablet':
			responsiveHeaderLineHeight?.tablet || responsiveHeaderLineHeight?.mobile || '1.2',
		'--header-line-height-small-laptop':
			responsiveHeaderLineHeight?.smallLaptop || responsiveHeaderLineHeight?.desktop || '1.2',
		'--header-line-height-desktop': responsiveHeaderLineHeight?.desktop || '1.2',
		'--header-line-height-big-desktop':
			responsiveHeaderLineHeight?.bigDesktop || responsiveHeaderLineHeight?.desktop || '1.2',

		'--header-letter-spacing-mobile': responsiveHeaderLetterSpacing?.mobile || '0px',
		'--header-letter-spacing-tablet':
			responsiveHeaderLetterSpacing?.tablet ||
			responsiveHeaderLetterSpacing?.mobile ||
			'0px',
		'--header-letter-spacing-small-laptop':
			responsiveHeaderLetterSpacing?.smallLaptop ||
			responsiveHeaderLetterSpacing?.desktop ||
			'0px',
		'--header-letter-spacing-desktop': responsiveHeaderLetterSpacing?.desktop || '0px',
		'--header-letter-spacing-big-desktop':
			responsiveHeaderLetterSpacing?.bigDesktop ||
			responsiveHeaderLetterSpacing?.desktop ||
			'0px',

		'--header-text-transform-mobile': responsiveHeaderTextTransform?.mobile || 'none',
		'--header-text-transform-tablet':
			responsiveHeaderTextTransform?.tablet || responsiveHeaderTextTransform?.mobile || 'none',
		'--header-text-transform-small-laptop':
			responsiveHeaderTextTransform?.smallLaptop ||
			responsiveHeaderTextTransform?.desktop ||
			'none',
		'--header-text-transform-desktop': responsiveHeaderTextTransform?.desktop || 'none',
		'--header-text-transform-big-desktop':
			responsiveHeaderTextTransform?.bigDesktop ||
			responsiveHeaderTextTransform?.desktop ||
			'none',

		'--header-color-mobile': responsiveHeaderColor?.mobile || '#ffffff',
		'--header-color-tablet': responsiveHeaderColor?.tablet || responsiveHeaderColor?.mobile || '#ffffff',
		'--header-color-small-laptop':
			responsiveHeaderColor?.smallLaptop || responsiveHeaderColor?.desktop || '#ffffff',
		'--header-color-desktop': responsiveHeaderColor?.desktop || '#ffffff',
		'--header-color-big-desktop':
			responsiveHeaderColor?.bigDesktop || responsiveHeaderColor?.desktop || '#ffffff',

		'--header-margin-bottom-mobile': responsiveHeaderMarginBottom?.mobile || '10px',
		'--header-margin-bottom-tablet':
			responsiveHeaderMarginBottom?.tablet || responsiveHeaderMarginBottom?.mobile || '10px',
		'--header-margin-bottom-small-laptop':
			responsiveHeaderMarginBottom?.smallLaptop || responsiveHeaderMarginBottom?.desktop || '10px',
		'--header-margin-bottom-desktop': responsiveHeaderMarginBottom?.desktop || '10px',
		'--header-margin-bottom-big-desktop':
			responsiveHeaderMarginBottom?.bigDesktop || responsiveHeaderMarginBottom?.desktop || '10px',

		'--text-font-size-mobile': responsiveTextFontSize?.mobile || '16px',
		'--text-font-size-tablet': responsiveTextFontSize?.tablet || responsiveTextFontSize?.mobile || '17px',
		'--text-font-size-small-laptop':
			responsiveTextFontSize?.smallLaptop || responsiveTextFontSize?.desktop || '18px',
		'--text-font-size-desktop': responsiveTextFontSize?.desktop || '18px',
		'--text-font-size-big-desktop':
			responsiveTextFontSize?.bigDesktop || responsiveTextFontSize?.desktop || '18px',

		'--text-font-weight-mobile': responsiveTextFontWeight?.mobile || '400',
		'--text-font-weight-tablet':
			responsiveTextFontWeight?.tablet || responsiveTextFontWeight?.mobile || '400',
		'--text-font-weight-small-laptop':
			responsiveTextFontWeight?.smallLaptop || responsiveTextFontWeight?.desktop || '400',
		'--text-font-weight-desktop': responsiveTextFontWeight?.desktop || '400',
		'--text-font-weight-big-desktop':
			responsiveTextFontWeight?.bigDesktop || responsiveTextFontWeight?.desktop || '400',

		'--text-line-height-mobile': responsiveTextLineHeight?.mobile || '1.5',
		'--text-line-height-tablet':
			responsiveTextLineHeight?.tablet || responsiveTextLineHeight?.mobile || '1.5',
		'--text-line-height-small-laptop':
			responsiveTextLineHeight?.smallLaptop || responsiveTextLineHeight?.desktop || '1.5',
		'--text-line-height-desktop': responsiveTextLineHeight?.desktop || '1.5',
		'--text-line-height-big-desktop':
			responsiveTextLineHeight?.bigDesktop || responsiveTextLineHeight?.desktop || '1.5',

		'--text-letter-spacing-mobile': responsiveTextLetterSpacing?.mobile || '0px',
		'--text-letter-spacing-tablet':
			responsiveTextLetterSpacing?.tablet || responsiveTextLetterSpacing?.mobile || '0px',
		'--text-letter-spacing-small-laptop':
			responsiveTextLetterSpacing?.smallLaptop || responsiveTextLetterSpacing?.desktop || '0px',
		'--text-letter-spacing-desktop': responsiveTextLetterSpacing?.desktop || '0px',
		'--text-letter-spacing-big-desktop':
			responsiveTextLetterSpacing?.bigDesktop || responsiveTextLetterSpacing?.desktop || '0px',

		'--text-text-transform-mobile': responsiveTextTextTransform?.mobile || 'none',
		'--text-text-transform-tablet':
			responsiveTextTextTransform?.tablet || responsiveTextTextTransform?.mobile || 'none',
		'--text-text-transform-small-laptop':
			responsiveTextTextTransform?.smallLaptop || responsiveTextTextTransform?.desktop || 'none',
		'--text-text-transform-desktop': responsiveTextTextTransform?.desktop || 'none',
		'--text-text-transform-big-desktop':
			responsiveTextTextTransform?.bigDesktop || responsiveTextTextTransform?.desktop || 'none',

		'--text-color-mobile': responsiveTextColor?.mobile || '#ffffff',
		'--text-color-tablet': responsiveTextColor?.tablet || responsiveTextColor?.mobile || '#ffffff',
		'--text-color-small-laptop': responsiveTextColor?.smallLaptop || responsiveTextColor?.desktop || '#ffffff',
		'--text-color-desktop': responsiveTextColor?.desktop || '#ffffff',
		'--text-color-big-desktop': responsiveTextColor?.bigDesktop || responsiveTextColor?.desktop || '#ffffff',

		'--text-margin-bottom-mobile': responsiveTextMarginBottom?.mobile || '0px',
		'--text-margin-bottom-tablet':
			responsiveTextMarginBottom?.tablet || responsiveTextMarginBottom?.mobile || '0px',
		'--text-margin-bottom-small-laptop':
			responsiveTextMarginBottom?.smallLaptop || responsiveTextMarginBottom?.desktop || '0px',
		'--text-margin-bottom-desktop': responsiveTextMarginBottom?.desktop || '0px',
		'--text-margin-bottom-big-desktop':
			responsiveTextMarginBottom?.bigDesktop || responsiveTextMarginBottom?.desktop || '0px',
	};

	const overlayStyles = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		background: overlayType === 'gradient' ? overlayGradient : overlayColor,
		zIndex: 1
	};

	const contentStyles = {
		position: 'relative',
		zIndex: 2
	};

	// Realtime editor typography for the currently selected breakpoint button
	const currentHeaderStyle = {
		fontSize: responsiveHeaderFontSize?.[deviceType] || responsiveHeaderFontSize?.desktop || '32px',
		fontWeight: responsiveHeaderFontWeight?.[deviceType] || responsiveHeaderFontWeight?.desktop || '700',
		lineHeight: responsiveHeaderLineHeight?.[deviceType] || responsiveHeaderLineHeight?.desktop || '1.2',
		letterSpacing:
			responsiveHeaderLetterSpacing?.[deviceType] || responsiveHeaderLetterSpacing?.desktop || '0px',
		textTransform:
			responsiveHeaderTextTransform?.[deviceType] || responsiveHeaderTextTransform?.desktop || 'none',
		color: responsiveHeaderColor?.[deviceType] || responsiveHeaderColor?.desktop || textColor,
		marginBottom:
			responsiveHeaderMarginBottom?.[deviceType] || responsiveHeaderMarginBottom?.desktop || '10px',
		marginTop: 0,
	};

	const currentTextStyle = {
		fontSize: responsiveTextFontSize?.[deviceType] || responsiveTextFontSize?.desktop || '18px',
		fontWeight: responsiveTextFontWeight?.[deviceType] || responsiveTextFontWeight?.desktop || '400',
		lineHeight: responsiveTextLineHeight?.[deviceType] || responsiveTextLineHeight?.desktop || '1.5',
		letterSpacing:
			responsiveTextLetterSpacing?.[deviceType] || responsiveTextLetterSpacing?.desktop || '0px',
		textTransform:
			responsiveTextTextTransform?.[deviceType] || responsiveTextTextTransform?.desktop || 'none',
		color: responsiveTextColor?.[deviceType] || responsiveTextColor?.desktop || textColor,
		marginTop: 0,
		marginBottom:
			responsiveTextMarginBottom?.[deviceType] || responsiveTextMarginBottom?.desktop || 0,
	};

	return (
		<div {...useBlockProps({ className: 'swiper-slide', style: styles })}>
			<InspectorControls>
				<PanelBody title={__('Image Settings', 'adaire-blocks')}>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectImage}
							allowedTypes={['image']}
							value={imageId}
							render={({ open }) => (
								<Button variant="secondary" onClick={open}>
									{imageUrl ? __('Replace Image', 'adaire-blocks') : __('Select Image', 'adaire-blocks')}
								</Button>
							)}
						/>
					</MediaUploadCheck>
					<SelectControl
						label={__('Background Size', 'adaire-blocks')}
						value={backgroundSize}
						options={[
							{ label: 'Cover', value: 'cover' },
							{ label: 'Contain', value: 'contain' },
							{ label: 'Auto', value: 'auto' },
							{ label: '100%', value: '100%' },
						]}
						onChange={(value) => setAttributes({ backgroundSize: value })}
					/>
					<SelectControl
						label={__('Background Position', 'adaire-blocks')}
						value={backgroundPosition}
						options={[
							{ label: 'Center', value: 'center' },
							{ label: 'Top', value: 'top' },
							{ label: 'Bottom', value: 'bottom' },
							{ label: 'Left', value: 'left' },
							{ label: 'Right', value: 'right' },
							{ label: 'Top Left', value: 'top left' },
							{ label: 'Top Right', value: 'top right' },
							{ label: 'Bottom Left', value: 'bottom left' },
							{ label: 'Bottom Right', value: 'bottom right' },
						]}
						onChange={(value) => setAttributes({ backgroundPosition: value })}
					/>
					<SelectControl
						label={__('Background Repeat', 'adaire-blocks')}
						value={backgroundRepeat}
						options={[
							{ label: 'No Repeat', value: 'no-repeat' },
							{ label: 'Repeat', value: 'repeat' },
							{ label: 'Repeat X', value: 'repeat-x' },
							{ label: 'Repeat Y', value: 'repeat-y' },
						]}
						onChange={(value) => setAttributes({ backgroundRepeat: value })}
					/>
				</PanelBody>
				<PanelBody title={__('Overlay Settings', 'adaire-blocks')}>
					<SelectControl
						label={__('Overlay Type', 'adaire-blocks')}
						value={overlayType}
						options={[
							{ label: 'Color', value: 'color' },
							{ label: 'Gradient', value: 'gradient' },
						]}
						onChange={(value) => setAttributes({ overlayType: value })}
					/>
					{overlayType === 'color' && (
						<div style={{ marginBottom: '10px' }}>
							<p>{__('Overlay Color', 'adaire-blocks')}</p>
							<ColorPicker
								color={overlayColor}
								onChangeComplete={(value) => {
									const { r, g, b, a } = value.rgb;
									setAttributes({ overlayColor: `rgba(${r}, ${g}, ${b}, ${a})` });
								}}
								disableAlpha={false}
							/>
						</div>
					)}
					{overlayType === 'gradient' && (
						<GradientPicker
							value={overlayGradient}
							onChange={(value) => setAttributes({ overlayGradient: value })}
						/>
					)}
				</PanelBody>
				<PanelBody title={__('Style Settings', 'adaire-blocks')}>
					<RangeControl
						label={__('Border Radius (px)', 'adaire-blocks')}
						value={slideBorderRadius}
						onChange={(value) => setAttributes({ slideBorderRadius: value })}
						min={0}
						max={50}
						step={1}
					/>
					<RangeControl
						label={__('Hover Border Radius (px)', 'adaire-blocks')}
						value={slideHoverBorderRadius}
						onChange={(value) => setAttributes({ slideHoverBorderRadius: value })}
						min={0}
						max={50}
						step={1}
					/>
				</PanelBody>
				<PanelBody title={__('Typography Settings', 'adaire-blocks')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>
						{__('Current Breakpoint:', 'adaire-blocks')} {BREAKPOINTS.find(bp => bp.name === deviceType)?.label || deviceType}
					</p>
					<ButtonGroup style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
						{BREAKPOINTS.map((bp) => (
							<Button
								key={bp.name}
								icon={bp.icon}
								isPrimary={deviceType === bp.name}
								onClick={() => setDeviceType(bp.name)}
								aria-label={bp.label}
							/>
						))}
					</ButtonGroup>

					<TypographySection
						attributes={attributes}
						updateResponsiveAttribute={updateResponsiveAttribute}
						deviceType={deviceType}
						label={__('Header (H3)', 'adaire-blocks')}
						fontSizeAttr="responsiveHeaderFontSize"
						fontWeightAttr="responsiveHeaderFontWeight"
						lineHeightAttr="responsiveHeaderLineHeight"
						letterSpacingAttr="responsiveHeaderLetterSpacing"
						textTransformAttr="responsiveHeaderTextTransform"
						colorAttr="responsiveHeaderColor"
						marginAttr="responsiveHeaderMarginBottom"
					/>

					<TypographySection
						attributes={attributes}
						updateResponsiveAttribute={updateResponsiveAttribute}
						deviceType={deviceType}
						label={__('Text (Paragraph)', 'adaire-blocks')}
						fontSizeAttr="responsiveTextFontSize"
						fontWeightAttr="responsiveTextFontWeight"
						lineHeightAttr="responsiveTextLineHeight"
						letterSpacingAttr="responsiveTextLetterSpacing"
						textTransformAttr="responsiveTextTextTransform"
						colorAttr="responsiveTextColor"
						marginAttr="responsiveTextMarginBottom"
					/>
				</PanelBody>
				<PanelBody title={__('Text Settings', 'adaire-blocks')}>
					<p>{__('Text Color (Legacy - use Typography Settings for responsive colors)', 'adaire-blocks')}</p>
					<ColorPalette
						colors={[
							{ name: 'White', color: '#ffffff' },
							{ name: 'Black', color: '#000000' },
						]}
						value={textColor}
						onChange={(value) => setAttributes({ textColor: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div className="swiper-slide-overlay" style={overlayStyles}></div>

			<div className="swiper-slide-content" style={contentStyles}>
				<RichText
					tagName="h3"
					value={header}
					onChange={(value) => setAttributes({ header: value })}
					placeholder={__('Header', 'adaire-blocks')}
					style={currentHeaderStyle}
				/>
				<RichText
					tagName="p"
					value={text}
					onChange={(value) => setAttributes({ text: value })}
					placeholder={__('Description', 'adaire-blocks')}
					style={currentTextStyle}
				/>
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}



