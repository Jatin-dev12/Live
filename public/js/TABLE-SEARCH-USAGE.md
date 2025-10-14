# Table Search - Usage Guide

## Quick Start

### Method 1: Include the JS file (Recommended)

1. **Add the script to your page:**
```html
<script src="/js/table-search.js"></script>
```

2. **Add ID to your search input:**
```html
<input type="text" id="tableSearch" placeholder="Search">
```

3. **Add ID to your table:**
```html
<table id="dataTable" class="table">
    <thead>...</thead>
    <tbody>...</tbody>
</table>
```

4. **Initialize the search:**
```html
<script>
    initTableSearch('tableSearch', 'dataTable');
</script>
```

---

### Method 2: Inline Script (Copy-Paste)

Just copy this complete code block into your page:

```html
<script>
function initTableSearch(searchInputId, tableId) {
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
            // Skip "no data" rows
            if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
                return;
            }
            
            let found = false;
            const cells = row.querySelectorAll('td');
            
            cells.forEach(cell => {
                const cellText = cell.textContent.toLowerCase();
                if (cellText.includes(searchValue)) {
                    found = true;
                }
            });
            
            // Show or hide row based on search
            if (found || searchValue === '') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Initialize search
initTableSearch('tableSearch', 'dataTable');
</script>
```

---

## Multiple Tables on Same Page

If you have multiple tables, just use different IDs:

```html
<!-- Table 1 -->
<input type="text" id="searchLeads" placeholder="Search Leads">
<table id="leadsTable">...</table>

<!-- Table 2 -->
<input type="text" id="searchUsers" placeholder="Search Users">
<table id="usersTable">...</table>

<script>
    initTableSearch('searchLeads', 'leadsTable');
    initTableSearch('searchUsers', 'usersTable');
</script>
```

---

## Advanced Usage

### Search Specific Columns Only

```javascript
initTableSearchAdvanced({
    searchInputId: 'tableSearch',
    tableId: 'dataTable',
    searchColumns: [0, 1, 2], // Only search first 3 columns (0-based index)
    highlightResults: true     // Highlight matching text
});
```

---

## Complete Example

```html
<div class="card">
    <div class="card-header">
        <input type="text" id="mySearch" placeholder="Search table...">
    </div>
    <div class="card-body">
        <table id="myTable" class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>John Doe</td>
                    <td>john@example.com</td>
                    <td>Active</td>
                </tr>
                <tr>
                    <td>Jane Smith</td>
                    <td>jane@example.com</td>
                    <td>Inactive</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script src="/js/table-search.js"></script>
<script>
    initTableSearch('mySearch', 'myTable');
</script>
```

---

## Features

✅ **Case-insensitive** - Searches regardless of letter case  
✅ **Real-time** - Filters as you type  
✅ **Multi-column** - Searches across all table columns  
✅ **Lightweight** - Pure JavaScript, no dependencies  
✅ **Reusable** - Works with any table structure  
✅ **Error handling** - Validates elements exist  

---

## Troubleshooting

**Search not working?**
1. Check that IDs match exactly (case-sensitive)
2. Make sure table has `<tbody>` tag
3. Open browser console to see error messages
4. Verify script is loaded after table HTML

**Want to customize?**
- Edit the `initTableSearch` function in `/public/js/table-search.js`
- Add custom styling for hidden rows
- Modify search logic for specific needs
