  const express = require('express');
  const router = express.Router();
  
  router.get('/seo-management',(req, res)=>{
      res.render('seo/seoManagement', {title: "SEO Management", subTitle:"SEO Management"})
  });
   router.get('/add-seo-content',(req, res)=>{
      res.render('seo/addSeoContent', {title: "Add SEO Content", subTitle:"Add SEO Content"})
  });
   router.get('/edit-seo-content',(req, res)=>{
      res.render('seo/editSeoContent', {title: "Edit SEO Content", subTitle:"Edit SEO Content"})
  });
  
  module.exports = router;
