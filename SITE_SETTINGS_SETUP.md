# Site Settings Module - Quick Setup

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install `nodemailer` which is required for email functionality.

### 2. Restart Your Server
```bash
npm start
# or for development
npm run dev
```

### 3. Access Site Settings
1. Login to your admin dashboard
2. Navigate to **Site Settings** in the sidebar
3. Configure your settings

## What's Been Created

### Models
- ✅ `models/SiteSettings.js` - Database schema for site settings

### Routes
- ✅ `routes/settings.js` - Updated with site settings routes
  - GET `/settings/site-settings` - View settings page
  - POST `/settings/site-settings` - Save settings
  - POST `/settings/test-smtp` - Test SMTP connection

### Views
- ✅ `views/settings/site-settings.ejs` - Complete settings page with:
  - General site information
  - Social media links (8 platforms)
  - SMTP email configuration
  - Test SMTP button
  - Save/Reset buttons

### Middleware
- ✅ `middleware/siteSettingsMiddleware.js` - Makes settings available in all views
- ✅ Updated `app.js` to load the middleware

### Utilities
- ✅ `utils/siteSettings.js` - Helper functions with caching
- ✅ `utils/emailService.js` - Email sending service

### Partials
- ✅ `views/partials/footer-social.ejs` - Ready-to-use social media links component

### Documentation
- ✅ `docs/SITE_SETTINGS_GUIDE.md` - Complete usage guide

## Quick Test

### 1. Test the Page
Visit: `http://localhost:8080/settings/site-settings`

### 2. Add Social Media Links
Fill in any social media URLs and click "Save Settings"

### 3. Configure SMTP (Optional)
For Gmail:
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: No (TLS)
- Username: your-email@gmail.com
- Password: [Generate App Password](https://myaccount.google.com/apppasswords)
- From Email: your-email@gmail.com
- From Name: Your Site Name

Click "Test SMTP" to verify the connection.

## Using Social Media Links

### In Your Footer
```ejs
<%- include('partials/footer-social') %>
```

### Custom Implementation
```ejs
<% if (siteSettings.socialMedia.facebook) { %>
    <a href="<%= siteSettings.socialMedia.facebook %>">
        <i class="ri-facebook-fill"></i> Facebook
    </a>
<% } %>
```

## Sending Emails

```javascript
const { sendEmail } = require('./utils/emailService');

await sendEmail({
    to: 'user@example.com',
    subject: 'Test Email',
    text: 'This is a test email',
    html: '<p>This is a <strong>test</strong> email</p>'
});
```

## Features

✅ Manage 8 social media platforms
✅ Full SMTP email configuration
✅ Test SMTP connection before saving
✅ Settings cached for performance
✅ Available in all views automatically
✅ Secure (only super-admin and settings module users)
✅ Real-time save with toast notifications
✅ Ready-to-use footer social component

## Next Steps

1. Install dependencies: `npm install`
2. Restart server
3. Login and navigate to Site Settings
4. Configure your social media links
5. (Optional) Configure SMTP for email functionality
6. Use `<%- include('partials/footer-social') %>` in your footer

## Support

For detailed documentation, see: `docs/SITE_SETTINGS_GUIDE.md`
