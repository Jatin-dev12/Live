const mongoose = require('mongoose');
const Menu = require('../models/Menu');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

// Sample menus
const sampleMenus = [
    {
        name: 'Header Menu',
        slug: 'header-menu',
        location: 'header',
        items: [
            {
                title: 'Home',
                url: '/',
                target: '_self',
                icon: 'material-symbols:home',
                order: 0,
                isActive: true
            },
            {
                title: 'About',
                url: '/about',
                target: '_self',
                icon: 'material-symbols:info',
                order: 1,
                isActive: true
            },
            {
                title: 'Services',
                url: '/services',
                target: '_self',
                icon: 'material-symbols:business-center',
                order: 2,
                isActive: true
            },
            {
                title: 'Contact',
                url: '/contact',
                target: '_self',
                icon: 'material-symbols:contact-mail',
                order: 3,
                isActive: true
            }
        ],
        isActive: true
    },
    {
        name: 'Footer Menu',
        slug: 'footer-menu',
        location: 'footer',
        items: [
            {
                title: 'Privacy Policy',
                url: '/privacy-policy',
                target: '_self',
                order: 0,
                isActive: true
            },
            {
                title: 'Terms & Conditions',
                url: '/terms-conditions',
                target: '_self',
                order: 1,
                isActive: true
            },
            {
                title: 'FAQ',
                url: '/faq',
                target: '_self',
                order: 2,
                isActive: true
            }
        ],
        isActive: true
    }
];

async function seedMenus() {
    try {
        console.log('🌱 Starting to seed menus...\n');
        
        // Clear existing menus
        await Menu.deleteMany({});
        console.log('✅ Cleared existing menus\n');
        
        // Insert sample menus
        const menus = await Menu.insertMany(sampleMenus);
        console.log(`✅ Inserted ${menus.length} menus\n`);
        
        console.log('═══════════════════════════════════════');
        console.log('📊 Summary:');
        menus.forEach(menu => {
            console.log(`   ${menu.name}: ${menu.items.length} items`);
        });
        console.log('═══════════════════════════════════════');
        console.log('✅ Seeding completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding menus:', error);
        process.exit(1);
    }
}

// Run the seeding
seedMenus();
