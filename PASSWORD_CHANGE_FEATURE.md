# Password Change Feature - Edit User

## ✅ Feature Added

Added the ability to change user passwords when editing a user account.

## Changes Made

### 1. Frontend - Edit User Form (`views/users/editUser.ejs`)

#### Added Password Change Toggle
```html
<div class="form-check form-switch mb-3">
    <input class="form-check-input" type="checkbox" id="changePasswordToggle" onchange="togglePasswordFields()">
    <label class="form-check-label fw-semibold text-primary-light" for="changePasswordToggle">
        Change Password
    </label>
</div>
```

#### Added Password Fields (Hidden by Default)
- **New Password** field with show/hide toggle
- **Confirm Password** field with show/hide toggle
- Minimum 6 characters validation
- Password matching validation

#### JavaScript Functions Added
1. **`togglePasswordFields()`** - Shows/hides password fields based on toggle
2. **`togglePasswordVisibility()`** - Shows/hides password text (eye icon)
3. **Password validation** in `updateUser()` function

### 2. Backend - User API (`routes/api/userApi.js`)

#### Updated PUT `/api/users/:id` Endpoint
```javascript
// Extract password from request body
const { ..., password } = req.body;

// Update password if provided
if (password && password.trim().length > 0) {
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }
    user.password = password; // Will be hashed by pre-save hook
}
```

## How It Works

### User Flow

1. **Navigate to Edit User**
   - Go to Users Management
   - Click "Edit" on any user

2. **Enable Password Change**
   - Toggle "Change Password" switch
   - Password fields appear

3. **Enter New Password**
   - Enter new password (min 6 characters)
   - Confirm password
   - Click eye icon to show/hide password

4. **Save Changes**
   - Click "Update User"
   - Password is validated
   - If valid, password is hashed and saved to database

### Validation Rules

#### Frontend Validation
- ✅ Password minimum 6 characters
- ✅ Passwords must match
- ✅ Required only when toggle is enabled

#### Backend Validation
- ✅ Password minimum 6 characters
- ✅ Password is hashed before saving (bcrypt pre-save hook)
- ✅ Optional field (only updates if provided)

## Features

### Toggle Switch
- **OFF (Default)**: Password fields hidden, password not changed
- **ON**: Password fields visible, password required

### Password Visibility Toggle
- Click eye icon to show/hide password
- Works for both New Password and Confirm Password fields
- Icon changes: `ri-eye-line` ↔ `ri-eye-off-line`

### Security
- ✅ Password hashed using bcrypt (via User model pre-save hook)
- ✅ Password never sent in response (excluded in API)
- ✅ Minimum length enforced (6 characters)
- ✅ Confirmation required to prevent typos

## UI Elements

### Password Change Section
```
┌─────────────────────────────────────┐
│ ☑ Change Password                   │
│                                     │
│ New Password         Confirm Pass   │
│ [••••••••••] 👁️     [••••••••••] 👁️ │
│ Minimum 6 characters                │
└─────────────────────────────────────┘
```

### States
1. **Toggle OFF**: Fields hidden
2. **Toggle ON**: Fields visible and required
3. **Password Visible**: Text shown instead of dots
4. **Password Hidden**: Dots shown (default)

## Testing

### Test Password Change
1. Go to Edit User page
2. Enable "Change Password" toggle
3. Enter new password: `newpass123`
4. Confirm password: `newpass123`
5. Click "Update User"
6. **Expected**: Success message, password updated in DB

### Test Validation
1. Enable password change
2. Enter password less than 6 characters
3. **Expected**: Error "Password must be at least 6 characters long"

### Test Password Mismatch
1. Enable password change
2. New Password: `password123`
3. Confirm Password: `password456`
4. **Expected**: Error "Passwords do not match"

### Test Optional Password
1. Edit user WITHOUT enabling password toggle
2. Update other fields (name, email, etc.)
3. **Expected**: User updated, password unchanged

## Database

### Password Storage
- Stored in `users` collection
- Field: `password` (String, hashed)
- Hashing: bcrypt with salt rounds (configured in User model)
- Never returned in API responses

### Pre-Save Hook (User Model)
```javascript
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
```

## API Endpoint

### PUT `/api/users/:id`

**Request Body** (optional password):
```json
{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "role_id",
    "isActive": true,
    "customPermissions": ["dashboard", "users"],
    "password": "newpassword123"  // Optional
}
```

**Response** (success):
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        // password field excluded
    }
}
```

## Files Modified

| File | Changes |
|------|---------|
| `views/users/editUser.ejs` | Added password toggle, fields, validation, JS functions |
| `routes/api/userApi.js` | Added password handling in PUT endpoint |

## Benefits

✅ **Secure**: Password hashed before storage  
✅ **Optional**: Only updates when explicitly requested  
✅ **User-friendly**: Toggle to enable, eye icon to show/hide  
✅ **Validated**: Frontend and backend validation  
✅ **Flexible**: Can update user without changing password  

## Notes

- Password change is **optional** - toggle must be enabled
- Old password is **not required** (admin can reset any user's password)
- Password is **hashed automatically** by the User model
- Minimum password length: **6 characters**
- Password fields are **cleared** when toggle is disabled

---

**Feature is ready to use!** Restart the server and test the password change functionality. 🎉
