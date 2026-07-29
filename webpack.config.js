const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const TerserPlugin = require( 'terser-webpack-plugin' );

/**
 * Terser `parallel: false` mirrors the free-version scaffold config:
 * parallel minification spawns one worker per core, which has crashed
 * builds on this machine with a native V8 out-of-memory error that
 * `--max-old-space-size` cannot fix (workers don't inherit it). Other
 * Terser options are copied from the @wordpress/scripts default so
 * translator comments and i18n function names are still preserved.
 *
 * defaultConfig.entry is a function that auto-discovers every src/*\/block.json
 * (editorScript/viewScript etc.) — wrapped here (not replaced) so that
 * auto-discovery keeps working, with one extra hand-declared entry for the
 * Mega Panel admin editor, which isn't a block and so isn't auto-discovered.
 */
module.exports = {
	...defaultConfig,
	entry: () => ( {
		...( typeof defaultConfig.entry === 'function'
			? defaultConfig.entry()
			: defaultConfig.entry ),
		'dashboard/mega-menu/panel-editor': path.resolve(
			__dirname,
			'src/dashboard/mega-menu/panel-editor.js'
		),
	} ),
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
