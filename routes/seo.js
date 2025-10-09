  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/seo-management', isAuthenticated, (req, res)=>{
      res.render('seo/seoManagement', {title: "SEO Management", subTitle:"SEO Management"})
  });
   router.get('/add-seo-content', isAuthenticated, (req, res)=>{
      res.render('seo/addSeoContent', {title: "Add SEO Content", subTitle:"Add SEO Content"})
  });
   router.get('/edit-seo-content', isAuthenticated, (req, res)=>{
      res.render('seo/editSeoContent', {title: "Edit SEO Content", subTitle:"Edit SEO Content"})
  });
  
  module.exports = router;
