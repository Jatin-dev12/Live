const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    path: {
        type: String,
        required: false, // Will be auto-generated in pre-save hook if not provided
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    metaKeywords: {
        type: String,
        trim: true
    },
    template: {
        type: String,
        trim: true,
        enum: ['', 'home', 'about', 'newsletter', 'legislation', 'membership', 'query', 'contact'],
        default: ''
    },
    category: {
        type: String,
        trim: true,
        enum: ['', 'community', 'news', 'events', 'resources'],
        default: ''
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

// Create slug from name before saving
pageSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Auto-generate path from name if not provided or empty
    if ((!this.path || this.path.trim() === '') && this.name) {
        const pathSlug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        this.path = pathSlug === 'home' ? '/' : `/${pathSlug}`;
    }
    
    // Ensure path is always set
    if (!this.path) {
        return next(new Error('Path is required and could not be auto-generated'));
    }
    
    next();
});

module.exports = mongoose.model('Page', pageSchema);
