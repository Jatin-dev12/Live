const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads/seo');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload (SEO images)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'og-image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

// Configure multer for dynamic folder uploads (ads, media, etc.)
const dynamicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Default to general folder, will be moved later if needed
        const uploadPath = path.join(__dirname, '../../public/uploads/general');
        
        // console.log('Multer destination (temp):', uploadPath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            console.log('Creating directory:', uploadPath);
            try {
                fs.mkdirSync(uploadPath, { recursive: true });
                // console.log('Directory created successfully:', uploadPath);
            } catch (dirError) {
                // console.error('Failed to create directory:', dirError);
                return cb(new Error('Failed to create upload directory'));
            }
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        console.log('Multer filename called for:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const dynamicFileFilter = (req, file, cb) => {
    console.log('File filter called for:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    // Accept images only (no videos for ads)
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedMimes.includes(file.mimetype)) {
        console.log('File rejected - invalid mimetype:', file.mimetype);
        return cb(new Error('Only image files are allowed!'), false);
    }
    
    console.log('File accepted:', file.originalname);
    cb(null, true);
};

const dynamicUpload = multer({
    storage: dynamicStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: dynamicFileFilter
});

// Error handling function for multer
function handleMulterError(err, req, res) {
    console.error('Multer error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 10MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    if (err.message && err.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed'
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'Upload error: ' + err.message
    });
}

// Generic upload endpoint for ads, media, etc.
router.post('/upload', isAuthenticated, (req, res) => {
    // Use multer with error handling
    dynamicUpload.single('file')(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res);
        }
        
        try {
            console.log('Upload request received:', {
                user: req.user ? req.user._id : 'No user',
                body: req.body,
                file: req.file ? {
                    filename: req.file.filename,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                } : 'No file'
            });

            if (!req.file) {
                console.log('No file in request');
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }
            
            const folder = req.body.folder || 'general';
            // console.log('Requested folder:', folder);
            // console.log('File uploaded to temp location:', req.file.path);
            
            // Create target directory if it doesn't exist
            const targetDir = path.join(__dirname, '../../public/uploads', folder);
            if (!fs.existsSync(targetDir)) {
                console.log('Creating target directory:', targetDir);
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // Move file to correct folder
            const targetPath = path.join(targetDir, req.file.filename);
            const filePath = '/uploads/' + folder + '/' + req.file.filename;
            
            // console.log('Moving file from:', req.file.path);
            // console.log('Moving file to:', targetPath);
            
            try {
                // Move the file from general to the target folder
                if (req.file.path !== targetPath) {
                    fs.renameSync(req.file.path, targetPath);
                    console.log('File moved successfully to:', targetPath);
                }
                
                // Verify file exists at target location
                if (!fs.existsSync(targetPath)) {
                    console.error('File was not moved properly to:', targetPath);
                    return res.status(500).json({
                        success: false,
                        message: 'File upload failed - file not moved to target folder'
                    });
                }
            } catch (moveError) {
                console.error('Failed to move file:', moveError);
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed - could not move file to target folder'
                });
            }
            
            console.log('File uploaded successfully:', {
                filePath: filePath,
                fullPath: fullPath,
                size: req.file.size
            });
            
            res.json({
                success: true,
                message: 'File uploaded successfully',
                url: filePath,
                data: {
                    path: filePath,
                    filename: req.file.filename,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading file',
                error: error.message
            });
        }
    });
});

// Upload image endpoint (for SEO)
router.post('/upload/image', isAuthenticated, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Return the file path relative to public directory
        const filePath = '/uploads/seo/' + req.file.filename;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                path: filePath,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
});



// Test endpoint to check if upload directory is accessible
router.get('/test-upload/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../../public/uploads', folder, filename);
    
    console.log('Testing file access:', filePath);
    
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        res.json({
            success: true,
            message: 'File exists and is accessible',
            path: `/uploads/${folder}/${filename}`,
            size: stats.size,
            created: stats.birthtime
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'File not found',
            path: `/uploads/${folder}/${filename}`
        });
    }
});

// Simple test endpoint to check API connectivity
router.get('/test-connection', (req, res) => {
    const uploadsPath = path.join(__dirname, '../../public/uploads');
    const contentPath = path.join(uploadsPath, 'content');
    
    res.json({
        success: true,
        message: 'Upload API is working',
        timestamp: new Date().toISOString(),
        user: req.user ? 'Authenticated' : 'Not authenticated',
        paths: {
            uploads: uploadsPath,
            content: contentPath,
            uploadsExists: fs.existsSync(uploadsPath),
            contentExists: fs.existsSync(contentPath)
        }
    });
});

// Simplified upload endpoint without authentication for testing
router.post('/upload-simple', dynamicUpload.single('file'), (req, res) => {
    console.log('Simple upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    try {
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const folder = req.body.folder || 'general';
        const filePath = '/uploads/' + folder + '/' + req.file.filename;
        const fullPath = path.join(__dirname, '../../public', filePath);
        
        console.log('File details:', {
            filePath: filePath,
            fullPath: fullPath,
            size: req.file.size,
            exists: fs.existsSync(fullPath)
        });
        
        // Verify file was actually saved
        if (!fs.existsSync(fullPath)) {
            console.error('File was not saved to disk:', fullPath);
            return res.status(500).json({
                success: false,
                message: 'File upload failed - file not saved to disk'
            });
        }
        
        console.log('Simple upload successful:', {
            filePath: filePath,
            size: req.file.size
        });
        
        res.json({
            success: true,
            message: 'File uploaded successfully',
            url: filePath,
            data: {
                path: filePath,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Simple upload processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing upload',
            error: error.message
        });
    }
});

// Test upload without authentication (for debugging)
router.post('/test-upload-debug', (req, res) => {
    console.log('Debug upload request received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    dynamicUpload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Debug upload error:', err);
            return res.status(500).json({
                success: false,
                message: 'Debug upload failed',
                error: err.message
            });
        }
        
        console.log('Debug upload successful:', req.file);
        res.json({
            success: true,
            message: 'Debug upload successful',
            file: req.file ? {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : null
        });
    });
});

// Very basic upload endpoint for testing
router.post('/upload-basic', (req, res) => {
    console.log('Basic upload endpoint hit');
    
    // Create a simple multer instance
    const basicUpload = multer({
        dest: path.join(__dirname, '../../public/uploads/content'),
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB
        }
    });
    
    basicUpload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Basic upload error:', err);
            return res.status(500).json({
                success: false,
                message: 'Basic upload failed',
                error: err.message
            });
        }
        
        console.log('Basic upload file:', req.file);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        // Move file to proper location with proper extension
        const originalExt = path.extname(req.file.originalname);
        const newFilename = req.file.filename + originalExt;
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), newFilename);
        
        try {
            fs.renameSync(oldPath, newPath);
            
            const webPath = '/uploads/content/' + newFilename;
            
            res.json({
                success: true,
                message: 'File uploaded successfully',
                url: webPath,
                data: {
                    filename: newFilename,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (renameError) {
            console.error('File rename error:', renameError);
            res.status(500).json({
                success: false,
                message: 'File processing failed',
                error: renameError.message
            });
        }
    });
});

module.exports = router;
