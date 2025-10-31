const express = require('express');
const router = express.Router();
const SectionType = require('../../models/SectionType');
const { isAuthenticated } = require('../../middleware/auth');

// Public: list active section types
router.get('/public', async (req, res) => {
	try {
		const types = await SectionType.find({ status: 'active' }).sort({ name: 1 });
		res.json({ success: true, data: types });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error fetching section types', error: error.message });
	}
});

// Admin: list all section types
router.get('/', isAuthenticated, async (req, res) => {
	try {
		const { status } = req.query;
		const query = {};
		if (status && status !== 'all') query.status = status;
		const types = await SectionType.find(query).sort({ createdAt: -1 });
		res.json({ success: true, data: types });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error fetching section types', error: error.message });
	}
});

// Get single
router.get('/:id', isAuthenticated, async (req, res) => {
	try {
		const type = await SectionType.findById(req.params.id);
		if (!type) return res.status(404).json({ success: false, message: 'Section type not found' });
		res.json({ success: true, data: type });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error fetching section type', error: error.message });
	}
});

// Create
router.post('/', isAuthenticated, async (req, res) => {
	try {
		const { name, key, description, fields, defaultContent, status } = req.body;
		if (!name || !key) {
			return res.status(400).json({ success: false, message: 'Name and key are required' });
		}
		const exists = await SectionType.findOne({ $or: [{ key: key.toLowerCase() }, { name }] });
		if (exists) {
			return res.status(400).json({ success: false, message: 'Section type with this key or name already exists' });
		}
		const type = new SectionType({ name, key, description, fields, defaultContent, status: status || 'active' });
		await type.save();
		res.status(201).json({ success: true, message: 'Section type created', data: type });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error creating section type', error: error.message });
	}
});

// Update
router.put('/:id', isAuthenticated, async (req, res) => {
	try {
		const { name, key, description, fields, defaultContent, status } = req.body;
		if (key) {
			const exists = await SectionType.findOne({ _id: { $ne: req.params.id }, key: key.toLowerCase() });
			if (exists) {
				return res.status(400).json({ success: false, message: 'Another section type with this key exists' });
			}
		}
		const type = await SectionType.findByIdAndUpdate(
			req.params.id,
			{ name, key, description, fields, defaultContent, status },
			{ new: true, runValidators: true }
		);
		if (!type) return res.status(404).json({ success: false, message: 'Section type not found' });
		res.json({ success: true, message: 'Section type updated', data: type });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error updating section type', error: error.message });
	}
});

// Delete
router.delete('/:id', isAuthenticated, async (req, res) => {
	try {
		const type = await SectionType.findByIdAndDelete(req.params.id);
		if (!type) return res.status(404).json({ success: false, message: 'Section type not found' });
		res.json({ success: true, message: 'Section type deleted' });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error deleting section type', error: error.message });
	}
});

module.exports = router;


