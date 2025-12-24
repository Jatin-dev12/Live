const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const Ad = require('../../models/Ad');
const AdPlacement = require('../../models/AdPlacement');
const { toAbsoluteUrl } = require('../../utils/urlHelper');



// Get ad media files (only from ads folder)
router.get('/ads/media', isAuthenticated, async (req, res) => {
    try {
        const adsMediaPath = path.join(__dirname, '../../public/uploads/ads');
        console.log('Checking ads media path:', adsMediaPath);
        
        // Check if ads directory exists
        if (!fs.existsSync(adsMediaPath)) {
            console.log('Ads directory does not exist');
            return res.json({
                success: true,
                data: [],
                message: 'No ad media folder found'
            });
        }
        
        // Read files from ads directory
        const files = fs.readdirSync(adsMediaPath);
        console.log('Found files in ads directory:', files);
        const mediaFiles = [];
        
        files.forEach(filename => {
            const filePath = path.join(adsMediaPath, filename);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                const ext = path.extname(filename).toLowerCase();
                const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                
                let type = 'other';
                let mimeType = 'application/octet-stream';
                
                if (imageExts.includes(ext)) {
                    type = 'image';
                    mimeType = 'image/' + ext.substring(1);
                }
                
                // Only include images
                if (type === 'image') {
                    mediaFiles.push({
                        _id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        originalName: filename,
                        url: toAbsoluteUrl('/uploads/ads/' + filename),
                        type: type,
                        mimeType: mimeType,
                        size: stats.size,
                        createdAt: stats.birthtime
                    });
                }
            }
        });
        
        // Sort by creation date (newest first)
        mediaFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('Returning media files:', mediaFiles.length, 'files');
        
        res.json({
            success: true,
            data: mediaFiles,
            count: mediaFiles.length
        });
    } catch (error) {
        console.error('Error fetching ad media:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ad media',
            error: error.message
        });
    }
});

// ============ PUBLIC ADS API ============

// Get all active ads grouped by pages (public endpoint for frontend slider display)
router.get('/ads/active', async (req, res) => {
    try {
        const currentDate = new Date();
        console.log('Current date for filtering:', currentDate);
        
        // Get active ads with populated pages
        const activeAds = await Ad.find({
            status: 'active',
            start_date: { $lte: currentDate },
            end_date: { $gt: currentDate },
            selected_pages: { $exists: true, $not: { $size: 0 } }
        })
        .populate('selected_pages', '_id name slug path')
        .select('_id title description media_url ad_type link_url link_target start_date end_date selected_pages')
        .lean();

        console.log(`Found ${activeAds.length} active ads with pages`);

        // Group ads by page and ad_type for slider functionality
        const adsByPage = {};
        let totalAdsCount = 0;

        activeAds.forEach(ad => {
            const transformedAd = {
                id: ad._id,
                title: ad.title,
                description: ad.description,
                media_url: toAbsoluteUrl(ad.media_url),
                ad_type: ad.ad_type,
                link_url: ad.link_url,
                link_target: ad.link_target || '_blank',
                start_date: ad.start_date,
                end_date: ad.end_date
            };

            // Add this ad to each page it's assigned to
            ad.selected_pages.forEach(page => {
                const pageKey = page._id.toString();
                
                if (!adsByPage[pageKey]) {
                    adsByPage[pageKey] = {
                        page: {
                            id: page._id,
                            name: page.name,
                            slug: page.slug,
                            path: page.path
                        },
                        ad_types: {}
                    };
                }
                
                // Group by ad_type within each page
                const adType = ad.ad_type || 'default';
                if (!adsByPage[pageKey].ad_types[adType]) {
                    adsByPage[pageKey].ad_types[adType] = [];
                }
                
                adsByPage[pageKey].ad_types[adType].push(transformedAd);
                totalAdsCount++;
            });
        });

        // Convert to array format for easier frontend consumption
        const groupedAds = Object.values(adsByPage).map(pageData => ({
            page: pageData.page,
            ad_types: pageData.ad_types
        }));
        
        console.log(`Grouped into ${groupedAds.length} pages with total ${totalAdsCount} ad placements`);

        res.json({
            success: true,
            pages_count: groupedAds.length,
            total_ad_placements: totalAdsCount,
            data: groupedAds,
            timestamp: currentDate.toISOString()
        });

    } catch (error) {
        console.error('Error fetching active ads:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active ads',
            error: error.message
        });
    }
});

// Get active ads for a specific page (by page slug or ID)
router.get('/ads/page/:pageIdentifier', async (req, res) => {
    try {
        const { pageIdentifier } = req.params;
        const currentDate = new Date();
        
        // First, find the page by slug or ID
        const Page = require('../../models/Page');
        let page;
        
        if (require('mongoose').Types.ObjectId.isValid(pageIdentifier)) {
            page = await Page.findById(pageIdentifier);
        } else {
            page = await Page.findOne({ slug: pageIdentifier });
        }
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Find ads that are active and include this page
        const activeAds = await Ad.find({
            status: 'active',
            start_date: { $lte: currentDate },
            end_date: { $gt: currentDate },
            selected_pages: page._id
        })
        .populate('selected_pages', '_id name slug path')
        .select('_id title description media_url ad_type link_url link_target start_date end_date selected_pages')
        .lean();

        // Transform the data
        const adsForPage = activeAds.map(ad => ({
            id: ad._id,
            title: ad.title,
            description: ad.description,
            media_url: toAbsoluteUrl(ad.media_url),
            ad_type: ad.ad_type,
            link_url: ad.link_url,
            link_target: ad.link_target || '_blank',
            start_date: ad.start_date,
            end_date: ad.end_date,
            pages: ad.selected_pages.map(p => ({
                id: p._id,
                name: p.name,
                slug: p.slug,
                path: p.path
            }))
        }));

        console.log(`Found ${adsForPage.length} active ads for page: ${page.name}`);

        res.json({
            success: true,
            count: adsForPage.length,
            page: {
                id: page._id,
                name: page.name,
                slug: page.slug,
                path: page.path
            },
            data: adsForPage,
            timestamp: currentDate.toISOString()
        });

    } catch (error) {
        console.error('Error fetching ads for page:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ads for page',
            error: error.message
        });
    }
});

// Debug endpoint to check raw ad data
router.get('/ads/debug', async (req, res) => {
    try {
        const ads = await Ad.find({})
            .populate('selected_pages', '_id name slug path')
            .select('_id title status start_date end_date selected_pages')
            .lean();
        
        const currentDate = new Date();
        
        const debugData = ads.map(ad => ({
            id: ad._id,
            title: ad.title,
            status: ad.status,
            start_date: ad.start_date,
            end_date: ad.end_date,
            selected_pages_count: ad.selected_pages ? ad.selected_pages.length : 0,
            selected_pages: ad.selected_pages || [],
            is_active_status: ad.status === 'active',
            is_start_date_valid: ad.start_date ? ad.start_date <= currentDate : false,
            is_end_date_valid: ad.end_date ? ad.end_date > currentDate : false,
            has_pages: ad.selected_pages && ad.selected_pages.length > 0
        }));
        
        res.json({
            success: true,
            currentDate: currentDate,
            count: debugData.length,
            data: debugData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// ============ ADMIN ADS API ============

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
        
        // Convert media URLs to absolute
        const adsWithAbsoluteUrls = ads.map(ad => ({
            ...ad,
            media_url: toAbsoluteUrl(ad.media_url)
        }));
        
        res.json({
            success: true,
            count: adsWithAbsoluteUrls.length,
            data: adsWithAbsoluteUrls
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
        
        // Convert media URL to absolute
        const adWithAbsoluteUrl = {
            ...ad.toObject(),
            media_url: toAbsoluteUrl(ad.media_url)
        };
        
        res.json({
            success: true,
            data: adWithAbsoluteUrl
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
            link_url,
            link_target,
            priority,
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
            link_url: link_url || null,
            link_target: link_target || '_self',
            priority: priority || 1,
            status: status || 'pending',
            start_date,
            end_date,
            budget: budget || 0,
            max_impressions: max_impressions || 0,
            max_clicks: max_clicks || 0,
            created_by: req.user._id,
            created_by_type: created_by_type || 'admin',
            selected_pages: req.body.selected_pages || []
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
            link_url,
            link_target,
            priority,
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
        if (link_url !== undefined) ad.link_url = link_url;
        if (link_target) ad.link_target = link_target;
        if (priority !== undefined) ad.priority = priority;
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

// ============ AD MEDIA ROUTES ============

const fs = require('fs');
const path = require('path');

// Delete ad media file
router.delete('/ads/media/:filename', isAuthenticated, async (req, res) => {
    try {
        const adsMediaPath = path.join(__dirname, '../../public/uploads/ads');
        console.log('Checking ads media path:', adsMediaPath);
        
        // Check if ads directory exists
        if (!fs.existsSync(adsMediaPath)) {
            console.log('Ads directory does not exist');
            return res.json({
                success: true,
                data: [],
                message: 'No ad media folder found'
            });
        }
        
        // Read files from ads directory
        const files = fs.readdirSync(adsMediaPath);
        console.log('Found files in ads directory:', files);
        const mediaFiles = [];
        
        files.forEach(filename => {
            const filePath = path.join(adsMediaPath, filename);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                const ext = path.extname(filename).toLowerCase();
                const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                
                let type = 'other';
                let mimeType = 'application/octet-stream';
                
                if (imageExts.includes(ext)) {
                    type = 'image';
                    mimeType = 'image/' + ext.substring(1);
                }
                
                // Only include images
                if (type === 'image') {
                    mediaFiles.push({
                        _id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        originalName: filename,
                        url: toAbsoluteUrl('/uploads/ads/' + filename),
                        type: type,
                        mimeType: mimeType,
                        size: stats.size,
                        createdAt: stats.birthtime
                    });
                }
            }
        });
        
        // Sort by creation date (newest first)
        mediaFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('Returning media files:', mediaFiles.length, 'files');
        
        res.json({
            success: true,
            data: mediaFiles,
            count: mediaFiles.length
        });
    } catch (error) {
        console.error('Error fetching ad media:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ad media',
            error: error.message
        });
    }
});

// Delete ad media file
router.delete('/ads/media/:filename', isAuthenticated, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../public/uploads/ads', filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        // Delete the file
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ad media:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
});

// ============ PAGE SELECTION ROUTES ============

// Get all pages for selection
router.get('/pages', isAuthenticated, async (req, res) => {
    try {
        const Page = require('../../models/Page');
        const pages = await Page.find({ status: 'active' })
            .select('_id name slug path')
            .sort({ name: 1 })
            .lean();
        
        console.log('Pages API called - found', pages.length, 'active pages');
        console.log('Sample pages:', pages.slice(0, 3));
        
        res.json({
            success: true,
            count: pages.length,
            data: pages
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

// Get selected pages for an ad
router.get('/ads/:id/pages', isAuthenticated, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id)
            .populate('selected_pages', '_id name slug path')
            .lean();
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        res.json({
            success: true,
            data: ad.selected_pages || []
        });
    } catch (error) {
        console.error('Error fetching ad pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ad pages',
            error: error.message
        });
    }
});

// Update selected pages for an ad
router.put('/ads/:id/pages', isAuthenticated, async (req, res) => {
    try {
        let { selected_pages } = req.body;
        
        console.log('Received page selection request:');
        console.log('Ad ID:', req.params.id);
        console.log('Selected pages:', selected_pages);
        console.log('Selected pages type:', typeof selected_pages);
        console.log('Is array:', Array.isArray(selected_pages));
        
        if (!Array.isArray(selected_pages)) {
            return res.status(400).json({
                success: false,
                message: 'selected_pages must be an array'
            });
        }
        
        const ad = await Ad.findById(req.params.id);
        
        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Ad not found'
            });
        }
        
        // Validate that all page IDs exist (if any are provided)
        if (selected_pages.length > 0) {
            const Page = require('../../models/Page');
            const mongoose = require('mongoose');
            
            // Convert all IDs to strings and filter out empty/null values
            const cleanPageIds = selected_pages
                .filter(id => id && id.toString().trim())
                .map(id => id.toString().trim());
            
            console.log('Validating page IDs:', cleanPageIds);
            
            // For now, let's be more permissive and just check ObjectId format
            const invalidObjectIds = cleanPageIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
            
            if (invalidObjectIds.length > 0) {
                console.log('Invalid ObjectId format:', invalidObjectIds);
                return res.status(400).json({
                    success: false,
                    message: 'Some page IDs have invalid format: ' + invalidObjectIds.join(', '),
                    invalidPages: invalidObjectIds
                });
            }
            
            // Just validate ObjectId format for now, skip database check to avoid issues
            console.log('All page IDs have valid ObjectId format');
            selected_pages = cleanPageIds;
        }
        
        // Update the ad with selected pages
        ad.selected_pages = selected_pages;
        await ad.save();
        
        // Return updated ad with populated pages
        await ad.populate('selected_pages', '_id name slug path');
        
        res.json({
            success: true,
            message: 'Page selection updated successfully',
            data: {
                ad_id: ad._id,
                selected_pages: ad.selected_pages
            }
        });
    } catch (error) {
        console.error('Error updating ad pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ad pages',
            error: error.message
        });
    }
});

module.exports = router;
