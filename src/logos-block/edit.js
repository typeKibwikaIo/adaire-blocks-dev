import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
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
import { useState } from "@wordpress/element";
import InspectorTabs from "../components/InspectorTabs";
import DeviceSwitcher, { THREE_TIERS, DeviceControlInput, getFlatDeviceValue, setFlatDeviceValue } from "../components/DeviceSwitcher";
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';

const FREE_TIER_ITEM_LIMIT = 3;

// The "Gap Between Items" attribute used to be a free-text CSS length
// (e.g. "1rem"); it's now a plain px number driving a RangeControl. Blocks
// saved before that change still have the old string in their attributes,
// so coerce it instead of letting parseFloat("1rem") silently truncate to 1.
const remToPx = (value, fallback = 16) => {
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		if (Number.isFinite(parsed)) {
			return value.trim().endsWith("rem") ? parsed * 16 : parsed;
		}
	}
	return fallback;
};

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
		displayMode = "carousel",
		sliderSpeed = 0.5,
		gap: rawGap = 16,
		pauseOnHover = true,
		grayscaleUntilHover = true,
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

	const gap = remToPx(rawGap);

	const itemsPerRowDesktop = getFlatDeviceValue(attributes, "slidesPerView", "desktop", 4);
	const itemsPerRowTablet = getFlatDeviceValue(attributes, "slidesPerView", "tablet", 3);
	const itemsPerRowMobile = getFlatDeviceValue(attributes, "slidesPerView", "mobile", 2);
	const itemsPerRowMax = { desktop: 8, tablet: 6, mobile: 4 };

	const blockProps = useBlockProps({
		className: `logos-block logos-block-editor${grayscaleUntilHover ? " logos-block--grayscale-until-hover" : ""}`,
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
			link: "",
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

	const updateContainerMaxWidth = (value, unit) => {
		const current = containerMaxWidth?.[deviceType] || {};
		setAttributes({
			containerMaxWidth: {
				...(containerMaxWidth || {}),
				[deviceType]: {
					value,
					unit: unit ?? current.unit ?? (deviceType === "desktop" ? "px" : "%"),
				},
			},
		});
	};

	return (
		<div {...blockProps}>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>

				{/* Content */}
				<PanelBody section="content" title={__("Title", "adaire-blocks")} initialOpen={true}>
					<TextControl
						label={__("Title Text", "adaire-blocks")}
						value={titleText}
						onChange={(value) => setAttributes({ titleText: value })}
						placeholder="Enter title text..."
					/>
				</PanelBody>

				<PanelBody section="content" title={__("Partner Logos", "adaire-blocks")} initialOpen={true}>
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
											↑
										</Button>
									)}
									{index < partnerLogos.length - 1 && (
										<Button
											onClick={() => moveLogo(index, index + 1)}
											isSmall
											variant="secondary"
										>
											↓
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

							<TextControl
								label="Link URL"
								value={logo.link || ""}
								onChange={(value) => updateLogo(index, "link", value)}
								placeholder="https://partner-site.com"
								help="Optional. Makes this logo clickable, opening in a new tab."
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

				{/* Layout */}
				<PanelBody section="layout" title={__("Container Settings", "adaire-blocks")} initialOpen={false}>
					<ButtonGroup>
						{[
							{ label: __("Full Width", "adaire-blocks"), value: "full" },
							{ label: __("Constrained", "adaire-blocks"), value: "constrained" },
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
								{__("Max Width", "adaire-blocks")}
							</p>
							<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
							<DeviceControlInput
								deviceType={deviceType}
								attribute={containerMaxWidth}
								onAttributeChange={updateContainerMaxWidth}
								defaults={{
									desktop: { value: 1200, unit: "px" },
									tablet: { value: 100, unit: "%" },
									mobile: { value: 100, unit: "%" },
								}}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody section="layout" title={__("Display & Behavior", "adaire-blocks")} initialOpen={false}>
					<p style={{ marginBottom: "8px", fontWeight: 600 }}>
						{__("Display Mode", "adaire-blocks")}
					</p>
					<ButtonGroup style={{ marginBottom: "16px" }}>
						{[
							{ label: __("Carousel", "adaire-blocks"), value: "carousel" },
							{ label: __("Grid", "adaire-blocks"), value: "grid" },
						].map((opt) => (
							<Button
								key={opt.value}
								isPrimary={displayMode === opt.value}
								isSecondary={displayMode !== opt.value}
								onClick={() => setAttributes({ displayMode: opt.value })}
							>
								{opt.label}
							</Button>
						))}
					</ButtonGroup>

					{displayMode === "carousel" && (
						<RangeControl
							label={__("Slider Speed", "adaire-blocks")}
							value={sliderSpeed}
							onChange={(value) => setAttributes({ sliderSpeed: value })}
							min={0.1}
							max={3}
							step={0.1}
							help={__(
								"Speed of continuous scrolling (lower = slower)",
								"adaire-blocks",
							)}
						/>
					)}

					<p style={{ marginBottom: "8px", fontWeight: 600 }}>
						{__("Items Per Row", "adaire-blocks")}
					</p>
					<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
					<RangeControl
						value={getFlatDeviceValue(attributes, "slidesPerView", deviceType, itemsPerRowDesktop)}
						onChange={(value) => setFlatDeviceValue(setAttributes, "slidesPerView", deviceType, value)}
						min={1}
						max={itemsPerRowMax[deviceType] ?? 8}
						step={1}
						help={__("Number of logos visible at once for this device", "adaire-blocks")}
					/>

					<RangeControl
						label={__("Gap Between Items (px)", "adaire-blocks")}
						value={gap}
						onChange={(value) => setAttributes({ gap: value })}
						min={0}
						max={60}
						step={1}
						help={__("Space between logos", "adaire-blocks")}
					/>

					{displayMode === "carousel" && (
						<ToggleControl
							label={__("Pause on Hover", "adaire-blocks")}
							checked={pauseOnHover}
							onChange={(value) => setAttributes({ pauseOnHover: value })}
							help={__(
								"Pause scrolling when hovering over the slider",
								"adaire-blocks",
							)}
						/>
					)}
				</PanelBody>

				{/* Style */}
				<PanelBody section="style" priority="high" title={__("Title Style", "adaire-blocks")} initialOpen={false}>
					<RangeControl
						label={__("Font Size (px)", "adaire-blocks")}
						value={titleFontSize}
						onChange={(value) => setAttributes({ titleFontSize: value })}
						min={12}
						max={60}
						step={1}
					/>

					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
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
						label={__("Text Color", "adaire-blocks")}
						color={titleColor}
						onChangeComplete={(color) =>
							setAttributes({ titleColor: color.hex })
						}
						disableAlpha
					/>

					<RangeControl
						label={__("Padding Top (px)", "adaire-blocks")}
						value={titlePaddingTop}
						onChange={(value) => setAttributes({ titlePaddingTop: value })}
						min={0}
						max={100}
						step={5}
					/>

					<RangeControl
						label={__("Padding Bottom (px)", "adaire-blocks")}
						value={titlePaddingBottom}
						onChange={(value) => setAttributes({ titlePaddingBottom: value })}
						min={0}
						max={100}
						step={5}
					/>
				</PanelBody>

				<PanelBody section="style" priority="high" title={__("Logo Style", "adaire-blocks")} initialOpen={false}>
					<RangeControl
						label={__("Logo Height (px)", "adaire-blocks")}
						value={logoHeight}
						onChange={(value) => setAttributes({ logoHeight: value })}
						min={30}
						max={150}
						step={5}
						help={__("Height of logos in pixels", "adaire-blocks")}
					/>

					<ToggleControl
						label={__("Grayscale Until Hover", "adaire-blocks")}
						checked={grayscaleUntilHover}
						onChange={(value) => setAttributes({ grayscaleUntilHover: value })}
						help={__(
							"Show logos in grayscale at rest and reveal full color on hover. Turn off to always show logos in full color.",
							"adaire-blocks",
						)}
					/>

					<ColorPicker
						label={__("Background Color", "adaire-blocks")}
						color={backgroundColor}
						onChangeComplete={(color) =>
							setAttributes({ backgroundColor: color.hex })
						}
						disableAlpha
					/>
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__("Block Spacing", "adaire-blocks")} initialOpen={false}>
					<RangeControl
						label={__("Block Padding Top (px)", "adaire-blocks")}
						value={blockPaddingTop}
						onChange={(value) => setAttributes({ blockPaddingTop: value })}
						min={0}
						max={200}
						step={10}
						help={__("Space above the entire block", "adaire-blocks")}
					/>

					<RangeControl
						label={__("Block Padding Bottom (px)", "adaire-blocks")}
						value={blockPaddingBottom}
						onChange={(value) => setAttributes({ blockPaddingBottom: value })}
						min={0}
						max={200}
						step={10}
						help={__("Space below the entire block", "adaire-blocks")}
					/>
				</PanelBody>

			</InspectorTabs>

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
							{displayMode === "grid"
								? __("Partner Logos Grid Preview", "adaire-blocks")
								: __("Partner Logos Slider Preview", "adaire-blocks")} •{" "}
							{__("Edit in sidebar →", "adaire-blocks")}
						</div>

						{/* Logos Preview */}
						<div
							style={{
								padding: "30px 20px",
								overflow: "hidden",
							}}
						>
							<div
								style={
									displayMode === "grid"
										? {
											display: "grid",
											gridTemplateColumns: `repeat(${itemsPerRowDesktop}, minmax(0, 1fr))`,
											gap: gap,
											alignItems: "center",
											justifyItems: "center",
										}
										: {
											display: "flex",
											gap: gap,
											alignItems: "center",
											justifyContent: "center",
											flexWrap: "wrap",
										}
								}
							>
								{(displayMode === "grid" ? partnerLogos : partnerLogos.slice(0, itemsPerRowDesktop)).map((logo, index) => (
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
												className="logos-block__logo-img"
												src={logo.imageUrl}
												alt={logo.companyName}
												style={{
													maxHeight: `${logoHeight}px`,
													maxWidth: "200px",
													objectFit: "contain",
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

							{displayMode === "carousel" && partnerLogos.length > itemsPerRowDesktop && (
								<div
									style={{
										textAlign: "center",
										marginTop: "15px",
										fontSize: "12px",
										color: "#999",
									}}
								>
									{__("+ ", "adaire-blocks")}
									{partnerLogos.length - itemsPerRowDesktop}
									{__(" more logos will scroll continuously", "adaire-blocks")}
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
							🏢
						</div>
						<h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
							{__("Partner Logos Slider", "adaire-blocks")}
						</h3>
						<p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
							{__(
								"Add your partner logos using the sidebar controls to see the preview",
								"adaire-blocks",
							)}
						</p>
					</div>
				)}
				</div>
			</div>
		</div>
	);
}
