const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    // Site Logo
    logo: { type: String, default: '' },
    
    // Social Media Links
    socialMedia: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        youtube: { type: String, default: '' },
        telegram: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        whatsapp: { type: String, default: '' }
    },
    
    // SMTP Configuration (Sensitive - should not be exposed in public APIs)
    smtp: {
        host: { type: String, default: '', select: false },
        port: { type: Number, default: 587, select: false },
        secure: { type: Boolean, default: false, select: false },
        username: { type: String, default: '', select: false },
        password: { type: String, default: '', select: false },
        fromEmail: { type: String, default: '', select: false },
        fromName: { type: String, default: '', select: false }
    },
    
    // General Site Info
    siteName: { type: String, default: '' },
    siteDescription: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
