# Template-Based CMS System

## Overview
The CMS now uses a template-based approach where page structure is predefined and managed through templates, not manual section addition.

## Key Features

### 1. Template Management
- **Location**: Page Master (`/page-master/web-page-master`)
- **Templates Available**:
  - Home Template: Hero + 3 Callout Cards
  - About Template: Hero with Button + 8 Tabs
  - Legislation Template: Hero with 2 Buttons + 1 Callout Card
  - Membership Template: Hero Section Only

### 2. Template Configuration
- **File**: `config/templates.js`
- **Structure**: Predefined sections with default content
- **Validation**: Only valid cards/CTAs with content are created

### 3. Page Creation Workflow
1. **Create Page**: Select template in Page Master
2. **Auto-Generation**: Sections created automatically based on template
3. **Content Editing**: Edit content in Content Management (structure is fixed)

### 4. Template Switching
- **Location**: Edit Page in Page Master
- **Effect**: Replaces ALL existing sections with new template structure
- **Warning**: Users are warned about content replacement

### 5. Content Management Restrictions
- ❌ No "Add Section" button
- ❌ No "Remove Section" buttons  
- ❌ No manual card/button addition/removal
- ❌ No section type changes
- ✅ Content editing only (text, images, links)

## User Workflow

### Creating a New Page
1. Go to Page Master → Add Page
2. Enter page name
3. Select template from dropdown
4. Save → Redirects to content editor if template selected

### Changing Page Template
1. Go to Page Master → Edit Page
2. Change template dropdown
3. Save → All content replaced with new template structure
4. Redirects to content editor to fill in new content

### Editing Page Content
1. Go to Content Management → Edit Content
2. Fill in predefined fields (headings, text, links, images)
3. Cannot add/remove sections or cards
4. Structure is locked to template definition

## Technical Implementation

### Database Changes
- Added `template` field to Page model
- Enhanced Content model with `tabsSection` support

### API Changes
- Page creation auto-generates template sections
- Page update handles template switching
- Content API supports all section types

### UI Changes
- Template selection in page forms
- Template preview with warnings
- Disabled section structure controls
- Template badges on sections/cards

## Benefits
1. **Consistency**: All pages follow predefined structures
2. **Simplicity**: Users focus on content, not structure
3. **Maintainability**: Template changes affect all pages using that template
4. **User-Friendly**: Clear workflow and restrictions prevent structural errors