# Page Dropdown Filter Fix

## Problem
In the "Add Content Management" page, all pages were showing in the dropdown, even if they already had content assigned. This could lead to confusion about which pages need content.

## Solution
Modified the add content route to filter out pages that already have content, so only pages without content are shown in the dropdown.

## Changes Made

### Updated `routes/cms.js`
Modified the `/add-content-management` route to:
1. Fetch all active pages
2. Get a list of page IDs that already have content using `Content.distinct('page')`
3. Filter out pages that already have content
4. Only show available pages (without content) in the dropdown

## How It Works

### Before:
- Dropdown showed: Home, About Us, Contact Us, Services, etc.
- Even if Home already had content, it would still appear

### After:
- If Home has content → Not shown in dropdown
- If About Us has no content → Shown in dropdown
- Only pages without any content sections are available for selection

## Code Logic:
```javascript
// Get all active pages
const allPages = await Page.find({ status: 'active' }).sort({ name: 1 });

// Get pages that already have content
const pagesWithContent = await Content.distinct('page');

// Filter out pages that already have content
const availablePages = allPages.filter(page => 
    !pagesWithContent.some(contentPageId => contentPageId.toString() === page._id.toString())
);
```

## User Experience:
1. User goes to "Add Content Management"
2. Dropdown only shows pages that don't have content yet
3. User selects a page and adds content
4. After saving, that page won't appear in the dropdown anymore
5. To add more content to an existing page, use "Edit Content Management"

## Note:
- This prevents duplicate content creation for pages
- Each page can only have one set of content sections
- To modify existing content, use the Edit function from the Content Management list
