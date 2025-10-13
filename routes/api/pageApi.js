const express = require('express');
const router = express.Router();
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');

// Get all pages
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { path: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pages = await Page.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        const total = await Page.countDocuments(query);
        
        res.json({
            success: true,
            data: pages,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pages',
            error: error.message
        });
    }
});

// Get single page by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching page',
            error: error.message
        });
    }
});

// Create new page
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name, path, status, metaTitle, metaDescription, metaKeywords } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Page name is required'
            });
        }
        
        // Check if page with same name or path already exists
        const existingPage = await Page.findOne({
            $or: [{ name }, { path }]
        });
        
        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: 'Page with this name or path already exists'
            });
        }
        
        const page = new Page({
            name,
            path: path || undefined, // Let the model auto-generate if not provided
            status: status || 'active',
            metaTitle,
            metaDescription,
            metaKeywords,
            createdBy: req.user ? req.user._id : null,
            updatedBy: req.user ? req.user._id : null
        });
        
        await page.save();
        
        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            data: page
        });
    } catch (error) {
        console.error('Error creating page:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating page',
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Update page
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, path, status, metaTitle, metaDescription, metaKeywords } = req.body;
        
        // Check if another page has the same name or path
        const existingPage = await Page.findOne({
            _id: { $ne: req.params.id },
            $or: [{ name }, { path }]
        });
        
        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: 'Another page with this name or path already exists'
            });
        }
        
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            {
                name,
                path,
                status,
                metaTitle,
                metaDescription,
                metaKeywords,
                updatedBy: req.user ? req.user._id : null
            },
            { new: true, runValidators: true }
        );
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Page updated successfully',
            data: page
        });
    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating page',
            error: error.message
        });
    }
});

// Delete page
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        // Also delete all content associated with this page
        const Content = require('../../models/Content');
        await Content.deleteMany({ page: req.params.id });
        
        res.json({
            success: true,
            message: 'Page and associated content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting page',
            error: error.message
        });
    }
});

module.exports = router;
