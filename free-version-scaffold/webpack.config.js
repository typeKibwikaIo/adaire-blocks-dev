const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const TerserPlugin = require( 'terser-webpack-plugin' );

/**
 * The default @wordpress/scripts webpack config runs Terser with
 * `parallel: true`, which spawns one worker process per CPU core to
 * minify all 28 free blocks concurrently. On this machine that has
 * crashed the free-version build with a native V8 out-of-memory error
 * ("Fatal process out of memory: Re-embedded builtins: set
 * permissions") — a worker process failing to even start its own V8
 * isolate. `--max-old-space-size` on the main `node` process does not
 * help here: it is not inherited by these separate worker processes.
 *
 * Disabling parallel minification trades some build speed for a much
 * lower peak memory footprint, since minification then runs in-process
 * instead of spawning extra Node processes. Terser options below are
 * copied as-is from the @wordpress/scripts default so translator
 * comments and i18n function names are still preserved correctly —
 * only `parallel` changes.
 *
 * This file is copied verbatim into the generated free version by
 * generate-free-version.js's copyScaffoldFiles() and is excluded from
 * the shipped zip by scripts/zip-generated-folder.js. Edit here, not
 * in the generated adaire-blocks-free/ folder (it gets wiped on every
 * regeneration).
 */
module.exports = {
	...defaultConfig,
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
