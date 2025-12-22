const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // Form type identifier
    formType: {
        type: String,
        enum: ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint'],
        required: true
    },
    
    // Common fields
    fullName: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    
    // Contact form specific fields
    cityCountryTimezone: {
        type: String,
        trim: true
    },
    selectOne: {
        type: String,
        trim: true
    },
    areasOfInterest: {
        type: String,
        trim: true
    },
    
    // Suggestion form specific fields - using 'name' instead of fullName for optional field
    name: {
        type: String,
        trim: true
    },
    mood: {
        type: String,
        trim: true
    },
    suggestion: {
        type: String,
        trim: true
    },
    
    // Accessibility form specific fields
    attendedConference: {
        type: String,
        enum: ['in-person', 'virtual']
    },
    hadAccessibilityNeeds: {
        type: String,
        enum: ['yes', 'no']
    },
    needsMet: {
        type: String,
        enum: ['yes', 'no']
    },
    venueRating: {
        type: Number,
        min: 1,
        max: 5
    },
    resourcesRating: {
        type: Number,
        min: 1,
        max: 5
    },
    supportDescription: {
        type: String,
        trim: true
    },
    challengesFaced: {
        type: String,
        trim: true
    },
    improvementSuggestions: {
        type: String,
        trim: true
    },
    
    // Grievance form specific fields
    grievanceVisibility: {
        type: String,
        enum: ['Completely Anonymous', 'Anonymous with name included', 'Open Disclosure']
    },
    shareWith: {
        type: String,
        enum: ['CEO', 'COO', 'President', 'Legal Team']
    },
    incidentDate: {
        type: Date
    },
    incidentDescription: {
        type: String,
        trim: true
    },
    witnessName: {
        type: String,
        trim: true
    },
    desiredOutcome: {
        type: String,
        trim: true
    },
    
    // Complaint form specific fields
    complainantName: {
        type: String,
        trim: true
    },
    complainantEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    respondentName: {
        type: String,
        trim: true
    },
    complaintNature: {
        type: String,
        trim: true
    },
    detailedDescription: {
        type: String,
        trim: true
    },
    acknowledgement: {
        type: Boolean
    },
    
    // Original fields
    source: {
        type: String,
        enum: ['Website', 'Social Media', 'Referral', 'Email Campaign', 'Cold Call', 'Other'],
        default: 'Website'
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
        default: 'New'
    },
    interestedIn: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ formType: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
