  const express = require('express');
  const router = express.Router();
  
  router.get('/add-file',(req, res)=>{
      res.render('media/addFile', {title: "Add Media File", subTitle:"Add Media File"})
  });
   router.get('/library',(req, res)=>{
      res.render('media/mediaLibrary', {title: "Media Library", subTitle:"Media Library"})
  });
  
  module.exports = router;
