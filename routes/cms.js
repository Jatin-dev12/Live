  const express = require('express');
  const router = express.Router();
  
  router.get('/content-management',(req, res)=>{
      res.render('cms/contentManagement', {title: "Content Management", subTitle:"Content Management"})
  });
   router.get('/add-content-management',(req, res)=>{
      res.render('cms/addContentManagement', {title: "Add Content Management", subTitle:"Add Content Management"})
  });

  
  module.exports = router;
