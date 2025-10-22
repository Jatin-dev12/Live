const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_self'
    },
    icon: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    location: {
        type: String,
        enum: ['header', 'footer', 'sidebar', 'custom'],
        default: 'header'
    },
    items: [menuItemSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
menuSchema.index({ slug: 1 });
menuSchema.index({ location: 1 });

module.exports = mongoose.model('Menu', menuSchema);
