const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define all permissions
const permissionsData = [
    // Dashboard
    { name: 'Dashboard Manage', slug: 'dashboard-manage', module: 'dashboard', action: 'manage', description: 'Full dashboard access' },
    { name: 'Dashboard Read', slug: 'dashboard-read', module: 'dashboard', action: 'read', description: 'View dashboard' },
    
    // Users
    { name: 'Users Create', slug: 'users-create', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'Users Read', slug: 'users-read', module: 'users', action: 'read', description: 'View users' },
    { name: 'Users Update', slug: 'users-update', module: 'users', action: 'update', description: 'Edit users' },
    { name: 'Users Delete', slug: 'users-delete', module: 'users', action: 'delete', description: 'Delete users' },
    { name: 'Users Manage', slug: 'users-manage', module: 'users', action: 'manage', description: 'Full user management' },
    
    // Roles
    { name: 'Roles Create', slug: 'roles-create', module: 'roles', action: 'create', description: 'Create new roles' },
    { name: 'Roles Read', slug: 'roles-read', module: 'roles', action: 'read', description: 'View roles' },
    { name: 'Roles Update', slug: 'roles-update', module: 'roles', action: 'update', description: 'Edit roles' },
    { name: 'Roles Delete', slug: 'roles-delete', module: 'roles', action: 'delete', description: 'Delete roles' },
    { name: 'Roles Manage', slug: 'roles-manage', module: 'roles', action: 'manage', description: 'Full role management' },
    
    // CMS (Content Management)
    { name: 'CMS Create', slug: 'cms-create', module: 'cms', action: 'create', description: 'Create content' },
    { name: 'CMS Read', slug: 'cms-read', module: 'cms', action: 'read', description: 'View content' },
    { name: 'CMS Update', slug: 'cms-update', module: 'cms', action: 'update', description: 'Edit content' },
    { name: 'CMS Delete', slug: 'cms-delete', module: 'cms', action: 'delete', description: 'Delete content' },
    { name: 'CMS Manage', slug: 'cms-manage', module: 'cms', action: 'manage', description: 'Full content management' },
    
    // SEO
    { name: 'SEO Create', slug: 'seo-create', module: 'seo', action: 'create', description: 'Create SEO settings' },
    { name: 'SEO Read', slug: 'seo-read', module: 'seo', action: 'read', description: 'View SEO settings' },
    { name: 'SEO Update', slug: 'seo-update', module: 'seo', action: 'update', description: 'Edit SEO settings' },
    { name: 'SEO Delete', slug: 'seo-delete', module: 'seo', action: 'delete', description: 'Delete SEO settings' },
    { name: 'SEO Manage', slug: 'seo-manage', module: 'seo', action: 'manage', description: 'Full SEO management' },
    
    // Media
    { name: 'Media Create', slug: 'media-create', module: 'media', action: 'create', description: 'Upload media' },
    { name: 'Media Read', slug: 'media-read', module: 'media', action: 'read', description: 'View media' },
    { name: 'Media Update', slug: 'media-update', module: 'media', action: 'update', description: 'Edit media' },
    { name: 'Media Delete', slug: 'media-delete', module: 'media', action: 'delete', description: 'Delete media' },
    { name: 'Media Manage', slug: 'media-manage', module: 'media', action: 'manage', description: 'Full media management' },
    
    // Ads
    { name: 'Ads Create', slug: 'ads-create', module: 'ads', action: 'create', description: 'Create ads' },
    { name: 'Ads Read', slug: 'ads-read', module: 'ads', action: 'read', description: 'View ads' },
    { name: 'Ads Update', slug: 'ads-update', module: 'ads', action: 'update', description: 'Edit ads' },
    { name: 'Ads Delete', slug: 'ads-delete', module: 'ads', action: 'delete', description: 'Delete ads' },
    { name: 'Ads Manage', slug: 'ads-manage', module: 'ads', action: 'manage', description: 'Full ads management' },
    
    // Leads
    { name: 'Leads Create', slug: 'leads-create', module: 'leads', action: 'create', description: 'Create leads' },
    { name: 'Leads Read', slug: 'leads-read', module: 'leads', action: 'read', description: 'View leads' },
    { name: 'Leads Update', slug: 'leads-update', module: 'leads', action: 'update', description: 'Edit leads' },
    { name: 'Leads Delete', slug: 'leads-delete', module: 'leads', action: 'delete', description: 'Delete leads' },
    { name: 'Leads Manage', slug: 'leads-manage', module: 'leads', action: 'manage', description: 'Full leads management' },
    
    // Blog
    { name: 'Blog Create', slug: 'blog-create', module: 'blog', action: 'create', description: 'Create blog posts' },
    { name: 'Blog Read', slug: 'blog-read', module: 'blog', action: 'read', description: 'View blog posts' },
    { name: 'Blog Update', slug: 'blog-update', module: 'blog', action: 'update', description: 'Edit blog posts' },
    { name: 'Blog Delete', slug: 'blog-delete', module: 'blog', action: 'delete', description: 'Delete blog posts' },
    { name: 'Blog Manage', slug: 'blog-manage', module: 'blog', action: 'manage', description: 'Full blog management' },
    
    // Settings
    { name: 'Settings Create', slug: 'settings-create', module: 'settings', action: 'create', description: 'Create settings' },
    { name: 'Settings Read', slug: 'settings-read', module: 'settings', action: 'read', description: 'View settings' },
    { name: 'Settings Update', slug: 'settings-update', module: 'settings', action: 'update', description: 'Edit settings' },
    { name: 'Settings Delete', slug: 'settings-delete', module: 'settings', action: 'delete', description: 'Delete settings' },
    { name: 'Settings Manage', slug: 'settings-manage', module: 'settings', action: 'manage', description: 'Full settings management' },
    
    // Reports
    { name: 'Reports Read', slug: 'reports-read', module: 'reports', action: 'read', description: 'View reports' },
    { name: 'Reports Manage', slug: 'reports-manage', module: 'reports', action: 'manage', description: 'Full reports access' },
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...\n');
        
        // Clear existing data
        console.log('🗑️  Clearing existing roles and permissions...');
        await Role.deleteMany({});
        await Permission.deleteMany({});
        console.log('✅ Cleared successfully\n');
        
        // Create permissions
        console.log('📝 Creating permissions...');
        const createdPermissions = await Permission.insertMany(permissionsData);
        console.log(`✅ Created ${createdPermissions.length} permissions\n`);
        
        // Create permission lookup map
        const permissionMap = {};
        createdPermissions.forEach(perm => {
            permissionMap[perm.slug] = perm._id;
        });
        
        // Define 4 roles with their permissions
        const rolesData = [
            {
                name: 'Super Admin',
                slug: 'super-admin',
                level: 1,
                description: 'Full system access with all permissions',
                permissions: Object.values(permissionMap), // ALL permissions
                isActive: true
            },
            {
                name: 'Admin',
                slug: 'admin',
                level: 2,
                description: 'High-level access, cannot manage roles',
                permissions: [
                    permissionMap['dashboard-manage'],
                    permissionMap['users-create'],
                    permissionMap['users-read'],
                    permissionMap['users-update'],
                    permissionMap['users-delete'],
                    permissionMap['users-manage'],
                    permissionMap['roles-read'], // Can only view roles
                    permissionMap['cms-create'],
                    permissionMap['cms-read'],
                    permissionMap['cms-update'],
                    permissionMap['cms-delete'],
                    permissionMap['cms-manage'],
                    permissionMap['seo-create'],
                    permissionMap['seo-read'],
                    permissionMap['seo-update'],
                    permissionMap['seo-delete'],
                    permissionMap['seo-manage'],
                    permissionMap['media-create'],
                    permissionMap['media-read'],
                    permissionMap['media-update'],
                    permissionMap['media-delete'],
                    permissionMap['media-manage'],
                    permissionMap['ads-create'],
                    permissionMap['ads-read'],
                    permissionMap['ads-update'],
                    permissionMap['ads-delete'],
                    permissionMap['ads-manage'],
                    permissionMap['leads-create'],
                    permissionMap['leads-read'],
                    permissionMap['leads-update'],
                    permissionMap['leads-delete'],
                    permissionMap['leads-manage'],
                    permissionMap['blog-create'],
                    permissionMap['blog-read'],
                    permissionMap['blog-update'],
                    permissionMap['blog-delete'],
                    permissionMap['blog-manage'],
                    permissionMap['settings-read'], // Can only view settings
                    permissionMap['reports-read'],
                    permissionMap['reports-manage'],
                ],
                isActive: true
            },
            {
                name: 'Content Manager',
                slug: 'content-manager',
                level: 3,
                description: 'Manages content, SEO, and media only',
                permissions: [
                    permissionMap['dashboard-read'],
                    permissionMap['cms-create'],
                    permissionMap['cms-read'],
                    permissionMap['cms-update'],
                    permissionMap['cms-delete'],
                    permissionMap['cms-manage'],
                    permissionMap['seo-create'],
                    permissionMap['seo-read'],
                    permissionMap['seo-update'],
                    permissionMap['seo-delete'],
                    permissionMap['seo-manage'],
                    permissionMap['media-create'],
                    permissionMap['media-read'],
                    permissionMap['media-update'],
                    permissionMap['media-delete'],
                    permissionMap['media-manage'],
                ],
                isActive: true
            },
            {
                name: 'User',
                slug: 'user',
                level: 4,
                description: 'Read-only access to view content',
                permissions: [
                    permissionMap['dashboard-read'],
                    permissionMap['cms-read'],
                    permissionMap['seo-read'],
                    permissionMap['media-read'],
                    permissionMap['ads-read'],
                    permissionMap['leads-read'],
                    permissionMap['blog-read'],
                    permissionMap['reports-read'],
                ],
                isActive: true
            }
        ];
        
        // Create roles
        console.log('👥 Creating roles...');
        const createdRoles = await Role.insertMany(rolesData);
        console.log(`✅ Created ${createdRoles.length} roles\n`);
        
        // Display summary
        console.log('📊 Summary:');
        console.log('═══════════════════════════════════════\n');
        
        for (const role of createdRoles) {
            const roleWithPerms = await Role.findById(role._id).populate('permissions');
            console.log(`🎭 ${role.name} (Level ${role.level})`);
            console.log(`   Slug: ${role.slug}`);
            console.log(`   Permissions: ${roleWithPerms.permissions.length}`);
            console.log(`   Description: ${role.description}`);
            console.log('');
        }
        
        console.log('═══════════════════════════════════════');
        console.log('✅ Database seeded successfully!');
        console.log('\n🎉 You can now create users and assign these roles!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed
seedDatabase();
