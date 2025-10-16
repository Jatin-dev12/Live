const mongoose = require('mongoose');

const adPlacementSchema = new mongoose.Schema({
    placementId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Placement name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    pageLocation: {
        type: String,
        required: true,
        trim: true
    },
    dimensions: {
        width: { type: Number },
        height: { type: Number }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
adPlacementSchema.index({ placementId: 1 });
adPlacementSchema.index({ isActive: 1 });

module.exports = mongoose.model('AdPlacement', adPlacementSchema);
