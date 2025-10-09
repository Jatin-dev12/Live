  const express = require('express');
  const router = express.Router();
  
  router.get('/ads-management',(req, res)=>{
      res.render('ads/adsManagement', {title: "Ads Management", subTitle:"Ads Management"})
  });
   router.get('/add-ads-management',(req, res)=>{
      res.render('ads/addAdsManagement', {title: "Add Ads Management", subTitle:"Add Ads Management"})
  });

  
  module.exports = router;
