const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// URL Redirect Management Page
router.get('/url-redirects', isAuthenticated, async (req, res) => {
    try {
        const UrlRedirect = require('../models/UrlRedirect');
        const redirects = await UrlRedirect.find()
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.render('url-redirect/urlRedirects', {
            title: "URL Redirect Management",
            subTitle: "Manage URL Redirects",
            redirects: redirects
        });
    } catch (error) {
        console.error('Error loading URL redirects:', error);
        res.render('url-redirect/urlRedirects', {
            title: "URL Redirect Management",
            subTitle: "Manage URL Redirects",
            redirects: []
        });
    }
});

// Add URL Redirect Page
router.get('/add-redirect', isAuthenticated, (req, res) => {
    res.render('url-redirect/addRedirect', {
        title: "Add URL Redirect",
        subTitle: "Create New Redirect",
        frontendUrl: process.env.FRONTEND_URL
    });
});

// Edit URL Redirect Page
router.get('/edit-redirect/:id', isAuthenticated, async (req, res) => {
    try {
        const UrlRedirect = require('../models/UrlRedirect');
        const redirect = await UrlRedirect.findById(req.params.id)
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');
        
        if (!redirect) {
            return res.redirect('/url-redirect/url-redirects');
        }
        
        res.render('url-redirect/editRedirect', {
            title: "Edit URL Redirect",
            subTitle: "Update Redirect",
            redirect: redirect
        });
    } catch (error) {
        console.error('Error loading redirect:', error);
        res.redirect('/url-redirect/url-redirects');
    }
});

module.exports = router;
