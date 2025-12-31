const express = require("express");
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

// Middleware to redirect already authenticated users
const redirectIfAuthenticated = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      // Validate that the user still exists and is active
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).select('isActive');
      
      if (user && user.isActive) {
        return res.redirect('/index'); // Redirect to dashboard if already logged in
      } else {
        // User doesn't exist or is inactive, destroy session
        req.session.destroy();
      }
    }
    next();
  } catch (error) {
    console.error('Error checking authentication status:', error);
    // If there's an error, destroy the session to be safe
    if (req.session) {
      req.session.destroy();
    }
    next();
  }
};

// Middleware to prevent caching of authentication pages
const preventCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
};

router.get("/forgot-password", preventCache, redirectIfAuthenticated, (req, res) => {
  res.render("authentication/forgotPassword", { title: "Forgot Password", subTitle: "Reset Password", layout: "../views/layout/layout2" });
});

// Block the default signin routes - return 404
router.get("/signin", preventCache, (req, res) => {
  res.status(404).render("notFound", { 
    title: "404 - Page Not Found", 
    subTitle: "404",
    layout: "../views/layout/layout2"
  });
});

router.get("/sign-in", preventCache, (req, res) => {
  res.status(404).render("notFound", { 
    title: "404 - Page Not Found", 
    subTitle: "404",
    layout: "../views/layout/layout2"
  });
});

router.get("/signup", preventCache, redirectIfAuthenticated, (req, res) => {
  res.status(404).render("notFound", { 
    title: "404 - Page Not Found", 
    subTitle: "404",
    layout: "../views/layout/layout2"
  });
});

router.get("/sign-up", preventCache, redirectIfAuthenticated, (req, res) => {
  res.status(404).render("notFound", { 
    title: "404 - Page Not Found", 
    subTitle: "404",
    layout: "../views/layout/layout2"
  });
});

module.exports = router;
