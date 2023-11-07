// backend/models/User.js
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true, // Ensure email addresses are unique
        required: true, // Email is a required field
        trim: true, // Trim whitespace from input
        lowercase: true, // Store emails in lowercase
    },
    password: {
        type: String,
        required: true, // Password is a required field
    },
    createdAt: {
        type: Date,
        default: Date.now, // Store the creation date
    },
    preference: { 
        type: Object 
    } 
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model

