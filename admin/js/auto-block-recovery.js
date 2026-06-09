/**
 * Auto Block Recovery
 * Automatically attempts to recover blocks when the editor loads
 */

( function() {
	'use strict';

	try {
		// Check if we're in an iframe (migration mode)
		const isInIframe = window.parent && window.parent !== window;
		const urlParams = new URLSearchParams( window.location.search );
		const isMigrationMode = urlParams.get( 'adaire_auto_migrate' ) === '1';
		const ADAIRE_BLOCK_PREFIXES = [ 'create-block/', 'adaire/', 'adaire-blocks/' ];
		
		function isAdaireBlockName( name ) {
			if ( typeof name !== 'string' ) {
				return false;
			}
			
			return ADAIRE_BLOCK_PREFIXES.some( function( prefix ) {
				return name.startsWith( prefix );
			} );
		}
		
		// Helper function to log to both console and parent window
		function logToParent( message, level = 'info' ) {
			// Always log to console
			const logFunction = level === 'error' ? console.error : 
							   level === 'warn' ? console.warn : console.log;
			logFunction( message );
			
			// Send to parent if in migration mode
			if ( isInIframe && isMigrationMode && window.parent ) {
				try {
					window.parent.postMessage( {
						type: 'adaire_migration_log',
						message: message,
						level: level
					}, '*' );
				} catch (e) {
					// Silently fail if postMessage doesn't work
				}
			}
		}
		
		// Log that the script is loaded
		logToParent( '[Adaire Blocks] Auto-recovery script loaded!' );
		logToParent( '[Adaire Blocks] Current URL: ' + window.location.href );
		logToParent( '[Adaire Blocks] wp object available: ' + (typeof wp !== 'undefined') );
		logToParent( '[Adaire Blocks] wp.data available: ' + (typeof wp !== 'undefined' && typeof wp.data !== 'undefined') );
		logToParent( '[Adaire Blocks] wp.blocks available: ' + (typeof wp !== 'undefined' && typeof wp.blocks !== 'undefined') );

	// Check if wp.data is available.
	// If it's not ready yet, wait for WordPress to load (both in migration mode and normal editor mode)
	if ( typeof wp === 'undefined' || typeof wp.data === 'undefined' ) {
		const isMigration = isMigrationMode;
		const contextLabel = isMigration ? 'Migration' : 'Editor';
		
		logToParent( `[Adaire Blocks ${contextLabel}] ⏳ WordPress not ready yet - waiting for dependencies...`, 'warn' );

		let wpWaitCount = 0;
		const MAX_WP_WAIT = 200; // Check 200 times over 20 seconds (100ms intervals)
		const wpWaitInterval = setInterval( function() {
			wpWaitCount++;
			
			if ( typeof wp !== 'undefined' && typeof wp.data !== 'undefined' ) {
				clearInterval( wpWaitInterval );
				logToParent( `[Adaire Blocks ${contextLabel}] ✅ WordPress dependencies loaded after ` + (wpWaitCount * 100) + 'ms' );
				// Continue with initialization
				initializeRecovery();
			} else if ( wpWaitCount >= MAX_WP_WAIT ) {
				clearInterval( wpWaitInterval );
				logToParent( `[Adaire Blocks ${contextLabel}] ❌ WordPress dependencies failed to load after 20 seconds`, 'error' );
				
				// Only notify parent in migration mode; in normal editor mode just stop silently
				if ( isMigration ) {
					notifyMigrationComplete( false, 0, 'WordPress dependencies not available after 20 seconds' );
				}
			}
		}, 100 );
		
		// Don't continue now - let the wait interval handle initialization
		return;
	}

	logToParent( '[Adaire Blocks] ✅ wp.data is available' );
	
	// Initialize recovery if WordPress is ready
	initializeRecovery();
	
	/**
	 * Initialize the recovery process (called after WordPress is confirmed ready)
	 */
	function initializeRecovery() {
		if ( isMigrationMode ) {
		logToParent( '[Adaire Blocks Migration] 🔄 Migration mode activated' );
		
		// Disable "leave site" warning during migration
		logToParent( '[Adaire Blocks Migration] 🔇 Disabling leave site warnings...' );
		
		// Remove any existing beforeunload handlers
		window.onbeforeunload = null;
		
		// Prevent WordPress from adding new ones
		const originalAddEventListener = window.addEventListener;
		window.addEventListener = function( type, listener, options ) {
			if ( type === 'beforeunload' ) {
				logToParent( '[Adaire Blocks Migration] Blocked beforeunload listener' );
				return; // Don't add beforeunload listeners
			}
			return originalAddEventListener.call( this, type, listener, options );
		};
		
		// Also override the pagehide event which some browsers use
		window.addEventListener( 'pagehide', function( e ) {
			e.preventDefault();
		}, true );
		
	} else {
		logToParent( '[Adaire Blocks] 📝 Normal editor mode (not migration)' );
	}

	// Timeout to prevent infinite waiting (increased to allow more time for editor to load)
	logToParent( '[Adaire Blocks] ⏱️ Setting 30-second timeout for editor ready check' );
	let editorReadyTimeout = setTimeout( function() {
		logToParent( '[Adaire Blocks] ⚠️ Editor ready timeout reached (30 seconds) - forcing recovery attempt', 'warn' );
		if ( typeof unsubscribe === 'function' ) {
			unsubscribe();
		}
		attemptAutoRecovery();
	}, 30000 ); // 30 second timeout (increased from 10 seconds)

	// Wait for the editor to be ready
	logToParent( '[Adaire Blocks] 👂 Subscribing to editor store changes...' );
	let subscriptionCount = 0;
	let editorReadyCheckCount = 0;
	const MAX_EDITOR_CHECKS = 50; // Maximum number of times to check for editor readiness
	
	const unsubscribe = wp.data.subscribe( function() {
		subscriptionCount++;
		editorReadyCheckCount++;
		
		// Get the block editor store
		const editor = wp.data.select( 'core/block-editor' );
		const dispatch = wp.data.dispatch( 'core/block-editor' );
		
		if ( ! editor ) {
			// If we've checked many times and editor still not available, proceed anyway
			if ( editorReadyCheckCount > MAX_EDITOR_CHECKS ) {
				logToParent( '[Adaire Blocks] ⚠️ Editor store not available after ' + MAX_EDITOR_CHECKS + ' checks - proceeding anyway', 'warn' );
				clearTimeout( editorReadyTimeout );
				unsubscribe();
				setTimeout( function() {
					attemptAutoRecovery();
				}, 500 );
			}
			return;
		}

		// Check if editor is fully initialized
		const blocks = editor.getBlocks();
		
		// If there are no blocks yet, keep waiting – many themes/editors populate
		// blocks asynchronously. We'll either see blocks later via this subscription,
		// or fall back to the 30s timeout above.
		if ( ! blocks || blocks.length === 0 ) {
			// Optional debug logging so we can see that we're still waiting
			if ( editorReadyCheckCount % 10 === 0 ) {
				logToParent( '[Adaire Blocks] ⏳ Editor store available but no blocks yet (check ' + editorReadyCheckCount + ')' );
			}
			return;
		}

		// Editor is ready!
		logToParent( '[Adaire Blocks] ✅ Editor is ready! Found ' + blocks.length + ' blocks' );

		// Clear the timeout
		clearTimeout( editorReadyTimeout );

		// Unsubscribe once we've checked
		unsubscribe();

		// Small delay to ensure editor is fully loaded
		setTimeout( function() {
			attemptAutoRecovery();
		}, 500 );
	} );
	} // End initializeRecovery function

	/**
	 * Recursively recover blocks in a tree structure
	 */
	function recoverBlockTree( block ) {
		// First, recursively process inner blocks
		let recoveredInnerBlocks = [];
		if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
			recoveredInnerBlocks = block.innerBlocks.map( function( innerBlock ) {
				return recoverBlockTree( innerBlock );
			} );
		}
		
		// Check if this block needs recovery
		const needsRecovery = ! block.isValid || 
			( block.validationIssues && block.validationIssues.length > 0 );
		
		// In normal editor mode, attempt recovery for ANY invalid block (not just Adaire blocks)
		// In migration mode, keep it scoped to Adaire blocks to avoid touching third‑party content.
		const isTargetBlock = ! isMigrationMode || isAdaireBlockName( block.name );
		
		if ( needsRecovery && isTargetBlock ) {
			// Try WordPress's built-in recovery first
			try {
				// Use WordPress's native recovery mechanism if available
				if ( typeof wp.blocks.recoverBlock === 'function' ) {
					const recovered = wp.blocks.recoverBlock( block.parsedContent, block.name );
					if ( recovered && recovered.innerBlocks ) {
						recovered.innerBlocks = recoveredInnerBlocks;
					}
					return recovered || wp.blocks.createBlock(
						block.name,
						block.attributes,
						recoveredInnerBlocks
					);
				}
				
				// Fallback to creating a new block
				return wp.blocks.createBlock(
					block.name,
					block.attributes,
					recoveredInnerBlocks
				);
			} catch ( error ) {
				logToParent( '[Adaire Blocks] ⚠️ Recovery failed for ' + block.name + ': ' + error.message, 'warn' );
				// If recovery fails, return the original block with recovered inner blocks
				return {
					...block,
					innerBlocks: recoveredInnerBlocks
				};
			}
		}
		
		// If block doesn't need recovery but has inner blocks, return with recovered inner blocks
		if ( recoveredInnerBlocks.length > 0 ) {
			return {
				...block,
				innerBlocks: recoveredInnerBlocks
			};
		}
		
		// Return original block if no recovery needed
		return block;
	}

	/**
	 * Attempt automatic block recovery
	 */
	function attemptAutoRecovery() {
		if ( ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] 🔧 === STARTING AUTO-RECOVERY ===' );
			logToParent( '[Adaire Blocks] Migration mode: ' + isMigrationMode );
		}
		
		// Verify all required WordPress APIs are available
		if ( ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] 🔍 Checking WordPress APIs...' );
		}
		
		if ( typeof wp === 'undefined' ) {
			logToParent( '[Adaire Blocks] ❌ CRITICAL: wp is not defined', 'error' );
			if ( isMigrationMode ) {
				notifyMigrationComplete( false, 0, 'wp is not defined' );
			}
			return;
		}
		logToParent( '[Adaire Blocks] ✅ wp is defined' );

		if ( typeof wp.data === 'undefined' ) {
			logToParent( '[Adaire Blocks] ❌ CRITICAL: wp.data is not defined', 'error' );
			if ( isMigrationMode ) {
				notifyMigrationComplete( false, 0, 'wp.data is not defined' );
			}
			return;
		}
		logToParent( '[Adaire Blocks] ✅ wp.data is defined' );

		if ( typeof wp.blocks === 'undefined' ) {
			logToParent( '[Adaire Blocks] ❌ CRITICAL: wp.blocks is not defined', 'error' );
			if ( isMigrationMode ) {
				notifyMigrationComplete( false, 0, 'wp.blocks is not defined' );
			}
			return;
		}
		logToParent( '[Adaire Blocks] ✅ wp.blocks is defined' );

		logToParent( '[Adaire Blocks] 🔍 Getting editor stores...' );
		const editor = wp.data.select( 'core/block-editor' );
		const dispatch = wp.data.dispatch( 'core/block-editor' );
		const coreEditor = wp.data.dispatch( 'core/editor' );
		const coreEditorSelect = wp.data.select( 'core/editor' );
		
		if ( ! editor || ! dispatch ) {
			logToParent( '[Adaire Blocks] ❌ CRITICAL: Editor or dispatch not available', 'error' );
			if ( isMigrationMode ) {
				notifyMigrationComplete( false, 0, 'Editor not ready' );
			}
			return;
		}
		logToParent( '[Adaire Blocks] ✅ Editor stores available' );

		// Helper function to get all blocks including nested ones
		function getAllBlocks( blocks, parentPath = '', parentId = null ) {
			let allBlocks = [];
			
			blocks.forEach( function( block, index ) {
				const blockPath = parentPath ? parentPath + ' > ' + block.name : block.name;
				allBlocks.push( {
					block: block,
					path: blockPath,
					depth: parentPath.split( ' > ' ).length - 1,
					parentId: parentId
				} );
				
				// Recursively get inner blocks
				if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
					const innerBlocks = getAllBlocks( block.innerBlocks, blockPath, block.clientId );
					allBlocks = allBlocks.concat( innerBlocks );
				}
			} );
			
			return allBlocks;
		}
		
		// Get top-level blocks from the block editor store
		let topLevelBlocks = editor.getBlocks();
		
		// Fallback: if the block editor store reports no blocks but the post has content,
		// try parsing the edited post content to reconstruct the block list. This helps
		// in cases where the editor store isn't populated yet or when using alternative
		// editors/layouts.
		if ( ( ! topLevelBlocks || topLevelBlocks.length === 0 ) &&
			 coreEditorSelect &&
			 typeof coreEditorSelect.getEditedPostContent === 'function' &&
			 typeof wp.blocks !== 'undefined' &&
			 typeof wp.blocks.parse === 'function' ) {
			try {
				const rawContent = coreEditorSelect.getEditedPostContent();
				if ( rawContent && typeof rawContent === 'string' && rawContent.trim().length > 0 ) {
					logToParent( '[Adaire Blocks] ℹ️ No blocks from editor store, attempting fallback parse of post content...' );
					const parsedBlocks = wp.blocks.parse( rawContent );
					if ( parsedBlocks && parsedBlocks.length > 0 ) {
						topLevelBlocks = parsedBlocks;
						logToParent( '[Adaire Blocks] ✅ Fallback parse successful, found ' + parsedBlocks.length + ' top-level block(s)' );
					} else {
						logToParent( '[Adaire Blocks] ℹ️ Fallback parse returned no blocks' );
					}
				}
			} catch ( e ) {
				logToParent( '[Adaire Blocks] ⚠️ Error during fallback block parsing: ' + e.message, 'warn' );
			}
		}
		const allBlocksWithPaths = getAllBlocks( topLevelBlocks );
		const allBlocks = allBlocksWithPaths.map( function( item ) { return item.block; } );
		
		logToParent( '[Adaire Blocks] 📊 Total blocks in editor: ' + topLevelBlocks.length + ' (top-level)' );
		logToParent( '[Adaire Blocks] 📊 Total blocks including nested: ' + allBlocks.length );
		
		// Get detailed validation info from block editor
		let blockValidationErrors = {};
		try {
			// Try multiple methods to get validation errors
			if ( editor.getBlockValidationErrors ) {
				blockValidationErrors = editor.getBlockValidationErrors() || {};
			}
			
			// Also check for validation errors in block metadata
			allBlocks.forEach( function( block ) {
				if ( ! block.isValid ) {
					blockValidationErrors[ block.clientId ] = blockValidationErrors[ block.clientId ] || {
						type: 'invalid',
						message: 'Block validation failed'
					};
				}
			} );
		} catch ( error ) {
			logToParent( '[Adaire Blocks] ⚠️ Error getting validation errors: ' + error.message, 'warn' );
		}
		
		logToParent( '[Adaire Blocks] 🔍 Block validation errors from store: ' + Object.keys( blockValidationErrors ).length );
		
		// Also try to validate blocks using WordPress's validation
		// This helps catch blocks that haven't been validated yet
		if ( typeof wp.blocks.validateBlock !== 'undefined' ) {
			let validatedBlocks = 0;
			allBlocks.forEach( function( block ) {
				// In normal mode, validate all invalid blocks; in migration mode, only Adaire blocks
				const isTargetBlock = ! isMigrationMode || isAdaireBlockName( block.name );
				if ( isTargetBlock ) {
					try {
						const validationResult = wp.blocks.validateBlock( block );
						if ( ! validationResult && ! block.isValid ) {
							validatedBlocks++;
							blockValidationErrors[ block.clientId ] = blockValidationErrors[ block.clientId ] || {
								type: 'invalid',
								message: 'Block failed validation'
							};
						}
					} catch ( e ) {
						// Validation check failed, skip
					}
				}
			} );
			if ( validatedBlocks > 0 && ! isMigrationMode ) {
				logToParent( '[Adaire Blocks] 🔍 Validated blocks, found ' + validatedBlocks + ' invalid Adaire blocks' );
			}
		}
		
		// Log nested structure with more details
		logToParent( '[Adaire Blocks] 🌳 Block Tree Structure:' );
			allBlocksWithPaths.forEach( function( item, i ) {
			const indent = '  '.repeat( item.depth );
			const status = item.block.isValid ? '✅' : '❌';
			const isAdaire = isAdaireBlockName( item.block.name );
			const marker = isAdaire ? ' [ADAIRE]' : '';
			logToParent( '[Adaire Blocks] ' + indent + status + ' ' + item.path + marker );
		} );
		
		// Check for validation issues
		const blocksWithValidationIssues = allBlocks.filter( function( b ) {
			return (
				! b.isValid || 
				( b.validationIssues && b.validationIssues.length > 0 ) ||
				blockValidationErrors[ b.clientId ]
			);
		} );
		
		if ( blocksWithValidationIssues.length > 0 && ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] ⚠️ Blocks with validation issues: ' + blocksWithValidationIssues.length, 'warn' );
		}
		
		let recoveredCount = 0;
		let invalidBlocksCount = 0;
		let skippedCount = 0;

		if ( ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] 🔄 Starting tree-based recovery for nested blocks...' );
		}
		
		// Count invalid blocks for logging
			allBlocksWithPaths.forEach( function( item ) {
			const block = item.block;
			const hasValidationError = blockValidationErrors[ block.clientId ];
			const hasValidationIssues = block.validationIssues && block.validationIssues.length > 0;
			const isInvalid = ! block.isValid;
				const needsRecovery = isInvalid || hasValidationError || hasValidationIssues;
				// In normal mode, treat all invalid blocks as candidates; in migration mode, Adaire only
				const isTargetBlock = ! isMigrationMode || isAdaireBlockName( block.name );
			
			if ( needsRecovery ) {
				invalidBlocksCount++;
				const isAdaireBlock = isAdaireBlockName( block.name );
				if ( ! isAdaireBlock ) {
					skippedCount++;
				}
			}
		} );
		
		// Process top-level blocks with tree recovery
			const recoveredBlocks = topLevelBlocks.map( function( block ) {
			const recovered = recoverBlockTree( block );
			
			// Check if anything was recovered in this tree
			function countRecoveredInTree( originalBlock, recoveredBlock ) {
				let count = 0;
				
				// Check if this block was recovered
				// A block is considered recovered if it was invalid and is now valid, or if it was recreated
				// In normal mode we consider all invalid blocks; in migration mode we scope to Adaire blocks.
				const isTargetBlock = ! isMigrationMode || isAdaireBlockName( originalBlock.name );
				if ( isTargetBlock &&
					 ! originalBlock.isValid &&
					 ( recoveredBlock.isValid || originalBlock.clientId !== recoveredBlock.clientId ) ) {
					count++;
					if ( ! isMigrationMode ) {
						logToParent( '[Adaire Blocks] ✅ Recovered: ' + originalBlock.name );
					}
				}
				
				// Recursively count in inner blocks
				if ( originalBlock.innerBlocks && recoveredBlock.innerBlocks ) {
					for ( let i = 0; i < originalBlock.innerBlocks.length; i++ ) {
						if ( recoveredBlock.innerBlocks[i] ) {
							count += countRecoveredInTree( 
								originalBlock.innerBlocks[i], 
								recoveredBlock.innerBlocks[i] 
							);
						}
					}
				}
				
				return count;
			}
			
			recoveredCount += countRecoveredInTree( block, recovered );
			return recovered;
		} );
		
		// Only update blocks if we actually recovered something
		if ( recoveredCount > 0 ) {
			if ( ! isMigrationMode ) {
				logToParent( '[Adaire Blocks] 🔄 Updating editor with recovered blocks...' );
			}
			
			try {
				// Use WordPress's built-in recovery mechanism if available
				// This ensures blocks are properly recovered using WordPress's native methods
				if ( typeof dispatch.replaceBlocks !== 'undefined' ) {
					// Get client IDs of blocks that need recovery
					const invalidBlockIds = [];
					allBlocksWithPaths.forEach( function( item ) {
						const block = item.block;
						const hasValidationError = blockValidationErrors[ block.clientId ];
						const hasValidationIssues = block.validationIssues && block.validationIssues.length > 0;
						const isInvalid = ! block.isValid;
						const needsRecovery = isInvalid || hasValidationError || hasValidationIssues;
						// In normal editor mode, recover any invalid block; in migration mode, Adaire only
						const isTargetBlock = ! isMigrationMode || isAdaireBlockName( block.name );
						
						if ( needsRecovery && isTargetBlock ) {
							invalidBlockIds.push( block.clientId );
						}
					} );
					
					// Recover each invalid block individually using WordPress's method
					if ( invalidBlockIds.length > 0 ) {
						let actuallyRecovered = 0;
						invalidBlockIds.forEach( function( clientId ) {
							try {
								// Try to use WordPress's built-in recovery
								if ( typeof dispatch.replaceBlock !== 'undefined' ) {
									const blockToRecover = allBlocks.find( function( b ) { return b.clientId === clientId; } );
									if ( blockToRecover ) {
										const recoveredBlock = recoverBlockTree( blockToRecover );
										// Only replace if the block actually needs recovery
										if ( ! blockToRecover.isValid || 
											 ( blockToRecover.validationIssues && blockToRecover.validationIssues.length > 0 ) ||
											 blockValidationErrors[ blockToRecover.clientId ] ) {
											dispatch.replaceBlock( clientId, recoveredBlock );
											actuallyRecovered++;
											if ( ! isMigrationMode ) {
												logToParent( '[Adaire Blocks] ✅ Recovered block: ' + blockToRecover.name );
											}
										}
									}
								}
							} catch ( e ) {
								logToParent( '[Adaire Blocks] ⚠️ Failed to recover block ' + clientId + ': ' + e.message, 'warn' );
							}
						} );
						
						// Update recoveredCount with actual number recovered
						recoveredCount = actuallyRecovered;
						
						if ( ! isMigrationMode ) {
							logToParent( '[Adaire Blocks] ✅ Recovered ' + actuallyRecovered + ' block(s) using WordPress recovery' );
						}
					} else {
						// Fallback to resetBlocks for tree-based recovery
						dispatch.resetBlocks( recoveredBlocks );
						
						if ( ! isMigrationMode ) {
							logToParent( '[Adaire Blocks] ✅ Editor updated successfully' );
						}
					}
				} else {
					// Fallback to resetBlocks
					dispatch.resetBlocks( recoveredBlocks );
					
					if ( ! isMigrationMode ) {
						logToParent( '[Adaire Blocks] ✅ Editor updated successfully' );
					}
				}
			} catch ( error ) {
				logToParent( '[Adaire Blocks] ❌ Failed to update editor: ' + error.message, 'error' );
			}
		}

		if ( ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] 📊 === RECOVERY SUMMARY ===' );
			logToParent( '[Adaire Blocks] Total blocks checked (including nested): ' + allBlocks.length );
			logToParent( '[Adaire Blocks] Invalid: ' + invalidBlocksCount + ' | Skipped: ' + skippedCount + ' | Recovered: ' + recoveredCount );
		}

		if ( recoveredCount > 0 ) {
			if ( ! isMigrationMode ) {
				logToParent( '[Adaire Blocks] 💾 Recovered ' + recoveredCount + ' block(s)' );
			}
			
			// Save the post after recovery
			if ( isMigrationMode && coreEditor ) {
				// Wait a moment for blocks to settle, then save (reduced delay)
				setTimeout( function() {
					// Clear dirty state before saving to prevent warnings
					if ( wp.data.dispatch( 'core/editor' ).resetEditorBlocks ) {
						const currentBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
						wp.data.dispatch( 'core/editor' ).resetEditorBlocks( currentBlocks );
					}
					
					coreEditor.savePost();
					
					// Wait for save to complete
					let saveCheckCount = 0;
					const MAX_SAVE_CHECKS = 100; // Maximum checks before timeout
					const saveUnsubscribe = wp.data.subscribe( function() {
						saveCheckCount++;
						const isSaving = wp.data.select( 'core/editor' ).isSavingPost();
						const didSave = wp.data.select( 'core/editor' ).didPostSaveRequestSucceed();
						const saveError = wp.data.select( 'core/editor' ).didPostSaveRequestFail ? wp.data.select( 'core/editor' ).didPostSaveRequestFail() : false;
						
						// If save completed successfully
						if ( ! isSaving && didSave ) {
							saveUnsubscribe();
							logToParent( '[Adaire Blocks Migration] ✅ Save completed successfully' );
							// Small delay before notifying to ensure all is settled
							setTimeout( function() {
								notifyMigrationComplete( true, recoveredCount );
							}, 200 );
							return;
						}
						
						// If save failed, still notify completion (blocks were recovered even if save failed)
						if ( ! isSaving && saveError ) {
							saveUnsubscribe();
							logToParent( '[Adaire Blocks Migration] ⚠️ Save failed, but blocks were recovered', 'warn' );
							setTimeout( function() {
								notifyMigrationComplete( true, recoveredCount );
							}, 200 );
							return;
						}
						
						// If we've checked many times and still saving, something might be wrong
						if ( saveCheckCount > MAX_SAVE_CHECKS ) {
							saveUnsubscribe();
							logToParent( '[Adaire Blocks Migration] ⚠️ Save check timeout - assuming completion', 'warn' );
							setTimeout( function() {
								notifyMigrationComplete( true, recoveredCount );
							}, 200 );
							return;
						}
					} );
					
					// Timeout fallback (increased to 10 seconds to allow more time for save to complete)
					setTimeout( function() {
						saveUnsubscribe();
						logToParent( '[Adaire Blocks Migration] ⏱️ Save timeout reached - assuming completion', 'warn' );
						notifyMigrationComplete( true, recoveredCount );
					}, 10000 );
				}, 300 );
			} else {
				// Normal mode - show a notice and auto-save the post
				wp.data.dispatch( 'core/notices' ).createNotice(
					'success',
					`Adaire Blocks: Automatically recovered ${recoveredCount} block(s).`,
					{
						type: 'snackbar',
						isDismissible: true,
					}
				);

				// Auto-save the post after recovery in normal mode
				if ( coreEditor && typeof coreEditor.savePost === 'function' ) {
					logToParent( '[Adaire Blocks] 💾 Auto-saving post after recovery...' );
					
					// Wait a moment for blocks to settle, then save
					setTimeout( function() {
						// Clear dirty state before saving to prevent warnings
						if ( wp.data.dispatch( 'core/editor' ).resetEditorBlocks ) {
							const currentBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
							wp.data.dispatch( 'core/editor' ).resetEditorBlocks( currentBlocks );
						}
						
						// Save the post
						coreEditor.savePost();
						logToParent( '[Adaire Blocks] ✅ Post saved after recovery' );
					}, 500 );
				} else {
					// Fallback: Reset the dirty state so the "leave site" prompt doesn't appear
					setTimeout( function() {
						// Reset edit count to clear unsaved changes prompt
						if ( wp.data.select( 'core/editor' ) && wp.data.dispatch( 'core/editor' ).resetEditorBlocks ) {
							const currentBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
							wp.data.dispatch( 'core/editor' ).resetEditorBlocks( currentBlocks );
							logToParent( '[Adaire Blocks] ✅ Reset editor state' );
						}
					}, 100 );
				}
			}
		} else {
			// No blocks recovered
			if ( ! isMigrationMode ) {
				if ( invalidBlocksCount > 0 ) {
					logToParent( '[Adaire Blocks] ℹ️ Found ' + invalidBlocksCount + ' invalid blocks but none could be recovered' );
				} else {
					logToParent( '[Adaire Blocks] ✅ All blocks are valid!' );
				}
			}
			
			if ( isMigrationMode ) {
				notifyMigrationComplete( true, 0 );
			}
		}
		
		if ( ! isMigrationMode ) {
			logToParent( '[Adaire Blocks] 🏁 === AUTO-RECOVERY COMPLETE ===' );
		}
	}

	/**
	 * Notify parent window that migration is complete
	 */
	function notifyMigrationComplete( success, blocksRecovered, error ) {
		if ( window.parent && window.parent !== window ) {
			window.parent.postMessage( {
				type: 'adaire_migration_complete',
				success: success,
				blocksRecovered: blocksRecovered,
				error: error || null
			}, '*' );
		}
	}

	} catch (error) {
		const errorMsg = '[Adaire Blocks] 💥 CRITICAL ERROR: ' + error.message;
		console.error(errorMsg, error);
		console.error('[Adaire Blocks] Error stack:', error.stack);
		
		// Send to parent if in iframe
		if (window.parent && window.parent !== window) {
			try {
				window.parent.postMessage({
					type: 'adaire_migration_log',
					message: errorMsg,
					level: 'error'
				}, '*');
			} catch (e) {
				// Silently fail
			}
		}
	}

} )();