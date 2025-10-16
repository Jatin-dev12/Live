# Media Management - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Restart Your Server
```bash
npm start
```

### Step 2: Access Media Management
Open your browser and navigate to:
- **Upload Files**: http://localhost:3000/media/add-file
- **View Library**: http://localhost:3000/media/library

### Step 3: Upload Your First File
1. Go to "Add Media File" page
2. Drag an image into the upload zone (or click "Select Files")
3. Watch the upload progress
4. Click "Media Library" to see your uploaded file

## 📸 What You Can Do

### Upload Files
- **Supported Types**: Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, AVI, MOV), Documents (PDF, DOC, DOCX), Audio (MP3, WAV)
- **Max Size**: 10MB per file
- **Multiple Upload**: Upload up to 10 files at once
- **Drag & Drop**: Just drag files into the upload zone

### Manage Media
- **View Modes**: Switch between Grid and List view
- **Search**: Find files by name
- **Filter**: By type (images, videos, etc.) or upload date
- **Edit Details**: Click any file to edit title, alt text, caption, description
- **Copy URL**: Get the file URL with one click
- **Download**: Download files directly
- **Delete**: Remove single files or bulk delete multiple files

### Bulk Operations
1. Click "Bulk select" button
2. Check the files you want to manage
3. Click "Delete permanently" to remove selected files

## 🎯 Key Features

✅ **WordPress-Style Interface** - Familiar and easy to use  
✅ **Real-time Upload** - See progress as files upload  
✅ **Database Storage** - All files tracked in MongoDB  
✅ **Metadata Support** - Add alt text, titles, captions  
✅ **Search & Filter** - Find files quickly  
✅ **Responsive Design** - Works on all devices  

## 📁 Where Files Are Stored

- **Database**: MongoDB (Media collection)
- **Files**: `public/uploads/media/` directory
- **Access URL**: `/uploads/media/{filename}`

## 🔒 Security

- Authentication required for all operations
- File type validation
- Size limits enforced
- User tracking (who uploaded what)

## 💡 Tips

1. **Organize with Metadata**: Add descriptive titles and alt text to make files easier to find
2. **Use Search**: Type in the search box to filter files instantly
3. **Bulk Delete**: Use bulk select to clean up multiple files at once
4. **Copy URLs**: Use the "Copy URL" button to quickly get file links for use elsewhere

## 🐛 Troubleshooting

**Upload not working?**
- Check file size (must be under 10MB)
- Verify file type is supported
- Make sure you're logged in

**Files not showing?**
- Refresh the page
- Check your internet connection
- Verify uploads directory exists

**Can't delete files?**
- Make sure you have proper permissions
- Check if file is being used elsewhere

## 📚 Need More Help?

See `MEDIA_MANAGEMENT_GUIDE.md` for detailed documentation.

---

**Ready to go!** Start uploading and managing your media files now! 🎉
