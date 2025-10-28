const express = require('express');
const router = express.Router();
const Lead = require('../../models/Lead');

// Create new lead (Public endpoint - no authentication required for frontend forms)
router.post('/submit', async (req, res) => {
    try {
        const { fullName, company, email, contactNo, subject, message, website } = req.body;

        // Validation
        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Create new lead
        const lead = new Lead({
            fullName: fullName.trim(),
            company: company ? company.trim() : undefined,
            email: email.toLowerCase().trim(),
            phone: contactNo ? contactNo.trim() : undefined,
            interestedIn: subject ? subject.trim() : undefined,
            notes: message ? message.trim() : undefined,
            source: 'Website', // must match enum case
            status: 'New'      // must match enum case
        });

        await lead.save();

        res.json({
            success: true,
            message: 'Thank you! Your inquiry has been submitted successfully. We will contact you soon.',
            data: {
                id: lead._id
            }
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while submitting your inquiry. Please try again.'
        });
    }
});

// Get all leads (Admin only - requires authentication)
router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find()
            .populate('assignedTo', 'fullName email')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leads'
        });
    }
});

// Get single lead by ID
router.get('/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'fullName email')
            .populate('createdBy', 'fullName email');
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }
        
        res.json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lead'
        });
    }
});

// Update lead
router.put('/:id', async (req, res) => {
    try {
        const { fullName, email, phone, interestedIn, notes, status, assignedTo } = req.body;
        
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }
        
        // Update fields
        if (fullName) lead.fullName = fullName.trim();
        if (email) lead.email = email.toLowerCase().trim();
        if (phone !== undefined) lead.phone = phone ? phone.trim() : undefined;
        if (interestedIn !== undefined) lead.interestedIn = interestedIn ? interestedIn.trim() : undefined;
        if (notes !== undefined) lead.notes = notes ? notes.trim() : undefined;
        if (status) lead.status = status;
        if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;
        
        await lead.save();
        
        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: lead
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lead'
        });
    }
});

// Delete lead
router.delete('/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting lead'
        });
    }
});

module.exports = router;
