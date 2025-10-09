  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/form-validation', isAuthenticated, (req, res)=>{
      res.render('forms/formValidation', {title: "Form Validation", subTitle:"Form Validation"})
  });
  
  router.get('/form-wizard', isAuthenticated, (req, res)=>{
      res.render('forms/formWizard', {title: "Wizard", subTitle:"Wizard"})
  });

  router.get('/input-forms', isAuthenticated, (req, res)=>{
      res.render('forms/inputForms', {title: "Input Form", subTitle:"Input Form"})
  });
 

  router.get('/input-layout', isAuthenticated, (req, res)=>{
      res.render('forms/inputLayout', {title: "Input Layout", subTitle:"Input Layout"})
  });

  module.exports = router;
