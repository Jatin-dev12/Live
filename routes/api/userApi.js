const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const { isAuthenticated, isSuperAdmin, hasPermission } = require('../../middleware/auth');
const { 
    validateCreateUser, 
    validateUpdateUser,
    validateChangePassword,
    handleValidationErrors 
} = require('../../middleware/validators');

// Get all users
router.get('/', isAuthenticated, hasPermission('users-read', 'users-manage'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role, department, isActive } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.role = role;
        }
        
        if (department) {
            query.department = department;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const users = await User.find(query)
            .populate('role', 'name slug level')
            .populate('createdBy', 'fullName email')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        const count = await User.countDocuments(query);
        
        res.json({
            success: true,
            data: users,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get single user
router.get('/:id', isAuthenticated, hasPermission('users-read', 'users-manage'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    select: 'name slug module action'
                }
            })
            .populate('createdBy', 'fullName email')
            .select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// Create new user
router.post('/',
    isAuthenticated,
    hasPermission('users-create', 'users-manage'),
    validateCreateUser,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { fullName, email, password, phone, role, department, designation, description, customPermissions } = req.body;
            
            // Check if the user creating this has permission to assign this role
            const targetRole = await Role.findById(role);
            const creatorRole = await Role.findById(req.user.role);
            
            // Super admin can create any role
            // Other admins can only create roles with level >= their level
            if (creatorRole.slug !== 'super-admin' && targetRole.level < creatorRole.level) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot assign a role with higher privileges than your own'
                });
            }
            
            const user = new User({
                fullName,
                email: email.toLowerCase(),
                password,
                phone,
                role,
                customPermissions: customPermissions || [],
                department,
                designation,
                description,
                createdBy: req.user._id
            });
            
            await user.save();
            
            const createdUser = await User.findById(user._id)
                .populate('role', 'name slug level')
                .populate('customPermissions', 'name slug module action')
                .populate('createdBy', 'fullName email')
                .select('-password');
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: createdUser
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: error.message
            });
        }
    }
);

// Update user
router.put('/:id',
    isAuthenticated,
    hasPermission('users-update', 'users-manage'),
    validateUpdateUser,
    handleValidationErrors,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            const { fullName, email, phone, role, department, designation, description, isActive } = req.body;
            
            // Check role assignment permissions
            if (role && role !== user.role.toString()) {
                const targetRole = await Role.findById(role);
                const creatorRole = await Role.findById(req.user.role);
                
                if (creatorRole.slug !== 'super-admin' && targetRole.level < creatorRole.level) {
                    return res.status(403).json({
                        success: false,
                        message: 'You cannot assign a role with higher privileges than your own'
                    });
                }
                
                user.role = role;
            }
            
            if (fullName !== undefined) user.fullName = fullName;
            if (email !== undefined) user.email = email.toLowerCase();
            if (phone !== undefined) user.phone = phone;
            if (department !== undefined) user.department = department;
            if (designation !== undefined) user.designation = designation;
            if (description !== undefined) user.description = description;
            if (isActive !== undefined) user.isActive = isActive;
            
            await user.save();
            
            const updatedUser = await User.findById(user._id)
                .populate('role', 'name slug level')
                .populate('createdBy', 'fullName email')
                .select('-password');
            
            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating user',
                error: error.message
            });
        }
    }
);

// Delete user
router.delete('/:id', isAuthenticated, hasPermission('users-delete', 'users-manage'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }
        
        // Check if deleting user has permission
        const deleterRole = await Role.findById(req.user.role);
        
        if (deleterRole.slug !== 'super-admin' && user.role.level <= deleterRole.level) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete a user with equal or higher privileges'
            });
        }
        
        await User.deleteOne({ _id: user._id });
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// Change user password
router.post('/:id/change-password',
    isAuthenticated,
    validateChangePassword,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            // Only allow users to change their own password or super admin to change any
            const userRole = await Role.findById(req.user.role);
            if (req.params.id !== req.user._id.toString() && userRole.slug !== 'super-admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only change your own password'
                });
            }
            
            const user = await User.findById(req.params.id).select('+password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Verify current password
            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            user.password = newPassword;
            await user.save();
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password',
                error: error.message
            });
        }
    }
);

// Toggle user status
router.patch('/:id/toggle-status', isAuthenticated, hasPermission('users-update', 'users-manage'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent toggling your own status
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own status'
            });
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling user status',
            error: error.message
        });
    }
});

module.exports = router;
