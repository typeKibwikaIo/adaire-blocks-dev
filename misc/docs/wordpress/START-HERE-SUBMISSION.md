# 🚀 WordPress.org Submission - Start Here

Welcome! This guide will help you submit Adaire Blocks to WordPress.org.

---

## 📚 What I've Created For You

I've created **3 helpful documents** to guide you through the submission process:

### 1. **Full Guide** (Read First!)
📖 `docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md`
- Complete explanation of what SVN is
- Step-by-step submission process
- How to use SVN (with commands)
- Everything you need to know

### 2. **Quick Checklist** (Use While Working)
✅ `docs/SUBMISSION-CHECKLIST.md`
- Quick reference checklist
- Track your progress
- Don't forget anything important

### 3. **Helper Script** (Coming Soon)
🤖 `scripts/prepare-submission.js`
- Automatically creates clean submission package
- Excludes development files
- Creates ZIP file ready to submit

---

## 🎯 Quick Start (TL;DR)

### If you're completely new to WordPress.org:

**Step 1:** Read the full guide
```
Open: docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md
Read sections: "Understanding SVN" and "Step-by-Step Submission Process"
```

**Step 2:** Use the checklist
```
Open: docs/SUBMISSION-CHECKLIST.md
Check off items as you complete them
```

**Step 3:** Follow these simple steps:

1. ✅ **readme.txt is done** (you already have this!)
2. 🎨 **Create assets** (icons and screenshots)
3. 📦 **Create clean ZIP** (no node_modules, no .git)
4. 🧪 **Test the ZIP** (install it on a test site)
5. 📤 **Submit** at https://wordpress.org/plugins/developers/add/
6. ⏳ **Wait 1-14 days** for review
7. 📧 **Get approval email** with SVN details
8. 🔧 **Install TortoiseSVN** (if on Windows)
9. 📂 **Checkout SVN** repository
10. 📋 **Copy files** to trunk/ and assets/
11. ✅ **Commit** (goes live immediately!)

---

## 📋 What You Need To Do Now

### Immediate Action Items:

#### 1. Create Assets (Required)
You need to create these images:

**Plugin Icons:**
- `icon-128x128.png` - Small icon (128x128 pixels)
- `icon-256x256.png` - Large icon (256x256 pixels)

**Screenshots (6 needed):**
- `screenshot-1.png` - Accordion Block (1280x960px)
- `screenshot-2.png` - Counter Block (1280x960px)
- `screenshot-3.png` - Portfolio Block (1280x960px)
- `screenshot-4.png` - Video Hero Block (1280x960px)
- `screenshot-5.png` - Tabs Block (1280x960px)
- `screenshot-6.png` - Posts Grid Block (1280x960px)

**Optional:**
- `banner-772x250.png` - Small banner
- `banner-1544x500.png` - Large banner (retina)

💡 **Tip:** Use your actual blocks on your demo site, take screenshots, and crop/resize them!

#### 2. Test Your Plugin
- [ ] Install on fresh WordPress 6.7
- [ ] Test all blocks work
- [ ] Check for errors (turn on WP_DEBUG)
- [ ] Test on mobile

#### 3. Create WordPress.org Account
- Go to: https://wordpress.org/
- Register for an account
- Remember your username!

---

## 🎨 Creating Assets - Quick Guide

### For Icons (128x128 and 256x256):
1. Create a simple logo/icon representing your plugin
2. Use your brand colors
3. Keep it simple and recognizable
4. Save as PNG with transparency

**Design Tools:**
- Canva (free): https://www.canva.com/
- Figma (free): https://www.figma.com/
- Adobe Express (free): https://www.adobe.com/express/

### For Screenshots:
1. Open your demo site with blocks
2. Create a page showing each block
3. Use full browser window
4. Take screenshot (Windows: Win + Shift + S, Mac: Cmd + Shift + 4)
5. Crop to 1280x960px (or similar 4:3 ratio)

---

## 📦 Creating the Submission ZIP

### Manual Method:
1. Copy your plugin to new folder
2. Delete these folders/files:
   - `node_modules/`
   - `.git/`
   - `.gitignore`
   - Source files if you only need `build/`
3. ZIP the folder

### Automated Method (Optional):
```bash
# Install dependencies first (if archiver is not installed)
npm install archiver fs-extra --save-dev

# Run the preparation script
node scripts/prepare-submission.js

# This creates a clean ZIP ready to submit!
```

---

## ⚠️ Important Warnings

1. **First SVN commit goes LIVE immediately!**
   - No second approval needed
   - Make sure everything is perfect
   - Test thoroughly first

2. **No node_modules in submission!**
   - Makes ZIP huge
   - WordPress.org will reject it
   - Only include compiled `build/` folder

3. **Check your plugin slug is available**
   - Visit: https://wordpress.org/plugins/adaire-blocks/
   - If it 404s, the slug is available ✅
   - If it shows a plugin, choose different name ❌

4. **GPL License Required**
   - All code must be GPL-compatible
   - No encrypted/obfuscated code
   - Include LICENSE file

---

## 🤔 Common Questions

### Q: Do I need to know SVN?
**A:** Not really! Just 3-4 basic commands. The full guide has everything you need.

### Q: How long does review take?
**A:** Usually 1-14 days. Be patient!

### Q: What if they reject it?
**A:** They'll tell you what to fix. Fix it and resubmit. No big deal!

### Q: Can I update my plugin later?
**A:** Yes! Just commit to trunk/ and create new tag. Updates are instant.

### Q: Where do screenshots go?
**A:** In the `assets/` folder in your SVN repository (separate from plugin files).

### Q: What if I make a mistake after going live?
**A:** Just commit a fix! You can update anytime.

---

## 📞 Need Help?

### Resources:
- 📖 Full Guide: `docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md`
- ✅ Checklist: `docs/SUBMISSION-CHECKLIST.md`
- 🌐 WordPress.org Plugin Handbook: https://developer.wordpress.org/plugins/
- 💬 WordPress Slack: #pluginreview channel

### If You're Stuck:
1. Read the full guide section about your issue
2. Check the checklist for what you might have missed
3. Search WordPress.org support forums
4. Ask in WordPress Slack

---

## ✨ You've Got This!

Submitting to WordPress.org might seem complex, but it's actually straightforward once you understand the steps. Thousands of developers have done it, and you can too!

**Your plugin is already 90% ready:**
- ✅ Code is working
- ✅ Blocks are built
- ✅ readme.txt is properly formatted
- ✅ You have documentation

**You just need to:**
- 🎨 Create assets (icons, screenshots)
- 📦 Make a clean ZIP
- 📤 Submit and wait
- 🔧 Use SVN to go live

**Time estimate:**
- Creating assets: 2-3 hours
- Creating ZIP: 15 minutes
- Submitting: 5 minutes
- Waiting for approval: 1-14 days
- Using SVN to go live: 30 minutes

---

**Ready to start? Open `docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md` and let's do this! 🚀**

*Good luck with your submission!*

