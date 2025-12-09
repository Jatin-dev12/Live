# AD Image Hero Implementation

## Overview
This implementation replaces the hero image field in the content management system with an AD image dropdown that allows users to select advertisements with image previews.

## Changes Made

### 1. Frontend Changes (`views/cms/editContentManagement.ejs`)

#### Hero Section Field Replacement
- **Old**: WordPress-style media picker for hero images
- **New**: Dropdown with AD selection and preview functionality

#### New HTML Structure
```html
<div class="mb-3">
    <label class="form-label fw-bold text-neutral-900">AD Image</label>
    <p class="text-muted small mb-3">Select an advertisement to display as hero image</p>
    
    <!-- AD Image Dropdown with Preview -->
    <select class="form-control border border-neutral-200 radius-8 ad-image-select" 
            name="adImage" 
            data-current-value="<%= section.heroSection?.image || '' %>">
        <option value="">-- Select Advertisement --</option>
    </select>
    
    <!-- AD Preview -->
    <div class="ad-preview-container mt-3" style="display: none;">
        <div class="card">
            <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3">
                    <img class="ad-preview-image" src="" alt="AD Preview" 
                         style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">
                    <div class="ad-preview-details">
                        <h6 class="ad-preview-title mb-1"></h6>
                        <p class="ad-preview-description text-muted small mb-0"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <input type="hidden" 
           class="hero-image-input" 
           name="heroImage" 
           value="<%= section.heroSection?.image || '' %>">
</div>
```

#### JavaScript Functionality
- **Load Ads**: Fetches active ads from `/api/ads?status=active`
- **Populate Dropdown**: Adds ads as options with full URLs
- **Preview Display**: Shows selected ad with image, title, and description
- **URL Handling**: Ensures full URLs are saved (converts relative to absolute)

### 2. Backend Changes (`routes/api/pageApi.js`)

#### API Response Enhancement
Added `adimage` field to all sections responses:

```javascript
// In sections mapping
adimage: content.heroSection?.image || null,
```

This affects:
- `/api/pages/public/all` - All pages with content
- `/api/pages/public/slug/:slug` - Single page by slug  
- `/api/pages/:id/sections` - Page sections

### 3. Key Features

#### AD Dropdown with Preview
- Displays all active advertisements
- Shows image preview (80x60px)
- Displays ad title and description
- Maintains current selection on page load

#### Full URL Storage
- Converts relative URLs to full URLs automatically
- Ensures API responses contain complete image URLs
- Maintains backward compatibility with existing images

#### User Experience
- Clear visual feedback when selecting ads
- Preview card shows exactly what will be displayed
- Success/error toast notifications
- Seamless integration with existing save functionality

## API Endpoints Used

### GET `/api/ads?status=active`
Fetches all active advertisements for the dropdown.

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ad_id",
      "title": "Ad Title",
      "description": "Ad Description", 
      "media_url": "/uploads/ads/image.jpg",
      "status": "active"
    }
  ]
}
```

### GET `/api/pages/:id/sections`
Returns page sections with new `adimage` field.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "_id": "section_id",
        "type": "hero-section",
        "heroSection": {
          "image": "http://domain.com/uploads/ads/image.jpg"
        },
        "adimage": "http://domain.com/uploads/ads/image.jpg"
      }
    ]
  }
}
```

## Implementation Benefits

1. **Centralized Ad Management**: All ads managed through the ads system
2. **Visual Selection**: Users can see exactly which ad they're selecting
3. **Full URL Support**: API consumers get complete URLs without additional processing
4. **Backward Compatibility**: Existing hero images continue to work
5. **Consistent UX**: Maintains the same save/update workflow

## Usage Instructions

1. Navigate to `/cms/edit-content-management/:pageId`
2. Find the hero section
3. Use the "AD Image" dropdown to select an advertisement
4. Preview appears automatically showing the selected ad
5. Save the content - the full URL is stored in the `heroSection.image` field
6. API consumers can access the image via the `adimage` field in sections

## Technical Notes

- The implementation maintains the existing `hero-image-input` hidden field for compatibility
- Full URLs are generated using `window.location.origin + relative_url`
- The `adimage` field in API responses provides direct access to the hero image URL
- Preview functionality uses Bootstrap card styling for consistency