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
        trim: true,
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
        image: {
            type: String,
            trim: true
        },
        ad: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ad',
            },
            image: {
                type: String,
                trim: true
            },
            link: {
                type: String,
                trim: true
            },
            target: {
                type: String,
                trim: true,
                default: '_self'
            }
        }
    },
    // Three column info section
    threeColumnInfo: {
        heading: {
            type: String,
            trim: true
        },
        subheading: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            trim: true
        },
        imageOnLeft: {
            type: Boolean,
            default: true
        },
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
    // Call Out Section section
    callOutCards: {
        cards: [{
            heading: {
                type: String,
                trim: true,
                required: true
            },
            subheading: {
                type: String,
                trim: true
            },
            link: {
                type: String,
                trim: true
            }
        }]
    },
    // Tabs section
    tabsSection: {
        tabs: [{
            title: {
                type: String,
                trim: true
            },
            heading: {
                type: String,
                trim: true
            },
            paragraph: {
                type: String,
                trim: true
            }
        }]
    },
    // Community groups section
    communityGroups: {
        heading: {
            type: String,
            trim: true
        },
        subheading: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            trim: true,
            default: 'community'
        },
        displayOrder: {
            type: String,
            enum: ['manual', 'alphabetical', 'date'],
            default: 'manual'
        },
        selectedPages: [{
            page: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Page'
            },
            order: {
                type: Number,
                default: 0
            }
        }]
    },
    // Contact section
    contactSection: {
        heading: {
            type: String,
            trim: true
        },
        subheading: {
            type: String,
            trim: true
        },
        email: {
            heading: {
                type: String,
                trim: true
            },
            subheading: {
                type: String,
                trim: true
            },
            address: {
                type: String,
                trim: true,
                validate: {
                    validator: function(v) {
                        if (!v) return true; // allow empty
                        // simple email regex
                        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                    },
                    message: props => `${props.value} is not a valid email address!`
                }
            }
        },
        call: {
            heading: {
                type: String,
                trim: true
            },
            subheading: {
                type: String,
                trim: true
            },
            phone: {
                type: String,
                trim: true,
                validate: {
                    validator: function(v) {
                        if (!v) return true;
                        // allow digits, spaces, plus and parentheses only
                        return /^[0-9+\s()]+$/.test(v);
                    },
                    message: props => `${props.value} is not a valid phone number! Only digits, spaces, "+" and parentheses are allowed.`
                }
            }
        },
        generalContactForm: {
            heading: { type: String, trim: true },
            subheading: { type: String, trim: true },
            openFormLink: { type: String, trim: true }
        },
        helpfulLinks: [{
            text: { type: String, trim: true },
            link: { type: String, trim: true }
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
