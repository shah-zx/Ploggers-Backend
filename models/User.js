// models/User.js

// Code written by - Priti Saha ->

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    dob: { type: Date, required: true }, // Make sure this is a Date
    occupation: { type: String, required: true },
}, { collection: 'members' });

const User = mongoose.model('User', userSchema);

module.exports = User;
