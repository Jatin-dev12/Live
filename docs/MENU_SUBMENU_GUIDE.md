# Menu Management - Submenu Feature Guide

## 🎯 Overview

The menu management system now supports **multi-level submenus** (up to 2 levels deep) with a hierarchical structure that's easy to manage and automatically included in the API responses.

---

## ✨ Features

### 1. **Add Submenus**
- Click the **"+"** button next to any menu item to add a submenu
- Enter title and URL for the submenu item
- Submenus are visually indented and styled differently

### 2. **Indent/Outdent Items**
- **Indent (→)**: Convert a menu item into a submenu of the item above it
- **Outdent (←)**: Move a submenu item back to the parent level

### 3. **Drag & Drop Reordering**
- Drag items by the handle icon to reorder
- Works for both parent items and submenus
- Maintains parent-child relationships

### 4. **Visual Hierarchy**
- **Level 0 (Parent)**: White background, bold text
- **Level 1 (Submenu)**: Light gray background, blue left border
- **Level 2 (Sub-submenu)**: Darker gray background, gray left border
- Badge shows number of children

### 5. **Smart Deletion**
- Removing a parent item also removes all its submenus
- Confirmation dialog warns about submenu deletion

---

## 🎨 Visual Structure

```
┌─────────────────────────────────────────┐
│ 🔲 Home                          [+ - ×]│  ← Parent Item
├─────────────────────────────────────────┤
│   ↳ About Us                  [← - ×]   │  ← Submenu Level 1
│   ↳ Our Team                  [← - ×]   │
│     ↳ Leadership              [← ×]     │  ← Submenu Level 2
│     ↳ Departments             [← ×]     │
├─────────────────────────────────────────┤
│ 🔲 Services (2)                  [+ - ×]│  ← Parent with 2 children
│   ↳ Web Development           [← - ×]   │
│   ↳ Mobile Apps               [← - ×]   │
└─────────────────────────────────────────┘

Buttons:
+ = Add Submenu
→ = Indent (make submenu)
← = Outdent (move to parent level)
× = Remove
```

---

## 📡 API Response Structure

### Endpoint: `GET /api/menus/:slug`

**Hierarchical Response:**
```json
{
  "success": true,
  "menu": {
    "_id": "...",
    "name": "Header Menu",
    "slug": "header-menu",
    "items": [
      {
        "_id": "item1",
        "title": "Home",
        "url": "/",
        "target": "_self",
        "order": 0,
        "isActive": true,
        "children": []
      },
      {
        "_id": "item2",
        "title": "About",
        "url": "/about",
        "target": "_self",
        "order": 1,
        "isActive": true,
        "children": [
          {
            "_id": "item3",
            "title": "Our Team",
            "url": "/about/team",
            "target": "_self",
            "order": 0,
            "isActive": true,
            "parentId": "item2",
            "children": [
              {
                "_id": "item4",
                "title": "Leadership",
                "url": "/about/team/leadership",
                "target": "_self",
                "order": 0,
                "isActive": true,
                "parentId": "item3",
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 💻 Frontend Usage Examples

### Example 1: Render Menu with Submenus (EJS)

```ejs
<nav>
  <ul class="menu">
    <% menu.items.forEach(item => { %>
      <li>
        <a href="<%= item.url %>"><%= item.title %></a>
        
        <% if (item.children && item.children.length > 0) { %>
          <ul class="submenu">
            <% item.children.forEach(child => { %>
              <li>
                <a href="<%= child.url %>"><%= child.title %></a>
                
                <% if (child.children && child.children.length > 0) { %>
                  <ul class="sub-submenu">
                    <% child.children.forEach(subchild => { %>
                      <li>
                        <a href="<%= subchild.url %>"><%= subchild.title %></a>
                      </li>
                    <% }); %>
                  </ul>
                <% } %>
              </li>
            <% }); %>
          </ul>
        <% } %>
      </li>
    <% }); %>
  </ul>
</nav>
```

---

### Example 2: Render Menu with JavaScript

```javascript
async function renderMenu() {
  const response = await fetch('/api/menus/header-menu');
  const data = await response.json();
  
  if (data.success) {
    const menuHtml = buildMenuHtml(data.menu.items);
    document.getElementById('main-menu').innerHTML = menuHtml;
  }
}

function buildMenuHtml(items, level = 0) {
  const ulClass = level === 0 ? 'menu' : level === 1 ? 'submenu' : 'sub-submenu';
  
  return `
    <ul class="${ulClass}">
      ${items.map(item => `
        <li>
          <a href="${item.url}">${item.title}</a>
          ${item.children && item.children.length > 0 
            ? buildMenuHtml(item.children, level + 1) 
            : ''}
        </li>
      `).join('')}
    </ul>
  `;
}
```

---

### Example 3: React Component

```jsx
function MenuItem({ item, level = 0 }) {
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <li className={`menu-item level-${level}`}>
      <a href={item.url}>{item.title}</a>
      {hasChildren && (
        <ul className={`submenu level-${level + 1}`}>
          {item.children.map(child => (
            <MenuItem key={child._id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Menu({ items }) {
  return (
    <nav>
      <ul className="menu">
        {items.map(item => (
          <MenuItem key={item._id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
```

---

### Example 4: Bootstrap Dropdown Menu

```html
<nav class="navbar navbar-expand-lg">
  <ul class="navbar-nav">
    <% menu.items.forEach(item => { %>
      <% if (item.children && item.children.length > 0) { %>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="<%= item.url %>" data-bs-toggle="dropdown">
            <%= item.title %>
          </a>
          <ul class="dropdown-menu">
            <% item.children.forEach(child => { %>
              <% if (child.children && child.children.length > 0) { %>
                <li class="dropend">
                  <a class="dropdown-item dropdown-toggle" href="<%= child.url %>">
                    <%= child.title %>
                  </a>
                  <ul class="dropdown-menu">
                    <% child.children.forEach(subchild => { %>
                      <li><a class="dropdown-item" href="<%= subchild.url %>"><%= subchild.title %></a></li>
                    <% }); %>
                  </ul>
                </li>
              <% } else { %>
                <li><a class="dropdown-item" href="<%= child.url %>"><%= child.title %></a></li>
              <% } %>
            <% }); %>
          </ul>
        </li>
      <% } else { %>
        <li class="nav-item">
          <a class="nav-link" href="<%= item.url %>"><%= item.title %></a>
        </li>
      <% } %>
    <% }); %>
  </ul>
</nav>
```

---

## 🔧 How It Works

### Database Structure

Each menu item has a `parentId` field:
```javascript
{
  title: "Our Team",
  url: "/about/team",
  parentId: "item2",  // References parent item
  order: 0,
  isActive: true
}
```

### API Processing

1. **Flat Storage**: Items are stored flat in the database with `parentId` references
2. **Hierarchical Response**: API automatically builds hierarchy using `buildMenuHierarchy()` function
3. **Children Array**: Each item gets a `children` array containing its submenus

### Frontend Rendering

1. **Load Menu**: Fetch hierarchical structure from API
2. **Flatten for Editing**: Convert to flat array for drag-drop editing
3. **Display Hierarchy**: Render with indentation and visual cues
4. **Save**: Convert back to flat structure with `parentId` references

---

## 📝 Usage Instructions

### Adding a Submenu

1. Click the **"+"** button next to a menu item
2. Enter submenu title (e.g., "Our Team")
3. Enter submenu URL (e.g., "/about/team")
4. Click "Add"
5. Submenu appears indented below parent
6. Click "Save Menu" to persist changes

### Converting to Submenu

1. Add two menu items normally
2. Click the **"→"** (indent) button on the second item
3. It becomes a submenu of the first item
4. Click "Save Menu"

### Moving Back to Parent Level

1. Click the **"←"** (outdent) button on a submenu item
2. It moves back to the parent level
3. Click "Save Menu"

### Reordering

1. Drag items by the handle icon (⋮⋮)
2. Drop in desired position
3. Automatically saves

---

## ⚠️ Limitations

- **Maximum Depth**: 2 levels (Parent → Submenu → Sub-submenu)
- **Indent Button**: Only available for parent-level items without children
- **Add Submenu**: Not available for level 2 items (sub-submenus)

---

## 🎯 Best Practices

1. **Keep It Simple**: Don't go too deep (2 levels max)
2. **Logical Grouping**: Group related pages under parent items
3. **Clear Names**: Use descriptive titles for menu items
4. **Test Navigation**: Verify all links work after saving
5. **Mobile Friendly**: Consider how submenus will display on mobile

---

## 🐛 Troubleshooting

### Submenus Not Showing
- Check if items have correct `parentId`
- Verify API returns hierarchical structure
- Check frontend rendering logic

### Can't Add Submenu
- Ensure parent item is at level 0 or 1
- Check if maximum depth (2) is reached

### Items Not Saving
- Click "Save Menu" button after changes
- Check browser console for errors
- Verify API endpoint is working

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menus` | Get all menus with hierarchy |
| GET | `/api/menus/:slug` | Get specific menu with hierarchy |
| POST | `/api/menus` | Create new menu |
| PUT | `/api/menus/:id` | Update menu (saves flat structure) |
| DELETE | `/api/menus/:id` | Delete menu |

---

## ✅ Summary

The submenu feature provides:
- ✅ Multi-level menu support (up to 2 levels)
- ✅ Visual hierarchy with indentation
- ✅ Drag & drop reordering
- ✅ Easy indent/outdent controls
- ✅ Hierarchical API responses
- ✅ Smart deletion (removes children)
- ✅ Ready-to-use in frontend templates

**Your menus are now fully hierarchical and ready to use!** 🎉
