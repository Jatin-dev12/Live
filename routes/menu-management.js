const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Menu = require('../models/Menu');
const Page = require('../models/Page');

router.get('/nav-menus', isAuthenticated, async (req, res) => {
    try {
        // Fetch all menus
        const menus = await Menu.find().sort({ createdAt: -1 });
        
        // Fetch all active pages for menu selection
        const pages = await Page.find({ status: 'active' })
            .select('name slug path')
            .sort({ name: 1 });

        res.render('menu-management/menuMaster', {
            title: "Menu Management",
            subTitle: "Menu Management",
            menus,
            pages
        });
    } catch (error) {
        console.error('Error loading menu management:', error);
        res.render('menu-management/menuMaster', {
            title: "Menu Management",
            subTitle: "Menu Management",
            menus: [],
            pages: []
        });
    }
});

module.exports = router;
