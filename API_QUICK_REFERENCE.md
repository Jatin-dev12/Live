# Site Settings API - Quick Reference Card

## 🔗 API Endpoints

### Get Social Links (Public)
```
GET /settings/api/social-links
```
Returns: Facebook, Twitter, Instagram, LinkedIn, YouTube, **Telegram**, TikTok, WhatsApp

### Get All Settings (Public)
```
GET /settings/api/site-settings
```
Returns: Logo, Site Info, Social Media Links

### Upload Logo (Protected)
```
POST /settings/upload-logo
Content-Type: multipart/form-data
Body: { logo: <file> }
```

---

## 💻 Quick Code Examples

### Fetch Social Links
```javascript
fetch('/settings/api/social-links')
  .then(r => r.json())
  .then(d => console.log(d.data));
```

### Display Logo
```javascript
fetch('/settings/api/site-settings')
  .then(r => r.json())
  .then(d => {
    document.querySelector('img').src = d.data.logo;
  });
```

### Upload Logo
```javascript
const fd = new FormData();
fd.append('logo', fileInput.files[0]);
fetch('/settings/upload-logo', { method: 'POST', body: fd });
```

---

## 🎨 Social Media Icons

```html
<!-- Telegram (NEW) -->
<a href="<%= socialMedia.telegram %>">
  <i class="ri-telegram-fill"></i>
</a>

<!-- Facebook -->
<a href="<%= socialMedia.facebook %>">
  <i class="ri-facebook-fill"></i>
</a>

<!-- Twitter/X -->
<a href="<%= socialMedia.twitter %>">
  <i class="ri-twitter-x-fill"></i>
</a>

<!-- Instagram -->
<a href="<%= socialMedia.instagram %>">
  <i class="ri-instagram-fill"></i>
</a>
```

---

## 📦 Response Format

```json
{
  "success": true,
  "data": {
    "logo": "/uploads/site-logo/logo-123.png",
    "siteName": "My Site",
    "socialMedia": {
      "telegram": "https://t.me/channel",
      "facebook": "https://facebook.com/page",
      ...
    }
  }
}
```

---

## 🚀 Test Page

Visit: `http://localhost:8080/test-social-api.html`

---

## ✅ Changes Summary

- ❌ Pinterest removed
- ✅ Telegram added
- ✅ Logo upload added
- ✅ Logo in database
- ✅ Public APIs created
- ✅ All data saved to MongoDB
