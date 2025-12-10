/**
 * URL Helper Utilities
 */

/**
 * Convert relative URL to absolute URL
 * @param {string} url - The URL to convert
 * @returns {string} - Absolute URL or original URL if already absolute
 */
function toAbsoluteUrl(url) {
    if (!url) return url;
    
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // If URL is relative, prepend APP_URL
    const baseUrl = process.env.APP_URL || 'http://localhost:8080';
    
    // Ensure baseUrl doesn't end with slash and url starts with slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseUrl}${cleanUrl}`;
}

/**
 * Convert multiple URLs to absolute URLs
 * @param {object} obj - Object containing URL fields
 * @param {string[]} fields - Array of field names that contain URLs
 * @returns {object} - Object with converted URLs
 */
function convertUrlsToAbsolute(obj, fields) {
    if (!obj || !fields) return obj;
    
    const converted = { ...obj };
    
    fields.forEach(field => {
        if (converted[field]) {
            converted[field] = toAbsoluteUrl(converted[field]);
        }
    });
    
    return converted;
}

module.exports = {
    toAbsoluteUrl,
    convertUrlsToAbsolute
};