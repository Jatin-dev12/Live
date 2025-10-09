const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/assign-role', isAuthenticated, (req, res)=>{
    res.render('roleAndAccess/assignRole', {title: "Role & Access", subTitle:"Role & Access"})
});

router.get('/role-access', isAuthenticated, (req, res)=>{
    res.render('roleAndAccess/roleAccess', {title: "Role & Access", subTitle:"Role & Access"})
});

module.exports = router;