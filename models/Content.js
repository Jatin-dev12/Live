const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    order: {
        type: Number,
        default: 0
    },
    // Section type for different layouts
    sectionType: {
        type: String,
        enum: ['default', 'hero-section', 'three-column-info'],
        default: 'default'
    },
    // Hero section specific fields
    heroSection: {
        heading: {
            type: String,
            trim: true
        },
        paragraph: {
            type: String,
            trim: true
        },
        ctas: [{
            text: {
                type: String,
                trim: true
            },
            link: {
                type: String,
                trim: true
            },
            style: {
                type: String,
                enum: ['primary', 'secondary', 'outline'],
                default: 'primary'
            }
        }],
        rightImage: {
            type: String,
            trim: true
        }
    },
    // Three column info section
    threeColumnInfo: {
        columns: [{
            title: {
                type: String,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            buttonText: {
                type: String,
                trim: true
            },
            buttonLink: {
                type: String,
                trim: true
            }
        }]
    },
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
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
contentSchema.index({ page: 1, status: 1, order: 1 });

module.exports = mongoose.model('Content', contentSchema);
