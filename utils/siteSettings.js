const SiteSettings = require('../models/SiteSettings');

// Cache settings to avoid repeated database queries
let cachedSettings = null;
let lastFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get site settings with caching (excludes sensitive SMTP data by default)
 */
async function getSiteSettings(forceRefresh = false, includeSensitive = false) {
    const now = Date.now();
    
    // Return cached settings if available and not expired
    if (!forceRefresh && cachedSettings && lastFetch && (now - lastFetch < CACHE_DURATION)) {
        return cachedSettings;
    }
    
    try {
        let query = SiteSettings.findOne();
        
        // Only include SMTP if explicitly requested (for admin/backend use)
        if (includeSensitive) {
            query = query.select('+smtp.host +smtp.port +smtp.secure +smtp.username +smtp.password +smtp.fromEmail +smtp.fromName');
        }
        
        let settings = await query;
        
        // Create default settings if none exist
        if (!settings) {
            settings = new SiteSettings();
            await settings.save();
        }
        
        cachedSettings = settings;
        lastFetch = now;
        
        return settings;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return cachedSettings || {}; // Return cached or empty object
    }
}

/**
 * Get social media links
 */
async function getSocialMediaLinks() {
    const settings = await getSiteSettings();
    return settings.socialMedia || {};
}

/**
 * Get SMTP configuration (includes sensitive data - use only in backend)
 */
async function getSmtpConfig() {
    try {
        // Explicitly select SMTP fields since they're marked as select: false
        const settings = await SiteSettings.findOne().select('+smtp.host +smtp.port +smtp.secure +smtp.username +smtp.password +smtp.fromEmail +smtp.fromName');
        return settings?.smtp || {};
    } catch (error) {
        console.error('Error fetching SMTP config:', error);
        return {};
    }
}

/**
 * Clear settings cache (call this after updating settings)
 */
function clearCache() {
    cachedSettings = null;
    lastFetch = null;
}

module.exports = {
    getSiteSettings,
    getSocialMediaLinks,
    getSmtpConfig,
    clearCache
};
