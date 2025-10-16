const express = require("express");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority',
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/fonts', express.static(__dirname + 'public/fonts'));
app.use('/images', express.static(__dirname + 'public/images'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/webfonts', express.static(__dirname + 'public/webfonts'));
app.use('/uploads', express.static(__dirname + '/public/uploads'));

// EJS layouts
app.use(expressLayouts);
app.set('layout', './layout/layout');

// Set up views directory and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Health check endpoint
app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// API Routes
const authApi = require('./routes/api/authApi');
const userApi = require('./routes/api/userApi');
const roleApi = require('./routes/api/roleApi');
const permissionApi = require('./routes/api/permissionApi');
const pageApi = require('./routes/api/pageApi');
const contentApi = require('./routes/api/contentApi');
const seoApi = require('./routes/api/seoApi');
const uploadApi = require('./routes/api/uploadApi');
const adsApi = require('./routes/api/adsApi');
const mediaApi = require('./routes/api/mediaApi');

// Import Page Router & Define All Routes (MUST be before API routes to avoid conflicts)
const pageRouter = require('./routes/routes');

// Register API routes FIRST (before page router to prevent conflicts with dynamic routes)
app.use('/api/auth', authApi);
app.use('/api/users', userApi);
app.use('/api/roles', roleApi);
app.use('/api/permissions', permissionApi);
app.use('/api/pages', pageApi);
app.use('/api/content', contentApi);
app.use('/api', seoApi);
app.use('/api', uploadApi);
app.use('/api', adsApi);
app.use('/api/media', mediaApi);

// Register page router AFTER API routes
pageRouter(app); // Pass the app object to the pageRouter function

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`\nServer running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});