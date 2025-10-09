const User = require('../models/User');
const Role = require('../models/Role');

// Check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }
            return res.redirect('/authentication/sign-in');
        }

        if (!user.isActive) {
            req.session.destroy();
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
        const userPermissions = user.role && user.role.permissions 
            ? user.role.permissions.map(p => p.slug) 
            : [];
        const userModules = user.role && user.role.permissions 
            ? user.role.permissions.map(p => p.module) 
            : [];
        
        res.locals.userPermissions = userPermissions; // All permission slugs
        res.locals.userModules = [...new Set(userModules)]; // Unique modules
        res.locals.userRole = user.role ? user.role.slug : null;
        res.locals.userLevel = user.role ? user.role.level : 99;
        
        // Helper function to check if user has permission
        res.locals.hasPermission = function(permission) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(permission);
        };
        
        // Helper function to check if user can perform action on module
        res.locals.canCreate = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(`${module}-create`) || userPermissions.includes(`${module}-manage`);
        };
        
        res.locals.canUpdate = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(`${module}-update`) || userPermissions.includes(`${module}-manage`);
        };
        
        res.locals.canDelete = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(`${module}-delete`) || userPermissions.includes(`${module}-manage`);
        };
        
        res.locals.canRead = function(module) {
            if (user.role && user.role.slug === 'super-admin') return true;
            return userPermissions.includes(`${module}-read`) || userPermissions.includes(`${module}-manage`);
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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

            const userPermissions = userRole.permissions.map(p => p.slug);
            const hasPermission = permissions.some(permission => userPermissions.includes(permission));

            if (!hasPermission) {
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
