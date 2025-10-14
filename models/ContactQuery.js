const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema({
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
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    source: {
        type: String,
        enum: ['Website Contact Form', 'Email', 'Phone', 'Social Media', 'Other'],
        default: 'Website Contact Form'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
contactQuerySchema.index({ email: 1 });
contactQuerySchema.index({ status: 1 });
contactQuerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
