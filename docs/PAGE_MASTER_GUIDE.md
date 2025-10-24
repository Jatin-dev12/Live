# Page Master & Content Management System - Complete Guide

## Overview
The Page Master system allows you to dynamically create pages and manage their content through an intuitive admin interface. When you create a page, it automatically generates routes and becomes accessible on your website.

## Features Implemented

### 1. **Page Master**
- ✅ Create new pages with custom names and paths
- ✅ Auto-generate URL-friendly paths from page names
- ✅ Edit existing pages
- ✅ Delete pages (also deletes associated content)
- ✅ Set page status (Active/Inactive)
- ✅ SEO meta fields (title, description, keywords)
- ✅ Custom templates support
- ✅ Dynamic route generation

### 2. **Content Management**
- ✅ Add content to any created page
- ✅ Rich text editor (Quill) for content creation
- ✅ Page selection dropdown
- ✅ Content categorization
- ✅ Image upload support
- ✅ Content status management
- ✅ Edit and delete content
- ✅ Multiple content blocks per page

### 3. **Dynamic Page Rendering**
- ✅ Automatic route creation when page is created
- ✅ Pages accessible via their defined paths
- ✅ Display all active content for each page
- ✅ Responsive content layout
- ✅ SEO-friendly rendering

## How It Works

### Creating a Page

1. **Navigate to Page Master**
   - Go to `/page-master/web-page-master`
   - Click "Add Page Master" button

2. **Fill in Page Details**
   - **Page Name**: Enter the page name (e.g., "About Us")
   - **Path**: Auto-generated from name (e.g., "/about-us") - can be customized
   - **Template**: Default is "default.ejs"
   - **Status**: Active or Inactive
   - **Meta Title**: SEO title
   - **Meta Description**: SEO description

3. **Save the Page**
   - Click "Save" button
   - Page is created in database
   - Route is automatically generated
   - Page is now accessible at the defined path

### Adding Content to a Page

1. **Navigate to Content Management**
   - Go to `/cms/content-management`
   - Click "Add Content" button

2. **Select Page and Add Content**
   - **Select Page**: Choose from dropdown (shows all active pages)
   - **Content Title**: Enter a title for this content block
   - **Category**: Optional categorization
   - **Content Description**: Use rich text editor to create content
   - **Status**: Active or Inactive
   - **Thumbnail**: Upload an image (optional)

3. **Save the Content**
   - Click "Submit" button
   - Content is saved and linked to the selected page

### Viewing the Page

- Navigate to the page path (e.g., `/about-us`)
- All active content blocks will be displayed
- Content is rendered in order with proper formatting

## File Structure

```
models/
├── Page.js              # Page model with schema
└── Content.js           # Content model with schema

routes/
├── page-master.js       # Page Master routes
├── cms.js              # Content Management routes
└── api/
    ├── pageApi.js      # Page CRUD API endpoints
    └── contentApi.js   # Content CRUD API endpoints

views/
├── page-master/
│   ├── websitePageMaster.ejs    # List all pages
│   ├── addPageMaster.ejs        # Create new page
│   └── editPageMaster.ejs       # Edit existing page
├── cms/
│   ├── contentManagement.ejs    # List all content
│   ├── addContentManagement.ejs # Create new content
│   └── editContentManagement.ejs # Edit existing content
└── dynamic-page/
    └── dynamicPage.ejs          # Template for rendering pages
```

## API Endpoints

### Pages API (`/api/pages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | Get all pages (with pagination, search, filter) |
| GET | `/api/pages/:id` | Get single page by ID |
| POST | `/api/pages` | Create new page |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page and its content |

### Content API (`/api/content`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | Get all content (with pagination, filter by page) |
| GET | `/api/content/:id` | Get single content by ID |
| POST | `/api/content` | Create new content |
| PUT | `/api/content/:id` | Update content |
| DELETE | `/api/content/:id` | Delete content |

## Database Models

### Page Schema
```javascript
{
  name: String,           // Page name
  slug: String,           // URL-friendly slug
  path: String,           // Full path (e.g., /about)
  template: String,       // Template file name
  status: String,         // 'active' or 'inactive'
  metaTitle: String,      // SEO title
  metaDescription: String,// SEO description
  metaKeywords: String,   // SEO keywords
  createdBy: ObjectId,    // User who created
  updatedBy: ObjectId,    // User who last updated
  timestamps: true        // createdAt, updatedAt
}
```

### Content Schema
```javascript
{
  page: ObjectId,         // Reference to Page
  title: String,          // Content title
  description: String,    // Short description
  content: String,        // Full content (HTML)
  thumbnail: String,      // Image URL
  category: String,       // Category
  status: String,         // 'active' or 'inactive'
  order: Number,          // Display order
  customFields: Map,      // Additional custom fields
  createdBy: ObjectId,    // User who created
  updatedBy: ObjectId,    // User who last updated
  timestamps: true        // createdAt, updatedAt
}
```

## Usage Examples

### Example 1: Creating an "About Us" Page

1. **Create Page**
   - Name: "About Us"
   - Path: "/about-us" (auto-generated)
   - Status: Active

2. **Add Content**
   - Select Page: "About Us"
   - Title: "Our Story"
   - Content: "We are a company dedicated to..."
   - Status: Active

3. **View Page**
   - Visit: `http://yoursite.com/about-us`
   - Content will be displayed

### Example 2: Creating a "Services" Page with Multiple Sections

1. **Create Page**
   - Name: "Services"
   - Path: "/services"
   - Status: Active

2. **Add Multiple Content Blocks**
   - Content 1: "Web Development" (Category: Development)
   - Content 2: "Mobile Apps" (Category: Development)
   - Content 3: "UI/UX Design" (Category: Design)

3. **View Page**
   - Visit: `http://yoursite.com/services`
   - All three content blocks will be displayed

## Key Features

### Auto-Generated Routes
When you create a page with path `/services`, the system automatically:
1. Creates a database entry
2. Registers a dynamic route
3. Makes the page accessible at `/services`
4. Renders content using the dynamic template

### SEO Optimization
- Meta titles and descriptions
- Clean URL structure
- Proper HTML semantics
- Content organization

### Content Flexibility
- Multiple content blocks per page
- Rich text editing
- Image support
- Categorization
- Ordering control

## Important Notes

1. **Page Paths Must Be Unique**: Each page must have a unique path
2. **Active Status**: Only active pages are accessible on the frontend
3. **Content Display**: Only active content is shown on pages
4. **Deletion**: Deleting a page also deletes all its content
5. **Authentication**: All admin routes require authentication

## Troubleshooting

### Page Not Accessible
- Check if page status is "Active"
- Verify the path is correct
- Ensure no conflicting routes exist

### Content Not Showing
- Check if content status is "Active"
- Verify content is linked to correct page
- Check browser console for errors

### Cannot Create Page
- Ensure page name/path is unique
- Check all required fields are filled
- Verify you're authenticated

## Next Steps

You can extend this system by:
1. Adding custom field types to content
2. Creating different page templates
3. Adding page categories/tags
4. Implementing page versioning
5. Adding content scheduling
6. Creating page hierarchies (parent/child pages)

## Support

For issues or questions, check:
- Database connection is active
- All required npm packages are installed
- User has proper authentication
- MongoDB is running
