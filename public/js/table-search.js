/**
 * ==========================================
 * REUSABLE TABLE SEARCH FUNCTION
 * ==========================================
 * 
 * This function provides real-time search functionality for any HTML table.
 * It searches across all columns and shows/hides rows based on the search term.
 * 
 * @param {string} searchInputId - The ID of the search input element
 * @param {string} tableId - The ID of the table element
 * 
 * USAGE EXAMPLE:
 * --------------
 * 1. Add ID to your search input:
 *    <input type="text" id="tableSearch" placeholder="Search">
 * 
 * 2. Add ID to your table:
 *    <table id="dataTable">...</table>
 * 
 * 3. Call the function:
 *    initTableSearch('tableSearch', 'dataTable');
 * 
 * FEATURES:
 * ---------
 * - Case-insensitive search
 * - Searches across all columns
 * - Real-time filtering as you type
 * - Handles empty rows gracefully
 * - Works with any table structure
 */

function initTableSearch(searchInputId, tableId) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    
    // Validate elements exist
    if (!searchInput) {
        console.error(`Search input with ID "${searchInputId}" not found`);
        return;
    }
    
    if (!table) {
        console.error(`Table with ID "${tableId}" not found`);
        return;
    }
    
    // Add event listener for search
    searchInput.addEventListener('keyup', function() {
        const searchValue = this.value.toLowerCase().trim();
        const tbody = table.querySelector('tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            // Skip "no data" or empty state rows (rows with single cell spanning multiple columns)
            if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
                return;
            }
            
            let found = false;
            const cells = row.querySelectorAll('td');
            
            // Search through all cells in the row
            cells.forEach(cell => {
                const cellText = cell.textContent.toLowerCase();
                if (cellText.includes(searchValue)) {
                    found = true;
                }
            });
            
            // Show or hide row based on search result
            if (found || searchValue === '') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Optional: Show "No results found" message
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
        if (visibleRows.length === 0 && searchValue !== '') {
            // You can add custom "no results" handling here if needed
            console.log('No matching results found');
        }
    });
    
    console.log(`Table search initialized for table: ${tableId}`);
}

/**
 * ALTERNATIVE: Initialize search with custom options
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.searchInputId - The ID of the search input
 * @param {string} options.tableId - The ID of the table
 * @param {Array<number>} options.searchColumns - Optional: Array of column indices to search (0-based)
 * @param {boolean} options.highlightResults - Optional: Highlight matching text
 */
function initTableSearchAdvanced(options) {
    const { searchInputId, tableId, searchColumns = null, highlightResults = false } = options;
    
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    
    if (!searchInput || !table) {
        console.error('Search input or table not found');
        return;
    }
    
    searchInput.addEventListener('keyup', function() {
        const searchValue = this.value.toLowerCase().trim();
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
                return;
            }
            
            let found = false;
            const cells = row.querySelectorAll('td');
            
            cells.forEach((cell, index) => {
                // If searchColumns is specified, only search those columns
                if (searchColumns && !searchColumns.includes(index)) {
                    return;
                }
                
                const cellText = cell.textContent.toLowerCase();
                if (cellText.includes(searchValue)) {
                    found = true;
                    
                    // Optional: Highlight matching text
                    if (highlightResults && searchValue !== '') {
                        const regex = new RegExp(`(${searchValue})`, 'gi');
                        const originalText = cell.textContent;
                        cell.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
                    }
                } else if (highlightResults) {
                    // Remove highlights if not matching
                    cell.innerHTML = cell.textContent;
                }
            });
            
            row.style.display = found || searchValue === '' ? '' : 'none';
        });
    });
}

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTableSearch, initTableSearchAdvanced };
}
