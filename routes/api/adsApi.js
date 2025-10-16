const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const Ad = require('../../models/Ad');
const AdPlacement = require('../../models/AdPlacement');

// Get all ads with filters
router.get('/ads', isAuthenticated, async (req, res) => {
    try {
        const { status, ad_type, placement_id, search } = req.query;
        
        let query = {};
        
        // Apply filters
        if (status) query.status = status;
        if (ad_type) query.ad_type = ad_type;
        if (placement_id) query.placement_id = placement_id;
        
        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const ads = await Ad.find(query)
            .populate('placement_id', 'placementId name pageLocation')
            .populate('created_by', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json({
            success: true,
            count: ads.length,
            data: ads
        });
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ads',
            error: error.message
        });
    }
});

// Get single ad by ID
router.get('/ads/:id', isAuthenticated, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id)
            .populate('placement_id', 'placementId name pageLocation dimensions')
            .populate('created_by', 'fullName email');
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        res.json({
            success: true,
            data: ad
        });
    } catch (error) {
        console.error('Error fetching ad:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ad',
            error: error.message
        });
    }
});

// Create new ad
router.post('/ads', isAuthenticated, async (req, res) => {
    try {
        const {
            title,
            description,
            media_url,
            ad_type,
            placement_id,
            page_name,
            page_section,
            placement,
            status,
            start_date,
            end_date,
            budget,
            max_impressions,
            max_clicks,
            created_by_type
        } = req.body;
        
        // Validate placement exists (only if placement_id is provided - for backward compatibility)
        if (placement_id) {
            const placementDoc = await AdPlacement.findById(placement_id);
            if (!placementDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Ad placement not found'
                });
            }
        }
        
        // Create new ad
        const ad = new Ad({
            title,
            description,
            media_url,
            ad_type,
            placement_id: placement_id || null,
            page_name: page_name || null,
            page_section: page_section || null,
            placement: placement || null,
            status: status || 'pending',
            start_date,
            end_date,
            budget: budget || 0,
            max_impressions: max_impressions || 0,
            max_clicks: max_clicks || 0,
            created_by: req.user._id,
            created_by_type: created_by_type || 'admin'
        });
        
        await ad.save();
        
        // Populate the created ad (only if placement_id exists)
        if (placement_id) {
            await ad.populate('placement_id', 'placementId name pageLocation');
        }
        await ad.populate('created_by', 'fullName email');
        
        res.status(201).json({
            success: true,
            message: 'Ad created successfully',
            data: ad
        });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating ad',
            error: error.message
        });
    }
});

// Update ad
router.put('/ads/:id', isAuthenticated, async (req, res) => {
    try {
        const {
            title,
            description,
            media_url,
            ad_type,
            placement_id,
            page_name,
            page_section,
            placement,
            status,
            start_date,
            end_date,
            budget,
            max_impressions,
            max_clicks
        } = req.body;
        
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        // Validate placement if changed (only if placement_id is provided)
        if (placement_id && ad.placement_id && placement_id !== ad.placement_id.toString()) {
            const placementDoc = await AdPlacement.findById(placement_id);
            if (!placementDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Ad placement not found'
                });
            }
        }
        
        // Update fields
        if (title) ad.title = title;
        if (description) ad.description = description;
        if (media_url) ad.media_url = media_url;
        if (ad_type) ad.ad_type = ad_type;
        if (placement_id) ad.placement_id = placement_id;
        if (page_name) ad.page_name = page_name;
        if (page_section) ad.page_section = page_section;
        if (placement) ad.placement = placement;
        if (status) ad.status = status;
        if (start_date) ad.start_date = start_date;
        if (end_date) ad.end_date = end_date;
        if (budget !== undefined) ad.budget = budget;
        if (max_impressions !== undefined) ad.max_impressions = max_impressions;
        if (max_clicks !== undefined) ad.max_clicks = max_clicks;
        
        await ad.save();
        
        // Populate the updated ad (only if placement_id exists)
        if (ad.placement_id) {
            await ad.populate('placement_id', 'placementId name pageLocation');
        }
        await ad.populate('created_by', 'fullName email');
        
        res.json({
            success: true,
            message: 'Ad updated successfully',
            data: ad
        });
    } catch (error) {
        console.error('Error updating ad:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating ad',
            error: error.message
        });
    }
});

// Delete ad
router.delete('/ads/:id', isAuthenticated, async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Ad deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ad',
            error: error.message
        });
    }
});

// Update ad status
router.patch('/ads/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['active', 'paused', 'expired', 'pending', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        ad.status = status;
        await ad.save();
        
        res.json({
            success: true,
            message: `Ad status updated to ${status}`,
            data: { status: ad.status }
        });
    } catch (error) {
        console.error('Error updating ad status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ad status',
            error: error.message
        });
    }
});

// Record impression
router.post('/ads/:id/impression', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        await ad.recordImpression();
        
        res.json({
            success: true,
            message: 'Impression recorded',
            data: {
                current_impressions: ad.current_impressions,
                max_impressions: ad.max_impressions,
                status: ad.status
            }
        });
    } catch (error) {
        console.error('Error recording impression:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording impression',
            error: error.message
        });
    }
});

// Record click
router.post('/ads/:id/click', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        await ad.recordClick();
        
        res.json({
            success: true,
            message: 'Click recorded',
            data: {
                current_clicks: ad.current_clicks,
                max_clicks: ad.max_clicks,
                status: ad.status
            }
        });
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording click',
            error: error.message
        });
    }
});

// Get ad statistics
router.get('/ads/:id/stats', isAuthenticated, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        const stats = {
            impressions: {
                current: ad.current_impressions,
                max: ad.max_impressions,
                percentage: ad.max_impressions > 0 ? (ad.current_impressions / ad.max_impressions * 100).toFixed(2) : 0
            },
            clicks: {
                current: ad.current_clicks,
                max: ad.max_clicks,
                percentage: ad.max_clicks > 0 ? (ad.current_clicks / ad.max_clicks * 100).toFixed(2) : 0,
                ctr: ad.current_impressions > 0 ? (ad.current_clicks / ad.current_impressions * 100).toFixed(2) : 0
            },
            budget: {
                spent: ad.spent_budget,
                total: ad.budget,
                percentage: ad.budget > 0 ? (ad.spent_budget / ad.budget * 100).toFixed(2) : 0
            },
            status: ad.status,
            isCurrentlyActive: ad.isCurrentlyActive
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching ad stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ad statistics',
            error: error.message
        });
    }
});

// ============ AD PLACEMENTS ROUTES ============

// Get all ad placements
router.get('/placements', isAuthenticated, async (req, res) => {
    try {
        const placements = await AdPlacement.find({ isActive: true })
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json({
            success: true,
            count: placements.length,
            data: placements
        });
    } catch (error) {
        console.error('Error fetching placements:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching placements',
            error: error.message
        });
    }
});

// Create new placement
router.post('/placements', isAuthenticated, async (req, res) => {
    try {
        const { placementId, name, description, pageLocation, dimensions } = req.body;
        
        const placement = new AdPlacement({
            placementId,
            name,
            description,
            pageLocation,
            dimensions,
            createdBy: req.user._id
        });
        
        await placement.save();
        
        res.status(201).json({
            success: true,
            message: 'Ad placement created successfully',
            data: placement
        });
    } catch (error) {
        console.error('Error creating placement:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating placement',
            error: error.message
        });
    }
});

module.exports = router;
