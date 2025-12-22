const express = require('express');
const router = express.Router();
const Content = require('../../models/Content');
const Page = require('../../models/Page');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../../middleware/auth');

// Get all content
router.get('/', async (req, res) => {
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
        const { pageId, title, description, content, thumbnail, category, status, order, customFields, sectionType, heroSection, threeColumnInfo, callOutCards, tabsSection, communityGroups, contactSection } = req.body;
        
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
            sectionType: sectionType || 'default',
            heroSection: heroSection || undefined,
            threeColumnInfo: threeColumnInfo || undefined,
            callOutCards: callOutCards || undefined,
            tabsSection: tabsSection || undefined,
            communityGroups: communityGroups || undefined,
            contactSection: contactSection || undefined,
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
        // If the request contains a sections array, perform a bulk sync for the page
        if (Array.isArray(req.body.sections)) {
            const { pageId, status, sections, pageThumbnail } = req.body;
            // console.log('Updating sections for page:', pageId);
            // console.log('Sections data received:', JSON.stringify(sections, null, 2));

            // pageId is required to map sections
            if (!pageId) {
                return res.status(400).json({ success: false, message: 'pageId is required when updating multiple sections' });
            }

            // verify page exists
            const page = await Page.findById(pageId);
            if (!page) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            
            //if status changed save the status
            if(page.status != status){
                const pageStatus = await Page.findByIdAndUpdate(
                    pageId,
                    {
                        status,
                    },
                    { new: true }
                );
            }

            // Fetch existing sections for this page
            const existing = await Content.find({ page: pageId }).lean();
            const existingIds = existing.map(s => s._id.toString());

            const providedExistingIds = [];
            const updatePromises = [];
            const createPromises = [];

            sections.forEach(s => {
                // normalize order and status
                const orderVal = Number(s.order) || 0;
                const sectionStatus = s.status || status || 'active';

                // If id looks like a valid ObjectId, update existing
                if (s.id && mongoose.Types.ObjectId.isValid(s.id)) {
                    providedExistingIds.push(s.id);
                    const updateFields = {
                        ...(s.sectionType !== undefined && { sectionType: s.sectionType }),
                        ...(s.title !== undefined && { title: s.title }),
                        ...(s.thumbnail !== undefined && { thumbnail: s.thumbnail }),
                        status: sectionStatus,
                        order: orderVal,
                        ...(s.customFields !== undefined && { customFields: s.customFields }),
                        ...(s.heroSection !== undefined && { heroSection: s.heroSection }),
                        ...(s.threeColumnInfo !== undefined && { threeColumnInfo: s.threeColumnInfo }),
                        ...(s.callOutCards !== undefined && { callOutCards: s.callOutCards }),
                        ...(s.tabsSection !== undefined && { tabsSection: s.tabsSection }),
                        ...(s.communityGroups !== undefined && { communityGroups: s.communityGroups }),
                        ...(s.contactSection !== undefined && { contactSection: s.contactSection }),
                        updatedBy: req.user ? req.user._id : null
                    };

                    updatePromises.push(Content.findByIdAndUpdate(s.id, updateFields, { new: true, runValidators: true }));
                } else {
                    // Create new section
                    const newContent = new Content({
                        page: pageId,
                        title: s.title || (s.customFields && (s.customFields.heading || s.customFields.leftHeading || s.customFields.rightHeading)) || 'Section',
                        status: sectionStatus,
                        order: orderVal,
                        sectionType: s.sectionType || 'default',
                        customFields: s.customFields || undefined,
                        heroSection: s.heroSection || undefined,
                        threeColumnInfo: s.threeColumnInfo || undefined,
                        callOutCards: s.callOutCards || undefined,
                        tabsSection: s.tabsSection || undefined,
                        communityGroups: s.communityGroups || undefined,
                        contactSection: s.contactSection || undefined,
                        thumbnail: s.thumbnail || undefined,
                        createdBy: req.user ? req.user._id : null,
                        updatedBy: req.user ? req.user._id : null
                    });
                    createPromises.push(newContent.save());
                }
            });

            // execute creates and updates
            const updatedResults = await Promise.all(updatePromises.map(p => p.catch(e => ({ error: e.message }))));
            const createdResults = await Promise.all(createPromises.map(p => p.catch(e => ({ error: e.message }))));

            // delete any existing sections that were removed in the payload
            const toDelete = existingIds.filter(id => !providedExistingIds.includes(id));
            let deleteResult = { deletedCount: 0 };
            if (toDelete.length > 0) {
                deleteResult = await Content.deleteMany({ _id: { $in: toDelete } });
            }

            // Update page thumbnail if provided
            if (pageThumbnail !== undefined) {
                await Page.findByIdAndUpdate(pageId, { 
                    thumbnail: pageThumbnail || null,
                    updatedBy: req.user ? req.user._id : null
                });
            }

            return res.json({
                success: true,
                message: 'Sections synchronized successfully',
                data: {
                    updated: updatedResults.length,
                    created: createdResults.length,
                    deleted: deleteResult.deletedCount || 0,
                    updatedResults,
                    createdResults
                }
            });
        }

        const { pageId, title, description, content, thumbnail, category, status, order, customFields, sectionType, heroSection, threeColumnInfo, callOutCards, tabsSection, communityGroups, contactSection } = req.body;
        
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
                sectionType,
                heroSection,
                threeColumnInfo,
                callOutCards,
                tabsSection,
                communityGroups,
                contactSection,
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

// Reorder multiple sections for a page
router.post('/reorder', isAuthenticated, async (req, res) => {
	try {
		const { updates } = req.body; // [{ id, order }]
		if (!Array.isArray(updates) || updates.length === 0) {
			return res.status(400).json({ success: false, message: 'updates array is required' });
		}
		const bulkOps = updates.map(u => ({
			updateOne: {
				filter: { _id: u.id },
				update: { $set: { order: Number(u.order) || 0 } }
			}
		}));
		await Content.bulkWrite(bulkOps);
		res.json({ success: true, message: 'Sections reordered successfully' });
	} catch (error) {
		console.error('Error reordering sections:', error);
		res.status(500).json({ success: false, message: 'Error reordering sections', error: error.message });
	}
});

// Delete all content for a specific page
router.delete('/page/:pageId', isAuthenticated, async (req, res) => {
    try {
        const result = await Content.deleteMany({ page: req.params.pageId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No content found for this page'
            });
        }
        
        res.json({
            success: true,
            message: `${result.deletedCount} content section(s) deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting page content:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting page content',
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
