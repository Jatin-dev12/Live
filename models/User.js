const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\d\s\+\-\(\)]+$/, 'Please enter a valid phone number']
    },
    profileImage: {
        type: String,
        default: null
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'Role is required']
    },
    customPermissions: [{
        type: String  // Store permission slugs directly as strings
    }],
    department: {
        type: String,
        trim: true,
        enum: ['Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Support', 'Management'],
        default: 'Operations'
    },
    designation: {
        type: String,
        trim: true,
        maxlength: [100, 'Designation cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Set password changed timestamp
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Virtual for full profile
userSchema.virtual('profile').get(function() {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        profileImage: this.profileImage,
        department: this.department,
        designation: this.designation,
        isActive: this.isActive
    };
});

module.exports = mongoose.model('User', userSchema);
