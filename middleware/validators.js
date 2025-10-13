const { body, param, validationResult } = require('express-validator');
const Role = require('../models/Role');
const User = require('../models/User');
const Permission = require('../models/Permission');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Role validation rules
exports.validateCreateRole = [
    body('name')
        .trim()
        .notEmpty().withMessage('Role name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Role name must be between 3 and 50 characters')
        .custom(async (value) => {
            const existingRole = await Role.findOne({ 
                name: { $regex: new RegExp(`^${value}$`, 'i') } 
            });
            if (existingRole) {
                throw new Error('Role name already exists');
            }
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    
    body('permissions')
        .optional()
        .isArray().withMessage('Permissions must be an array')
        .custom(async (value) => {
            if (value && value.length > 0) {
                const validPermissions = await Permission.find({ _id: { $in: value } });
                if (validPermissions.length !== value.length) {
                    throw new Error('One or more invalid permission IDs');
                }
            }
            return true;
        }),
    
    body('level')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Level must be between 1 and 5')
];

exports.validateUpdateRole = [
    param('id')
        .isMongoId().withMessage('Invalid role ID'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Role name must be between 3 and 50 characters')
        .custom(async (value, { req }) => {
            const existingRole = await Role.findOne({ 
                name: { $regex: new RegExp(`^${value}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingRole) {
                throw new Error('Role name already exists');
            }
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    
    body('permissions')
        .optional()
        .isArray().withMessage('Permissions must be an array')
        .custom(async (value) => {
            if (value && value.length > 0) {
                const validPermissions = await Permission.find({ _id: { $in: value } });
                if (validPermissions.length !== value.length) {
                    throw new Error('One or more invalid permission IDs');
                }
            }
            return true;
        }),
    
    body('level')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Level must be between 1 and 5'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean')
];

// User validation rules
exports.validateCreateUser = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail()
        .custom(async (value) => {
            const existingUser = await User.findOne({ email: value.toLowerCase() });
            if (existingUser) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .custom((value) => {
            console.log('=== PASSWORD VALIDATION ===');
            console.log('Password value:', value);
            console.log('Password type:', typeof value);
            
            const hasLowercase = /[a-z]/.test(value);
            const hasUppercase = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecialChar = /[@$!%*?&]/.test(value);
            
            console.log('Validation results:', {
                hasLowercase,
                hasUppercase,
                hasNumber,
                hasSpecialChar
            });
            
            if (!hasLowercase) {
                console.log('FAILED: No lowercase');
                throw new Error('Password must contain at least one lowercase letter');
            }
            if (!hasUppercase) {
                console.log('FAILED: No uppercase');
                throw new Error('Password must contain at least one uppercase letter');
            }
            if (!hasNumber) {
                console.log('FAILED: No number');
                throw new Error('Password must contain at least one number');
            }
            if (!hasSpecialChar) {
                console.log('FAILED: No special char');
                throw new Error('Password must contain at least one special character (@$!%*?&)');
            }
            
            // Only allow alphanumeric and the specified special characters
            if (!/^[A-Za-z\d@$!%*?&]+$/.test(value)) {
                console.log('FAILED: Invalid characters');
                throw new Error('Password can only contain letters, numbers, and special characters (@$!%*?&)');
            }
            
            console.log('Password validation PASSED');
            return true;
        }),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Please enter a valid phone number'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isMongoId().withMessage('Invalid role ID')
        .custom(async (value) => {
            const role = await Role.findById(value);
            if (!role) {
                throw new Error('Role not found');
            }
            if (!role.isActive) {
                throw new Error('Selected role is not active');
            }
            return true;
        }),
    
    body('department')
        .optional()
        .trim()
        .isIn(['Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Support', 'Management'])
        .withMessage('Invalid department'),
    
    body('designation')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
];

exports.validateUpdateUser = [
    param('id')
        .isMongoId().withMessage('Invalid user ID'),
    
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            const existingUser = await User.findOne({ 
                email: value.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Please enter a valid phone number'),
    
    body('role')
        .optional()
        .isMongoId().withMessage('Invalid role ID')
        .custom(async (value) => {
            const role = await Role.findById(value);
            if (!role) {
                throw new Error('Role not found');
            }
            if (!role.isActive) {
                throw new Error('Selected role is not active');
            }
            return true;
        }),
    
    body('department')
        .optional()
        .trim()
        .isIn(['Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Support', 'Management'])
        .withMessage('Invalid department'),
    
    body('designation')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean')
];

exports.validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .custom((value) => {
            const hasLowercase = /[a-z]/.test(value);
            const hasUppercase = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecialChar = /[@$!%*?&]/.test(value);
            
            if (!hasLowercase) {
                throw new Error('Password must contain at least one lowercase letter');
            }
            if (!hasUppercase) {
                throw new Error('Password must contain at least one uppercase letter');
            }
            if (!hasNumber) {
                throw new Error('Password must contain at least one number');
            }
            if (!hasSpecialChar) {
                throw new Error('Password must contain at least one special character (@$!%*?&)');
            }
            
            // Only allow alphanumeric and the specified special characters
            if (!/^[A-Za-z\d@$!%*?&]+$/.test(value)) {
                throw new Error('Password can only contain letters, numbers, and special characters (@$!%*?&)');
            }
            
            return true;
        }),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your new password')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

// Permission validation rules
exports.validateCreatePermission = [
    body('name')
        .trim()
        .notEmpty().withMessage('Permission name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Permission name must be between 3 and 50 characters')
        .custom(async (value) => {
            const existingPermission = await Permission.findOne({ 
                name: { $regex: new RegExp(`^${value}$`, 'i') } 
            });
            if (existingPermission) {
                throw new Error('Permission name already exists');
            }
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    
    body('module')
        .notEmpty().withMessage('Module is required')
        .isIn(['users', 'roles', 'dashboard', 'blog', 'leads', 'invoice', 'settings', 'cms', 'media', 'seo', 'ads', 'reports'])
        .withMessage('Invalid module'),
    
    body('action')
        .notEmpty().withMessage('Action is required')
        .isIn(['create', 'read', 'update', 'delete', 'manage'])
        .withMessage('Invalid action')
];

// Login validation
exports.validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];
