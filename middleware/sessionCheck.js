const User = require('../models/User');

// Middleware to check if session is still valid
const checkSessionValidity = async (req, res, next) => {
    // Skip check for non-authenticated routes
    if (!req.session || !req.session.userId) {
        return next();
    }

    try {
        const user = await User.findById(req.session.userId).select('sessionVersion isActive');
        
        if (!user) {
            // User deleted
            req.session.destroy();
            return res.status(401).json({
                success: false,
                sessionInvalid: true,
                message: 'Session invalid. Please login again.'
            });
        }

        if (!user.isActive) {
            // User deactivated
            req.session.destroy();
            return res.status(401).json({
                success: false,
                sessionInvalid: true,
                message: 'Account deactivated. Please contact administrator.'
            });
        }

        // Check if session version matches
        const sessionVersion = req.session.sessionVersion || 1;
        if (user.sessionVersion !== sessionVersion) {
            // Password changed, invalidate session
            req.session.destroy();
            return res.status(401).json({
                success: false,
                sessionInvalid: true,
                message: 'Password changed. Please login again.'
            });
        }

        next();
    } catch (error) {
        console.error('Session check error:', error);
        next();
    }
};

module.exports = { checkSessionValidity };
