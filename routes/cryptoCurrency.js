  const express = require('express');
  const router = express.Router();
  const { isAuthenticated } = require('../middleware/auth');
  
  router.get('/marketplace', isAuthenticated, (req, res)=>{
      res.render('cryptoCurrency/marketplace', {title: "Marketplace", subTitle:"Marketplace"})
  });
  
  router.get('/marketplace-details', isAuthenticated, (req, res)=>{
      res.render('cryptoCurrency/marketplaceDetails', {title: "Marketplace Details", subTitle:"Marketplace Details"})
  });
  
  router.get('/portfolio', isAuthenticated, (req, res)=>{
      res.render('cryptoCurrency/portfolio', {title: "Portfolios", subTitle:"Portfolios"})
  });
  
  router.get('/wallet', isAuthenticated, (req, res)=>{
      res.render('cryptoCurrency/wallet', {title: "Wallet", subTitle:"Wallet"})
  });
  
  module.exports = router;
