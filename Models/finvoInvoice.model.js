const mongoose = require('mongoose');

let invoiceSchema = mongoose.Schema({
    clientName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    amount: { 
        type: Number, 
        required: true, 
        // trim: true 
    },
    
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Paid', 'Overdue'], 
        default: 'Pending' 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', // This MUST match the name in your Customer model
        required: true 
    }
}, { timestamps: true });

const User = mongoose.model('user', userSchema, 'User');
const Invoice = mongoose.model('invoice', invoiceSchema, 'Invoices');

module.exports = Invoice;
module.exports = User;