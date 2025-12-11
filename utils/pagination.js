/**
 * Pagination utility functions
 */

/**
 * Get pagination limit from environment variable
 * @returns {number} Pagination limit
 */
function getPaginationLimit() {
    return parseInt(process.env.PAGINATION_LIMIT) || 10;
}

/**
 * Calculate pagination metadata
 * @param {number} currentPage - Current page number
 * @param {number} totalItems - Total number of items
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
function calculatePagination(currentPage, totalItems, limit = null) {
    if (!limit) {
        limit = getPaginationLimit();
    }
    
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (currentPage - 1) * limit;
    
    return {
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit,
        skip: skip,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextPage: currentPage + 1,
        prevPage: currentPage - 1
    };
}

/**
 * Build search query for MongoDB
 * @param {string} searchTerm - Search term
 * @param {array} fields - Fields to search in
 * @returns {object} MongoDB search query
 */
function buildSearchQuery(searchTerm, fields = []) {
    if (!searchTerm || fields.length === 0) {
        return {};
    }
    
    const searchConditions = fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
    }));
    
    return {
        $or: searchConditions
    };
}

module.exports = {
    getPaginationLimit,
    calculatePagination,
    buildSearchQuery
};