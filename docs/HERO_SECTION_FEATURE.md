# Hero Section Feature - Content Management

## Overview
The Content Management system now supports creating **Hero Sections** with a left-side text layout and right-side image - perfect for homepage banners and landing page headers.

## Features

### Section Types
1. **Default Content** - Traditional rich text content with WYSIWYG editor
2. **Hero Section** - Modern layout with:
   - Left side: Heading, paragraph, and multiple CTA buttons
   - Right side: Featured image

## Creating a Hero Section

### Step 1: Navigate to Content Management
Go to **CMS → Content Management → Add Content**

### Step 2: Select Section Type
- Choose **"Hero Section (Left Text + Right Image)"** from the Section Type dropdown

### Step 3: Fill in Left Side Content
**Heading:**
- Main headline for your hero section
- Example: "Improving Lives"

**Paragraph:**
- Supporting description text
- Example: "Through Interdisciplinary Rehabilitation Research"

**CTA Buttons:**
- Click **"Add CTA Button"** to add action buttons
- Add as many CTAs as needed
- For each CTA, configure:
  - **Button Text**: e.g., "Why join ACRM", "ACRM Communities", "ACRM Job Board"
  - **Button Link**: URL or path, e.g., "/about-us", "/communities"
  - **Button Style**: 
    - Primary (Red) - Main action button
    - Secondary (Dark) - Alternative action
    - Outline - Subtle action

### Step 4: Upload Right Side Image
- Click **"Upload Hero Image"**
- Select an image that represents your content
- Recommended size: 1200x800px or similar aspect ratio
- Image will be displayed on the right side

### Step 5: Set Status and Save
- Choose **Active** or **Inactive** status
- Click **Submit** to create the hero section

## Editing Hero Sections

1. Go to **Content Management** list
2. Click **Edit** on any hero section
3. Modify heading, paragraph, CTAs, or image
4. Click **Update** to save changes

## Frontend Display

Hero sections are automatically rendered with:
- **Responsive layout**: Stacks on mobile, side-by-side on desktop
- **Styled buttons**: Different colors based on CTA style
- **Hover effects**: Smooth animations on buttons and images
- **Professional design**: Gradient background and proper spacing

## Example Use Cases

### Homepage Banner
```
Heading: "Welcome to Our Platform"
Paragraph: "Discover amazing features and join thousands of users"
CTAs: 
  - "Get Started" (Primary) → /signup
  - "Learn More" (Outline) → /about
Image: Hero banner showing product/service
```

### Feature Highlight
```
Heading: "Powerful Analytics Dashboard"
Paragraph: "Track your performance with real-time insights"
CTAs:
  - "View Demo" (Primary) → /demo
  - "See Pricing" (Secondary) → /pricing
Image: Dashboard screenshot
```

### Call to Action Section
```
Heading: "Ready to Transform Your Business?"
Paragraph: "Join industry leaders using our platform"
CTAs:
  - "Start Free Trial" (Primary) → /trial
  - "Contact Sales" (Outline) → /contact
Image: Team collaboration photo
```

## Technical Details

### Database Schema
Hero sections are stored in the Content model with:
- `sectionType`: 'hero-section'
- `heroSection` object containing:
  - `heading`: String
  - `paragraph`: String
  - `ctas`: Array of {text, link, style}
  - `rightImage`: String (image URL)

### API Endpoints
- **POST** `/api/content` - Create hero section
- **PUT** `/api/content/:id` - Update hero section
- **GET** `/api/content` - List all content (including hero sections)

## Tips

1. **Keep headings concise** - 5-10 words work best
2. **Limit CTAs** - 2-3 buttons maximum for clarity
3. **Use high-quality images** - Clear, professional photos
4. **Test responsiveness** - Check on mobile and desktop
5. **Consistent styling** - Use Primary for main action, Outline for secondary

## Support

For issues or questions about hero sections, refer to the main documentation or contact the development team.
