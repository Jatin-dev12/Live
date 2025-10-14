  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  const Lead = require('../models/Lead');
  
  router.get('/leads-management', isAuthenticated, async (req, res)=>{
      try {
          const leads = await Lead.find()
              .populate('assignedTo', 'fullName email')
              .populate('createdBy', 'fullName email')
              .sort({ createdAt: -1 })
              .lean();
          
          res.render('leads/leadsManagement', {
              title: "Leads Management", 
              subTitle:"Leads Management",
              leads: leads
          });
      } catch (error) {
          console.error('Error loading leads:', error);
          res.render('leads/leadsManagement', {
              title: "Leads Management", 
              subTitle:"Leads Management",
              leads: []
          });
      }
  });
  
   router.get('/add-leads', isAuthenticated, (req, res)=>{
      res.render('leads/addLeads', {title: "Add Leads", subTitle:"Add Leads"})
  });
  
  module.exports = router;
