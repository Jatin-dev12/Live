const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Permission name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Permission name must be at least 3 characters'],
        maxlength: [50, 'Permission name cannot exceed 50 characters']
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
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    module: {
        type: String,
        required: [true, 'Module is required'],
        enum: ['users', 'roles', 'dashboard', 'blog', 'leads', 'invoice', 'settings', 'cms', 'media', 'seo', 'ads', 'reports'],
        trim: true
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: ['create', 'read', 'update', 'delete', 'manage'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create compound index for module and action
permissionSchema.index({ module: 1, action: 1 }, { unique: true });

// Generate slug before saving
permissionSchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    next();
});

module.exports = mongoose.model('Permission', permissionSchema);
