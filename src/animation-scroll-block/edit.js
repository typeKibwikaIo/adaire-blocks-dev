import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from "@wordpress/element";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import {
	PanelBody,
	Button,
	ButtonGroup,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
} from "@wordpress/components";
import { desktop, tablet, mobile } from "@wordpress/icons";
import { getBlockType } from "@wordpress/blocks";
import InspectorTabs from "../components/InspectorTabs";
import DeviceSwitcher from "../components/DeviceSwitcher";
import QuickZone from "../components/QuickZone";
import "./editor.scss";

const THREE_TIERS = [
	{ key: "desktop", label: __("Desktop", "animation-scroll-block"), icon: desktop },
	{ key: "tablet", label: __("Tablet", "animation-scroll-block"), icon: tablet },
	{ key: "mobile", label: __("Mobile", "animation-scroll-block"), icon: mobile },
];

const ANIMATION_TYPES = [
	{ label: __("Fade In", "animation-scroll-block"), value: "fade-in" },
	{ label: __("Fade Out", "animation-scroll-block"), value: "fade-out" },
	{ label: __("Fade Left", "animation-scroll-block"), value: "fade-left" },
	{ label: __("Fade Right", "animation-scroll-block"), value: "fade-right" },
	{ label: __("Fly Up", "animation-scroll-block"), value: "fly-up" },
	{ label: __("Fly Down", "animation-scroll-block"), value: "fly-down" },
	{ label: __("Fly Left", "animation-scroll-block"), value: "fly-left" },
	{ label: __("Fly Right", "animation-scroll-block"), value: "fly-right" },
	{ label: __("Grow", "animation-scroll-block"), value: "grow" },
	{ label: __("Shrink", "animation-scroll-block"), value: "shrink" },
	{ label: __("Bounce", "animation-scroll-block"), value: "bounce" },
	{ label: __("Flip", "animation-scroll-block"), value: "flip" },
	{ label: __("Rotate", "animation-scroll-block"), value: "rotate" },
	{ label: __("Blur In", "animation-scroll-block"), value: "blur-in" },
	{ label: __("Blur Out", "animation-scroll-block"), value: "blur-out" },
];

const EASING_OPTIONS = [
	{ label: __("Ease Out", "animation-scroll-block"), value: "ease-out" },
	{ label: __("Ease In", "animation-scroll-block"), value: "ease-in" },
	{ label: __("Ease In Out", "animation-scroll-block"), value: "ease-in-out" },
	{ label: __("Linear", "animation-scroll-block"), value: "linear" },
	{ label: __("Ease Out Back", "animation-scroll-block"), value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
	{ label: __("Ease Out Quart", "animation-scroll-block"), value: "cubic-bezier(0.25, 1, 0.5, 1)" },
	{ label: __("Spring", "animation-scroll-block"), value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const [deviceType, setDeviceType] = useState("desktop");
	const [activeZone, setActiveZone] = useState(null);
	const contentRef = useRef(null);

	const {
		blockId,
		animationType,
		animationDuration,
		animationDelay,
		animationEasing,
		animationDistance,
		flipAxis,
		flipDirection,
		reverseOnScrollOut,
		threshold,
		once,
		containerMode,
		containerMaxWidth,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
	} = attributes;

	// Set unique block ID
	if (!blockId) {
		setAttributes({ blockId: clientId });
	}

	// Resets the given responsive attributes back to their block.json defaults —
	// existing values only, nothing new is added.
	const resetToDefaults = (keys) => {
		const blockType = getBlockType("create-block/animation-scroll-block");
		const defaults = blockType?.attributes || {};
		const resetValues = {};
		keys.forEach((key) => {
			if (defaults[key] && "default" in defaults[key]) {
				resetValues[key] = defaults[key].default;
			}
		});
		setAttributes(resetValues);
	};

	// Apply animation preview in editor
	useEffect(() => {
		if (!contentRef.current) return;

		const content = contentRef.current;

		// Helper function to get initial styles
		const getInitialStyles = (type) => {
			const distance = animationDistance || 50;
			switch(type) {
				case 'fade-in':
				case 'fade-out':
					return { opacity: '0' };
				case 'fade-left':
				case 'fly-left':
					return { opacity: '0', transform: `translateX(-${distance}px)` };
				case 'fade-right':
				case 'fly-right':
					return { opacity: '0', transform: `translateX(${distance}px)` };
				case 'fly-up':
					return { opacity: '0', transform: `translateY(${distance}px)` };
				case 'fly-down':
					return { opacity: '0', transform: `translateY(-${distance}px)` };
				case 'grow':
					return { opacity: '0', transform: 'scale(0.8)' };
				case 'shrink':
					return { opacity: '0', transform: 'scale(1.2)' };
				case 'bounce':
					return { opacity: '0', transform: 'scale(0.3)' };
				case 'flip':
					const flipAxisValue = flipAxis || 'horizontal';
					const flipDirValue = flipDirection || 'clockwise';
					const axis = flipAxisValue === 'horizontal' ? 'Y' : 'X';
					const dir = flipDirValue === 'clockwise' ? '90' : '-90';
					return { opacity: '0', transform: `perspective(200px) rotate${axis}(${dir}deg)` };
				case 'rotate':
					return { opacity: '0', transform: 'rotate(180deg)' };
				case 'blur-in':
					return { opacity: '0', filter: 'blur(10px)' };
				case 'blur-out':
					return { opacity: '0', filter: 'blur(0px)' };
				default:
					return { opacity: '0' };
			}
		};

		// Set initial state
		const initialStyles = getInitialStyles(animationType);
		Object.keys(initialStyles).forEach(key => {
			content.style[key] = initialStyles[key];
		});

		// Trigger animation after a short delay
		const timer = setTimeout(() => {
			content.style.transition = `all ${animationDuration}ms ${animationEasing}`;
			
			switch(animationType) {
				case 'fade-in':
				case 'fade-out':
					content.style.opacity = '1';
					break;
				case 'fade-left':
				case 'fly-left':
					content.style.opacity = '1';
					content.style.transform = 'translateX(0)';
					break;
				case 'fade-right':
				case 'fly-right':
					content.style.opacity = '1';
					content.style.transform = 'translateX(0)';
					break;
				case 'fly-up':
					content.style.opacity = '1';
					content.style.transform = 'translateY(0)';
					break;
				case 'fly-down':
					content.style.opacity = '1';
					content.style.transform = 'translateY(0)';
					break;
				case 'grow':
					content.style.opacity = '1';
					content.style.transform = 'scale(1)';
					break;
				case 'shrink':
					content.style.opacity = '1';
					content.style.transform = 'scale(1)';
					break;
				case 'bounce':
					content.style.opacity = '1';
					content.style.transform = 'scale(1)';
					break;
				case 'flip':
					const flipAxisValue = flipAxis || 'horizontal';
					content.style.opacity = '1';
					const axisForReset = flipAxisValue === 'horizontal' ? 'Y' : 'X';
					content.style.transform = `perspective(200px) rotate${axisForReset}(0deg)`;
					break;
				case 'rotate':
					content.style.opacity = '1';
					content.style.transform = 'rotate(0deg)';
					break;
				case 'blur-in':
					content.style.opacity = '1';
					content.style.filter = 'blur(0px)';
					break;
				case 'blur-out':
					content.style.opacity = '1';
					content.style.filter = 'blur(0px)';
					break;
			}
		}, 100);

		// Cleanup
		return () => {
			clearTimeout(timer);
		};
	}, [animationType, animationDuration, animationEasing, animationDelay, animationDistance, flipAxis, flipDirection]);

	const blockProps = useBlockProps({
		className: "ad-animation-scroll",
		style: {
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${
				containerMaxWidth?.desktop?.unit ?? "px"
			}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${
				containerMaxWidth?.tablet?.unit ?? "%"
			}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${
				containerMaxWidth?.mobile?.unit ?? "%"
			}`,
			marginTop: `${marginTop?.desktop ?? 0}px`,
			marginRight: `${marginRight?.desktop ?? 0}px`,
			marginBottom: `${marginBottom?.desktop ?? 0}px`,
			marginLeft: `${marginLeft?.desktop ?? 0}px`,
			"--margin-top-tablet": `${marginTop?.tablet ?? 0}px`,
			"--margin-right-tablet": `${marginRight?.tablet ?? 0}px`,
			"--margin-bottom-tablet": `${marginBottom?.tablet ?? 0}px`,
			"--margin-left-tablet": `${marginLeft?.tablet ?? 0}px`,
			"--margin-top-mobile": `${marginTop?.mobile ?? 0}px`,
			"--margin-right-mobile": `${marginRight?.mobile ?? 0}px`,
			"--margin-bottom-mobile": `${marginBottom?.mobile ?? 0}px`,
			"--margin-left-mobile": `${marginLeft?.mobile ?? 0}px`,
			paddingTop: `${paddingTop?.desktop ?? 0}px`,
			paddingRight: `${paddingRight?.desktop ?? 0}px`,
			paddingBottom: `${paddingBottom?.desktop ?? 0}px`,
			paddingLeft: `${paddingLeft?.desktop ?? 0}px`,
			"--padding-top-tablet": `${paddingTop?.tablet ?? 0}px`,
			"--padding-right-tablet": `${paddingRight?.tablet ?? 0}px`,
			"--padding-bottom-tablet": `${paddingBottom?.tablet ?? 0}px`,
			"--padding-left-tablet": `${paddingLeft?.tablet ?? 0}px`,
			"--padding-top-mobile": `${paddingTop?.mobile ?? 0}px`,
			"--padding-right-mobile": `${paddingRight?.mobile ?? 0}px`,
			"--padding-bottom-mobile": `${paddingBottom?.mobile ?? 0}px`,
			"--padding-left-mobile": `${paddingLeft?.mobile ?? 0}px`,
		},
	});

	// Pre-fill new blocks with real demo content (not just an empty placeholder)
	// so visitors previewing/using the block immediately see something animate
	// into place, rather than a blank paragraph. The demo mixes text with a
	// Video Player block on purpose — it's here only to show that *any* block
	// dropped inside (text, media, whatever) inherits the same scroll
	// animation, not just paragraphs. Everything is fully editable/removable —
	// this only affects the initial insert.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: "ad-animation-scroll__content", ref: contentRef },
		{
			template: [
				[
					"core/group",
					{},
					[
						["create-block/video-player-block", {}],
						[
							"core/heading",
							{
								level: 3,
								content: __("This content animates into view", "animation-scroll-block"),
							},
						],
						[
							"core/paragraph",
							{
								content: __(
									"Everything you place inside this block scrolls into the viewport using the animation style you pick in the sidebar — text, images, even a video player, like the example above. Replace any of this with your own content; the animation applies automatically.",
									"animation-scroll-block"
								),
							},
						],
					],
				],
			],
			templateLock: false,
		}
	);

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody section="style" priority="medium" title={__("Animation Settings", "animation-scroll-block")} initialOpen={true}>
					<SelectControl
						label={__("Animation Type", "animation-scroll-block")}
						value={animationType}
						options={ANIMATION_TYPES}
						onChange={(value) => setAttributes({ animationType: value })}
					/>

					<RangeControl
						label={__("Duration (ms)", "animation-scroll-block")}
						value={animationDuration}
						onChange={(value) => setAttributes({ animationDuration: value })}
						min={100}
						max={3000}
						step={100}
					/>

					{(animationType.includes('fly') || animationType.includes('fade')) && 
					 !animationType.includes('blur') &&
					 animationType !== 'fade-in' &&
					 animationType !== 'fade-out' && (
						<RangeControl
							label={__("Distance (px)", "animation-scroll-block")}
							value={animationDistance}
							onChange={(value) => setAttributes({ animationDistance: value })}
							min={0}
							max={300}
							step={10}
							help={__("How far the element moves during animation", "animation-scroll-block")}
						/>
					)}

					{animationType === 'flip' && (
						<>
							<SelectControl
								label={__("Flip Axis", "animation-scroll-block")}
								value={flipAxis}
								options={[
									{ label: __("Horizontal", "animation-scroll-block"), value: "horizontal" },
									{ label: __("Vertical", "animation-scroll-block"), value: "vertical" },
								]}
								onChange={(value) => setAttributes({ flipAxis: value })}
							/>
							<SelectControl
								label={__("Flip Direction", "animation-scroll-block")}
								value={flipDirection}
								options={[
									{ label: __("Clockwise", "animation-scroll-block"), value: "clockwise" },
									{ label: __("Anti-Clockwise", "animation-scroll-block"), value: "anticlockwise" },
								]}
								onChange={(value) => setAttributes({ flipDirection: value })}
							/>
						</>
					)}

					<RangeControl
						label={__("Delay (ms)", "animation-scroll-block")}
						value={animationDelay}
						onChange={(value) => setAttributes({ animationDelay: value })}
						min={0}
						max={2000}
						step={100}
					/>

					<SelectControl
						label={__("Easing", "animation-scroll-block")}
						value={animationEasing}
						options={EASING_OPTIONS}
						onChange={(value) => setAttributes({ animationEasing: value })}
					/>

					<RangeControl
						label={__("Threshold (0-1)", "animation-scroll-block")}
						value={threshold}
						onChange={(value) => setAttributes({ threshold: value })}
						min={0}
						max={1}
						step={0.1}
						help={__("How much of the element must be visible to trigger", "animation-scroll-block")}
					/>

					<ToggleControl
						label={__("Reverse on Scroll Out", "animation-scroll-block")}
						checked={reverseOnScrollOut}
						onChange={(value) => setAttributes({ reverseOnScrollOut: value })}
					/>

					<ToggleControl
						label={__("Animate Once", "animation-scroll-block")}
						checked={once}
						onChange={(value) => setAttributes({ once: value })}
						help={__("Only animate when first scrolling into view", "animation-scroll-block")}
					/>
				</PanelBody>

				<PanelBody
					section="layout"
					title={__("Container Settings", "animation-scroll-block")}
					initialOpen={false}
				>
					<p style={{ marginBottom: "8px", fontWeight: 600 }}>
						{__("Container Mode", "animation-scroll-block")}
					</p>
					<ButtonGroup>
						{[
							{ label: __("Full Width", "animation-scroll-block"), value: "full" },
							{
								label: __("Constrained", "animation-scroll-block"),
								value: "constrained",
							},
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

					{containerMode === "constrained" && (
						<>
							<p style={{ marginTop: "16px", marginBottom: "8px", fontWeight: 600 }}>
								{__("Max Width", "animation-scroll-block")}
							</p>
							<DeviceSwitcher
								deviceType={deviceType}
								setDeviceType={setDeviceType}
								tiers={THREE_TIERS}
								onReset={() => resetToDefaults(["containerMaxWidth"])}
							/>
							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Max Width Value", "animation-scroll-block")}
									value={
										containerMaxWidth?.[deviceType]?.value ??
										(deviceType === "desktop" ? 1200 : 100)
									}
									onChange={(v) =>
										setAttributes({
											containerMaxWidth: {
												...(containerMaxWidth || {}),
												[deviceType]: {
													...(containerMaxWidth?.[deviceType] || {}),
													value: Number(v),
												},
											},
										})
									}
									min={0}
									max={deviceType === "desktop" ? 2000 : 100}
									step={10}
								/>
								<ButtonGroup>
									{["px", "%"].map((u) => (
										<Button
											key={u}
											isPrimary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === "desktop" ? "px" : "%")) === u
											}
											isSecondary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === "desktop" ? "px" : "%")) !== u
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
				</PanelBody>

				<PanelBody
					section="style"
					priority="medium"
					title={__("Margins", "animation-scroll-block")}
					initialOpen={false}
				>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__("Device", "animation-scroll-block")}
						tiers={THREE_TIERS}
						onReset={() => resetToDefaults(["marginTop", "marginRight", "marginBottom", "marginLeft"])}
					/>
					<BoxControl
						label={__("Margin", "animation-scroll-block")}
						values={{
							top: `${marginTop?.[deviceType] ?? 0}px`,
							right: `${marginRight?.[deviceType] ?? 0}px`,
							bottom: `${marginBottom?.[deviceType] ?? 0}px`,
							left: `${marginLeft?.[deviceType] ?? 0}px`,
						}}
						onChange={(value) => {
							setAttributes({
								marginTop: {
									...(marginTop || {}),
									[deviceType]: parseInt(value.top) || 0,
								},
								marginRight: {
									...(marginRight || {}),
									[deviceType]: parseInt(value.right) || 0,
								},
								marginBottom: {
									...(marginBottom || {}),
									[deviceType]: parseInt(value.bottom) || 0,
								},
								marginLeft: {
									...(marginLeft || {}),
									[deviceType]: parseInt(value.left) || 0,
								},
							});
						}}
					/>
				</PanelBody>

				<PanelBody
					section="style"
					priority="medium"
					title={__("Padding", "animation-scroll-block")}
					initialOpen={false}
				>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__("Device", "animation-scroll-block")}
						tiers={THREE_TIERS}
						onReset={() => resetToDefaults(["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"])}
					/>
					<BoxControl
						label={__("Padding", "animation-scroll-block")}
						values={{
							top: `${paddingTop?.[deviceType] ?? 0}px`,
							right: `${paddingRight?.[deviceType] ?? 0}px`,
							bottom: `${paddingBottom?.[deviceType] ?? 0}px`,
							left: `${paddingLeft?.[deviceType] ?? 0}px`,
						}}
						onChange={(value) => {
							setAttributes({
								paddingTop: {
									...(paddingTop || {}),
									[deviceType]: parseInt(value.top) || 0,
								},
								paddingRight: {
									...(paddingRight || {}),
									[deviceType]: parseInt(value.right) || 0,
								},
								paddingBottom: {
									...(paddingBottom || {}),
									[deviceType]: parseInt(value.bottom) || 0,
								},
								paddingLeft: {
									...(paddingLeft || {}),
									[deviceType]: parseInt(value.left) || 0,
								},
							});
						}}
					/>
				</PanelBody>
			</InspectorTabs>

			<div {...blockProps} data-block-id={blockId}>
				<QuickZone
					id="animation"
					label={__("Animation", "animation-scroll-block")}
					activeZone={activeZone}
					setActiveZone={setActiveZone}
					content={
						<>
							<SelectControl
								label={__("Animation Type", "animation-scroll-block")}
								value={animationType}
								options={ANIMATION_TYPES}
								onChange={(value) => setAttributes({ animationType: value })}
							/>
							<RangeControl
								label={__("Duration (ms)", "animation-scroll-block")}
								value={animationDuration}
								onChange={(value) => setAttributes({ animationDuration: value })}
								min={100}
								max={3000}
								step={100}
							/>
						</>
					}
				>
					<div
						className={`ad-animation-scroll__container ${
							containerMode === "constrained" ? "is-constrained" : ""
						}`}
					>
						<div {...innerBlocksProps} />
					</div>
				</QuickZone>
			</div>
		</>
	);
}




