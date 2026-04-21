const invoice = require('../Models/finvoInvoice.model');

const createInvoice = async (req, res) => { 
    try {
        const { clientName, amount, status, owner } = req.body;
        const newInvoice = await invoice.create({ clientName, amount, status, owner });
        res.status(201).json({ message: "Invoice created", invoiceId: newInvoice._id });
    } catch (err) {
        res.status(500).json({ message: "Failed to create invoice", error: err.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const invoices = await invoice.find().populate('owner', 'firstName lastName email');
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch invoices", error: err.message });
    }
};
module.exports = {
    createInvoice,
    getInvoices
};  