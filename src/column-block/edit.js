import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit({ attributes }) {
	const { width } = attributes;

	const blockProps = useBlockProps( {
		className: 'adaire-column',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
	} );

	return <div { ...innerBlocksProps } />;
}