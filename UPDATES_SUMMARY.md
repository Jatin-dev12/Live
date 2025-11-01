# Site Settings Module - Updates Summary

## ✅ Changes Made

### 1. Social Media Updates
- ❌ **Removed:** Pinterest
- ✅ **Added:** Telegram
- **Total Platforms:** 8 (Facebook, Twitter, Instagram, LinkedIn, YouTube, Telegram, TikTok, WhatsApp)

### 2. Logo Upload Feature
- ✅ Added logo upload field in settings page
- ✅ Logo preview before upload
- ✅ Logo stored in database
- ✅ Logo saved to `/public/uploads/site-logo/`
- ✅ Supported formats: JPEG, JPG, PNG, GIF, SVG, WEBP
- ✅ Max file size: 5MB

### 3. API Endpoints Created

#### Public APIs (No Authentication Required)
```
GET /settings/api/social-links
GET /settings/api/site-settings
```

#### Protected APIs (Authentication Required)
```
POST /settings/upload-logo
POST /settings/site-settings
POST /settings/test-smtp
```

### 4. Database Schema Updated
```javascript
{
  logo: String,                    // NEW: Site logo path
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    telegram: String,              // NEW: Replaced Pinterest
    tiktok: String,
    whatsapp: String
  },
  smtp: { ... },
  siteName: String,
  siteDescription: String,
  contactEmail: String,
  contactPhone: String
}
```

---

## 📁 Files Modified

1. ✅ `models/SiteSettings.js` - Added logo field, replaced Pinterest with Telegram
2. ✅ `routes/settings.js` - Added logo upload, API endpoints
3. ✅ `views/settings/site-settings.ejs` - Added logo upload UI, replaced Pinterest with Telegram
4. ✅ `views/partials/footer-social.ejs` - Updated to use Telegram instead of Pinterest

---

## 📁 Files Created

1. ✅ `docs/SITE_SETTINGS_API.md` - Complete API documentation
2. ✅ `public/test-social-api.html` - Live API demo page
3. ✅ `public/uploads/site-logo/` - Directory for logo uploads

---

## 🚀 How to Use

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Restart Server
```bash
npm start
# or
npm run dev
```

### Step 3: Access Settings Page
Navigate to: `http://localhost:8080/settings/site-settings`

### Step 4: Upload Logo
1. Click "Choose File" in the logo section
2. Select an image (PNG, JPG, SVG, etc.)
3. Click "Upload" button
4. Logo will be saved to database and displayed

### Step 5: Add Social Media Links
1. Fill in social media URLs (Telegram instead of Pinterest)
2. Click "Save Settings"
3. All data saved to MongoDB

---

## 🔌 API Usage Examples

### Fetch Social Links
```javascript
fetch('/settings/api/social-links')
  .then(res => res.json())
  .then(data => {
    console.log('Social Links:', data.data);
    // Output: { facebook: "...", twitter: "...", telegram: "...", ... }
  });
```

### Fetch All Settings (Including Logo)
```javascript
fetch('/settings/api/site-settings')
  .then(res => res.json())
  .then(data => {
    const settings = data.data;
    document.getElementById('logo').src = settings.logo;
    document.getElementById('siteName').textContent = settings.siteName;
    
    // Access social media
    console.log('Telegram:', settings.socialMedia.telegram);
  });
```

### Upload Logo via JavaScript
```javascript
const formData = new FormData();
formData.append('logo', fileInput.files[0]);

fetch('/settings/upload-logo', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => {
    console.log('Logo uploaded:', data.logoPath);
  });
```

---

## 🧪 Test the API

Visit: `http://localhost:8080/test-social-api.html`

This demo page shows:
- ✅ Live logo display
- ✅ Site name and description
- ✅ Contact information
- ✅ All social media links with icons
- ✅ Real-time data from database

---

## 📊 Social Media Platforms

| Platform | Icon | Field Name | Example URL |
|----------|------|------------|-------------|
| Facebook | 🔵 | `facebook` | https://facebook.com/yourpage |
| Twitter/X | ⚫ | `twitter` | https://twitter.com/yourhandle |
| Instagram | 🟣 | `instagram` | https://instagram.com/yourprofile |
| LinkedIn | 🔵 | `linkedin` | https://linkedin.com/company/yourcompany |
| YouTube | 🔴 | `youtube` | https://youtube.com/@yourchannel |
| Telegram | 🔵 | `telegram` | https://t.me/yourchannel |
| TikTok | ⚫ | `tiktok` | https://tiktok.com/@yourhandle |
| WhatsApp | 🟢 | `whatsapp` | +1234567890 |

---

## 🎨 Frontend Integration

### In EJS Templates
```ejs
<!-- Logo -->
<img src="<%= siteSettings.logo %>" alt="Logo">

<!-- Social Links -->
<% if (siteSettings.socialMedia.telegram) { %>
  <a href="<%= siteSettings.socialMedia.telegram %>">
    <i class="ri-telegram-fill"></i>
  </a>
<% } %>
```

### In JavaScript/React
```jsx
const [settings, setSettings] = useState({});

useEffect(() => {
  fetch('/settings/api/site-settings')
    .then(res => res.json())
    .then(data => setSettings(data.data));
}, []);

return (
  <div>
    <img src={settings.logo} alt="Logo" />
    {settings.socialMedia?.telegram && (
      <a href={settings.socialMedia.telegram}>Telegram</a>
    )}
  </div>
);
```

---

## 📝 API Response Examples

### GET /settings/api/social-links
```json
{
  "success": true,
  "data": {
    "facebook": "https://facebook.com/page",
    "twitter": "https://twitter.com/handle",
    "instagram": "https://instagram.com/profile",
    "linkedin": "https://linkedin.com/company",
    "youtube": "https://youtube.com/@channel",
    "telegram": "https://t.me/channel",
    "tiktok": "https://tiktok.com/@handle",
    "whatsapp": "+1234567890"
  }
}
```

### GET /settings/api/site-settings
```json
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo-1234567890.png",
    "siteName": "My Awesome Site",
    "siteDescription": "This is my site",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1234567890",
    "socialMedia": {
      "facebook": "https://facebook.com/page",
      "telegram": "https://t.me/channel",
      ...
    }
  }
}
```

---

## 🔒 Security Notes

1. Logo upload requires authentication
2. Only image files allowed (JPEG, PNG, SVG, etc.)
3. 5MB file size limit
4. API endpoints for fetching data are public
5. Update endpoints require authentication

---

## 📚 Documentation

- **API Documentation:** `docs/SITE_SETTINGS_API.md`
- **Complete Guide:** `docs/SITE_SETTINGS_GUIDE.md`
- **Setup Instructions:** `SITE_SETTINGS_SETUP.md`
- **Usage Examples:** `examples/site-settings-usage.js`

---

## ✨ What's Working Now

✅ Pinterest removed, Telegram added
✅ Logo upload with preview
✅ Logo stored in database
✅ Logo accessible via API
✅ All social media data saved to MongoDB
✅ Public API to fetch social links
✅ Public API to fetch all settings
✅ Live demo page at `/test-social-api.html`
✅ Settings cached for performance
✅ Auto-clear cache on update

---

## 🎯 Next Steps

1. Run `npm install` to install nodemailer
2. Restart your server
3. Go to `/settings/site-settings`
4. Upload your logo
5. Add your social media links (including Telegram!)
6. Test the API at `/test-social-api.html`
7. Use the APIs in your frontend

---

## 🆘 Need Help?

Check the documentation:
- API docs: `docs/SITE_SETTINGS_API.md`
- Full guide: `docs/SITE_SETTINGS_GUIDE.md`
