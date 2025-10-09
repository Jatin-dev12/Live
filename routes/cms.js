  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/content-management', isAuthenticated, (req, res)=>{
      res.render('cms/contentManagement', {title: "Content Management", subTitle:"Content Management"})
  });
   router.get('/add-content-management', isAuthenticated, (req, res)=>{
      res.render('cms/addContentManagement', {title: "Add Content Management", subTitle:"Add Content Management"})
  });

  
  module.exports = router;
