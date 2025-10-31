const mongoose = require('mongoose');

const sectionTypeSchema = new mongoose.Schema({
	// Human-readable name, e.g., "Hero"
	name: {
		type: String,
		required: true,
		trim: true,
	},
	// Stable key used by frontend/backend, e.g., "hero-section"
	key: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	// Optional description for admins
	description: {
		type: String,
		trim: true
	},
	// JSON schema-like definition of fields for this section type
	fields: {
		type: Array, // [{ name, type, required, options, default }]
		default: []
	},
	// Default content template for quick add
	defaultContent: {
		type: mongoose.Schema.Types.Mixed
	},
	status: {
		type: String,
		enum: ['active', 'inactive'],
		default: 'active'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('SectionType', sectionTypeSchema);


