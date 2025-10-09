  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/leads-management', isAuthenticated, (req, res)=>{
      res.render('leads/leadsManagement', {title: "Leads Management", subTitle:"Leads Management"})
  });
   router.get('/add-leads', isAuthenticated, (req, res)=>{
      res.render('leads/addLeads', {title: "Add Leads", subTitle:"Add Leads"})
  });
  
  module.exports = router;
