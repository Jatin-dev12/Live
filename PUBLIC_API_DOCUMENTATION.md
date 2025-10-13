# Public API Documentation

## Overview
Public APIs to fetch pages and content data for your website frontend. These APIs **do not require authentication** and can be called from any frontend application.

---

## Base URL
```
http://localhost:8080/api/pages
```

For production, replace with your domain:
```
https://yourdomain.com/api/pages
```

---

## Endpoints

### 1. Get All Pages with Content

**Endpoint:** `GET /api/pages/public/all`

**Authentication:** Not required (Public API)

**Description:** Returns all active pages with their content, slugs, and metadata.

**Request:**
```javascript
fetch('http://localhost:8080/api/pages/public/all')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Home",
      "slug": "home",
      "path": "/",
      "metaTitle": "Welcome to Our Website",
      "metaDescription": "This is the home page",
      "metaKeywords": "home, welcome, website",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "contents": [
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "title": "Welcome Section",
          "category": "hero",
          "description": "Welcome to our amazing website",
          "content": "<h1>Welcome!</h1><p>This is our homepage content.</p>",
          "thumbnail": "/images/hero.jpg",
          "order": 0,
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z"
        }
      ]
    },
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "About Us",
      "slug": "about-us",
      "path": "/about-us",
      "metaTitle": "About Us - Learn More",
      "metaDescription": "Learn more about our company",
      "metaKeywords": "about, company, team",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "contents": [
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
          "title": "Our Story",
          "category": "about",
          "description": "Our company story",
          "content": "<h2>About Us</h2><p>We are a great company...</p>",
          "thumbnail": "/images/about.jpg",
          "order": 0,
          "createdAt": "2024-01-15T11:05:00.000Z",
          "updatedAt": "2024-01-15T11:05:00.000Z"
        }
      ]
    }
  ],
  "total": 2,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

### 2. Get Single Page by Slug

**Endpoint:** `GET /api/pages/public/slug/:slug`

**Authentication:** Not required (Public API)

**Description:** Returns a single page with its content by slug.

**Parameters:**
- `slug` (string) - The page slug (e.g., "about-us", "home", "contact")

**Request:**
```javascript
// Get "About Us" page
fetch('http://localhost:8080/api/pages/public/slug/about-us')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "name": "About Us",
    "slug": "about-us",
    "path": "/about-us",
    "metaTitle": "About Us - Learn More",
    "metaDescription": "Learn more about our company",
    "metaKeywords": "about, company, team",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "contents": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "title": "Our Story",
        "category": "about",
        "description": "Our company story",
        "content": "<h2>About Us</h2><p>We are a great company...</p>",
        "thumbnail": "/images/about.jpg",
        "order": 0,
        "createdAt": "2024-01-15T11:05:00.000Z",
        "updatedAt": "2024-01-15T11:05:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Error Response (Page Not Found):**
```json
{
  "success": false,
  "message": "Page not found"
}
```

---

## Usage Examples

### React Example

```javascript
import React, { useState, useEffect } from 'react';

function HomePage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all pages
    fetch('http://localhost:8080/api/pages/public/all')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPages(data.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {pages.map(page => (
        <div key={page._id}>
          <h1>{page.name}</h1>
          <p>{page.metaDescription}</p>
          
          {page.contents.map(content => (
            <div key={content._id}>
              <h2>{content.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
```

### Vue.js Example

```javascript
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="page in pages" :key="page._id">
        <h1>{{ page.name }}</h1>
        <p>{{ page.metaDescription }}</p>
        
        <div v-for="content in page.contents" :key="content._id">
          <h2>{{ content.title }}</h2>
          <div v-html="content.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pages: [],
      loading: true
    }
  },
  mounted() {
    fetch('http://localhost:8080/api/pages/public/all')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.pages = data.data;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error:', error);
        this.loading = false;
      });
  }
}
</script>
```

### Vanilla JavaScript Example

```javascript
// Fetch all pages
async function fetchAllPages() {
  try {
    const response = await fetch('http://localhost:8080/api/pages/public/all');
    const data = await response.json();
    
    if (data.success) {
      displayPages(data.data);
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
}

// Display pages
function displayPages(pages) {
  const container = document.getElementById('pages-container');
  
  pages.forEach(page => {
    const pageDiv = document.createElement('div');
    pageDiv.innerHTML = `
      <h1>${page.name}</h1>
      <p>${page.metaDescription}</p>
      ${page.contents.map(content => `
        <div>
          <h2>${content.title}</h2>
          <div>${content.content}</div>
        </div>
      `).join('')}
    `;
    container.appendChild(pageDiv);
  });
}

// Call the function
fetchAllPages();
```

### jQuery Example

```javascript
// Fetch all pages
$.ajax({
  url: 'http://localhost:8080/api/pages/public/all',
  type: 'GET',
  success: function(data) {
    if (data.success) {
      displayPages(data.data);
    }
  },
  error: function(error) {
    console.error('Error:', error);
  }
});

// Fetch single page by slug
$.ajax({
  url: 'http://localhost:8080/api/pages/public/slug/about-us',
  type: 'GET',
  success: function(data) {
    if (data.success) {
      displayPage(data.data);
    }
  },
  error: function(error) {
    console.error('Error:', error);
  }
});
```

### Axios Example

```javascript
import axios from 'axios';

// Fetch all pages
axios.get('http://localhost:8080/api/pages/public/all')
  .then(response => {
    if (response.data.success) {
      console.log(response.data.data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Fetch single page by slug
axios.get('http://localhost:8080/api/pages/public/slug/about-us')
  .then(response => {
    if (response.data.success) {
      console.log(response.data.data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

---

## Response Fields

### Page Object:
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Unique page ID |
| `name` | String | Page name |
| `slug` | String | URL-friendly slug |
| `path` | String | Page path (e.g., "/about-us") |
| `metaTitle` | String | SEO meta title |
| `metaDescription` | String | SEO meta description |
| `metaKeywords` | String | SEO keywords |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |
| `contents` | Array | Array of content objects |

### Content Object:
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Unique content ID |
| `title` | String | Content title |
| `category` | String | Content category |
| `description` | String | Short description |
| `content` | String | Full HTML content |
| `thumbnail` | String | Image URL |
| `order` | Number | Display order |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## Features

✅ **No Authentication Required** - Public APIs, no login needed
✅ **Only Active Content** - Returns only active pages and content
✅ **Sorted Content** - Content sorted by order and creation date
✅ **SEO Friendly** - Includes meta tags for SEO
✅ **Slug-based URLs** - Use slugs for clean URLs
✅ **Rich Content** - Full HTML content support
✅ **Timestamps** - Creation and update times included

---

## CORS Configuration

If you're calling these APIs from a different domain, make sure CORS is enabled in your backend:

```javascript
// In app.js
const cors = require('cors');
app.use(cors());

// Or for specific origins:
app.use(cors({
  origin: 'https://yourfrontend.com'
}));
```

---

## Rate Limiting

Consider adding rate limiting for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/pages/public', limiter);
```

---

## Testing the API

### Using cURL:

```bash
# Get all pages
curl http://localhost:8080/api/pages/public/all

# Get single page by slug
curl http://localhost:8080/api/pages/public/slug/about-us
```

### Using Postman:

1. Create new GET request
2. URL: `http://localhost:8080/api/pages/public/all`
3. Click "Send"
4. View JSON response

### Using Browser:

Simply visit in your browser:
- http://localhost:8080/api/pages/public/all
- http://localhost:8080/api/pages/public/slug/about-us

---

## Common Use Cases

### 1. Build a Dynamic Website
Fetch all pages and render them dynamically in your frontend.

### 2. Create a Blog
Use content categories to filter blog posts.

### 3. Build a Mobile App
Use these APIs to power your mobile app content.

### 4. SEO Optimization
Use meta fields for better SEO in your frontend.

### 5. Multi-language Support
Create pages for different languages and fetch by slug.

---

## Summary

✅ **Two Public APIs Created**
- `/api/pages/public/all` - Get all pages with content
- `/api/pages/public/slug/:slug` - Get single page by slug

✅ **No Authentication Required**
- Can be called from any frontend
- Perfect for public websites

✅ **Complete Data**
- Pages with slugs
- All content
- SEO metadata
- Timestamps

✅ **Production Ready**
- Error handling
- Proper status codes
- Clean JSON responses

Use these APIs to build your website frontend! 🚀
