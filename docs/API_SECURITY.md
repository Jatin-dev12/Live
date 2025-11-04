# Site Settings API - Security Documentation

## 🔒 Security Overview

The Site Settings API is designed with security in mind, ensuring sensitive data like SMTP credentials are NEVER exposed through public endpoints.

---

## 🚫 What's NOT Exposed in Public APIs

The following sensitive fields are **NEVER** returned in public API responses:

### SMTP Configuration (Admin Only)
- ❌ `smtp.host` - SMTP server hostname
- ❌ `smtp.port` - SMTP port number
- ❌ `smtp.secure` - SSL/TLS setting
- ❌ `smtp.username` - SMTP username/email
- ❌ `smtp.password` - SMTP password
- ❌ `smtp.fromEmail` - From email address
- ❌ `smtp.fromName` - From name

### Other Sensitive Data
- ❌ `updatedBy` - User ID who last updated settings
- ❌ Internal MongoDB fields (`_id`, `__v`, etc.)

---

## ✅ What IS Exposed in Public APIs

### Public Data (Safe to Expose)
- ✅ `logo` - Site logo URL
- ✅ `siteName` - Site name
- ✅ `siteDescription` - Site description
- ✅ `contactEmail` - Public contact email
- ✅ `contactPhone` - Public contact phone
- ✅ `socialMedia` - All social media links
  - Facebook, Twitter, Instagram, LinkedIn
  - YouTube, Telegram, TikTok, WhatsApp

---

## 🔐 API Endpoint Security Levels

### Level 1: Public (No Authentication)
These endpoints are safe for public access and contain NO sensitive data:

```
GET /settings/api/social-links
GET /settings/api/site-settings
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo.png",
    "siteName": "My Site",
    "socialMedia": {
      "facebook": "https://facebook.com/page",
      "telegram": "https://t.me/channel"
    }
  }
}
```

**Note:** SMTP data is completely excluded from these responses.

---

### Level 2: Protected (Authentication Required)
These endpoints require user authentication:

```
POST /settings/upload-logo
POST /settings/site-settings
POST /settings/test-smtp
GET  /settings/site-settings (Admin Page)
```

**Access Control:**
- User must be logged in (`isAuthenticated` middleware)
- User must have `settings` module permission OR be `super-admin`

---

## 🛡️ Database Security

### Schema-Level Protection

SMTP fields are marked with `select: false` in the Mongoose schema:

```javascript
smtp: {
    host: { type: String, default: '', select: false },
    port: { type: Number, default: 587, select: false },
    secure: { type: Boolean, default: false, select: false },
    username: { type: String, default: '', select: false },
    password: { type: String, default: '', select: false },
    fromEmail: { type: String, default: '', select: false },
    fromName: { type: String, default: '', select: false }
}
```

**What this means:**
- SMTP fields are NOT included in query results by default
- Must explicitly use `.select('+smtp.field')` to retrieve them
- Prevents accidental exposure through any query

---

## 🔍 How Data is Protected

### 1. Public API Queries
```javascript
// Only selects public fields
SiteSettings.findOne().select('logo siteName siteDescription contactEmail contactPhone socialMedia');
```

**Result:** SMTP data is never retrieved from database.

---

### 2. Admin Page Queries
```javascript
// Explicitly selects SMTP fields for admin use
SiteSettings.findOne().select('+smtp.host +smtp.port +smtp.username +smtp.password');
```

**Result:** SMTP data is only available to authenticated admins.

---

### 3. Email Service Queries
```javascript
// Only retrieves SMTP config when sending emails
SiteSettings.findOne().select('+smtp.host +smtp.port +smtp.username +smtp.password');
```

**Result:** SMTP data is only accessed when actually needed for sending emails.

---

## 🧪 Security Testing

### Test 1: Public API Should NOT Return SMTP Data
```bash
curl http://localhost:8080/settings/api/site-settings
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo.png",
    "siteName": "My Site",
    "socialMedia": { ... }
    // NO smtp field present
  }
}
```

✅ **Pass:** SMTP data is not present in response.

---

### Test 2: Verify SMTP Fields Are Hidden
```javascript
// Try to access SMTP directly (should fail)
const settings = await SiteSettings.findOne();
console.log(settings.smtp); // undefined or empty object
```

✅ **Pass:** SMTP fields are not accessible without explicit selection.

---

### Test 3: Admin Can Access SMTP (When Authenticated)
```javascript
// Admin explicitly requests SMTP data
const settings = await SiteSettings.findOne()
  .select('+smtp.host +smtp.username');
console.log(settings.smtp.host); // "smtp.gmail.com"
```

✅ **Pass:** Admin can access SMTP when explicitly requested.

---

## 🚨 Security Best Practices

### For Developers

1. **Never expose SMTP in public APIs**
   ```javascript
   // ❌ BAD - Exposes everything
   router.get('/api/settings', async (req, res) => {
     const settings = await SiteSettings.findOne();
     res.json(settings); // Includes SMTP!
   });
   
   // ✅ GOOD - Only public fields
   router.get('/api/settings', async (req, res) => {
     const settings = await SiteSettings.findOne()
       .select('logo siteName socialMedia');
     res.json(settings);
   });
   ```

2. **Always use authentication for sensitive operations**
   ```javascript
   // ✅ GOOD - Protected endpoint
   router.post('/settings/update', isAuthenticated, async (req, res) => {
     // Only authenticated users can update
   });
   ```

3. **Validate user permissions**
   ```javascript
   // ✅ GOOD - Check permissions
   if (userRole !== 'super-admin' && !userModules.includes('settings')) {
     return res.status(403).json({ error: 'Access denied' });
   }
   ```

---

### For Frontend Developers

1. **Use public APIs for displaying data**
   ```javascript
   // ✅ Safe to use in frontend
   fetch('/settings/api/social-links')
     .then(r => r.json())
     .then(data => displaySocialLinks(data.data));
   ```

2. **Never try to access SMTP data from frontend**
   ```javascript
   // ❌ This won't work and shouldn't work
   fetch('/settings/api/site-settings')
     .then(r => r.json())
     .then(data => {
       console.log(data.smtp); // undefined - not exposed
     });
   ```

3. **Handle missing data gracefully**
   ```javascript
   // ✅ Always check if data exists
   const logo = settings.logo || '/images/default-logo.png';
   const siteName = settings.siteName || 'My Site';
   ```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   MongoDB Database                   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         SiteSettings Collection            │    │
│  │                                            │    │
│  │  • logo (public)                          │    │
│  │  • siteName (public)                      │    │
│  │  • socialMedia (public)                   │    │
│  │  • smtp (select: false) ← PROTECTED       │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
                        ├─────────────────────────────┐
                        │                             │
                        ▼                             ▼
        ┌───────────────────────────┐   ┌──────────────────────────┐
        │   Public API Endpoints    │   │  Protected Admin Routes  │
        │                           │   │                          │
        │  GET /api/social-links   │   │  GET /settings/site-     │
        │  GET /api/site-settings  │   │      settings (page)     │
        │                           │   │  POST /settings/site-    │
        │  Returns:                 │   │       settings           │
        │  ✅ logo                  │   │                          │
        │  ✅ siteName              │   │  Returns:                │
        │  ✅ socialMedia           │   │  ✅ All public fields    │
        │  ❌ smtp (excluded)       │   │  ✅ smtp (explicit +)    │
        └───────────────────────────┘   └──────────────────────────┘
                        │                             │
                        │                             │
                        ▼                             ▼
        ┌───────────────────────────┐   ┌──────────────────────────┐
        │   Frontend/Public Users   │   │   Authenticated Admins   │
        │                           │   │                          │
        │  Can see:                 │   │  Can see & edit:         │
        │  • Logo                   │   │  • All public fields     │
        │  • Site name              │   │  • SMTP configuration    │
        │  • Social links           │   │  • Upload logo           │
        │                           │   │  • Test SMTP             │
        │  Cannot see:              │   │                          │
        │  • SMTP credentials       │   │  Protected by:           │
        │  • Admin details          │   │  • isAuthenticated       │
        └───────────────────────────┘   │  • Permission check      │
                                        └──────────────────────────┘
```

---

## ✅ Security Checklist

- [x] SMTP fields marked with `select: false` in schema
- [x] Public APIs explicitly select only public fields
- [x] Admin routes require authentication
- [x] SMTP data only retrieved when explicitly needed
- [x] No sensitive data in API responses
- [x] Proper error handling (no data leaks in errors)
- [x] File upload validation (type, size)
- [x] Logo upload requires authentication
- [x] Settings update requires authentication
- [x] Cache doesn't expose sensitive data

---

## 🔄 What Happens When You Call Public APIs

### Example: GET /settings/api/site-settings

```javascript
// 1. Request comes in
GET /settings/api/site-settings

// 2. Query only selects public fields
const settings = await SiteSettings.findOne()
  .select('logo siteName siteDescription contactEmail contactPhone socialMedia');

// 3. Response contains ONLY public data
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo.png",
    "siteName": "My Site",
    "siteDescription": "Description",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1234567890",
    "socialMedia": {
      "facebook": "https://facebook.com/page",
      "telegram": "https://t.me/channel",
      ...
    }
    // smtp field is NOT present - never retrieved from DB
  }
}
```

**Result:** SMTP credentials are safe and never exposed! 🔒

---

## 📝 Summary

✅ **Public APIs are safe** - No sensitive data exposed
✅ **SMTP data is protected** - Schema-level security
✅ **Admin access is controlled** - Authentication required
✅ **Data is validated** - File uploads, input validation
✅ **Errors don't leak data** - Proper error handling

Your site settings are secure! 🛡️
