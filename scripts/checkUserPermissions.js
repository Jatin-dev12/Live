const mongoose = require('mongoose');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

async function checkUserPermissions() {
    try {
        console.log('🔍 Checking user permissions...\n');
        
        // Get all permissions for reference
        const allPermissions = await Permission.find();
        const validSlugs = allPermissions.map(p => p.slug);
        
        // Get all users with their roles
        const users = await User.find().populate('role').select('-password');
        
        console.log(`📊 Found ${users.length} users\n`);
        console.log('═══════════════════════════════════════\n');
        
        for (const user of users) {
            console.log(`👤 ${user.fullName} (${user.email})`);
            console.log(`   Role: ${user.role ? user.role.name : 'No role'}`);
            console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
            
            if (user.customPermissions && user.customPermissions.length > 0) {
                console.log(`   Custom Permissions (${user.customPermissions.length}):`);
                
                const validPerms = [];
                const invalidPerms = [];
                
                user.customPermissions.forEach(perm => {
                    if (validSlugs.includes(perm)) {
                        validPerms.push(perm);
                    } else {
                        invalidPerms.push(perm);
                    }
                });
                
                if (validPerms.length > 0) {
                    console.log(`     ✅ Valid: ${validPerms.join(', ')}`);
                }
                
                if (invalidPerms.length > 0) {
                    console.log(`     ❌ Invalid: ${invalidPerms.join(', ')}`);
                }
            } else {
                console.log(`   Custom Permissions: None (using role permissions only)`);
            }
            
            console.log('');
        }
        
        console.log('═══════════════════════════════════════');
        console.log('✅ Check completed!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the check
checkUserPermissions();
