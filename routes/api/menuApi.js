const express = require('express');
const router = express.Router();
const Menu = require('../../models/Menu');
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');

// Get all menus
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const menus = await Menu.find().sort({ createdAt: -1 });
        res.json({ success: true, menus });
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ success: false, message: 'Error fetching menus' });
    }
});

// Get menu by slug
router.get('/:slug', isAuthenticated, async (req, res) => {
    try {
        const menu = await Menu.findOne({ slug: req.params.slug });
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }
        res.json({ success: true, menu });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, message: 'Error fetching menu' });
    }
});

// Get all pages for menu selection
router.get('/pages/all', isAuthenticated, async (req, res) => {
    try {
        const pages = await Page.find({ isActive: true })
            .select('title slug url')
            .sort({ title: 1 });
        res.json({ success: true, pages });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ success: false, message: 'Error fetching pages' });
    }
});

// Create new menu
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name, slug, location, items } = req.body;

        // Check if menu with same slug exists
        const existingMenu = await Menu.findOne({ slug });
        if (existingMenu) {
            return res.status(400).json({ success: false, message: 'Menu with this slug already exists' });
        }

        const menu = new Menu({
            name,
            slug,
            location,
            items: items || [],
            createdBy: req.session.userId
        });

        await menu.save();
        res.json({ success: true, message: 'Menu created successfully', menu });
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ success: false, message: 'Error creating menu' });
    }
});

// Update menu
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, location, items } = req.body;

        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        menu.name = name || menu.name;
        menu.location = location || menu.location;
        menu.items = items || menu.items;
        menu.updatedBy = req.session.userId;

        await menu.save();
        res.json({ success: true, message: 'Menu updated successfully', menu });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ success: false, message: 'Error updating menu' });
    }
});

// Delete menu
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const menu = await Menu.findByIdAndDelete(req.params.id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }
        res.json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ success: false, message: 'Error deleting menu' });
    }
});

module.exports = router;
