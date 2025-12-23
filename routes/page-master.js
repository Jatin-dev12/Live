const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Page = require('../models/Page');
const Content = require('../models/Content');
const { getPaginationLimit, calculatePagination, buildSearchQuery } = require('../utils/pagination');

// List all pages with search and pagination
router.get('/web-page-master', isAuthenticated, async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const limit = getPaginationLimit();

        // Build search query using utility function
        const searchQuery = buildSearchQuery(search, ['name', 'path', 'slug']);

        // Add status filter if provided
        if (statusFilter && ['active', 'inactive'].includes(statusFilter)) {
            searchQuery.status = statusFilter;
        }

        // Get total count for pagination
        const totalItems = await Page.countDocuments(searchQuery);
        
        // Calculate pagination metadata
        const pagination = calculatePagination(currentPage, totalItems, limit);

        // Get pages with pagination
        const pages = await Page.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(pagination.skip)
            .limit(pagination.limit);

        res.render('page-master/websitePageMaster', {
            title: "Website Page Master",
            subTitle: "Website Page Master",
            pages: pages,
            frontendUrl: process.env.FRONTEND_URL,
            pagination: pagination,
            search: search,
            statusFilter: statusFilter
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.render('page-master/websitePageMaster', {
            title: "Website Page Master",
            subTitle: "Website Page Master",
            pages: [],
            frontendUrl: process.env.FRONTEND_URL,
            pagination: calculatePagination(1, 0),
            search: '',
            statusFilter: '',
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
