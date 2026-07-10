# WordPress.org Submission Checklist

## Before You Start

- [ ] Read the full submission guide: `docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md`
- [ ] Have a WordPress.org account
- [ ] Plugin is fully tested and working

---

## Quick Checklist

### 1. Files Ready ✅
- [x] `readme.txt` formatted correctly
- [ ] `adaire-blocks.php` has correct plugin headers
- [ ] `LICENSE` file exists
- [ ] All code is GPL-compatible
- [ ] No `node_modules/` in submission
- [ ] No `.git/` folder in submission

### 2. Testing Complete
- [ ] Tested on WordPress 6.7+
- [ ] Tested on latest WordPress version
- [ ] No PHP errors (WP_DEBUG = true)
- [ ] No JavaScript errors in console
- [ ] Works with default WordPress theme
- [ ] All blocks work correctly
- [ ] Mobile responsive

### 3. Security Check
- [ ] All inputs sanitized
- [ ] All outputs escaped
- [ ] Nonces on forms
- [ ] Capability checks on admin functions
- [ ] No SQL injection vulnerabilities

### 4. Assets Prepared
- [ ] icon-128x128.png
- [ ] icon-256x256.png
- [ ] screenshot-1.png (Accordion Block)
- [ ] screenshot-2.png (Counter Block)
- [ ] screenshot-3.png (Portfolio Block)
- [ ] screenshot-4.png (Video Hero Block)
- [ ] screenshot-5.png (Tabs Block)
- [ ] screenshot-6.png (Posts Grid Block)
- [ ] banner-772x250.png (optional)
- [ ] banner-1544x500.png (optional)

### 5. Documentation
- [ ] readme.txt is complete
- [ ] Installation instructions clear
- [ ] FAQ section helpful
- [ ] Changelog up to date

---

## Submission Steps

### Phase 1: Pre-Submission
1. [ ] Create WordPress.org account
2. [ ] Check plugin slug is available: https://wordpress.org/plugins/adaire-blocks/
3. [ ] Create clean ZIP file (no dev files)
4. [ ] Test ZIP by installing it on fresh WordPress

### Phase 2: Submit
5. [ ] Go to https://wordpress.org/plugins/developers/add/
6. [ ] Upload ZIP file
7. [ ] Fill out submission form
8. [ ] Submit for review
9. [ ] Wait for approval email (1-14 days)

### Phase 3: After Approval
10. [ ] Install SVN (TortoiseSVN for Windows)
11. [ ] Checkout SVN repository
12. [ ] Copy files to `trunk/`
13. [ ] Copy assets to `assets/`
14. [ ] Commit to SVN (goes live!)
15. [ ] Create tag for version 1.1.0
16. [ ] Verify plugin appears on WordPress.org

---

## Don't Forget

- ⚠️ **First SVN commit goes LIVE immediately** - no second approval
- ⚠️ Test everything before first commit
- ⚠️ `trunk/` = development, `tags/1.1.0/` = release
- ⚠️ Update `Stable tag` in readme.txt to match your release

---

## Current Status

**Plugin Name:** Adaire Blocks  
**Current Version:** 1.1.0  
**Ready for Submission:** ⬜ (Check when ready)

### Blockers (things stopping submission):
- [ ] Need to create assets (icons, screenshots)
- [ ] Need to test more thoroughly
- [ ] Need to create clean ZIP
- [ ] Other: ___________________________

---

## After Going Live

- [ ] Monitor support forums
- [ ] Respond to user feedback
- [ ] Plan next update
- [ ] Keep readme.txt updated
- [ ] Maintain changelog

---

**Target Submission Date:** _______________

**Submitted Date:** _______________

**Approved Date:** _______________

**Live Date:** _______________

