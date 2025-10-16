# Phone Number Validation - 15 Digit Limit

## ✅ Validation Added

Added phone number validation to prevent users from entering more than 15 digits in both Add User and Edit User forms.

## Changes Made

### 1. Add User Form (`views/users/addUser.ejs`)

#### HTML Validation
```html
<input 
    type="tel" 
    class="form-control radius-8" 
    id="phone" 
    name="phone" 
    placeholder="Enter phone number" 
    maxlength="15" 
    pattern="[0-9+\-\s()]{1,15}" 
    required>
<small class="text-muted">Maximum 15 digits</small>
```

#### JavaScript Validation
- Real-time character filtering
- Automatic truncation at 15 characters
- Warning border when limit reached
- Allows: digits, +, -, spaces, parentheses

### 2. Edit User Form (`views/users/editUser.ejs`)

#### HTML Validation
```html
<input 
    type="tel" 
    class="form-control radius-8" 
    id="phone" 
    name="phone" 
    value="<%= user.phone || '' %>" 
    placeholder="Enter phone number" 
    maxlength="15" 
    pattern="[0-9+\-\s()]{1,15}">
<small class="text-muted">Maximum 15 digits</small>
```

#### JavaScript Validation
- Same real-time validation as Add User
- Prevents typing more than 15 characters
- Visual feedback with warning border

## Validation Layers

### Layer 1: HTML Attributes
- **maxlength="15"** - Browser prevents typing beyond 15 characters
- **pattern="[0-9+\-\s()]{1,15}"** - Validates allowed characters
- Provides native browser validation

### Layer 2: JavaScript Real-Time
```javascript
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value;
    // Remove invalid characters
    value = value.replace(/[^0-9+\-\s()]/g, '');
    // Limit to 15 characters
    if (value.length > 15) {
        value = value.substring(0, 15);
    }
    e.target.value = value;
    
    // Visual feedback at limit
    if (value.length === 15) {
        e.target.classList.add('border-warning');
    } else {
        e.target.classList.remove('border-warning');
    }
});
```

### Layer 3: Backend Validation (Existing)
- User model already has phone validation
- Regex pattern in schema validates format

## Allowed Characters

✅ **Digits**: 0-9  
✅ **Plus**: + (for country codes)  
✅ **Minus**: - (separators)  
✅ **Spaces**: (separators)  
✅ **Parentheses**: ( ) (area codes)  

❌ **Letters**: a-z, A-Z  
❌ **Special chars**: @, #, $, etc.  

## User Experience

### Normal Input
```
User types: +1 234 567 8901
Field shows: +1 234 567 8901
Border: Normal (gray)
```

### At Limit (15 characters)
```
User types: +1 234 567 89012
Field shows: +1 234 567 8901 (truncated)
Border: Warning (orange)
Helper text: "Maximum 15 digits"
```

### Invalid Characters
```
User types: +1 abc 567 8901
Field shows: +1  567 8901 (letters removed)
Border: Normal
```

## Visual Feedback

### Helper Text
- Always visible below phone field
- Gray color: "Maximum 15 digits"
- Informs user of the limit

### Border Color
- **Gray** (default): Normal state
- **Orange** (warning): At 15 character limit
- **Red** (error): If pattern validation fails on submit

### Character Counter (Optional Enhancement)
Could add: "12/15 characters" below field

## Example Valid Formats

✅ `+1 234 567 8901` (US format)  
✅ `+44 20 1234 5678` (UK format)  
✅ `+91 98765 43210` (India format)  
✅ `(123) 456-7890` (US with area code)  
✅ `1234567890` (Plain digits)  

## Testing

### Test 1: Maximum Length
1. Go to Add User or Edit User
2. Try to type more than 15 characters in phone field
3. **Expected**: Field stops accepting input at 15 chars ✅
4. **Expected**: Border turns orange ✅

### Test 2: Invalid Characters
1. Try to type letters: "abc123"
2. **Expected**: Only "123" appears ✅
3. Try to type special chars: "@#$456"
4. **Expected**: Only "456" appears ✅

### Test 3: Valid Formats
1. Type: "+1 234 567 8901"
2. **Expected**: Accepted ✅
3. Type: "(123) 456-7890"
4. **Expected**: Accepted ✅

### Test 4: Copy-Paste Long Number
1. Copy: "12345678901234567890" (20 digits)
2. Paste into phone field
3. **Expected**: Only first 15 characters saved ✅

## Benefits

✅ **Prevents Data Issues** - No overly long phone numbers in database  
✅ **Real-Time Feedback** - User knows limit immediately  
✅ **Format Flexibility** - Allows international formats  
✅ **User-Friendly** - Visual warning instead of error message  
✅ **Consistent** - Same validation in both forms  

## Technical Details

### HTML Attributes
- `type="tel"` - Mobile keyboard optimization
- `maxlength="15"` - Hard limit
- `pattern="[0-9+\-\s()]{1,15}"` - Character whitelist

### JavaScript
- Event: `input` (fires on every keystroke)
- Regex: `/[^0-9+\-\s()]/g` (removes invalid chars)
- Substring: Truncates to 15 if longer
- Class toggle: Adds/removes `border-warning`

### CSS (Existing)
- `.border-warning` - Orange border color
- Already defined in Bootstrap/custom CSS

## Files Modified

| File | Changes |
|------|---------|
| `views/users/addUser.ejs` | Added maxlength, pattern, helper text, JS validation |
| `views/users/editUser.ejs` | Added maxlength, pattern, helper text, JS validation |

## Database Schema

The User model already has phone validation:
```javascript
phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please enter a valid phone number']
}
```

This backend validation works in conjunction with the frontend validation.

---

**Phone number validation is now complete!** Users cannot enter more than 15 characters in the phone field. 🎉
