const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	output: {
		...defaultConfig.output,
		clean: false,
	},
	entry: {
		...( defaultConfig.entry || {} ),
		'editor-panel/index': path.resolve( __dirname, 'src/editor-panel/index.js' ),
	},
};
