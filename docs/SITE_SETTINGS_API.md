# Site Settings API Documentation

## Base URL
All endpoints are prefixed with `/settings`

## 🔒 Security Notice

**Public APIs do NOT expose sensitive data:**
- ❌ SMTP credentials are NEVER returned
- ❌ Admin details are NEVER exposed
- ✅ Only public information (logo, social links, contact info) is accessible

See `docs/API_SECURITY.md` for detailed security information.

---

## Endpoints

### 1. Get Social Media Links
Fetch all social media links from the database.

**Endpoint:** `GET /settings/api/social-links`

**Authentication:** Not required (public endpoint)

**Security:** No sensitive data exposed

**Response:**
```json
{
  "success": true,
  "data": {
    "facebook": "https://facebook.com/yourpage",
    "twitter": "https://twitter.com/yourhandle",
    "instagram": "https://instagram.com/yourprofile",
    "linkedin": "https://linkedin.com/company/yourcompany",
    "youtube": "https://youtube.com/@yourchannel",
    "telegram": "https://t.me/yourchannel",
    "tiktok": "https://tiktok.com/@yourhandle",
    "whatsapp": "+1234567890"
  }
}
```

**Example Usage:**
```javascript
// Fetch social links
fetch('/settings/api/social-links')
  .then(response => response.json())
  .then(data => {
    console.log('Social Links:', data.data);
  });
```

---

### 2. Get All Site Settings
Fetch public site settings including logo, site info, and social media links.

**Endpoint:** `GET /settings/api/site-settings`

**Authentication:** Not required (public endpoint)

**Security:** SMTP credentials and admin details are NOT included in response

**Response:**
```json
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo-1234567890.png",
    "siteName": "My Awesome Site",
    "siteDescription": "This is my awesome website",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1 234 567 8900",
    "socialMedia": {
      "facebook": "https://facebook.com/yourpage",
      "twitter": "https://twitter.com/yourhandle",
      "instagram": "https://instagram.com/yourprofile",
      "linkedin": "https://linkedin.com/company/yourcompany",
      "youtube": "https://youtube.com/@yourchannel",
      "telegram": "https://t.me/yourchannel",
      "tiktok": "https://tiktok.com/@yourhandle",
      "whatsapp": "+1234567890"
    }
    // NOTE: smtp field is NOT included - protected data
  }
}
```

**Example Usage:**
```javascript
// Fetch all settings
fetch('/settings/api/site-settings')
  .then(response => response.json())
  .then(data => {
    const settings = data.data;
    document.getElementById('siteLogo').src = settings.logo;
    document.getElementById('siteName').textContent = settings.siteName;
  });
```

---

### 3. Upload Logo
Upload a new site logo.

**Endpoint:** `POST /settings/upload-logo`

**Authentication:** Required (isAuthenticated middleware)

**Content-Type:** `multipart/form-data`

**Parameters:**
- `logo` (file) - Image file (JPEG, JPG, PNG, GIF, SVG, WEBP)
- Max file size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "logoPath": "/uploads/site-logo/logo-1234567890.png"
}
```

**Example Usage:**
```javascript
// Upload logo
const formData = new FormData();
formData.append('logo', fileInput.files[0]);

fetch('/settings/upload-logo', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Logo uploaded:', data.logoPath);
    }
  });
```

---

### 4. Update Site Settings
Update site settings including social media links and SMTP configuration.

**Endpoint:** `POST /settings/site-settings`

**Authentication:** Required (isAuthenticated middleware)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "siteName": "My Site",
  "siteDescription": "Site description",
  "contactEmail": "contact@example.com",
  "contactPhone": "+1234567890",
  "facebook": "https://facebook.com/page",
  "twitter": "https://twitter.com/handle",
  "instagram": "https://instagram.com/profile",
  "linkedin": "https://linkedin.com/company",
  "youtube": "https://youtube.com/@channel",
  "telegram": "https://t.me/channel",
  "tiktok": "https://tiktok.com/@handle",
  "whatsapp": "+1234567890",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpSecure": "false",
  "smtpUsername": "email@gmail.com",
  "smtpPassword": "app-password",
  "smtpFromEmail": "noreply@example.com",
  "smtpFromName": "My Site"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

### 5. Test SMTP Connection
Test the configured SMTP connection.

**Endpoint:** `POST /settings/test-smtp`

**Authentication:** Required (isAuthenticated middleware)

**Content-Type:** `application/json`

**Response (Success):**
```json
{
  "success": true,
  "message": "SMTP connection successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Frontend Integration Examples

### Example 1: Display Social Media Icons
```html
<div id="socialLinks"></div>

<script>
fetch('/settings/api/social-links')
  .then(response => response.json())
  .then(data => {
    const links = data.data;
    const container = document.getElementById('socialLinks');
    
    if (links.facebook) {
      container.innerHTML += `<a href="${links.facebook}"><i class="ri-facebook-fill"></i></a>`;
    }
    if (links.twitter) {
      container.innerHTML += `<a href="${links.twitter}"><i class="ri-twitter-fill"></i></a>`;
    }
    if (links.instagram) {
      container.innerHTML += `<a href="${links.instagram}"><i class="ri-instagram-fill"></i></a>`;
    }
    if (links.telegram) {
      container.innerHTML += `<a href="${links.telegram}"><i class="ri-telegram-fill"></i></a>`;
    }
  });
</script>
```

### Example 2: Display Site Logo and Name
```html
<header>
  <img id="siteLogo" src="" alt="Site Logo">
  <h1 id="siteName"></h1>
</header>

<script>
fetch('/settings/api/site-settings')
  .then(response => response.json())
  .then(data => {
    const settings = data.data;
    document.getElementById('siteLogo').src = settings.logo || '/images/logo.png';
    document.getElementById('siteName').textContent = settings.siteName;
  });
</script>
```

### Example 3: React Component
```jsx
import { useEffect, useState } from 'react';

function SocialLinks() {
  const [links, setLinks] = useState({});

  useEffect(() => {
    fetch('/settings/api/social-links')
      .then(res => res.json())
      .then(data => setLinks(data.data));
  }, []);

  return (
    <div className="social-links">
      {links.facebook && (
        <a href={links.facebook} target="_blank" rel="noopener noreferrer">
          <i className="ri-facebook-fill"></i>
        </a>
      )}
      {links.twitter && (
        <a href={links.twitter} target="_blank" rel="noopener noreferrer">
          <i className="ri-twitter-fill"></i>
        </a>
      )}
      {links.telegram && (
        <a href={links.telegram} target="_blank" rel="noopener noreferrer">
          <i className="ri-telegram-fill"></i>
        </a>
      )}
    </div>
  );
}
```

### Example 4: Vue.js Component
```vue
<template>
  <div class="social-links">
    <a v-if="links.facebook" :href="links.facebook" target="_blank">
      <i class="ri-facebook-fill"></i>
    </a>
    <a v-if="links.twitter" :href="links.twitter" target="_blank">
      <i class="ri-twitter-fill"></i>
    </a>
    <a v-if="links.telegram" :href="links.telegram" target="_blank">
      <i class="ri-telegram-fill"></i>
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      links: {}
    };
  },
  mounted() {
    fetch('/settings/api/social-links')
      .then(res => res.json())
      .then(data => {
        this.links = data.data;
      });
  }
};
</script>
```

---

## Social Media Platforms Supported

1. **Facebook** - Full profile/page URL
2. **Twitter/X** - Full profile URL
3. **Instagram** - Full profile URL
4. **LinkedIn** - Full company/profile URL
5. **YouTube** - Full channel URL
6. **Telegram** - t.me link or username
7. **TikTok** - Full profile URL
8. **WhatsApp** - Phone number with country code

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `500` - Internal Server Error

---

## Notes

1. The social links API is public and doesn't require authentication
2. Logo uploads are limited to 5MB
3. Supported image formats: JPEG, JPG, PNG, GIF, SVG, WEBP
4. Settings are cached for 5 minutes for performance
5. Cache is automatically cleared when settings are updated
6. All social media fields are optional
7. Logo is stored in `/public/uploads/site-logo/` directory

---

## 🔒 Security & Privacy

### What's Protected
- **SMTP Credentials:** Never exposed in any public API
- **Admin Details:** Not included in public responses
- **Sensitive Configuration:** Only accessible to authenticated admins

### What's Public
- **Logo:** Safe to display publicly
- **Site Name & Description:** Public information
- **Contact Info:** Intended for public display
- **Social Media Links:** Public profile links

### Database Security
- SMTP fields are marked with `select: false` in the schema
- Public APIs explicitly exclude sensitive fields
- Admin routes require authentication
- Only authorized users can update settings

**For detailed security information, see:** `docs/API_SECURITY.md`
