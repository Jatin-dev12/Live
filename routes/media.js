  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/add-file', isAuthenticated, (req, res)=>{
      res.render('media/addFile', {title: "Add Media File", subTitle:"Add Media File"})
  });
   router.get('/library', isAuthenticated, (req, res)=>{
      res.render('media/mediaLibrary', {title: "Media Library", subTitle:"Media Library"})
  });
  
  module.exports = router;
