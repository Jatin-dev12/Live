# Page Master System - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Error creating page: Unknown error"

**Possible Causes:**
- Database connection issue
- User authentication not working properly
- Model validation error
- Missing required fields

**Solutions:**

✅ **Check MongoDB Connection**
```bash
# Check if MongoDB is running
# Look for this in console when starting the app:
MongoDB connected successfully
```

✅ **Check Browser Console**
- Open browser DevTools (F12)
- Go to Console tab
- Look for detailed error messages
- Check Network tab for API response

✅ **Verify You're Logged In**
- Make sure you're authenticated
- Try logging out and back in
- Check session is active

✅ **Check Server Logs**
- Look at your terminal/console where the server is running
- Error details will be printed there
- Look for stack traces

✅ **Restart the Server**
```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

---

### 2. Page Created But Not Accessible

**Symptoms:**
- Page appears in Page Master list
- Visiting the URL shows 404 or redirects

**Solutions:**

✅ **Check Page Status**
- Go to Page Master
- Verify page status is "Active"
- Inactive pages are not accessible

✅ **Verify Path**
- Check the path is correct (e.g., `/about-us`)
- Path should start with `/`
- No spaces or special characters

✅ **Restart Server**
- Dynamic routes may need server restart
- Stop and start the server

---

### 3. Content Not Showing on Page

**Symptoms:**
- Page loads but no content displays
- "No content available" message shown

**Solutions:**

✅ **Check Content Status**
- Go to Content Management
- Verify content status is "Active"
- Only active content is displayed

✅ **Verify Page Link**
- Make sure content is linked to correct page
- Check page dropdown selection

✅ **Check Content Exists**
- Ensure you've actually added content
- Content must have at least a title

---

### 4. Cannot Add Content - Page Dropdown Empty

**Symptoms:**
- "Add Content" form shows empty page dropdown
- No pages to select

**Solutions:**

✅ **Create Pages First**
- You must create pages before adding content
- Go to Page Master and create at least one page

✅ **Check Page Status**
- Only "Active" pages appear in dropdown
- Set page status to Active

✅ **Refresh the Page**
- Sometimes browser cache causes issues
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

### 5. Duplicate Page Error

**Symptoms:**
- "Page with this name or path already exists"

**Solutions:**

✅ **Use Unique Names**
- Each page must have unique name
- Each page must have unique path

✅ **Check Existing Pages**
- Go to Page Master list
- See what pages already exist
- Choose different name/path

✅ **Delete Old Page**
- If you want to reuse the name
- Delete the existing page first
- Then create new one

---

### 6. Rich Text Editor Not Working

**Symptoms:**
- Editor toolbar not showing
- Cannot format text
- Editor appears broken

**Solutions:**

✅ **Check JavaScript Loaded**
- Open browser console (F12)
- Look for JavaScript errors
- Quill.js must be loaded

✅ **Clear Browser Cache**
- Hard refresh the page
- Clear cache and reload

✅ **Check Internet Connection**
- Editor libraries may load from CDN
- Ensure stable internet connection

---

### 7. Images Not Uploading

**Symptoms:**
- Image upload button not working
- Images not saving

**Solutions:**

✅ **File Size**
- Check image file size
- Keep images under 5MB

✅ **File Type**
- Use supported formats: JPG, PNG, GIF
- Avoid exotic formats

✅ **Upload Directory**
- Ensure upload directory exists
- Check write permissions

---

### 8. Session/Authentication Issues

**Symptoms:**
- Redirected to login repeatedly
- "Authentication required" errors

**Solutions:**

✅ **Clear Session**
- Log out completely
- Clear browser cookies
- Log back in

✅ **Check Session Store**
- MongoDB session store must be working
- Check MongoDB connection

✅ **Environment Variables**
- Verify SESSION_SECRET is set
- Check .env file exists

---

### 9. API Endpoints Not Working

**Symptoms:**
- 404 errors on API calls
- API routes not found

**Solutions:**

✅ **Check app.js**
- Verify API routes are registered:
```javascript
app.use('/api/pages', pageApi);
app.use('/api/content', contentApi);
```

✅ **Restart Server**
- Changes to routes require restart
- Stop and start the server

✅ **Check Route Order**
- API routes should be before dynamic routes
- Check routes.js order

---

### 10. Database Validation Errors

**Symptoms:**
- "Validation failed" errors
- Required field errors

**Solutions:**

✅ **Check Required Fields**
- Page: name, path are required
- Content: page, title are required

✅ **Check Field Types**
- Ensure correct data types
- Strings for text, ObjectId for references

✅ **Check Model Schema**
- Review models/Page.js
- Review models/Content.js

---

## Debugging Steps

### Step 1: Check Server Console
```bash
# Look for errors in terminal where server is running
# Common errors:
- MongoDB connection failed
- Port already in use
- Module not found
```

### Step 2: Check Browser Console
```javascript
// Open DevTools (F12) > Console
// Look for:
- JavaScript errors
- Failed API calls
- Network errors
```

### Step 3: Check Network Tab
```
// DevTools > Network
// Filter by XHR
// Check API responses:
- Status codes (200, 400, 500)
- Response data
- Request payload
```

### Step 4: Test API Directly
```bash
# Use curl or Postman to test API
curl -X GET http://localhost:8080/api/pages

# Should return list of pages
```

---

## Getting More Help

### Enable Debug Mode

Add to your `.env` file:
```
NODE_ENV=development
DEBUG=true
```

This will show:
- Detailed error messages
- Stack traces
- Database queries

### Check Logs

Server logs show:
- All API requests
- Database operations
- Error details
- Stack traces

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Unknown error" | Generic server error | Check server logs |
| "Authentication required" | Not logged in | Log in again |
| "Page not found" | Invalid page ID | Check page exists |
| "Validation failed" | Missing required field | Fill all required fields |
| "Duplicate key error" | Name/path already exists | Use unique values |

---

## Prevention Tips

✅ **Always check status**
- Set pages to Active to make them accessible
- Set content to Active to display it

✅ **Use unique names**
- Each page needs unique name and path
- Avoid duplicates

✅ **Test incrementally**
- Create one page, test it
- Add one content, test it
- Don't create everything at once

✅ **Keep backups**
- Export your database regularly
- Keep backup of important content

✅ **Monitor server logs**
- Watch terminal for errors
- Fix issues as they appear

---

## Still Having Issues?

1. **Check all files are saved**
2. **Restart the server**
3. **Clear browser cache**
4. **Check MongoDB is running**
5. **Verify you're logged in**
6. **Review the error logs**

If the issue persists:
- Check `PAGE_MASTER_GUIDE.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Check server console for specific error messages
