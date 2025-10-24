# Page Master System - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Seed Sample Data (Optional)
```bash
node scripts/seedPages.js
```
This creates sample pages: Home, About Us, Services, and Contact with content.

### Step 2: Access Admin Panel
- **Page Master**: http://localhost:8080/page-master/web-page-master
- **Content Management**: http://localhost:8080/cms/content-management

### Step 3: Create Your First Page
1. Click "Add Page Master"
2. Enter page name (e.g., "Products")
3. Path auto-generates (e.g., "/products")
4. Click "Save"
5. Page is now live at http://localhost:8080/products

---

## 📋 Common Tasks

### Create a New Page
```
1. Go to: /page-master/web-page-master
2. Click: "Add Page Master"
3. Fill: Name, Path, Status
4. Save
```

### Add Content to Page
```
1. Go to: /cms/content-management
2. Click: "Add Content"
3. Select: Page from dropdown
4. Fill: Title, Content (use editor)
5. Submit
```

### Edit a Page
```
1. Go to: /page-master/web-page-master
2. Click: Edit icon (green button)
3. Modify: Any field
4. Update
```

### Delete a Page
```
1. Go to: /page-master/web-page-master
2. Click: Delete icon (red button)
3. Confirm: Yes
Note: This also deletes all content on that page
```

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| View All Pages | `/page-master/web-page-master` |
| Add New Page | `/page-master/add-page` |
| View All Content | `/cms/content-management` |
| Add New Content | `/cms/add-content-management` |
| API - Pages | `/api/pages` |
| API - Content | `/api/content` |

---

## 💡 Pro Tips

### Auto-Generated Paths
- "About Us" → `/about-us`
- "Contact Page" → `/contact-page`
- "Home" → `/` (special case)

### Page Status
- **Active**: Page is live and accessible
- **Inactive**: Page exists but not accessible to visitors

### Content Order
- Content displays in order of creation
- Use the `order` field for custom sorting (future enhancement)

### Rich Text Editor
- **Bold**: Ctrl/Cmd + B
- **Italic**: Ctrl/Cmd + I
- **Link**: Click link icon
- **Image**: Click image icon
- **Heading**: Use heading dropdown

---

## 🐛 Troubleshooting

### Page Not Showing?
✓ Check page status is "Active"
✓ Verify path is correct
✓ Clear browser cache

### Content Not Displaying?
✓ Check content status is "Active"
✓ Verify content is linked to correct page
✓ Refresh the page

### Cannot Create Page?
✓ Ensure page name is unique
✓ Check path doesn't conflict
✓ Verify you're logged in

---

## 📊 Example Workflow

### Building a Company Website

**1. Create Pages:**
```
- Home (/)
- About Us (/about-us)
- Services (/services)
- Portfolio (/portfolio)
- Contact (/contact)
```

**2. Add Content:**
```
Home:
  - Hero Section
  - Features Overview
  - Call to Action

About Us:
  - Company Story
  - Team Members
  - Mission & Vision

Services:
  - Web Development
  - Mobile Apps
  - Consulting

Portfolio:
  - Project 1
  - Project 2
  - Project 3

Contact:
  - Contact Form
  - Location Map
  - Contact Details
```

**3. Publish:**
```
- Set all pages to "Active"
- Set all content to "Active"
- Share your website!
```

---

## 🎨 Content Best Practices

### Page Names
- Keep them short and descriptive
- Use title case (e.g., "About Us" not "about us")
- Avoid special characters

### Paths
- Use lowercase
- Use hyphens for spaces
- Keep them short and memorable
- Examples: `/about`, `/contact`, `/our-services`

### Content Titles
- Be descriptive
- Use action words
- Keep under 60 characters

### SEO Meta Fields
- **Meta Title**: 50-60 characters, include keywords
- **Meta Description**: 150-160 characters, compelling summary
- **Keywords**: 5-10 relevant keywords, comma-separated

---

## 📞 Need Help?

Check these files for detailed information:
- `PAGE_MASTER_GUIDE.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `QUICK_START.md` - This file

---

## ✅ Checklist for Going Live

- [ ] All pages created
- [ ] All content added
- [ ] Pages set to "Active"
- [ ] Content set to "Active"
- [ ] SEO meta fields filled
- [ ] Images uploaded
- [ ] Test all page URLs
- [ ] Check mobile responsiveness
- [ ] Verify navigation works
- [ ] Test edit/delete functions

---

**🎉 You're all set! Start creating amazing pages!**
