  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/nav-menus', isAuthenticated, (req, res)=>{
      res.render('menu-management/menuMaster', {title: "Menu Management", subTitle:"Menu Management"})
  });
  
  
  module.exports = router;
