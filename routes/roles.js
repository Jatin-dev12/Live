  const express = require('express');
  const router = express.Router();
  
  router.get('/roles-management',(req, res)=>{
      res.render('roles/rolesManagement', {title: "Roles Management", subTitle:"Roles Management"})
  });
   router.get('/add-roles',(req, res)=>{
      res.render('roles/addRoles', {title: "Add Roles", subTitle:"Add Roles"})
  });
//    router.get('/edit-roles',(req, res)=>{
//       res.render('roles/editRoles', {title: "Edit Roles", subTitle:"Edit Roles"})
//   });

  
  module.exports = router;
