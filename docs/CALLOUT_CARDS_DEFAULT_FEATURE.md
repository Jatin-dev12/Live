# Call-Out Cards Default Feature

## Overview
Updated the Page Master content management system to automatically show 3 call-out cards by default when adding content with the "Call Out Section" type. Users can now add or delete cards as needed without minimum restrictions.

## Changes Made

### 1. Default Cards on Section Selection
When a user selects "Call Out Section" as the section type:
- **3 default cards** are automatically created
- Each card displays a "Template Card" badge to indicate it's part of the page template
- Each card has placeholder text: "Call Out Card 1", "Call Out Card 2", "Call Out Card 3"
- Cards include fields for:
  - Heading (required)
  - Paragraph (5 rows textarea)
  - Link (optional)

### 2. Add/Delete Functionality
- **Add Cards**: Click "Add Call Out Card" button to add more cards (up to 6 total)
- **Delete Cards**: Each card has a delete button (trash icon) to remove it
- **Auto-renumbering**: When cards are deleted, remaining cards are automatically renumbered
- **Template Badge**: All cards display a "Template Card" badge to indicate they are part of the page template structure
- **No Minimum**: Users can delete all cards if needed (no minimum requirement)

### 3. Validation Updates
- Removed minimum card requirement (previously required at least 1 card)
- Maximum of 6 cards still enforced
- Heading validation only applies if cards exist
- Updated UI text from "Min: 1 card, Max: 6 cards" to "Max: 6 cards"

## Files Modified

### views/cms/addContentManagement.ejs
- Added auto-creation of 3 default cards in section type change handler
- Updated add card button handler with better placeholders
- Updated remove card button handler to allow deletion of all cards
- Added card renumbering after deletion
- Updated UI text to remove minimum card requirement

### views/cms/editContentManagement.ejs
- Updated validation logic to allow 0 cards
- Modified heading validation to only check when cards exist
- Updated title assignment to handle empty card arrays

### views/cms/editContentManagement.ejs.new
- Added auto-creation of 3 default cards in toggleSectionFields function
- Updated add/remove card handlers to match addContentManagement.ejs
- Updated validation logic to allow 0 cards
- Updated UI text to remove minimum card requirement

## User Experience

### Before
- Users had to manually click "Add Call Out Card" for each card
- Minimum of 1 card was required
- Could not delete the last card

### After
- 3 cards appear automatically when selecting "Call Out Section"
- No minimum card requirement
- Can delete all cards if needed
- Cards are automatically renumbered after deletion
- Better placeholder text for user guidance

## Technical Details

### Card Structure
```html
<div class="callout-item border border-neutral-200 radius-8 p-3 mb-2 bg-white">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold text-sm">Card #1</span>
            <span class="badge bg-secondary">Template Card</span>
        </div>
        <button type="button" class="btn btn-sm btn-danger-600 remove-callout-btn">
            <iconify-icon icon="mdi:delete"></iconify-icon>
        </button>
    </div>
    <div class="mb-2">
        <label class="form-label text-sm">Heading: <span class="text-danger-600">*</span></label>
        <input type="text" class="form-control callout-heading" placeholder="Call Out Card 1" required>
    </div>
    <div class="mb-2">
        <label class="form-label text-sm">Paragraph:</label>
        <textarea class="form-control callout-subheading" rows="5" placeholder="Enter description here"></textarea>
    </div>
    <div>
        <label class="form-label text-sm">Link:</label>
        <input type="text" class="form-control callout-link" placeholder="e.g., /more">
    </div>
</div>
```

### Auto-Creation Logic
```javascript
if (sectionType === 'call-out-cards') {
    $section.find('.call-out-cards-fields').show();
    const $calloutContainer = $section.find('.callout-container');
    if ($calloutContainer.find('.callout-item').length === 0) {
        for (let i = 1; i <= 3; i++) {
            // Create card HTML and append
        }
    }
}
```

## Testing Recommendations

1. **Add Content Page**
   - Select "Call Out Section" and verify 3 cards appear
   - Add more cards (up to 6 total)
   - Delete cards and verify renumbering
   - Submit form with 0, 1, 3, and 6 cards

2. **Edit Content Page**
   - Open existing content with call-out cards
   - Verify existing cards display correctly
   - Add/delete cards and save
   - Verify changes persist after save

3. **Validation**
   - Try adding more than 6 cards (should show warning)
   - Submit with empty heading (should show validation error)
   - Submit with 0 cards (should succeed)

## Notes

- The feature maintains backward compatibility with existing content
- Existing pages with call-out cards will continue to work as before
- The auto-creation only happens when the container is empty (new sections)
