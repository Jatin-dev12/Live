const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../../models/Media');
const { isAuthenticated } = require('../../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/media');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file extensions
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|mp4|avi|mov|pdf|doc|docx|xls|xlsx|mp3|wav)$/i;
    const extname = allowedExtensions.test(file.originalname);
    
    // Allowed MIME types
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/avi', 'video/quicktime'
    ];
    
    const mimetypeAllowed = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    
    if (extname && mimetypeAllowed) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, documents, and audio files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Helper function to determine file type
function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'other';
}

// Upload single or multiple files
router.post('/upload', isAuthenticated, (req, res) => {
    upload.array('files', 10)(req, res, async (err) => {
        // Handle multer errors
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading files'
            });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            const uploadedMedia = [];

            for (const file of req.files) {
                const mediaData = {
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    url: `/uploads/media/${file.filename}`,
                    mimeType: file.mimetype,
                    type: getFileType(file.mimetype),
                    size: file.size,
                    uploadedBy: req.session.userId || req.user._id,
                    title: path.basename(file.originalname, path.extname(file.originalname))
                };

                // If it's an image, we could add dimensions here using a library like sharp
                // For now, we'll leave it empty and can be updated later

                const media = new Media(mediaData);
                await media.save();
                uploadedMedia.push(media);
            }

            res.json({
                success: true,
                message: `${uploadedMedia.length} file(s) uploaded successfully`,
                data: uploadedMedia
            });
        } catch (error) {
            console.error('Database save error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error saving files to database'
            });
        }
    });
});

// Get all media with filters
router.get('/list', isAuthenticated, async (req, res) => {
    try {
        const { type, search, date, page = 1, limit = 50 } = req.query;
        
        const query = {};
        
        // Filter by type
        if (type && type !== 'all') {
            query.type = type;
        }
        
        // Search in filename, title, description
        if (search) {
            query.$or = [
                { originalName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by date (format: YYYY-MM)
        if (date && date !== 'all') {
            const [year, month] = date.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        
        const skip = (page - 1) * limit;
        
        const media = await Media.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Media.countDocuments(query);
        
        res.json({
            success: true,
            data: media,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching media'
        });
    }
});

// Get single media by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('uploadedBy', 'name email');
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        res.json({
            success: true,
            data: media
        });
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching media'
        });
    }
});

// Update media metadata
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { alt, title, caption, description } = req.body;
        
        const media = await Media.findById(req.params.id);
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        // Update fields
        if (alt !== undefined) media.alt = alt;
        if (title !== undefined) media.title = title;
        if (caption !== undefined) media.caption = caption;
        if (description !== undefined) media.description = description;
        
        await media.save();
        
        res.json({
            success: true,
            message: 'Media updated successfully',
            data: media
        });
    } catch (error) {
        console.error('Update media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating media'
        });
    }
});

// Delete single media
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../public', media.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await Media.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting media'
        });
    }
});

// Bulk delete media
router.post('/bulk-delete', isAuthenticated, async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No media IDs provided'
            });
        }
        
        const mediaItems = await Media.find({ _id: { $in: ids } });
        
        // Delete files from filesystem
        for (const media of mediaItems) {
            const filePath = path.join(__dirname, '../../public', media.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Delete from database
        await Media.deleteMany({ _id: { $in: ids } });
        
        res.json({
            success: true,
            message: `${mediaItems.length} media item(s) deleted successfully`
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting media'
        });
    }
});

module.exports = router;
