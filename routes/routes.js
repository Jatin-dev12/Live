// Import required modules
const express = require("express");
const { optionalAuth, isAuthenticated } = require("../middleware/auth");

// Create a router
const router = express.Router();

const ai = require("./ai");
const authentication = require("./authentication");
const blog = require("./blog");
const chart = require("./chart");
const components = require("./components");
const cryptoCurrency = require("./cryptoCurrency");
const dashboard = require("./dashboard");
const forms = require("./forms");
const invoice = require("./invoice");
const rolesAndAccess = require("./rolesAndAccess");
const settings = require("./settings");
const table = require("./table");
const users = require("./users");
const leads = require("./leads");
const pagemaster = require("./page-master");
const menumanage = require("./menu-management");
const seo = require("./seo");
const cms = require("./cms");
const ads = require("./ads");
const media = require("./media");
const roles = require("./roles");
const urlRedirect = require("./urlRedirect");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const Lead = require('../models/Lead');
    const ContactQuery = require('../models/ContactQuery');
    const Page = require('../models/Page');
    const User = require('../models/User');

    // Define system/admin emails to exclude from user count
    const systemEmails = [
      'superadmin@example.com',
      'admin@example.com',
      'manager@example.com',
      'user@example.com'
    ];

    // Get counts from database
    const totalLeads = await Lead.countDocuments();
    const totalContactQueries = await ContactQuery.countDocuments();
    const totalPages = await Page.countDocuments();
    const totalUsers = await User.countDocuments({ email: { $nin: systemEmails } });

    // Get recent leads for the dashboard table
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email phone company source status interestedIn notes createdAt');

    res.render("index", {
      title: "Dashboard",
      subTitle: "ACRM",
      totalLeads,
      totalContactQueries,
      totalPages,
      totalUsers,
      recentLeads
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render("index", {
      title: "Dashboard",
      subTitle: "ACRM",
      totalLeads: 0,
      totalContactQueries: 0,
      totalPages: 0,
      totalUsers: 0,
      recentLeads: []
    });
  }
});

router.get("/index", isAuthenticated, async (req, res) => {
  try {
    // Check if user has dashboard permission
    const userRole = res.locals.userRole;
    const userPermissions = res.locals.userPermissions || [];
    
    // If not super-admin and doesn't have dashboard permission, show access denied
    if (userRole !== 'super-admin' && !userPermissions.includes('dashboard')) {
      return res.render("errors/access-denied", {
        title: "Access Denied",
        subTitle: "Dashboard",
        message: "You don't have permission to access the Dashboard."
      });
    }

    const Lead = require('../models/Lead');
    const ContactQuery = require('../models/ContactQuery');
    const Page = require('../models/Page');
    const User = require('../models/User');

    // Define system/admin emails to exclude from user count
    const systemEmails = [
      'superadmin@example.com',
      'admin@example.com',
      'manager@example.com',
      'user@example.com'
    ];

    // Get counts from database
    const totalLeads = await Lead.countDocuments();
    const totalContactQueries = await ContactQuery.countDocuments();
    const totalPages = await Page.countDocuments();
    const totalUsers = await User.countDocuments({ email: { $nin: systemEmails } });

    // Get recent leads for the dashboard table
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email phone company source status interestedIn notes createdAt');

    res.render("index", {
      title: "Dashboard",
      subTitle: "ACRM",
      totalLeads,
      totalContactQueries,
      totalPages,
      totalUsers,
      recentLeads
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render("index", {
      title: "Dashboard",
      subTitle: "ACRM",
      totalLeads: 0,
      totalContactQueries: 0,
      totalPages: 0,
      totalUsers: 0,
      recentLeads: []
    });
  }
});

router.get("/blankpage", isAuthenticated, (req, res) => {
  res.render("blankpage", { title: "Blank Page", subTitle: "Blank Page" });
});

router.get("/calendar", isAuthenticated, (req, res) => {
  res.render("calendar", { title: "Calendar", subTitle: "Components / Calendar" });
});

router.get("/chat", isAuthenticated, (req, res) => {
  res.render("chat", { title: "Chat", subTitle: "Chat" });
});

router.get("/chat-profile", isAuthenticated, (req, res) => {
  res.render("chatProfile", { title: "Dashboard", subTitle: "subTitle" });
});

router.get("/comingsoon", (req, res) => {
  res.render("comingsoon", { title: "Dashboard", subTitle: "subTitle", layout: "../views/layout/layout2" });
});

router.get("/email", isAuthenticated, (req, res) => {
  res.render("email", { title: "Email", subTitle: "Components / Email" });
});


router.get("/faqs", isAuthenticated, (req, res) => {
  res.render("faqs", { title: "Faq", subTitle: "Faq" });
});

router.get("/gallery", isAuthenticated, (req, res) => {
  res.render("gallery", { title: "Gallery", subTitle: "Gallery" });
});

router.get("/kanban", isAuthenticated, (req, res) => {
  res.render("kanban", { title: "Kanban", subTitle: "Kanban" });
});

router.get("/maintenance", (req, res) => {
  res.render("maintenance", { title: "Dashboard", subTitle: "subTitle", layout: "../views/layout/layout2" });
});

router.get("/not-found", (req, res) => {
  res.render("notFound", { title: "404", subTitle: "404" });
});

router.get("/pricing", isAuthenticated, (req, res) => {
  res.render("pricing", { title: "Pricing", subTitle: "Pricing" });
});

router.get("/stared", isAuthenticated, (req, res) => {
  res.render("stared", { title: "Dashboard", subTitle: "subTitle" });
});

router.get("/terms-and-conditions", isAuthenticated, (req, res) => {
  res.render("termsAndConditions", { title: "Terms & Conditions", subTitle: "Terms & Conditions" });
});

router.get("/testimonials", isAuthenticated, (req, res) => {
  res.render("testimonials", { title: "Testimonials", subTitle: "Testimonials" });
});

router.get("/view-details", isAuthenticated, (req, res) => {
  res.render("viewDetails", { title: "Dashboard", subTitle: "subTitle" });
});

router.get("/widgets", isAuthenticated, (req, res) => {
  res.render("widgets", { title: "Widgets", subTitle: "Widgets" });
});
// router.get("/content-management", (req, res) => {
//   res.render("contentManagement", { title: "Content Management", subTitle: "Content Management" });
// });

router.use("/ai", ai);
router.use("/authentication", authentication);
router.use("/blog", blog);
router.use("/chart", chart);
router.use("/components", components);
router.use("/crypto-currency", cryptoCurrency);
router.use("/dashboard", dashboard);
router.use("/forms", forms);
router.use("/invoice", invoice);
router.use("/role-and-access", rolesAndAccess);
router.use("/settings", settings);
router.use("/table", table);
router.use("/users", users);
router.use("/leads", leads);
router.use("/page-master", pagemaster);
router.use("/menu-management", menumanage);
router.use("/seo", seo);
router.use("/cms", cms);
router.use("/ads", ads);
router.use("/media", media);
router.use("/roles", roles);
router.use("/url-redirect", urlRedirect);

// Dynamic page rendering - This should be last to catch all dynamic routes
router.get('/:slug', isAuthenticated, async (req, res, next) => {
  try {
    const Page = require('../models/Page');
    const Content = require('../models/Content');

    // Try to find a page with this slug or path
    const page = await Page.findOne({
      $or: [
        { slug: req.params.slug },
        { path: `/${req.params.slug}` }
      ],
      status: 'active'
    });

    if (!page) {
      return next(); // Let it fall through to 404
    }

    // Get all active content for this page
    const contents = await Content.find({
      page: page._id,
      status: 'active'
    }).sort({ order: 1, createdAt: -1 });

    // Render the page with its content
    res.render('dynamic-page/dynamicPage', {
      title: page.metaTitle || page.name,
      subTitle: page.name,
      page: page,
      contents: contents
    });
  } catch (error) {
    console.error('Error rendering dynamic page:', error);
    next();
  }
});

// Export the router
module.exports = function (app) {
  app.use("/", router);
};
