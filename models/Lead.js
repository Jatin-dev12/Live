const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
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
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
