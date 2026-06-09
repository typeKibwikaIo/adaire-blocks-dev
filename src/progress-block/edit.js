import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
} from "@wordpress/components";
import { useState, useEffect } from "@wordpress/element";
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import "./editor.scss";

export default function Edit({ attributes, setAttributes, clientId }) {
	const [deviceType, setDeviceType] = useState('desktop');

	const {
		blockId,
		variant,
		barLength,
		barWidth,
		fillColor,
		trackColor,
		borderRadius,
		ringSize,
		ringStrokeWidth,
		ringFillColor,
		ringTrackColor,
		ringTextColor,
		ringFontSize,
		verticalPosition,
		verticalOffset,
		horizontalPosition,
		horizontalOffset,
		zIndex,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [blockId, clientId, setAttributes]);

	const blockProps = useBlockProps({
		id: blockId || undefined,
		className: `adaire-progress-block adaire-progress-block--${variant}`,
		style: {
			"--progress-fill-color": fillColor,
			"--progress-track-color": trackColor,
			"--progress-bar-length": `${getDeviceValue(barLength, 'desktop', 4)}px`,
			"--progress-bar-length-tablet": `${getDeviceValue(barLength, 'tablet', 3)}px`,
			"--progress-bar-length-mobile": `${getDeviceValue(barLength, 'mobile', 2)}px`,
			"--progress-bar-length-watch": `${getDeviceValue(barLength, 'smartwatch', 2)}px`,
			"--progress-bar-width": `${getDeviceValue(barWidth, 'desktop', 20)}vw`,
			"--progress-bar-width-tablet": `${getDeviceValue(barWidth, 'tablet', 25)}vw`,
			"--progress-bar-width-mobile": `${getDeviceValue(barWidth, 'mobile', 30)}vw`,
			"--progress-bar-width-watch": `${getDeviceValue(barWidth, 'smartwatch', 40)}vw`,
			"--progress-border-radius": `${borderRadius}px`,
			"--progress-ring-size": `${getDeviceValue(ringSize, 'desktop', 60)}px`,
			"--progress-ring-size-tablet": `${getDeviceValue(ringSize, 'tablet', 50)}px`,
			"--progress-ring-size-mobile": `${getDeviceValue(ringSize, 'mobile', 40)}px`,
			"--progress-ring-size-watch": `${getDeviceValue(ringSize, 'smartwatch', 30)}px`,
			"--progress-ring-stroke-width": `${getDeviceValue(ringStrokeWidth, 'desktop', 4)}px`,
			"--progress-ring-stroke-width-tablet": `${getDeviceValue(ringStrokeWidth, 'tablet', 3)}px`,
			"--progress-ring-stroke-width-mobile": `${getDeviceValue(ringStrokeWidth, 'mobile', 3)}px`,
			"--progress-ring-stroke-width-watch": `${getDeviceValue(ringStrokeWidth, 'smartwatch', 2)}px`,
			"--progress-ring-fill-color": ringFillColor,
			"--progress-ring-track-color": ringTrackColor,
			"--progress-ring-text-color": ringTextColor,
			"--progress-ring-font-size": `${getDeviceValue(ringFontSize, 'desktop', 16)}px`,
			"--progress-ring-font-size-tablet": `${getDeviceValue(ringFontSize, 'tablet', 14)}px`,
			"--progress-ring-font-size-mobile": `${getDeviceValue(ringFontSize, 'mobile', 12)}px`,
			"--progress-ring-font-size-watch": `${getDeviceValue(ringFontSize, 'smartwatch', 10)}px`,
			position: "fixed",
			top: verticalPosition === "top" && verticalOffset > 0 ? `${verticalOffset}%` : "auto",
			bottom: verticalPosition === "bottom" && verticalOffset > 0 ? `${verticalOffset}%` : "auto",
			left: horizontalPosition === "left" && horizontalOffset > 0 ? `${horizontalOffset}%` : "auto",
			right: horizontalPosition === "right" && horizontalOffset > 0 ? `${horizontalOffset}%` : "auto",
			zIndex: zIndex,
		},
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title="Responsive Settings" initialOpen={false}>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label="Device Preview"
					/>
				</PanelBody>

				<PanelBody title={__("Progress Type", "progress-block")} initialOpen={true}>
					<SelectControl
						label={__("Variant", "progress-block")}
						value={variant}
						options={[
							{ label: __("Bar", "progress-block"), value: "bar" },
							{ label: __("Ring", "progress-block"), value: "ring" },
						]}
						onChange={(value) => setAttributes({ variant: value })}
					/>
				</PanelBody>

				{variant === "bar" && (
					<>
						<PanelBody title={__("Bar Styling", "progress-block")} initialOpen={true}>
							<RangeControl
								label={__("Length (Height)", "progress-block")}
								value={getDeviceValue(barLength, deviceType, deviceType === 'desktop' ? 4 : deviceType === 'tablet' ? 3 : deviceType === 'mobile' ? 2 : 2)}
								onChange={(value) => setAttributes({ barLength: updateDeviceAttribute(barLength, deviceType, value) })}
								min={2}
								max={20}
							/>
							<RangeControl
								label={__("Width (vw)", "progress-block")}
								value={getDeviceValue(barWidth, deviceType, deviceType === 'desktop' ? 20 : deviceType === 'tablet' ? 25 : deviceType === 'mobile' ? 30 : 40)}
								onChange={(value) => setAttributes({ barWidth: updateDeviceAttribute(barWidth, deviceType, value) })}
								min={5}
								max={100}
							/>
							<RangeControl
								label={__("Border Radius", "progress-block")}
								value={borderRadius}
								onChange={(value) => setAttributes({ borderRadius: value })}
								min={0}
								max={50}
							/>
						</PanelBody>

						<PanelColorSettings
							title={__("Bar Colors", "progress-block")}
							initialOpen={false}
							colorSettings={[
								{
									value: fillColor,
									onChange: (value) => setAttributes({ fillColor: value }),
									label: __("Fill Color", "progress-block"),
								},
								{
									value: trackColor,
									onChange: (value) => setAttributes({ trackColor: value }),
									label: __("Track Color", "progress-block"),
								},
							]}
						/>
					</>
				)}

				{variant === "ring" && (
					<>
						<PanelBody title={__("Ring Styling", "progress-block")} initialOpen={true}>
							<RangeControl
								label={__("Ring Size", "progress-block")}
								value={getDeviceValue(ringSize, deviceType, deviceType === 'desktop' ? 60 : deviceType === 'tablet' ? 50 : deviceType === 'mobile' ? 40 : 30)}
								onChange={(value) => setAttributes({ ringSize: updateDeviceAttribute(ringSize, deviceType, value) })}
								min={30}
								max={200}
							/>
							<RangeControl
								label={__("Stroke Width", "progress-block")}
								value={ringStrokeWidth}
								onChange={(value) => setAttributes({ ringStrokeWidth: value })}
								min={1}
								max={20}
							/>
							<RangeControl
								label={__("Font Size", "progress-block")}
								value={ringFontSize}
								onChange={(value) => setAttributes({ ringFontSize: value })}
								min={10}
								max={48}
							/>
						</PanelBody>

						<PanelColorSettings
							title={__("Ring Colors", "progress-block")}
							initialOpen={false}
							colorSettings={[
								{
									value: ringFillColor,
									onChange: (value) => setAttributes({ ringFillColor: value }),
									label: __("Fill Color", "progress-block"),
								},
								{
									value: ringTrackColor,
									onChange: (value) => setAttributes({ ringTrackColor: value }),
									label: __("Track Color", "progress-block"),
								},
								{
									value: ringTextColor,
									onChange: (value) => setAttributes({ ringTextColor: value }),
									label: __("Text Color", "progress-block"),
								},
							]}
						/>
					</>
				)}

				<PanelBody title={__("Position", "progress-block")} initialOpen={false}>
					<SelectControl
						label={__("Vertical Position", "progress-block")}
						value={verticalPosition ?? "bottom"}
						options={[
							{ label: __("Top", "progress-block"), value: "top" },
							{ label: __("Bottom", "progress-block"), value: "bottom" },
						]}
						onChange={(value) => setAttributes({ verticalPosition: value })}
					/>
					<RangeControl
						label={__("Vertical Offset (%)", "progress-block")}
						value={verticalOffset ?? 5}
						onChange={(value) => setAttributes({ verticalOffset: value })}
						min={0}
						max={50}
						help={__("Distance from the selected edge", "progress-block")}
					/>
					<SelectControl
						label={__("Horizontal Position", "progress-block")}
						value={horizontalPosition ?? "right"}
						options={[
							{ label: __("Left", "progress-block"), value: "left" },
							{ label: __("Right", "progress-block"), value: "right" },
						]}
						onChange={(value) => setAttributes({ horizontalPosition: value })}
					/>
					<RangeControl
						label={__("Horizontal Offset (%)", "progress-block")}
						value={horizontalOffset ?? 5}
						onChange={(value) => setAttributes({ horizontalOffset: value })}
						min={0}
						max={50}
						help={__("Distance from the selected edge", "progress-block")}
					/>
					<RangeControl
						label={__("Z-Index", "progress-block")}
						value={zIndex}
						onChange={(value) => setAttributes({ zIndex: value })}
						min={1}
						max={9999}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{variant === "bar" && (
					<div className="adaire-progress-block__bar">
						<div className="adaire-progress-block__track">
							<div className="adaire-progress-block__fill" style={{ width: "50%" }}></div>
						</div>
					</div>
				)}
				{variant === "ring" && (
					<div className="adaire-progress-block__ring">
						<svg className="adaire-progress-block__ring-svg" viewBox="0 0 100 100">
							<circle
								className="adaire-progress-block__ring-track"
								cx="50"
								cy="50"
								r="45"
							/>
							<circle
								className="adaire-progress-block__ring-fill"
								cx="50"
								cy="50"
								r="45"
								style={{ strokeDasharray: "283", strokeDashoffset: "141.5" }}
							/>
						</svg>
						<div className="adaire-progress-block__ring-text">50%</div>
					</div>
				)}
			</div>
		</>
	);
}




