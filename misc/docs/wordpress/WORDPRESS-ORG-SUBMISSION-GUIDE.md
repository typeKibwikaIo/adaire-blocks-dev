# WordPress.org Plugin Submission Guide

## Table of Contents
1. [Understanding SVN](#understanding-svn)
2. [Pre-Submission Checklist](#pre-submission-checklist)
3. [Files You Need](#files-you-need)
4. [Step-by-Step Submission Process](#step-by-step-submission-process)
5. [SVN Setup and Usage](#svn-setup-and-usage)
6. [After Approval](#after-approval)
7. [Updating Your Plugin](#updating-your-plugin)

---

## Understanding SVN

### What is SVN?
**SVN (Subversion)** is a version control system similar to Git, but WordPress.org uses it for hosting plugins instead of Git. Think of it as a way to store and manage different versions of your plugin.

### Why does WordPress.org use SVN?
- WordPress.org was built before Git became popular
- SVN has better performance for large binary files (like images/screenshots)
- It allows WordPress.org to automatically distribute plugin updates

### Key Differences from Git:
- **Git**: Uses `git push`, `git commit`, branches
- **SVN**: Uses `svn commit`, trunk/tags structure
- You don't need to learn SVN deeply - just a few basic commands

---

## Pre-Submission Checklist

### ✅ 1. Code Requirements
- [ ] Plugin follows [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [ ] No PHP errors or warnings (test with `WP_DEBUG` enabled)
- [ ] No JavaScript console errors
- [ ] Code is properly escaped and sanitized (security)
- [ ] Uses WordPress APIs (no raw database queries if avoidable)
- [ ] GPL-compatible license
- [ ] No obfuscated/encrypted code
- [ ] No external dependencies that violate GPL

### ✅ 2. Required Files
- [ ] `readme.txt` - Properly formatted ✅ (You have this!)
- [ ] Main plugin file (e.g., `adaire-blocks.php`)
- [ ] Plugin headers in main file
- [ ] License file (`LICENSE` or `license.txt`)
- [ ] Optional but recommended: `README.md` for GitHub

### ✅ 3. Plugin Headers
Check your main plugin file (`adaire-blocks.php`) has these headers:

```php
<?php
/**
 * Plugin Name: Adaire Blocks
 * Plugin URI: https://adaire.digital/adaire-blocks
 * Description: A powerful WordPress plugin for creating visually stunning, high-performance websites with custom Gutenberg blocks and GSAP animations.
 * Version: 1.1.0
 * Requires at least: 6.7
 * Requires PHP: 7.4
 * Author: Adaire Digital
 * Author URI: https://adaire.digital/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: adaire-blocks
 * Domain Path: /languages
 */
```

### ✅ 4. Testing
- [ ] Test on WordPress 6.7+ (minimum version)
- [ ] Test on latest WordPress version
- [ ] Test with different themes
- [ ] Test with PHP 7.4 and 8.0+
- [ ] Test block creation, editing, and viewing
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Check for conflicts with popular plugins

### ✅ 5. Security Check
- [ ] All user input is sanitized
- [ ] All output is escaped
- [ ] Nonces used for forms
- [ ] Capability checks for admin functions
- [ ] No direct file access (add guards: `if ( ! defined( 'ABSPATH' ) ) exit;`)
- [ ] No SQL injection vulnerabilities

### ✅ 6. Assets for WordPress.org
- [ ] Plugin icon (128x128px and 256x256px)
- [ ] 4-6 screenshots (1280x960px recommended)
- [ ] Optional: Banner images (772x250px and 1544x500px)

---

## Files You Need

### Your Plugin Structure (for submission):
```
adaire-blocks/
├── adaire-blocks.php          (Main plugin file)
├── readme.txt                 (WordPress.org readme) ✅
├── LICENSE                    (GPL-2.0 license text)
├── admin/                     (Admin files)
├── build/                     (Compiled blocks)
├── includes/                  (PHP classes)
├── plugin-update-checker/     (Update system)
├── src/                       (Source files)
└── languages/                 (Translation files if any)

DON'T INCLUDE:
├── node_modules/              (Never include this!)
├── .git/                      (Git folder)
├── .gitignore
├── package.json               (Optional - can include)
├── package-lock.json          (Optional - can include)
```

### Assets Folder (separate from plugin):
```
assets/
├── icon-128x128.png          (Plugin icon - small)
├── icon-256x256.png          (Plugin icon - large)
├── banner-772x250.png        (Banner - low res) [optional]
├── banner-1544x500.png       (Banner - high res) [optional]
├── screenshot-1.png          (Accordion Block screenshot)
├── screenshot-2.png          (Counter Block screenshot)
├── screenshot-3.png          (Portfolio Block screenshot)
├── screenshot-4.png          (Video Hero Block screenshot)
├── screenshot-5.png          (Tabs Block screenshot)
└── screenshot-6.png          (Posts Grid Block screenshot)
```

---

## Step-by-Step Submission Process

### Step 1: Create WordPress.org Account
1. Go to https://wordpress.org/
2. Click "Get WordPress" → "Login/Register"
3. Create your account (you'll need this username later)

### Step 2: Submit Plugin
1. Go to https://wordpress.org/plugins/developers/add/
2. You need to upload a **ZIP file** of your plugin
3. Fill out the form with plugin details
4. Submit for review

### Step 3: Create ZIP File (What to Submit)

**IMPORTANT**: Create a clean ZIP file without development files:

```bash
# In your plugin directory, create a ZIP excluding unnecessary files:

# On Windows (PowerShell):
Compress-Archive -Path adaire-blocks-dev2\* -DestinationPath adaire-blocks-submission.zip -Force

# But EXCLUDE these:
# - node_modules/
# - .git/
# - .gitignore
# - *.md files (except README.md if you want)
# - Development config files
```

**Better approach** - Create a clean copy first:

```bash
# 1. Create a new folder for submission
mkdir adaire-blocks-submission
cd adaire-blocks-submission

# 2. Copy only necessary files (manually or using script)
# Copy:
# - adaire-blocks.php
# - readme.txt
# - LICENSE
# - build/ folder
# - admin/ folder
# - includes/ folder
# - plugin-update-checker/ folder
# - config/ folder

# 3. Create ZIP of this clean folder
Compress-Archive -Path * -DestinationPath ..\adaire-blocks-v1.1.0.zip
```

### Step 4: Wait for Review
- Review typically takes 1-14 days
- You'll receive an email when reviewed
- They may request changes or ask questions

### Step 5: Get SVN Access
Once approved, you'll receive:
- Email with SVN repository URL (like: `https://plugins.svn.wordpress.org/adaire-blocks/`)
- Instructions for committing code
- Your SVN username (usually your WordPress.org username)

---

## SVN Setup and Usage

### Installing SVN

**Windows:**
1. Download TortoiseSVN: https://tortoisesvn.net/downloads.html
2. Install it (restart may be required)
3. Right-click in any folder → You'll see "SVN Checkout" option

**Mac:**
```bash
brew install svn
```

**Linux:**
```bash
sudo apt-get install subversion
```

### First-Time SVN Setup

Once approved, you'll get an SVN URL like:
`https://plugins.svn.wordpress.org/adaire-blocks/`

**Step 1: Checkout (Download) the SVN Repository**

```bash
# Navigate to where you want to work
cd C:\WordPress-Plugins\

# Checkout the repository (creates local copy)
svn checkout https://plugins.svn.wordpress.org/adaire-blocks/
cd adaire-blocks

# You'll see these folders:
# trunk/     - Your current development version
# tags/      - Released versions (1.0.0, 1.1.0, etc.)
# assets/    - Screenshots, icons, banners
```

**Step 2: Add Your Plugin Files**

```bash
# Copy your plugin files into trunk/
# (Everything except node_modules, .git, etc.)

# Copy your assets (icons, screenshots) into assets/
```

**Step 3: Add Files to SVN**

```bash
# Tell SVN to track these files
svn add trunk/* --force
svn add assets/* --force

# Check what will be committed
svn status
```

**Step 4: Commit to SVN**

```bash
# Commit to trunk (this makes it live!)
svn commit -m "Initial commit of Adaire Blocks v1.1.0"

# Enter your WordPress.org username and password when prompted
```

**Step 5: Create a Release Tag**

```bash
# Copy trunk to tags/1.1.0
svn copy trunk tags/1.1.0

# Commit the tag
svn commit -m "Tagging version 1.1.0"
```

### Updating Your Plugin (Future Releases)

When you release v1.2.0:

```bash
# 1. Update files in trunk/
svn update
# (Copy your new files to trunk/)

# 2. Commit trunk changes
svn commit -m "Update to version 1.2.0"

# 3. Create new tag
svn copy trunk tags/1.2.0
svn commit -m "Tagging version 1.2.0"

# 4. Update readme.txt stable tag to 1.2.0
```

---

## After Approval

### What Happens Next:
1. ✅ Your plugin appears on WordPress.org
2. ✅ Users can install it from WordPress admin
3. ✅ You can push updates anytime via SVN
4. ✅ Stats are available in your WordPress.org dashboard

### Important Notes:
- **First commit = Goes live immediately** (no second approval needed)
- Make sure everything is ready before first commit
- Test thoroughly before committing
- `trunk/` = development version
- `tags/1.1.0/` = released version 1.1.0
- WordPress serves whichever version matches `Stable tag:` in readme.txt

---

## Common SVN Commands Cheat Sheet

```bash
# Get latest changes from WordPress.org
svn update

# See what files changed
svn status

# Add new files
svn add filename.php
svn add newfolder/* --force

# Remove files
svn delete oldfile.php

# Commit changes
svn commit -m "Description of changes"

# Create a tag (release)
svn copy trunk tags/1.2.0
svn commit -m "Tagging version 1.2.0"

# Check what changed
svn diff

# Revert changes (undo)
svn revert filename.php
```

---

## Before You Submit - Final Checklist

### Must Have:
- [ ] readme.txt properly formatted ✅
- [ ] Plugin tested and working
- [ ] No PHP/JS errors
- [ ] All code is GPL-compatible
- [ ] Plugin slug available (check https://wordpress.org/plugins/adaire-blocks/)
- [ ] Clear plugin description
- [ ] Screenshots prepared
- [ ] Icon images prepared

### Nice to Have:
- [ ] Banner images
- [ ] Detailed documentation
- [ ] Video demo
- [ ] Support forum strategy
- [ ] Update plan

---

## Resources

- [Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [Plugin Review Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- [Using Subversion](https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/)
- [TortoiseSVN Documentation](https://tortoisesvn.net/docs/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)

---

## Need Help?

If you get stuck at any step, the WordPress.org plugin review team is helpful:
- Plugin review team will guide you via email
- WordPress.org support forums
- WordPress Slack (#pluginreview channel)

---

**Good luck with your submission! 🚀**

*This guide was created for Adaire Blocks plugin submission.*

