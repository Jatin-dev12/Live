const mongoose = require('mongoose');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

const seedPermissions = async () => {
    console.log('🌱 Seeding permissions...');

    const modules = ['users', 'roles', 'dashboard', 'blog', 'leads', 'invoice', 'settings', 'cms', 'media', 'seo', 'ads', 'reports'];
    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    const permissions = [];

    for (const module of modules) {
        for (const action of actions) {
            // Skip redundant permissions (manage includes all)
            if (action === 'manage' || (action !== 'manage' && module !== 'dashboard')) {
                permissions.push({
                    name: `${module.charAt(0).toUpperCase() + module.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                    slug: `${module}-${action}`,
                    description: `Permission to ${action} ${module}`,
                    module,
                    action,
                    isActive: true
                });
            }
        }
    }

    // Add special dashboard permission
    permissions.push({
        name: 'Dashboard Access',
        slug: 'dashboard-access',
        description: 'Permission to access dashboard',
        module: 'dashboard',
        action: 'read',
        isActive: true
    });

    try {
        await Permission.deleteMany({});
        const createdPermissions = await Permission.insertMany(permissions);
        console.log(`✅ Created ${createdPermissions.length} permissions`);
        return createdPermissions;
    } catch (error) {
        console.error('❌ Error seeding permissions:', error.message);
        throw error;
    }
};

const seedRoles = async (permissions) => {
    console.log('🌱 Seeding roles...');

    try {
        await Role.deleteMany({});

        // Super Admin - has all permissions
        const superAdminRole = await Role.create({
            name: 'Super Admin',
            slug: 'super-admin',
            description: 'Full system access with all permissions',
            permissions: permissions.map(p => p._id),
            level: 1,
            isSystemRole: true,
            isActive: true
        });

        // Admin - has most permissions except super admin specific ones
        const adminPermissions = permissions.filter(p =>
            !p.slug.includes('roles-delete') &&
            p.module !== 'settings'
        );
        const adminRole = await Role.create({
            name: 'Admin',
            slug: 'admin',
            description: 'Administrative access with most permissions',
            permissions: adminPermissions.map(p => p._id),
            level: 2,
            isSystemRole: true,
            isActive: true
        });

        // Manager - has read and update permissions
        const managerPermissions = permissions.filter(p =>
            p.action === 'read' ||
            p.action === 'update' ||
            p.slug === 'dashboard-access'
        );
        const managerRole = await Role.create({
            name: 'Manager',
            slug: 'manager',
            description: 'Manager level access with read and update permissions',
            permissions: managerPermissions.map(p => p._id),
            level: 3,
            isSystemRole: true,
            isActive: true
        });

        // User - has basic read permissions
        const userPermissions = permissions.filter(p =>
            p.action === 'read' &&
            ['dashboard', 'blog', 'leads', 'reports'].includes(p.module)
        );
        const userRole = await Role.create({
            name: 'User',
            slug: 'user',
            description: 'Basic user access with read-only permissions',
            permissions: userPermissions.map(p => p._id),
            level: 4,
            isSystemRole: true,
            isActive: true
        });

        // Sales - has permissions for leads, customers, and invoices
        const salesPermissions = permissions.filter(p =>
            ['leads', 'invoice', 'dashboard'].includes(p.module) &&
            ['read', 'create', 'update'].includes(p.action)
        );
        const salesRole = await Role.create({
            name: 'Sales',
            slug: 'sales',
            description: 'Sales team access for leads and invoices',
            permissions: salesPermissions.map(p => p._id),
            level: 4,
            isSystemRole: false,
            isActive: true
        });

        // Content Manager - has permissions for blog, cms, media, seo
        const contentPermissions = permissions.filter(p =>
            ['blog', 'cms', 'media', 'seo', 'dashboard'].includes(p.module) &&
            ['read', 'create', 'update', 'delete'].includes(p.action)
        );
        const contentRole = await Role.create({
            name: 'Content Manager',
            slug: 'content-manager',
            description: 'Content management access for blog, CMS, and media',
            permissions: contentPermissions.map(p => p._id),
            level: 4,
            isSystemRole: false,
            isActive: true
        });

        console.log('✅ Created 6 roles: Super Admin, Admin, Manager, User, Sales, Content Manager');
        return { superAdminRole, adminRole, managerRole, userRole, salesRole, contentRole };
    } catch (error) {
        console.error('❌ Error seeding roles:', error.message);
        throw error;
    }
};

const seedUsers = async (roles) => {
    console.log('🌱 Seeding default users...');

    try {
        await User.deleteMany({});

        // Create Super Admin user
        const superAdmin = await User.create({
            fullName: 'Super Admin',
            email: 'superadmin@example.com',
            password: 'Admin@123',
            phone: '+1234567890',
            role: roles.superAdminRole._id,
            department: 'Management',
            designation: 'Super Administrator',
            description: 'System super administrator with full access',
            isActive: true,
            isEmailVerified: true
        });

        // Create Admin user
        const admin = await User.create({
            fullName: 'Admin User',
            email: 'admin@example.com',
            password: 'Admin@123',
            phone: '+1234567891',
            role: roles.adminRole._id,
            department: 'Management',
            designation: 'Administrator',
            description: 'System administrator',
            isActive: true,
            isEmailVerified: true,
            createdBy: superAdmin._id
        });

        // Create Manager user
        const manager = await User.create({
            fullName: 'Manager User',
            email: 'manager@example.com',
            password: 'Manager@123',
            phone: '+1234567892',
            role: roles.managerRole._id,
            department: 'Operations',
            designation: 'Operations Manager',
            description: 'Operations manager',
            isActive: true,
            isEmailVerified: true,
            createdBy: superAdmin._id
        });

        // Create regular User
        const user = await User.create({
            fullName: 'Regular User',
            email: 'user@example.com',
            password: 'User@123',
            phone: '+1234567893',
            role: roles.userRole._id,
            department: 'Operations',
            designation: 'Team Member',
            description: 'Regular team member',
            isActive: true,
            isEmailVerified: true,
            createdBy: superAdmin._id
        });

        // console.log('✅ Created 4 default users');
        // console.log('\n📧 Login Credentials:');
        // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // console.log('Super Admin: superadmin@example.com / Admin@123');
        // console.log('Admin:       admin@example.com / Admin@123');
        // console.log('Manager:     manager@example.com / Manager@123');
        // console.log('User:        user@example.com / User@123');
        // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    }
};

const seedDatabase = async () => {
    try {
        console.log('🚀 Starting database seeding...\n');

        await connectDB();

        const permissions = await seedPermissions();
        const roles = await seedRoles(permissions);
        await seedUsers(roles);

        console.log('\n✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database seeding failed:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();