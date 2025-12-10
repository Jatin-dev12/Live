const express = require('express');
const router = express.Router();
const SEO = require('../../models/SEO');
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');
const { toAbsoluteUrl } = require('../../utils/urlHelper');

// Get all SEO records with pagination and search
router.get('/seo', isAuthenticated, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get SEO records with populated page data
        let seoQuery = SEO.find(query)
            .populate('page', 'name path')
            .populate('createdBy', 'fullName')
            .populate('updatedBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const seoRecords = await seoQuery;

        // Filter by search after population if needed
        let filteredRecords = seoRecords;
        if (search) {
            filteredRecords = seoRecords.filter(seo => 
                seo.page.name.toLowerCase().includes(search.toLowerCase()) ||
                seo.metaTitle.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Convert image URLs to absolute
        const recordsWithAbsoluteUrls = filteredRecords.map(record => ({
            ...record.toObject(),
            ogImage: toAbsoluteUrl(record.ogImage),
            ogImagePath: toAbsoluteUrl(record.ogImagePath)
        }));

        const total = await SEO.countDocuments(query);

        res.json({
            success: true,
            data: recordsWithAbsoluteUrls,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching SEO records:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO records',
            error: error.message
        });
    }
});

// Get single SEO record by ID
router.get('/seo/:id', isAuthenticated, async (req, res) => {
    try {
        const seo = await SEO.findById(req.params.id).populate('page', 'name path');
        
        if (!seo) {
            return res.status(404).json({
                success: false,
                message: 'SEO record not found'
            });
        }

        // Convert image URLs to absolute
        const seoWithAbsoluteUrls = {
            ...seo.toObject(),
            ogImage: toAbsoluteUrl(seo.ogImage),
            ogImagePath: toAbsoluteUrl(seo.ogImagePath)
        };

        res.json({
            success: true,
            data: seoWithAbsoluteUrls
        });
    } catch (error) {
        console.error('Error fetching SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO record',
            error: error.message
        });
    }
});

// Get SEO by page ID
router.get('/seo/page/:pageId', isAuthenticated, async (req, res) => {
    try {
        const seo = await SEO.findOne({ page: req.params.pageId }).populate('page', 'name path');
        
        // Convert image URLs to absolute if seo exists
        const seoWithAbsoluteUrls = seo ? {
            ...seo.toObject(),
            ogImage: toAbsoluteUrl(seo.ogImage),
            ogImagePath: toAbsoluteUrl(seo.ogImagePath)
        } : null;
        
        res.json({
            success: true,
            data: seoWithAbsoluteUrls
        });
    } catch (error) {
        console.error('Error fetching SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO record',
            error: error.message
        });
    }
});

// Check if SEO exists for a page (for content management integration)
router.get('/seo/check-page/:pageId', isAuthenticated, async (req, res) => {
    try {
        const seo = await SEO.findOne({ page: req.params.pageId });
        
        res.json({
            success: true,
            seoExists: !!seo,
            seoId: seo ? seo._id : null
        });
    } catch (error) {
        console.error('Error checking SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking SEO record',
            error: error.message
        });
    }
});

// Create new SEO record
router.post('/seo', isAuthenticated, async (req, res) => {
    try {
        const {
            page,
            metaTitle,
            metaDescription,
            metaKeywords,
            canonicalUrl,
            ogMetaTags,
            ogImage,
            ogImagePath,
            robots,
            status
        } = req.body;

        // Check if page exists
        const pageExists = await Page.findById(page);
        if (!pageExists) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if SEO already exists for this page
        const existingSEO = await SEO.findOne({ page });
        if (existingSEO) {
            return res.status(400).json({
                success: false,
                message: 'SEO record already exists for this page'
            });
        }

        const seo = new SEO({
            page,
            metaTitle,
            metaDescription,
            metaKeywords,
            canonicalUrl,
            ogMetaTags,
            ogImage,
            ogImagePath,
            robots: robots || 'index, follow',
            status: status || 'active',
            createdBy: req.user._id
        });

        await seo.save();

        const populatedSEO = await SEO.findById(seo._id).populate('page', 'name path');

        res.status(201).json({
            success: true,
            message: 'SEO record created successfully',
            data: populatedSEO
        });
    } catch (error) {
        console.error('Error creating SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating SEO record',
            error: error.message
        });
    }
});

// Update SEO record
router.put('/seo/:id', isAuthenticated, async (req, res) => {
    try {
        const {
            page,
            metaTitle,
            metaDescription,
            metaKeywords,
            canonicalUrl,
            ogMetaTags,
            ogImage,
            ogImagePath,
            robots,
            status
        } = req.body;

        const seo = await SEO.findById(req.params.id);
        
        if (!seo) {
            return res.status(404).json({
                success: false,
                message: 'SEO record not found'
            });
        }

        // Check if page change is being attempted when it should be locked
        const { pageId, from } = req.query;
        if (pageId && from === 'content' && page && page !== seo.page.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Page cannot be changed when accessed from content management'
            });
        }

        // If page is being changed, check if new page exists and doesn't have SEO
        if (page && page !== seo.page.toString()) {
            const pageExists = await Page.findById(page);
            if (!pageExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Page not found'
                });
            }

            const existingSEO = await SEO.findOne({ page, _id: { $ne: req.params.id } });
            if (existingSEO) {
                return res.status(400).json({
                    success: false,
                    message: 'SEO record already exists for this page'
                });
            }
        }

        // Update fields
        if (page) seo.page = page;
        if (metaTitle) seo.metaTitle = metaTitle;
        if (metaDescription) seo.metaDescription = metaDescription;
        if (metaKeywords !== undefined) seo.metaKeywords = metaKeywords;
        if (canonicalUrl !== undefined) seo.canonicalUrl = canonicalUrl;
        if (ogMetaTags !== undefined) seo.ogMetaTags = ogMetaTags;
        if (ogImage !== undefined) seo.ogImage = ogImage;
        if (ogImagePath !== undefined) seo.ogImagePath = ogImagePath;
        if (robots) seo.robots = robots;
        if (status) seo.status = status;
        seo.updatedBy = req.user._id;

        await seo.save();

        const updatedSEO = await SEO.findById(seo._id).populate('page', 'name path');

        res.json({
            success: true,
            message: 'SEO record updated successfully',
            data: updatedSEO
        });
    } catch (error) {
        console.error('Error updating SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating SEO record',
            error: error.message
        });
    }
});

// Delete SEO record
router.delete('/seo/:id', isAuthenticated, async (req, res) => {
    try {
        const seo = await SEO.findByIdAndDelete(req.params.id);
        
        if (!seo) {
            return res.status(404).json({
                success: false,
                message: 'SEO record not found'
            });
        }

        res.json({
            success: true,
            message: 'SEO record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting SEO record:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting SEO record',
            error: error.message
        });
    }
});

// Get available pages (pages without SEO or current page)
router.get('/seo/available-pages/:seoId?', isAuthenticated, async (req, res) => {
    try {
        const seoId = req.params.seoId;
        
        // Get all pages
        const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });
        
        // Get pages that already have SEO
        const pagesWithSEO = await SEO.find().select('page');
        const pageIdsWithSEO = pagesWithSEO.map(seo => seo.page.toString());
        
        // If editing, get current SEO's page
        let currentPageId = null;
        if (seoId && seoId !== 'undefined') {
            const currentSEO = await SEO.findById(seoId);
            if (currentSEO) {
                currentPageId = currentSEO.page.toString();
            }
        }
        
        // Filter available pages
        const availablePages = allPages.filter(page => {
            const pageId = page._id.toString();
            return !pageIdsWithSEO.includes(pageId) || pageId === currentPageId;
        });

        res.json({
            success: true,
            data: availablePages
        });
    } catch (error) {
        console.error('Error fetching available pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available pages',
            error: error.message
        });
    }
});

module.exports = router;
