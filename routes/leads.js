const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Lead = require('../models/Lead');

router.get('/leads-management', isAuthenticated, async (req, res)=>{
    try {
        const leads = await Lead.find()
            .populate('assignedTo', 'fullName email')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();
        
        res.render('leads/leadsManagement', {
            title: "Leads Management", 
            subTitle:"Leads Management",
            leads: leads
        });
    } catch (error) {
        console.error('Error loading leads:', error);
        res.render('leads/leadsManagement', {
            title: "Leads Management", 
            subTitle:"Leads Management",
            leads: []
        });
    }
});

router.get('/add-leads', isAuthenticated, (req, res)=>{
    res.render('leads/addLeads', {title: "Add Leads", subTitle:"Add Leads"})
});

// Export leads to CSV - EXACTLY matching table columns
router.get('/export-csv', isAuthenticated, async (req, res) => {
    try {
        const leads = await Lead.find()
            .sort({ createdAt: -1 })
            .lean();
        
        // CSV headers - EXACTLY matching table columns (Date, Name, Email, Phone, Message, Pages)
        const headers = ['Date', 'Name', 'Email', 'Phone', 'Message', 'Pages'];
        
        // Create CSV rows
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        leads.forEach(lead => {
            // Format date exactly like table
            const date = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            
            // Full message for CSV (not truncated)
            let message = 'No message';
            if (lead.notes) {
                message = lead.notes.replace(/"/g, '""').replace(/\n/g, ' '); // Escape quotes and remove line breaks
            }
            
            // Format phone number with tab prefix to force Excel to treat as text
            const phone = lead.phone ? `"\t${lead.phone}"` : `"\tN/A"`;
            
            const row = [
                `"${date}"`,
                `"${lead.fullName || 'N/A'}"`,
                `"${lead.email || 'N/A'}"`,
                phone,
                `"${message}"`,
                `"${lead.interestedIn || 'N/A'}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for proper UTF-8 encoding
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting leads:', error);
        res.status(500).send('Error exporting leads data');
    }
});

module.exports = router;
