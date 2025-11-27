const express = require('express');
const router = express.Router();
const Page = require('../../models/Page');
const Content = require('../../models/Content');
const SEO = require('../../models/SEO');
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
            .select('name slug path template metaTitle metaDescription metaKeywords createdAt updatedAt')
            .sort({ createdAt: -1 });
        
        // Get community pages data once for all membership template pages
        const communityPages = await Page.find({
            category: 'community',
            status: 'active'
        })
        .select('name slug path')
        .sort({ name: 1 });
        
        const communityGroupsData = await Promise.all(
            communityPages.map(async (communityPage) => {
                const heroContent = await Content.findOne({
                    page: communityPage._id,
                    sectionType: 'hero-section',
                    status: 'active'
                })
                .select('heroSection');
                
                return {
                    _id: communityPage._id,
                    name: communityPage.name,
                    slug: communityPage.slug,
                    path: communityPage.path,
                    heroImage: heroContent?.heroSection?.image || null
                };
            })
        );
        
        // Get content for each page
        const pagesWithContent = await Promise.all(
            pages.map(async (page) => {
                const contents = await Content.find({ 
                    page: page._id, 
                    status: 'active' 
                })
                .select('title category description content thumbnail order sectionType heroSection threeColumnInfo callOutCards communityGroups customFields createdAt updatedAt')
                .sort({ order: 1, createdAt: -1 });
                
                const pageData = {
                    _id: page._id,
                    name: page.name,
                    slug: page.slug,
                    path: page.path,
                    template: page.template,
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
                        callOutCards: content.callOutCards,
                        communityGroups: content.communityGroups,
                        customFields: content.customFields,
                        createdAt: content.createdAt,
                        updatedAt: content.updatedAt
                    }))
                };
                
                // Add community groups data if this is a membership template page
                if (page.template === 'membership') {
                    pageData.communityGroups = communityGroupsData;
                }
                
                // Get SEO data for this page
                const seoData = await SEO.findOne({
                    page: page._id,
                    status: 'active'
                })
                .select('metaTitle metaDescription metaKeywords canonicalUrl ogMetaTags ogImage ogImagePath robots createdAt updatedAt');
                
                // Add SEO data if available
                if (seoData) {
                    pageData.seo = {
                        metaTitle: seoData.metaTitle,
                        metaDescription: seoData.metaDescription,
                        metaKeywords: seoData.metaKeywords,
                        canonicalUrl: seoData.canonicalUrl,
                        ogMetaTags: seoData.ogMetaTags,
                        ogImage: seoData.ogImage,
                        ogImagePath: seoData.ogImagePath,
                        robots: seoData.robots,
                        createdAt: seoData.createdAt,
                        updatedAt: seoData.updatedAt
                    };
                }
                
                return pageData;
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
        .select('name slug path template metaTitle metaDescription metaKeywords createdAt updatedAt');
        
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
        .select('title category description content thumbnail order sectionType heroSection threeColumnInfo callOutCards customFields communityGroups createdAt updatedAt')
        .sort({ order: 1, createdAt: -1 });
        
        // If this is a membership template page, get community groups data
        let communityGroups = null;
        if (page.template === 'membership') {
            // Get all active pages with community category
            const communityPages = await Page.find({
                category: 'community',
                status: 'active'
            })
            .select('name slug path')
            .sort({ name: 1 });
            
            // For each community page, get its hero section image
            const communityGroupsData = await Promise.all(
                communityPages.map(async (communityPage) => {
                    // Get hero section content for this page
                    const heroContent = await Content.findOne({
                        page: communityPage._id,
                        sectionType: 'hero-section',
                        status: 'active'
                    })
                    .select('heroSection');
                    
                    return {
                        _id: communityPage._id,
                        name: communityPage.name,
                        slug: communityPage.slug,
                        path: communityPage.path,
                        heroImage: heroContent?.heroSection?.image || null
                    };
                })
            );
            
            communityGroups = communityGroupsData;
        }
        
        // Get SEO data for this page
        const seoData = await SEO.findOne({
            page: page._id,
            status: 'active'
        })
        .select('metaTitle metaDescription metaKeywords canonicalUrl ogMetaTags ogImage ogImagePath robots createdAt updatedAt');
        
        // Set proper content type and send JSON without escaping HTML
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const response = {
            success: true,
            data: {
                _id: page._id,
                name: page.name,
                slug: page.slug,
                path: page.path,
                template: page.template,
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
                    callOutCards: content.callOutCards,
                    communityGroups: content.communityGroups,
                    customFields: content.customFields,
                    createdAt: content.createdAt,
                    updatedAt: content.updatedAt
                })),
                ...(communityGroups && { communityGroups: communityGroups }),
                ...(seoData && { 
                    seo: {
                        metaTitle: seoData.metaTitle,
                        metaDescription: seoData.metaDescription,
                        metaKeywords: seoData.metaKeywords,
                        canonicalUrl: seoData.canonicalUrl,
                        ogMetaTags: seoData.ogMetaTags,
                        ogImage: seoData.ogImage,
                        ogImagePath: seoData.ogImagePath,
                        robots: seoData.robots,
                        createdAt: seoData.createdAt,
                        updatedAt: seoData.updatedAt
                    }
                })
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
            .select('title description content thumbnail category status order sectionType heroSection threeColumnInfo customFields callOutCards tabsSection communityGroups createdAt updatedAt')
            .sort({ order: 1, createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('communityGroups.selectedPages.page', 'name _id slug');
        
        // Add hero images to community groups selected pages
        const sectionsWithHeroImages = await Promise.all(
            sections.map(async (section) => {
                if (section.sectionType === 'community-groups' && section.communityGroups?.selectedPages) {
                    // Get hero images for each selected page
                    const selectedPagesWithHeroImages = await Promise.all(
                        section.communityGroups.selectedPages.map(async (selectedPage) => {
                            if (selectedPage.page) {
                                // Find hero section content for this page
                                const heroContent = await Content.findOne({
                                    page: selectedPage.page._id,
                                    sectionType: 'hero-section',
                                    status: 'active'
                                }).select('heroSection');
                                
                                return {
                                    ...selectedPage.toObject(),
                                    page: {
                                        ...selectedPage.page.toObject(),
                                        heroImage: process.env.APP_URL+heroContent?.heroSection?.image || null
                                    }
                                };
                            }
                            return selectedPage;
                        })
                    );
                    
                    // Update the section with hero images
                    const sectionObj = section.toObject();
                    sectionObj.communityGroups.selectedPages = selectedPagesWithHeroImages;
                    return sectionObj;
                }
                return section.toObject();
            })
        );
        
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
                sections: sectionsWithHeroImages,
                total: sectionsWithHeroImages.length
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
        const { name, path, status, metaTitle, metaDescription, metaKeywords, template, category } = req.body;
        
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
            category: category || '',
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
                            image: section.fields.image || ''
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
        const { name, path, status, metaTitle, metaDescription, metaKeywords, template, category } = req.body;
        
        // Get the old page data before update
        const oldPage = await Page.findById(req.params.id);
        if (!oldPage) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }
        
        // Prevent status change for home page
        if (oldPage.path === '/' && status && status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Home page status cannot be changed to draft'
            });
        }
        
        // Generate slug from name if name is being updated
        let slug = oldPage.slug;
        if (name && name !== oldPage.name) {
            slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        
        // Check if another page has the same name, slug, or path
        const existingPage = await Page.findOne({
            _id: { $ne: req.params.id },
            $or: [
                { name }, 
                { slug },
                { path }
            ]
        });
        
        if (existingPage) {
            let conflictField = 'name or path';
            if (existingPage.slug === slug) {
                conflictField = `slug "${slug}"`;
            } else if (existingPage.name === name) {
                conflictField = `name "${name}"`;
            } else if (existingPage.path === path) {
                conflictField = `path "${path}"`;
            }
            
            return res.status(400).json({
                success: false,
                message: `Another page with this ${conflictField} already exists`,
                existingPage: {
                    name: existingPage.name,
                    slug: existingPage.slug,
                    path: existingPage.path,
                    status: existingPage.status,
                    id: existingPage._id
                }
            });
        }
        
        // Check if template is changing
        const templateChanged = template !== undefined && template !== oldPage.template;
        
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            {
                name,
                slug,
                path,
                status,
                metaTitle,
                metaDescription,
                metaKeywords,
                template: template || '',
                category: category || '',
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
                                image: section.fields.image || ''
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
        
        // Prevent deletion of home page
        if (page.path === '/') {
            return res.status(403).json({
                success: false,
                message: 'Home page cannot be deleted'
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

// Get pages by category
router.get('/by-category/:category', isAuthenticated, async (req, res) => {
    try {
        const { category } = req.params;
        
        const pages = await Page.find({ 
            category: category,
            status: 'active'
        })
        .select('_id name slug path category')
        .sort({ name: 1 });
        
        res.json({
            success: true,
            data: pages
        });
    } catch (error) {
        console.error('Error fetching pages by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pages',
            error: error.message
        });
    }
});

// Test endpoint to get community groups data
router.get('/test/community-groups', async (req, res) => {
    try {
        // Get all active pages with community category
        const communityPages = await Page.find({
            category: 'community',
            status: 'active'
        })
        .select('name slug path')
        .sort({ name: 1 });
        
        // For each community page, get its hero section image
        const communityGroupsData = await Promise.all(
            communityPages.map(async (communityPage) => {
                // Get hero section content for this page
                const heroContent = await Content.findOne({
                    page: communityPage._id,
                    sectionType: 'hero-section',
                    status: 'active'
                })
                .select('heroSection');
                
                return {
                    _id: communityPage._id,
                    name: communityPage.name,
                    slug: communityPage.slug,
                    path: communityPage.path,
                    heroImage: heroContent?.heroSection?.image || null
                };
            })
        );
        
        res.json({
            success: true,
            data: communityGroupsData,
            total: communityGroupsData.length
        });
    } catch (error) {
        console.error('Error fetching community groups:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching community groups',
            error: error.message
        });
    }
});

module.exports = router;
