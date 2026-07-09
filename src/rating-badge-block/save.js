import { useBlockProps } from '@wordpress/block-editor';
import { getStyleVars, RatingBadgeView } from './shared';

export default function save( { attributes: a } ) {
	const blockProps = useBlockProps.save( {
		id: a.blockId || undefined,
		className: 'adaire-rating-badge-block',
		style: {
			...getStyleVars( a ),
			'--container-max-width': `${ a.containerMaxWidth?.desktop?.value ?? 1200 }${ a.containerMaxWidth?.desktop?.unit ?? 'px' }`,
			'--container-max-width-tablet': `${ a.containerMaxWidth?.tablet?.value ?? 100 }${ a.containerMaxWidth?.tablet?.unit ?? '%' }`,
			'--container-max-width-mobile': `${ a.containerMaxWidth?.mobile?.value ?? 100 }${ a.containerMaxWidth?.mobile?.unit ?? '%' }`,
		},
	} );

	const containerClasses = [
		'adaire-rating-badge-block__container',
		a.containerMode === 'constrained' ? 'is-constrained' : '',
	].filter( Boolean ).join( ' ' );

	return (
		<div { ...blockProps }>
			<div className={ containerClasses }>
				<div className="adaire-rating-badge-block__list">
					{ ( a.badges || [] ).map( ( badge, i ) => <RatingBadgeView key={ i } badge={ badge } /> ) }
				</div>
			</div>
		</div>
	);
}
