/*
 Seeds common Section Types for page builder sections.
 Run with: node scripts/seedSectionTypes.js
*/
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const SectionType = require('../models/SectionType');

async function upsertType(doc) {
	const existing = await SectionType.findOne({ key: doc.key });
	if (existing) {
		await SectionType.updateOne({ _id: existing._id }, { $set: doc });
		return { key: doc.key, action: 'updated' };
	}
	await SectionType.create(doc);
	return { key: doc.key, action: 'created' };
}

async function run() {
	await connectDB();

	const types = [
		{
			name: 'Image with Text',
			key: 'image-with-text',
			description: 'Two-column section: image and rich text. Use checkbox to flip left/right.',
			fields: [
				{ name: 'heading', type: 'string', required: false },
				{ name: 'subheading', type: 'string', required: false },
				{ name: 'richText', type: 'text', required: false },
				{ name: 'image', type: 'image', required: true },
				{ name: 'imageOnLeft', type: 'boolean', required: false, default: true }
			],
			defaultContent: {
				heading: 'Section Heading',
				subheading: 'Optional subheading',
				richText: '',
				image: '/images/placeholder.png',
				imageOnLeft: true
			},
			status: 'active'
		},
		{
			name: 'Heading with Subheading',
			key: 'heading-subheading',
			description: 'Simple heading and subheading block, can be centered.',
			fields: [
				{ name: 'heading', type: 'string', required: true },
				{ name: 'subheading', type: 'string', required: false },
				{ name: 'alignCenter', type: 'boolean', required: false, default: true }
			],
			defaultContent: {
				heading: 'Section Heading',
				subheading: 'Optional subheading',
				alignCenter: true
			},
			status: 'active'
		},
		{
			name: 'Image with List',
			key: 'image-with-list',
			description: 'Two-column section: image and bullet list. Use checkbox to flip left/right.',
			fields: [
				{ name: 'heading', type: 'string', required: false },
				{ name: 'image', type: 'image', required: true },
				{ name: 'items', type: 'array', itemType: 'string', required: false, default: [] },
				{ name: 'imageOnLeft', type: 'boolean', required: false, default: true }
			],
			defaultContent: {
				heading: 'Key Benefits',
				image: '/images/placeholder.png',
				items: ['Item one', 'Item two', 'Item three'],
				imageOnLeft: true
			},
			status: 'active'
		},
		{
			name: 'Left Heading + Image, Right Text',
			key: 'left-heading-image-right-text',
			description: 'Left side heading and image, right side text.',
			fields: [
				{ name: 'leftHeading', type: 'string', required: true },
				{ name: 'leftImage', type: 'image', required: true },
				{ name: 'rightText', type: 'text', required: false }
			],
			defaultContent: {
				leftHeading: 'Why choose us?',
				leftImage: '/images/placeholder.png',
				rightText: ''
			},
			status: 'active'
		},
		{
			name: 'Right Heading + Image, Left Text',
			key: 'right-heading-image-left-text',
			description: 'Right side heading and image, left side text.',
			fields: [
				{ name: 'rightHeading', type: 'string', required: true },
				{ name: 'rightImage', type: 'image', required: true },
				{ name: 'leftText', type: 'text', required: false }
			],
			defaultContent: {
				rightHeading: 'What we offer',
				rightImage: '/images/placeholder.png',
				leftText: ''
			},
			status: 'active'
		}
	];

	const results = [];
	for (const t of types) {
		// ensure lowercase key
		t.key = String(t.key).toLowerCase();
		results.push(await upsertType(t));
	}

	console.log('Section Types seeding results:', results);
	await mongoose.connection.close();
}

run().catch(err => {
	console.error(err);
	process.exit(1);
});


