// Migration Queue System
let migrationQueue = [];
let currentIndex = 0;
let totalItems = 0;
let processedItems = 0;
let failedItems = 0;
let migrationCancelled = false;
let hiddenIframe = null;
let currentMessageHandler = null;
let currentTimeout = null;

function startMigration() {
    if (!confirm('Are you sure you want to start the migration? This will update all posts, pages, and patterns with Adaire Blocks.')) {
        return;
    }

    // Reset state
    migrationQueue = [];
    currentIndex = 0;
    processedItems = 0;
    failedItems = 0;
    migrationCancelled = false;

    document.getElementById('start-migration').style.display = 'none';
    document.getElementById('cancel-migration').style.display = 'inline-block';
    document.getElementById('migration-status').style.display = 'block';
    document.getElementById('migration-progress').style.display = 'block';
    document.getElementById('migration-complete').style.display = 'none';
    
    addLog('🚀 Starting migration...');
    addLog('📋 Fetching posts, pages, and patterns to migrate...');
    
    // Get items to migrate
    fetch(adaireMigration.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=adaire_get_posts_to_migrate&nonce=' + adaireMigration.nonce
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            migrationQueue = data.data.items;
            totalItems = migrationQueue.length;
            
            const postsCount = data.data.posts_count || 0;
            const patternsCount = data.data.patterns_count || 0;
            
            // Log detailed breakdown
            addLog(`📊 Search Results:`);
            addLog(`   - Posts/Pages checked: ${data.data.posts_checked || 0}`);
            addLog(`   - Patterns checked: ${data.data.patterns_checked || 0}`);
            addLog(`   - Posts/Pages with Adaire Blocks: ${postsCount}`);
            addLog(`   - Patterns with Adaire Blocks: ${patternsCount}`);
            
            if (postsCount > 0 && patternsCount > 0) {
                addLog(`✅ Found ${totalItems} item${totalItems !== 1 ? 's' : ''} to migrate (${postsCount} post${postsCount !== 1 ? 's' : ''}, ${patternsCount} pattern${patternsCount !== 1 ? 's' : ''})`);
            } else if (postsCount > 0) {
                addLog(`✅ Found ${totalItems} post${totalItems !== 1 ? 's' : ''} to migrate`);
            } else if (patternsCount > 0) {
                addLog(`✅ Found ${totalItems} pattern${totalItems !== 1 ? 's' : ''} to migrate`);
            } else {
                addLog(`ℹ️ No items found with Adaire Blocks to migrate`);
            }
            
            if (totalItems === 0) {
                completeMigration();
                return;
            }
            
            addLog('🔄 Starting queue processing...');
            // Start the queue
            processNextInQueue();
        } else {
            addLog('❌ Error: ' + data.data.message, 'error');
            resetButtons();
        }
    })
    .catch(error => {
        addLog('❌ Error fetching items: ' + error.message, 'error');
        resetButtons();
    });
}

function processNextInQueue() {
    // Check if we should stop
    if (migrationCancelled) {
        addLog('⏹️ Migration cancelled by user', 'warn');
        cleanupIframe();
        completeMigration();
        return;
    }

    // Check if queue is complete
    if (currentIndex >= migrationQueue.length) {
        addLog('✅ Queue processing complete!');
        cleanupIframe();
        completeMigration();
        return;
    }

    const item = migrationQueue[currentIndex];
    const progress = currentIndex + 1;
    const itemType = item.type === 'pattern' ? 'Pattern' : 'Post';
    
    updateProgress(progress, totalItems, `Processing: ${item.title}`);
    addLog(`[${progress}/${totalItems}] 📄 Processing ${itemType}: ${item.title} (ID: ${item.id})`);

    // Clean up previous iframe if it exists
    cleanupIframe();

    // Create fresh iframe for this item
    hiddenIframe = document.createElement('iframe');
    hiddenIframe.style.display = 'none';
    hiddenIframe.id = 'migration-iframe-' + item.id;
    document.body.appendChild(hiddenIframe);

    // Set up message handler for this specific item
    setupMessageHandler(item);

    // Set timeout (increased to 30 seconds to allow more time for page loading and recovery)
    currentTimeout = setTimeout(() => {
        addLog(`⏱️ Timeout for: ${item.title}`, 'warn');
        failedItems++;
        moveToNextItem();
    }, 30000);

    // Load the item in the iframe
    let editorUrl;
    if (item.type === 'pattern') {
        // Patterns use wp_block post type
        editorUrl = adaireMigration.postUrl + '?post=' + item.id + '&action=edit&post_type=wp_block&adaire_auto_migrate=1';
        addLog(`  Loading editor for pattern ${item.id}...`);
    } else {
        editorUrl = adaireMigration.postUrl + '?post=' + item.id + '&action=edit&adaire_auto_migrate=1';
        addLog(`  Loading editor for post ${item.id}...`);
    }
    hiddenIframe.src = editorUrl;
}

function setupMessageHandler(item) {
    // Remove previous handler if exists
    if (currentMessageHandler) {
        window.removeEventListener('message', currentMessageHandler);
    }

    // Create new handler for this item
    currentMessageHandler = function(event) {
        // Only process messages from our migration
        if (!event.data || !event.data.type) {
            return;
        }

        // Handle completion messages
        if (event.data.type === 'adaire_migration_complete') {
            // Clear timeout
            if (currentTimeout) {
                clearTimeout(currentTimeout);
                currentTimeout = null;
            }
            
            if (event.data.success) {
                processedItems++;
                const blocks = event.data.blocksRecovered || 0;
                addLog(`  ✅ Success: ${blocks} block${blocks !== 1 ? 's' : ''} recovered and saved`);
            } else {
                failedItems++;
                addLog(`  ❌ Failed: ${event.data.error || 'Unknown error'}`, 'error');
            }
            
            // Move to next item after a short delay
            setTimeout(() => moveToNextItem(), 500);
        }
        
        // Handle log messages from iframe (optional, can be verbose)
        if (event.data.type === 'adaire_migration_log' && event.data.level === 'error') {
            addLog(`  ⚠️ ${event.data.message}`, event.data.level);
        }
    };
    
    window.addEventListener('message', currentMessageHandler);
}

function moveToNextItem() {
    // Increment index
    currentIndex++;
    
    // Process next item
    setTimeout(() => processNextInQueue(), 100);
}

function cleanupIframe() {
    // Clear timeout
    if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
    }

    // Remove message handler
    if (currentMessageHandler) {
        window.removeEventListener('message', currentMessageHandler);
        currentMessageHandler = null;
    }

    // Remove iframe
    if (hiddenIframe && hiddenIframe.parentNode) {
        hiddenIframe.parentNode.removeChild(hiddenIframe);
        hiddenIframe = null;
    }
}

function updateProgress(current, total, status) {
    const percentage = Math.round((current / total) * 100);
    const remaining = total - current;
    
    document.getElementById('status-text').textContent = status;
    document.getElementById('progress-text').textContent = `${current}/${total}`;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-percent').textContent = percentage + '%';
    
    // Update queue status
    if (remaining > 0) {
        document.getElementById('queue-status').textContent = `Queue: ${remaining} remaining`;
    } else {
        document.getElementById('queue-status').textContent = 'Queue: Complete';
    }
    
    // Update stats
    document.getElementById('stats-text').textContent = `✅ ${processedItems} | ❌ ${failedItems}`;
}

function addLog(message, type = 'info') {
    const log = document.getElementById('migration-log');
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    // Color code based on log level
    if (type === 'error') {
        entry.style.color = '#d63638';
        entry.style.fontWeight = 'bold';
    } else if (type === 'warn') {
        entry.style.color = '#f0b849';
    } else if (message.includes('✅') || message.includes('SUCCESS')) {
        entry.style.color = '#00a32a';
    } else if (message.includes('===')) {
        entry.style.fontWeight = 'bold';
        entry.style.marginTop = '8px';
    }
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function completeMigration() {
    addLog('');
    addLog('=== MIGRATION COMPLETE ===');
    addLog(`📊 Total items: ${totalItems}`);
    addLog(`✅ Successful: ${processedItems}`);
    addLog(`❌ Failed: ${failedItems}`);
    addLog(`⏭️ Skipped: ${totalItems - processedItems - failedItems}`);
    
    document.getElementById('migration-progress').style.display = 'none';
    document.getElementById('migration-complete').style.display = 'block';
    
    const successRate = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;
    document.getElementById('completion-summary').innerHTML = 
        `<strong>Migration Results:</strong><br>` +
        `✅ ${processedItems} successfully migrated<br>` +
        `❌ ${failedItems} failed<br>` +
        `📈 Success rate: ${successRate}%`;
    
    resetButtons();
}

function cancelMigration() {
    if (confirm('Are you sure you want to cancel the migration? Items already processed will remain migrated.')) {
        migrationCancelled = true;
        addLog('🛑 Cancelling migration...', 'warn');
        cleanupIframe();
        
        setTimeout(() => {
            completeMigration();
        }, 500);
    }
}

function resetButtons() {
    document.getElementById('start-migration').style.display = 'inline-block';
    document.getElementById('cancel-migration').style.display = 'none';
}