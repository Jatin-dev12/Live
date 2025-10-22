# Dynamic Menu Management System

## Overview
The dynamic menu management system allows administrators to create, edit, and manage navigation menus through the admin panel without touching code.

## Features

### 1. **Multiple Menu Support**
- Create unlimited menus (Header, Footer, Sidebar, Custom)
- Each menu can have its own location and purpose
- Menus are identified by unique slugs

### 2. **Visual Menu Builder**
- Drag-and-drop interface (coming soon)
- Add pages from your site to menus
- Reorder menu items easily
- Edit menu item titles and URLs

### 3. **Menu Locations**
- **Header**: Main navigation menu
- **Footer**: Footer links
- **Sidebar**: Side navigation
- **Custom**: Any custom location

### 4. **Dynamic Page Integration**
- Automatically pulls all active pages from your CMS
- Select multiple pages at once
- Pages are added with their correct URLs

## Usage

### Creating a New Menu

1. Navigate to **Menu Management** in the admin panel
2. Click **"Create New"** button
3. Fill in the form:
   - **Menu Name**: Display name (e.g., "Header Menu")
   - **Menu Slug**: URL-friendly identifier (e.g., "header-menu")
   - **Location**: Where the menu will be used
4. Click **"Create Menu"**

### Adding Items to a Menu

1. Select a menu from the dropdown
2. Click **"Select"** to load the menu
3. In the left panel, check the pages you want to add
4. Click **"Add to Menu"**
5. Items will appear in the Menu Structure panel

### Editing Menu Items

1. Click the **edit icon** (pencil) next to any menu item
2. Update the title in the prompt
3. Changes are saved when you click **"Save Menu"**

### Removing Menu Items

1. Click the **delete icon** (trash) next to any menu item
2. Confirm the deletion
3. Click **"Save Menu"** to persist changes

### Saving Changes

- Click **"Save Menu"** to save all changes
- Click **"Reset"** to discard unsaved changes

## API Endpoints

### Get All Menus
```
GET /api/menus
```

### Get Menu by Slug
```
GET /api/menus/:slug
```

### Get All Pages
```
GET /api/menus/pages/all
```

### Create Menu
```
POST /api/menus
Body: {
  name: "Menu Name",
  slug: "menu-slug",
  location: "header",
  items: []
}
```

### Update Menu
```
PUT /api/menus/:id
Body: {
  name: "Updated Name",
  location: "header",
  items: [...]
}
```

### Delete Menu
```
DELETE /api/menus/:id
```

## Using Menus in Templates

Menus are automatically loaded and available in all EJS templates:

### Access Header Menu
```ejs
<nav>
  <% if (typeof headerMenu !== 'undefined' && headerMenu.length > 0) { %>
    <ul>
      <% headerMenu.forEach(item => { %>
        <li>
          <a href="<%= item.url %>" target="<%= item.target %>">
            <% if (item.icon) { %>
              <iconify-icon icon="<%= item.icon %>"></iconify-icon>
            <% } %>
            <%= item.title %>
          </a>
        </li>
      <% }); %>
    </ul>
  <% } %>
</nav>
```

### Access Footer Menu
```ejs
<footer>
  <% if (typeof footerMenu !== 'undefined' && footerMenu.length > 0) { %>
    <ul>
      <% footerMenu.forEach(item => { %>
        <li>
          <a href="<%= item.url %>"><%= item.title %></a>
        </li>
      <% }); %>
    </ul>
  <% } %>
</footer>
```

### Access Any Menu by Slug
```ejs
<% if (typeof menus !== 'undefined' && menus['custom-menu']) { %>
  <ul>
    <% menus['custom-menu'].forEach(item => { %>
      <li><a href="<%= item.url %>"><%= item.title %></a></li>
    <% }); %>
  </ul>
<% } %>
```

## Database Schema

### Menu Model
```javascript
{
  name: String,           // Display name
  slug: String,           // Unique identifier
  location: String,       // header, footer, sidebar, custom
  items: [MenuItem],      // Array of menu items
  isActive: Boolean,      // Active status
  createdBy: ObjectId,    // User who created
  updatedBy: ObjectId,    // User who last updated
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Schema
```javascript
{
  title: String,          // Display text
  url: String,            // Link URL
  target: String,         // _self or _blank
  icon: String,           // Icon identifier
  order: Number,          // Display order
  parentId: ObjectId,     // For nested menus
  isActive: Boolean       // Active status
}
```

## Seeding Sample Data

Run the seed script to create sample menus:

```bash
node scripts/seedMenus.js
```

This creates:
- **Header Menu**: Home, About, Services, Contact
- **Footer Menu**: Privacy Policy, Terms & Conditions, FAQ

## Best Practices

1. **Use Descriptive Names**: Make menu names clear and descriptive
2. **Consistent Slugs**: Use lowercase with hyphens (e.g., "main-menu")
3. **Organize by Location**: Create separate menus for different locations
4. **Regular Backups**: Save menu configurations before major changes
5. **Test Links**: Verify all menu links work correctly after saving

## Troubleshooting

### Menu Not Showing
- Check if menu is set to active
- Verify menu slug matches the one used in template
- Ensure menu has items added

### Items Not Saving
- Check browser console for errors
- Verify you clicked "Save Menu" button
- Check server logs for API errors

### Pages Not Loading
- Ensure pages are marked as active in Page Management
- Check database connection
- Verify Page model is properly configured

## Future Enhancements

- [ ] Drag-and-drop reordering
- [ ] Nested menu support (sub-menus)
- [ ] Custom link addition (external URLs)
- [ ] Menu item icons selection
- [ ] Bulk operations
- [ ] Menu duplication
- [ ] Import/Export functionality
- [ ] Menu preview
- [ ] Conditional display rules
