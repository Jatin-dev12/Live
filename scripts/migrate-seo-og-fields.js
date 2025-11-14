/**
 * Migration script to convert ogTitle and ogDescription to ogMetaTags
 * Run this script once to migrate existing SEO records
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acrm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const SEO = require('../models/Seo');

async function migrateSEOFields() {
    try {
        console.log('Starting SEO fields migration...');
        
        // Find all SEO records that have ogTitle or ogDescription
        const seoRecords = await SEO.find({
            $or: [
                { ogTitle: { $exists: true, $ne: null, $ne: '' } },
                { ogDescription: { $exists: true, $ne: null, $ne: '' } }
            ]
        });

        console.log(`Found ${seoRecords.length} SEO records to migrate`);

        let migratedCount = 0;
        
        for (const seo of seoRecords) {
            // Build the ogMetaTags HTML content
            let ogMetaTagsContent = '';
            
            if (seo.ogTitle) {
                ogMetaTagsContent += `<p><strong>og:title</strong></p><p>${seo.ogTitle}</p>`;
            }
            
            if (seo.ogDescription) {
                if (ogMetaTagsContent) ogMetaTagsContent += '<p><br></p>';
                ogMetaTagsContent += `<p><strong>og:description</strong></p><p>${seo.ogDescription}</p>`;
            }
            
            // Update the record
            seo.ogMetaTags = ogMetaTagsContent;
            
            // Remove old fields (optional - comment out if you want to keep them)
            seo.ogTitle = undefined;
            seo.ogDescription = undefined;
            
            await seo.save();
            migratedCount++;
            
            console.log(`Migrated SEO record for page: ${seo.page}`);
        }

        console.log(`\nMigration completed successfully!`);
        console.log(`Total records migrated: ${migratedCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateSEOFields();
