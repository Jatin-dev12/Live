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
        
        res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: contents
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
        const pages = await Page.find({ status: 'active' }).sort({ name: 1 });
        res.render('cms/addContentManagement', {
            title: "Add Content Management",
            subTitle: "Add Content Management",
            pages: pages
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

// Show edit content form
router.get('/edit-content-management/:id', isAuthenticated, async (req, res) => {
    try {
        const content = await Content.findById(req.params.id).populate('page');
        const pages = await Page.find({ status: 'active' }).sort({ name: 1 });
        
        if (!content) {
            return res.redirect('/cms/content-management');
        }
        
        res.render('cms/editContentManagement', {
            title: "Edit Content Management",
            subTitle: "Edit Content Management",
            content: content,
            pages: pages
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.redirect('/cms/content-management');
    }
});

module.exports = router;
