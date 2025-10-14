const mongoose = require('mongoose');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

async function fixAllUserPermissions() {
    try {
        console.log('🔧 Fixing all user permissions...\n');
        
        // Get all permissions
        const allPermissions = await Permission.find();
        const validSlugs = allPermissions.map(p => p.slug);
        
        console.log(`📋 Valid permission slugs: ${validSlugs.length}`);
        console.log(`   CMS permissions: ${validSlugs.filter(s => s.startsWith('cms-')).join(', ')}\n`);
        
        // Get all users
        const users = await User.find().populate('role');
        
        console.log(`👥 Found ${users.length} users\n`);
        console.log('═══════════════════════════════════════\n');
        
        let fixedCount = 0;
        
        for (const user of users) {
            console.log(`\n👤 ${user.fullName} (${user.email})`);
            console.log(`   Role: ${user.role ? user.role.name : 'No Role'}`);
            console.log(`   Current custom permissions: ${JSON.stringify(user.customPermissions)}`);
            
            // Check if user has any invalid permissions
            let needsUpdate = false;
            const validCustomPerms = [];
            
            if (user.customPermissions && user.customPermissions.length > 0) {
                for (const perm of user.customPermissions) {
                    if (validSlugs.includes(perm)) {
                        validCustomPerms.push(perm);
                    } else {
                        console.log(`   ❌ Invalid permission: "${perm}"`);
                        needsUpdate = true;
                    }
                }
            }
            
            // If user has role permissions but no custom permissions, check if they need CMS access
            if (user.role && user.role.name && 
                (user.role.name.toLowerCase().includes('content') || 
                 user.role.name.toLowerCase().includes('manager') ||
                 user.role.name.toLowerCase() === 'admin')) {
                
                // Check if user already has CMS permissions
                const hasCmsPerms = validCustomPerms.some(p => p.startsWith('cms-'));
                
                if (!hasCmsPerms) {
                    console.log(`   💡 Role "${user.role.name}" should have CMS access`);
                    console.log(`   ➕ Adding all CMS permissions...`);
                    
                    // Add all CMS permissions
                    const cmsPerms = validSlugs.filter(s => s.startsWith('cms-'));
                    validCustomPerms.push(...cmsPerms);
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                user.customPermissions = [...new Set(validCustomPerms)]; // Remove duplicates
                await user.save();
                console.log(`   ✅ Updated permissions to: ${user.customPermissions.join(', ')}`);
                fixedCount++;
            } else {
                console.log(`   ✓ Permissions are valid`);
            }
        }
        
        console.log('\n═══════════════════════════════════════');
        console.log('📊 Summary:');
        console.log(`   ✅ Fixed: ${fixedCount} users`);
        console.log(`   ⏭️  Skipped: ${users.length - fixedCount} users (already correct)`);
        console.log('═══════════════════════════════════════');
        console.log('✅ All user permissions fixed!\n');
        console.log('💡 Please restart your server and test the "Add Content" button.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the fix
fixAllUserPermissions();
