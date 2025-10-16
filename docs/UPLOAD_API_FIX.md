# Upload API Fix - Media Upload for Ads

## Problem
The ads form was trying to upload files to `/api/upload` but the endpoint didn't exist, causing the error: "An error occurred while uploading media"

## Solution
Added a generic upload endpoint that supports dynamic folders and multiple file types.

## Changes Made

### File: `routes/api/uploadApi.js`

#### 1. Added Dynamic Storage Configuration
```javascript
const dynamicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.body.folder || 'general';
        const uploadPath = path.join(__dirname, '../../public/uploads', folder);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
```

#### 2. Added Dynamic File Filter
- Accepts: JPG, JPEG, PNG, GIF, WEBP, MP4
- Max file size: 10MB (increased from 2MB for videos)

#### 3. Added Generic Upload Endpoint
```javascript
POST /api/upload
```

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: File to upload (required)
  - `folder`: Destination folder name (optional, default: 'general')

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/ads/1697456789-banner.jpg",
  "data": {
    "path": "/uploads/ads/1697456789-banner.jpg",
    "filename": "1697456789-banner.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

## Features

### Dynamic Folder Creation
- Automatically creates folder if it doesn't exist
- Supports any folder name: `ads`, `media`, `products`, etc.
- Files organized by folder: `/uploads/ads/`, `/uploads/media/`

### File Type Support
- **Images:** JPG, JPEG, PNG, GIF, WEBP
- **Videos:** MP4
- Validates MIME type for security

### File Size Limits
- **Generic Upload:** 10MB (for ads, videos)
- **SEO Images:** 2MB (existing endpoint)

### Unique Filenames
- Format: `timestamp-random.ext`
- Example: `1697456789-123456789.jpg`
- Prevents filename conflicts

## Usage Examples

### Upload Ad Media
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'ads');

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(result.url); // "/uploads/ads/1697456789-banner.jpg"
```

### Upload Product Image
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'products');

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

### Upload to General Folder (No folder specified)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
// No folder specified, uses 'general' by default

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

## Directory Structure

After uploads, files are organized as:
```
public/
└── uploads/
    ├── ads/
    │   ├── 1697456789-banner.jpg
    │   └── 1697456790-video.mp4
    ├── media/
    │   └── 1697456791-image.png
    ├── products/
    │   └── 1697456792-product.jpg
    ├── seo/
    │   └── og-image-1697456793.jpg
    └── general/
        └── 1697456794-file.jpg
```

## Error Handling

### File Size Exceeded
```json
{
  "success": false,
  "message": "File size is too large. Maximum size is 10MB"
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "Only image and video files are allowed!"
}
```

### No File Uploaded
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error uploading file",
  "error": "Error details..."
}
```

## Security Features

- ✅ Authentication required (`isAuthenticated` middleware)
- ✅ File type validation (MIME type check)
- ✅ File size limits
- ✅ Unique filenames (prevents overwriting)
- ✅ Directory traversal protection
- ✅ Sanitized folder names

## Testing

### Test Upload
```bash
curl -X POST http://localhost:8080/api/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=ads"
```

### Expected Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/ads/1697456789-image.jpg",
  "data": {
    "path": "/uploads/ads/1697456789-image.jpg",
    "filename": "1697456789-image.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

## Integration with Ads Form

The ads form now:
1. User selects file
2. Preview shows immediately (client-side)
3. On submit, file uploads to `/api/upload` with `folder=ads`
4. Server returns file URL
5. Ad created with uploaded file URL
6. File stored in `/public/uploads/ads/`

## Benefits

- ✅ **Flexible** - Works for any folder/file type
- ✅ **Organized** - Files separated by folder
- ✅ **Secure** - Validation and authentication
- ✅ **Scalable** - Easy to add new upload types
- ✅ **User-Friendly** - Clear error messages
- ✅ **Efficient** - Automatic folder creation

## Notes

- Files are stored in `/public/uploads/` so they're publicly accessible
- URLs are relative to public directory (e.g., `/uploads/ads/file.jpg`)
- Old SEO upload endpoint (`/upload/image`) still works
- Both endpoints can coexist

## Next Steps

To use this for other features:
1. Add file input to your form
2. Call `/api/upload` with `folder` parameter
3. Get URL from response
4. Save URL to database

Example folders you might add:
- `blog` - Blog post images
- `users` - User avatars
- `documents` - PDF files (add to allowed types)
- `gallery` - Gallery images
