const express = require('express');
const router = express.Router();
const Page = require('../../models/Page');
const Content = require('../../models/Content');
const { isAuthenticated } = require('../../middleware/auth');


router.get('/all-pages/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json([]);

    const pages = await Page.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(10)
    .select('name slug');

    res.json(pages);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Public API - Get all active pages with content (no authentication required)
router.get('/public/all', async (req, res) => {
    try {
        const pages = await Page.find({ status: 'active' })
            .select('name slug path metaTitle metaDescription metaKeywords createdAt updatedAt')
            .sort({ createdAt: -1 });
        
        // Get content for each page
        const pagesWithContent = await Promise.all(
            pages.map(async (page) => {
                const contents = await Content.find({ 
                    page: page._id, 
                    status: 'active' 
                })
                .select('title category description content thumbnail order sectionType heroSection threeColumnInfo customFields createdAt updatedAt')
                .sort({ order: 1, createdAt: -1 });
                
                return {
                    _id: page._id,
                    name: page.name,
                    slug: page.slug,
                    path: page.path,
                    metaTitle: page.metaTitle,
                    metaDescription: page.metaDescription,
                    metaKeywords: page.metaKeywords,
                    createdAt: page.createdAt,
                    updatedAt: page.updatedAt,
                    sections: contents.map(content => ({
                        _id: content._id,
                        type: content.sectionType,
                        title: content.title,
                        category: content.category,
                        description: content.description,
                        content: content.content,
                        thumbnail: content.thumbnail,
                        order: content.order,
                        heroSection: content.heroSection,
                        threeColumnInfo: content.threeColumnInfo,
                        customFields: content.customFields,
                        createdAt: content.createdAt,
                        updatedAt: content.updatedAt
                    }))
                };
            })
        );
        
        // Set proper content type and send JSON without escaping HTML
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const response = {
            success: true,
            data: pagesWithContent,
            total: pagesWithContent.length,
            timestamp: new Date().toISOString()
        };
        res.send(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error fetching public pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pages',
            error: error.message
        });
    }
});

// Public API - Get single page by slug (no authentication required)
router.get('/public/slug/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ 
            slug: req.params.slug, 
            status: 'active' 
        })
        .select('name slug path metaTitle metaDescription metaKeywords createdAt updatedAt');
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        // Get content for this page
        const contents = await Content.find({ 
            page: page._id, 
            status: 'active' 
        })
        .select('title category description content thumbnail order sectionType heroSection threeColumnInfo customFields createdAt updatedAt')
        .sort({ order: 1, createdAt: -1 });
        
        // Set proper content type and send JSON without escaping HTML
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const response = {
            success: true,
            data: {
                _id: page._id,
                name: page.name,
                slug: page.slug,
                path: page.path,
                metaTitle: page.metaTitle,
                metaDescription: page.metaDescription,
                metaKeywords: page.metaKeywords,
                createdAt: page.createdAt,
                updatedAt: page.updatedAt,
                sections: contents.map(content => ({
                    _id: content._id,
                    type: content.sectionType,
                    title: content.title,
                    category: content.category,
                    description: content.description,
                    content: content.content,
                    thumbnail: content.thumbnail,
                    order: content.order,
                    heroSection: content.heroSection,
                    threeColumnInfo: content.threeColumnInfo,
                    customFields: content.customFields,
                    createdAt: content.createdAt,
                    updatedAt: content.updatedAt
                }))
            },
            timestamp: new Date().toISOString()
        };
        res.send(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error fetching page by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching page',
            error: error.message
        });
    }
});

// Get all pages (authenticated)
router.get('/', async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { path: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pages = await Page.find(query)
            .sort({ createdAt: -1 })
            // .skip(skip)
            // .limit(parseInt(limit))
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        const total = await Page.countDocuments(query);
        
        res.json({
            success: true,
            data: pages,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pages',
            error: error.message
        });
    }
});

// Get single page by ID with sections
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching page',
            error: error.message
        });
    }
});

// Get all sections for a specific page
router.get('/:id/sections', async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        
        // Verify page exists
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        // Build query
        let query = { page: req.params.id };
        if (status !== 'all') {
            query.status = status;
        }
        
        // Get all sections for this page
        const sections = await Content.find(query)
            .select('title description content thumbnail category status order sectionType heroSection threeColumnInfo customFields callOutCards tabsSection createdAt updatedAt')
            .sort({ order: 1, createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        // Get template data if page has a template
        /* let templateData = null;
        if (page.template) {
            const { templates } = require('../../config/templates');
            const templateConfig = templates[page.template];
            if (templateConfig) {
                templateData = {
                    name: page.template,
                    displayName: templateConfig.name,
                    description: templateConfig.description,
                    previewImage: templateConfig.previewImage,
                    sectionsCount: templateConfig.sections.length,
                    sections: templateConfig.sections.map((section, index) => ({
                        order: index + 1,
                        type: section.type,
                        placeholders: section.placeholders || null,
                        hasFields: section.fields ? Object.keys(section.fields).length > 0 : false
                    }))
                };
            }
        } */

        res.json({
            success: true,
            data: {
                page: {
                    _id: page._id,
                    name: page.name,
                    slug: page.slug,
                    path: page.path,
                    template: page.template || null
                },
                // template: templateData,
                sections: sections,
                total: sections.length
            }
        });
    } catch (error) {
        console.error('Error fetching page sections:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching page sections',
            error: error.message
        });
    }
});

// Create new page
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name, path, status, metaTitle, metaDescription, metaKeywords, template } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Page name is required'
            });
        }
        
        // Check if page with same name or path already exists
        const existingPage = await Page.findOne({
            $or: [{ name }, { path }]
        });
        
        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: 'Page with this name or path already exists'
            });
        }
        
        const page = new Page({
            name,
            path: path || undefined, // Let the model auto-generate if not provided
            status: status || 'active',
            metaTitle,
            metaDescription,
            metaKeywords,
            template: template || '',
            createdBy: req.user ? req.user._id : null,
            updatedBy: req.user ? req.user._id : null
        });
        
        await page.save();
        
        // If a template is selected, auto-create sections
        if (template) {
            const { templates } = require('../../config/templates');
            const templateConfig = templates[template];
            
            if (templateConfig && templateConfig.sections) {
                const sectionsToCreate = templateConfig.sections.map((section, index) => {
                    const sectionData = {
                        page: page._id,
                        title: section.type === 'hero-section' ? 'Hero Section' : 
                               section.type === 'call-out-cards' ? 'Call Out Cards' :
                               section.type === 'tabs-section' ? 'Tabs Section' : 'Section',
                        status: 'active',
                        order: index + 1,
                        sectionType: section.type,
                        createdBy: req.user ? req.user._id : null,
                        updatedBy: req.user ? req.user._id : null
                    };
                    
                    // Map template fields to appropriate section structure
                    if (section.type === 'hero-section') {
                        // Only include CTAs that have both text and link
                        const validCtas = (section.fields.ctas || []).filter(cta => cta.text && cta.text.trim());
                        sectionData.heroSection = {
                            heading: section.fields.heading || '',
                            paragraph: section.fields.paragraph || '',
                            ctas: validCtas,
                            rightImage: section.fields.rightImage || ''
                        };
                    } else if (section.type === 'call-out-cards') {
                        // Only include cards that have a heading
                        const validCards = (section.fields.cards || []).filter(card => card.heading && card.heading.trim());
                        if (validCards.length > 0) {
                            sectionData.callOutCards = {
                                cards: validCards
                            };
                        }
                    } else if (section.type === 'tabs-section') {
                        sectionData.tabsSection = {
                            tabs: section.fields.tabs || []
                        };
                    }
                    
                    return sectionData;
                });
                
                // Create all sections
                await Content.insertMany(sectionsToCreate);
            }
        }
        
        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            data: page
        });
    } catch (error) {
        console.error('Error creating page:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating page',
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Update page
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, path, status, metaTitle, metaDescription, metaKeywords, template } = req.body;
        
        // Get the old page data before update
        const oldPage = await Page.findById(req.params.id);
        if (!oldPage) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        // Check if another page has the same name or path
        const existingPage = await Page.findOne({
            _id: { $ne: req.params.id },
            $or: [{ name }, { path }]
        });
        
        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: 'Another page with this name or path already exists'
            });
        }
        
        // Check if template is changing
        const templateChanged = template !== undefined && template !== oldPage.template;
        
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            {
                name,
                path,
                status,
                metaTitle,
                metaDescription,
                metaKeywords,
                template: template || '',
                updatedBy: req.user ? req.user._id : null
            },
            { new: true, runValidators: true }
        );

        // If template changed, recreate all sections
        if (templateChanged) {
            // Delete all existing content for this page
            await Content.deleteMany({ page: req.params.id });
            
            // Create new sections based on template
            if (template) {
                const { templates } = require('../../config/templates');
                const templateConfig = templates[template];
                
                if (templateConfig && templateConfig.sections) {
                    const sectionsToCreate = templateConfig.sections.map((section, index) => {
                        const sectionData = {
                            page: page._id,
                            title: section.type === 'hero-section' ? 'Hero Section' : 
                                   section.type === 'call-out-cards' ? 'Call Out Cards' :
                                   section.type === 'tabs-section' ? 'Tabs Section' : 'Section',
                            status: 'active',
                            order: index + 1,
                            sectionType: section.type,
                            createdBy: req.user ? req.user._id : null,
                            updatedBy: req.user ? req.user._id : null
                        };
                        
                        // Map template fields to appropriate section structure
                        if (section.type === 'hero-section') {
                            const validCtas = (section.fields.ctas || []).filter(cta => cta.text && cta.text.trim());
                            sectionData.heroSection = {
                                heading: section.fields.heading || '',
                                paragraph: section.fields.paragraph || '',
                                ctas: validCtas,
                                rightImage: section.fields.rightImage || ''
                            };
                        } else if (section.type === 'call-out-cards') {
                            const validCards = (section.fields.cards || []).filter(card => card.heading && card.heading.trim());
                            if (validCards.length > 0) {
                                sectionData.callOutCards = {
                                    cards: validCards
                                };
                            }
                        } else if (section.type === 'tabs-section') {
                            sectionData.tabsSection = {
                                tabs: section.fields.tabs || []
                            };
                        }
                        
                        return sectionData;
                    });
                    
                    // Create all sections
                    await Content.insertMany(sectionsToCreate);
                }
            }
        }
        
        // If page is deactivated, remove it from all menus
        if (status === 'inactive' && oldPage.status === 'active') {
            console.log('Page deactivated, removing from menus. Old path:', oldPage.path, 'New path:', page.path);
            const Menu = require('../../models/Menu');
            const menus = await Menu.find();
            
            let removedCount = 0;
            for (const menu of menus) {
                const originalLength = menu.items.length;
                console.log(`Checking menu: ${menu.name}, items before:`, menu.items.length);
                console.log('Menu items URLs:', menu.items.map(i => i.url));
                
                // Check both old and new paths
                menu.items = menu.items.filter(item => {
                    const matches = item.url === page.path || item.url === oldPage.path;
                    if (matches) {
                        console.log(`Removing item with URL: ${item.url} from menu: ${menu.name}`);
                    }
                    return !matches;
                });
                
                console.log(`Menu: ${menu.name}, items after:`, menu.items.length);
                
                if (menu.items.length !== originalLength) {
                    await menu.save();
                    removedCount++;
                    console.log(`Saved menu: ${menu.name}`);
                }
            }
            console.log(`Removed page from ${removedCount} menu(s)`);
        }
        
        res.json({
            success: true,
            message: 'Page updated successfully',
            data: page
        });
    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating page',
            error: error.message
        });
    }
});

// Delete page
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        console.log('Deleting page:', page.name, 'with path:', page.path);
        
        // Remove page from all menus before deleting
        const Menu = require('../../models/Menu');
        const menus = await Menu.find();
        
        let removedCount = 0;
        for (const menu of menus) {
            const originalLength = menu.items.length;
            console.log(`Checking menu: ${menu.name}, items before:`, menu.items.length);
            
            // Filter out items that match the page path
            menu.items = menu.items.filter(item => {
                const matches = item.url === page.path;
                if (matches) {
                    console.log(`Removing item with URL: ${item.url} from menu: ${menu.name}`);
                }
                return !matches;
            });
            
            console.log(`Menu: ${menu.name}, items after:`, menu.items.length);
            
            if (menu.items.length !== originalLength) {
                await menu.save();
                removedCount++;
                console.log(`Saved menu: ${menu.name}`);
            }
        }
        
        console.log(`Removed page from ${removedCount} menu(s)`);
        
        // Delete the page
        await Page.findByIdAndDelete(req.params.id);
        
        // Also delete all content associated with this page
        await Content.deleteMany({ page: req.params.id });
        
        res.json({
            success: true,
            message: `Page deleted successfully and removed from ${removedCount} menu(s)`
        });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting page',
            error: error.message
        });
    }
});

module.exports = router;
