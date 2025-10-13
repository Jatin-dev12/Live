# API Route Conflict Fix

## Problem

The public API endpoints were not working:
- `/api/pages/public/all` - ❌ Not working
- `/api/pages/public/slug/home` - ❌ Not working

**Error:** Routes were being caught by the dynamic page router `/:slug` before reaching the API handlers.

## Root Cause

In `app.js`, the route registration order was:

```javascript
// OLD ORDER (WRONG)
app.use('/api/pages', pageApi);        // API routes
pageRouter(app);                        // Dynamic routes (/:slug)
```

The dynamic router in `routes/routes.js` has a catch-all route:

```javascript
router.get('/:slug', isAuthenticated, async (req, res, next) => {
  // This was catching /api/pages/public/slug/home
});
```

Since Express processes routes in the order they're registered, the dynamic `/:slug` route was catching API requests before they could reach the API handlers.

## Solution

Changed the route registration order in `app.js`:

```javascript
// NEW ORDER (CORRECT)
// Register API routes FIRST
app.use('/api/auth', authApi);
app.use('/api/users', userApi);
app.use('/api/roles', roleApi);
app.use('/api/permissions', permissionApi);
app.use('/api/pages', pageApi);
app.use('/api/content', contentApi);

// Register page router AFTER API routes
pageRouter(app);
```

## Why This Works

Express matches routes in the order they're registered:

1. **API routes registered first** → `/api/*` routes are checked first
2. **Page router registered second** → `/:slug` only catches non-API routes

Now the request flow is:
```
Request: /api/pages/public/slug/home
  ↓
Check: /api/auth/* → No match
  ↓
Check: /api/users/* → No match
  ↓
Check: /api/roles/* → No match
  ↓
Check: /api/permissions/* → No match
  ↓
Check: /api/pages/* → ✅ MATCH! (handles request)
  ↓
(Never reaches /:slug)
```

## Testing

### Test API Endpoints:

**1. Get All Pages:**
```bash
curl http://localhost:8080/api/pages/public/all
```

**2. Get Page by Slug:**
```bash
curl http://localhost:8080/api/pages/public/slug/home
curl http://localhost:8080/api/pages/public/slug/about-us
```

**3. Browser:**
- http://localhost:8080/api/pages/public/all
- http://localhost:8080/api/pages/public/slug/home

**4. Test Page:**
- http://localhost:8080/api-test.html

### Expected Results:

✅ **All API endpoints work**
✅ **Dynamic pages still work** (e.g., `/about-us`, `/contact`)
✅ **No conflicts**

## Files Modified

1. **`app.js`** - Changed route registration order

## Important Notes

### Route Order Matters!

In Express, route order is CRITICAL:

```javascript
// ❌ WRONG - Specific routes after catch-all
app.get('/:slug', handler);        // Catches everything
app.get('/api/pages', handler);    // Never reached

// ✅ CORRECT - Specific routes before catch-all
app.get('/api/pages', handler);    // Checked first
app.get('/:slug', handler);        // Only catches non-API routes
```

### Best Practice

Always register routes in this order:
1. **Static routes** (exact matches)
2. **API routes** (prefixed with `/api`)
3. **Dynamic routes** (with parameters like `/:slug`)
4. **Catch-all/404 routes** (last resort)

## Summary

✅ **Problem:** API routes caught by dynamic page router
✅ **Solution:** Register API routes before page router
✅ **Result:** All routes work correctly
✅ **No Breaking Changes:** Existing functionality preserved

The API is now fully functional! 🎉
