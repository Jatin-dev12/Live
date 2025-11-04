# Site Settings Module - Complete Guide

## Overview
The Site Settings module allows you to manage your website's configuration from a centralized dashboard, including social media links and SMTP email settings.

## Features

### 1. General Information
- Site Name
- Site Description
- Contact Email
- Contact Phone

### 2. Social Media Links
Manage all your social media profiles in one place:
- Facebook
- Twitter/X
- Instagram
- LinkedIn
- YouTube
- Pinterest
- TikTok
- WhatsApp

### 3. SMTP Email Configuration
Configure email sending capabilities:
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (default: 587)
- SSL/TLS Security
- Username/Email
- Password (use App Password for Gmail)
- From Email
- From Name

## Access

Navigate to: **Dashboard → Site Settings**

Only users with `super-admin` role or `settings` module permission can access this page.

## Usage

### Updating Settings

1. Go to Site Settings page
2. Fill in the required fields
3. Click "Save Settings"
4. Settings are saved and cached for performance

### Testing SMTP

1. Configure your SMTP settings
2. Click "Test SMTP" button
3. System will verify the connection
4. Success/error message will be displayed

### Using Social Media Links in Templates

Social media links are automatically available in all views via `siteSettings` variable.

**Example - Include in your footer:**
```ejs
<%- include('partials/footer-social') %>
```

**Custom implementation:**
```ejs
<% if (siteSettings.socialMedia.facebook) { %>
    <a href="<%= siteSettings.socialMedia.facebook %>" target="_blank">
        <i class="ri-facebook-fill"></i>
    </a>
<% } %>
```

### Sending Emails Programmatically

```javascript
const { sendEmail } = require('../utils/emailService');

// Send email
await sendEmail({
    to: 'user@example.com',
    subject: 'Welcome!',
    text: 'Plain text content',
    html: '<h1>HTML content</h1>'
});
```

### Accessing Settings in Code

```javascript
const { getSiteSettings, getSocialMediaLinks, getSmtpConfig } = require('../utils/siteSettings');

// Get all settings
const settings = await getSiteSettings();

// Get only social media links
const socialLinks = await getSocialMediaLinks();

// Get only SMTP config
const smtpConfig = await getSmtpConfig();
```

## SMTP Configuration Examples

### Gmail
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: `No (TLS)`
- Username: Your Gmail address
- Password: [App Password](https://support.google.com/accounts/answer/185833)

### Outlook/Office365
- Host: `smtp.office365.com`
- Port: `587`
- Secure: `No (TLS)`
- Username: Your Outlook email
- Password: Your password

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- Secure: `No (TLS)`
- Username: `apikey`
- Password: Your SendGrid API key

### Mailgun
- Host: `smtp.mailgun.org`
- Port: `587`
- Secure: `No (TLS)`
- Username: Your Mailgun SMTP username
- Password: Your Mailgun SMTP password

## Database Schema

Settings are stored in the `sitesettings` collection with the following structure:

```javascript
{
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String,
        pinterest: String,
        tiktok: String,
        whatsapp: String
    },
    smtp: {
        host: String,
        port: Number,
        secure: Boolean,
        username: String,
        password: String,
        fromEmail: String,
        fromName: String
    },
    siteName: String,
    siteDescription: String,
    contactEmail: String,
    contactPhone: String,
    updatedBy: ObjectId,
    createdAt: Date,
    updatedAt: Date
}
```

## Performance

- Settings are cached for 5 minutes to reduce database queries
- Cache is automatically cleared when settings are updated
- All views have access to settings via middleware

## Security Notes

1. SMTP passwords are stored in the database - consider encrypting them
2. Only super-admins and users with settings permission can access
3. Use App Passwords for Gmail instead of account passwords
4. Test SMTP connection before saving to ensure credentials work

## Troubleshooting

### SMTP Test Fails
- Verify host and port are correct
- Check username/password
- For Gmail, ensure "Less secure app access" is enabled or use App Password
- Check if your hosting provider blocks SMTP ports

### Social Links Not Showing
- Ensure middleware is loaded in app.js
- Check that `siteSettings` variable is available in your view
- Verify links are saved in the database

### Settings Not Updating
- Check browser console for errors
- Verify user has proper permissions
- Check server logs for database errors

## Files Created

- `models/SiteSettings.js` - Database model
- `routes/settings.js` - Updated with new routes
- `views/settings/site-settings.ejs` - Settings page
- `views/partials/footer-social.ejs` - Social media links partial
- `middleware/siteSettingsMiddleware.js` - Middleware to load settings
- `utils/siteSettings.js` - Helper functions
- `utils/emailService.js` - Email sending utility

## API Endpoints

- `GET /settings/site-settings` - View settings page
- `POST /settings/site-settings` - Update settings
- `POST /settings/test-smtp` - Test SMTP connection
