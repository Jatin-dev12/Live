const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Ad = require('../models/Ad');
const AdPlacement = require('../models/AdPlacement');

// Ads Management Page
router.get('/ads-management', isAuthenticated, async (req, res) => {
    try {
        const ads = await Ad.find()
            .populate('placement_id', 'placementId name pageLocation')
            .populate('created_by', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        const placements = await AdPlacement.find({ isActive: true })
            .select('placementId name')
            .lean();
        
        res.render('ads/adsManagement', {
            title: "Ads Management",
            subTitle: "Manage Advertisements",
            ads: ads,
            placements: placements
        });
    } catch (error) {
        console.error('Error loading ads:', error);
        res.render('ads/adsManagement', {
            title: "Ads Management",
            subTitle: "Manage Advertisements",
            ads: [],
            placements: []
        });
    }
});

// Add Ad Page
router.get('/add-ad', isAuthenticated, async (req, res) => {
    try {
        const placements = await AdPlacement.find({ isActive: true })
            .select('_id placementId name pageLocation dimensions')
            .lean();
        
        // Fetch pages from Page Master
        const PageMaster = require('../models/PageMaster');
        const pages = await PageMaster.find({ isActive: true })
            .select('_id pageName slug')
            .sort({ pageName: 1 })
            .lean();
        
        res.render('ads/addAd', {
            title: "Add Advertisement",
            subTitle: "Create New Ad",
            placements: placements,
            pages: pages
        });
    } catch (error) {
        console.error('Error loading add ad page:', error);
        res.render('ads/addAd', {
            title: "Add Advertisement",
            subTitle: "Create New Ad",
            placements: [],
            pages: []
        });
    }
});

// Edit Ad Page
router.get('/edit-ad/:id', isAuthenticated, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id)
            .populate('placement_id')
            .populate('created_by', 'fullName email');
        
        if (!ad) {
            return res.redirect('/ads/ads-management');
        }
        
        const placements = await AdPlacement.find({ isActive: true })
            .select('_id placementId name pageLocation dimensions')
            .lean();
        
        // Fetch pages from Page Master
        const PageMaster = require('../models/PageMaster');
        const pages = await PageMaster.find({ isActive: true })
            .select('_id pageName slug')
            .sort({ pageName: 1 })
            .lean();
        
        res.render('ads/editAd', {
            title: "Edit Advertisement",
            subTitle: "Update Ad Details",
            ad: ad,
            placements: placements,
            pages: pages
        });
    } catch (error) {
        console.error('Error loading edit ad page:', error);
        res.redirect('/ads/ads-management');
    }
});

// Ad Placements Management Page
router.get('/placements', isAuthenticated, async (req, res) => {
    try {
        const placements = await AdPlacement.find()
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.render('ads/adPlacements', {
            title: "Ad Placements",
            subTitle: "Manage Ad Placements",
            placements: placements
        });
    } catch (error) {
        console.error('Error loading placements:', error);
        res.render('ads/adPlacements', {
            title: "Ad Placements",
            subTitle: "Manage Ad Placements",
            placements: []
        });
    }
});

module.exports = router;
