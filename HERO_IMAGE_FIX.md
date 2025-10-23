# Hero Image Upload Fix

## Problem
Hero images were not being saved properly. The images were stored as blob URLs (temporary browser URLs) instead of being uploaded to the server and stored in the database.

## Solution
Modified the image upload functionality to:

1. **Upload images to server**: When a hero image is selected, it's immediately uploaded to `/api/upload` endpoint
2. **Store server path**: The returned server path (e.g., `/uploads/hero/123456789.jpg`) is stored in the database
3. **Display from server**: Images are displayed from the server path, not blob URLs

## Changes Made

### 1. Created Hero Uploads Directory
- Created `public/uploads/hero/` directory for storing hero images

### 2. Updated Add Content Management (`views/cms/addContentManagement.ejs`)
- Modified hero image upload handler to upload file to server using FormData
- Store server path in `data-serverPath` attribute
- Use server path when saving content instead of blob URL

### 3. Updated Edit Content Management (`views/cms/editContentManagement.ejs`)
- Same upload functionality as add page
- Preserve existing images when not uploading new ones
- Handle both new uploads and existing image paths

## How It Works

### Upload Flow:
1. User selects an image file
2. Image preview is shown immediately (using blob URL for instant feedback)
3. File is uploaded to server via AJAX to `/api/upload`
4. Server returns the permanent file path (e.g., `/uploads/hero/1234567890-123456789.jpg`)
5. Path is stored in the input's data attribute
6. When form is submitted, the server path is saved to database

### Database Storage:
```javascript
heroSection: {
  heading: "Welcome to Our Site",
  paragraph: "Description text...",
  ctas: [...],
  rightImage: "/uploads/hero/1234567890-123456789.jpg"  // Server path, not blob URL
}
```

## Testing
1. Go to Content Management → Add Content
2. Add a Hero Section
3. Upload a hero image - you should see the preview immediately
4. Submit the form
5. Edit the content - the uploaded image should display correctly
6. You can remove the image by clicking the X button
7. Upload a new image to replace it
8. Check the database - `heroSection.rightImage` should contain `/uploads/hero/...` path

## UI Behavior
- When no image is uploaded: Shows "Upload Hero Image" placeholder
- When image is uploaded: Shows the image preview with a remove (X) button
- Clicking X: Removes the image and shows the upload placeholder again
- On edit page: Existing images are displayed automatically

## File Upload Limits
- Maximum file size: 10MB
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Files are stored in: `public/uploads/hero/`
