const mongoose = require('mongoose');
const Page = require('../models/Page');
const Content = require('../models/Content');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedPages = async () => {
    try {
        await connectDB();

        // Clear existing pages and content
        console.log('Clearing existing pages and content...');
        await Page.deleteMany({});
        await Content.deleteMany({});

        // Create sample pages
        console.log('Creating sample pages...');
        
        const homePage = await Page.create({
            name: 'Home',
            slug: 'home',
            path: '/',
            status: 'active',
            metaTitle: 'Welcome to Our Website',
            metaDescription: 'This is the home page of our website'
        });

        const aboutPage = await Page.create({
            name: 'About Us',
            slug: 'about-us',
            path: '/about-us',
            status: 'active',
            metaTitle: 'About Us - Learn More About Our Company',
            metaDescription: 'Learn more about our company, mission, and values'
        });

        const servicesPage = await Page.create({
            name: 'Services',
            slug: 'services',
            path: '/services',
            status: 'active',
            metaTitle: 'Our Services - What We Offer',
            metaDescription: 'Explore our range of professional services'
        });

        const contactPage = await Page.create({
            name: 'Contact',
            slug: 'contact',
            path: '/contact',
            status: 'active',
            metaTitle: 'Contact Us - Get In Touch',
            metaDescription: 'Get in touch with us for any inquiries'
        });

        console.log('Sample pages created successfully!');

        // Create sample content
        console.log('Creating sample content...');

        await Content.create({
            page: homePage._id,
            title: 'Welcome to Our Platform',
            description: 'Your one-stop solution for all your needs',
            content: '<h2>Welcome!</h2><p>We are excited to have you here. Our platform offers cutting-edge solutions to help you achieve your goals.</p>',
            status: 'active',
            order: 1
        });

        await Content.create({
            page: aboutPage._id,
            title: 'Our Story',
            description: 'How we started and where we are going',
            content: '<h2>Our Journey</h2><p>Founded in 2020, we have been dedicated to providing exceptional service to our clients. Our team of experts works tirelessly to ensure your success.</p>',
            status: 'active',
            order: 1
        });

        await Content.create({
            page: aboutPage._id,
            title: 'Our Mission',
            description: 'What drives us forward',
            content: '<h2>Mission Statement</h2><p>To empower businesses and individuals through innovative technology solutions and exceptional customer service.</p>',
            status: 'active',
            order: 2
        });

        await Content.create({
            page: servicesPage._id,
            title: 'Web Development',
            description: 'Custom web solutions tailored to your needs',
            content: '<h3>Professional Web Development</h3><p>We create stunning, responsive websites that drive results. Our team uses the latest technologies to build fast, secure, and scalable web applications.</p>',
            category: 'Development',
            status: 'active',
            order: 1
        });

        await Content.create({
            page: servicesPage._id,
            title: 'Mobile App Development',
            description: 'Native and cross-platform mobile applications',
            content: '<h3>Mobile Solutions</h3><p>From iOS to Android, we develop mobile applications that provide seamless user experiences across all devices.</p>',
            category: 'Development',
            status: 'active',
            order: 2
        });

        await Content.create({
            page: servicesPage._id,
            title: 'UI/UX Design',
            description: 'Beautiful and intuitive user interfaces',
            content: '<h3>Design Excellence</h3><p>Our design team creates visually stunning and user-friendly interfaces that enhance user engagement and satisfaction.</p>',
            category: 'Design',
            status: 'active',
            order: 3
        });

        await Content.create({
            page: contactPage._id,
            title: 'Get In Touch',
            description: 'We would love to hear from you',
            content: '<h2>Contact Information</h2><p>Email: info@example.com</p><p>Phone: +1 (555) 123-4567</p><p>Address: 123 Business Street, City, State 12345</p>',
            status: 'active',
            order: 1
        });

        console.log('Sample content created successfully!');
        console.log('\n=== Seeding Complete ===');
        console.log('Created Pages:');
        console.log('- Home (/)');
        console.log('- About Us (/about-us)');
        console.log('- Services (/services)');
        console.log('- Contact (/contact)');
        console.log('\nYou can now:');
        console.log('1. View pages at: http://localhost:8080/page-master/web-page-master');
        console.log('2. View content at: http://localhost:8080/cms/content-management');
        console.log('3. Visit pages directly at their paths (e.g., http://localhost:8080/about-us)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding pages:', error);
        process.exit(1);
    }
};

seedPages();
