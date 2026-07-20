const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const TerserPlugin = require( 'terser-webpack-plugin' );

/**
 * Terser `parallel: false` mirrors the free-version scaffold config:
 * parallel minification spawns one worker per core, which has crashed
 * builds on this machine with a native V8 out-of-memory error that
 * `--max-old-space-size` cannot fix (workers don't inherit it). Other
 * Terser options are copied from the @wordpress/scripts default so
 * translator comments and i18n function names are still preserved.
 */
module.exports = {
	...defaultConfig,
	output: {
		...defaultConfig.output,
		clean: false,
	},
	optimization: {
		...defaultConfig.optimization,
		minimizer: [
			new TerserPlugin( {
				parallel: false,
				terserOptions: {
					output: {
						comments: /translators:/i,
					},
					compress: {
						passes: 2,
					},
					mangle: {
						reserved: [ '__', '_n', '_nx', '_x' ],
					},
				},
				extractComments: false,
			} ),
		],
	},
};
