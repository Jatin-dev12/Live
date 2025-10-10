const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

router.get('/add-user', isAuthenticated, async (req, res) => {
    try {
        const roles = await Role.find({ isActive: true }).select('name _id level').sort({ level: 1 });
        const permissions = await Permission.find({ isActive: true }).sort({ module: 1, action: 1 });
        
        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});
        
        res.render('users/addUser', {
            title: "Add User",
            subTitle: "Add User",
            roles: roles,
            permissions: permissions,
            groupedPermissions: groupedPermissions
        });
    } catch (error) {
        console.error('Error loading add user page:', error);
        res.render('users/addUser', {
            title: "Add User",
            subTitle: "Add User",
            roles: [],
            permissions: [],
            groupedPermissions: {}
        });
    }
});

router.get('/users-grid', isAuthenticated, (req, res) => {
    res.render('users/usersGrid', {title: "Users Grid", subTitle: "Users Grid"})
});

router.get('/users-list', isAuthenticated, (req, res) => {
    res.render('users/usersList', {title: "Users List", subTitle: "Users List"})
});

router.get('/user-management', isAuthenticated, (req, res) => {
    res.render('users/usersManagement', {title: "User Management", subTitle: "User Management"})
});

router.get('/view-profile', isAuthenticated, (req, res) => {
    res.render('users/viewProfile', {title: "View Profile", subTitle: "View Profile"})
});

// Edit user route
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const User = require('../models/User');
        const userId = req.params.id;
        
        // Fetch user data
        const user = await User.findById(userId)
            .populate('role', 'name _id level')
            .populate('createdBy', 'fullName email')
            .select('-password');
        
        if (!user) {
            return res.redirect('/roles/roles-management?error=User not found');
        }
        
        // Fetch all roles for dropdown
        const roles = await Role.find({ isActive: true }).select('name _id level').sort({ level: 1 });
        const permissions = await Permission.find({ isActive: true }).sort({ module: 1, action: 1 });
        
        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});
        
        res.render('users/editUser', {
            title: "Edit User",
            subTitle: "Edit User",
            user: user,
            roles: roles,
            permissions: permissions,
            groupedPermissions: groupedPermissions
        });
    } catch (error) {
        console.error('Error loading edit user page:', error);
        res.redirect('/roles/roles-management?error=Error loading user data');
    }
});

module.exports = router;
