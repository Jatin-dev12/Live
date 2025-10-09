# RBAC System - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Seed database with default data
npm run seed

# Start application
npm start

# Development mode with auto-reload
npm run dev
```

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | Admin@123 |
| Admin | admin@example.com | Admin@123 |
| Manager | manager@example.com | Manager@123 |
| User | user@example.com | User@123 |

## 📍 Important URLs

| Page | URL |
|------|-----|
| Home | http://localhost:8080 |
| Add User | http://localhost:8080/users/add-user |
| Users List | http://localhost:8080/users/users-list |
| Add Role | http://localhost:8080/roles/add-roles |
| Roles Management | http://localhost:8080/roles/roles-management |

## 🔧 API Endpoints Cheat Sheet

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }

# Logout
POST /api/auth/logout

# Get current user
GET /api/auth/me
```

### Users
```bash
# List users
GET /api/users?page=1&limit=10&search=john

# Get user
GET /api/users/:id

# Create user
POST /api/users
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "ROLE_ID",
  "department": "IT"
}

# Update user
PUT /api/users/:id
Body: { "fullName": "John Updated" }

# Delete user
DELETE /api/users/:id

# Toggle status
PATCH /api/users/:id/toggle-status
```

### Roles
```bash
# List roles
GET /api/roles?page=1&limit=10

# Get role
GET /api/roles/:id

# Create role (Super Admin only)
POST /api/roles
Body: {
  "name": "Custom Role",
  "description": "Description",
  "permissions": ["PERM_ID_1", "PERM_ID_2"],
  "level": 3
}

# Update role (Super Admin only)
PUT /api/roles/:id
Body: { "name": "Updated Role" }

# Delete role (Super Admin only)
DELETE /api/roles/:id
```

### Permissions
```bash
# List permissions
GET /api/permissions

# Get permission
GET /api/permissions/:id
```

## 🛡️ Middleware Usage Examples

### Protect Route with Authentication
```javascript
const { isAuthenticated } = require('./middleware/auth');

router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
```

### Protect Route with Role
```javascript
const { isAuthenticated, hasRole } = require('./middleware/auth');

router.get('/admin-only', 
  isAuthenticated, 
  hasRole('super-admin', 'admin'), 
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);
```

### Protect Route with Permission
```javascript
const { isAuthenticated, hasPermission } = require('./middleware/auth');

router.post('/users', 
  isAuthenticated, 
  hasPermission('users-create', 'users-manage'), 
  (req, res) => {
    // Create user logic
  }
);
```

### Super Admin Only
```javascript
const { isAuthenticated, isSuperAdmin } = require('./middleware/auth');

router.post('/roles', 
  isAuthenticated, 
  isSuperAdmin, 
  (req, res) => {
    // Create role logic
  }
);
```

## ✅ Validation Rules

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Email Requirements
- Valid email format
- Must be unique in database

### Role Name Requirements
- 3-50 characters
- Must be unique

### User Name Requirements
- 2-100 characters

## 🎯 Permission Naming Convention

Format: `{module}-{action}`

**Modules:**
- users
- roles
- dashboard
- blog
- leads
- invoice
- settings
- cms
- media
- seo
- ads
- reports

**Actions:**
- create
- read
- update
- delete
- manage (includes all actions)

**Examples:**
- `users-create`
- `roles-manage`
- `blog-update`
- `dashboard-read`

## 🏗️ Role Hierarchy

| Level | Role Type | Description |
|-------|-----------|-------------|
| 1 | Super Admin | Full system access |
| 2 | Admin | Most permissions |
| 3 | Manager/Standard | Read and update |
| 4 | User/Basic | Limited access |
| 5 | Guest/Limited | Minimal access |

**Rule:** Lower level = Higher privileges

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| users | User accounts |
| roles | Role definitions |
| permissions | Permission definitions |
| sessions | Session storage |

## 🔍 Common Queries

### MongoDB Shell Commands

```javascript
// Connect to database
use crm_system

// Count users
db.users.countDocuments()

// Find user by email
db.users.findOne({ email: "superadmin@example.com" })

// List all roles
db.roles.find().pretty()

// Count permissions
db.permissions.countDocuments()

// Drop database (careful!)
db.dropDatabase()
```

## 🐛 Troubleshooting Quick Fixes

### MongoDB not connecting
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port already in use
```bash
# Change port in .env
PORT=3000
```

### Clear sessions
```javascript
// In MongoDB shell
use crm_system
db.sessions.deleteMany({})
```

### Reset database
```bash
# Drop and reseed
mongo crm_system --eval "db.dropDatabase()"
npm run seed
```

## 📝 Environment Variables

```env
# Required
PORT=8080
MONGODB_URI=mongodb://localhost:27017/crm_system
SESSION_SECRET=your-secret-key-min-32-chars

# Optional
NODE_ENV=development
```

## 🎨 Client-Side Functions

### Show Notification
```javascript
showNotification('Success', 'User created', 'success');
showNotification('Error', 'Failed to create', 'error');
showNotification('Warning', 'Please check', 'warning');
```

### Delete User
```javascript
deleteUser('USER_ID', 'User Name');
```

### Toggle User Status
```javascript
toggleUserStatus('USER_ID', true); // true = currently active
```

### Delete Role
```javascript
deleteRole('ROLE_ID', 'Role Name');
```

### Permission Selection
```javascript
selectAllPermissions();
deselectAllPermissions();
toggleModulePermissions(moduleCheckbox);
```

## 📦 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

## 🔗 Useful Links

- **Full Documentation**: README_RBAC.md
- **Setup Guide**: SETUP_GUIDE.md
- **Implementation Details**: IMPLEMENTATION_SUMMARY.md

## 💡 Tips

1. Always use Super Admin for role management
2. Test with different roles to verify permissions
3. Use strong passwords in production
4. Backup database before major changes
5. Monitor session storage size
6. Clear old sessions periodically
7. Use HTTPS in production
8. Set strong SESSION_SECRET
9. Enable rate limiting for APIs
10. Implement logging for audit trail

## 🆘 Support

For detailed help, refer to the full documentation files or contact your development team.
