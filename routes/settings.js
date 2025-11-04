  const express = require('express');
  const router = express.Router();
  const multer = require('multer');
  const path = require('path');
  const { isAuthenticated } = require('../middleware/auth');
  const SiteSettings = require('../models/SiteSettings');
  const { clearCache } = require('../utils/siteSettings');

  // Configure multer for logo upload
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'public/uploads/site-logo/');
      },
      filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
      }
  });

  const upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: function (req, file, cb) {
          const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);
          
          if (mimetype && extname) {
              return cb(null, true);
          } else {
              cb(new Error('Only image files are allowed!'));
          }
      }
  });
  
  // Site Settings Route (Admin only - includes SMTP data)
  router.get('/site-settings', isAuthenticated, async (req, res) => {
      try {
          // Explicitly select SMTP fields for admin view
          let settings = await SiteSettings.findOne().select('+smtp.host +smtp.port +smtp.secure +smtp.username +smtp.password +smtp.fromEmail +smtp.fromName');
          if (!settings) {
              settings = new SiteSettings();
              await settings.save();
          }
          res.render('settings/site-settings', {
              title: "Site Settings",
              subTitle: "Settings - Site Configuration",
              settings: settings
          });
      } catch (error) {
          console.error('Error loading site settings:', error);
          res.status(500).send('Error loading settings');
      }
  });

  // Test SMTP Connection (Admin only)
  router.post('/test-smtp', isAuthenticated, async (req, res) => {
      try {
          const { testSmtpConnection } = require('../utils/emailService');
          const result = await testSmtpConnection();
          res.json(result);
      } catch (error) {
          console.error('Error testing SMTP:', error);
          res.status(500).json({ success: false, message: error.message });
      }
  });

  // Upload Logo
  router.post('/upload-logo', isAuthenticated, upload.single('logo'), async (req, res) => {
      try {
          if (!req.file) {
              return res.status(400).json({ success: false, message: 'No file uploaded' });
          }

          const logoPath = '/uploads/site-logo/' + req.file.filename;

          let settings = await SiteSettings.findOne();
          if (!settings) {
              settings = new SiteSettings();
          }

          settings.logo = logoPath;
          settings.updatedBy = req.session.userId;
          await settings.save();

          // Clear cache after updating
          clearCache();

          res.json({ 
              success: true, 
              message: 'Logo uploaded successfully!',
              logoPath: logoPath
          });
      } catch (error) {
          console.error('Error uploading logo:', error);
          res.status(500).json({ success: false, message: error.message });
      }
  });

  // Update Site Settings
  router.post('/site-settings', isAuthenticated, async (req, res) => {
      try {
          const {
              siteName,
              siteDescription,
              contactEmail,
              contactPhone,
              contactNumber,
              whatsappNumber,
              facebook,
              twitter,
              instagram,
              linkedin,
              youtube,
              telegram,
              tiktok,
              whatsapp,
              smtpHost,
              smtpPort,
              smtpSecure,
              smtpUsername,
              smtpPassword,
              smtpFromEmail,
              smtpFromName
          } = req.body;

          let settings = await SiteSettings.findOne();
          if (!settings) {
              settings = new SiteSettings();
          }

          // Update general info
          settings.siteName = siteName;
          settings.siteDescription = siteDescription;
          settings.contactEmail = contactEmail;
          settings.contactPhone = contactPhone;
          settings.contactNumber = contactNumber;
          settings.whatsappNumber = whatsappNumber;

          // Update social media
          settings.socialMedia = {
              facebook,
              twitter,
              instagram,
              linkedin,
              youtube,
              telegram,
              tiktok,
              whatsapp
          };

          // Update SMTP
          settings.smtp = {
              host: smtpHost,
              port: smtpPort || 587,
              secure: smtpSecure === 'true',
              username: smtpUsername,
              password: smtpPassword,
              fromEmail: smtpFromEmail,
              fromName: smtpFromName
          };

          settings.updatedBy = req.session.userId;
          await settings.save();

          // Clear cache after updating
          clearCache();

          res.json({ success: true, message: 'Settings saved successfully!' });
      } catch (error) {
          console.error('Error updating site settings:', error);
          res.status(500).json({ success: false, message: 'Error updating settings' });
      }
  });

  // API: Get Social Media Links (Public - No sensitive data)
  router.get('/api/social-links', async (req, res) => {
      try {
          let settings = await SiteSettings.findOne().select('socialMedia');
          
          const defaultSocialMedia = {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: '',
              youtube: '',
              telegram: '',
              tiktok: '',
              whatsapp: ''
          };

          res.json({ 
              success: true, 
              data: settings?.socialMedia || defaultSocialMedia
          });
      } catch (error) {
          console.error('Error fetching social links:', error);
          res.status(500).json({ success: false, message: 'Error fetching social links' });
      }
  });

  // API: Get Public Site Settings (No SMTP or sensitive data)
  router.get('/api/site-settings', async (req, res) => {
      try {
          // Only select public fields, exclude SMTP and other sensitive data
          let settings = await SiteSettings.findOne().select('logo siteName siteDescription contactEmail contactPhone contactNumber whatsappNumber socialMedia');
          
          if (!settings) {
              return res.json({ 
                  success: true, 
                  data: {
                      logo: '',
                      siteName: '',
                      siteDescription: '',
                      contactEmail: '',
                      contactPhone: '',
                      contactNumber: '',
                      whatsappNumber: '',
                      socialMedia: {
                          facebook: '',
                          twitter: '',
                          instagram: '',
                          linkedin: '',
                          youtube: '',
                          telegram: '',
                          tiktok: '',
                          whatsapp: ''
                      }
                  }
              });
          }

          res.json({ 
              success: true, 
              data: {
                  logo: settings.logo || '',
                  siteName: settings.siteName || '',
                  siteDescription: settings.siteDescription || '',
                  contactEmail: settings.contactEmail || '',
                  contactPhone: settings.contactPhone || '',
                  contactNumber: settings.contactNumber || '',
                  whatsappNumber: settings.whatsappNumber || '',
                  socialMedia: settings.socialMedia || {}
              }
          });
      } catch (error) {
          console.error('Error fetching site settings:', error);
          res.status(500).json({ success: false, message: 'Error fetching site settings' });
      }
  });
  
  router.get('/company', isAuthenticated, (req, res)=>{
      res.render('settings/company', {title: "Company", subTitle:"Settings - Company"})
  });
  
  router.get('/currencies', isAuthenticated, (req, res)=>{
      res.render('settings/currencies', {title: "Currencies", subTitle:"Settings - Currencies"})
  });
  
  router.get('/languages', isAuthenticated, (req, res)=>{
      res.render('settings/languages', {title: "Languages", subTitle:"Settings - Languages"})
  });
  
  router.get('/notification', isAuthenticated, (req, res)=>{
      res.render('settings/notification', {title: "Notification", subTitle:"Settings - Notification"})
  });
  
  router.get('/notification-alert', isAuthenticated, (req, res)=>{
      res.render('settings/notificationAlert', {title: "Notification Alert", subTitle:"Settings - Notification Alert"})
  });
  
  router.get('/payment-getway', isAuthenticated, (req, res)=>{
      res.render('settings/paymentGetway', {title: "Payment Getway", subTitle:"Settings - Payment Getway"})
  });
  
  router.get('/theme', isAuthenticated, (req, res)=>{
      res.render('settings/theme', {title: "Theme", subTitle:"Settings - Theme"})
  });
  
  
  module.exports = router;
