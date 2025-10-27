const express = require('express');
const router = express.Router();
const UrlRedirect = require('../../models/UrlRedirect');
const { isAuthenticated } = require('../../middleware/auth');

// Get all redirects
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const redirects = await UrlRedirect.find()
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: redirects
        });
    } catch (error) {
        console.error('Error fetching redirects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching redirects'
        });
    }
});

// Create new redirect
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { oldUrl, newUrl, redirectType, description, isActive } = req.body;
        
        // Validation
        if (!oldUrl || !newUrl) {
            return res.status(400).json({
                success: false,
                message: 'Old URL and New URL are required'
            });
        }
        
        // Check if old URL already exists
        const existing = await UrlRedirect.findOne({ oldUrl });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A redirect for this old URL already exists'
            });
        }
        
        const redirect = new UrlRedirect({
            oldUrl,
            newUrl,
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
        
        // Check if old URL is being changed and if it conflicts with existing
        if (oldUrl && oldUrl !== redirect.oldUrl) {
            const existing = await UrlRedirect.findOne({ oldUrl, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'A redirect for this old URL already exists'
                });
            }
        }
        
        // Update fields
        if (oldUrl) redirect.oldUrl = oldUrl;
        if (newUrl) redirect.newUrl = newUrl;
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
