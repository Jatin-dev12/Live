const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const ContactQuery = require('../models/ContactQuery');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

// Dummy leads data
const dummyLeads = [
    {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+91-9876543210',
        company: 'Tech Solutions Inc',
        designation: 'CTO',
        source: 'Website',
        status: 'New',
        interestedIn: 'Web Development Services',
        notes: 'Interested in custom web application development'
    },
    {
        fullName: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        phone: '+91-9876543211',
        company: 'Digital Marketing Pro',
        designation: 'Marketing Manager',
        source: 'Social Media',
        status: 'Contacted',
        interestedIn: 'SEO Services',
        notes: 'Looking for long-term SEO partnership'
    },
    {
        fullName: 'Michael Brown',
        email: 'mbrown@startup.io',
        phone: '+91-9876543212',
        company: 'StartupHub',
        designation: 'Founder',
        source: 'Referral',
        status: 'Qualified',
        interestedIn: 'Full Stack Development',
        notes: 'Needs MVP development for new startup'
    },
    {
        fullName: 'Emily Davis',
        email: 'emily.davis@corp.com',
        phone: '+91-9876543213',
        company: 'Enterprise Corp',
        designation: 'IT Director',
        source: 'Email Campaign',
        status: 'Proposal',
        interestedIn: 'Enterprise Software Solution',
        notes: 'Requested detailed proposal for ERP system'
    },
    {
        fullName: 'David Wilson',
        email: 'dwilson@business.net',
        phone: '+91-9876543214',
        company: 'Business Solutions Ltd',
        designation: 'CEO',
        source: 'Cold Call',
        status: 'Negotiation',
        interestedIn: 'CRM Development',
        notes: 'In final negotiation stage, budget approved'
    },
    {
        fullName: 'Lisa Anderson',
        email: 'lisa.a@retail.com',
        phone: '+91-9876543215',
        company: 'Retail Plus',
        designation: 'Operations Manager',
        source: 'Website',
        status: 'New',
        interestedIn: 'E-commerce Platform',
        notes: 'Looking to build online store'
    },
    {
        fullName: 'Robert Taylor',
        email: 'rtaylor@finance.com',
        phone: '+91-9876543216',
        company: 'Finance Group',
        designation: 'VP Technology',
        source: 'Referral',
        status: 'Contacted',
        interestedIn: 'Mobile App Development',
        notes: 'Needs iOS and Android app for financial services'
    },
    {
        fullName: 'Jennifer Martinez',
        email: 'jmartinez@healthcare.org',
        phone: '+91-9876543217',
        company: 'Healthcare Systems',
        designation: 'Project Manager',
        source: 'Website',
        status: 'Qualified',
        interestedIn: 'Healthcare Management System',
        notes: 'HIPAA compliant system required'
    },
    {
        fullName: 'William Garcia',
        email: 'wgarcia@education.edu',
        phone: '+91-9876543218',
        company: 'Education Institute',
        designation: 'Dean',
        source: 'Social Media',
        status: 'New',
        interestedIn: 'Learning Management System',
        notes: 'Need LMS for online courses'
    },
    {
        fullName: 'Amanda Rodriguez',
        email: 'arodriguez@consulting.com',
        phone: '+91-9876543219',
        company: 'Consulting Partners',
        designation: 'Senior Consultant',
        source: 'Email Campaign',
        status: 'Won',
        interestedIn: 'Business Intelligence Dashboard',
        notes: 'Project completed successfully'
    }
];

// Dummy contact queries data
const dummyContactQueries = [
    {
        fullName: 'Alex Thompson',
        email: 'alex.t@email.com',
        phone: '+1-555-0201',
        subject: 'Inquiry about Web Development Services',
        message: 'I would like to know more about your web development services and pricing.',
        status: 'Pending',
        priority: 'Medium',
        source: 'Website Contact Form'
    },
    {
        fullName: 'Maria Garcia',
        email: 'maria.g@email.com',
        phone: '+1-555-0202',
        subject: 'Technical Support Request',
        message: 'I am facing issues with the login functionality on my website.',
        status: 'In Progress',
        priority: 'High',
        source: 'Email'
    },
    {
        fullName: 'James Wilson',
        email: 'james.w@email.com',
        phone: '+1-555-0203',
        subject: 'Partnership Opportunity',
        message: 'We are interested in exploring partnership opportunities with your company.',
        status: 'Resolved',
        priority: 'Medium',
        source: 'Website Contact Form'
    },
    {
        fullName: 'Patricia Lee',
        email: 'patricia.l@email.com',
        phone: '+1-555-0204',
        subject: 'Quote Request for Mobile App',
        message: 'Can you provide a quote for developing a mobile app for our business?',
        status: 'Pending',
        priority: 'High',
        source: 'Website Contact Form'
    },
    {
        fullName: 'Christopher Martin',
        email: 'chris.m@email.com',
        phone: '+1-555-0205',
        subject: 'General Inquiry',
        message: 'What are your business hours and how can I schedule a consultation?',
        status: 'Resolved',
        priority: 'Low',
        source: 'Phone'
    },
    {
        fullName: 'Linda White',
        email: 'linda.w@email.com',
        phone: '+1-555-0206',
        subject: 'SEO Services Information',
        message: 'I need information about your SEO packages and what they include.',
        status: 'In Progress',
        priority: 'Medium',
        source: 'Website Contact Form'
    },
    {
        fullName: 'Daniel Harris',
        email: 'daniel.h@email.com',
        phone: '+1-555-0207',
        subject: 'Website Redesign Query',
        message: 'Our company website needs a complete redesign. Can you help?',
        status: 'Pending',
        priority: 'High',
        source: 'Social Media'
    },
    {
        fullName: 'Nancy Clark',
        email: 'nancy.c@email.com',
        phone: '+1-555-0208',
        subject: 'Urgent Bug Report',
        message: 'There is a critical bug in the payment gateway. Please help immediately!',
        status: 'In Progress',
        priority: 'Urgent',
        source: 'Email'
    },
    {
        fullName: 'Kevin Lewis',
        email: 'kevin.l@email.com',
        phone: '+1-555-0209',
        subject: 'Training Request',
        message: 'We need training for our team on the new CMS system.',
        status: 'Closed',
        priority: 'Low',
        source: 'Website Contact Form'
    },
    {
        fullName: 'Betty Walker',
        email: 'betty.w@email.com',
        phone: '+1-555-0210',
        subject: 'Feedback on Services',
        message: 'I wanted to share positive feedback about your excellent customer service.',
        status: 'Closed',
        priority: 'Low',
        source: 'Email'
    }
];

async function seedData() {
    try {
        console.log('🌱 Starting to seed leads and contact queries...\n');
        
        // Clear existing data
        await Lead.deleteMany({});
        await ContactQuery.deleteMany({});
        console.log('✅ Cleared existing data\n');
        
        // Insert leads
        const leads = await Lead.insertMany(dummyLeads);
        console.log(`✅ Inserted ${leads.length} leads\n`);
        
        // Insert contact queries
        const queries = await ContactQuery.insertMany(dummyContactQueries);
        console.log(`✅ Inserted ${queries.length} contact queries\n`);
        
        console.log('═══════════════════════════════════════');
        console.log('📊 Summary:');
        console.log(`   Total Leads: ${leads.length}`);
        console.log(`   Total Contact Queries: ${queries.length}`);
        console.log('═══════════════════════════════════════');
        console.log('✅ Seeding completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seeding
seedData();
