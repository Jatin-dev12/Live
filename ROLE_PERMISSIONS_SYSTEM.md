# 🔐 Role-Based Permission System

## 📋 4 Roles Defined

### 1. **Super Admin** (Level 1)
**Access**: FULL - Everything
**Permissions**: ALL
- ✅ Create, Read, Update, Delete - Everything
- ✅ User Management
- ✅ Role Management
- ✅ Content Management
- ✅ SEO Management
- ✅ Media Management
- ✅ Settings
- ✅ All other modules

**Sidebar Shows**: All menu items

---

### 2. **Admin** (Level 2)
**Access**: HIGH - Most things except critical operations
**Permissions**:
- ✅ Create, Read, Update, Delete - Most modules
- ✅ User Management (cannot delete super admin)
- ❌ Role Management (cannot modify)
- ✅ Content Management
- ✅ SEO Management
- ✅ Media Management
- ✅ Ads Management
- ✅ Leads Management
- ✅ Blog Management
- ❌ Settings (read-only)

**Sidebar Shows**: All except Role Management

---

### 3. **Content Manager** (Level 3)
**Access**: LIMITED - Only Content & SEO
**Permissions**:
- ✅ Content Management (Create, Read, Update, Delete)
- ✅ SEO Management (Create, Read, Update, Delete)
- ✅ Media Management (Upload, View, Delete)
- ✅ Menu Management (Edit menus)
- ❌ User Management
- ❌ Role Management
- ❌ Settings
- ❌ Ads Management
- ❌ Leads Management

**Sidebar Shows**: 
- Dashboard (read-only)
- Content Management
- SEO Management
- Media
- Menu Management

---

### 4. **User** (Level 4)
**Access**: READ ONLY - Can view everything but cannot modify
**Permissions**:
- ✅ Dashboard (view only)
- ✅ View all content (READ ONLY)
- ❌ Cannot Create
- ❌ Cannot Update
- ❌ Cannot Delete
- ❌ Cannot access User Management
- ❌ Cannot access Role Management
- ❌ Cannot access Settings

**Sidebar Shows**: All menus but all actions are read-only

---

## 🗂️ Permission Mapping

### Module Permissions

| Module | Super Admin | Admin | Content Manager | User |
|--------|-------------|-------|-----------------|------|
| **Dashboard** | Full | Full | View | View |
| **Users** | CRUD | CRUD* | - | - |
| **Roles** | CRUD | View | - | - |
| **Content** | CRUD | CRUD | CRUD | View |
| **SEO** | CRUD | CRUD | CRUD | View |
| **Media** | CRUD | CRUD | CRUD | View |
| **Menu** | CRUD | CRUD | CRUD | View |
| **Ads** | CRUD | CRUD | - | View |
| **Leads** | CRUD | CRUD | - | View |
| **Blog** | CRUD | CRUD | - | View |
| **Settings** | CRUD | View | - | - |

*Admin cannot delete Super Admin users

---

## 🔧 Implementation Steps

### Step 1: Create 4 Roles with Permissions

```javascript
// Super Admin
{
  name: "Super Admin",
  level: 1,
  permissions: [
    "dashboard-manage",
    "users-create", "users-read", "users-update", "users-delete",
    "roles-create", "roles-read", "roles-update", "roles-delete",
    "cms-create", "cms-read", "cms-update", "cms-delete",
    "seo-create", "seo-read", "seo-update", "seo-delete",
    "media-create", "media-read", "media-update", "media-delete",
    "ads-create", "ads-read", "ads-update", "ads-delete",
    "leads-create", "leads-read", "leads-update", "leads-delete",
    "blog-create", "blog-read", "blog-update", "blog-delete",
    "settings-create", "settings-read", "settings-update", "settings-delete"
  ]
}

// Admin
{
  name: "Admin",
  level: 2,
  permissions: [
    "dashboard-manage",
    "users-create", "users-read", "users-update", "users-delete",
    "roles-read",
    "cms-create", "cms-read", "cms-update", "cms-delete",
    "seo-create", "seo-read", "seo-update", "seo-delete",
    "media-create", "media-read", "media-update", "media-delete",
    "ads-create", "ads-read", "ads-update", "ads-delete",
    "leads-create", "leads-read", "leads-update", "leads-delete",
    "blog-create", "blog-read", "blog-update", "blog-delete",
    "settings-read"
  ]
}

// Content Manager
{
  name: "Content Manager",
  level: 3,
  permissions: [
    "dashboard-read",
    "cms-create", "cms-read", "cms-update", "cms-delete",
    "seo-create", "seo-read", "seo-update", "seo-delete",
    "media-create", "media-read", "media-update", "media-delete"
  ]
}

// User (Read Only)
{
  name: "User",
  level: 4,
  permissions: [
    "dashboard-read",
    "cms-read",
    "seo-read",
    "media-read",
    "ads-read",
    "leads-read",
    "blog-read"
  ]
}
```

---

## 🎨 UI Changes Based on Role

### Super Admin View
```
Sidebar:
✅ Dashboard
✅ Manage Roles
✅ Users Management
✅ Content Management
✅ SEO Management
✅ Media
✅ Ads Management
✅ Leads Management
✅ Blog
✅ Settings

Buttons: Create, Edit, Delete (all visible)
```

### Admin View
```
Sidebar:
✅ Dashboard
❌ Manage Roles (hidden)
✅ Users Management
✅ Content Management
✅ SEO Management
✅ Media
✅ Ads Management
✅ Leads Management
✅ Blog
✅ Settings (view only)

Buttons: Create, Edit, Delete (visible except in Settings)
```

### Content Manager View
```
Sidebar:
✅ Dashboard (view only)
❌ Manage Roles (hidden)
❌ Users Management (hidden)
✅ Content Management
✅ SEO Management
✅ Media
✅ Menu Management
❌ Ads Management (hidden)
❌ Leads Management (hidden)
❌ Settings (hidden)

Buttons: Create, Edit, Delete (only in CMS, SEO, Media)
```

### User View
```
Sidebar:
✅ Dashboard (view only)
❌ Manage Roles (hidden)
❌ Users Management (hidden)
✅ Content Management (view only)
✅ SEO Management (view only)
✅ Media (view only)
✅ Ads Management (view only)
✅ Leads Management (view only)
✅ Blog (view only)
❌ Settings (hidden)

Buttons: ❌ No Create, Edit, Delete buttons visible
```

---

## 🔒 Permission Checking in Code

### In Routes
```javascript
// Super Admin only
router.post('/roles/create', isAuthenticated, hasRole('super-admin'), ...);

// Admin or Super Admin
router.post('/users/create', isAuthenticated, hasRole('super-admin', 'admin'), ...);

// Content Manager, Admin, or Super Admin
router.post('/cms/create', isAuthenticated, hasPermission('cms-create'), ...);

// Everyone (read only for User role)
router.get('/cms/list', isAuthenticated, hasPermission('cms-read'), ...);
```

### In Views (Hide/Show Buttons)
```ejs
<!-- Show Create button only if user has create permission -->
<% if (userPermissions.includes('cms-create')) { %>
  <button class="btn btn-primary">Create New</button>
<% } %>

<!-- Show Edit button only if user has update permission -->
<% if (userPermissions.includes('cms-update')) { %>
  <button class="btn btn-success">Edit</button>
<% } %>

<!-- Show Delete button only if user has delete permission -->
<% if (userPermissions.includes('cms-delete')) { %>
  <button class="btn btn-danger">Delete</button>
<% } %>
```

---

## 📝 Example Scenarios

### Scenario 1: Content Manager logs in
1. Sees only: Dashboard, Content, SEO, Media, Menu in sidebar
2. Can create/edit/delete content
3. Can create/edit/delete SEO settings
4. Can upload/delete media files
5. Cannot see Users, Roles, Ads, Leads, Settings

### Scenario 2: User (Read Only) logs in
1. Sees: Dashboard, Content, SEO, Media, Ads, Leads, Blog
2. Can VIEW everything
3. No Create/Edit/Delete buttons visible
4. Cannot modify anything
5. Cannot see Users, Roles, Settings

### Scenario 3: Admin logs in
1. Sees almost everything except Role Management
2. Can create/edit/delete users (except super admin)
3. Can manage content, SEO, ads, leads, blog
4. Can view settings but not modify
5. Cannot create/edit/delete roles

### Scenario 4: Super Admin logs in
1. Sees EVERYTHING
2. Can do EVERYTHING
3. Full control over all modules
4. Can create/edit/delete roles
5. Can manage all users including other admins

---

## ✅ Next Steps

1. **Seed Database** with 4 roles and their permissions
2. **Update Sidebar** to check permissions
3. **Update Views** to show/hide buttons based on permissions
4. **Add Permission Middleware** to all routes
5. **Test Each Role** thoroughly

Would you like me to implement this system now?
