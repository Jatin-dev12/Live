const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Lead = require('../models/Lead');
const { getPaginationLimit, calculatePagination, buildSearchQuery } = require('../utils/pagination');

router.get('/leads-management', isAuthenticated, async (req, res)=>{
    try {
        const { formType, search } = req.query;
        const currentPage = parseInt(req.query.page) || 1;
        const limit = getPaginationLimit();
        
        // Build filter object
        const filter = {};
        if (formType && ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint'].includes(formType)) {
            filter.formType = formType;
        }

        // Add search functionality
        if (search) {
            const searchQuery = buildSearchQuery(search, ['fullName', 'name', 'complainantName', 'email', 'complainantEmail', 'phone', 'notes', 'suggestion', 'incidentDescription', 'detailedDescription']);
            // Combine formType filter with search query
            if (Object.keys(filter).length > 0) {
                filter.$and = [
                    { formType: filter.formType },
                    searchQuery
                ];
                delete filter.formType;
            } else {
                Object.assign(filter, searchQuery);
            }
        }

        // Get total count for pagination
        const totalItems = await Lead.countDocuments(filter);
        
        // Calculate pagination metadata
        const pagination = calculatePagination(currentPage, totalItems, limit);

        // Get leads with pagination
        const leads = await Lead.find(filter)
            .populate('assignedTo', 'fullName email')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(pagination.skip)
            .limit(pagination.limit)
            .lean();

        // Get form type statistics for the filter dropdown (from all leads, not just current page)
        const formTypeStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$formType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.render('leads/leadsManagement', {
            title: "Leads Management", 
            subTitle:"Leads Management",
            leads: leads,
            currentFormType: formType || 'all',
            formTypeStats: formTypeStats,
            pagination: pagination,
            search: search || '',
            totalLeads: totalItems
        });
    } catch (error) {
        console.error('Error loading leads:', error);
        res.render('leads/leadsManagement', {
            title: "Leads Management", 
            subTitle:"Leads Management",
            leads: [],
            currentFormType: 'all',
            formTypeStats: [],
            pagination: calculatePagination(1, 0),
            search: '',
            totalLeads: 0
        });
    }
});

router.get('/add-leads', isAuthenticated, (req, res)=>{
    res.render('leads/addLeads', {title: "Add Leads", subTitle:"Add Leads"})
});

// Export leads to CSV - with form type filtering and search
router.get('/export-csv', isAuthenticated, async (req, res) => {
    try {
        const { formType, search } = req.query;
        
        // Build filter object
        const filter = {};
        if (formType && ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint'].includes(formType)) {
            filter.formType = formType;
        }

        // Add search functionality
        if (search) {
            const searchQuery = buildSearchQuery(search, ['fullName', 'name', 'complainantName', 'email', 'complainantEmail', 'phone', 'notes', 'suggestion', 'incidentDescription', 'detailedDescription']);
            // Combine formType filter with search query
            if (Object.keys(filter).length > 0) {
                filter.$and = [
                    { formType: filter.formType },
                    searchQuery
                ];
                delete filter.formType;
            } else {
                Object.assign(filter, searchQuery);
            }
        }

        const leads = await Lead.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        
        // CSV headers - updated to match new table structure
        const headers = ['Date', 'Form Type', 'Name', 'Email', 'Phone', 'Subject', 'Message/Details'];
        
        // Create CSV rows
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        leads.forEach(lead => {
            // Format date exactly like table
            const date = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            
            // Form type
            const formTypeDisplay = lead.formType ? lead.formType.charAt(0).toUpperCase() + lead.formType.slice(1) : 'Unknown';
            
            // Name based on form type
            let name = 'N/A';
            if (lead.fullName) name = lead.fullName;
            else if (lead.name) name = lead.name;
            else if (lead.complainantName) name = lead.complainantName;
            else if (lead.firstName && lead.lastName) name = `${lead.firstName} ${lead.lastName}`;
            
            // Email based on form type
            const email = lead.email || lead.complainantEmail || 'N/A';
            
            // Subject based on form type
            let subject = 'N/A';
            switch(lead.formType) {
                case 'contact':
                    subject = lead.selectOne || lead.interestedIn || 'Contact Inquiry';
                    break;
                case 'suggestion':
                    subject = 'Suggestion Box';
                    break;
                case 'accessibility':
                    subject = 'Accessibility Feedback';
                    break;
                case 'grievance':
                    subject = 'Grievance Report';
                    break;
                case 'complaint':
                    subject = lead.complaintNature || 'Formal Complaint';
                    break;
                default:
                    subject = lead.interestedIn || 'General Inquiry';
            }
            
            // Message/Details based on form type
            let message = 'No message';
            if (lead.notes) message = lead.notes;
            else if (lead.suggestion) message = lead.suggestion;
            else if (lead.incidentDescription) message = lead.incidentDescription;
            else if (lead.detailedDescription) message = lead.detailedDescription;
            
            // Clean message for CSV
            message = message.replace(/"/g, '""').replace(/\n/g, ' ');
            
            // Format phone number with tab prefix to force Excel to treat as text
            const phone = lead.phone ? `"\t${lead.phone}"` : `"\tN/A"`;
            
            const row = [
                `"${date}"`,
                `"${formTypeDisplay}"`,
                `"${name}"`,
                `"${email}"`,
                phone,
                `"${subject}"`,
                `"${message}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for proper UTF-8 encoding
        
        // Set headers for file download
        let filename = 'leads';
        if (formType) filename += `-${formType}`;
        if (search) filename += `-search`;
        filename += `-${Date.now()}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting leads:', error);
        res.status(500).send('Error exporting leads data');
    }
});

module.exports = router;
