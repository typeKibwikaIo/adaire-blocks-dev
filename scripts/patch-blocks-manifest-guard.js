#!/usr/bin/env node

/**
 * wp-scripts generates build/blocks-manifest.php as a bare `<?php return array(...)`
 * file with no ABSPATH guard. It has no executable side effects (just returns a
 * data array), but WordPress.org's automated review still flags any PHP file
 * missing the guard. Since the file is regenerated on every build ("Do not
 * modify it manually" is printed in the file itself), this patch must run as a
 * post-build step rather than being hand-edited.
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'build', 'blocks-manifest.php');

if (!fs.existsSync(manifestPath)) {
    console.log('   (skip) build/blocks-manifest.php not found — nothing to patch');
    process.exit(0);
}

const content = fs.readFileSync(manifestPath, 'utf8');

if (content.includes("defined( 'ABSPATH' )") || content.includes("defined('ABSPATH')")) {
    console.log('   ✓ build/blocks-manifest.php already has an ABSPATH guard');
    process.exit(0);
}

const guard = "if ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n";
const patched = content.replace(/^<\?php\n/, `<?php\n${guard}`);

fs.writeFileSync(manifestPath, patched, 'utf8');
console.log('   ✓ Patched build/blocks-manifest.php with an ABSPATH guard');
