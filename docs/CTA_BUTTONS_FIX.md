# CTA Buttons Fix - Data Persistence Issue

## Problem
When adding CTA buttons (text and link) in the Hero Section, the data was not being saved to the API correctly.

## Root Cause
The JavaScript code was trying to read a `.cta-style` field that was commented out in the HTML, causing the CTA data collection to fail silently.

## Fix Applied

### Files Modified

#### 1. views/cms/editContentManagement.ejs
**Changed:** Removed `style` field from CTA data collection (2 occurrences)

**Before:**
```javascript
const ctas = [];
$section.find(".cta-item").each(function () {
    const text = $(this).find(".cta-text").val();
    const link = $(this).find(".cta-link").val();
    const style = $(this).find(".cta-style").val(); // This field doesn't exist!
    if (text && link) {
        ctas.push({ text, link, style });
    }
});
```

**After:**
```javascript
const ctas = [];
$section.find(".cta-item").each(function () {
    const text = $(this).find(".cta-text").val();
    const link = $(this).find(".cta-link").val();
    if (text && link) {
        ctas.push({ text, link }); // Only text and link
    }
});
```

#### 2. views/cms/addContentManagement.ejs
**Changed:** Same fix applied to the add content page

#### 3. views/cms/editContentManagement.ejs.new
**Changed:** Same fix applied to the .new version

## How to Test

### Test 1: Add New Content with CTAs
1. Go to "Add Content Management"
2. Select a page
3. Add a section with type "Hero Section"
4. Add CTA buttons:
   - Button Text: "Learn More"
   - Button Link: "/about"
5. Click "Save"
6. Verify the content is saved

### Test 2: Edit Existing Content with CTAs
1. Go to "Edit Content Management" for a page with Hero Section
2. Add a new CTA button:
   - Button Text: "Get Started"
   - Button Link: "/contact"
3. Click "Save Changes"
4. Navigate back to edit the same content
5. **Verify:** The CTA buttons you added should still be there

### Test 3: Multiple CTAs
1. Edit a Hero Section
2. Add 3 CTA buttons with different text and links
3. Save
4. Go back and edit again
5. **Verify:** All 3 CTA buttons are displayed with correct data

### Test 4: API Response
1. Add/Edit content with CTAs
2. Open browser DevTools > Network tab
3. Save the content
4. Check the PUT request to `/api/content/{id}`
5. **Verify:** The request payload includes:
```json
{
  "sections": [
    {
      "heroSection": {
        "heading": "...",
        "paragraph": "...",
        "ctas": [
          {
            "text": "Learn More",
            "link": "/about"
          }
        ]
      }
    }
  ]
}
```

## Debug Feature Added

Added a debug comment in the HTML to show what CTAs are loaded:
```html
<!-- Debug CTAs: <%= JSON.stringify(section.heroSection?.ctas) %> -->
```

This will display in the HTML source (View Page Source) showing exactly what CTA data is being loaded from the database.

## Expected Behavior After Fix

1. **Add CTA:** User can add CTA buttons with text and link
2. **Save:** Data is sent to API correctly
3. **Reload:** When editing the same content, CTAs are displayed
4. **API:** CTAs are stored in database under `heroSection.ctas` array
5. **Frontend:** CTAs are rendered correctly on the public-facing page

## Data Structure

### Database Schema
```javascript
heroSection: {
  heading: String,
  paragraph: String,
  ctas: [
    {
      text: String,
      link: String
    }
  ],
  rightImage: String
}
```

### API Payload
```javascript
{
  pageId: "...",
  status: "active",
  sections: [
    {
      sectionType: "hero-section",
      heroSection: {
        heading: "Welcome",
        paragraph: "This is the hero section",
        ctas: [
          { text: "Learn More", link: "/about" },
          { text: "Contact Us", link: "/contact" }
        ],
        rightImage: "/uploads/hero.jpg"
      }
    }
  ]
}
```

## Notes

- The `style` field was removed because it was commented out in the HTML
- If you need to add the style field back, uncomment the HTML select dropdown and update the JavaScript accordingly
- Maximum 3 CTA buttons are allowed per Hero Section
- Both text and link are required for a CTA to be saved
