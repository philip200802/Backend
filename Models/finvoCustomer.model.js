const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    company: {
        type: String,
        required: false,
        trim: true
    },
    address: {
        street: {
            type: String,
            required: false,
            trim: true
        },
        city: {
            type: String,
            required: false,
            trim: true
        },
        state: {
            type: String,
            required: false,
            trim: true
        },
        country: {
            type: String,
            required: false,
            trim: true
        },
        postalCode: {
            type: String,
            required: false,
            trim: true
        }
    },
    notes: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Customer', customerSchema);
