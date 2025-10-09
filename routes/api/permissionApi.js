const express = require('express');
const router = express.Router();
const Permission = require('../../models/Permission');
const { isAuthenticated, isSuperAdmin } = require('../../middleware/auth');
const { validateCreatePermission, handleValidationErrors } = require('../../middleware/validators');

// Get all permissions
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { module, action, isActive } = req.query;
        
        const query = {};
        
        if (module) {
            query.module = module;
        }
        
        if (action) {
            query.action = action;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const permissions = await Permission.find(query)
            .sort({ module: 1, action: 1 })
            .lean();
        
        // Group by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});
        
        res.json({
            success: true,
            data: permissions,
            grouped: groupedPermissions
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
});

// Get single permission
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }
        
        res.json({
            success: true,
            data: permission
        });
    } catch (error) {
        console.error('Get permission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permission',
            error: error.message
        });
    }
});

// Create new permission
router.post('/',
    isAuthenticated,
    isSuperAdmin,
    validateCreatePermission,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { name, description, module, action } = req.body;
            
            const permission = new Permission({
                name,
                description,
                module,
                action
            });
            
            await permission.save();
            
            res.status(201).json({
                success: true,
                message: 'Permission created successfully',
                data: permission
            });
        } catch (error) {
            console.error('Create permission error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating permission',
                error: error.message
            });
        }
    }
);

// Update permission
router.put('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }
        
        const { name, description, isActive } = req.body;
        
        if (name !== undefined) permission.name = name;
        if (description !== undefined) permission.description = description;
        if (isActive !== undefined) permission.isActive = isActive;
        
        await permission.save();
        
        res.json({
            success: true,
            message: 'Permission updated successfully',
            data: permission
        });
    } catch (error) {
        console.error('Update permission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating permission',
            error: error.message
        });
    }
});

// Delete permission
router.delete('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }
        
        await Permission.deleteOne({ _id: permission._id });
        
        res.json({
            success: true,
            message: 'Permission deleted successfully'
        });
    } catch (error) {
        console.error('Delete permission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting permission',
            error: error.message
        });
    }
});

module.exports = router;
