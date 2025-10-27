const UrlRedirect = require('../models/UrlRedirect');

/**
 * Middleware to handle URL redirects
 * This should be placed early in the middleware chain
 */
async function handleUrlRedirect(req, res, next) {
    try {
        // Skip for API routes, static files, and admin routes
        if (req.path.startsWith('/api/') || 
            req.path.startsWith('/js/') || 
            req.path.startsWith('/css/') || 
            req.path.startsWith('/images/') ||
            req.path.startsWith('/uploads/') ||
            req.path.startsWith('/authentication/') ||
            req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            return next();
        }
        
        // Get the full path including query string
        const fullPath = req.path;
        
        // Look for matching redirect
        const redirect = await UrlRedirect.findOne({
            oldUrl: fullPath,
            isActive: true
        });
        
        if (redirect) {
            // Update hit count and last accessed
            redirect.hitCount += 1;
            redirect.lastAccessed = new Date();
            await redirect.save();
            
            // Perform redirect
            return res.redirect(redirect.redirectType, redirect.newUrl);
        }
        
        // No redirect found, continue to next middleware
        next();
    } catch (error) {
        console.error('Error in URL redirect middleware:', error);
        // Don't break the app, just continue
        next();
    }
}

module.exports = handleUrlRedirect;
