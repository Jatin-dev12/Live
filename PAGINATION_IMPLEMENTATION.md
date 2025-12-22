# Leads Management Pagination Implementation

## ✅ Features Implemented

### 1. Server-Side Pagination
- **Pagination Limit**: Uses `PAGINATION_LIMIT` from .env (default: 10)
- **Page Navigation**: Dynamic page numbers with ellipsis for large page counts
- **URL Parameters**: Page state persists in URL (`?page=2`)
- **Pagination Info**: Shows "Showing X to Y of Z entries"

### 2. Enhanced Search Functionality
- **Server-Side Search**: Searches across multiple fields:
  - Names: `fullName`, `name`, `complainantName`
  - Emails: `email`, `complainantEmail`
  - Contact: `phone`
  - Messages: `notes`, `suggestion`, `incidentDescription`, `detailedDescription`
- **Search Persistence**: Search terms persist across pagination
- **Combined Filters**: Search works with form type filtering

### 3. Form Type Filtering with Pagination
- **Filter Persistence**: Form type filter persists across pages
- **Reset to Page 1**: Changing filter resets to first page
- **Combined URLs**: Supports both filter and search in URL

### 4. Enhanced CSV Export
- **Filtered Export**: Exports only filtered/searched results
- **Smart Filename**: Includes filter and search info in filename
- **All Results**: Exports all matching results (not just current page)

## 🔧 Technical Implementation

### Backend Changes (`routes/leads.js`)
```javascript
// Added pagination utilities
const { getPaginationLimit, calculatePagination, buildSearchQuery } = require('../utils/pagination');

// Enhanced route with pagination, search, and filtering
router.get('/leads-management', isAuthenticated, async (req, res) => {
    const { formType, search } = req.query;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = getPaginationLimit(); // From PAGINATION_LIMIT env var
    
    // Build combined filter for formType and search
    // Calculate pagination metadata
    // Get paginated results
});
```

### Frontend Changes (`views/leads/leadsManagement.ejs`)
```html
<!-- Server-side search form -->
<form class="navbar-search" method="GET" action="/leads/leads-management">
    <input type="text" name="search" value="<%= search %>">
    <input type="hidden" name="formType" value="<%= currentFormType %>">
</form>

<!-- Dynamic pagination with proper URL parameters -->
<nav aria-label="Page navigation">
    <!-- Previous/Next buttons with formType and search params -->
    <!-- Dynamic page numbers with ellipsis -->
</nav>
```

## 📊 URL Structure Examples

### Basic Pagination
```
/leads/leads-management?page=2
```

### Form Type Filtering
```
/leads/leads-management?formType=contact&page=1
```

### Search with Pagination
```
/leads/leads-management?search=john&page=2
```

### Combined Filtering
```
/leads/leads-management?formType=grievance&search=incident&page=1
```

### CSV Export with Filters
```
/leads/export-csv?formType=complaint&search=ethics
```

## 🎯 Key Features

### 1. Pagination Controls
- **Previous/Next**: Disabled when not available
- **Page Numbers**: Shows current page + 2 pages on each side
- **Ellipsis**: Shows "..." for large page gaps
- **First/Last**: Always shows page 1 and last page when needed

### 2. Search Integration
- **Real-time**: Search form submits on enter or button click
- **Persistent**: Search terms maintained across pagination
- **Multi-field**: Searches across all relevant lead fields
- **Case-insensitive**: Uses MongoDB regex with 'i' flag

### 3. Filter Combination
- **Form Type + Search**: Both filters work together
- **URL Persistence**: All parameters maintained in URL
- **Reset Logic**: Changing filters resets to page 1

### 4. Performance Optimizations
- **Server-side Processing**: Pagination and search handled by MongoDB
- **Efficient Queries**: Uses skip/limit for pagination
- **Indexed Fields**: Search fields should be indexed for performance

## 🚀 Benefits

1. **Scalability**: Handles large datasets efficiently
2. **User Experience**: Fast navigation and persistent state
3. **SEO Friendly**: All states accessible via URL
4. **Export Functionality**: Exports filtered results accurately
5. **Consistent UI**: Matches existing page-master implementation

The pagination system now provides enterprise-level functionality for managing large numbers of leads while maintaining excellent performance and user experience.