  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/web-page-master', isAuthenticated, (req, res)=>{
      res.render('page-master/websitePageMaster', {title: "Website Page Master", subTitle:"Website Page Master"})
  });
   router.get('/add-page', isAuthenticated, (req, res)=>{
      res.render('page-master/addPageMaster', {title: "Add Page", subTitle:"Add Page"})
  });
  
  module.exports = router;
