# SVN Structure - Visual Guide

## 🌳 Understanding the SVN Repository Structure

When you get approved, WordPress.org gives you an SVN repository. Here's what it looks like:

```
https://plugins.svn.wordpress.org/adaire-blocks/
│
├── trunk/                          ← Your development version (latest code)
│   ├── adaire-blocks.php
│   ├── readme.txt
│   ├── build/
│   ├── admin/
│   └── ... (all your plugin files)
│
├── tags/                           ← Released versions (stable releases)
│   ├── 1.0.0/                     ← Your first release
│   │   ├── adaire-blocks.php
│   │   ├── readme.txt
│   │   └── ... (snapshot of 1.0.0)
│   │
│   ├── 1.1.0/                     ← Your current release
│   │   ├── adaire-blocks.php
│   │   ├── readme.txt
│   │   └── ... (snapshot of 1.1.0)
│   │
│   └── 1.2.0/                     ← Future releases
│       └── ...
│
└── assets/                         ← Screenshots, icons, banners
    ├── icon-128x128.png
    ├── icon-256x256.png
    ├── banner-772x250.png
    ├── banner-1544x500.png
    ├── screenshot-1.png
    ├── screenshot-2.png
    ├── screenshot-3.png
    ├── screenshot-4.png
    ├── screenshot-5.png
    └── screenshot-6.png
```

---

## 📂 What Each Folder Does

### 🔨 trunk/
**What:** Your current development code  
**When to update:** Every time you make changes  
**Users see it:** Only if readme.txt says `Stable tag: trunk`

```bash
# Example: You fix a bug
1. Update files in trunk/
2. svn commit -m "Fixed counter bug"
3. trunk/ is now updated (but users don't see it yet)
```

### 🏷️ tags/
**What:** Frozen snapshots of each release  
**When to create:** When you release a new version  
**Users see it:** Based on `Stable tag:` in readme.txt

```bash
# Example: Release version 1.2.0
1. Update trunk/ with new features
2. Create tag: svn copy trunk tags/1.2.0
3. Update readme.txt: Stable tag: 1.2.0
4. Users now get version 1.2.0
```

### 🎨 assets/
**What:** Images for WordPress.org page  
**When to update:** When you want to change how your plugin looks  
**Users see it:** On WordPress.org plugin page only

---

## 🔄 The Release Workflow

### Scenario 1: First Release (v1.1.0)

```
Step 1: Checkout SVN
┌─────────────────────────────────────┐
│ svn checkout https://...            │
│                                     │
│ You now have:                       │
│ ├── trunk/ (empty)                  │
│ ├── tags/ (empty)                   │
│ └── assets/ (empty)                 │
└─────────────────────────────────────┘

Step 2: Add Your Files
┌─────────────────────────────────────┐
│ Copy plugin files to trunk/         │
│ Copy images to assets/              │
│                                     │
│ trunk/                              │
│ ├── adaire-blocks.php               │
│ ├── readme.txt (Stable tag: 1.1.0)  │
│ └── build/                          │
│                                     │
│ assets/                             │
│ ├── icon-128x128.png                │
│ └── screenshot-1.png                │
└─────────────────────────────────────┘

Step 3: Commit
┌─────────────────────────────────────┐
│ svn add trunk/* --force             │
│ svn add assets/* --force            │
│ svn commit -m "Initial release"     │
│                                     │
│ ✅ trunk/ is now live!              │
└─────────────────────────────────────┘

Step 4: Create Release Tag
┌─────────────────────────────────────┐
│ svn copy trunk tags/1.1.0           │
│ svn commit -m "Tagging v1.1.0"      │
│                                     │
│ ✅ tags/1.1.0/ created              │
│ ✅ Users can now install v1.1.0     │
└─────────────────────────────────────┘
```

### Scenario 2: Bug Fix (v1.1.1)

```
Step 1: Update trunk
┌─────────────────────────────────────┐
│ svn update                          │
│ (Edit files in trunk/)              │
│ Update readme.txt: Stable tag: 1.1.1│
│ svn commit -m "Fixed counter bug"   │
└─────────────────────────────────────┘

Step 2: Create new tag
┌─────────────────────────────────────┐
│ svn copy trunk tags/1.1.1           │
│ svn commit -m "Tagging v1.1.1"      │
│                                     │
│ ✅ Bug fix released!                │
│ ✅ Users get auto-update notice     │
└─────────────────────────────────────┘
```

### Scenario 3: Major Update (v2.0.0)

```
Same as bug fix, but:
1. Update trunk/ with new features
2. Update version numbers everywhere
3. Update readme.txt changelog
4. Create tags/2.0.0
5. Users see update available!
```

---

## 🎯 Which Version Do Users Get?

WordPress looks at your `readme.txt` file and checks:

```
Stable tag: 1.1.0
```

Then WordPress serves the code from:
- `tags/1.1.0/` if it exists ✅
- `trunk/` if tag doesn't exist ⚠️

### Example:

```
Your readme.txt says: Stable tag: 1.1.0

WordPress.org serves: tags/1.1.0/adaire-blocks.php
                      tags/1.1.0/build/
                      etc.

If you update trunk/ but don't create tags/1.1.0:
WordPress.org serves: trunk/ (not ideal!)
```

---

## 🤔 Common Questions

### Q: What if I mess up trunk/?
**A:** It's okay! trunk/ is development. Just fix it and commit again.

### Q: Can I delete a tag?
**A:** Yes, but don't! Users might be using it. Just create a new version.

### Q: Do I always need to update trunk/ first?
**A:** Yes! Always update trunk/, then copy trunk/ to a tag.

### Q: What if I forget to create a tag?
**A:** Create it later! But users won't get the update until you do.

### Q: Can I edit files in tags/?
**A:** No! Tags are frozen. Update trunk/ and create a new tag.

---

## 📊 Visual: The Update Process

```
You have a bug to fix in v1.1.0
           ↓
    Update trunk/
           ↓
    svn commit
           ↓
    Create tags/1.1.1
           ↓
    svn commit
           ↓
    Users see update!
           ↓
    They click "Update"
           ↓
    WordPress downloads tags/1.1.1/
           ↓
    Done! ✅
```

---

## 🎨 Visual: Assets Folder

The `assets/` folder is special - it's **separate** from your plugin code:

```
WordPress.org Plugin Page
┌─────────────────────────────────────────┐
│  [icon-256x256.png]                     │
│                                         │
│  ╔════════════════════════════════════╗ │
│  ║  banner-1544x500.png (top banner)  ║ │
│  ╚════════════════════════════════════╝ │
│                                         │
│  Adaire Blocks                          │
│  [Install Now]                          │
│                                         │
│  Screenshots:                           │
│  [screenshot-1.png]                     │
│  Accordion Block with smooth animations │
│                                         │
│  [screenshot-2.png]                     │
│  Counter Block with animated counting   │
└─────────────────────────────────────────┘

All these images come from: assets/
Not from: trunk/ or tags/
```

---

## 🚀 Quick Command Reference

```bash
# Get latest
svn update

# See what changed
svn status

# Add new files
svn add filename.php

# Commit changes
svn commit -m "Description"

# Create release
svn copy trunk tags/1.2.0
svn commit -m "Tagging 1.2.0"

# Delete file
svn delete oldfile.php
svn commit -m "Removed old file"
```

---

## ✅ Pro Tips

1. **Always test trunk/ before creating a tag**
   - trunk/ = development
   - tags/ = production

2. **Keep trunk/ and tags/ in sync**
   - Don't edit tags directly
   - Always copy from trunk/

3. **Version numbers must match everywhere**
   - Plugin file header
   - readme.txt stable tag
   - Tag folder name

4. **Assets update independently**
   - You can update screenshots anytime
   - No need to create new plugin version

---

**This visual guide should help you understand how SVN works for WordPress.org!**

For step-by-step instructions, see: `docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md`

