
// models/MediaItem.js

const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
    image: {
        type: String, // URL or path to the uploaded image
        required: true,
    },
    googleFormLink: {
        type: String,
        required: true,
    },
}, {
    timestamps: true // Optionally add timestamps for createdAt and updatedAt
});

const MediaItem = mongoose.model('MediaItem', mediaItemSchema);

module.exports = MediaItem;