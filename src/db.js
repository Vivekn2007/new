const mongoose = require('mongoose');

// Use a global variable to store the connection. 
// This prevents multiple connections during Vercel hot-reloads.
let isConnected = false; 

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('=> Using existing database connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            // These options prevent the "Buffering Timeout" error
            serverSelectionTimeoutMS: 5000, 
            bufferCommands: false, 
        });

        isConnected = db.connections[0].readyState;
        console.log('=> New database connection established');
    } catch (error) {
        console.error('=> Database connection error:', error);
        throw error;
    }
};

module.exports = connectDB;