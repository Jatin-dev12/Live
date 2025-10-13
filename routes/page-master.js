const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Page = require('../models/Page');
const Content = require('../models/Content');

// List all pages
router.get('/web-page-master', isAuthenticated, async (req, res) => {
    try {
        const pages = await Page.find().sort({ createdAt: -1 });
        res.render('page-master/websitePageMaster', {
            title: "Website Page Master",
            subTitle: "Website Page Master",
            pages: pages
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.render('page-master/websitePageMaster', {
            title: "Website Page Master",
            subTitle: "Website Page Master",
            pages: [],
            error: 'Error loading pages'
        });
    }
});

// Show add page form
router.get('/add-page', isAuthenticated, (req, res) => {
    res.render('page-master/addPageMaster', {
        title: "Add Page",
        subTitle: "Add Page"
    });
});

// Show edit page form
router.get('/edit-page/:id', isAuthenticated, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.redirect('/page-master/web-page-master');
        }
        res.render('page-master/editPageMaster', {
            title: "Edit Page",
            subTitle: "Edit Page",
            page: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.redirect('/page-master/web-page-master');
    }
});

module.exports = router;
