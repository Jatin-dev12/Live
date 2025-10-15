const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
        unique: true
    },
    metaTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    metaKeywords: {
        type: String,
        trim: true
    },
    canonicalUrl: {
        type: String,
        trim: true
    },
    ogTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    ogDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    ogImage: {
        type: String,
        trim: true
    },
    ogImagePath: {
        type: String,
        trim: true
    },
    robots: {
        type: String,
        enum: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'],
        default: 'index, follow'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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
seoSchema.index({ page: 1 });
seoSchema.index({ status: 1 });

module.exports = mongoose.model('SEO', seoSchema);
