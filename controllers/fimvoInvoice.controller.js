const invoice = require('../Models/finvoInvoice.model');
const nodemailer = require('nodemailer');

const createInvoice = async (req, res) => { 
    try {
        const { clientName, amount, status, owner } = req.body;
        const newInvoice = await invoice.create({ clientName, amount, status, owner });
        res.status(201).json({ message: "Invoice created", invoiceId: newInvoice._id });

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Email_user,
                pass: process.env.Email_passkey
            }
        });  
        let mailOptions = {
            from: process.env.Email_user,
            to: email,
            html: `<p>Dear ${clientName},</p><p>Your invoice for the amount of $${amount} has been created with status: ${status}.</p><p>Thank you for your business!</p>`
        };
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