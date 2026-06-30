# Adaire Blocks Release Process Documentation

This document outlines the complete process for releasing a new version of Adaire Blocks. Follow these steps carefully for every release to ensure consistency and completeness.

## make sure to add all new blocks to the changelogs, release notes, mds and txts

## Version Numbering

- **Format**: `MAJOR.MINOR.PATCH` (e.g., `1.2.2`)
- **Major**: Breaking changes or major feature additions
- **Minor**: New features, enhancements (backward compatible)
- **Patch**: Bug fixes, minor improvements (backward compatible)

## Pre-Release Checklist

Before starting the release process, ensure:
- [ ] All code changes are committed and tested
- [ ] All tests pass (if applicable)
- [ ] No compilation errors
- [ ] No linter errors
- [ ] Documentation is up to date
- [ ] Changelog entries are prepared

## Release Steps

### Step 1: Update Main Plugin File

**File**: `adaire-blocks.php`

1. Update the version number in the plugin header:
   ```php
   * Version:           X.Y.Z
   ```

2. Update the rollback URL (if applicable):
   ```php
   $previous_version_zip = 'https://github.com/helloadaire/Adaire-Blocks/releases/download/vX.Y.Z.alpha/adaire-blocks.X.Y.Z.alpha.zip';
   ```
   - Change from: Previous version (e.g., `v1.2.0.alpha`)
   - Change to: Previous stable version (e.g., `v1.2.1`)

### Step 2: Create Update JSON File

**File**: `misc/update-jsons/X.Y.Z.json`

1. Copy from previous version's JSON file
2. Update the following fields:
   - `version`: New version number (e.g., `"1.2.2"`)
   - `download_url`: GitHub release URL with `.alpha` suffix (e.g., `"https://github.com/helloadaire/Adaire-Blocks/releases/download/v1.2.2.alpha/adaire-blocks.1.2.2.alpha.zip"`)
   - `description`: Update with new features/highlights (use bullet points with `\n` for newlines)
   - `changelog`: HTML formatted changelog with latest version at top
   - Keep previous version entries in changelog for reference

**Template Structure**:
```json
{
    "name": "Adaire Blocks",
    "version": "X.Y.Z",
    "download_url": "https://github.com/helloadaire/Adaire-Blocks/releases/download/vX.Y.Z.alpha/adaire-blocks.X.Y.Z.alpha.zip",
    "sections": {
      "description": "...",
      "changelog": "<h4>X.Y.Z</h4><ul>...</ul>",
      "installation": "...",
      "screenshots": "..."
    },
    "banners": {
      "high": "",
      "low": ""
    }
}
```

**Important Note**: The `download_url` in the update JSON file must include `.alpha` in the version path (e.g., `v1.2.2.alpha` instead of `v1.2.2`). This ensures the update system points to the correct release file on GitHub.

### Step 3: Create Technical Release Notes

**File**: `misc/releases/vX.Y.Z.md`

Create comprehensive technical release notes covering:
- **Summary**: Brief overview of the release
- **New Features**: Detailed descriptions of new functionality
- **Improvements**: Enhancements to existing features
- **Bug Fixes**: Issues resolved
- **Technical Details**: Code changes, file modifications
- **File Changes**: List of modified/added/removed files
- **Upgrade Impact**: Breaking changes, migration requirements
- **Performance Considerations**: Any performance impacts
- **Developer Benefits**: How developers benefit from changes

**Sections to Include**:
- Layout Consistency Improvements
- Technical Improvements
- Code Quality
- File Changes
- Upgrade Impact
- Backward Compatibility
- Performance Considerations
- Bug Fixes

### Step 4: Create User-Facing Release Notes

**File**: `misc/releases/vX.Y.Z-user-facing.md`

Create user-friendly release notes focusing on:
- **What's Improved**: User-visible changes
- **For Users**: Benefits and improvements
- **Technical Updates**: Brief technical overview
- **Action Required**: What users need to do (usually "No action required")

**Tone**: Friendly, non-technical, benefit-focused

### Step 5: Create Testing Notes

**File**: `misc/testing-notes/vX.Y.Z-testing.md`

Create comprehensive testing checklist including:
- **Pre-Release Testing Checklist**: All areas to test
- **Feature-Specific Testing**: Detailed test cases for new features
- **Regression Testing**: Ensure existing features still work
- **Browser Compatibility**: Test in major browsers
- **Responsive Testing**: Test at all breakpoints
- **Known Issues**: Document any known problems
- **Test Environment**: Document testing environment
- **Test Results**: Track pass/fail status

**Structure**:
- Use checkboxes `- [ ]` for test items
- Organize by feature/component
- Include specific steps to verify each item
- Document expected behavior

### Step 6: Create Changelog Entry

**File**: `misc/docs/CHANGELOG-vX.Y.Z.md`

Create detailed changelog with:
- **Release Date**: Date of release (or TBD)
- **Sections**: Organize by type (Features, Improvements, Bug Fixes, etc.)
- **Detailed Descriptions**: Explain what changed and why
- **File Changes**: List all modified files
- **Technical Details**: Code-level changes if relevant

### Step 7: Update readme.txt

**File**: `readme.txt`

1. Update `Stable tag`: Change to new version number
2. Add new changelog entry at the top of the changelog section:
   ```txt
   = X.Y.Z =
   * Feature/improvement 1
   * Feature/improvement 2
   * Bug fix 1
   ```

**Format Guidelines**:
- Use bullet points with `*` 
- Keep entries concise but descriptive
- Focus on user-visible changes
- Group related changes

### Step 8: Create GitHub Release (After Code Push)

**On GitHub**:
1. Create a new release tag: `vX.Y.Z`
2. Use user-facing release notes as description
3. Upload ZIP file: `adaire-blocks.X.Y.Z.zip`
4. Mark as "Latest release" if appropriate

### Step 9: Update Update JSON Repository

**Repository**: `Adaire-Blocks-Update-JSON`

1. Push the new `X.Y.Z.json` file to `update-info.json` (or keep separate files)
2. Ensure JSON is valid and accessible
3. Verify update checker can access the file

## File Checklist

Before considering release complete, verify all files are updated:

- [ ] `adaire-blocks.php` - Version number and rollback URL
- [ ] `misc/update-jsons/X.Y.Z.json` - Update information
- [ ] `misc/releases/vX.Y.Z.md` - Technical release notes
- [ ] `misc/releases/vX.Y.Z-user-facing.md` - User-facing release notes
- [ ] `misc/testing-notes/vX.Y.Z-testing.md` - Testing checklist
- [ ] `misc/docs/CHANGELOG-vX.Y.Z.md` - Detailed changelog
- [ ] `readme.txt` - Stable tag and changelog entry

## Post-Release Steps

1. **Tag Git Repository**: Create git tag `vX.Y.Z`
2. **Create GitHub Release**: Upload ZIP and add release notes
3. **Update Update JSON**: Push to update JSON repository
4. **Verify Update Check**: Test automatic update in WordPress admin
5. **Monitor**: Watch for any immediate issues reported
6. **Document Issues**: Track any bugs found post-release

## Rollback Procedure

If issues are found after release:

1. **Immediate**: Update `update-info.json` to point to previous version
2. **Fix**: Address the issue in a patch release (X.Y.Z+1)
3. **Release**: Follow this process for the patch release
4. **Update Rollback URL**: In new release, update rollback URL to the version before the problematic release

## Version History Example

```
v1.2.2 → Current release (update rollback to v1.2.1)
v1.2.1 → Previous release (rollback points to v1.2.0.alpha originally, then v1.2.1)
v1.2.0 → Earlier release
```

## Notes

- **Alpha/Beta Releases**: Use `.alpha` or `.beta` suffix (e.g., `v1.2.0.alpha`) for pre-release versions
- **Stable Releases**: Use clean version numbers (e.g., `v1.2.1`) for production releases
- **Rollback URLs**: Always point to the previous stable release, not alpha/beta versions
- **Changelog Entries**: Keep comprehensive but organized - use sections for readability
- **Testing**: Always complete testing checklist before releasing
- **Documentation**: Keep this process document updated with any improvements to the release workflow

## Quick Reference

### Version Update Locations
1. `adaire-blocks.php` - Plugin header version
2. `adaire-blocks.php` - Rollback URL
3. `readme.txt` - Stable tag
4. `misc/update-jsons/X.Y.Z.json` - Version field
5. All release documentation files

### File Naming Conventions
- Update JSON: `misc/update-jsons/X.Y.Z.json`
- Technical Notes: `misc/releases/vX.Y.Z.md`
- User-Facing Notes: `misc/releases/vX.Y.Z-user-facing.md`
- Testing Notes: `misc/testing-notes/vX.Y.Z-testing.md`
- Changelog: `misc/docs/CHANGELOG-vX.Y.Z.md`

---

**Last Updated**: [Current Date]
**Process Version**: 1.0.0

