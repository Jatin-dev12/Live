  const express = require('express');
  const router = express.Router();
  
  router.get('/leads-management',(req, res)=>{
      res.render('leads/leadsManagement', {title: "Leads Management", subTitle:"Leads Management"})
  });
   router.get('/add-leads',(req, res)=>{
      res.render('leads/addLeads', {title: "Add Leads", subTitle:"Add Leads"})
  });
  
  module.exports = router;
