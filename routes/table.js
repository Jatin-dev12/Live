  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/basic-table', isAuthenticated, (req, res)=>{
      res.render('table/basicTable', {title: "Basic Table", subTitle:"Basic Table"})
  });

  router.get('/data-table', isAuthenticated, (req, res)=>{
      res.render('table/dataTable', {title: "Data Table", subTitle:"Data Table"})
  });
  
  module.exports = router;
