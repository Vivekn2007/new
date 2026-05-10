const mongoose = require('mongoose');

const connectDB = async () => {
    // If we are already connected, don't connect again
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        // Don't exit the process on Vercel; let it retry on the next request
    }
};

module.exports = connectDB;