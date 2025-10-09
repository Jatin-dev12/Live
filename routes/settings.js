  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
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
