const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const { isAuthenticated } = require('../../middleware/auth');
const { validateLogin, handleValidationErrors } = require('../../middleware/validators');

// Login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check MongoDB connection
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB not connected. ReadyState:', mongoose.connection.readyState);
            return res.status(503).json({
                success: false,
                message: 'Database connection unavailable. Please try again later.'
            });
        }
        
        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password')
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Create session
        req.session.userId = user._id;
        req.session.userRole = user.role.slug;
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        // Determine redirect URL based on role
        let redirectUrl = '/index'; // Default dashboard
        
        // You can customize dashboard routes based on role
        // For example:
        // if (user.role.slug === 'super-admin') {
        //     redirectUrl = '/dashboard/index2'; // Admin dashboard
        // } else if (user.role.slug === 'manager') {
        //     redirectUrl = '/dashboard/index3'; // Manager dashboard
        // } else {
        //     redirectUrl = '/index'; // Default dashboard
        // }
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                redirectUrl: redirectUrl
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

// Logout
router.post('/logout', isAuthenticated, (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error during logout'
                });
            }
            
            res.json({
                success: true,
                message: 'Logout successful',
                redirectUrl: '/authentication/sign-in'
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
        });
    }
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            })
            .select('-password');
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
});

// Check authentication status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        isAuthenticated: !!(req.session && req.session.userId),
        userId: req.session?.userId || null
    });
});

module.exports = router;
