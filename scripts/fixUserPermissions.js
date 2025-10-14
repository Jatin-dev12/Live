const mongoose = require('mongoose');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

async function fixUserPermissions() {
    try {
        console.log('🔧 Starting user permissions migration...\n');
        
        // Get all permissions for reference
        const allPermissions = await Permission.find();
        const validSlugs = allPermissions.map(p => p.slug);
        
        console.log(`📋 Valid permission slugs in database: ${validSlugs.length}`);
        console.log(`   Examples: ${validSlugs.slice(0, 5).join(', ')}\n`);
        
        // Get all users with customPermissions
        const users = await User.find({ customPermissions: { $exists: true, $ne: [] } }).populate('role');
        
        if (users.length === 0) {
            console.log('✅ No users found with custom permissions to migrate.');
            process.exit(0);
        }
        
        console.log(`📊 Found ${users.length} users with custom permissions\n`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        let invalidPermsFound = [];
        
        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.fullName} (${user.email})`);
            console.log(`   Role: ${user.role ? user.role.name : 'No role'}`);
            console.log(`   Current permissions: ${JSON.stringify(user.customPermissions)}`);
            
            // Convert ObjectIds to slugs
            const newPermissions = [];
            let hasInvalidPerms = false;
            
            for (const permId of user.customPermissions) {
                try {
                    // Check if it's a valid ObjectId
                    if (mongoose.Types.ObjectId.isValid(permId) && permId.length === 24) {
                        // Look up the permission by ID and get its slug
                        const permission = await Permission.findById(permId);
                        if (permission) {
                            newPermissions.push(permission.slug);
                            console.log(`   ✓ Converted ObjectId ${permId} -> ${permission.slug}`);
                        } else {
                            console.log(`   ⚠️  Permission not found for ID: ${permId}`);
                            hasInvalidPerms = true;
                        }
                    } else if (typeof permId === 'string') {
                        // It's a string, check if it's a valid slug
                        if (validSlugs.includes(permId)) {
                            newPermissions.push(permId);
                            console.log(`   ✓ Valid slug: ${permId}`);
                        } else {
                            console.log(`   ❌ Invalid permission slug: "${permId}"`);
                            invalidPermsFound.push({ user: user.email, perm: permId });
                            hasInvalidPerms = true;
                        }
                    }
                } catch (err) {
                    console.log(`   ⚠️  Error processing permission ${permId}: ${err.message}`);
                    hasInvalidPerms = true;
                }
            }
            
            // Update user with new permissions
            if (hasInvalidPerms || newPermissions.length !== user.customPermissions.length) {
                user.customPermissions = newPermissions;
                await user.save();
                console.log(`   ✅ Updated permissions to: ${newPermissions.join(', ')}`);
                updatedCount++;
            } else {
                console.log(`   ⏭️  No changes needed`);
                skippedCount++;
            }
        }
        
        console.log('\n═══════════════════════════════════════');
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Updated: ${updatedCount} users`);
        console.log(`   ⏭️  Skipped: ${skippedCount} users (already correct)`);
        
        if (invalidPermsFound.length > 0) {
            console.log(`\n⚠️  Invalid permissions found and removed:`);
            invalidPermsFound.forEach(({ user, perm }) => {
                console.log(`   - ${user}: "${perm}"`);
            });
            console.log(`\n💡 Tip: These users may need to be reassigned proper permissions.`);
            console.log(`   Valid permission format examples: cms-create, cms-read, cms-update, cms-delete, cms-manage`);
        }
        
        console.log('═══════════════════════════════════════');
        console.log('✅ Migration completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
fixUserPermissions();
