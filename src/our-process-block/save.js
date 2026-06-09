import { useBlockProps, RichText } from "@wordpress/block-editor";

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const resolveStepLink = (rawLink) => {
    const trimmed = rawLink?.trim();
    if (!trimmed) {
        return "";
    }

    if (/^(https?:)?\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (trimmed.startsWith("/")) {
        if (typeof window !== "undefined" && window.location?.origin) {
            return `${window.location.origin.replace(/\/$/, "")}${trimmed}`;
        }
        return trimmed;
    }

    return trimmed;
};

export default function save({ attributes }) {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        heading,
        subheading,
        processSteps,
        backgroundColor,
        headingColor,
        subheadingColor,
        boxBackgroundColor,
        boxBorderColor,
        boxHoverBackgroundColor,
        boxHoverBorderColor,
        iconColor,
        titleColor,
        headingFontSize,
        subheadingFontSize,
        titleFontSize,
        iconSize,
        boxPadding,
        boxBorderRadius,
        boxBorderWidth,
        gridColumns,
        gridGap,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    } = attributes;

    const gridColumnsDesktop = gridColumns?.desktop ?? 3;
    const gridColumnsTablet = gridColumns?.tablet ?? Math.min(gridColumnsDesktop, 4);
    const gridColumnsMobile = gridColumns?.mobile ?? 1;

    const gridGapDesktop = gridGap?.desktop ?? 16;
    const gridGapTablet = gridGap?.tablet ?? gridGapDesktop;
    const gridGapMobile = gridGap?.mobile ?? gridGapTablet;

    const blockProps = useBlockProps.save({
        id: blockId || undefined,
        className: "adaire-our-process",
        style: {
            "--process-bg": backgroundColor,
            "--process-heading-color": headingColor,
            "--process-subheading-color": subheadingColor,
            "--process-box-bg": boxBackgroundColor,
            "--process-box-border": boxBorderColor,
            "--process-box-hover-bg": boxHoverBackgroundColor,
            "--process-box-hover-border": boxHoverBorderColor,
            "--process-icon-color": iconColor,
            "--process-title-color": titleColor,
            "--process-heading-size": formatDimensionValue(
                headingFontSize?.desktop,
                48,
                "px",
            ),
            "--process-heading-size-tablet": formatDimensionValue(
                headingFontSize?.tablet,
                36,
                "px",
            ),
            "--process-heading-size-mobile": formatDimensionValue(
                headingFontSize?.mobile,
                28,
                "px",
            ),
            "--process-subheading-size": formatDimensionValue(
                subheadingFontSize?.desktop,
                18,
                "px",
            ),
            "--process-subheading-size-tablet": formatDimensionValue(
                subheadingFontSize?.tablet,
                16,
                "px",
            ),
            "--process-subheading-size-mobile": formatDimensionValue(
                subheadingFontSize?.mobile,
                14,
                "px",
            ),
            "--process-title-size": formatDimensionValue(
                titleFontSize?.desktop,
                18,
                "px",
            ),
            "--process-title-size-tablet": formatDimensionValue(
                titleFontSize?.tablet,
                16,
                "px",
            ),
            "--process-title-size-mobile": formatDimensionValue(
                titleFontSize?.mobile,
                14,
                "px",
            ),
            "--process-icon-size": `${iconSize}px`,
            "--process-box-padding": `${boxPadding}px`,
            "--process-box-radius": `${boxBorderRadius}px`,
            "--process-box-border-width": `${boxBorderWidth}px`,
            "--process-grid-columns": `${gridColumnsDesktop}`,
            "--process-grid-columns-tablet": `${gridColumnsTablet}`,
            "--process-grid-columns-mobile": `${gridColumnsMobile}`,
            "--process-grid-gap": `${gridGapDesktop}px`,
            "--process-grid-gap-tablet": `${gridGapTablet}px`,
            "--process-grid-gap-mobile": `${gridGapMobile}px`,
            "--container-max-width-mobile": formatDimensionValue(
                containerMaxWidth?.mobile,
                100,
                "%",
            ),
            "--container-max-width-tablet": formatDimensionValue(
                containerMaxWidth?.tablet,
                100,
                "%",
            ),
            "--container-max-width-small-laptop": formatDimensionValue(
                containerMaxWidth?.smallLaptop,
                1200,
                "px",
            ),
            "--container-max-width": formatDimensionValue(
                containerMaxWidth?.desktop,
                1200,
                "px",
            ),
            "--container-max-width-big-desktop": formatDimensionValue(
                containerMaxWidth?.bigDesktop,
                1200,
                "px",
            ),
            "--process-padding-top": `${paddingTop?.desktop ?? 80}px`,
            "--process-padding-right": `${paddingRight?.desktop ?? 20}px`,
            "--process-padding-bottom": `${paddingBottom?.desktop ?? 80}px`,
            "--process-padding-left": `${paddingLeft?.desktop ?? 20}px`,
            "--process-padding-top-tablet": `${paddingTop?.tablet ?? paddingTop?.desktop ?? 60}px`,
            "--process-padding-right-tablet": `${paddingRight?.tablet ?? paddingRight?.desktop ?? 20}px`,
            "--process-padding-bottom-tablet": `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? 60}px`,
            "--process-padding-left-tablet": `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? 20}px`,
            "--process-padding-top-mobile": `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? 40}px`,
            "--process-padding-right-mobile": `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? 20}px`,
            "--process-padding-bottom-mobile": `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? 40}px`,
            "--process-padding-left-mobile": `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? 20}px`,
        },
    });

    const containerClasses = [
        "adaire-our-process__container",
        containerMode === "constrained" ? "is-constrained" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div {...blockProps}>
            <div className={containerClasses}>
                <div className="adaire-our-process__header">
                    <RichText.Content
                        tagName="h2"
                        value={heading}
                        className="adaire-our-process__heading"
                    />
                    <RichText.Content
                        tagName="p"
                        value={subheading}
                        className="adaire-our-process__subheading"
                    />
                </div>

                <div className="adaire-our-process__grid">
                    {processSteps?.map((step, index) => {
                        const href = resolveStepLink(step.linkUrl);
                        const StepTag = href ? "a" : "div";
                        const stepProps = {
                            className: "adaire-our-process__step",
                        };

                        if (href) {
                            stepProps.href = href;
                            stepProps.target = step.openInNewTab ? "_blank" : undefined;
                            stepProps.rel = step.openInNewTab ? "noopener noreferrer" : undefined;
                        }

                        return (
                            <StepTag key={step.id || index} {...stepProps}>
                            <div className="adaire-our-process__step-icon">
                                <i className={step.icon || "bi bi-star"} aria-hidden="true" />
                            </div>
                            <RichText.Content
                                tagName="h3"
                                value={step.title}
                                className="adaire-our-process__step-title"
                            />
                            </StepTag>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}



