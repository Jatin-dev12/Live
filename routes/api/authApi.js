const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const { isAuthenticated } = require('../../middleware/auth');
const { validateLogin, handleValidationErrors } = require('../../middleware/validators');

// Signup/Register
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Get the default "User" role
        const defaultRole = await Role.findOne({ slug: 'user' });
        if (!defaultRole) {
            return res.status(500).json({
                success: false,
                message: 'Default role not found. Please contact administrator.'
            });
        }

        // Create new user
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            role: defaultRole._id,
            isActive: true
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully!'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signup',
            error: error.message
        });
    }
});

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

        // Create session with session version
        req.session.userId = user._id;
        req.session.userRole = user.role.slug;
        req.session.sessionVersion = user.sessionVersion || 1;

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

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        console.log('Change password request received');
        console.log('User ID:', req.user?._id);
        console.log('Request body:', { ...req.body, newPassword: '***', confirmPassword: '***' });

        const { newPassword, confirmPassword } = req.body;

        // Validation
        if (!newPassword || !confirmPassword) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide both new password and confirm password'
            });
        }

        if (newPassword !== confirmPassword) {
            console.log('Validation failed: Passwords do not match');
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        if (newPassword.length < 8) {
            console.log('Validation failed: Password too short');
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // Get user
        console.log('Fetching user...');
        const user = await User.findById(req.user._id);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Updating password...');
        // Update password
        user.password = newPassword;
        await user.save();

        console.log('Password updated successfully');
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Session validity check endpoint
router.get('/session-check', async (req, res) => {
    try {
        // If no session, return invalid
        if (!req.session || !req.session.userId) {
            return res.json({
                success: false,
                sessionInvalid: true,
                message: 'No active session'
            });
        }

        // Get user with session version
        const user = await User.findById(req.session.userId).select('sessionVersion isActive');
        
        if (!user) {
            req.session.destroy();
            return res.json({
                success: false,
                sessionInvalid: true,
                message: 'User not found. Please login again.'
            });
        }

        if (!user.isActive) {
            req.session.destroy();
            return res.json({
                success: false,
                sessionInvalid: true,
                message: 'Account deactivated. Please contact administrator.'
            });
        }

        // Check if session version matches
        const sessionVersion = req.session.sessionVersion || 1;
        if (user.sessionVersion !== sessionVersion) {
            req.session.destroy();
            return res.json({
                success: false,
                sessionInvalid: true,
                message: 'Password changed. Please login again.'
            });
        }

        // Session is valid
        res.json({
            success: true,
            message: 'Session valid'
        });
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking session'
        });
    }
});

module.exports = router;
