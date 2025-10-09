  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/ads-management', isAuthenticated, (req, res)=>{
      res.render('ads/adsManagement', {title: "Ads Management", subTitle:"Ads Management"})
  });
   router.get('/add-ads-management', isAuthenticated, (req, res)=>{
      res.render('ads/addAdsManagement', {title: "Add Ads Management", subTitle:"Add Ads Management"})
  });

  
  module.exports = router;
