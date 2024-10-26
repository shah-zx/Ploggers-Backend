// Code written by harshal pohankar //

const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/ // Simple email regex validation
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

module.exports = ContactRequest;
