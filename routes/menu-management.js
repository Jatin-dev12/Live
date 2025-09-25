  const express = require('express');
  const router = express.Router();
  
  router.get('/nav-menus',(req, res)=>{
      res.render('menu-management/menuMaster', {title: "Menu Management", subTitle:"Menu Management"})
  });
  
  
  module.exports = router;
