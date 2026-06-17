import InspectorTabs from '../components/InspectorTabs';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import {
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

// ─── Helpers ────────────────────────────────────────────────────────────────

function ColorPicker( { label, value, onChange } ) {
	return (
		<AdaireColorControl label={ label } value={ value } onChange={ onChange } />
	);
}

function ImageUploader( { label, url, alt, onSelect, onRemove } ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ ( media ) => onSelect( media.url, media.alt || '' ) }
				allowedTypes={ [ 'image' ] }
				render={ ( { open } ) => (
					<div style={ { marginBottom: 16 } }>
						<p style={ { margin: '0 0 6px', fontSize: 12, fontWeight: 600 } }>{ label }</p>
						{ url ? (
							<>
								<img
									src={ url }
									alt={ alt }
									style={ { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 6 } }
								/>
								<div style={ { display: 'flex', gap: 8 } }>
									<Button variant="secondary" size="small" onClick={ open }>
										{ __( 'Change' ) }
									</Button>
									<Button variant="link" isDestructive size="small" onClick={ onRemove }>
										{ __( 'Remove' ) }
									</Button>
								</div>
							</>
						) : (
							<Button
								variant="secondary"
								onClick={ open }
								style={ { width: '100%', justifyContent: 'center' } }
							>
								{ __( 'Upload / Select Image' ) }
							</Button>
						) }
					</div>
				) }
			/>
		</MediaUploadCheck>
	);
}

// ─── Edit ───────────────────────────────────────────────────────────────────

export default function Edit( { attributes: a, setAttributes } ) {
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );
	const [activeZone, setActiveZone] = useState(null);

	const blockProps = useBlockProps( {
		className: 'adaire-about',
		style: {
			'--ab-bg'     : a.backgroundColor || '#0a0a0a',
			'--ab-text'   : a.textColor       || '#ffffff',
			'--ab-muted'  : a.mutedColor      || 'rgba(255,255,255,0.6)',
			'--ab-divider': a.dividerColor    || 'rgba(255,255,255,0.1)',
			backgroundColor: a.backgroundColor || '#0a0a0a',
			paddingTop    : `${ a.paddingTop    ?? 64 }px`,
			paddingBottom : `${ a.paddingBottom ?? 64 }px`,
			color         : a.textColor       || '#ffffff',
		},
	} );

	const imgPlaceholder = ( label ) => (
		<div
			style={ {
				background: 'rgba(255,255,255,0.06)',
				border: '2px dashed rgba(255,255,255,0.15)',
				borderRadius: 4,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 220,
				color: 'rgba(255,255,255,0.35)',
				fontSize: 13,
			} }
		>
			{ label }
		</div>
	);

	return (
		<>
			{ /* ── Sidebar ─────────────────────────────────────── */ }
			<InspectorTabs attributes={a} setAttributes={setAttributes}>
				<PanelBody title={ __( 'Hero', 'about-us-block' ) } initialOpen>
					<ToggleControl
						label={ __( 'Show scroll button' ) }
						checked={ a.showScrollButton }
						onChange={ set( 'showScrollButton' ) }
					/>
					{ a.showScrollButton && (
						<TextControl
							label={ __( 'Scroll button label' ) }
							value={ a.scrollButtonText }
							onChange={ set( 'scrollButtonText' ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Images' ) } initialOpen={ false }>
					<ImageUploader
						label={ __( 'Main image' ) }
						url={ a.imageUrl1 }
						alt={ a.imageAlt1 }
						onSelect={ ( url, alt ) => setAttributes( { imageUrl1: url, imageAlt1: alt } ) }
						onRemove={ () => setAttributes( { imageUrl1: '', imageAlt1: '' } ) }
					/>
					<ImageUploader
						label={ __( 'Secondary image' ) }
						url={ a.imageUrl2 }
						alt={ a.imageAlt2 }
						onSelect={ ( url, alt ) => setAttributes( { imageUrl2: url, imageAlt2: alt } ) }
						onRemove={ () => setAttributes( { imageUrl2: '', imageAlt2: '' } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors' ) } initialOpen={ false }>
					<ColorPicker label="Background"  value={ a.backgroundColor || '#0a0a0a' }              onChange={ set( 'backgroundColor' ) } />
					<ColorPicker label="Text"        value={ a.textColor       || '#ffffff' }              onChange={ set( 'textColor' ) } />
					<ColorPicker label="Muted text"  value={ a.mutedColor      || 'rgba(255,255,255,0.6)' } onChange={ set( 'mutedColor' ) } />
					<ColorPicker label="Dividers"    value={ a.dividerColor    || 'rgba(255,255,255,0.1)' } onChange={ set( 'dividerColor' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Spacing' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Padding top (px)' ) }    value={ a.paddingTop    ?? 64 } onChange={ set( 'paddingTop' ) }    min={ 0 } max={ 200 } />
					<RangeControl label={ __( 'Padding bottom (px)' ) } value={ a.paddingBottom ?? 64 } onChange={ set( 'paddingBottom' ) } min={ 0 } max={ 200 } />
				</PanelBody>
			</InspectorTabs>

			{ /* ── Canvas ─────────────────────────────────────── */ }
			<section { ...blockProps }>

				{ /* 1 · Hero zone */ }
				<div className="adaire-about__hero">
					<div className="adaire-about__hero-copy">
						<RichText
							tagName="h1"
							className="adaire-about__heading"
							value={ a.heading }
							onChange={ set( 'heading' ) }
							placeholder={ __( 'About us.' ) }
							allowedFormats={ [] }
						/>
						<RichText
							tagName="p"
							className="adaire-about__tagline"
							value={ a.tagline }
							onChange={ set( 'tagline' ) }
							placeholder={ __( 'One-line tagline…' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
						<RichText
							tagName="p"
							className="adaire-about__mission"
							value={ a.mission }
							onChange={ set( 'mission' ) }
							placeholder={ __( 'Mission statement…' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</div>
					{ a.showScrollButton && (
						<QuickZone
							id="scroll-cta"
							label="Scroll Button"
							activeZone={activeZone}
							setActiveZone={setActiveZone}
							content={
								<TextControl
									label={ __( 'Scroll button label' ) }
									value={ a.scrollButtonText }
									onChange={ set( 'scrollButtonText' ) }
								/>
							}
						>
						<div className="adaire-about__scroll-btn">
							{ a.scrollButtonText || 'Scroll' }
						</div>
						</QuickZone>
					) }
				</div>

				{ /* 2 · Statement zone */ }
				<div className="adaire-about__statement-zone">
					<RichText
						tagName="p"
						className="adaire-about__statement"
						value={ a.statement }
						onChange={ set( 'statement' ) }
						placeholder={ __( 'Large pull-quote statement…' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
				</div>

				{ /* 3 · Media grid: 4 zones */ }
				<div className="adaire-about__media">
					{ /* Zone A: main image */ }
					<QuickZone
						id="main-image"
						label="Main Image"
						activeZone={activeZone}
						setActiveZone={setActiveZone}
						content={
							<ImageUploader
								label={ __( 'Main image' ) }
								url={ a.imageUrl1 }
								alt={ a.imageAlt1 }
								onSelect={ ( url, alt ) => setAttributes( { imageUrl1: url, imageAlt1: alt } ) }
								onRemove={ () => setAttributes( { imageUrl1: '', imageAlt1: '' } ) }
							/>
						}
					>
					<div className="adaire-about__zone-main-img">
						{ a.imageUrl1
							? <img className="adaire-about__img" src={ a.imageUrl1 } alt={ a.imageAlt1 } />
							: imgPlaceholder( __( '🖼 Main image — upload in sidebar' ) )
						}
					</div>
					</QuickZone>

					{ /* Zone B: caption */ }
					<div className="adaire-about__zone-caption">
						<RichText
							tagName="p"
							className="adaire-about__caption"
							value={ a.caption }
							onChange={ set( 'caption' ) }
							placeholder={ __( 'Image caption or short statement…' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</div>

					{ /* Zone C: body text */ }
					<div className="adaire-about__zone-body">
						<RichText
							tagName="p"
							className="adaire-about__body"
							value={ a.bodyText }
							onChange={ set( 'bodyText' ) }
							placeholder={ __( 'Body text…' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</div>

					<QuickZone
							id="secondary-image"
							label="Secondary Image"
							activeZone={activeZone}
							setActiveZone={setActiveZone}
							content={
								<ImageUploader
									label={ __( 'Secondary image' ) }
									url={ a.imageUrl2 }
									alt={ a.imageAlt2 }
									onSelect={ ( url, alt ) => setAttributes( { imageUrl2: url, imageAlt2: alt } ) }
									onRemove={ () => setAttributes( { imageUrl2: '', imageAlt2: '' } ) }
								/>
							}
						>
					<div className="adaire-about__zone-sec-img">
						{ a.imageUrl2
							? <img className="adaire-about__img" src={ a.imageUrl2 } alt={ a.imageAlt2 } />
							: imgPlaceholder( __( '🖼 Secondary image — upload in sidebar' ) )
						}
					</div>
					</QuickZone>
				</div>

				{ /* 4 · Closing statement */ }
				<div className="adaire-about__closing-zone">
					<RichText
						tagName="p"
						className="adaire-about__closing"
						value={ a.closingStatement }
						onChange={ set( 'closingStatement' ) }
						placeholder={ __( 'Closing statement…' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
				</div>
			</section>
		</>
	);
}
