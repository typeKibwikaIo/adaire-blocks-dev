/**
 * Content Switcher (content-toggle-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (line-height, letter-spacing, text-transform) for
 *     the pill label, plus a block-level Font Family control — unconditionally,
 *     for every instance, regardless of whether the user ever opens the new
 *     controls. Posts saved before that change don't have those custom
 *     properties in their stored markup, so re-running the *current* save()
 *     against them would produce a style attribute with extra declarations
 *     that don't match what's stored, and Gutenberg would flag them as
 *     invalid content. No attribute schema changed shape (the new attributes
 *     are purely additive with safe defaults that reproduce the original
 *     hardcoded SCSS values), so `migrate` is a no-op identity function and
 *     this entry doesn't need its own `attributes` key (Gutenberg falls back
 *     to the current block.json attributes when parsing a deprecated entry
 *     that omits one).
 */
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
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
            contentBackgroundColor,
            contentPadding,
            contentBorderRadius,
            contentWidth,
            togglePosition,
            wrapperBackgroundColor,
            wrapperPadding,
            pillAlign,
            animationDuration,
            animationEase,
        } = attributes;

        const blockProps = useBlockProps.save({
            id: blockId || undefined,
            className: "adaire-content-toggle",
            "data-active-toggle": activeToggle,
            "data-animation-duration": animationDuration,
            "data-animation-ease": animationEase,
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
                role="tablist"
                style={{
                    justifyContent: pillAlign || "flex-start",
                }}
            >
                {toggles?.map((toggle, index) => (
                    <button
                        key={toggle.id || index}
                        className={`adaire-content-toggle__pill ${index === activeToggle ? "is-active" : ""
                            }`}
                        data-toggle-index={index}
                        role="tab"
                        aria-selected={index === activeToggle ? "true" : "false"}
                        aria-controls={`panel-${blockId}-${index}`}
                        id={`tab-${blockId}-${index}`}
                        type="button"
                    >
                        {toggle.label}
                    </button>
                ))}
            </div>
        );

        const contentArea = (
            <div className="adaire-content-toggle__content">
                <div className="adaire-content-toggle__panels">
                    <InnerBlocks.Content />
                </div>
            </div>
        );

        return (
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
        );
    },
};

export default [deprecatedV1];
