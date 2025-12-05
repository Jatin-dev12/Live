const express = require('express');
const router = express.Router();
const UrlRedirect = require('../../models/UrlRedirect');
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');

// Get all redirects
router.get('/', async (req, res) => {
    try {
        const redirects = await UrlRedirect.find({ isActive: true }).sort({ createdAt: -1 });

        const formatted = redirects.map(r => ({
            from: r.oldUrl,
            to: r.newUrl
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching redirects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching redirects'
        });
    }
});

// URL Redirect Management Page
router.get('/url-redirects', isAuthenticated, async (req, res) => {
    try {
        const UrlRedirect = require('../models/UrlRedirect');
        const redirects = await UrlRedirect.find()
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.render('url-redirect/urlRedirects', {
            title: "URL Redirect Management",
            subTitle: "Manage URL Redirects",
            redirects: redirects
        });
    } catch (error) {
        console.error('Error loading URL redirects:', error);
        res.render('url-redirect/urlRedirects', {
            title: "URL Redirect Management",
            subTitle: "Manage URL Redirects",
            redirects: []
        });
    }
});


// Helper function to validate that URL exists in database
async function validateUrlExistsInDatabase(url, fieldName) {
    if (!url || typeof url !== 'string') {
        return `${fieldName} is required`;
    }
    
    const trimmed = url.trim();
    
    if (!trimmed) {
        return `${fieldName} cannot be empty`;
    }
    
    // Remove leading slash for slug comparison
    const slug = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
    
    // Check if page exists in database
    const pageExists = await Page.findOne({ slug: slug });
    
    if (!pageExists) {
        return `${fieldName} must be a valid page . Selected URL does not exist.`;
    }
    
    return null; // Valid
}

// Helper function to validate URL format (kept for backward compatibility)
function validateUrl(url, fieldName) {
    if (!url || typeof url !== 'string') {
        return `${fieldName} is required`;
    }
    
    const trimmed = url.trim();
    
    // Check for empty or whitespace-only URLs
    if (!trimmed) {
        return `${fieldName} cannot be empty`;
    }
    
    // Check for malformed URLs like //, ///, etc.
    if (trimmed.match(/^\/+$/)) {
        return `${fieldName} cannot be just slashes (e.g., //, ///)`;
    }
    
    // Check for protocol-relative URLs that could be dangerous
    if (trimmed.startsWith('//')) {
        return `${fieldName} cannot start with // (protocol-relative URLs not allowed)`;
    }
    
    // For relative URLs, ensure they start with / and have content after
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/')) {
        return `${fieldName} must start with / for relative URLs or http/https for absolute URLs`;
    }
    
    // For relative URLs starting with /, ensure there's content after the slash
    if (trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        if (trimmed.length === 1) {
            return `${fieldName} cannot be just a single slash`;
        }
        // Check for multiple consecutive slashes
        if (trimmed.includes('//')) {
            return `${fieldName} cannot contain consecutive slashes`;
        }
    }
    
    // Basic URL format validation for absolute URLs
    if (trimmed.startsWith('http')) {
        try {
            new URL(trimmed);
        } catch (e) {
            return `${fieldName} is not a valid URL format`;
        }
    }
    
    return null; // Valid
}

// Create new redirect
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { oldUrl, newUrl, redirectType, description, isActive } = req.body;
        
        // Validate URLs exist in database
        const oldUrlError = await validateUrlExistsInDatabase(oldUrl, 'Old URL');
        if (oldUrlError) {
            return res.status(400).json({
                success: false,
                message: oldUrlError
            });
        }
        
        const newUrlError = await validateUrlExistsInDatabase(newUrl, 'New URL');
        if (newUrlError) {
            return res.status(400).json({
                success: false,
                message: newUrlError
            });
        }
        
        // Normalize URLs for comparison
        let normalizedOldUrl = oldUrl.trim();
        let normalizedNewUrl = newUrl.trim();
        
        if (!normalizedOldUrl.startsWith('/') && !normalizedOldUrl.startsWith('http')) {
            normalizedOldUrl = '/' + normalizedOldUrl;
        }
        if (!normalizedNewUrl.startsWith('/') && !normalizedNewUrl.startsWith('http')) {
            normalizedNewUrl = '/' + normalizedNewUrl;
        }
        
        // Check if old and new URLs are the same
        if (normalizedOldUrl === normalizedNewUrl) {
            return res.status(400).json({
                success: false,
                message: 'Old URL and New URL cannot be the same'
            });
        }
        
        // Check if old URL already exists
        const existing = await UrlRedirect.findOne({ oldUrl: normalizedOldUrl });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A redirect for this old URL already exists'
            });
        }
        
        const redirect = new UrlRedirect({
            oldUrl: normalizedOldUrl,
            newUrl: normalizedNewUrl,
            redirectType: redirectType || 301,
            description,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.session.userId || req.user._id
        });
        
        await redirect.save();
        
        res.json({
            success: true,
            message: 'URL redirect created successfully',
            data: redirect
        });
    } catch (error) {
        console.error('Error creating redirect:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating redirect'
        });
    }
});

// Update redirect
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { oldUrl, newUrl, redirectType, description, isActive } = req.body;
        
        const redirect = await UrlRedirect.findById(req.params.id);
        
        if (!redirect) {
            return res.status(404).json({
                success: false,
                message: 'Redirect not found'
            });
        }
        
        // Validate URLs exist in database if they are being updated
        if (oldUrl) {
            const oldUrlError = await validateUrlExistsInDatabase(oldUrl, 'Old URL');
            if (oldUrlError) {
                return res.status(400).json({
                    success: false,
                    message: oldUrlError
                });
            }
        }
        
        if (newUrl) {
            const newUrlError = await validateUrlExistsInDatabase(newUrl, 'New URL');
            if (newUrlError) {
                return res.status(400).json({
                    success: false,
                    message: newUrlError
                });
            }
        }
        
        // Normalize URLs for comparison
        let normalizedOldUrl = oldUrl ? oldUrl.trim() : redirect.oldUrl;
        let normalizedNewUrl = newUrl ? newUrl.trim() : redirect.newUrl;
        
        if (!normalizedOldUrl.startsWith('/') && !normalizedOldUrl.startsWith('http')) {
            normalizedOldUrl = '/' + normalizedOldUrl;
        }
        if (!normalizedNewUrl.startsWith('/') && !normalizedNewUrl.startsWith('http')) {
            normalizedNewUrl = '/' + normalizedNewUrl;
        }
        
        // Check if old and new URLs are the same
        if (normalizedOldUrl === normalizedNewUrl) {
            return res.status(400).json({
                success: false,
                message: 'Old URL and New URL cannot be the same'
            });
        }
        
        // Check if old URL is being changed and if it conflicts with existing
        if (oldUrl && normalizedOldUrl !== redirect.oldUrl) {
            const existing = await UrlRedirect.findOne({ oldUrl: normalizedOldUrl, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'A redirect for this old URL already exists'
                });
            }
        }
        
        // Update fields
        if (oldUrl) redirect.oldUrl = normalizedOldUrl;
        if (newUrl) redirect.newUrl = normalizedNewUrl;
        if (redirectType) redirect.redirectType = redirectType;
        if (description !== undefined) redirect.description = description;
        if (isActive !== undefined) redirect.isActive = isActive;
        redirect.updatedBy = req.session.userId || req.user._id;
        
        await redirect.save();
        
        res.json({
            success: true,
            message: 'URL redirect updated successfully',
            data: redirect
        });
    } catch (error) {
        console.error('Error updating redirect:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating redirect'
        });
    }
});

// Delete redirect
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const redirect = await UrlRedirect.findByIdAndDelete(req.params.id);
        
        if (!redirect) {
            return res.status(404).json({
                success: false,
                message: 'Redirect not found'
            });
        }
        
        res.json({
            success: true,
            message: 'URL redirect deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting redirect:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting redirect'
        });
    }
});

// Bulk delete redirects
router.post('/bulk-delete', isAuthenticated, async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No redirect IDs provided'
            });
        }
        
        await UrlRedirect.deleteMany({ _id: { $in: ids } });
        
        res.json({
            success: true,
            message: `${ids.length} redirect(s) deleted successfully`
        });
    } catch (error) {
        console.error('Error bulk deleting redirects:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting redirects'
        });
    }
});

module.exports = router;
