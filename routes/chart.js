const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/column-chart', isAuthenticated, (req, res)=>{
    res.render('chart/columnChart', {title: "Column Chart", subTitle:"Components / Column Chart"})
});

router.get('/line-chart', isAuthenticated, (req, res)=>{
    res.render('chart/lineChart', {title: "Line Chart", subTitle:"Components / Line Chart"})
});

router.get('/pie-chart', isAuthenticated, (req, res)=>{
    res.render('chart/pieChart', {title: "Pie Chart", subTitle:"Components / Pie Chart"})
});


module.exports = router;
