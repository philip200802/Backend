const mongoose = require('mongoose');

let invoiceSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    items: [
  {
    description: { type: String, required: true },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number }
  }
],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // Payment tracking fields
    amountPaid: {
        type: Number,
        default: 0
    },
    amountDue: {
        type: Number,
        default: function() { return this.amount; }
    },
    dueDate: {
        type: Date
    },
    paymentHistory: [{
        amountPaid: Number,
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentMethod: String,
        notes: String
    }],
    description: String
}, { timestamps: true });

const Invoice = mongoose.model('invoice', invoiceSchema, 'Invoices');

module.exports = Invoice;