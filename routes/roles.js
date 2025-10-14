const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Permission = require('../models/Permission');

router.get('/roles-management', isAuthenticated, async (req, res) => {
    try {
        const User = require('../models/User');
        const Role = require('../models/Role');
        
        // Define system/admin emails to exclude
        const systemEmails = [
            'superadmin@example.com',
            'admin@example.com',
            'manager@example.com',
            'user@example.com'
        ];
        
        // Fetch all users from database, excluding system accounts
        const users = await User.find({
            email: { $nin: systemEmails }
        })
            .populate('role', 'name level slug')
            .populate('createdBy', 'fullName email')
            .select('-password')
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance
        
        // Fetch all roles for the filter dropdown (exclude Super Admin)
        const roles = await Role.find({ 
            isActive: true,
            slug: { $ne: 'super-admin' }
        }).select('name').sort({ level: 1 }).lean();
        
        console.log('=== FETCHING USERS FROM DB ===');
        console.log('Total users found (excluding system accounts):', users.length);
        
        // Log each user for debugging
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`, {
                id: user._id,
                name: user.fullName,
                email: user.email,
                role: user.role ? user.role.name : 'No Role',
                isActive: user.isActive,
                createdAt: user.createdAt
            });
        });
        
        console.log('=== SENDING TO TEMPLATE ===');
        
        res.render('roles/rolesManagement', {
            title: "Users Management", 
            subTitle: "Users Management",
            users: users,
            roles: roles
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        res.render('roles/rolesManagement', {
            title: "Users Management", 
            subTitle: "Users Management",
            users: [],
            roles: []
        });
    }
});

router.get('/add-roles', isAuthenticated, async (req, res) => {
    try {
        const Role = require('../models/Role');
        // Exclude Super Admin role from the list (slug: 'super-admin')
        const roles = await Role.find({ 
            isActive: true,
            slug: { $ne: 'super-admin' }
        }).sort({ level: 1 });
        
        res.render('roles/addRoles', {
            title: "Add User",
            subTitle: "Create New User",
            roles: roles
        });
    } catch (error) {
        console.error('Error loading add user page:', error);
        res.render('roles/addRoles', {
            title: "Add User",
            subTitle: "Create New User",
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

// Create test user route (for debugging)
router.get('/create-test-user', async (req, res) => {
    try {
        const User = require('../models/User');
        const Role = require('../models/Role');
        
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            return res.json({
                success: false,
                message: 'Test user already exists',
                user: {
                    name: existingUser.fullName,
                    email: existingUser.email
                }
            });
        }
        
        // Find or create a basic role
        let role = await Role.findOne({ name: 'User' });
        if (!role) {
            role = new Role({
                name: 'User',
                level: 4,
                permissions: ['dashboard']
            });
            await role.save();
        }
        
        // Create test user
        const testUser = new User({
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'Test@123456',
            role: role._id,
            phone: '1234567890'
        });
        
        await testUser.save();
        
        res.json({
            success: true,
            message: 'Test user created successfully',
            user: {
                name: testUser.fullName,
                email: testUser.email,
                role: role.name
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Quick user count route
router.get('/user-count', async (req, res) => {
    try {
        const User = require('../models/User');
        const count = await User.countDocuments();
        const users = await User.find({}).select('fullName email isActive createdAt').limit(5);
        
        res.json({
            success: true,
            totalUsers: count,
            recentUsers: users
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Simple test route to check database connection
router.get('/test-db', async (req, res) => {
    try {
        const User = require('../models/User');
        const Role = require('../models/Role');
        
        const userCount = await User.countDocuments();
        const roleCount = await Role.countDocuments();
        
        const sampleUsers = await User.find({}).limit(3).select('fullName email isActive');
        
        res.json({
            success: true,
            database: {
                userCount: userCount,
                roleCount: roleCount,
                sampleUsers: sampleUsers
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Debug route to show all users with creator info
router.get('/debug-users', isAuthenticated, async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find({})
            .populate('role', 'name slug level')
            .populate('createdBy', 'fullName email role')
            .select('-password')
            .sort({ createdAt: -1 });
        
        // Format the data for display
        const formattedUsers = users.map(user => ({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || 'N/A',
            role: user.role ? user.role.name : 'No Role',
            roleLevel: user.role ? user.role.level : 'N/A',
            isActive: user.isActive,
            createdBy: user.createdBy ? {
                name: user.createdBy.fullName,
                email: user.createdBy.email
            } : 'System/Direct',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
        
        res.json({
            success: true,
            message: 'All users in database',
            totalUsers: users.length,
            data: formattedUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

module.exports = router;
