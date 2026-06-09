# Free Version Scaffold

This folder is the **single source of truth** for the generated free version of Adaire Blocks.

It is based on `tags/1.2.3` — the clean, WordPress.org-compliant release — with the deactivation intent (SendGrid feedback modal) overlaid from the internal test build.

When you run `npm run generate-free`, the script:
1. Copies every file in this scaffold into the output folder as-is
2. Patches the plugin version from the main dev plugin
3. Adds the free blocks from the main plugin's `src/`
4. Overwrites `config/` with the up-to-date version from the dev plugin
5. Runs the build

**You never need to touch the generation script. Just edit files here.**

---

## Files you are expected to edit

| File | What it controls |
|------|-----------------|
| `readme.txt` | WordPress.org plugin listing — changelog, description, FAQ, screenshots |
| `adaire-blocks.php` | Main plugin bootstrap — PHP header meta, feature toggles |
| `includes/sendgrid.php` | SendGrid email delivery for deactivation feedback |
| `admin/deactivation-modal.php` | Feedback modal — reasons list, form fields, AJAX handler, recipient email |
| `admin/deactivation-log-page.php` | Tools → Adaire Deactivation Logs page (SendGrid testing) |
| `admin/css/deactivation-modal.css` | Feedback modal styles |
| `admin/js/deactivation-modal.js` | Feedback modal front-end JS |
| `docs/sendgrid-setup.md` | Developer docs for configuring SendGrid |

---

## Files managed automatically (do NOT edit here)

| File/Folder | Source |
|-------------|--------|
| `config/blocks-config.json` | Always pulled from dev plugin (stays current) |
| `config/block-icon-mapping.json` | Always pulled from dev plugin |
| `scripts/` | Pulled from dev plugin |
| `src/` | Free blocks injected by the script |
| `package.json` | Auto-generated |
| `build/` | Auto-generated |
| `node_modules/` | Auto-generated |

---

## Changing the feedback recipient email

In `admin/deactivation-modal.php`, line 9:

```php
private const DEFAULT_FEEDBACK_EMAIL = 'your@email.com';
```

Or via `wp-config.php` (keeps it out of code):

```php
define('ADAIRE_FEEDBACK_EMAIL', 'your@email.com');
define('ADAIRE_SENDGRID_API_KEY', 'your_sendgrid_key_here');
```

See `docs/sendgrid-setup.md` for full SendGrid setup instructions.

---

## Generating the free version

```bash
npm run generate-free
```
