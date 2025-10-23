const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Page = require('../models/Page');
const Content = require('../models/Content');

// List all content
router.get('/content-management', isAuthenticated, async (req, res) => {
    try {
        const contents = await Content.find()
            .populate('page', 'name path')
            .sort({ createdAt: -1 });
        
        // Group content by page
        const groupedContents = {};
        contents.forEach(content => {
            const pageId = content.page ? content.page._id.toString() : 'no-page';
            if (!groupedContents[pageId]) {
                groupedContents[pageId] = {
                    page: content.page,
                    sections: [],
                    status: content.status,
                    firstContentId: content._id
                };
            }
            groupedContents[pageId].sections.push(content);
        });
        
        // Convert to array
        const groupedContentsArray = Object.values(groupedContents);
        
        res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: groupedContentsArray
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: [],
            error: 'Error loading content'
        });
    }
});

// Show add content form
router.get('/add-content-management', isAuthenticated, async (req, res) => {
    try {
        // Get all active pages
        const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });
        
        // Get pages that already have content
        const pagesWithContent = await Content.distinct('page');
        
        // Filter out pages that already have content
        const availablePages = allPages.filter(page => 
            !pagesWithContent.some(contentPageId => contentPageId.toString() === page._id.toString())
        );
        
        res.render('cms/addContentManagement', {
            title: "Add Content Management",
            subTitle: "Add Content Management",
            pages: availablePages
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.render('cms/addContentManagement', {
            title: "Add Content Management",
            subTitle: "Add Content Management",
            pages: [],
            error: 'Error loading pages'
        });
    }
});

// Show edit content form - loads all sections for a page
router.get('/edit-content-management/:id', isAuthenticated, async (req, res) => {
    try {
        const firstContent = await Content.findById(req.params.id).populate('page');
        
        if (!firstContent) {
            return res.redirect('/cms/content-management');
        }
        
        // Get all sections for this page
        const allSections = await Content.find({ page: firstContent.page._id })
            .sort({ createdAt: 1 });
        
        // Get all active pages
        const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });
        
        res.render('cms/editContentManagement', {
            title: "Edit Content Management",
            subTitle: "Edit Content Management",
            content: firstContent,
            allSections: allSections,
            pages: allPages
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.redirect('/cms/content-management');
    }
});

module.exports = router;
