import { Button, ButtonGroup } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { getBlockTypes } from '@wordpress/blocks';
import { createPortal, useEffect, useMemo, useState } from '@wordpress/element';
import './get-started-tour.scss';

const TOUR_STORAGE_KEY = 'adaireGetStartedTourCompleted';
const TOUR_DISMISSED_KEY = 'adaireGetStartedTourDismissed';
const ADAIRE_NAMESPACES = [ 'create-block/', 'adaire/' ];

const CATEGORY_LABELS = {
	'adaire-layout-hero': 'Hero and layout blocks',
	'adaire-hero-sections': 'Navigation and hero sections',
	'adaire-business': 'Business and portfolio blocks',
	'adaire-marketing-conversion': 'Marketing and conversion blocks',
	'adaire-media-videos': 'Video blocks',
	'adaire-media-images': 'Image and slider blocks',
	'adaire-testimonial': 'Testimonial blocks',
	'adaire-content-tabs': 'Tabbed content blocks',
	'adaire-content-expandable': 'Expandable content blocks',
	'adaire-content-info': 'Content information blocks',
	'adaire-social-engagement': 'Social engagement blocks',
	'adaire-effects-interactions': 'Effects and interaction blocks',
	'adaire-blog-content': 'Blog content blocks',
	'adaire-start-actions': 'Action and trigger blocks',
};

const getAdaireBlocks = () =>
	getBlockTypes()
		.filter( ( block ) =>
			ADAIRE_NAMESPACES.some( ( namespace ) =>
				block.name?.startsWith( namespace )
			)
		)
		.sort( ( first, second ) => first.title.localeCompare( second.title ) );

const getGroupedBlocks = ( blocks ) =>
	blocks.reduce( ( groups, block ) => {
		const category = block.category || 'adaire-other';
		return {
			...groups,
			[ category ]: [ ...( groups[ category ] || [] ), block ],
		};
	}, {} );

const getCategorySummary = ( category, blocks ) => {
	const titles = blocks.map( ( block ) => block.title ).slice( 0, 6 );
	const extraCount = blocks.length - titles.length;

	return `${ CATEGORY_LABELS[ category ] || category }: ${ titles.join( ', ' ) }${
		extraCount > 0 ? `, and ${ extraCount } more` : ''
	}.`;
};

const buildTourSteps = ( blocks ) => {
	const groupedBlocks = getGroupedBlocks( blocks );
	const categorySteps = Object.entries( groupedBlocks ).map(
		( [ category, categoryBlocks ] ) => ( {
			title: CATEGORY_LABELS[ category ] || category,
			description: getCategorySummary( category, categoryBlocks ),
			items: categoryBlocks.slice( 0, 8 ).map( ( block ) => ( {
				label: block.title,
				description: block.description || 'Use this block to build a reusable GutenBlocks section.',
			} ) ),
		} )
	);

	return [
		{
			title: 'Welcome to GutenBlocks Blocks',
			description:
				'This quick tour shows where to find the blocks, how to edit them, and how to use the shared responsive preview system.',
			items: [
				{
					label: 'Add blocks',
					description:
						'Click the block inserter and search for GutenBlocks blocks by name or category.',
				},
				{
					label: 'Edit settings',
					description:
						'Select a block and use the right sidebar panels to change content, style, layout, animations, media, and behavior.',
				},
			],
		},
		{
			title: 'Responsive preview',
			description:
				'Use the GutenBlocks responsive toolbar to preview Desktop, Tablet, Mobile, and Smartwatch layouts before saving.',
			items: [
				{
					label: 'Custom dimensions',
					description:
						'Type width and height values, change zoom, or rotate the viewport like Chrome DevTools.',
				},
				{
					label: 'Per-device controls',
					description:
						'Block responsive controls sync with the global device selector so each device can be adjusted independently.',
				},
			],
		},
		...categorySteps,
		{
			title: 'You are ready to build',
			description:
				'Add a block, select it, customize its sidebar controls, then test the design with the responsive preview before publishing.',
			items: [
				{
					label: 'Restart this tour',
					description:
						'Use the GutenBlocks Guide button in the editor toolbar whenever you want to review these steps again.',
				},
			],
		},
	];
};

function AdaireGetStartedTour() {
	const [ toolbarTarget, setToolbarTarget ] = useState( null );
	const [ isOpen, setIsOpen ] = useState( () => {
		if ( typeof window === 'undefined' ) {
			return false;
		}

		return (
			window.localStorage.getItem( TOUR_STORAGE_KEY ) !== 'true' &&
			window.localStorage.getItem( TOUR_DISMISSED_KEY ) !== 'true'
		);
	} );
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const blocks = useMemo( getAdaireBlocks, [] );
	const steps = useMemo( () => buildTourSteps( blocks ), [ blocks ] );
	const step = steps[ currentStep ] || steps[ 0 ];
	const isLastStep = currentStep === steps.length - 1;

	useEffect( () => {
		const interval = window.setInterval( () => {
			const target = document.querySelector(
				'.edit-post-header-toolbar, .editor-header__toolbar, .interface-interface-skeleton__header'
			);

			if ( target ) {
				setToolbarTarget( target );
				window.clearInterval( interval );
			}
		}, 250 );

		return () => window.clearInterval( interval );
	}, [] );

	const closeTour = ( completed = false ) => {
		setIsOpen( false );

		if ( typeof window !== 'undefined' ) {
			window.localStorage.setItem(
				completed ? TOUR_STORAGE_KEY : TOUR_DISMISSED_KEY,
				'true'
			);
		}
	};

	const openTour = () => {
		setCurrentStep( 0 );
		setIsOpen( true );
	};

	const nextStep = () => {
		if ( isLastStep ) {
			closeTour( true );
			return;
		}

		setCurrentStep( ( value ) => value + 1 );
	};

	const toolbar = (
		<Button
			isSecondary
			className="adaire-tour-launcher"
			onClick={ openTour }
			aria-label="Have a tour of GutenBlocks blocks"
		>
			Have a tour
		</Button>
	);

	const tour = isOpen ? (
		<div className="adaire-tour" role="dialog" aria-modal="true" aria-labelledby="adaire-tour-title">
			<div className="adaire-tour__backdrop" onClick={ () => closeTour( false ) } />
			<div className="adaire-tour__card">
				<div className="adaire-tour__header">
					<span className="adaire-tour__eyebrow">Step { currentStep + 1 } of { steps.length }</span>
					<h2 id="adaire-tour-title">{ step.title }</h2>
					<p>{ step.description }</p>
				</div>
				{ step.items?.length > 0 && (
					<div className="adaire-tour__items">
						{ step.items.map( ( item ) => (
							<div className="adaire-tour__item" key={ `${ step.title }-${ item.label }` }>
								<strong>{ item.label }</strong>
								<span>{ item.description }</span>
							</div>
						) ) }
					</div>
				) }
				<div className="adaire-tour__progress" aria-hidden="true">
					{ steps.map( ( tourStep, index ) => (
						<span
							key={ tourStep.title }
							className={ index <= currentStep ? 'is-active' : '' }
						/>
					) ) }
				</div>
				<div className="adaire-tour__actions">
					<ButtonGroup>
						<Button isSecondary onClick={ () => closeTour( false ) }>
							Skip
						</Button>
						<Button
							isSecondary
							disabled={ currentStep === 0 }
							onClick={ () => setCurrentStep( ( value ) => Math.max( 0, value - 1 ) ) }
						>
							Previous
						</Button>
						<Button isPrimary onClick={ nextStep }>
							{ isLastStep ? 'Got it' : 'Got it, next' }
						</Button>
					</ButtonGroup>
				</div>
			</div>
		</div>
	) : null;

	return (
		<>
			{ toolbarTarget ? createPortal( toolbar, toolbarTarget ) : toolbar }
			{ tour }
		</>
	);
}

registerPlugin( 'adaire-get-started-tour', {
	render: AdaireGetStartedTour,
} );


