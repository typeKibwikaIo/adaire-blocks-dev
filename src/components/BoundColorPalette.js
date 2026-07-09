import { ColorPalette, useSettings } from '@wordpress/block-editor';

export default function BoundColorPalette( props ) {
	const [ themeColors ] = useSettings( 'color.palette.theme' );

	const bindColor = ( hex ) => {
		if ( ! hex ) return '';
		const match = ( themeColors || [] ).find( c => c.color === hex );
		return match ? `var(--wp--preset--color--${ match.slug })` : hex;
	};

	const resolveColor = ( v ) => {
		if ( ! v || ! v.startsWith( 'var(--wp--preset--color--' ) ) return v ?? '';
		const slug = v.slice( 'var(--wp--preset--color--'.length, -1 );
		return ( themeColors || [] ).find( c => c.slug === slug )?.color ?? v;
	};

	const { value, onChange, ...rest } = props;
	return (
		<ColorPalette
			{ ...rest }
			value={ resolveColor( value ) }
			onChange={ ( v ) => onChange && onChange( bindColor( v ) ?? '' ) }
		/>
	);
}
