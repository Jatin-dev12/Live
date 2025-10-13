const express = require('express');
const router = express.Router();
const Content = require('../../models/Content');
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');

// Get all content
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { status, page = 1, limit = 10, pageId } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (pageId) {
            query.page = pageId;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const contents = await Content.find(query)
            .populate('page', 'name path')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Content.countDocuments(query);
        
        res.json({
            success: true,
            data: contents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

// Get single content by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const content = await Content.findById(req.params.id)
            .populate('page', 'name path')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

// Create new content
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { pageId, title, description, content, thumbnail, category, status, order, customFields } = req.body;
        
        // Validate required fields
        if (!pageId || !title) {
            return res.status(400).json({
                success: false,
                message: 'Page and title are required'
            });
        }
        
        // Verify page exists
        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        const newContent = new Content({
            page: pageId,
            title,
            description,
            content,
            thumbnail,
            category,
            status: status || 'active',
            order: order || 0,
            customFields,
            createdBy: req.user ? req.user._id : null,
            updatedBy: req.user ? req.user._id : null
        });
        
        await newContent.save();
        
        // Populate page info before sending response
        await newContent.populate('page', 'name path');
        
        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: newContent
        });
    } catch (error) {
        console.error('Error creating content:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating content',
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Update content
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { pageId, title, description, content, thumbnail, category, status, order, customFields } = req.body;
        
        // Verify page exists if pageId is being updated
        if (pageId) {
            const page = await Page.findById(pageId);
            if (!page) {
                return res.status(404).json({
                    success: false,
                    message: 'Page not found'
                });
            }
        }
        
        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            {
                ...(pageId && { page: pageId }),
                title,
                description,
                content,
                thumbnail,
                category,
                status,
                order,
                customFields,
                updatedBy: req.user._id
            },
            { new: true, runValidators: true }
        ).populate('page', 'name path');
        
        if (!updatedContent) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Content updated successfully',
            data: updatedContent
        });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating content',
            error: error.message
        });
    }
});

// Delete content
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting content',
            error: error.message
        });
    }
});

module.exports = router;
