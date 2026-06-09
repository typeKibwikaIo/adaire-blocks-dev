import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { MediaUpload } from "@wordpress/media-utils";
import {
	PanelBody,
	TextControl,
	Button,
	RangeControl,
	ToggleControl,
	ColorPicker,
	SelectControl,
	ButtonGroup,
} from "@wordpress/components";
import { desktop, tablet, mobile } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';

const FREE_TIER_ITEM_LIMIT = 3;

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState("desktop");
	
	// Check block limits
	const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
		'logos-block', 
		attributes.partnerLogos || [], 
		'logo'
	);
	
	const {
		partnerLogos = [],
		sliderSpeed = 0.5,
		slidesPerView = 4,
		gap = "1rem",
		pauseOnHover = true,
		logoHeight = 60,
		backgroundColor = "#ffffff",
		titleText = "Our Partners",
		titleFontSize = 24,
		titleFontWeight = "600",
		titleColor = "#333333",
		titlePaddingTop = 20,
		titlePaddingBottom = 30,
		blockPaddingTop = 40,
		blockPaddingBottom = 40,
		blockId,
		containerMode = "full",
		containerMaxWidth = {
			desktop: { value: 1200, unit: "px" },
			tablet: { value: 100, unit: "%" },
			mobile: { value: 100, unit: "%" }
		}
	} = attributes;

	const blockProps = useBlockProps({
		className: "logos-block logos-block-editor",
		style: {
			backgroundColor: backgroundColor || "#ffffff",
			paddingTop: `${blockPaddingTop}px`,
			paddingBottom: `${blockPaddingBottom}px`,
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? "px"}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? "%"}`,
		}
	});

	// Helper functions
	const updateLogo = (index, field, value) => {
		const newLogos = [...partnerLogos];
		newLogos[index] = { ...newLogos[index], [field]: value };
		setAttributes({ partnerLogos: newLogos });
	};

	const addLogo = () => {
		if (isLimitReached) {
			return; // Don't add if limit reached
		}
		const newLogo = {
			id: Date.now(),
			companyName: `Company ${partnerLogos.length + 1}`,
			imageUrl: "",
			imageId: 0,
		};
		setAttributes({ partnerLogos: [...partnerLogos, newLogo] });
	};

	const removeLogo = (index) => {
		const newLogos = partnerLogos.filter((_, i) => i !== index);
		setAttributes({ partnerLogos: newLogos });
	};

	const moveLogo = (fromIndex, toIndex) => {
		const newLogos = [...partnerLogos];
		const [movedLogo] = newLogos.splice(fromIndex, 1);
		newLogos.splice(toIndex, 0, movedLogo);
		setAttributes({ partnerLogos: newLogos });
	};

	// Remove this function since we're using inline updateLogo calls

	return (
		<div {...blockProps}>
			<InspectorControls>
				
				{/* Container Settings */}
				<PanelBody
					title={__("Container Settings", "logos-block")}
					initialOpen={false}
				>
					<ButtonGroup>
						{[
							{ label: __("Full Width", "logos-block"), value: "full" },
							{ label: __("Constrained", "logos-block"), value: "constrained" },
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
								{__("Max Width", "logos-block")}
							</p>
							<ButtonGroup style={{ marginBottom: "12px" }}>
								<Button
									icon={desktop}
									isPrimary={deviceType === "desktop"}
									onClick={() => setDeviceType("desktop")}
									label={__("Desktop", "logos-block")}
								/>
								<Button
									icon={tablet}
									isPrimary={deviceType === "tablet"}
									onClick={() => setDeviceType("tablet")}
									label={__("Tablet", "logos-block")}
								/>
								<Button
									icon={mobile}
									isPrimary={deviceType === "mobile"}
									onClick={() => setDeviceType("mobile")}
									label={__("Mobile", "logos-block")}
								/>
							</ButtonGroup>
							<div style={{ display: "flex", gap: "8px" }}>
								<TextControl
									type="number"
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
								/>
								<ButtonGroup>
									{["px", "%", "rem", "vw"].map((u) => (
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
					title={__("Title Settings", "logos-block")}
					initialOpen={true}
				>
					<TextControl
						label={__("Title Text", "logos-block")}
						value={titleText}
						onChange={(value) => setAttributes({ titleText: value })}
						placeholder="Enter title text..."
					/>

					<RangeControl
						label={__("Font Size (px)", "logos-block")}
						value={titleFontSize}
						onChange={(value) => setAttributes({ titleFontSize: value })}
						min={12}
						max={60}
						step={1}
					/>

					<SelectControl
						label={__("Font Weight", "logos-block")}
						value={titleFontWeight}
						onChange={(value) => setAttributes({ titleFontWeight: value })}
						options={[
							{ label: "Light (300)", value: "300" },
							{ label: "Normal (400)", value: "400" },
							{ label: "Medium (500)", value: "500" },
							{ label: "Semi Bold (600)", value: "600" },
							{ label: "Bold (700)", value: "700" },
							{ label: "Extra Bold (800)", value: "800" },
						]}
					/>

					<ColorPicker
						label={__("Text Color", "logos-block")}
						color={titleColor}
						onChangeComplete={(color) =>
							setAttributes({ titleColor: color.hex })
						}
						disableAlpha
					/>

					<RangeControl
						label={__("Padding Top (px)", "logos-block")}
						value={titlePaddingTop}
						onChange={(value) => setAttributes({ titlePaddingTop: value })}
						min={0}
						max={100}
						step={5}
					/>

					<RangeControl
						label={__("Padding Bottom (px)", "logos-block")}
						value={titlePaddingBottom}
						onChange={(value) => setAttributes({ titlePaddingBottom: value })}
						min={0}
						max={100}
						step={5}
					/>
				</PanelBody>

				<PanelBody
					title={__("Block Spacing", "logos-block")}
					initialOpen={false}
				>
					<RangeControl
						label={__("Block Padding Top (px)", "logos-block")}
						value={blockPaddingTop}
						onChange={(value) => setAttributes({ blockPaddingTop: value })}
						min={0}
						max={200}
						step={10}
						help={__("Space above the entire block", "logos-block")}
					/>

					<RangeControl
						label={__("Block Padding Bottom (px)", "logos-block")}
						value={blockPaddingBottom}
						onChange={(value) => setAttributes({ blockPaddingBottom: value })}
						min={0}
						max={200}
						step={10}
						help={__("Space below the entire block", "logos-block")}
					/>
				</PanelBody>

				<PanelBody
					title={__("Slider Settings", "logos-block")}
					initialOpen={false}
				>
					<RangeControl
						label={__("Slider Speed", "logos-block")}
						value={sliderSpeed}
						onChange={(value) => setAttributes({ sliderSpeed: value })}
						min={0.1}
						max={3}
						step={0.1}
						help={__(
							"Speed of continuous scrolling (lower = slower)",
							"logos-block",
						)}
					/>

					<RangeControl
						label={__("Slides Per View", "logos-block")}
						value={slidesPerView}
						onChange={(value) => setAttributes({ slidesPerView: value })}
						min={1}
						max={8}
						step={1}
						help={__("Number of logos visible at once", "logos-block")}
					/>

					<TextControl
						label={__("Gap Between Slides", "logos-block")}
						value={gap}
						onChange={(value) => setAttributes({ gap: value })}
						help={__("CSS gap value (e.g., 1rem, 20px)", "logos-block")}
					/>

					<ToggleControl
						label={__("Pause on Hover", "logos-block")}
						checked={pauseOnHover}
						onChange={(value) => setAttributes({ pauseOnHover: value })}
						help={__(
							"Pause scrolling when hovering over the slider",
							"logos-block",
						)}
					/>

					<RangeControl
						label={__("Logo Height (px)", "logos-block")}
						value={logoHeight}
						onChange={(value) => setAttributes({ logoHeight: value })}
						min={30}
						max={150}
						step={5}
						help={__("Height of logos in pixels", "logos-block")}
					/>

					<ColorPicker
						label={__("Background Color", "logos-block")}
						color={backgroundColor}
						onChangeComplete={(color) =>
							setAttributes({ backgroundColor: color.hex })
						}
						disableAlpha
					/>
				</PanelBody>

				<PanelBody title="Partner Logos" initialOpen={true}>
					{partnerLogos.map((logo, index) => (
						<div
							key={logo.id}
							style={{
								border: "1px solid #ddd",
								padding: "10px",
								margin: "10px 0",
								borderRadius: "4px",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: "10px",
								}}
							>
								<h4 style={{ margin: 0 }}>Logo {index + 1}</h4>
								<div style={{ display: "flex", gap: "5px" }}>
									{index > 0 && (
										<Button
											onClick={() => moveLogo(index, index - 1)}
											isSmall
											variant="secondary"
										>
											â†‘
										</Button>
									)}
									{index < partnerLogos.length - 1 && (
										<Button
											onClick={() => moveLogo(index, index + 1)}
											isSmall
											variant="secondary"
										>
											â†“
										</Button>
									)}
								</div>
							</div>

							<TextControl
								label="Company Name"
								value={logo.companyName}
								onChange={(value) => updateLogo(index, "companyName", value)}
								placeholder="Enter company name..."
							/>

							<MediaUpload
								onSelect={(media) => updateLogo(index, "imageUrl", media.url)}
								allowedTypes={["image"]}
								value={logo.imageUrl}
								render={({ open }) => (
									<div>
										<Button onClick={open} isSecondary>
											{logo.imageUrl ? "Change Image" : "Select Image"}
										</Button>
										{logo.imageUrl && (
											<img
												src={logo.imageUrl}
												alt="Logo"
												style={{
													width: "100%",
													height: `${logoHeight}px`,
													objectFit: "contain",
													margin: "5px 0",
													border: "1px solid #ddd",
													borderRadius: "2px",
													padding: "4px",
													backgroundColor: "white",
												}}
											/>
										)}
									</div>
								)}
							/>

							<Button
								onClick={() => removeLogo(index)}
								isDestructive
								isSmall
								style={{ marginTop: "10px" }}
							>
								Remove Logo
							</Button>
						</div>
					))}

					<Button 
						onClick={addLogo} 
						isPrimary
						disabled={ isLimitReached }
					>
						Add Logo
					</Button>
					{ showUpgradeNotice && (
						<UpgradeNotice 
							variant="inline"
							itemType="logo"
							message={upgradeMessage}
						/>
					) }
				</PanelBody>

				<PanelBody title="Block Settings" initialOpen={false}>
					<TextControl
						label="Block ID"
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help="Add a custom ID to this block for CSS targeting or anchor links."
					/>
				</PanelBody>

			</InspectorControls>

			{/* Clean Preview Area */}
			<div className={`logos-block__container ${containerMode === "constrained" ? "is-constrained" : ""}`}>
				<div
					className="logos-block-preview"
					style={{
						borderRadius: "8px",
						border: "1px solid #e0e0e0",
						padding: "20px",
					}}
				>
					{partnerLogos.length > 0 ? (
						<div>
						{/* Title Preview */}
						{titleText && (
							<div
								style={{
									paddingTop: `${titlePaddingTop}px`,
									paddingBottom: `${titlePaddingBottom}px`,
									textAlign: "center",
								}}
							>
								<h2
									style={{
										fontSize: `${titleFontSize}px`,
										fontWeight: titleFontWeight,
										color: titleColor,
										margin: 0,
										fontFamily: "inherit",
									}}
								>
									{titleText}
								</h2>
							</div>
						)}

						<div
							style={{
								textAlign: "center",
								marginBottom: "20px",
								color: "#666",
								fontSize: "14px",
							}}
						>
							{__("Partner Logos Slider Preview", "logos-block")} â€¢{" "}
							{__("Edit in sidebar â†’", "logos-block")}
						</div>

						{/* Slider Preview */}
						<div
							style={{
								padding: "30px 20px",
								overflow: "hidden",
							}}
						>
							<div
								style={{
									display: "flex",
									gap: gap,
									alignItems: "center",
									justifyContent: "center",
									flexWrap: "wrap",
								}}
							>
								{partnerLogos.slice(0, slidesPerView).map((logo, index) => (
									<div
										key={logo.id}
										style={{
											flex: "0 0 auto",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minHeight: "60px",
											minWidth: "120px",
										}}
									>
										{logo.imageUrl ? (
											<img
												src={logo.imageUrl}
												alt={logo.companyName}
												style={{
													maxHeight: `${logoHeight}px`,
													maxWidth: "200px",
													objectFit: "contain",
													opacity: 0.8,
													filter: "grayscale(20%)",
												}}
											/>
										) : (
											<div
												style={{
													width: "120px",
													height: "60px",
													border: "2px dashed #ccc",
													borderRadius: "4px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: "#999",
													fontSize: "12px",
													textAlign: "center",
												}}
											>
												{logo.companyName || `Logo ${index + 1}`}
												<br />
												<span style={{ fontSize: "10px" }}>No Image</span>
											</div>
										)}
									</div>
								))}
							</div>

							{partnerLogos.length > slidesPerView && (
								<div
									style={{
										textAlign: "center",
										marginTop: "15px",
										fontSize: "12px",
										color: "#999",
									}}
								>
									{__("+ ", "intro-block")}
									{partnerLogos.length - slidesPerView}
									{__(" more logos will scroll continuously", "intro-block")}
								</div>
							)}
						</div>
					</div>
				) : (
					<div
						style={{
							textAlign: "center",
							padding: "60px 20px",
						}}
					>
						<div
							style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}
						>
							ðŸ¢
						</div>
						<h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
							{__("Partner Logos Slider", "intro-block")}
						</h3>
						<p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
							{__(
								"Add your partner logos using the sidebar controls to see the preview",
								"intro-block",
							)}
						</p>
					</div>
				)}
				</div>
			</div>
		</div>
	);
}



