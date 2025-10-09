  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  // Default dashboard route - redirect to main index
  router.get('/', isAuthenticated, (req, res)=>{
      res.redirect('/index');
  });
  
  router.get('/index2', isAuthenticated, (req, res)=>{
      res.render('dashboard/index2', {title: "Dashboard", subTitle:"CRM"})
  });
  
  router.get('/index3', isAuthenticated, (req, res)=>{
      res.render('dashboard/index3', {title: "Dashboard", subTitle:"eCommerce"})
  });

  router.get('/index4', isAuthenticated, (req, res)=>{
      res.render('dashboard/index4', {title: "Dashboard", subTitle:"Cryptocracy"})
  });
  
  router.get('/index5', isAuthenticated, (req, res)=>{
      res.render('dashboard/index5', {title: "Dashboard", subTitle:"Investment"})
  });

  router.get('/index6', isAuthenticated, (req, res)=>{
      res.render('dashboard/index6', {title: "Dashboard", subTitle:"LMS / Learning System"})
  });
  
  router.get('/index7', isAuthenticated, (req, res)=>{
      res.render('dashboard/index7', {title: "Dashboard", subTitle:"NFT & Gaming"})
  });

  router.get('/index8', isAuthenticated, (req, res)=>{
      res.render('dashboard/index8', {title: "Dashboard", subTitle:"Medical"})
  });
  
  router.get('/index9', isAuthenticated, (req, res)=>{
      res.render('dashboard/index9', {title: "Analytics", subTitle:"Analytics"})
  });

  router.get('/index10', isAuthenticated, (req, res)=>{
      res.render('dashboard/index10', {title: "POS & Inventory", subTitle:"POS & Inventory"})
  });

  module.exports = router;
