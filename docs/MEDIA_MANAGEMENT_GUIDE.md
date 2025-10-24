# Media Management System - Documentation

## Overview
A complete WordPress-style media management system with database integration, allowing users to upload, manage, and organize media files.

## Features

### ✅ Upload Management
- **Drag & Drop Upload**: Drag files directly into the upload zone
- **Multi-file Upload**: Upload multiple files simultaneously (up to 10 files)
- **Progress Tracking**: Real-time upload progress with visual indicators
- **File Type Support**:
  - Images: JPEG, JPG, PNG, GIF, WebP, SVG
  - Videos: MP4, AVI, MOV
  - Documents: PDF, DOC, DOCX, XLS, XLSX
  - Audio: MP3, WAV
- **File Size Limit**: 10MB per file
- **Auto-save to Database**: All uploads are automatically saved to MongoDB

### ✅ Media Library
- **Grid & List Views**: Toggle between grid and list display modes
- **Search Functionality**: Search media by filename, title, or description
- **Filter Options**:
  - By Type: All, Images, Videos, PDF, Documents
  - By Date: Filter by upload month/year
- **Bulk Operations**:
  - Bulk select mode
  - Bulk delete with confirmation
- **Real-time Updates**: Library refreshes automatically after uploads

### ✅ Media Details & Editing
- **Preview Modal**: WordPress-style attachment details modal
- **Editable Metadata**:
  - Alternative Text (Alt)
  - Title
  - Caption
  - Description
- **File Information Display**:
  - Filename
  - File type (MIME type)
  - File size
  - Dimensions (for images)
  - Upload date
  - Uploaded by (user info)
- **Actions**:
  - Copy URL to clipboard
  - View file in new tab
  - Download file
  - Delete permanently

## File Structure

```
├── models/
│   └── Media.js                          # MongoDB schema for media
├── routes/
│   ├── api/
│   │   └── mediaApi.js                   # API endpoints for media operations
│   └── media.js                          # Page routes for media views
├── public/
│   ├── js/
│   │   ├── media-upload.js               # Upload functionality
│   │   └── media-library-dynamic.js      # Library with DB integration
│   ├── css/
│   │   └── custom.css                    # Media UI styles
│   └── uploads/
│       └── media/                        # Uploaded files directory
└── views/
    └── media/
        ├── addFile.ejs                   # Upload page
        └── mediaLibrary.ejs              # Media library page
```

## API Endpoints

### Upload Media
**POST** `/api/media/upload`
- Accepts: `multipart/form-data`
- Field name: `files` (array)
- Max files: 10
- Max size: 10MB per file
- Returns: Array of uploaded media objects

### Get Media List
**GET** `/api/media/list`
- Query params:
  - `type`: Filter by media type (image, video, pdf, doc, audio)
  - `search`: Search term
  - `date`: Filter by date (YYYY-MM format)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
- Returns: Paginated media list with metadata

### Get Single Media
**GET** `/api/media/:id`
- Returns: Single media object with full details

### Update Media Metadata
**PUT** `/api/media/:id`
- Body: `{ alt, title, caption, description }`
- Returns: Updated media object

### Delete Media
**DELETE** `/api/media/:id`
- Deletes file from filesystem and database
- Returns: Success message

### Bulk Delete
**POST** `/api/media/bulk-delete`
- Body: `{ ids: [array of media IDs] }`
- Deletes multiple files
- Returns: Success message with count

## Database Schema

```javascript
{
  filename: String,           // Unique filename on server
  originalName: String,       // Original uploaded filename
  path: String,              // Full file path
  url: String,               // Public URL
  mimeType: String,          // MIME type
  type: String,              // Categorized type (image, video, etc.)
  size: Number,              // File size in bytes
  dimensions: {              // For images
    width: Number,
    height: Number
  },
  alt: String,               // Alternative text
  title: String,             // Media title
  caption: String,           // Caption
  description: String,       // Description
  uploadedBy: ObjectId,      // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

### Accessing Media Management
1. **Upload Page**: Navigate to `/media/add-file`
2. **Media Library**: Navigate to `/media/library`

### Uploading Files
1. Go to "Add Media File" page
2. Either:
   - Drag and drop files into the upload zone
   - Click "Select Files" button to browse
3. Watch upload progress in real-time
4. Files are automatically saved to database
5. Click "Media Library" to view uploaded files

### Managing Media
1. Go to "Media Library"
2. Use filters to find specific media:
   - Toggle between Grid/List view
   - Filter by type or date
   - Search by name
3. Click any media to open details modal
4. Edit metadata (alt, title, caption, description)
5. Click "Save Changes" to update
6. Use bulk select for multiple operations

### Deleting Media
- **Single Delete**: Open media details → Click "Delete permanently"
- **Bulk Delete**: Enable "Bulk select" → Select items → Click "Delete permanently"

## Security Features
- Authentication required for all operations
- File type validation
- File size limits
- User tracking (uploadedBy field)
- Secure file storage outside public root

## Integration Notes

### Using Media in Other Pages
To fetch and use media in your application:

```javascript
// Fetch all images
fetch('/api/media/list?type=image')
  .then(res => res.json())
  .then(data => {
    const images = data.data;
    // Use images in your application
  });
```

### Embedding Media
Use the URL from the media object:
```html
<img src="<%= media.url %>" alt="<%= media.alt %>">
```

## Troubleshooting

### Uploads Failing
- Check file size (must be under 10MB)
- Verify file type is supported
- Ensure `public/uploads/media/` directory exists and is writable
- Check server logs for specific errors

### Media Not Displaying
- Verify `/uploads` route is configured in app.js
- Check file permissions on uploads directory
- Ensure MongoDB connection is active

### Search Not Working
- Text indexes are created automatically on model
- Ensure MongoDB version supports text search
- Check search query format

## Future Enhancements
- Image editing capabilities
- Automatic thumbnail generation
- Image optimization on upload
- Cloud storage integration (S3, Cloudinary)
- Advanced filtering options
- Media folders/categories
- Duplicate detection
- Batch upload via ZIP

## Support
For issues or questions, check the application logs or contact the development team.
