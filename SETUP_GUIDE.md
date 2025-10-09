# Quick Setup Guide - RBAC System

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- express-session
- express-validator
- bcryptjs
- connect-mongo
- mongoose

### 2. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
mongod
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Configure Environment Variables (Optional)
Copy the example environment file:
```bash
copy .env.example .env
```

Edit `.env` and update values if needed (default values work for local development).

### 4. Seed the Database
Run the seeder to create default roles, permissions, and users:
```bash
npm run seed
```

**Expected Output:**
```
✅ MongoDB connected
🌱 Seeding permissions...
✅ Created 53 permissions
🌱 Seeding roles...
✅ Created 6 roles: Super Admin, Admin, Manager, User, Sales, Content Manager
🌱 Seeding default users...
✅ Created 4 default users

📧 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Super Admin: superadmin@example.com / Admin@123
Admin:       admin@example.com / Admin@123
Manager:     manager@example.com / Manager@123
User:        user@example.com / User@123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Database seeding completed successfully!
```

### 5. Start the Application
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:8080
```

### 7. Login
Use one of the default credentials:
- **Super Admin**: superadmin@example.com / Admin@123
- **Admin**: admin@example.com / Admin@123
- **Manager**: manager@example.com / Manager@123
- **User**: user@example.com / User@123

## Testing the RBAC System

### Create a New Role
1. Login as Super Admin
2. Navigate to `/roles/add-roles`
3. Fill in the form:
   - **Role Name**: e.g., "Marketing Manager"
   - **Level**: Select appropriate level (3-5 for custom roles)
   - **Description**: Describe the role
   - **Permissions**: Select permissions by module
4. Click "Create Role"

### Create a New User
1. Login as Super Admin or Admin
2. Navigate to `/users/add-user`
3. Fill in the form:
   - **Full Name**: User's full name
   - **Email**: Valid email address
   - **Password**: Must meet requirements (8+ chars, uppercase, lowercase, number, special char)
   - **Confirm Password**: Must match password
   - **Role**: Select from available roles
   - **Department**: Optional
   - **Designation**: Optional
4. Click "Save User"

### View Users and Roles
- **Users List**: `/users/users-list`
- **Roles Management**: `/roles/roles-management`

## API Testing with Postman/cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "Admin@123"
  }'
```

### Get All Users (requires authentication)
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Create a Role (requires Super Admin)
```bash
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Content Editor",
    "description": "Can manage blog and CMS content",
    "permissions": ["PERMISSION_ID_1", "PERMISSION_ID_2"],
    "level": 4
  }'
```

## Troubleshooting

### MongoDB Connection Error
**Error**: `MongoDB connection failed`

**Solution**:
1. Ensure MongoDB is running
2. Check if port 27017 is available
3. Verify MONGODB_URI in .env file

### Seeding Fails
**Error**: `Duplicate key error`

**Solution**:
1. Drop the database: `mongo crm_system --eval "db.dropDatabase()"`
2. Run seed again: `npm run seed`

### Cannot Login
**Error**: `Invalid email or password`

**Solution**:
1. Verify you're using correct credentials from seed output
2. Check if user exists in database
3. Ensure password meets requirements

### Session Not Persisting
**Error**: Session expires immediately

**Solution**:
1. Check MongoDB connection for session store
2. Clear browser cookies
3. Verify SESSION_SECRET in .env

### Permission Denied
**Error**: `You do not have permission to access this resource`

**Solution**:
1. Check user's role and permissions
2. Verify middleware is correctly applied
3. Login with appropriate role (Super Admin for role management)

## Default Roles and Permissions

### Super Admin (Level 1)
- **All permissions** across all modules
- Can create/edit/delete roles
- Can manage all users
- Cannot be deleted

### Admin (Level 2)
- Most permissions except role deletion
- Can manage users
- Cannot access settings module

### Manager (Level 3)
- Read and update permissions
- Limited user management
- Dashboard access

### User (Level 4)
- Read-only access
- Dashboard, blog, leads, reports modules

### Sales (Level 4)
- Leads and invoice management
- Create, read, update permissions
- Dashboard access

### Content Manager (Level 4)
- Blog, CMS, media, SEO management
- Full CRUD permissions for content modules

## Next Steps

1. **Customize Roles**: Create roles specific to your organization
2. **Add Users**: Create user accounts for your team
3. **Configure Permissions**: Adjust permissions based on your needs
4. **Secure Production**: Update SESSION_SECRET and use HTTPS
5. **Enable Email**: Configure SMTP for email verification and password reset

## Support

For detailed documentation, see `README_RBAC.md`

For issues or questions, contact your development team.
