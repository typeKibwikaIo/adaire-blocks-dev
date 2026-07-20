import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	RangeControl,
	TextControl,
	ButtonGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';
import { plus, trash, chevronUp, chevronDown } from '@wordpress/icons';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { THREE_TIERS } from '../components/DeviceSwitcher';
import QuickZone from '../components/QuickZone';

const Edit = ({ attributes, setAttributes, clientId }) => {
	const {
		blockId,
		images = [],
		gap,
		borderRadius,
		containerMode,
		containerMaxWidth,
	} = attributes;

	const [deviceType, setDeviceType] = useState('desktop');
	const [activeZone, setActiveZone] = useState(null);

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: `image-composition-${clientId}` });
		}
	}, [blockId, clientId, setAttributes]);

	// Resets the given responsive attributes back to their block.json defaults —
	// existing values only, nothing new is added.
	const resetToDefaults = (keys) => {
		const blockType = getBlockType('create-block/image-composition-block');
		const defaults = blockType?.attributes || {};
		const resetValues = {};
		keys.forEach((key) => {
			if (defaults[key] && 'default' in defaults[key]) {
				resetValues[key] = defaults[key].default;
			}
		});
		setAttributes(resetValues);
	};

	const blockProps = useBlockProps({
		className: 'adaire-image-composition',
		style: {
			'--adaire-image-composition-gap': `${gap}px`,
			'--adaire-image-composition-radius': `${borderRadius}px`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
		},
	});

	const addImage = () => {
		const newId = images.length > 0 ? Math.max(...images.map((i) => i.id || 0)) + 1 : 1;
		setAttributes({
			images: [
				...images,
				{
					id: newId,
					url: '',
					alt: '',
				},
			],
		});
	};

	const updateImage = (index, field, value) => {
		const next = [...images];
		next[index] = {
			...next[index],
			[field]: value,
		};
		setAttributes({ images: next });
	};

	const removeImage = (index) => {
		const next = images.filter((_, i) => i !== index);
		setAttributes({ images: next });
	};

	const moveImage = (index, direction) => {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= images.length) return;
		const next = [...images];
		[next[index], next[newIndex]] = [next[newIndex], next[index]];
		setAttributes({ images: next });
	};

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody section="content" title={__('Images', 'adaire-blocks')} initialOpen={true}>
					<Button
						variant="primary"
						icon={plus}
						onClick={addImage}
						style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }}
					>
						{__('Add Image', 'adaire-blocks')}
					</Button>

					{images.map((image, index) => (
						<div
							key={image.id || index}
							style={{
								border: '1px solid #ddd',
								borderRadius: 4,
								padding: 12,
								marginBottom: 12,
								background: '#fff',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: 8,
								}}
							>
								<strong>{__('Image', 'adaire-blocks')} {index + 1}</strong>
								<div style={{ display: 'flex', gap: 4 }}>
									<Button
										icon={chevronUp}
										size="small"
										onClick={() => moveImage(index, -1)}
										disabled={index === 0}
									/>
									<Button
										icon={chevronDown}
										size="small"
										onClick={() => moveImage(index, 1)}
										disabled={index === images.length - 1}
									/>
									<Button
										icon={trash}
										isDestructive
										size="small"
										onClick={() => removeImage(index)}
									/>
								</div>
							</div>

							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => {
										if (!media) {
											return;
										}
										const url =
											media.url ||
											media.source_url ||
											(media.sizes && media.sizes.full && media.sizes.full.url) ||
											'';

										const nextImages = [...images];
										const existing = nextImages[index] || {};

										nextImages[index] = {
											...existing,
											id: media.id || existing.id || 0,
											url: url || existing.url || '',
											alt: existing.alt || media.alt || '',
										};

										setAttributes({ images: nextImages });
									}}
									allowedTypes={['image']}
									value={image.id}
									render={({ open }) => (
										<div style={{ marginBottom: 8 }}>
											<Button variant="secondary" onClick={open}>
												{image.url
													? __('Change image', 'adaire-blocks')
													: __('Select image', 'adaire-blocks')}
											</Button>
											{image.url && (
												<div style={{ marginTop: 8 }}>
													<img
														src={image.url}
														alt={image.alt || ''}
														style={{
															width: '100%',
															height: 120,
															objectFit: 'cover',
															borderRadius: 4,
														}}
													/>
												</div>
											)}
										</div>
									)}
								/>
							</MediaUploadCheck>

							<TextControl
								label={__('Alt text', 'adaire-blocks')}
								value={image.alt || ''}
								onChange={(value) => updateImage(index, 'alt', value)}
							/>
						</div>
					))}
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Spacing', 'adaire-blocks')} initialOpen={false}>
					<RangeControl
						label={__('Gap between images (px)', 'adaire-blocks')}
						value={gap}
						onChange={(value) => setAttributes({ gap: value })}
						min={8}
						max={80}
					/>
					<RangeControl
						label={__('Image border radius (px)', 'adaire-blocks')}
						value={borderRadius}
						onChange={(value) => setAttributes({ borderRadius: value })}
						min={0}
						max={40}
					/>
				</PanelBody>

				<PanelBody section="layout" title={__('Container', 'adaire-blocks')} initialOpen={false}>
					<p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Mode', 'adaire-blocks')}</p>
					<ButtonGroup style={{ marginBottom: '16px' }}>
						{[
							{ label: __('Full Width', 'adaire-blocks'), value: 'full' },
							{ label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
						].map((opt) => (
							<Button
								key={opt.value}
								isPrimary={containerMode === opt.value}
								isSecondary={containerMode !== opt.value}
								onClick={() => setAttributes({ containerMode: opt.value })}
							>
								{opt.label}
							</Button>
						))}
					</ButtonGroup>

					{containerMode === 'constrained' && (
						<>
							<p style={{ marginTop: 8, marginBottom: 8, fontWeight: 600 }}>
								{__('Max width', 'adaire-blocks')}
							</p>
							<DeviceSwitcher
								deviceType={deviceType}
								setDeviceType={setDeviceType}
								tiers={THREE_TIERS}
								onReset={() => resetToDefaults(['containerMaxWidth'])}
							/>
							<div style={{ display: 'flex', gap: 8 }}>
								<TextControl
									type="number"
									value={
										containerMaxWidth?.[deviceType]?.value ??
										(deviceType === 'desktop' ? 1200 : 100)
									}
									onChange={(v) =>
										setAttributes({
											containerMaxWidth: {
												...(containerMaxWidth || {}),
												[deviceType]: {
													...(containerMaxWidth?.[deviceType] || {}),
													value: Number(v),
												},
											},
										})
									}
								/>
								<ButtonGroup>
									{['px', '%', 'rem', 'vw'].map((u) => (
										<Button
											key={u}
											isPrimary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === 'desktop' ? 'px' : '%')) === u
											}
											onClick={() =>
												setAttributes({
													containerMaxWidth: {
														...(containerMaxWidth || {}),
														[deviceType]: {
															...(containerMaxWidth?.[deviceType] || {}),
															unit: u,
														},
													},
												})
											}
										>
											{u}
										</Button>
									))}
								</ButtonGroup>
							</div>
						</>
					)}
				</PanelBody>
			</InspectorTabs>

			<div {...blockProps}>
				<div
					className={`adaire-image-composition__container ${
						containerMode === 'constrained' ? 'is-constrained' : ''
					}`}
				>
					<QuickZone
						id="layout"
						label={__('Layout', 'adaire-blocks')}
						activeZone={activeZone}
						setActiveZone={setActiveZone}
						content={
							<>
								<RangeControl
									label={__('Gap between images (px)', 'adaire-blocks')}
									value={gap}
									onChange={(value) => setAttributes({ gap: value })}
									min={8}
									max={80}
								/>
								<RangeControl
									label={__('Image border radius (px)', 'adaire-blocks')}
									value={borderRadius}
									onChange={(value) => setAttributes({ borderRadius: value })}
									min={0}
									max={40}
								/>
							</>
						}
					>
						<div className="adaire-image-composition__grid">
							{images.length === 0 && (
								<div className="adaire-image-composition__placeholder">
									<p>{__('Add images from the sidebar to build your composition.', 'adaire-blocks')}</p>
								</div>
							)}
							{images.map((image, index) => (
								<div
									key={image.id || index}
									className={`adaire-image-composition__item adaire-image-composition__item--pattern-${(index % 4) + 1}`}
								>
									{image.url ? (
										<img src={image.url} alt={image.alt || ''} />
									) : (
										<div className="adaire-image-composition__item-placeholder">
											<span>{__('Select an image', 'adaire-blocks')}</span>
										</div>
									)}
								</div>
							))}
						</div>
					</QuickZone>
				</div>
			</div>
		</>
	);
};

export default Edit;





