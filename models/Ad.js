const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Ad title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Ad description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    media_url: {
        type: String,
        required: [true, 'Media URL is required'],
        trim: true
    },
    ad_type: {
        type: String,
        required: [false, 'Ad type is required'],
        lowercase: true,
        trim: true
    },
    placement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdPlacement',
        required: false
    },
    page_name: {
        type: String,
        trim: true,
        lowercase: true
    },
    page_section: {
        type: String,
        trim: true,
        lowercase: true,
        required: false
    },
    placement: {
        type: String,
        trim: true,
        lowercase: true,
        required: false
    },
    link_url: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Optional field
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Link URL must be a valid HTTP/HTTPS URL'
        }
    },
    link_target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_blank'
    },
    priority: {
        type: Number,
        min: [1, 'Priority must be at least 1'],
        max: [100, 'Priority cannot exceed 100'],
        default: 1,
        required: false
    },
    status: {
        type: String,
        required: false,
        enum: {
            values: ['active', 'paused', 'expired', 'pending', 'rejected'],
            message: 'Status must be active, paused, expired, pending, or rejected'
        },
        default: 'pending'
    },
    start_date: {
        type: Date,
        required: [false, 'Start date is required']
    },
    end_date: {
        type: Date,
        required: [false, 'End date is required'],
        validate: {
            validator: function(value) {
                return value > this.start_date;
            },
            message: 'End date must be after start date'
        }
    },
    budget: {
        type: Number,
        required: [false, 'Budget is required'],
        min: [0, 'Budget cannot be negative'],
        default: 0
    },
    max_impressions: {
        type: Number,
        required: [false, 'Max impressions is required'],
        min: [0, 'Max impressions cannot be negative'],
        default: 0
    },
    max_clicks: {
        type: Number,
        required: [false, 'Max clicks is required'],
        min: [0, 'Max clicks cannot be negative'],
        default: 0
    },
    // Analytics fields
    current_impressions: {
        type: Number,
        default: 0,
        min: 0
    },
    current_clicks: {
        type: Number,
        default: 0,
        min: 0
    },
    spent_budget: {
        type: Number,
        default: 0,
        min: 0
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    created_by_type: {
        type: String,
        enum: ['admin', 'advertiser'],
        default: 'admin'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
adSchema.index({ status: 1 });
adSchema.index({ ad_type: 1 });
adSchema.index({ placement_id: 1 });
adSchema.index({ start_date: 1, end_date: 1 });
adSchema.index({ created_by: 1 });

// Virtual for checking if ad is currently active based on dates
adSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.start_date <= now && 
           this.end_date >= now &&
           (this.max_impressions === 0 || this.current_impressions < this.max_impressions) &&
           (this.max_clicks === 0 || this.current_clicks < this.max_clicks);
});

// Method to check if ad has reached its limits
adSchema.methods.hasReachedLimits = function() {
    const impressionsReached = this.max_impressions > 0 && this.current_impressions >= this.max_impressions;
    const clicksReached = this.max_clicks > 0 && this.current_clicks >= this.max_clicks;
    const budgetReached = this.budget > 0 && this.spent_budget >= this.budget;
    
    return impressionsReached || clicksReached || budgetReached;
};

// Method to increment impression count
adSchema.methods.recordImpression = async function() {
    this.current_impressions += 1;
    
    // Auto-pause if limits reached
    if (this.hasReachedLimits() && this.status === 'active') {
        this.status = 'paused';
    }
    
    return this.save();
};

// Method to increment click count
adSchema.methods.recordClick = async function() {
    this.current_clicks += 1;
    
    // Auto-pause if limits reached
    if (this.hasReachedLimits() && this.status === 'active') {
        this.status = 'paused';
    }
    
    return this.save();
};

// Pre-save middleware to auto-expire ads
adSchema.pre('save', function(next) {
    const now = new Date();
    
    // Auto-expire if end date has passed
    if (this.end_date < now && this.status === 'active') {
        this.status = 'expired';
    }
    
    next();
});

module.exports = mongoose.model('Ad', adSchema);
