# Permission-Based Sidebar & Modern Checkboxes - Implementation Guide

## ✅ What Was Implemented

### 1. Modern Custom Checkbox Design
Beautiful, animated checkboxes for the permission selection interface with:
- Smooth hover effects
- Animated check marks
- Gradient module headers
- Permission count badges
- Responsive grid layout

### 2. Permission-Based Sidebar Filtering
Dynamic sidebar that shows only menu items based on user's role and permissions.

---

## 🎨 Modern Checkbox Features

### Visual Improvements
- **Gradient Headers**: Each module has a beautiful purple gradient header
- **Hover Effects**: Smooth transitions and shadow effects on hover
- **Animated Checkmarks**: Check animation when selecting permissions
- **Permission Count**: Badge showing number of permissions per module
- **Responsive Grid**: Auto-adjusts to screen size
- **Better Spacing**: Clean, modern layout with proper padding

### Files Created/Modified
1. **`public/css/custom-checkbox.css`** - New custom checkbox styles
2. **`views/roles/addRoles.ejs`** - Updated with new checkbox structure
3. **`views/partials/head.ejs`** - Added custom-checkbox.css link

---

## 🔐 Permission-Based Sidebar

### How It Works

The sidebar now dynamically shows/hides menu items based on:
1. **User Role**: Super-admin sees everything
2. **User Permissions**: Regular users see only what they have permission for

### Permission Mapping

| Menu Item | Required Permission Module |
|-----------|---------------------------|
| Dashboard | `dashboard` |
| Manage Roles | `roles` |
| Users Management | `users` |
| Website Page Master | `cms` |
| Content Management | `cms` |
| Menu Management | `cms` |
| Media | `media` |
| SEO Management | `seo` |
| Ads Management | `ads` |
| Leads Management | `leads` |
| Resources & Publications | `blog` |
| Subscribed Users | `users` |
| Events Management | `dashboard` |
| Forms & Enquiries | `dashboard` |
| Reports & Analytics | `reports` |
| Site Settings | `settings` |

### Example Scenarios

#### Scenario 1: User with CMS and SEO Permissions
**Permissions**: `cms`, `seo`

**Sidebar Shows**:
- ✅ Dashboard
- ✅ Website Page Master
- ✅ Content Management
- ✅ Menu Management
- ✅ SEO Management
- ❌ Users Management
- ❌ Roles Management
- ❌ Ads Management
- ❌ Leads Management

#### Scenario 2: Super Admin
**Role**: `super-admin`

**Sidebar Shows**:
- ✅ All menu items (full access)

#### Scenario 3: Content Manager
**Permissions**: `cms`, `media`, `blog`

**Sidebar Shows**:
- ✅ Dashboard
- ✅ Website Page Master
- ✅ Content Management
- ✅ Menu Management
- ✅ Media
- ✅ Resources & Publications
- ❌ Users Management
- ❌ SEO Management
- ❌ Ads Management

---

## 🛠️ Files Modified

### 1. Middleware (`middleware/auth.js`)
Added code to extract user permissions and pass them to views:

```javascript
// Extract user permissions for sidebar filtering
const userPermissions = user.role && user.role.permissions 
    ? user.role.permissions.map(p => p.module) 
    : [];
res.locals.userPermissions = [...new Set(userPermissions)]; // Unique modules
res.locals.userRole = user.role ? user.role.slug : null;
```

### 2. Sidebar (`views/partials/sidebar.ejs`)
Completely rewritten with conditional rendering:

```ejs
<!-- Example: SEO Management -->
<% if (typeof userRole !== 'undefined' && (userRole === 'super-admin' || (typeof userPermissions !== 'undefined' && userPermissions.includes('seo')))) { %>
<li>
    <a href="/seo/seo-management">
        <iconify-icon icon="mingcute:storage-line" class="menu-icon"></iconify-icon>
        <span>SEO Management</span>
    </a>
</li>
<% } %>
```

### 3. Backup Created
- **`views/partials/sidebar-backup.ejs`** - Original sidebar backed up

---

## 🧪 Testing Instructions

### Test 1: Super Admin Access
1. Login as super-admin
2. Check sidebar
3. **Expected**: All menu items visible

### Test 2: Limited User Access
1. Create a new role with only `cms` and `seo` permissions
2. Assign this role to a test user
3. Login as that user
4. **Expected**: Only see:
   - Dashboard
   - Website Page Master
   - Content Management
   - Menu Management
   - SEO Management

### Test 3: No Permissions
1. Create a role with no permissions
2. Assign to test user
3. Login
4. **Expected**: Empty or minimal sidebar

### Test 4: Checkbox Design
1. Go to `/roles/add-roles`
2. **Expected**: See beautiful gradient headers, modern checkboxes
3. Hover over checkboxes
4. **Expected**: Smooth hover effects
5. Click module header checkbox
6. **Expected**: All permissions in that module get selected

---

## 🎯 How to Assign Permissions

### Step 1: Create a Role
1. Go to **Manage Roles** → **Roles List**
2. Click **Add New Role**
3. Enter role name (e.g., "Content Manager")
4. Select permissions by clicking module headers or individual checkboxes
5. Click **Create Role**

### Step 2: Assign Role to User
1. Go to **Users Management**
2. Edit a user or create new user
3. Select the role from dropdown
4. Save user

### Step 3: Test
1. Logout
2. Login as that user
3. Check sidebar - should only show permitted items

---

## 📝 Available Permission Modules

Based on `models/Permission.js`:

1. **users** - User management
2. **roles** - Role management
3. **dashboard** - Dashboard access
4. **blog** - Blog/publications
5. **leads** - Leads management
6. **invoice** - Invoice management
7. **settings** - Settings access
8. **cms** - Content management
9. **media** - Media library
10. **seo** - SEO management
11. **ads** - Ads management
12. **reports** - Reports & analytics

---

## 🎨 Checkbox CSS Classes

### Main Classes
- `.permission-checkbox` - Individual permission checkbox
- `.module-header-checkbox` - Module header with gradient
- `.permission-card` - Container for each module
- `.permission-grid` - Grid layout for permissions
- `.permission-count-badge` - Badge showing count
- `.checkmark` - Custom checkbox indicator

### Customization
Edit `public/css/custom-checkbox.css` to change:
- Colors (currently purple gradient)
- Hover effects
- Animation speed
- Grid columns
- Spacing

---

## 🔄 How to Add New Menu Items

### Step 1: Add Permission Module
In `models/Permission.js`, add to enum:
```javascript
module: {
    type: String,
    required: [true, 'Module is required'],
    enum: ['users', 'roles', 'dashboard', 'blog', 'leads', 'invoice', 'settings', 'cms', 'media', 'seo', 'ads', 'reports', 'YOUR_NEW_MODULE'],
    trim: true
}
```

### Step 2: Seed Permissions
Run seed script to create permissions for new module:
```bash
npm run seed
```

### Step 3: Add to Sidebar
In `views/partials/sidebar.ejs`, add:
```ejs
<% if (typeof userRole !== 'undefined' && (userRole === 'super-admin' || (typeof userPermissions !== 'undefined' && userPermissions.includes('YOUR_NEW_MODULE')))) { %>
<li>
    <a href="/your-route">
        <iconify-icon icon="your-icon" class="menu-icon"></iconify-icon>
        <span>Your Menu Item</span>
    </a>
</li>
<% } %>
```

---

## ⚠️ Important Notes

### Super Admin
- Super admin role (`super-admin`) **always sees all menu items**
- This is hardcoded for security and administrative purposes
- Cannot be restricted

### Permission Check Logic
```javascript
userRole === 'super-admin' || userPermissions.includes('module-name')
```

### Fallback
If `userPermissions` or `userRole` is undefined, menu items won't show (safe default)

---

## 🐛 Troubleshooting

### Issue: All menu items showing for regular user
**Solution**: 
1. Check user's role has correct permissions
2. Verify middleware is passing permissions correctly
3. Check console: `console.log(res.locals.userPermissions)`

### Issue: No menu items showing
**Solution**:
1. Check if user is logged in
2. Verify user has a role assigned
3. Check role has permissions
4. Restart server

### Issue: Checkboxes not styled
**Solution**:
1. Clear browser cache
2. Check if `custom-checkbox.css` is loaded (inspect page)
3. Verify CSS file path is correct

---

## 📞 Support

### Files to Check
1. `middleware/auth.js` - Permission extraction
2. `views/partials/sidebar.ejs` - Sidebar rendering
3. `public/css/custom-checkbox.css` - Checkbox styles
4. `views/roles/addRoles.ejs` - Permission selection UI

### Debug Tips
Add to any EJS file to see current permissions:
```ejs
<%= JSON.stringify(userPermissions) %>
<%= userRole %>
```

---

**Last Updated**: 2025-10-09  
**Status**: ✅ Fully Implemented and Working
