# SEO Open Graph Meta Tags Update

## Overview
The SEO module has been updated to replace the separate OG Title and OG Description fields with a single rich text editor (Quill) for Open Graph meta tags. This provides more flexibility for admins to add multiple Open Graph properties.

## Changes Made

### 1. Database Model (`models/Seo.js`)
- **Removed fields:**
  - `ogTitle` (String, max 60 characters)
  - `ogDescription` (String, max 160 characters)

- **Added field:**
  - `ogMetaTags` (String, no length limit) - Stores rich text HTML content

### 2. API Routes (`routes/api/seoApi.js`)
- Updated POST `/api/seo` endpoint to accept `ogMetaTags` instead of `ogTitle` and `ogDescription`
- Updated PUT `/api/seo/:id` endpoint to handle `ogMetaTags` field
- All other endpoints remain unchanged

### 3. View Files
#### Add SEO Form (`views/seo/addSeoContent.ejs`)
- Replaced OG Title and OG Description input fields with a Quill rich text editor
- Added Quill editor initialization with basic formatting toolbar
- Updated form submission to capture Quill editor content

#### Edit SEO Form (`views/seo/editSeoContent.ejs`)
- Replaced OG Title and OG Description input fields with a Quill rich text editor
- Added logic to load existing `ogMetaTags` content into the editor
- Updated form submission to capture Quill editor content

## Features

### Rich Text Editor
The new OG Meta Tags editor includes:
- Bold, italic, and underline formatting
- Link insertion
- Ordered and bulleted lists
- Clean formatting option
- 200px height for comfortable editing

### Flexibility
Admins can now add multiple Open Graph properties such as:
- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:site_name`
- `og:locale`
- And any other custom OG properties

## Migration

### For Existing Data
A migration script is provided at `scripts/migrate-seo-og-fields.js` to convert existing SEO records.

**To run the migration:**
```bash
node scripts/migrate-seo-og-fields.js
```

The script will:
1. Find all SEO records with `ogTitle` or `ogDescription`
2. Convert them to formatted HTML in the `ogMetaTags` field
3. Optionally remove the old fields (uncomment the lines in the script)

### Manual Migration
If you prefer to migrate manually:
1. Open each SEO record in the admin panel
2. Copy the OG Title and OG Description values
3. Paste them into the new OG Meta Tags editor
4. Format as needed
5. Save the record

## Usage Guide

### Adding Open Graph Meta Tags
1. Navigate to SEO Management
2. Create or edit an SEO record
3. Scroll to the "Open Graph (Social Media)" section
4. Use the rich text editor to add your meta tags
5. Format the content as needed (bold, lists, etc.)
6. Save the record

### Example Content Format
```
og:title
Your Page Title Here

og:description
Your page description that will appear when shared on social media.

og:type
website

og:url
https://example.com/your-page
```

## Technical Notes

### Editor Library
- Uses Quill.js (already included in the project)
- Initialized with the 'snow' theme
- Basic toolbar configuration for formatting

### Data Storage
- Content is stored as HTML in the database
- No character limits (unlike the previous fields)
- Supports rich formatting

### Backward Compatibility
- The migration script ensures existing data is preserved
- Old fields can be kept in the database if needed
- No breaking changes to other parts of the system

## Future Enhancements

Potential improvements for future versions:
1. Add a preview of how the OG tags will appear on social media
2. Provide templates for common OG tag combinations
3. Add validation for required OG properties
4. Integrate with social media APIs for testing

## Support

If you encounter any issues:
1. Check that Quill.js is properly loaded (`/js/lib/editor-quill.js`)
2. Verify the database connection
3. Run the migration script if you have existing data
4. Check browser console for JavaScript errors

## Rollback

If you need to rollback to the previous version:
1. Restore the old model fields in `models/Seo.js`
2. Restore the old API routes in `routes/api/seoApi.js`
3. Restore the old view files from version control
4. Run a reverse migration script (create if needed)
