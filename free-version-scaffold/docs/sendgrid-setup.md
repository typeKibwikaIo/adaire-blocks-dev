# SendGrid Setup (Deactivation Feedback)

This plugin sends deactivation feedback emails through SendGrid only. When a user deactivates the plugin, a short feedback form appears and the message is sent via SendGrid.

## 1) Create a SendGrid API Key
1. Log in to SendGrid.
2. Go to **Settings → API Keys**.
3. Click **Create API Key**.
4. Choose **Restricted Access**.
5. Enable **Mail Send** with **Full Access**.
6. Save and copy the key (you’ll only see it once).

## 2) Add the API Key to WordPress
Add this in `wordpress/wp-config.php` (near other `define(...)` entries):
```
define('ADAIRE_SENDGRID_API_KEY', 'your_sendgrid_key_here');
define('ADAIRE_FEEDBACK_EMAIL', 'feedback@yourdomain.com');
```

## 3) Verify it works
1. Go to **Tools → Adaire Deactivation Logs**.
2. Use **Send Test Email** to send a test message.
3. Check the inbox for the test email.

## Notes
- The **Tools → Adaire Deactivation Logs** page is for setup/testing only. Remove it before production so clients cannot access it.
