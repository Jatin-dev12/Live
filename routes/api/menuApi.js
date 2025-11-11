const express = require('express');
const router = express.Router();
const Menu = require('../../models/Menu');
const Page = require('../../models/Page');
const { isAuthenticated } = require('../../middleware/auth');

// Get all menus with hierarchical structure (PUBLIC for testing)
router.get('/',async (req, res) => {
    try {
        const menus = await Menu.find().sort({ createdAt: -1 });
        
        // Transform menus to include hierarchical structure with submenu names
        const menusWithHierarchy = menus.map(menu => {
            const menuObj = menu.toObject();
            const hierarchicalItems = buildMenuHierarchy(menuObj.items);
            
            return {
                ...menuObj,
                items: hierarchicalItems,
                // Add a formatted structure for easy display
                structure: formatMenuStructure(hierarchicalItems)
            };
        });
        
        res.json({ success: true, menus: menusWithHierarchy });
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ success: false, message: 'Error fetching menus' });
    }
});

// Helper function to build menu hierarchy
function buildMenuHierarchy(items) {
    const itemMap = {};
    const rootItems = [];
    
    // Create a map of all items with normalized IDs
    items.forEach(item => {
        const itemObj = item.toObject ? item.toObject() : item;
        const itemId = item._id.toString();
        
        // Normalize the item object - ensure _id and parentId are strings
        const normalizedItem = {
            ...itemObj,
            _id: itemId,
            parentId: itemObj.parentId ? itemObj.parentId.toString() : null,
            submenus: []
        };
        
        itemMap[itemId] = normalizedItem;
    });
    
    // Build the hierarchy
    items.forEach(item => {
        const itemId = item._id.toString();
        const parentId = item.parentId ? item.parentId.toString() : null;
        
        if (parentId && itemMap[parentId]) {
            // Add to parent's submenus
            itemMap[parentId].submenus.push(itemMap[itemId]);
        } else {
            // Root level item
            rootItems.push(itemMap[itemId]);
        }
    });
    
    return rootItems;
}

// Helper function to format menu structure for display
function formatMenuStructure(items, level = 0) {
    let structure = [];
    
    items.forEach(item => {
        structure.push({
            title: item.title,
            url: item.url,
            level: level,
            hasSubmenus: item.submenus && item.submenus.length > 0,
            submenuCount: item.submenus ? item.submenus.length : 0
        });
        
        if (item.submenus && item.submenus.length > 0) {
            structure = structure.concat(formatMenuStructure(item.submenus, level + 1));
        }
    });
    
    return structure;
}

// Get menu by slug with hierarchical structure
router.get('/:slug', isAuthenticated, async (req, res) => {
    try {
        const menu = await Menu.findOne({ slug: req.params.slug });
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }
        
        // Get menu object
        const menuObj = menu.toObject();
        
        console.log('=== API: Creating flatItems ===');
        console.log('Raw items from DB:', menuObj.items.length);
        
        // Return BOTH flat and hierarchical structures
        // Flat structure for editing, hierarchical for display
        const flatItems = menuObj.items.map((item, index) => {
            const flatItem = {
                ...item,
                _id: item._id.toString(),
                parentId: item.parentId ? item.parentId.toString() : null
            };
            console.log(`[${index}] ${item.title}: _id="${flatItem._id}", parentId="${flatItem.parentId}"`);
            return flatItem;
        });
        
        console.log('===============================');
        
        const hierarchicalItems = buildMenuHierarchy(menuObj.items);
        
        res.json({ 
            success: true, 
            menu: {
                ...menuObj,
                items: hierarchicalItems, // Hierarchical for display
                flatItems: flatItems, // Flat for editing
                structure: formatMenuStructure(hierarchicalItems)
            }
        });
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
