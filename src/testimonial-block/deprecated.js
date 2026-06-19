import { useBlockProps } from "@wordpress/block-editor";

// v1: save without responsive padding CSS vars
const deprecated = [
    {
        save({ attributes }) {
            const {
                textColor,
                arrowColor,
                dotColor,
                fontSize,
                textToDisplay,
                slidesPerView,
                spaceBetween,
                gap,
                logoSize,
                loop,
                navigation,
                blockId,
                pagination,
                scrollbar,
                slides,
                testimonials,
                maxWidth,
                cardBackgroundColor,
                blockBackgroundColor,
                logoAlignment,
                containerMode,
                containerMaxWidth,
                cardWidth,
                slidesPerViewMobile,
                slidesPerViewTablet,
                slidesPerViewDesktop,
                cardGap
            } = attributes;

            const blockProps = useBlockProps.save({
                className: "ad-carousel-text-block",
                style: {
                    color: textColor || "#000000",
                    fontSize: `${fontSize || 16}px`,
                    "--text-color": textColor || "#000000",
                    "--card-gap": `${gap || 30}px`,
                    "--logo-size": `${logoSize || 60}px`,
                    "--arrow-color": arrowColor,
                    "--dot-color": dotColor,
                    "--max-width": `${maxWidth || 1200}px`,
                    "--card-bg-color": cardBackgroundColor || "#ffffff",
                    "--logo-alignment": logoAlignment || "center",
                    "--container-max-width": `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
                    "--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
                    "--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
                    "--card-width-desktop": `${cardWidth?.desktop?.value ?? 100}${cardWidth?.desktop?.unit ?? '%'}`,
                    "--card-width-tablet": `${cardWidth?.tablet?.value ?? 100}${cardWidth?.tablet?.unit ?? '%'}`,
                    "--card-width-mobile": `${cardWidth?.mobile?.value ?? 100}${cardWidth?.mobile?.unit ?? '%'}`,
                    "--card-gap-desktop": `${cardGap?.desktop?.value ?? 30}${cardGap?.desktop?.unit ?? 'px'}`,
                    "--card-gap-tablet": `${cardGap?.tablet?.value ?? 20}${cardGap?.tablet?.unit ?? 'px'}`,
                    "--card-gap-mobile": `${cardGap?.mobile?.value ?? 15}${cardGap?.mobile?.unit ?? 'px'}`,
                    ...(blockBackgroundColor && { background: blockBackgroundColor })
                },
                'data-slides-per-view': slidesPerView || 3,
                'data-slides-per-view-mobile': slidesPerViewMobile || 1,
                'data-slides-per-view-tablet': slidesPerViewTablet || 2,
                'data-slides-per-view-desktop': slidesPerViewDesktop || 3,
                'data-space-between': spaceBetween || 50,
                'data-card-gap-desktop': cardGap?.desktop?.value ?? 30,
                'data-card-gap-tablet': cardGap?.tablet?.value ?? 20,
                'data-card-gap-mobile': cardGap?.mobile?.value ?? 15,
                'data-loop': loop ? 'true' : 'false',
                'data-navigation': navigation ? 'true' : 'false',
                'data-pagination': pagination ? 'true' : 'false',
                'data-scrollbar': scrollbar ? 'true' : 'false',
                'data-container-mode': containerMode || 'full',
                "data-slides": slides || 3,
                "data-arrowcolor": arrowColor || "#ff0000",
                id: blockId || undefined
            });

            return (
                <div {...blockProps}>
                    <div className="ad-carousel-text-block__testimonial-carousel">
                        <div className="splide">
                            <div className="splide__track">
                                <div className="splide__list">
                                    {(testimonials || []).map((testimonial, index) => (
                                        <div key={index} className="splide__slide">
                                            <div
                                                className="ad-carousel-text-block__testimonial-card"
                                                style={{ "--logo-size": `${logoSize || 60}px` }}
                                            >
                                                <div className="ad-carousel-text-block__company-logo">
                                                    {testimonial.companyLogo ? (
                                                        <>
                                                            <img
                                                                src={testimonial.companyLogo}
                                                                alt={testimonial.companyName}
                                                                style={{ height: `${logoSize || 60}px`, objectFit: "contain", width: "auto" }}
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                            <div className="ad-carousel-text-block__logo-placeholder" style={{ display: 'none' }}>
                                                                {testimonial.companyName}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="ad-carousel-text-block__logo-placeholder">{testimonial.companyName}</div>
                                                    )}
                                                </div>
                                                <div className="ad-carousel-text-block__quote">"{testimonial.quote}"</div>
                                                <br /><br />
                                                <div className="ad-carousel-text-block__author">
                                                    <div className="ad-carousel-text-block__name">{testimonial.authorName}</div>
                                                    <div className="ad-carousel-text-block__title">{testimonial.authorTitle}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
];

export default deprecated;
