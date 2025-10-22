const Menu = require('../models/Menu');

// Middleware to load menus and make them available in all views
const loadMenus = async (req, res, next) => {
    try {
        // Fetch all active menus
        const menus = await Menu.find({ isActive: true });
        
        // Create a menu object organized by location
        const menusByLocation = {};
        menus.forEach(menu => {
            menusByLocation[menu.slug] = menu.items.filter(item => item.isActive);
        });
        
        // Make menus available in all views
        res.locals.menus = menusByLocation;
        res.locals.headerMenu = menusByLocation['header-menu'] || [];
        res.locals.footerMenu = menusByLocation['footer-menu'] || [];
        
        next();
    } catch (error) {
        console.error('Error loading menus:', error);
        res.locals.menus = {};
        res.locals.headerMenu = [];
        res.locals.footerMenu = [];
        next();
    }
};

module.exports = { loadMenus };
