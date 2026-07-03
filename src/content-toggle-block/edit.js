import { __, sprintf } from "@wordpress/i18n";
import {
    useBlockProps,
    PanelColorSettings,
    useInnerBlocksProps,
} from "@wordpress/block-editor";
import {
    PanelBody,
    ButtonGroup,
    Button,
    RangeControl,
    TextControl,
    SelectControl,
    BaseControl,
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { plus, trash, arrowUp, arrowDown, desktop, tablet, mobile } from "@wordpress/icons";
import QuickZone from "../components/QuickZone";
import InspectorTabs from "../components/InspectorTabs";
import "./editor.scss";

const CONTAINER_MODES = [
    { label: __("Full Width", "content-toggle-block"), value: "full" },
    { label: __("Constrained", "content-toggle-block"), value: "constrained" },
];

const PILL_STYLES = [
    { label: __("Default", "content-toggle-block"), value: "default" },
    { label: __("Rounded", "content-toggle-block"), value: "rounded" },
    { label: __("Outlined", "content-toggle-block"), value: "outlined" },
    { label: __("Filled", "content-toggle-block"), value: "filled" },
];

const TOGGLE_POSITIONS = [
    { label: __("Top", "content-toggle-block"), value: "top" },
    { label: __("Bottom", "content-toggle-block"), value: "bottom" },
];

const PILL_ALIGN_OPTIONS = [
    { label: __("Left", "content-toggle-block"), value: "flex-start" },
    { label: __("Center", "content-toggle-block"), value: "center" },
    { label: __("Right", "content-toggle-block"), value: "flex-end" },
];

const DEVICE_TYPES = [
    { key: "desktop", label: __("Desktop", "content-toggle-block") },
    { key: "tablet", label: __("Tablet", "content-toggle-block") },
    { key: "mobile", label: __("Mobile", "content-toggle-block") },
];

const TEXT_TRANSFORM_OPTIONS = [
    { label: __("None", "content-toggle-block"), value: "none" },
    { label: __("Uppercase", "content-toggle-block"), value: "uppercase" },
    { label: __("Lowercase", "content-toggle-block"), value: "lowercase" },
    { label: __("Capitalize", "content-toggle-block"), value: "capitalize" },
];

const FONT_FAMILY_OPTIONS = [
    { label: __("Default (inherit theme)", "content-toggle-block"), value: "" },
    { label: __("Arial", "content-toggle-block"), value: "Arial, Helvetica, sans-serif" },
    { label: __("Helvetica", "content-toggle-block"), value: "Helvetica, Arial, sans-serif" },
    { label: __("Georgia", "content-toggle-block"), value: "Georgia, serif" },
    { label: __("Times New Roman", "content-toggle-block"), value: "'Times New Roman', Times, serif" },
    { label: __("Verdana", "content-toggle-block"), value: "Verdana, Geneva, sans-serif" },
    { label: __("Trebuchet MS", "content-toggle-block"), value: "'Trebuchet MS', sans-serif" },
    { label: __("Courier New", "content-toggle-block"), value: "'Courier New', Courier, monospace" },
    { label: __("System UI", "content-toggle-block"), value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const UNIT_OPTIONS = ["px", "%", "rem", "vw"];

const DEFAULT_COLORS = [
    {
        name: __("Dark Navy", "content-toggle-block"),
        slug: "dark-navy",
        color: "#0a0e27",
    },
    {
        name: __("Blue", "content-toggle-block"),
        slug: "blue",
        color: "#3b82f6",
    },
    {
        name: __("White", "content-toggle-block"),
        slug: "white",
        color: "#ffffff",
    },
    {
        name: __("Slate", "content-toggle-block"),
        slug: "slate",
        color: "#94a3b8",
    },
    {
        name: __("Transparent", "content-toggle-block"),
        slug: "transparent",
        color: "transparent",
    },
];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const ContentToggleEdit = ({ attributes, setAttributes, clientId }) => {
    const [contentWidthDeviceType, setContentWidthDeviceType] = useState('desktop');
    const [wrapperPaddingDeviceType, setWrapperPaddingDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);
    
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        toggles,
        activeToggle,
        pillStyle,
        pillBackgroundColor,
        pillActiveBackgroundColor,
        pillTextColor,
        pillActiveTextColor,
        pillBorderColor,
        pillActiveBorderColor,
        pillBorderRadius,
        pillPadding,
        pillGap,
        pillFontSize,
        pillFontWeight,
        pillActiveFontWeight,
        pillLineHeight,
        pillLetterSpacing,
        pillTextTransform,
        fontFamily,
        contentBackgroundColor,
        contentPadding,
        contentBorderRadius,
        contentWidth,
        togglePosition,
        wrapperBackgroundColor,
        wrapperPadding,
        pillAlign,
    } = attributes;

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [blockId, clientId, setAttributes]);

    // Add a new toggle
    const addToggle = () => {
        const newToggle = {
            id: `toggle-${Date.now()}`,
            label: __("New Toggle", "content-toggle-block"),
        };
        setAttributes({ toggles: [...(toggles || []), newToggle] });
    };

    // Remove a toggle
    const removeToggle = (index) => {
        if (toggles && toggles.length > 1) {
            const newToggles = toggles.filter((_, i) => i !== index);
            setAttributes({
                toggles: newToggles,
                activeToggle: activeToggle >= newToggles.length ? newToggles.length - 1 : activeToggle
            });
        }
    };

    // Move toggle up
    const moveToggleUp = (index) => {
        if (index > 0 && toggles) {
            const newToggles = [...toggles];
            [newToggles[index], newToggles[index - 1]] = [
                newToggles[index - 1],
                newToggles[index],
            ];
            setAttributes({ toggles: newToggles });
            // Update active toggle if needed
            if (activeToggle === index) {
                setAttributes({ activeToggle: index - 1 });
            } else if (activeToggle === index - 1) {
                setAttributes({ activeToggle: index });
            }
        }
    };

    // Move toggle down
    const moveToggleDown = (index) => {
        if (index < toggles.length - 1 && toggles) {
            const newToggles = [...toggles];
            [newToggles[index], newToggles[index + 1]] = [
                newToggles[index + 1],
                newToggles[index],
            ];
            setAttributes({ toggles: newToggles });
            // Update active toggle if needed
            if (activeToggle === index) {
                setAttributes({ activeToggle: index + 1 });
            } else if (activeToggle === index + 1) {
                setAttributes({ activeToggle: index });
            }
        }
    };

    const updateContainerDimension = (device, property, value) => {
        const next = {
            ...containerMaxWidth,
            [device]: {
                ...containerMaxWidth?.[device],
                [property]: value,
            },
        };
        setAttributes({ containerMaxWidth: next });
    };

    const updateContentWidth = (device, property, value) => {
        const next = {
            ...contentWidth,
            [device]: {
                ...contentWidth?.[device],
                [property]: value,
            },
        };
        setAttributes({ contentWidth: next });
    };

    const updateWrapperPadding = (device, property, value) => {
        // Handle backward compatibility - if wrapperPadding is in old format, convert it
        let currentPadding = wrapperPadding;
        if (wrapperPadding && !wrapperPadding.desktop && (wrapperPadding.top !== undefined || wrapperPadding.left !== undefined)) {
            // Old format detected - convert to new format
            currentPadding = {
                desktop: {
                    top: wrapperPadding.top ?? 0,
                    right: wrapperPadding.right ?? 0,
                    bottom: wrapperPadding.bottom ?? 0,
                    left: wrapperPadding.left ?? 0,
                },
                tablet: {
                    top: wrapperPadding.top ?? 0,
                    right: wrapperPadding.right ?? 0,
                    bottom: wrapperPadding.bottom ?? 0,
                    left: wrapperPadding.left ?? 0,
                },
                mobile: {
                    top: wrapperPadding.top ?? 0,
                    right: wrapperPadding.right ?? 0,
                    bottom: wrapperPadding.bottom ?? 0,
                    left: wrapperPadding.left ?? 0,
                },
            };
        }
        
        const next = {
            ...currentPadding,
            [device]: {
                ...currentPadding?.[device],
                [property]: value,
            },
        };
        setAttributes({ wrapperPadding: next });
    };

    const blockProps = useBlockProps({
        id: blockId || undefined,
        className: "adaire-content-toggle",
        style: {
            "--pill-bg": pillBackgroundColor,
            "--pill-active-bg": pillActiveBackgroundColor,
            "--pill-text": pillTextColor,
            "--pill-active-text": pillActiveTextColor,
            "--pill-border": pillBorderColor,
            "--pill-active-border": pillActiveBorderColor,
            "--pill-border-radius": `${pillBorderRadius}px`,
            "--pill-padding-top": `${pillPadding?.top ?? 12}px`,
            "--pill-padding-right": `${pillPadding?.right ?? 24}px`,
            "--pill-padding-bottom": `${pillPadding?.bottom ?? 12}px`,
            "--pill-padding-left": `${pillPadding?.left ?? 24}px`,
            "--pill-gap": `${pillGap}px`,
            "--pill-font-size": `${pillFontSize}px`,
            "--pill-font-weight": pillFontWeight,
            "--pill-active-font-weight": pillActiveFontWeight,
            "--pill-line-height": pillLineHeight || "normal",
            "--pill-letter-spacing": pillLetterSpacing || "normal",
            "--pill-text-transform": pillTextTransform || "none",
            "--content-toggle-font-family": fontFamily || "inherit",
            "--content-bg": contentBackgroundColor,
            "--content-padding-top": `${contentPadding?.top ?? 40}px`,
            "--content-padding-right": `${contentPadding?.right ?? 40}px`,
            "--content-padding-bottom": `${contentPadding?.bottom ?? 40}px`,
            "--content-padding-left": `${contentPadding?.left ?? 40}px`,
            "--content-border-radius": `${contentBorderRadius}px`,
            "--content-width": formatDimensionValue(
                contentWidth?.desktop,
                100,
                "%",
            ),
            "--content-width-tablet": formatDimensionValue(
                contentWidth?.tablet,
                100,
                "%",
            ),
            "--content-width-mobile": formatDimensionValue(
                contentWidth?.mobile,
                100,
                "%",
            ),
            "--container-max-width": formatDimensionValue(
                containerMaxWidth?.desktop,
                1200,
                "px",
            ),
            "--container-max-width-tablet": formatDimensionValue(
                containerMaxWidth?.tablet,
                100,
                "%",
            ),
            "--container-max-width-mobile": formatDimensionValue(
                containerMaxWidth?.mobile,
                100,
                "%",
            ),
            "--wrapper-bg": wrapperBackgroundColor,
            "--wrapper-padding-top": `${wrapperPadding?.desktop?.top ?? wrapperPadding?.top ?? 0}px`,
            "--wrapper-padding-right": `${wrapperPadding?.desktop?.right ?? wrapperPadding?.right ?? 0}px`,
            "--wrapper-padding-bottom": `${wrapperPadding?.desktop?.bottom ?? wrapperPadding?.bottom ?? 0}px`,
            "--wrapper-padding-left": `${wrapperPadding?.desktop?.left ?? wrapperPadding?.left ?? 0}px`,
            "--wrapper-padding-top-tablet": `${wrapperPadding?.tablet?.top ?? wrapperPadding?.desktop?.top ?? wrapperPadding?.top ?? 0}px`,
            "--wrapper-padding-right-tablet": `${wrapperPadding?.tablet?.right ?? wrapperPadding?.desktop?.right ?? wrapperPadding?.right ?? 0}px`,
            "--wrapper-padding-bottom-tablet": `${wrapperPadding?.tablet?.bottom ?? wrapperPadding?.desktop?.bottom ?? wrapperPadding?.bottom ?? 0}px`,
            "--wrapper-padding-left-tablet": `${wrapperPadding?.tablet?.left ?? wrapperPadding?.desktop?.left ?? wrapperPadding?.left ?? 0}px`,
            "--wrapper-padding-top-mobile": `${wrapperPadding?.mobile?.top ?? wrapperPadding?.tablet?.top ?? wrapperPadding?.desktop?.top ?? wrapperPadding?.top ?? 0}px`,
            "--wrapper-padding-right-mobile": `${wrapperPadding?.mobile?.right ?? wrapperPadding?.tablet?.right ?? wrapperPadding?.desktop?.right ?? wrapperPadding?.right ?? 0}px`,
            "--wrapper-padding-bottom-mobile": `${wrapperPadding?.mobile?.bottom ?? wrapperPadding?.tablet?.bottom ?? wrapperPadding?.desktop?.bottom ?? wrapperPadding?.bottom ?? 0}px`,
            "--wrapper-padding-left-mobile": `${wrapperPadding?.mobile?.left ?? wrapperPadding?.tablet?.left ?? wrapperPadding?.desktop?.left ?? wrapperPadding?.left ?? 0}px`,
            "--pill-align": pillAlign,
        },
    });

    const containerClasses = [
        "adaire-content-toggle__container",
        containerMode === "constrained" ? "is-constrained" : "",
    ]
        .filter(Boolean)
        .join(" ");

    const pillsContent = (
        <div 
            className={`adaire-content-toggle__pills adaire-content-toggle__pills--${pillStyle}`}
            style={{
                justifyContent: pillAlign || "flex-start",
            }}
        >
            {toggles?.map((toggle, index) => (
                <QuickZone
                    key={toggle.id || index}
                    id={`toggle-pill-${toggle.id || index}`}
                    label="Toggle Label"
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <TextControl
                            label={__("Label", "content-toggle-block")}
                            value={toggle.label}
                            onChange={(value) => {
                                const newToggles = [...toggles];
                                newToggles[index] = { ...newToggles[index], label: value };
                                setAttributes({ toggles: newToggles });
                            }}
                        />
                    }
                >
                    <button
                        className={`adaire-content-toggle__pill ${index === activeToggle ? "is-active" : ""
                            }`}
                        onClick={() => setAttributes({ activeToggle: index })}
                        type="button"
                    >
                        {toggle.label}
                    </button>
                </QuickZone>
            ))}
        </div>
    );

    // Template for content toggle panel blocks
    const ALLOWED_BLOCKS = ['create-block/content-toggle-panel-block'];
    const TEMPLATE = toggles?.map((toggle, index) => [
        'create-block/content-toggle-panel-block',
        { 
            toggleLabel: toggle.label,
            toggleId: toggle.id,
            toggleIndex: index,
            isActive: index === activeToggle
        }
    ]) || [];

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-content-toggle__panels' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: 'all', // Lock to prevent adding/removing blocks manually
            renderAppender: false,
        }
    );

    const contentArea = (
        <div className="adaire-content-toggle__content">
            <div {...innerBlocksProps} />
        </div>
    );

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody title={__("Layout", "content-toggle-block")} initialOpen={true}>
                    <p>{__("Container Width", "content-toggle-block")}</p>
                    <ButtonGroup>
                        {CONTAINER_MODES.map((mode) => (
                            <Button
                                key={mode.value}
                                isPrimary={containerMode === mode.value}
                                onClick={() => setAttributes({ containerMode: mode.value })}
                            >
                                {mode.label}
                            </Button>
                        ))}
                    </ButtonGroup>

                    <div className="adaire-content-toggle__dimension-controls">
                        {DEVICE_TYPES.map((device) => (
                            <div
                                key={device.key}
                                className="adaire-content-toggle__dimension-row"
                            >
                                <strong>{device.label}</strong>
                                <div className="adaire-content-toggle__dimension-inputs">
                                    {(() => {
                                        const unit =
                                            containerMaxWidth?.[device.key]?.unit ??
                                            (device.key === "desktop" ? "px" : "%");
                                        const value =
                                            containerMaxWidth?.[device.key]?.value ??
                                            (unit === "px"
                                                ? device.key === "desktop"
                                                    ? 1200
                                                    : 600
                                                : 100);
                                        const min =
                                            unit === "px"
                                                ? device.key === "desktop"
                                                    ? 400
                                                    : 200
                                                : 10;
                                        const max =
                                            unit === "px"
                                                ? device.key === "desktop"
                                                    ? 2000
                                                    : 1200
                                                : 100;

                                        return (
                                            <RangeControl
                                                label={__("Max Width", "content-toggle-block")}
                                                value={value}
                                                onChange={(rangeValue) =>
                                                    updateContainerDimension(
                                                        device.key,
                                                        "value",
                                                        rangeValue,
                                                    )
                                                }
                                                min={min}
                                                max={max}
                                                step={unit === "px" ? 10 : 1}
                                            />
                                        );
                                    })()}
                                    <ButtonGroup>
                                        {UNIT_OPTIONS.map((unit) => (
                                            <Button
                                                key={unit}
                                                isSmall
                                                isPrimary={
                                                    containerMaxWidth?.[device.key]?.unit === unit
                                                }
                                                onClick={() =>
                                                    updateContainerDimension(device.key, "unit", unit)
                                                }
                                            >
                                                {unit}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                    </div>

                    <SelectControl
                        label={__("Toggle Position", "content-toggle-block")}
                        value={togglePosition}
                        options={TOGGLE_POSITIONS}
                        onChange={(value) => setAttributes({ togglePosition: value })}
                    />

                    <PanelColorSettings
                        title={__("Wrapper Background", "content-toggle-block")}
                        initialOpen={false}
                        colorSettings={[
                            {
                                value: wrapperBackgroundColor,
                                onChange: (value) => setAttributes({ wrapperBackgroundColor: value }),
                                label: __("Background", "content-toggle-block"),
                                colors: DEFAULT_COLORS,
                            },
                        ]}
                    />

                    <BaseControl label={__("Wrapper Padding", "content-toggle-block")}>
                        <ButtonGroup style={{ marginBottom: "12px" }}>
                            <Button
                                icon={desktop}
                                isPrimary={wrapperPaddingDeviceType === "desktop"}
                                onClick={() => setWrapperPaddingDeviceType("desktop")}
                                label={__("Desktop", "content-toggle-block")}
                            />
                            <Button
                                icon={tablet}
                                isPrimary={wrapperPaddingDeviceType === "tablet"}
                                onClick={() => setWrapperPaddingDeviceType("tablet")}
                                label={__("Tablet", "content-toggle-block")}
                            />
                            <Button
                                icon={mobile}
                                isPrimary={wrapperPaddingDeviceType === "mobile"}
                                onClick={() => setWrapperPaddingDeviceType("mobile")}
                                label={__("Mobile", "content-toggle-block")}
                            />
                        </ButtonGroup>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <RangeControl
                                label={__("Top", "content-toggle-block")}
                                value={wrapperPadding?.[wrapperPaddingDeviceType]?.top ?? wrapperPadding?.desktop?.top ?? wrapperPadding?.top ?? 0}
                                onChange={(value) =>
                                    updateWrapperPadding(wrapperPaddingDeviceType, "top", value)
                                }
                                min={0}
                                max={120}
                            />
                            <RangeControl
                                label={__("Right", "content-toggle-block")}
                                value={wrapperPadding?.[wrapperPaddingDeviceType]?.right ?? wrapperPadding?.desktop?.right ?? wrapperPadding?.right ?? 0}
                                onChange={(value) =>
                                    updateWrapperPadding(wrapperPaddingDeviceType, "right", value)
                                }
                                min={0}
                                max={120}
                            />
                            <RangeControl
                                label={__("Bottom", "content-toggle-block")}
                                value={wrapperPadding?.[wrapperPaddingDeviceType]?.bottom ?? wrapperPadding?.desktop?.bottom ?? wrapperPadding?.bottom ?? 0}
                                onChange={(value) =>
                                    updateWrapperPadding(wrapperPaddingDeviceType, "bottom", value)
                                }
                                min={0}
                                max={120}
                            />
                            <RangeControl
                                label={__("Left", "content-toggle-block")}
                                value={wrapperPadding?.[wrapperPaddingDeviceType]?.left ?? wrapperPadding?.desktop?.left ?? wrapperPadding?.left ?? 0}
                                onChange={(value) =>
                                    updateWrapperPadding(wrapperPaddingDeviceType, "left", value)
                                }
                                min={0}
                                max={120}
                            />
                        </div>
                    </BaseControl>
                </PanelBody>

                <PanelBody
                    title={__("Toggle Management", "content-toggle-block")}
                    initialOpen={false}
                >
                    <p className="adaire-content-toggle__panel-help">
                        {__(
                            "Add, remove, or reorder toggles. Click a toggle in the preview to edit its content.",
                            "content-toggle-block",
                        )}
                    </p>
                    {toggles?.map((toggle, index) => (
                        <div
                            key={toggle.id || index}
                            className="adaire-content-toggle__toggle-control"
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                <strong>
                                    {sprintf(__("Toggle %d", "content-toggle-block"), index + 1)}
                                </strong>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <Button
                                        icon={arrowUp}
                                        onClick={() => moveToggleUp(index)}
                                        isSmall
                                        disabled={index === 0}
                                        label={__("Move Up", "content-toggle-block")}
                                    />
                                    <Button
                                        icon={arrowDown}
                                        onClick={() => moveToggleDown(index)}
                                        isSmall
                                        disabled={index === toggles.length - 1}
                                        label={__("Move Down", "content-toggle-block")}
                                    />
                                    {toggles.length > 1 && (
                                        <Button
                                            icon={trash}
                                            onClick={() => removeToggle(index)}
                                            isSmall
                                            isDestructive
                                            label={__("Remove", "content-toggle-block")}
                                        />
                                    )}
                                </div>
                            </div>
                            <TextControl
                                label={__("Label", "content-toggle-block")}
                                value={toggle.label}
                                onChange={(value) => {
                                    const newToggles = [...toggles];
                                    newToggles[index] = { ...newToggles[index], label: value };
                                    setAttributes({ toggles: newToggles });
                                }}
                            />
                        </div>
                    ))}
                    <Button
                        icon={plus}
                        onClick={addToggle}
                        variant="secondary"
                        style={{ marginTop: "12px" }}
                    >
                        {__("Add Toggle", "content-toggle-block")}
                    </Button>
                </PanelBody>

                <PanelBody
                    title={__("Pill Styling", "content-toggle-block")}
                    initialOpen={false}
                >
                    <SelectControl
                        label={__("Pill Alignment", "content-toggle-block")}
                        value={pillAlign}
                        options={PILL_ALIGN_OPTIONS}
                        onChange={(value) => setAttributes({ pillAlign: value })}
                    />

                    <SelectControl
                        label={__("Pill Style", "content-toggle-block")}
                        value={pillStyle}
                        options={PILL_STYLES}
                        onChange={(value) => setAttributes({ pillStyle: value })}
                    />

                    <RangeControl
                        label={__("Border Radius", "content-toggle-block")}
                        value={pillBorderRadius}
                        onChange={(value) => setAttributes({ pillBorderRadius: value })}
                        min={0}
                        max={50}
                    />

                    <RangeControl
                        label={__("Gap Between Pills", "content-toggle-block")}
                        value={pillGap}
                        onChange={(value) => setAttributes({ pillGap: value })}
                        min={0}
                        max={48}
                    />

                    <RangeControl
                        label={__("Font Size", "content-toggle-block")}
                        value={pillFontSize}
                        onChange={(value) => setAttributes({ pillFontSize: value })}
                        min={12}
                        max={24}
                    />

                    <SelectControl
                        label={__("Font Weight", "content-toggle-block")}
                        value={pillFontWeight}
                        options={[
                            { label: "400", value: "400" },
                            { label: "500", value: "500" },
                            { label: "600", value: "600" },
                            { label: "700", value: "700" },
                        ]}
                        onChange={(value) => setAttributes({ pillFontWeight: value })}
                    />

                    <SelectControl
                        label={__("Active Font Weight", "content-toggle-block")}
                        value={pillActiveFontWeight}
                        options={[
                            { label: "400", value: "400" },
                            { label: "500", value: "500" },
                            { label: "600", value: "600" },
                            { label: "700", value: "700" },
                        ]}
                        onChange={(value) => setAttributes({ pillActiveFontWeight: value })}
                    />

                    <UnitControl
                        label={__("Line Height", "content-toggle-block")}
                        value={pillLineHeight}
                        onChange={(value) => setAttributes({ pillLineHeight: value })}
                    />

                    <UnitControl
                        label={__("Letter Spacing", "content-toggle-block")}
                        value={pillLetterSpacing}
                        onChange={(value) => setAttributes({ pillLetterSpacing: value })}
                    />

                    <SelectControl
                        label={__("Text Transform", "content-toggle-block")}
                        value={pillTextTransform}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(value) => setAttributes({ pillTextTransform: value })}
                    />

                    <SelectControl
                        label={__("Font Family", "content-toggle-block")}
                        value={fontFamily || ""}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__("Applies to the toggle pill labels.", "content-toggle-block")}
                    />

                    <BaseControl label={__("Padding", "content-toggle-block")}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <RangeControl
                                label={__("Top", "content-toggle-block")}
                                value={pillPadding?.top ?? 12}
                                onChange={(value) =>
                                    setAttributes({
                                        pillPadding: { ...pillPadding, top: value },
                                    })
                                }
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__("Right", "content-toggle-block")}
                                value={pillPadding?.right ?? 24}
                                onChange={(value) =>
                                    setAttributes({
                                        pillPadding: { ...pillPadding, right: value },
                                    })
                                }
                                min={0}
                                max={48}
                            />
                            <RangeControl
                                label={__("Bottom", "content-toggle-block")}
                                value={pillPadding?.bottom ?? 12}
                                onChange={(value) =>
                                    setAttributes({
                                        pillPadding: { ...pillPadding, bottom: value },
                                    })
                                }
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__("Left", "content-toggle-block")}
                                value={pillPadding?.left ?? 24}
                                onChange={(value) =>
                                    setAttributes({
                                        pillPadding: { ...pillPadding, left: value },
                                    })
                                }
                                min={0}
                                max={48}
                            />
                        </div>
                    </BaseControl>
                </PanelBody>

                <PanelColorSettings
                    title={__("Pill Colors", "content-toggle-block")}
                    initialOpen={false}
                    colorSettings={[
                        {
                            value: pillBackgroundColor,
                            onChange: (value) => setAttributes({ pillBackgroundColor: value }),
                            label: __("Background", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: pillActiveBackgroundColor,
                            onChange: (value) => setAttributes({ pillActiveBackgroundColor: value }),
                            label: __("Active Background", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: pillTextColor,
                            onChange: (value) => setAttributes({ pillTextColor: value }),
                            label: __("Text Color", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: pillActiveTextColor,
                            onChange: (value) => setAttributes({ pillActiveTextColor: value }),
                            label: __("Active Text Color", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: pillBorderColor,
                            onChange: (value) => setAttributes({ pillBorderColor: value }),
                            label: __("Border Color", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: pillActiveBorderColor,
                            onChange: (value) => setAttributes({ pillActiveBorderColor: value }),
                            label: __("Active Border Color", "content-toggle-block"),
                            colors: DEFAULT_COLORS,
                        },
                    ]}
                />

                <PanelBody
                    title={__("Content Styling", "content-toggle-block")}
                    initialOpen={false}
                >
                    <PanelColorSettings
                        title={__("Background Color", "content-toggle-block")}
                        initialOpen={true}
                        colorSettings={[
                            {
                                value: contentBackgroundColor,
                                onChange: (value) => setAttributes({ contentBackgroundColor: value }),
                                label: __("Background", "content-toggle-block"),
                                colors: DEFAULT_COLORS,
                            },
                        ]}
                    />

                    <RangeControl
                        label={__("Border Radius", "content-toggle-block")}
                        value={contentBorderRadius}
                        onChange={(value) => setAttributes({ contentBorderRadius: value })}
                        min={0}
                        max={32}
                    />

                    <BaseControl label={__("Content Width", "content-toggle-block")}>
                        <ButtonGroup style={{ marginBottom: "12px" }}>
                            <Button
                                icon={desktop}
                                isPrimary={contentWidthDeviceType === "desktop"}
                                onClick={() => setContentWidthDeviceType("desktop")}
                                label={__("Desktop", "content-toggle-block")}
                            />
                            <Button
                                icon={tablet}
                                isPrimary={contentWidthDeviceType === "tablet"}
                                onClick={() => setContentWidthDeviceType("tablet")}
                                label={__("Tablet", "content-toggle-block")}
                            />
                            <Button
                                icon={mobile}
                                isPrimary={contentWidthDeviceType === "mobile"}
                                onClick={() => setContentWidthDeviceType("mobile")}
                                label={__("Mobile", "content-toggle-block")}
                            />
                        </ButtonGroup>
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                            {(() => {
                                const unit =
                                    contentWidth?.[contentWidthDeviceType]?.unit ??
                                    (contentWidthDeviceType === "desktop" ? "%" : "%");
                                const value =
                                    contentWidth?.[contentWidthDeviceType]?.value ??
                                    (unit === "%" ? 100 : 1200);
                                const min = unit === "%" ? 10 : 200;
                                const max = unit === "%" ? 100 : 2000;

                                return (
                                    <>
                                        <RangeControl
                                            label={__("Width", "content-toggle-block")}
                                            value={value}
                                            onChange={(rangeValue) =>
                                                updateContentWidth(
                                                    contentWidthDeviceType,
                                                    "value",
                                                    rangeValue
                                                )
                                            }
                                            min={min}
                                            max={max}
                                            step={unit === "%" ? 1 : 10}
                                            style={{ flex: 1 }}
                                        />
                                        <ButtonGroup>
                                            {UNIT_OPTIONS.map((u) => (
                                                <Button
                                                    key={u}
                                                    isSmall
                                                    isPrimary={unit === u}
                                                    onClick={() =>
                                                        updateContentWidth(
                                                            contentWidthDeviceType,
                                                            "unit",
                                                            u
                                                        )
                                                    }
                                                >
                                                    {u}
                                                </Button>
                                            ))}
                                        </ButtonGroup>
                                    </>
                                );
                            })()}
                        </div>
                    </BaseControl>

                    <BaseControl label={__("Padding", "content-toggle-block")}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <RangeControl
                                label={__("Top", "content-toggle-block")}
                                value={contentPadding?.top ?? 40}
                                onChange={(value) =>
                                    setAttributes({
                                        contentPadding: { ...contentPadding, top: value },
                                    })
                                }
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={__("Right", "content-toggle-block")}
                                value={contentPadding?.right ?? 40}
                                onChange={(value) =>
                                    setAttributes({
                                        contentPadding: { ...contentPadding, right: value },
                                    })
                                }
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={__("Bottom", "content-toggle-block")}
                                value={contentPadding?.bottom ?? 40}
                                onChange={(value) =>
                                    setAttributes({
                                        contentPadding: { ...contentPadding, bottom: value },
                                    })
                                }
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={__("Left", "content-toggle-block")}
                                value={contentPadding?.left ?? 40}
                                onChange={(value) =>
                                    setAttributes({
                                        contentPadding: { ...contentPadding, left: value },
                                    })
                                }
                                min={0}
                                max={80}
                            />
                        </div>
                    </BaseControl>
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <div 
                    className={containerClasses}
                    style={{
                        backgroundColor: wrapperBackgroundColor || "transparent",
                    }}
                >
                    <div className={`adaire-content-toggle__wrapper adaire-content-toggle__wrapper--${togglePosition}`}>
                        {togglePosition === "top" && pillsContent}
                        {contentArea}
                        {togglePosition === "bottom" && pillsContent}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContentToggleEdit;



