const mongoose = require('mongoose');

const urlRedirectSchema = new mongoose.Schema({
    oldUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    newUrl: {
        type: String,
        required: true,
        trim: true
    },
    redirectType: {
        type: Number,
        enum: [301, 302, 307, 308],
        default: 301,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    hitCount: {
        type: Number,
        default: 0
    },
    lastAccessed: {
        type: Date
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

// Index for faster lookups
urlRedirectSchema.index({ oldUrl: 1 });
urlRedirectSchema.index({ isActive: 1 });

module.exports = mongoose.model('UrlRedirect', urlRedirectSchema);
