/* global wp */
/**
 * Block Migration — Editor Receiver
 *
 * Loaded inside the hidden iframe that the migration tool opens for each post.
 * Detects ?adaire_auto_migrate=1 in the URL, waits for the Gutenberg editor to
 * finish initialising, saves the post (which serialises all blocks with the
 * current save.js output), then posts a completion message to the parent window.
 *
 * Only runs when both conditions are true:
 *   1. adaire_auto_migrate=1 is present in the query string
 *   2. The page is loaded inside an iframe (window.self !== window.top)
 */
( function () {
	'use strict';

	if (
		! new URLSearchParams( window.location.search ).has( 'adaire_auto_migrate' ) ||
		window.self === window.top
	) {
		return;
	}

	var ORIGIN = window.location.origin;

	function toParent( type, payload ) {
		window.parent.postMessage( Object.assign( { type: type }, payload || {} ), ORIGIN );
	}

	function log( msg ) {
		toParent( 'adaire_migration_log', { message: msg, level: 'info' } );
	}

	function done( success, blocksRecovered, error ) {
		toParent( 'adaire_migration_complete', {
			success: !! success,
			blocksRecovered: blocksRecovered || 0,
			error: error || null,
		} );
	}

	/**
	 * Poll until `test()` returns a truthy value or the timeout expires.
	 */
	function poll( test, intervalMs, timeoutMs ) {
		return new Promise( function ( resolve, reject ) {
			var deadline = Date.now() + timeoutMs;
			var id = setInterval( function () {
				var result;
				try { result = test(); } catch ( e ) { result = false; }
				if ( result ) {
					clearInterval( id );
					resolve( result );
				} else if ( Date.now() >= deadline ) {
					clearInterval( id );
					reject( new Error( 'Timed out after ' + timeoutMs + 'ms' ) );
				}
			}, intervalMs );
		} );
	}

	async function run() {
		try {
			log( 'Migration receiver active — waiting for editor…' );

			// 1. Wait for wp.data and the core/editor store to be registered.
			await poll(
				function () {
					return window.wp &&
						wp.data &&
						wp.data.select( 'core/editor' ) &&
						wp.data.select( 'core/block-editor' );
				},
				300, 20000
			);

			// 2. Wait until the editor has loaded the post content into the store.
			//    getEditedPostAttribute('content') returns undefined until the entity
			//    resolver has finished — once it's a string the editor is ready.
			await poll(
				function () {
					var content = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'content' );
					return typeof content === 'string';
				},
				400, 20000
			);

			// 3. Give block validation a moment to complete.
			await new Promise( function ( r ) { setTimeout( r, 1500 ); } );

			var blocks = wp.data.select( 'core/block-editor' ).getBlocks();
			log( 'Editor ready — ' + blocks.length + ' block(s) — saving…' );

			// 4. Save the post.  This serialises all blocks using the current
			//    save.js, which is the whole point of the migration.
			var saveAction = wp.data.dispatch( 'core/editor' ).savePost();
			if ( saveAction && typeof saveAction.then === 'function' ) {
				await saveAction;
			}

			// 5. Poll until the save request has finished.
			await poll(
				function () { return ! wp.data.select( 'core/editor' ).isSavingPost(); },
				200, 20000
			);

			var succeeded = wp.data.select( 'core/editor' ).didPostSaveRequestSucceed();
			if ( succeeded ) {
				done( true, blocks.length );
			} else {
				done( false, 0, 'Save request did not succeed' );
			}
		} catch ( err ) {
			done( false, 0, err.message || 'Unknown error' );
		}
	}

	// Start after all page scripts have loaded so wp.data is available.
	if ( document.readyState === 'complete' ) {
		run();
	} else {
		window.addEventListener( 'load', run );
	}
} )();
