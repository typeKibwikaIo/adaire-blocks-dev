import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const {
		blockId,
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
		locations,
		activeIndex,
		singleMapMode,
		flyDuration,
	} = attributes;

	const blockProps = useBlockProps.save({
		className: "ad-map",
		style: {
			// Container max width CSS variables
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${
				containerMaxWidth?.desktop?.unit ?? "px"
			}`,
			"--container-max-width-tablet": `${
				containerMaxWidth?.tablet?.value ?? 100
			}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-mobile": `${
				containerMaxWidth?.mobile?.value ?? 100
			}${containerMaxWidth?.mobile?.unit ?? "%"}`,

			// Desktop margins
			marginTop: `${marginTop?.desktop ?? 0}px`,
			marginRight: `${marginRight?.desktop ?? 0}px`,
			marginBottom: `${marginBottom?.desktop ?? 0}px`,
			marginLeft: `${marginLeft?.desktop ?? 0}px`,

			// Responsive margin CSS variables
			"--margin-top-tablet": `${marginTop?.tablet ?? 0}px`,
			"--margin-right-tablet": `${marginRight?.tablet ?? 0}px`,
			"--margin-bottom-tablet": `${marginBottom?.tablet ?? 0}px`,
			"--margin-left-tablet": `${marginLeft?.tablet ?? 0}px`,

			"--margin-top-mobile": `${marginTop?.mobile ?? 0}px`,
			"--margin-right-mobile": `${marginRight?.mobile ?? 0}px`,
			"--margin-bottom-mobile": `${marginBottom?.mobile ?? 0}px`,
			"--margin-left-mobile": `${marginLeft?.mobile ?? 0}px`,

			// Desktop padding
			paddingTop: `${paddingTop?.desktop ?? 0}px`,
			paddingRight: `${paddingRight?.desktop ?? 0}px`,
			paddingBottom: `${paddingBottom?.desktop ?? 0}px`,
			paddingLeft: `${paddingLeft?.desktop ?? 0}px`,

			// Responsive padding CSS variables
			"--padding-top-tablet": `${paddingTop?.tablet ?? 0}px`,
			"--padding-right-tablet": `${paddingRight?.tablet ?? 0}px`,
			"--padding-bottom-tablet": `${paddingBottom?.tablet ?? 0}px`,
			"--padding-left-tablet": `${paddingLeft?.tablet ?? 0}px`,

			"--padding-top-mobile": `${paddingTop?.mobile ?? 0}px`,
			"--padding-right-mobile": `${paddingRight?.mobile ?? 0}px`,
			"--padding-bottom-mobile": `${paddingBottom?.mobile ?? 0}px`,
			"--padding-left-mobile": `${paddingLeft?.mobile ?? 0}px`,

			// Appearance
			"--ad-map-nav-text": attributes.navTextColor || '#333333',
			"--ad-map-nav-active-bg": attributes.navActiveBgColor || '#d52d3a',
			"--ad-map-nav-active-text": attributes.navActiveTextColor || '#ffffff',
			"--ad-map-nav-weight": String(attributes.navFontWeight || '600'),
		},
	});

	return (
		<div {...blockProps} data-block-id={blockId}>
			<div
			className={`ad-map__container ${
					containerMode === "constrained" ? "is-constrained" : ""
			} ${singleMapMode ? 'is-single-map' : ''}`}
			data-fly-duration={typeof flyDuration === 'number' ? String(flyDuration) : undefined}
			>
			<div className="ad-map__box">
				<div className="ad-map__locations">
					<div className="ad-map__locations__list">
						{(locations || []).map((loc, i) => (
							<div 
								className={`ad-map__locations__item ${i === (activeIndex ?? 0) ? 'is-active' : ''}`} 
								data-index={i} 
								{...(typeof loc.lat === 'number' && typeof loc.lng === 'number' ? { 'data-lat': String(loc.lat), 'data-lng': String(loc.lng) } : {})}
								key={loc.id}
							>
								{loc.country}
							</div>
						))}
					</div>
				</div>
				<div className="ad-map__address">
					{(locations || []).map((loc, i) => (
						<div className={`ad-map__address__panel ${i === (activeIndex ?? 0) ? 'is-active' : ''}`} data-index={i} key={loc.id}>
							<div className="ad-map__address__item">
								<h4 className="ad-map__address__title">Address</h4>
								{(loc.addressLines || []).map((line, idx) => (<p key={idx}>{line}</p>))}
							</div>
							{loc.phone && (
								<div className="ad-map__address__item">
									<h4 className="ad-map__address__title">Phone</h4>
									<p>{loc.phone}</p>
								</div>
							)}
							{loc.email && (
								<div className="ad-map__address__item">
									<h4 className="ad-map__address__title">Email</h4>
									<p>{loc.email}</p>
								</div>
							)}
						</div>
					))}
				</div>
				<div className="ad-map__map">
					{singleMapMode ? (
						(() => {
							const hasCoords = (locations || []).some(l => typeof l.lat === 'number' && typeof l.lng === 'number');
							if (hasCoords) {
								return (
									<div className="ad-map__map__panel is-active" data-single="true">
										<div className="ad-map__leaflet" data-initial-index={String(activeIndex ?? 0)}></div>
									</div>
								);
							}
							// Fallback to iframe if no coordinates
							return (
								<div className="ad-map__map__panel is-active" data-single="true">
									{(locations?.[activeIndex ?? 0]?.mapEmbedUrl) ? (
										<iframe
											key={String(activeIndex ?? 0)}
											src={locations?.[activeIndex ?? 0]?.mapEmbedUrl}
											style={{ border: 0, width: '100%', height: '100%' }}
											loading="lazy"
											allowFullScreen
											referrerPolicy="no-referrer-when-downgrade"
											title={`map-${locations?.[activeIndex ?? 0]?.country || 'map'}`}
										/>
									) : null}
								</div>
							);
						})()
					) : (
						(locations || []).map((loc, i) => (
							<div className={`ad-map__map__panel ${i === (activeIndex ?? 0) ? 'is-active' : ''}`} data-index={i} key={loc.id}>
								{loc.mapEmbedUrl ? (
									<iframe
										src={loc.mapEmbedUrl}
										style={{ border: 0, width: '100%', height: '100%' }}
										loading="lazy"
										allowFullScreen
										referrerPolicy="no-referrer-when-downgrade"
										title={`map-${loc.country}`}
									/>
								) : null}
							</div>
						))
					)}
				</div>
			</div>
			</div>
		</div>
	);
}



