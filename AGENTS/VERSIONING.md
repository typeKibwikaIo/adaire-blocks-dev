# Versioning and Changelogs

**Purpose:** Record where the plugin version lives, which files have to agree, and
what a release entry has to say. Read this before bumping a version or writing a
changelog entry.

**Why it exists:** versions 1.2.6 through 1.3.1 shipped without changelog entries in
the root `readme.txt`, and its `Stable tag` sat at 1.2.5 while the plugin header said
1.3.1 — six releases of drift. The cause was that nothing wrote down which files
carry a version, so each release updated a different subset.

---

## 1. The one source of truth

`adaire-blocks.php` is authoritative. Two places in it must always match:

```php
 * Version:           1.3.2      // line 5, the WordPress plugin header
define('ADAIRE_BLOCKS_VERSION', '1.3.2');
```

Everything the build produces derives from that header:

- `scripts/generate-free-version.js` reads it and patches the version into the
  generated free plugin's `adaire-blocks.php` (`patchPluginVersion()`) and into the
  generated `package.json` (`generatePackageJson()`).
- The root `package.json` version (`0.1.0`) is **not** used. It is only a fallback if
  the header regex fails, which it never has. Do not bother updating it, and do not
  trust it.

---

## 2. Files that must agree on release

| File | Field | Who updates it |
|---|---|---|
| `adaire-blocks.php` | `Version:` header | By hand |
| `adaire-blocks.php` | `ADAIRE_BLOCKS_VERSION` | By hand |
| `readme.txt` | `Stable tag:` | By hand |
| `readme.txt` | newest `= x.y.z =` changelog entry | By hand |
| `free-version-scaffold/readme.txt` | `Stable tag:` | By hand |
| `free-version-scaffold/readme.txt` | newest `= x.y.z =` changelog entry | By hand |
| `free-version-scaffold/adaire-blocks.php` | `Version:` / `ADAIRE_BLOCKS_VERSION` | **Generator** — leave alone |
| generated free `package.json` | `version` | **Generator** — not in the repo |

Check them in one go:

```sh
grep -m1 'Version:' adaire-blocks.php
grep -m1 'ADAIRE_BLOCKS_VERSION' adaire-blocks.php
grep -m1 'Stable tag' readme.txt
grep -m1 '^= ' readme.txt
grep -m1 'Stable tag' free-version-scaffold/readme.txt
grep -m1 '^= ' free-version-scaffold/readme.txt
```

All six print the same number, or the release is not ready.

### The two readmes are not the same document

- **`readme.txt`** (repo root) — the full plugin, Free and Pro. Its changelog covers
  everything in a release, including Pro-only blocks.
- **`free-version-scaffold/readme.txt`** — what ships to WordPress.org. This is the
  one users read. Its changelog covers **only what is in the free build**, written
  for someone who has never seen the code: describe the effect, not the refactor.

Which blocks are in the free build is decided by `config/blocks-config.json`
(`free` / `pro` keys), not by the block's title — `saas-hero-block` is titled
"Hero Block (Pro)" but is configured as free.

The scaffold's `Stable tag` is the one that controls what WordPress.org serves.
Changing it points users at a different release, so treat it as a release action,
not a documentation tidy-up.

---

## 3. Numbering

Semantic-ish, matching what the history already does:

- **Patch** (`1.3.1` → `1.3.2`) — fixes, and changes to existing blocks that do not
  alter saved markup or attribute values. Moving a control between inspector tabs is
  a patch: the user relearns where a control is, but nothing they saved changes.
- **Minor** (`1.2.9` → `1.3.0`) — new blocks, new subsystems, removals, or anything
  that changes saved markup or a block's `supports`.
- **Major** — not used yet.

Do not skip numbers, and do not let the two builds diverge. Both have happened:
the root plugin header went 1.2.6 → 1.2.8 with no 1.2.7, while the free build
published a 1.2.7 (the Adaire Blocks rename) that the root header never carried.
The result is a release the two changelogs disagree about, permanently.

---

## 4. Writing a changelog entry

Entries are read by users deciding whether to update, not by developers reviewing a
diff. So:

- **Say the effect, not the mechanism.** "Fixed the Hero block's rating badges not
  being saved" — not "declared three attributes in block.json".
- **Name the block as the user sees it.** "Feature Grid (Free)", not
  `feature-grid-free`.
- **Call out anything that moves.** If a control changed tabs, or a setting is now
  somewhere else, say so explicitly and say that saved values are unaffected. This is
  the single most common support question after a UI change.
- **Lead with what changed for them.** New blocks and fixes first, internal
  consistency work after.
- **Never document a version that has not been bumped.** A changelog entry for a
  version the header does not carry is worse than no entry.

Add an `== Upgrade Notice ==` entry too for any release that moves controls, removes
a feature, or changes saved output. Two or three sentences, ending in what the user
has to do — usually "No action required."

---

## 5. Where the deeper record lives

The changelogs are summaries. The reasoning behind a change belongs in a spec or an
implementation log, referenced from the entry:

- `AGENTS/BLOCK_SETTINGS_SPEC.md` — the rules for where a block setting lives.
- `INSPECTOR_TABS_REORG.md` — what was actually changed, per block, and why. Its
  section headings carry the release the work shipped in.
- `misc/docs/CHANGELOG-v*.md` — per-release long-form notes for older versions.

---

## 6. Release history

The point at which each version was set in `adaire-blocks.php`:

| Version | Commit | Date | Notes |
|---|---|---|---|
| 1.3.2 | *(current)* | 2026-09-03 | Inspector unified across Hero / Button / Feature Grid |
| 1.3.1 | `8d73707` | 2026-08-17 | Hero Banner, PDF Reader, Mega Menu system |
| 1.3.0 | `99e4b7f` | 2026-07-18 | Rebrand, Free/Pro split, WordPress.org compliance |
| 1.2.9 | `672285b` | 2026-07-13 | Cookie Banner, Support page, block icons |
| 1.2.8 | `22d6060` | 2026-07-06 | Rating Badges block, Icon Box rename |
| 1.2.7 | `43699b4` | 2026-07-03 | **Free build only** — the Adaire Blocks rename. The root plugin header skipped straight from 1.2.6 to 1.2.8, so this version exists in `free-version-scaffold/readme.txt` and not in the root changelog. |
| 1.2.6 | `b19e760` | 2026-07-03 | WordPress.org rendering fix |

Entries for 1.2.6 through 1.3.1 were reconstructed from commit history in 1.3.2, so
they are accurate about *what* shipped but were not written at release time.
