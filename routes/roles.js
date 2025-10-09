const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Permission = require('../models/Permission');

router.get('/roles-management', isAuthenticated, (req, res) => {
    res.render('roles/rolesManagement', {title: "Roles Management", subTitle: "Roles Management"})
});

router.get('/add-roles', isAuthenticated, async (req, res) => {
    try {
        const Role = require('../models/Role');
        const permissions = await Permission.find({ isActive: true }).sort({ module: 1, action: 1 });
        const roles = await Role.find({ isActive: true }).sort({ level: 1 });
        
        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});
        
        res.render('roles/addRoles', {
            title: "Add User",
            subTitle: "Create New User",
            permissions: permissions,
            groupedPermissions: groupedPermissions,
            roles: roles
        });
    } catch (error) {
        console.error('Error loading add user page:', error);
        res.render('roles/addRoles', {
            title: "Add User",
            subTitle: "Create New User",
            permissions: [],
            groupedPermissions: {},
            roles: []
        });
    }
});

router.get('/edit-roles/:id', isAuthenticated, async (req, res) => {
    try {
        const Role = require('../models/Role');
        const role = await Role.findById(req.params.id).populate('permissions');
        const permissions = await Permission.find({ isActive: true }).sort({ module: 1, action: 1 });
        
        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});
        
        res.render('roles/editRoles', {
            title: "Edit Roles",
            subTitle: "Edit Roles",
            role: role,
            permissions: permissions,
            groupedPermissions: groupedPermissions
        });
    } catch (error) {
        console.error('Error loading edit roles page:', error);
        res.redirect('/roles/roles-management');
    }
});

module.exports = router;
