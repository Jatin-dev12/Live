const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    formType: {
        type: String,
        enum: ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint', 'query', 'feedback', 'registration', 'newsletter', 'custom'],
        default: 'contact'
    },
    fields: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        label: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'file'],
            required: true
        },
        placeholder: {
            type: String,
            trim: true
        },
        required: {
            type: Boolean,
            default: false
        },
        options: [{
            label: String,
            value: String
        }], // For select, radio, checkbox fields
        validation: {
            minLength: Number,
            maxLength: Number,
            pattern: String
        }
    }],
    settings: {
        submitButtonText: {
            type: String,
            default: 'Submit'
        },
        successMessage: {
            type: String,
            default: 'Thank you for your submission!'
        },
        redirectUrl: {
            type: String,
            trim: true
        },
        emailNotification: {
            enabled: {
                type: Boolean,
                default: true
            },
            recipients: [String],
            subject: String
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Index for faster queries
formSchema.index({ status: 1 });
formSchema.index({ formType: 1 });
formSchema.index({ title: 1 });

module.exports = mongoose.model('Form', formSchema);