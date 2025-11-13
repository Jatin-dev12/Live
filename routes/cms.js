const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Page = require('../models/Page');
const Content = require('../models/Content');

// List all content
router.get('/content-management', isAuthenticated, async (req, res) => {
    try {
        const contents = await Content.find()
            .populate('page', 'name path')
            .sort({ createdAt: -1 });
        
        // Group content by page
        const groupedContents = {};
        contents.forEach(content => {
            const pageId = content.page ? content.page._id.toString() : 'no-page';
            if (!groupedContents[pageId]) {
                groupedContents[pageId] = {
                    page: content.page,
                    sections: [],
                    status: content.status
                };
            }
            groupedContents[pageId].sections.push(content);
        });
        
        // Convert to array
        const groupedContentsArray = Object.values(groupedContents);
        
        res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: groupedContentsArray
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: [],
            error: 'Error loading content'
        });
    }
});

// Redirect add-content-management to page master since sections are template-based
router.get('/add-content-management', isAuthenticated, (req, res) => {
    res.redirect('/page-master/web-page-master?message=Use templates to create structured pages');
});

// Show edit content form - loads all sections for a page
router.get('/edit-content-management/:pageId', isAuthenticated, async (req, res) => {
    try {
        const { pageId } = req.params;
        
        // Get page details first
        const page = await Page.findById(pageId);
        if (!page) {
            return res.render('cms/contentManagement', {
                title: "Content Management",
                subTitle: "Content Management",
                contents: [],
                error: 'Page not found'
            });
        }

        // Get all sections for this page
        const allSections = await Content.find({ page: pageId })
            .sort({ order: 1, createdAt: 1 })
            .lean();
            
        // Get all active pages for dropdown
       const allPages = await Page.find({ status: { $in: ['active', 'inactive'] } }).sort({ name: 1 });

        
        // Process each section to ensure all fields are present
        const processedSections = (allSections || []).map(section => ({
            ...section,
            _id: section._id || null,
            title: section.title || '',
            status: section.status || 'active',
            page: section.page || page._id,
            sectionType: section.sectionType || '',
            order: section.order || 1,
            customFields: {
                ...section.customFields,
                heading: section.customFields?.heading || '',
                subheading: section.customFields?.subheading || '',
                alignCenter: section.customFields?.alignCenter !== false,
                image: section.customFields?.image || ''
            },
            heroSection: {
                ...section.heroSection,
                heading: section.heroSection?.heading || '',
                paragraph: section.heroSection?.paragraph || '',
                ctas: section.heroSection?.ctas || [],
                rightImage: section.heroSection?.rightImage || ''
            },
            threeColumnInfo: {
                heading: section.threeColumnInfo?.heading || section.customFields?.heading || '',
                subheading: section.threeColumnInfo?.subheading || section.customFields?.subheading || '',
                imageOnLeft: section.threeColumnInfo?.imageOnLeft ?? section.customFields?.imageOnLeft ?? false,
                image: section.threeColumnInfo?.image || section.customFields?.image || '',
                columns: section.threeColumnInfo?.columns || []
            },
            callOutCards:{
                cards: section.callOutCards?.cards || []
            },
            tabsSection: {
                tabs: section.tabsSection?.tabs || []
            }
        }));

        // Get first section or create default
        const firstSection = processedSections.length > 0 ? processedSections[0] : {
            _id: null,
            title: '',
            status: 'active',
            page: page._id,
            sectionType: '',
            customFields: {},
            heroSection: {
                heading: '',
                paragraph: '',
                ctas: [],
                rightImage: ''
            },
            threeColumnInfo: {
                columns: []
            },
            order: 1
        };
        // console.log("---------processedSectionss",processedSections);
        
        // Prepare response data with all necessary fields
        const responseData = {
            title: "Manage Content",
            subTitle: "Manage Content",
            page: page,
            content: firstSection,
            allSections: processedSections.map(section => ({
                ...section,
                customFields: {
                    heading: section.customFields?.heading || section.customFields?.leftHeading || '',
                    leftHeading: section.customFields?.leftHeading || '',
                    subheading: section.customFields?.subheading || '',
                    alignCenter: section.customFields?.alignCenter === true,
                    image: section.customFields?.image || section.customFields?.leftImage || '',
                    imageOnLeft: section.customFields?.imageOnLeft === true,
                    rightText: section.customFields?.rightText || '',
                },
                heroSection: {
                    heading: section.heroSection?.heading || '',
                    paragraph: section.heroSection?.paragraph || '',
                    ctas: section.heroSection?.ctas || [],
                    rightImage: section.heroSection?.rightImage || ''
                },
                threeColumnInfo: {
                    ...section.threeColumnInfo,
                    heading: section.threeColumnInfo?.heading || '',
                    subheading: section.threeColumnInfo?.subheading || '',
                    imageOnLeft: section.threeColumnInfo?.imageOnLeft ?? false,
                    image: section.threeColumnInfo?.image || '',
                    columns: section.threeColumnInfo?.columns || []
                },
                callOutCards: {
                    cards: section.callOutCards?.cards || []
                },
                tabsSection: {
                    tabs: section.tabsSection?.tabs || []
                }
            })),
            pages: allPages
        };
        console.log('---------------------page',page);
        
        
        return res.render('cms/editContentManagement', responseData);
    } catch (error) {
        console.error('Error in edit content route:', error);
        return res.render('cms/contentManagement', {
            title: "Content Management",
            subTitle: "Content Management",
            contents: [],
            error: 'Error loading content: ' + error.message
        });
    }
});

module.exports = router;
