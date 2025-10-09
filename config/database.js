const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Acrm-admin:Jatin444%23%40@acrm.fjukxzf.mongodb.net/crm_system?retryWrites=true&w=majority';
        
        await mongoose.connect(mongoURI);
        
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('💡 Please check:');
        console.error('   1. MongoDB Atlas IP whitelist (add 0.0.0.0/0)');
        console.error('   2. MONGODB_URI environment variable is set correctly');
        console.error('   3. Database credentials are valid');
        // Don't exit in production, let the app run
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
