const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/add-new', isAuthenticated, (req, res)=>{
    res.render('invoice/addNew', {title: "Invoice List", subTitle:"Invoice List"})
});

router.get('/edit', isAuthenticated, (req, res)=>{
    res.render('invoice/edit', {title: "Invoice List", subTitle:"Invoice List"})
});

router.get('/list', isAuthenticated, (req, res)=>{
    res.render('invoice/list', {title: "Invoice List", subTitle:"Invoice List"})
});

router.get('/preview', isAuthenticated, (req, res)=>{
    res.render('invoice/preview', {title: "Invoice List", subTitle:"Invoice List"})
});


module.exports = router;  
