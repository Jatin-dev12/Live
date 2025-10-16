const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_system');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const AdPlacement = require('../models/AdPlacement');
const User = require('../models/User');

const seedPlacements = async () => {
    try {
        await connectDB();

        // Find an admin user to assign as creator
        const adminUser = await User.findOne({ email: { $ne: 'user@example.com' } });
        
        if (!adminUser) {
            console.log('❌ No admin user found. Please create a user first.');
            process.exit(1);
        }

        // Check if placements already exist
        const existingCount = await AdPlacement.countDocuments();
        if (existingCount > 0) {
            console.log(`ℹ️  ${existingCount} ad placements already exist.`);
            const answer = await new Promise((resolve) => {
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                readline.question('Do you want to add more placements? (y/n): ', (ans) => {
                    readline.close();
                    resolve(ans.toLowerCase() === 'y');
                });
            });
            
            if (!answer) {
                console.log('Exiting...');
                process.exit(0);
            }
        }

        // Sample ad placements
        const placements = [
            {
                placementId: 'fk-10101',
                name: 'Home Page - Hero Banner',
                description: 'Large banner at the top of the home page',
                pageLocation: 'Home Page - Top',
                dimensions: { width: 1920, height: 600 },
                isActive: true,
                createdBy: adminUser._id
            },
            {
                placementId: 'fk-10102',
                name: 'Sidebar - Right Column',
                description: 'Sidebar advertisement in the right column',
                pageLocation: 'All Pages - Sidebar',
                dimensions: { width: 300, height: 600 },
                isActive: true,
                createdBy: adminUser._id
            },
            {
                placementId: 'fk-10103',
                name: 'Blog Post - Inline',
                description: 'Advertisement within blog post content',
                pageLocation: 'Blog Pages - Content',
                dimensions: { width: 728, height: 90 },
                isActive: true,
                createdBy: adminUser._id
            },
            {
                placementId: 'fk-10104',
                name: 'Footer - Bottom Banner',
                description: 'Banner at the bottom of all pages',
                pageLocation: 'All Pages - Footer',
                dimensions: { width: 1200, height: 200 },
                isActive: true,
                createdBy: adminUser._id
            },
            {
                placementId: 'fk-10105',
                name: 'Product Page - Sidebar',
                description: 'Advertisement on product detail pages',
                pageLocation: 'Product Pages - Sidebar',
                dimensions: { width: 300, height: 250 },
                isActive: true,
                createdBy: adminUser._id
            }
        ];

        // Insert placements
        const result = await AdPlacement.insertMany(placements);
        
        console.log(`✅ Successfully created ${result.length} ad placements:`);
        result.forEach(placement => {
            console.log(`   - ${placement.placementId}: ${placement.name}`);
        });

        console.log('\n📊 Ad Placement Summary:');
        console.log(`   Total Placements: ${await AdPlacement.countDocuments()}`);
        console.log(`   Active Placements: ${await AdPlacement.countDocuments({ isActive: true })}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding ad placements:', error);
        process.exit(1);
    }
};

seedPlacements();
