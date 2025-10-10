const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const User = require('../../models/User');
const { isAuthenticated, isSuperAdmin, hasPermission } = require('../../middleware/auth');
const { 
    validateCreateRole, 
    validateUpdateRole, 
    handleValidationErrors 
} = require('../../middleware/validators');

// Get all roles
router.get('/', isAuthenticated, hasPermission('roles-read', 'roles-manage'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isActive } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const roles = await Role.find(query)
            .populate('permissions', 'name slug module action')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        const count = await Role.countDocuments(query);
        
        res.json({
            success: true,
            data: roles,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roles',
            error: error.message
        });
    }
});

// Get single role
router.get('/:id', isAuthenticated, hasPermission('roles-read', 'roles-manage'), async (req, res) => {
    try {
        const role = await Role.findById(req.params.id)
            .populate('permissions', 'name slug module action description')
            .populate('createdBy', 'fullName email');
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        // Get user count for this role
        const userCount = await User.countDocuments({ role: role._id });
        
        res.json({
            success: true,
            data: {
                ...role.toObject(),
                userCount
            }
        });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching role',
            error: error.message
        });
    }
});

// Create new role
router.post('/', 
    isAuthenticated, 
    isSuperAdmin,
    async (req, res) => {
        try {
            const { name, description, permissions, level } = req.body;
            
            // Validate required fields
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name is required'
                });
            }
            
            if (!level || level < 1 || level > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid role level (1-5) is required'
                });
            }
            
            // Check if role name already exists
            const existingRole = await Role.findOne({ 
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
            });
            
            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name already exists'
                });
            }
            
            const role = new Role({
                name: name.trim(),
                description: description ? description.trim() : '',
                permissions: permissions || [],
                level: parseInt(level),
                createdBy: req.user._id
            });
            
            await role.save();
            
            const populatedRole = await Role.findById(role._id)
                .populate('createdBy', 'fullName email');
            
            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: populatedRole
            });
        } catch (error) {
            console.error('Create role error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating role',
                error: error.message
            });
        }
    }
);

// Update role
router.put('/:id',
    isAuthenticated,
    isSuperAdmin,
    validateUpdateRole,
    handleValidationErrors,
    async (req, res) => {
        try {
            const role = await Role.findById(req.params.id);
            
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }
            
            // Prevent modification of system roles
            if (role.isSystemRole) {
                return res.status(403).json({
                    success: false,
                    message: 'System roles cannot be modified'
                });
            }
            
            const { name, description, permissions, level, isActive } = req.body;
            
            if (name !== undefined) role.name = name;
            if (description !== undefined) role.description = description;
            if (permissions !== undefined) role.permissions = permissions;
            if (level !== undefined) role.level = level;
            if (isActive !== undefined) role.isActive = isActive;
            
            await role.save();
            
            const updatedRole = await Role.findById(role._id)
                .populate('permissions', 'name slug module action')
                .populate('createdBy', 'fullName email');
            
            res.json({
                success: true,
                message: 'Role updated successfully',
                data: updatedRole
            });
        } catch (error) {
            console.error('Update role error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating role',
                error: error.message
            });
        }
    }
);

// Delete role
router.delete('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        // Prevent deletion of system roles
        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                message: 'System roles cannot be deleted'
            });
        }
        
        // Check if any users have this role
        const userCount = await User.countDocuments({ role: role._id });
        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`
            });
        }
        
        await Role.deleteOne({ _id: role._id });
        
        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting role',
            error: error.message
        });
    }
});

// Assign permissions to role
router.post('/:id/permissions', isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
        const { permissions } = req.body;
        
        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Permissions must be an array'
            });
        }
        
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        // Verify all permissions exist
        const validPermissions = await Permission.find({ _id: { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more invalid permission IDs'
            });
        }
        
        role.permissions = permissions;
        await role.save();
        
        const updatedRole = await Role.findById(role._id)
            .populate('permissions', 'name slug module action');
        
        res.json({
            success: true,
            message: 'Permissions assigned successfully',
            data: updatedRole
        });
    } catch (error) {
        console.error('Assign permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning permissions',
            error: error.message
        });
    }
});

module.exports = router;
