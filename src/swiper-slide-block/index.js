import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { useBlockProps, RichText } from '@wordpress/block-editor';

// Import icon component
import SwiperCarouselIcon from '../icons/swiper-carousel';

const deprecated = [
	// v0: legacy markup used Splide slide class only.
	{
		attributes: metadata.attributes,
		save: ({ attributes }) => {
			const {
				imageUrl,
				header,
				text,
				overlayType,
				overlayColor,
				overlayGradient,
				textColor,
				backgroundSize,
				backgroundPosition,
				backgroundRepeat,
				slideBorderRadius,
				slideHoverBorderRadius,
			} = attributes;

			const styles = {
				backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
				backgroundSize,
				backgroundPosition,
				backgroundRepeat,
				color: textColor,
				borderRadius: `${slideBorderRadius}px`,
				'--hover-border-radius': `${slideHoverBorderRadius}px`,
			};

			const overlayStyles = {
				background: overlayType === 'gradient' ? overlayGradient : overlayColor,
			};

			return (
				<div {...useBlockProps.save({ className: 'splide__slide', style: styles })}>
					<div className="splide-slide-overlay" style={overlayStyles}></div>
					<div className="splide-slide-content">
						<RichText.Content tagName="h3" value={header} style={{ color: textColor }} />
						<RichText.Content tagName="p" value={text} style={{ color: textColor }} />
					</div>
				</div>
			);
		},
	},
];

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	deprecated,
	icon: SwiperCarouselIcon,
});



