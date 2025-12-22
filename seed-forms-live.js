const mongoose = require('mongoose');

// Form Schema Definition (self-contained for live database)
const formSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    formType: {
        type: String,
        enum: ['contact', 'suggestion', 'accessibility', 'grievance', 'complaint', 'query', 'feedback', 'registration', 'newsletter', 'custom'],
        default: 'contact'
    },
    fields: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        label: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'file'],
            required: true
        },
        placeholder: {
            type: String,
            trim: true
        },
        required: {
            type: Boolean,
            default: false
        },
        options: [{
            label: String,
            value: String
        }], // For select, radio, checkbox fields
        validation: {
            minLength: Number,
            maxLength: Number,
            pattern: String
        }
    }],
    settings: {
        submitButtonText: {
            type: String,
            default: 'Submit'
        },
        successMessage: {
            type: String,
            default: 'Thank you for your submission!'
        },
        redirectUrl: {
            type: String,
            trim: true
        },
        emailNotification: {
            enabled: {
                type: Boolean,
                default: true
            },
            recipients: [String],
            subject: String
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
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
formSchema.index({ status: 1 });
formSchema.index({ formType: 1 });
formSchema.index({ title: 1 });

// Create Form model
const Form = mongoose.model('Form', formSchema);

// Connect to MongoDB
async function connectDB() {
    try {
        // IMPORTANT: Update this connection string for your live database
        const mongoURI = process.env.MONGODB_URI || 'YOUR_LIVE_DATABASE_CONNECTION_STRING_HERE';
        
        if (mongoURI === 'YOUR_LIVE_DATABASE_CONNECTION_STRING_HERE') {
            console.error('❌ Please update the MongoDB connection string in the script!');
            console.error('   Set the MONGODB_URI environment variable or update the mongoURI variable');
            process.exit(1);
        }
        
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to Live MongoDB Database');
        console.log('📊 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function seedFormsTable() {
    try {
        console.log('🌱 Seeding Forms table in live database...');
        
        // Check if forms collection already exists and has data
        const existingFormsCount = await Form.countDocuments();
        console.log(`📊 Existing forms in database: ${existingFormsCount}`);
        
        if (existingFormsCount > 0) {
            console.log('⚠️  Forms already exist in the database.');
            console.log('   Choose an option:');
            console.log('   1. Comment out the "return" line below to replace existing forms');
            console.log('   2. Or manually delete existing forms first');
            console.log('');
            console.log('   Exiting to prevent accidental data loss...');
            return; // Comment this line if you want to replace existing forms
        }
        
        const formsData = [
            {
                title: 'Contact Form',
                description: 'General contact form for inquiries and communication',
                formType: 'contact',
                fields: [
                    {
                        name: 'name',
                        label: 'Full Name',
                        type: 'text',
                        placeholder: 'Enter your full name',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        placeholder: 'Enter your email address',
                        required: true
                    },
                    {
                        name: 'phone',
                        label: 'Phone Number',
                        type: 'tel',
                        placeholder: 'Enter your phone number',
                        required: false
                    },
                    {
                        name: 'subject',
                        label: 'Subject',
                        type: 'text',
                        placeholder: 'Enter the subject',
                        required: true
                    },
                    {
                        name: 'message',
                        label: 'Message',
                        type: 'textarea',
                        placeholder: 'Enter your message',
                        required: true
                    }
                ],
                settings: {
                    submitButtonText: 'Send Message',
                    successMessage: 'Thank you for contacting us! We will get back to you soon.',
                    emailNotification: {
                        enabled: true,
                        recipients: ['contact@example.com'],
                        subject: 'New Contact Form Submission'
                    }
                },
                status: 'active'
            },
            {
                title: 'Suggestion Form',
                description: 'Submit suggestions and ideas for improvement',
                formType: 'suggestion',
                fields: [
                    {
                        name: 'name',
                        label: 'Your Name',
                        type: 'text',
                        placeholder: 'Enter your name',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        placeholder: 'Enter your email address',
                        required: true
                    },
                    {
                        name: 'category',
                        label: 'Suggestion Category',
                        type: 'select',
                        required: true,
                        options: [
                            { label: 'Service Improvement', value: 'service' },
                            { label: 'Website Enhancement', value: 'website' },
                            { label: 'Process Improvement', value: 'process' },
                            { label: 'New Feature', value: 'feature' },
                            { label: 'Other', value: 'other' }
                        ]
                    },
                    {
                        name: 'suggestion',
                        label: 'Your Suggestion',
                        type: 'textarea',
                        placeholder: 'Please describe your suggestion in detail',
                        required: true
                    },
                    {
                        name: 'priority',
                        label: 'Priority Level',
                        type: 'radio',
                        required: false,
                        options: [
                            { label: 'Low', value: 'low' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'High', value: 'high' }
                        ]
                    }
                ],
                settings: {
                    submitButtonText: 'Submit Suggestion',
                    successMessage: 'Thank you for your suggestion! We appreciate your feedback.',
                    emailNotification: {
                        enabled: true,
                        recipients: ['suggestions@example.com'],
                        subject: 'New Suggestion Received'
                    }
                },
                status: 'active'
            },
            {
                title: 'Accessibility Form',
                description: 'Report accessibility issues and request accommodations',
                formType: 'accessibility',
                fields: [
                    {
                        name: 'name',
                        label: 'Full Name',
                        type: 'text',
                        placeholder: 'Enter your full name',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        placeholder: 'Enter your email address',
                        required: true
                    },
                    {
                        name: 'phone',
                        label: 'Phone Number',
                        type: 'tel',
                        placeholder: 'Enter your phone number',
                        required: false
                    },
                    {
                        name: 'issue_type',
                        label: 'Type of Issue',
                        type: 'select',
                        required: true,
                        options: [
                            { label: 'Website Accessibility', value: 'website' },
                            { label: 'Physical Accessibility', value: 'physical' },
                            { label: 'Document Accessibility', value: 'document' },
                            { label: 'Service Accessibility', value: 'service' },
                            { label: 'Other', value: 'other' }
                        ]
                    },
                    {
                        name: 'description',
                        label: 'Issue Description',
                        type: 'textarea',
                        placeholder: 'Please describe the accessibility issue or accommodation needed',
                        required: true
                    },
                    {
                        name: 'assistive_technology',
                        label: 'Assistive Technology Used',
                        type: 'text',
                        placeholder: 'e.g., Screen reader, Voice recognition software',
                        required: false
                    }
                ],
                settings: {
                    submitButtonText: 'Submit Request',
                    successMessage: 'Thank you for your accessibility request. We will respond within 48 hours.',
                    emailNotification: {
                        enabled: true,
                        recipients: ['accessibility@example.com'],
                        subject: 'New Accessibility Request'
                    }
                },
                status: 'active'
            },
            {
                title: 'Grievance Form',
                description: 'Submit formal grievances and complaints for resolution',
                formType: 'grievance',
                fields: [
                    {
                        name: 'name',
                        label: 'Full Name',
                        type: 'text',
                        placeholder: 'Enter your full name',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        placeholder: 'Enter your email address',
                        required: true
                    },
                    {
                        name: 'phone',
                        label: 'Phone Number',
                        type: 'tel',
                        placeholder: 'Enter your phone number',
                        required: true
                    },
                    {
                        name: 'grievance_type',
                        label: 'Type of Grievance',
                        type: 'select',
                        required: true,
                        options: [
                            { label: 'Service Related', value: 'service' },
                            { label: 'Staff Conduct', value: 'staff' },
                            { label: 'Policy Issue', value: 'policy' },
                            { label: 'Discrimination', value: 'discrimination' },
                            { label: 'Other', value: 'other' }
                        ]
                    },
                    {
                        name: 'incident_date',
                        label: 'Date of Incident',
                        type: 'text',
                        placeholder: 'MM/DD/YYYY',
                        required: true
                    },
                    {
                        name: 'description',
                        label: 'Detailed Description',
                        type: 'textarea',
                        placeholder: 'Please provide a detailed description of your grievance',
                        required: true
                    },
                    {
                        name: 'resolution_sought',
                        label: 'Resolution Sought',
                        type: 'textarea',
                        placeholder: 'What resolution are you seeking?',
                        required: true
                    }
                ],
                settings: {
                    submitButtonText: 'Submit Grievance',
                    successMessage: 'Your grievance has been submitted. You will receive a response within 5 business days.',
                    emailNotification: {
                        enabled: true,
                        recipients: ['grievances@example.com'],
                        subject: 'New Grievance Submitted'
                    }
                },
                status: 'active'
            },
            {
                title: 'Complaint Form',
                description: 'Submit complaints about services or experiences',
                formType: 'complaint',
                fields: [
                    {
                        name: 'name',
                        label: 'Full Name',
                        type: 'text',
                        placeholder: 'Enter your full name',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        placeholder: 'Enter your email address',
                        required: true
                    },
                    {
                        name: 'phone',
                        label: 'Phone Number',
                        type: 'tel',
                        placeholder: 'Enter your phone number',
                        required: false
                    },
                    {
                        name: 'complaint_category',
                        label: 'Complaint Category',
                        type: 'select',
                        required: true,
                        options: [
                            { label: 'Service Quality', value: 'service_quality' },
                            { label: 'Staff Behavior', value: 'staff_behavior' },
                            { label: 'Billing Issue', value: 'billing' },
                            { label: 'Website/Technical', value: 'technical' },
                            { label: 'Policy Concern', value: 'policy' },
                            { label: 'Other', value: 'other' }
                        ]
                    },
                    {
                        name: 'severity',
                        label: 'Severity Level',
                        type: 'radio',
                        required: true,
                        options: [
                            { label: 'Low', value: 'low' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'High', value: 'high' },
                            { label: 'Critical', value: 'critical' }
                        ]
                    },
                    {
                        name: 'complaint_details',
                        label: 'Complaint Details',
                        type: 'textarea',
                        placeholder: 'Please provide detailed information about your complaint',
                        required: true
                    },
                    {
                        name: 'preferred_resolution',
                        label: 'Preferred Resolution',
                        type: 'textarea',
                        placeholder: 'How would you like this complaint to be resolved?',
                        required: false
                    }
                ],
                settings: {
                    submitButtonText: 'Submit Complaint',
                    successMessage: 'Your complaint has been received. We will investigate and respond within 3 business days.',
                    emailNotification: {
                        enabled: true,
                        recipients: ['complaints@example.com'],
                        subject: 'New Complaint Received'
                    }
                },
                status: 'active'
            }
        ];
        
        // Insert the forms
        console.log('📝 Inserting forms into database...');
        const createdForms = await Form.insertMany(formsData);
        
        console.log(`✅ Successfully created ${createdForms.length} forms:`);
        createdForms.forEach((form, index) => {
            console.log(`   ${index + 1}. ${form.title} (${form.formType})`);
        });
        
        console.log('\n🎉 Forms seeding completed successfully!');
        console.log('📊 Forms are now available in your live database');
        
        // Verify the insertion
        const totalForms = await Form.countDocuments({ status: 'active' });
        console.log(`📈 Total active forms in database: ${totalForms}`);
        
    } catch (error) {
        console.error('❌ Error seeding forms:', error);
        throw error;
    }
}

async function main() {
    console.log('🚀 Starting Forms Seeding for Live Database');
    console.log('==========================================');
    
    await connectDB();
    
    try {
        await seedFormsTable();
        console.log('\n✅ Operation completed successfully');
        console.log('🎯 Your live database now has the forms table seeded');
    } catch (error) {
        console.error('\n❌ Operation failed:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Check your MongoDB connection string');
        console.log('   2. Ensure the database is accessible');
        console.log('   3. Verify you have write permissions');
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Instructions for use
console.log('📋 INSTRUCTIONS FOR LIVE DATABASE SEEDING:');
console.log('==========================================');
console.log('1. Update the MongoDB connection string in this script');
console.log('2. Set MONGODB_URI environment variable OR update mongoURI variable');
console.log('3. Run: node seed-forms-live.js');
console.log('4. The script will create 5 forms: Contact, Suggestion, Accessibility, Grievance, Complaint');
console.log('');

// Run the script
if (require.main === module) {
    main();
}

module.exports = { seedFormsTable, Form };