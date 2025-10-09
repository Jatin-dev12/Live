# 🔐 Login Credentials (After Seeding)

## ⚠️ IMPORTANT: First Run This Command

```bash
npm run seed
```

This creates the database with default users, roles, and permissions.

## 📧 Default Login Credentials

After running `npm run seed`, use these credentials to login:

### Super Admin Account
- **Email**: `superadmin@example.com`
- **Password**: `Admin@123`
- **Access**: Full system access, can create/edit/delete roles

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Access**: Most permissions except role deletion

### Manager Account
- **Email**: `manager@example.com`
- **Password**: `Manager@123`
- **Access**: Read and update permissions

### User Account
- **Email**: `user@example.com`
- **Password**: `User@123`
- **Access**: Read-only access

## 🌐 Login URL

Access the login page at:
- `http://localhost:8080/authentication/signin`
- `http://localhost:8080/authentication/sign-in`

## ✅ How to Test Login

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Go to login page**:
   ```
   http://localhost:8080/authentication/signin
   ```

3. **Enter credentials**:
   - Email: `superadmin@example.com`
   - Password: `Admin@123`

4. **Click "Sign In"**

5. **You should be redirected to**: `/index` (Dashboard)

## 🔧 Troubleshooting

### If login doesn't work:

1. **Check if database is seeded**:
   ```bash
   npm run seed
   ```
   Look for output: "✅ Created 4 default users"

2. **Check MongoDB connection**:
   - Make sure MongoDB Atlas is accessible
   - Verify connection string in `.env` file

3. **Check browser console**:
   - Press F12 to open developer tools
   - Look for any error messages in Console tab
   - Check Network tab for API call to `/api/auth/login`

4. **Check server logs**:
   - Look at terminal where `npm start` is running
   - Should see: "✅ MongoDB connected successfully"

### Common Issues:

**Issue**: "Invalid email or password"
- **Solution**: Make sure you ran `npm run seed` first
- **Solution**: Check that you're using the exact credentials above

**Issue**: "MongoDB connection failed"
- **Solution**: Check internet connection
- **Solution**: Verify MongoDB Atlas credentials
- **Solution**: Check `.env` file has correct MONGODB_URI

**Issue**: "Cannot find module 'express-session'"
- **Solution**: Run `npm install` first

**Issue**: Login button doesn't respond
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Make sure you're on the correct login page

## 🎯 What Happens After Login

After successful login:
1. Session is created in MongoDB
2. User data is stored in session
3. Redirected to dashboard (`/index`)
4. User can access pages based on their role permissions

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- Sessions are stored in MongoDB
- Session expires after 7 days of inactivity
- **Change default passwords in production!**

## 📝 Creating New Users

After logging in as Super Admin:
1. Go to: `http://localhost:8080/users/add-user`
2. Fill in user details
3. Select a role
4. Optionally check additional permissions
5. Click "Save User"

## 🚪 Logout

To logout, call the logout API:
```javascript
fetch('/api/auth/logout', { method: 'POST' })
  .then(() => window.location.href = '/authentication/signin');
```

Or add a logout button in your layout.
