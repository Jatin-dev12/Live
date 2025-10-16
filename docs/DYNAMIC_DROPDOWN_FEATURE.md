# Dynamic Dropdown Feature - Add Custom Options

## Overview
Added dynamic dropdown functionality that allows users to add custom ad types and placements directly from the Add Ad form.

## Features Implemented

### 1. **Custom Ad Type**
When creating a new ad, users can now:
- Select from predefined ad types (Banner, Video, Native, Popup)
- Choose "+ Add Custom Ad Type" to create a new type
- Enter a custom ad type name (e.g., "interstitial", "rewarded", "carousel")
- The custom type is automatically formatted (lowercase, hyphenated)

**How it works:**
1. Select "+ Add Custom Ad Type" from the Ad Type dropdown
2. A new input field appears
3. Enter the custom ad type name
4. Submit the form - the custom type is saved with the ad

### 2. **Custom Placement**
When creating a new ad, users can now:
- Select from existing placements
- Choose "+ Add New Placement" to create a new placement
- Fill in a complete placement form with:
  - Placement ID (e.g., fk-10106)
  - Placement Name (e.g., "Header Banner")
  - Page Location (e.g., "Home Page - Top")
  - Description (optional)
  - Dimensions: Width and Height in pixels

**How it works:**
1. Select "+ Add New Placement" from the Placement dropdown
2. A card with placement form appears
3. Fill in all required fields
4. Submit the form - placement is created first, then the ad

## UI/UX Features

### Show/Hide Behavior
- Custom fields are hidden by default
- Appear smoothly when "+ Add" option is selected
- Disappear when switching back to regular options
- Fields are cleared when hidden

### Validation
- Custom fields become required when shown
- Form won't submit without filling required custom fields
- Clear error messages guide the user
- Loading states during submission

### Visual Design
- Custom placement form appears in a bordered card
- Blue border indicates it's a special section
- Organized layout with proper spacing
- Responsive design for all screen sizes

## Technical Implementation

### Files Modified

**1. `views/ads/addAd.ejs`**
- Added "+ Add Custom Ad Type" option
- Added custom ad type input field
- Added "+ Add New Placement" option
- Added complete placement creation form
- Added JavaScript for show/hide logic
- Added placement creation API call before ad creation

**2. `models/Ad.js`**
- Removed enum restriction on `ad_type` field
- Now accepts any string value (lowercase, trimmed)
- Allows custom ad types to be saved

### JavaScript Logic

```javascript
// Ad Type Dropdown Handler
document.getElementById('ad_type').addEventListener('change', function() {
    if (this.value === 'custom') {
        // Show custom input
        // Make it required
    } else {
        // Hide custom input
        // Remove required
        // Clear value
    }
});

// Placement Dropdown Handler
document.getElementById('placement_id').addEventListener('change', function() {
    if (this.value === 'custom') {
        // Show placement form
        // Make fields required
    } else {
        // Hide placement form
        // Remove required
        // Clear all fields
    }
});
```

### Form Submission Flow

**For Custom Ad Type:**
1. Check if "custom" is selected
2. Get custom ad type value
3. Validate it's not empty
4. Format it (lowercase, replace spaces with hyphens)
5. Use formatted value in ad creation

**For Custom Placement:**
1. Check if "custom" is selected
2. Get all placement field values
3. Validate required fields
4. Create placement via API call
5. Wait for placement creation
6. Get new placement ID
7. Use new placement ID in ad creation

## Usage Examples

### Example 1: Creating Ad with Custom Type
```
1. Select "+ Add Custom Ad Type"
2. Enter "Interstitial Ad"
3. Fill other ad details
4. Submit
Result: Ad created with ad_type: "interstitial-ad"
```

### Example 2: Creating Ad with New Placement
```
1. Select "+ Add New Placement"
2. Fill in:
   - Placement ID: fk-10106
   - Name: Mobile App Banner
   - Location: Mobile App - Top
   - Width: 320
   - Height: 50
3. Fill other ad details
4. Submit
Result: 
   - Placement created first
   - Ad created with new placement
```

## Benefits

### For Users
✅ No need to navigate away to create placements
✅ Streamlined workflow - everything in one form
✅ Flexibility to add custom ad types
✅ Faster ad creation process
✅ Better user experience

### For System
✅ Maintains data integrity
✅ Proper validation at all levels
✅ Atomic operations (placement → ad)
✅ Error handling at each step
✅ Scalable architecture

## Error Handling

### Validation Errors
- Empty custom ad type → Error toast
- Missing placement fields → Error toast
- Invalid dates → Error toast

### API Errors
- Placement creation fails → Stop process, show error
- Ad creation fails → Show error, allow retry
- Network errors → Show error message

### User Feedback
- Success toasts for each step
- Loading states during operations
- Clear error messages
- Form stays filled on error (no data loss)

## Future Enhancements

Possible improvements:
- [ ] Save custom ad types to a list for reuse
- [ ] Autocomplete for custom ad types
- [ ] Preview placement dimensions
- [ ] Duplicate placement detection
- [ ] Bulk placement creation
- [ ] Import placements from CSV

## Testing Checklist

✅ Custom ad type shows/hides correctly
✅ Custom placement form shows/hides correctly
✅ Required validation works
✅ Custom ad type is formatted correctly
✅ Placement is created before ad
✅ Error handling works
✅ Form clears when switching options
✅ Success notifications appear
✅ Responsive on mobile devices

## Notes

- Custom ad types are stored in lowercase with hyphens
- Placements are created with the current user as creator
- Both features work independently
- Can use custom type with existing placement
- Can use standard type with new placement
- Can use both custom options together

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all required fields are filled
3. Ensure you're logged in
4. Check network connectivity
5. Restart the server if needed
