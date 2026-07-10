const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const path = require( 'path' );

/**
 * `defaultConfig.entry` is a function in current @wordpress/scripts
 * (it scans src/*\/block.json at build time). Spreading it as if it
 * were an object (`...defaultConfig.entry`) yields {}, which silently
 * drops every block entry — the build then emits only editor-panel
 * plus copied block.json/render.php files, and no block gets its
 * index.js. Keep entry as a function and merge the extra entry point
 * inside it.
 *
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
	entry: () => ( {
		...( typeof defaultConfig.entry === 'function'
			? defaultConfig.entry()
			: defaultConfig.entry || {} ),
		'editor-panel/index': path.resolve( __dirname, 'src/editor-panel/index.js' ),
	} ),
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
