# Ads Management System

## Overview
A comprehensive advertisement management system with dynamic functionality, database integration, and full CRUD operations.

## Features

### Database Models

#### 1. **Ad Model** (`models/Ad.js`)
- **Fields:**
  - `title` - Ad title (required, max 200 chars)
  - `description` - Ad description (required, max 1000 chars)
  - `media_url` - Media file URL (required)
  - `ad_type` - Type: banner, video, native, popup (required)
  - `placement_id` - Reference to AdPlacement (required, FK)
  - `status` - Status: active, paused, expired, pending, rejected (required)
  - `start_date` - Campaign start date (required)
  - `end_date` - Campaign end date (required)
  - `budget` - Ad budget in dollars (default: 0)
  - `max_impressions` - Maximum impressions (default: 0, 0 = unlimited)
  - `max_clicks` - Maximum clicks (default: 0, 0 = unlimited)
  - `current_impressions` - Current impression count
  - `current_clicks` - Current click count
  - `spent_budget` - Amount spent so far
  - `created_by` - User who created the ad (FK to User)
  - `created_by_type` - Creator type: admin or advertiser

- **Methods:**
  - `hasReachedLimits()` - Check if ad reached its limits
  - `recordImpression()` - Increment impression count
  - `recordClick()` - Increment click count
  
- **Virtuals:**
  - `isCurrentlyActive` - Check if ad is currently active based on dates and limits

#### 2. **AdPlacement Model** (`models/AdPlacement.js`)
- **Fields:**
  - `placementId` - Unique placement identifier (required, unique)
  - `name` - Placement name (required)
  - `description` - Placement description
  - `pageLocation` - Where the ad appears (required)
  - `dimensions` - Width and height of the ad space
  - `isActive` - Whether placement is active
  - `createdBy` - User who created the placement (FK to User)

### API Routes (`routes/api/adsApi.js`)

#### Ad Management
- `GET /api/ads` - Get all ads with filters (status, ad_type, placement_id, search)
- `GET /api/ads/:id` - Get single ad by ID
- `POST /api/ads` - Create new ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad
- `PATCH /api/ads/:id/status` - Update ad status
- `GET /api/ads/:id/stats` - Get ad statistics

#### Analytics
- `POST /api/ads/:id/impression` - Record an impression
- `POST /api/ads/:id/click` - Record a click

#### Ad Placements
- `GET /api/placements` - Get all active placements
- `POST /api/placements` - Create new placement

### View Routes (`routes/ads.js`)
- `GET /ads/ads-management` - Ads management dashboard
- `GET /ads/add-ad` - Add new ad form
- `GET /ads/edit-ad/:id` - Edit ad form
- `GET /ads/placements` - Ad placements management

### Views

#### 1. **Ads Management** (`views/ads/adsManagement.ejs`)
Features:
- Dynamic table displaying all ads from database
- Real-time search by title
- Filter by status (active, paused, expired, pending, rejected)
- Filter by ad type (banner, video, native, popup)
- View ad preview modal (supports images and videos)
- Edit ad functionality
- Delete ad with confirmation
- Status badges with color coding
- Responsive design

#### 2. **Add Ad Form** (`views/ads/addAd.ejs`)
Features:
- Complete form for creating new ads
- All required fields with validation
- Dynamic placement dropdown from database
- Date validation (end date must be after start date)
- Budget and limits configuration
- Creator type selection (admin/advertiser)
- Form submission with loading state
- Success/error notifications

#### 3. **Edit Ad Form** (`views/ads/editAd.ejs`)
Features:
- Pre-filled form with existing ad data
- All fields editable
- Current analytics display (impressions, clicks, spent budget)
- Date validation
- Update functionality with loading state
- Success/error notifications

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Ad Placements
Before creating ads, you need to create ad placements:

```bash
node scripts/seedAdPlacements.js
```

This will create 5 default ad placements:
- Home Page - Hero Banner (1920x600)
- Sidebar - Right Column (300x600)
- Blog Post - Inline (728x90)
- Footer - Bottom Banner (1200x200)
- Product Page - Sidebar (300x250)

### 3. Access the System
Navigate to: `http://localhost:8080/ads/ads-management`

## Usage Guide

### Creating an Ad

1. Go to **Ads Management** page
2. Click **"Add Ad"** button
3. Fill in the form:
   - **Title**: Enter ad title
   - **Description**: Enter ad description
   - **Media URL**: Enter path to media file (e.g., `/images/banner.jpg`)
   - **Ad Type**: Select banner, video, native, or popup
   - **Placement**: Select where the ad will appear
   - **Status**: Set initial status (usually "pending" or "active")
   - **Start Date**: When the ad campaign starts
   - **End Date**: When the ad campaign ends
   - **Budget**: Total budget (0 = unlimited)
   - **Max Impressions**: Maximum impressions (0 = unlimited)
   - **Max Clicks**: Maximum clicks (0 = unlimited)
   - **Created By Type**: Admin or Advertiser
4. Click **"Create Ad"**

### Editing an Ad

1. Go to **Ads Management** page
2. Click the **edit icon** (green) on any ad
3. Modify the fields as needed
4. View current analytics at the bottom
5. Click **"Update Ad"**

### Deleting an Ad

1. Go to **Ads Management** page
2. Click the **delete icon** (red) on any ad
3. Confirm deletion in the popup
4. Ad will be removed from the database

### Viewing Ad Preview

1. Go to **Ads Management** page
2. Click the **view icon** (blue) on any ad
3. Modal will display the ad media (image or video)

### Filtering Ads

Use the filter dropdowns to:
- Search by title
- Filter by status
- Filter by ad type

## Ad Status Workflow

1. **Pending** - Newly created ad awaiting approval
2. **Active** - Ad is currently running
3. **Paused** - Ad is temporarily stopped
4. **Expired** - Ad campaign has ended
5. **Rejected** - Ad was not approved

## Auto-Management Features

### Auto-Expiration
Ads automatically change status to "expired" when:
- Current date passes the end_date

### Auto-Pause
Ads automatically pause when:
- Impressions reach max_impressions (if set)
- Clicks reach max_clicks (if set)
- Spent budget reaches total budget (if set)

## API Integration Examples

### Record an Impression
```javascript
fetch('/api/ads/AD_ID/impression', {
    method: 'POST'
});
```

### Record a Click
```javascript
fetch('/api/ads/AD_ID/click', {
    method: 'POST'
});
```

### Get Ad Statistics
```javascript
fetch('/api/ads/AD_ID/stats')
    .then(res => res.json())
    .then(data => {
        console.log(data.data);
        // {
        //   impressions: { current: 100, max: 1000, percentage: 10 },
        //   clicks: { current: 5, max: 50, percentage: 10, ctr: 5 },
        //   budget: { spent: 25.50, total: 100, percentage: 25.5 }
        // }
    });
```

## Database Schema

### Ad Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  media_url: String,
  ad_type: String (enum),
  placement_id: ObjectId (ref: AdPlacement),
  status: String (enum),
  start_date: Date,
  end_date: Date,
  budget: Number,
  max_impressions: Number,
  max_clicks: Number,
  current_impressions: Number,
  current_clicks: Number,
  spent_budget: Number,
  created_by: ObjectId (ref: User),
  created_by_type: String (enum),
  createdAt: Date,
  updatedAt: Date
}
```

### AdPlacement Collection
```javascript
{
  _id: ObjectId,
  placementId: String (unique),
  name: String,
  description: String,
  pageLocation: String,
  dimensions: {
    width: Number,
    height: Number
  },
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- All routes protected with `isAuthenticated` middleware
- User association for tracking ad creators
- Input validation on all fields
- XSS protection through EJS escaping
- CSRF protection through session management

## Performance Optimizations

- Database indexes on frequently queried fields
- Lean queries for better performance
- Pagination support (can be added)
- Efficient filtering and search

## Future Enhancements

- [ ] File upload for media
- [ ] Advanced analytics dashboard
- [ ] A/B testing support
- [ ] Scheduling system
- [ ] Revenue tracking
- [ ] Click-through rate (CTR) optimization
- [ ] Geo-targeting
- [ ] Device targeting
- [ ] Ad rotation algorithms

## Troubleshooting

### Ads not showing?
- Check if placements exist in database
- Verify ad status is "active"
- Check start_date and end_date
- Ensure media_url is valid

### Cannot create ad?
- Ensure at least one placement exists
- Run seed script: `node scripts/seedAdPlacements.js`
- Check user authentication

### API errors?
- Check MongoDB connection
- Verify all required fields are provided
- Check console for detailed error messages

## Support

For issues or questions, check the console logs or contact the development team.
