const User = require('../models/User');
const Role = require('../models/Role');

// Check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please login.'
                });
            }
            return res.redirect('/authentication/sign-in');
        }

        // Get user with role and permissions
        const user = await User.findById(req.session.userId)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            })
            .select('-password');

        if (!user) {
            req.session.destroy();
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }
            return res.redirect('/authentication/sign-in');
        }

        if (!user.isActive) {
            req.session.destroy();
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated.'
                });
            }
            return res.redirect('/authentication/sign-in?error=account_deactivated');
        }

        req.user = user;
        res.locals.user = user;
        
        // Extract user permissions for sidebar filtering and button visibility
        let userPermissions = [];
        let userModules = [];
        
        // Get permissions from role
        if (user.role && user.role.permissions) {
            // Handle both old ObjectId-based permissions and new string-based permissions
            userPermissions = user.role.permissions.map(p => {
                // If it's an object with slug property (old system)
                if (typeof p === 'object' && p.slug) {
                    return p.slug;
                }
                // If it's a string (new system)
                if (typeof p === 'string') {
                    return p;
                }
                return null;
            }).filter(Boolean);
            
            userModules = user.role.permissions.map(p => {
                // If it's an object with module property (old system)
                if (typeof p === 'object' && p.module) {
                    return p.module;
                }
                // If it's a string (new system), extract the module from slug (e.g., "cms-create" -> "cms")
                if (typeof p === 'string') {
                    return p.split('-')[0];
                }
                return null;
            }).filter(Boolean);
        }
        
        // Also get custom permissions assigned directly to the user
        if (user.customPermissions && Array.isArray(user.customPermissions)) {
            const customPerms = user.customPermissions.map(p => {
                // If it's a string, it's the permission slug
                if (typeof p === 'string') {
                    return p;
                }
                // If it's an object with slug property
                if (typeof p === 'object' && p.slug) {
                    return p.slug;
                }
                return null;
            }).filter(Boolean);
            
            // Extract modules from custom permissions
            const customModules = customPerms.map(p => p.split('-')[0]);
            
            // Merge with role permissions
            userPermissions = [...userPermissions, ...customPerms];
            userModules = [...userModules, ...customModules];
        }
        
        // No default permissions for any role except Super Admin
        // All users (Admin, Manager, Content Manager, User, etc.) will only see
        // the sidebar tabs based on checkboxes selected during user creation
        
        res.locals.userPermissions = [...new Set(userPermissions)]; // All permission slugs (unique)
        res.locals.userModules = [...new Set(userModules)]; // Unique modules
        res.locals.userRole = user.role ? user.role.slug : null;
        res.locals.userLevel = user.role ? user.role.level : 99;
        res.locals.isReadOnly = user.role && user.role.slug === 'user'; // Flag for read-only users
        
        // Helper function to check if user has permission
        res.locals.hasPermission = function(permission) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(permission);
        };
        
        // Simple permission check - if user has ANY permission for a module, they have ALL CRUD permissions
        res.locals.canCreate = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            // Check if user has any permission for this module
            return userModules.includes(module);
        };
        
        res.locals.canUpdate = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            // Check if user has any permission for this module
            return userModules.includes(module);
        };
        
        res.locals.canDelete = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            // Check if user has any permission for this module
            return userModules.includes(module);
        };
        
        res.locals.canRead = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            // Check if user has any permission for this module
            return userModules.includes(module);
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(500).json({
                success: false,
                message: 'Authentication error occurred'
            });
        }
        return res.redirect('/authentication/sign-in');
    }
};

// Check if user has specific role
exports.hasRole = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = await Role.findById(req.user.role);
            
            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid role assigned'
                });
            }

            if (!roles.includes(userRole.slug)) {
                if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to access this resource'
                    });
                }
                return res.redirect('/not-found');
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error occurred'
            });
        }
    };
};

// Check if user has specific permission
exports.hasPermission = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = await Role.findById(req.user.role).populate('permissions');
            
            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid role assigned'
                });
            }

            // Super admin has all permissions
            if (userRole.slug === 'super-admin') {
                return next();
            }

            // Handle both old ObjectId-based permissions and new string-based permissions
            const userPermissions = userRole.permissions.map(p => {
                // If it's an object with slug property (old system)
                if (typeof p === 'object' && p.slug) {
                    return p.slug;
                }
                // If it's a string (new system)
                if (typeof p === 'string') {
                    return p;
                }
                return null;
            }).filter(Boolean);
            
            const hasPermission = permissions.some(permission => userPermissions.includes(permission));

            if (!hasPermission) {
                if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to perform this action'
                    });
                }
                return res.redirect('/not-found');
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error occurred'
            });
        }
    };
};

// Check if user is super admin
exports.isSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = await Role.findById(req.user.role);
        
        if (!userRole || userRole.slug !== 'super-admin') {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(403).json({
                    success: false,
                    message: 'Super admin access required'
                });
            }
            return res.redirect('/not-found');
        }

        next();
    } catch (error) {
        console.error('Super admin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error occurred'
        });
    }
};

// Optional authentication - doesn't redirect if not authenticated
exports.optionalAuth = async (req, res, next) => {
    try {
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId)
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions'
                    }
                })
                .select('-password');

            if (user && user.isActive) {
                req.user = user;
                res.locals.user = user;
            }
        }
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};
