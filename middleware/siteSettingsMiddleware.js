const { getSiteSettings } = require('../utils/siteSettings');

/**
 * Middleware to load site settings and make them available in all views
 */
async function loadSiteSettings(req, res, next) {
    try {
        const settings = await getSiteSettings();
        res.locals.siteSettings = settings;
        next();
    } catch (error) {
        console.error('Error loading site settings middleware:', error);
        res.locals.siteSettings = null;
        next();
    }
}

module.exports = { loadSiteSettings };
