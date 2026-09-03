import { Button, ButtonGroup } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { desktop, tablet, mobile } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

// Default tier set (back-compat with every existing DeviceSwitcher call site).
// Blocks with a different tier count (e.g. 3-tier, or +smallLaptop/bigDesktop)
// pass their own `tiers` array instead.
const DEFAULT_TIERS = [
	{ key: "desktop", label: "Desktop", icon: desktop },
	{ key: "tablet", label: "Tablet", icon: tablet },
	{ key: "mobile", label: "Mobile", icon: mobile },
	{ key: "smartwatch", label: "Watch", icon: null, glyph: "⌚" },
];

// 3-tier set (no smartwatch) for blocks that have dropped the watch
// breakpoint. Kept separate from DEFAULT_TIERS since other blocks still
// rely on the 4-tier default.
export const THREE_TIERS = [
	{ key: "desktop", label: "Desktop", icon: desktop },
	{ key: "tablet", label: "Tablet", icon: tablet },
	{ key: "mobile", label: "Mobile", icon: mobile },
];

const SmallLaptopIcon = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
		<path d="M2 19H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
	</svg>
);

const BigDesktopIcon = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="4" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
		<path d="M8 20H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		<rect x="10" y="20" width="4" height="2" rx="0.5" fill="currentColor" />
	</svg>
);

// 5-tier set (adds smallLaptop/bigDesktop) for blocks whose stored attribute
// shape is already keyed by all five breakpoints (horizontal-scroll-carousel-block,
// horizontal-scroll-card-block). Tier COUNT here mirrors those blocks' existing
// data shape as-is — collapsing to 3-tier would be a data migration and is
// deliberately out of scope; this only standardizes the switcher UI/component.
export const FIVE_TIERS = [
	{ key: "mobile", label: "Mobile", icon: mobile },
	{ key: "tablet", label: "Tablet", icon: tablet },
	{ key: "smallLaptop", label: "Small Laptop", icon: SmallLaptopIcon },
	{ key: "desktop", label: "Desktop", icon: desktop },
	{ key: "bigDesktop", label: "Big Desktop", icon: BigDesktopIcon },
];

/**
 * DeviceSwitcher Component
 * The one shared responsive device switcher used across every AdaireBlocks block.
 *
 * @param {Object} props
 * @param {string} props.deviceType - Current selected device key
 * @param {Function} props.setDeviceType - Called with the new device key
 * @param {string} [props.label] - Optional label above the switcher
 * @param {Array} [props.tiers] - Ordered list of { key, label, icon?, glyph? } tiers.
 *                                 Defaults to desktop/tablet/mobile/smartwatch.
 * @param {Function} [props.onReset] - If provided, renders a "Reset to default"
 *                                     button next to the switcher that calls this.
 */
export default function DeviceSwitcher({ deviceType, setDeviceType, label, tiers = DEFAULT_TIERS, onReset }) {
	const [activeDevice, setActiveDevice] = useState(() => {
		if (typeof window === "undefined") {
			return deviceType || tiers[0]?.key;
		}

		return window.localStorage.getItem("adaireResponsiveDevice") || deviceType || tiers[0]?.key;
	});

	useEffect(() => {
		if (deviceType && deviceType !== activeDevice) {
			setActiveDevice(deviceType);
		}
	}, [deviceType]);

	useEffect(() => {
		const handleDeviceChange = (event) => {
			const nextDevice = event.detail?.device;
			if (!nextDevice) {
				return;
			}

			setActiveDevice(nextDevice);
			setDeviceType(nextDevice);
		};

		window.addEventListener("adaire-responsive-device-change", handleDeviceChange);

		return () => {
			window.removeEventListener("adaire-responsive-device-change", handleDeviceChange);
		};
	}, [setDeviceType]);

	const updateDevice = (device) => {
		setActiveDevice(device);
		setDeviceType(device);

		if (typeof window !== "undefined") {
			window.localStorage.setItem("adaireResponsiveDevice", device);
			window.dispatchEvent(
				new CustomEvent("adaire-responsive-device-change", {
					detail: { device },
				})
			);
		}
	};

	return (
		<>
			{(label || onReset) && (
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
					{label && <p style={{ fontWeight: 600, margin: 0 }}>{label}</p>}
					{onReset && (
						<Button variant="link" onClick={onReset} style={{ fontSize: "12px" }}>
							{__("Reset to default")}
						</Button>
					)}
				</div>
			)}
			<ButtonGroup style={{ marginBottom: "12px", display: "flex" }}>
				{tiers.map((tier) => (
					<Button
						key={tier.key}
						icon={tier.icon || undefined}
						isPrimary={activeDevice === tier.key}
						onClick={() => updateDevice(tier.key)}
						label={tier.label}
						aria-label={`Switch to ${tier.label} view`}
					>
						{!tier.icon && tier.glyph}
					</Button>
				))}
			</ButtonGroup>
		</>
	);
}

/**
 * DeviceControlInput Component
 * A reusable input control for device-specific values
 *
 * @param {Object} props - Component props
 * @param {string} props.deviceType - Current selected device type
 * @param {Object} props.attribute - The attribute object containing device-specific values
 * @param {Function} props.onAttributeChange - Function to update the attribute
 * @param {Object} props.defaults - Default values for each device type
 * @param {Array} props.units - Available unit options (default: ['px', '%', 'rem', 'vw'])
 * @param {string} props.label - Optional label for the input
 */
export function DeviceControlInput({
	deviceType,
	attribute,
	onAttributeChange,
	defaults = { desktop: { value: 1200, unit: 'px' }, tablet: { value: 100, unit: '%' }, mobile: { value: 100, unit: '%' }, smartwatch: { value: 100, unit: '%' } },
	units = ['px', '%', 'rem', 'vw'],
	label
}) {
	const currentValue = attribute?.[deviceType];
	const defaultForDevice = defaults[deviceType] || defaults.desktop;
	const value = currentValue?.value ?? defaultForDevice.value;
	const unit = currentValue?.unit ?? defaultForDevice.unit;

	return (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<div style={{ flex: 1, minWidth: "80px" }}>
				{label && <p style={{ marginBottom: "4px", fontSize: "12px" }}>{label}</p>}
				<input
					type="number"
					value={value}
					onChange={(e) => onAttributeChange(Number(e.target.value))}
					style={{
						width: "100%",
						padding: "6px 8px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						fontSize: "13px"
					}}
				/>
			</div>
			<ButtonGroup>
				{units.map((u) => (
					<Button
						key={u}
						isPrimary={unit === u}
						isSecondary={unit !== u}
						onClick={() => onAttributeChange(value, u)}
						style={{ fontSize: "12px", padding: "0 8px" }}
					>
						{u}
					</Button>
				))}
			</ButtonGroup>
		</div>
	);
}

/**
 * Helper function to get device-specific value with fallback
 *
 * @param {Object} attribute - The attribute object containing device-specific values
 * @param {string} device - The device type to get value for
 * @param {*} defaultValue - Default value if attribute is missing
 * @returns {*} The device-specific value or default
 */
export function getDeviceValue(attribute, device, defaultValue) {
	return attribute?.[device] ?? defaultValue;
}

/**
 * Helper function to update device-specific attribute
 *
 * @param {Object} currentAttr - Current attribute object
 * @param {string} device - Device type to update
 * @param {*} newValue - New value for the device
 * @returns {Object} Updated attribute object
 */
export function updateDeviceAttribute(currentAttr, device, newValue) {
	return {
		...(currentAttr || {}),
		[device]: newValue,
	};
}

/**
 * Helper function to generate CSS variables for device-specific values
 *
 * @param {Object} attribute - The attribute object containing device-specific values
 * @param {string} cssVarName - Base CSS variable name
 * @param {Object} defaults - Default values for each device
 * @returns {Object} CSS variables for each device
 */
export function generateDeviceCSSVariables(attribute, cssVarName, defaults) {
	return {
		[`--${cssVarName}`]: `${attribute?.desktop?.value ?? defaults.desktop.value}${attribute?.desktop?.unit ?? defaults.desktop.unit}`,
		[`--${cssVarName}-tablet`]: `${attribute?.tablet?.value ?? defaults.tablet.value}${attribute?.tablet?.unit ?? defaults.tablet.unit}`,
		[`--${cssVarName}-mobile`]: `${attribute?.mobile?.value ?? defaults.mobile.value}${attribute?.mobile?.unit ?? defaults.mobile.unit}`,
		[`--${cssVarName}-watch`]: `${attribute?.smartwatch?.value ?? defaults.smartwatch.value}${attribute?.smartwatch?.unit ?? defaults.smartwatch.unit}`,
	};
}

/**
 * Flat-suffixed attribute adapter (e.g. slidesPerViewMobile/Tablet/Desktop).
 * Lets a block with per-device attributes named `${prefix}${Device}` drive the
 * same DeviceSwitcher-based UI as blocks using a single nested-object attribute,
 * without changing the block's attribute shape.
 *
 * @param {string} device - device key, e.g. "mobile"
 * @returns {string} the flat attribute suffix, e.g. "Mobile"
 */
function capitalize( device ) {
	return device.charAt( 0 ).toUpperCase() + device.slice( 1 );
}

export function getFlatDeviceValue( attributes, prefix, device, defaultValue ) {
	const key = `${ prefix }${ capitalize( device ) }`;
	return attributes?.[ key ] ?? defaultValue;
}

export function setFlatDeviceValue( setAttributes, prefix, device, value ) {
	const key = `${ prefix }${ capitalize( device ) }`;
	setAttributes( { [ key ]: value } );
}


/**
 * BreakpointNote — the one way a panel says which breakpoint its controls are
 * editing.
 *
 * Responsive-scoped controls live in panels away from the switcher itself
 * (Layout > Spacing, Style > Typography …), so each of those panels has to
 * state the active tier. Blocks used to do this three different ways: a bold
 * "Current Breakpoint: Desktop" paragraph, a grey hint paragraph, or a device
 * name baked into every control label ("Button Padding (Desktop)"). This is the
 * single approved form — spec §6.2 and §6.3.
 *
 * @param {Object} props
 * @param {string} props.deviceType   Current device key.
 * @param {Array}  [props.tiers]      Tier set the block uses; defaults to 3-tier.
 * @return {JSX.Element} The note.
 */
export function BreakpointNote( { deviceType, tiers = THREE_TIERS } ) {
	const tier = tiers.find( ( t ) => t.key === deviceType );

	return (
		<p className="adaire-breakpoint-note">
			{ __( 'Editing:', 'adaire-blocks' ) }{ ' ' }
			<strong>{ tier ? tier.label : deviceType }</strong>
		</p>
	);
}
