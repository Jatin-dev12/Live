const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const SEO = require('../models/SEO');
const Page = require('../models/Page');

router.get('/seo-management', isAuthenticated, async (req, res) => {
    try {
        const seoRecords = await SEO.find()
            .populate('page', 'name path')
            .sort({ createdAt: -1 });
        
        res.render('seo/seoManagement', {
            title: "SEO Management",
            subTitle: "SEO Management",
            seoRecords: seoRecords || []
        });
    } catch (error) {
        console.error('Error fetching SEO records:', error);
        res.render('seo/seoManagement', {
            title: "SEO Management",
            subTitle: "SEO Management",
            seoRecords: []
        });
    }
});

router.get('/add-seo-content', isAuthenticated, async (req, res) => {
    try {
        // Get pages that don't have SEO yet
        // const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });
        const allPages = await Page.find({ status: { $in: ['active', 'inactive'] } }).sort({ name: 1 });
        const pagesWithSEO = await SEO.find().select('page');
        const pageIdsWithSEO = pagesWithSEO.map(seo => seo.page.toString());
        
        const availablePages = allPages.filter(page => 
            !pageIdsWithSEO.includes(page._id.toString())
        );
        
        // Check if coming from content management with a specific page
        const { pageId, from } = req.query;
        let selectedPageId = null;
        let pageName = '';
        
        if (pageId) {
            const page = await Page.findById(pageId);
            if (page && availablePages.some(p => p._id.toString() === pageId)) {
                selectedPageId = pageId;
                pageName = page.name;
            }
        }
        
        res.render('seo/addSeoContent', {
            title: "Add SEO Content",
            subTitle: selectedPageId ? `Add SEO Content for ${pageName}` : "Add SEO Content",
            pages: availablePages,
            selectedPageId: selectedPageId,
            fromContent: from === 'content'
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.render('seo/addSeoContent', {
            title: "Add SEO Content",
            subTitle: "Add SEO Content",
            pages: [],
            selectedPageId: null,
            fromContent: false
        });
    }
});

router.get('/edit-seo-content/:id', isAuthenticated, async (req, res) => {
    try {
        const seo = await SEO.findById(req.params.id).populate('page');
        
        if (!seo) {
            return res.redirect('/seo/seo-management');
        }
        
        // Get all pages for dropdown (including current page)
        const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });
        const pagesWithSEO = await SEO.find({ _id: { $ne: req.params.id } }).select('page');
        const pageIdsWithSEO = pagesWithSEO.map(s => s.page.toString());
        
        const availablePages = allPages.filter(page => 
            !pageIdsWithSEO.includes(page._id.toString())
        );
        
        // Check if coming from content management with a specific page
        const { pageId, from } = req.query;
        const isPageLocked = pageId && pageId === seo.page._id.toString();
        
        res.render('seo/editSeoContent', {
            title: "Edit SEO Content",
            subTitle: "Edit SEO Content",
            seo,
            pages: availablePages,
            fromContent: from === 'content',
            isPageLocked: isPageLocked
        });
    } catch (error) {
        console.error('Error fetching SEO record:', error);
        res.redirect('/seo/seo-management');
    }
});



module.exports = router;
