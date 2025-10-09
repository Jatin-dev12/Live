# Role-Based Access Control (RBAC) System

## Overview

This application now includes a comprehensive Role-Based Access Control (RBAC) system with the following features:

- **Super Admin** can create and manage roles with custom permissions
- **Role Management** with granular permission control
- **User Management** with role assignment
- **Complete validation** on both client and server side
- **Secure authentication** with session management
- **MongoDB** for data persistence

## Features

### 1. **Role Management**
- Create, update, and delete roles
- Assign multiple permissions to roles
- Role hierarchy with levels (1-5, where 1 is highest)
- System roles (Super Admin, Admin, Manager, User) cannot be deleted
- Custom roles can be created by Super Admin

### 2. **Permission System**
- Modular permissions organized by feature (users, roles, dashboard, blog, leads, etc.)
- Action-based permissions (create, read, update, delete, manage)
- Permissions grouped by modules for easy management
- Super Admin has all permissions by default

### 3. **User Management**
- Create users with role assignment
- Password validation (minimum 8 characters, uppercase, lowercase, number, special character)
- Email validation and uniqueness check
- Department and designation assignment
- User activation/deactivation
- Profile management

### 4. **Security Features**
- Password hashing with bcrypt (12 salt rounds)
- Session-based authentication with MongoDB store
- Role-based middleware for route protection
- Permission-based middleware for fine-grained access control
- CSRF protection ready
- Secure password reset capability

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

Make sure MongoDB is running on your system. The default connection string is:
```
mongodb://localhost:27017/crm_system
```

You can change this by setting the `MONGODB_URI` environment variable.

### 3. Seed the Database

Run the seeder script to create default roles, permissions, and users:

```bash
node scripts/seedDatabase.js
```

This will create:
- **Permissions**: All module and action combinations
- **Roles**: Super Admin, Admin, Manager, User, Sales, Content Manager
- **Users**: Default users for each role

### 4. Default Login Credentials

After seeding, you can login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | Admin@123 |
| Admin | admin@example.com | Admin@123 |
| Manager | manager@example.com | Manager@123 |
| User | user@example.com | User@123 |

### 5. Start the Application

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The application will be available at: `http://localhost:8080`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crm_system

# Session Configuration
SESSION_SECRET=your-super-secret-key-change-in-production
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/status` - Check authentication status

### Users
- `GET /api/users` - Get all users (requires `users-read` or `users-manage` permission)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (requires `users-create` or `users-manage` permission)
- `PUT /api/users/:id` - Update user (requires `users-update` or `users-manage` permission)
- `DELETE /api/users/:id` - Delete user (requires `users-delete` or `users-manage` permission)
- `POST /api/users/:id/change-password` - Change user password
- `PATCH /api/users/:id/toggle-status` - Toggle user active status

### Roles
- `GET /api/roles` - Get all roles (requires `roles-read` or `roles-manage` permission)
- `GET /api/roles/:id` - Get single role
- `POST /api/roles` - Create role (requires Super Admin)
- `PUT /api/roles/:id` - Update role (requires Super Admin)
- `DELETE /api/roles/:id` - Delete role (requires Super Admin)
- `POST /api/roles/:id/permissions` - Assign permissions to role (requires Super Admin)

### Permissions
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get single permission
- `POST /api/permissions` - Create permission (requires Super Admin)
- `PUT /api/permissions/:id` - Update permission (requires Super Admin)
- `DELETE /api/permissions/:id` - Delete permission (requires Super Admin)

## Database Models

### User Model
```javascript
{
  fullName: String (required, 2-100 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed, min 8 chars),
  phone: String (optional),
  profileImage: String (optional),
  role: ObjectId (required, ref: Role),
  department: String (enum),
  designation: String (optional),
  description: String (optional),
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  lastLogin: Date,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Role Model
```javascript
{
  name: String (required, unique, 3-50 chars),
  slug: String (required, unique, auto-generated),
  description: String (optional, max 500 chars),
  permissions: [ObjectId] (ref: Permission),
  level: Number (required, 1-5, default: 3),
  isSystemRole: Boolean (default: false),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Permission Model
```javascript
{
  name: String (required, unique, 3-50 chars),
  slug: String (required, unique, auto-generated),
  description: String (optional, max 200 chars),
  module: String (required, enum),
  action: String (required, enum: create/read/update/delete/manage),
  isActive: Boolean (default: true),
  timestamps: true
}
```

## Middleware Usage

### Authentication Middleware

```javascript
const { isAuthenticated } = require('./middleware/auth');

router.get('/protected-route', isAuthenticated, (req, res) => {
  // Route handler
});
```

### Role-Based Middleware

```javascript
const { hasRole } = require('./middleware/auth');

router.get('/admin-only', isAuthenticated, hasRole('super-admin', 'admin'), (req, res) => {
  // Only super-admin and admin can access
});
```

### Permission-Based Middleware

```javascript
const { hasPermission } = require('./middleware/auth');

router.post('/users', isAuthenticated, hasPermission('users-create', 'users-manage'), (req, res) => {
  // Only users with users-create or users-manage permission can access
});
```

### Super Admin Middleware

```javascript
const { isSuperAdmin } = require('./middleware/auth');

router.post('/roles', isAuthenticated, isSuperAdmin, (req, res) => {
  // Only super admin can access
});
```

## Validation

All API endpoints include comprehensive validation using `express-validator`:

- **Email validation**: Valid format, uniqueness check
- **Password validation**: Min 8 chars, uppercase, lowercase, number, special character
- **Role validation**: Valid MongoDB ObjectId, role exists and is active
- **Permission validation**: Valid permission IDs
- **Field length validation**: Min/max character limits
- **Required field validation**: All required fields must be present

## Client-Side Features

### User Management
- Add/Edit user with role selection
- Real-time form validation
- Password strength indicator
- Role-based access control
- User activation/deactivation
- Delete user with confirmation

### Role Management
- Create/Edit roles with permission selection
- Group permissions by module
- Select/Deselect all permissions
- Module-level permission toggle
- Role level hierarchy
- System role protection

## Security Best Practices

1. **Passwords**: Always hashed with bcrypt (12 salt rounds)
2. **Sessions**: Stored in MongoDB with secure cookies
3. **Validation**: Both client-side and server-side
4. **Authorization**: Role and permission-based access control
5. **Error Handling**: Proper error messages without exposing sensitive data
6. **Input Sanitization**: All inputs are validated and sanitized

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in environment variables
- Verify MongoDB port (default: 27017)

### Seeding Issues
- Drop existing collections if re-seeding: `db.dropDatabase()`
- Check MongoDB connection before seeding
- Verify all models are properly defined

### Authentication Issues
- Clear browser cookies and sessions
- Check session store connection
- Verify user credentials
- Ensure user is active

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email verification
- [ ] Password reset via email
- [ ] Activity logging and audit trail
- [ ] API rate limiting
- [ ] JWT token support for API access
- [ ] Role templates
- [ ] Bulk user import
- [ ] Advanced permission inheritance
- [ ] IP-based access control

## Support

For issues or questions, please refer to the documentation or contact the development team.

## License

ISC
