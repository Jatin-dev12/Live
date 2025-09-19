  const express = require('express');
  const router = express.Router();
  
  router.get('/web-page-master',(req, res)=>{
      res.render('page-master/websitePageMaster', {title: "Website Page Master", subTitle:"Website Page Master"})
  });
   router.get('/add-page',(req, res)=>{
      res.render('page-master/addPageMaster', {title: "Add Page", subTitle:"Add Page"})
  });
  
  module.exports = router;
