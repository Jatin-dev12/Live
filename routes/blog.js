const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/add-blog', isAuthenticated, (req, res)=>{
      res.render('blog/addBlog', {title: "Add Blog", subTitle:"Add Blog"})
  });
  
  router.get('/blog', isAuthenticated, (req, res)=>{
      res.render('blog/blog', {title: "Blog", subTitle:"Blog"})
  });

  router.get('/blog-details', isAuthenticated, (req, res)=>{
      res.render('blog/blogDetails', {title: "Blog Details", subTitle:"Blog Details"})
  });

  module.exports = router;