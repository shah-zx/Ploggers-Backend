// models/JoinRequest.js

// Code written by - Priti Saha ->

const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;
