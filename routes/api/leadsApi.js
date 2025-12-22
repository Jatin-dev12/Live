const express = require('express');
const router = express.Router();
const Lead = require('../../models/Lead');

// Create new lead (Public endpoint - no authentication required for frontend forms)
router.post('/submit', async (req, res) => {
    try {
        const { formType, ...formData } = req.body;

        // Validate form type
        const validFormTypes = ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint'];
        if (!formType || !validFormTypes.includes(formType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid form type is required',
                formTypes:formType,
                body:req.body
            });
        }

        // Form-specific validation
        let validationResult = validateFormData(formType, formData);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                message: validationResult.message
            });
        }

        // Create lead object based on form type
        const leadData = createLeadData(formType, formData);

        // Create new lead
        const lead = new Lead(leadData);
        await lead.save();

        // Form-specific success messages
        const successMessages = {
            contact: 'Thank you! Your contact inquiry has been submitted successfully. We will contact you soon.',
            suggestion: 'Thank you for your suggestion! We appreciate your feedback.',
            accessibility: 'Thank you for your accessibility feedback. Your input helps us improve our services.',
            grievance: 'Your grievance has been submitted securely. It will be handled according to our confidentiality policies.',
            complaint: 'Your complaint has been submitted and will be processed according to ACRM bylaws and investigation procedures.'
        };

        res.json({
            success: true,
            message: successMessages[formType],
            data: {
                id: lead._id,
                formType: formType
            }
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while submitting your form. Please try again.'
        });
    }
});

// Validation function for different form types
function validateFormData(formType, data) {
    switch (formType) {
        case 'contact':
            if (!data.firstName || !data.lastName || !data.company || !data.email || !data.phone || !data.cityCountryTimezone || !data.selectOne) {
                return { isValid: false, message: 'First name, last name, company, email, phone, city/country/timezone, and selection are required for contact form' };
            }
            break;
        case 'suggestion':
            if (!data.suggestion || !data.mood) {
                return { isValid: false, message: 'Suggestion text and mood are required' };
            }
            break;
        case 'accessibility':
            if (!data.attendedConference || !data.hadAccessibilityNeeds || !data.needsMet || !data.venueRating || !data.resourcesRating) {
                return { isValid: false, message: 'Conference attendance, accessibility needs, needs met status, venue rating, and resources rating are required' };
            }
            break;
        case 'grievance':
            if (!data.grievanceVisibility || !data.shareWith || !data.incidentDescription) {
                return { isValid: false, message: 'Grievance visibility, share with selection, and incident description are required' };
            }
            break;
        case 'complaint':
            if (!data.complainantName || !data.complainantEmail || !data.respondentName || !data.complaintNature || !data.detailedDescription || !data.acknowledgement) {
                return { isValid: false, message: 'Complainant name, email, respondent name, complaint nature, detailed description, and acknowledgement are required for complaint form' };
            }
            break;
    }

    // Email validation if email is provided
    if (data.email || data.complainantEmail) {
        const emailToValidate = data.email || data.complainantEmail;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToValidate)) {
            return { isValid: false, message: 'Please provide a valid email address' };
        }
    }

    return { isValid: true };
}

// Function to create lead data based on form type
function createLeadData(formType, data) {
    const baseData = {
        formType: formType,
        source: 'Website',
        status: 'New'
    };

    switch (formType) {
        case 'contact':
            return {
                ...baseData,
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                fullName: `${data.firstName?.trim()} ${data.lastName?.trim()}`,
                company: data.company?.trim(),
                email: data.email?.toLowerCase().trim(),
                phone: data.phone?.trim(),
                cityCountryTimezone: data.cityCountryTimezone?.trim(),
                selectOne: data.selectOne?.trim(),
                areasOfInterest: data.areasOfInterest?.trim(),
                interestedIn: data.selectOne?.trim(),
                notes: `Areas of Interest: ${data.areasOfInterest || 'Not specified'}`
            };

        case 'suggestion':
            return {
                ...baseData,
                name: data.name?.trim(),
                fullName: data.name?.trim() || 'Anonymous',
                email: data.email?.toLowerCase().trim(),
                mood: data.mood?.trim(),
                suggestion: data.suggestion?.trim(),
                notes: data.suggestion?.trim()
            };

        case 'accessibility':
            return {
                ...baseData,
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                fullName: data.firstName && data.lastName ? `${data.firstName.trim()} ${data.lastName.trim()}` : (data.firstName?.trim() || 'Anonymous'),
                email: data.email?.toLowerCase().trim(),
                attendedConference: data.attendedConference,
                hadAccessibilityNeeds: data.hadAccessibilityNeeds,
                needsMet: data.needsMet,
                venueRating: parseInt(data.venueRating),
                resourcesRating: parseInt(data.resourcesRating),
                notes: `Attended: ${data.attendedConference}, Had Needs: ${data.hadAccessibilityNeeds}, Needs Met: ${data.needsMet}, Venue: ${data.venueRating}/5, Resources: ${data.resourcesRating}/5`
            };

        case 'grievance':
            return {
                ...baseData,
                fullName: 'Anonymous Grievance',
                grievanceVisibility: data.grievanceVisibility,
                shareWith: data.shareWith,
                incidentDate: data.incidentDate ? new Date(data.incidentDate) : undefined,
                incidentDescription: data.incidentDescription?.trim(),
                witnessName: data.witnessName?.trim(),
                desiredOutcome: data.desiredOutcome?.trim(),
                notes: data.incidentDescription?.trim()
            };

        case 'complaint':
            return {
                ...baseData,
                complainantName: data.complainantName?.trim(),
                complainantEmail: data.complainantEmail?.toLowerCase().trim(),
                fullName: data.complainantName?.trim(),
                email: data.complainantEmail?.toLowerCase().trim(),
                respondentName: data.respondentName?.trim(),
                complaintNature: data.complaintNature?.trim(),
                incidentDate: data.incidentDate ? new Date(data.incidentDate) : undefined,
                detailedDescription: data.detailedDescription?.trim(),
                acknowledgement: data.acknowledgement,
                interestedIn: data.complaintNature?.trim(),
                notes: `Complaint against: ${data.respondentName}, Nature: ${data.complaintNature}, Acknowledged: ${data.acknowledgement ? 'Yes' : 'No'}`
            };

        default:
            return baseData;
    }
}

// Get all leads (Admin only - requires authentication)
router.get('/', async (req, res) => {
    try {
        const { formType, status, page = 1, limit = 50 } = req.query;
        
        // Build filter object
        const filter = {};
        if (formType && ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint'].includes(formType)) {
            filter.formType = formType;
        }
        if (status) {
            filter.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get leads with filters and pagination
        const leads = await Lead.find(filter)
            .populate('assignedTo', 'fullName email')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Lead.countDocuments(filter);
        
        res.json({
            success: true,
            data: leads,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount: totalCount,
                hasNext: skip + leads.length < totalCount,
                hasPrev: parseInt(page) > 1
            },
            filters: {
                formType: formType || 'all',
                status: status || 'all'
            }
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

// Get form type statistics
router.get('/stats/form-types', async (req, res) => {
    try {
        const stats = await Lead.aggregate([
            {
                $group: {
                    _id: '$formType',
                    count: { $sum: 1 },
                    latestSubmission: { $max: '$createdAt' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalLeads = await Lead.countDocuments();
        
        res.json({
            success: true,
            data: {
                totalLeads,
                formTypeBreakdown: stats,
                formTypes: ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint']
            }
        });
    } catch (error) {
        console.error('Error fetching form type stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Clean up last 4 entries (temporary endpoint for cleanup)
router.delete('/cleanup/last-four', async (req, res) => {
    try {
        // Get the last 4 entries
        const lastFourLeads = await Lead.find()
            .sort({ createdAt: -1 })
            .limit(5);

        if (lastFourLeads.length === 0) {
            return res.json({
                success: true,
                message: 'No leads found to delete',
                deletedCount: 0
            });
        }

        // Delete the last 4 entries
        const leadIds = lastFourLeads.map(lead => lead._id);
        const deleteResult = await Lead.deleteMany({ _id: { $in: leadIds } });

        res.json({
            success: true,
            message: `Successfully deleted ${deleteResult.deletedCount} leads`,
            deletedCount: deleteResult.deletedCount,
            deletedIds: leadIds
        });
    } catch (error) {
        console.error('Error deleting last four leads:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting leads'
        });
    }
});

module.exports = router;
