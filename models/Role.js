const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Role name must be at least 3 characters'],
        maxlength: [50, 'Role name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    permissions: [{
        type: mongoose.Schema.Types.Mixed // Support both ObjectId and String
    }],
    level: {
        type: Number,
        required: true,
        default: 3,
        min: [1, 'Level must be at least 1'],
        max: [5, 'Level cannot exceed 5']
    },
    isSystemRole: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate slug before saving
roleSchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    next();
});

// Prevent deletion of system roles
roleSchema.pre('deleteOne', { document: true, query: false }, function(next) {
    if (this.isSystemRole) {
        return next(new Error('System roles cannot be deleted'));
    }
    next();
});

module.exports = mongoose.model('Role', roleSchema);
