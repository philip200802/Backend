const invoice = require('../Models/finvoInvoice.model');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const JWT_Secret = process.env.JWT_SECRET || process.env.jwt_secret;

const createInvoice = async (req, res) => {
    try {
        // ================= AUTH =================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const owner = decoded.id;

        // ================= DATA =================
        const {
            clientName,
            amount,
            status,
            dueDate,
            description,
            clientEmail,
            items
        } = req.body;

        if (!clientName || amount === undefined) {
            return res.status(400).json({
                message: "clientName and amount are required"
            });
        }

        // ================= CREATE =================
        const newInvoice = await invoice.create({
            clientName,
            amount,
            status: status || "Pending",
            owner,
            dueDate,
            description,
            amountDue: amount,
             items: formattedItems 
        });

        // ================= RESPONSE FIRST =================
        res.status(201).json({
            message: "Invoice created",
            invoiceId: newInvoice._id
        });

        // ================= EMAIL (ASYNC) =================
        if (clientEmail) {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.Email_user,
                        pass: process.env.Email_passkey,
                    },
                });

                await transporter.sendMail({
                    from: process.env.Email_user,
                    to: clientEmail,
                    subject: "Invoice Created - Finvo",
                    html: `
                        <div style="font-family:Arial;padding:20px">
                            <h2>Invoice Created</h2>
                            <p>Hi ${clientName},</p>
                            <p>Your invoice of <b>₦${amount}</b> has been created.</p>
                            <p>Status: ${status || "Pending"}</p>
                        </div>
                    `,
                });

                console.log("Invoice email sent");
            } catch (emailErr) {
                console.log("Email error:", emailErr.message);
            }
        }

    } catch (err) {
        return res.status(500).json({
            message: "Failed to create invoice",
            error: err.message
        });
    }
};


const getInvoices = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const invoices = await invoice
            .find({ owner: decoded.id })
            .populate('owner', 'firstName lastName email');

        res.json(invoices);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch invoices",
            error: err.message
        });
    }
};

// GET single invoice
const getInvoiceById = async (req, res) => {
    try {
        const inv = await invoice.findById(req.params.id).populate('owner', 'firstName lastName email');
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json(inv);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch invoice", error: err.message });
    }
};

// UPDATE invoice
const updateInvoice = async (req, res) => {
    try {
        const { clientName, amount, status, dueDate, description } = req.body;

        const updatedInvoice = await invoice.findByIdAndUpdate(
            req.params.id,
            { clientName, amount, status, dueDate, description },
            { new: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json({ message: "Invoice updated", invoice: updatedInvoice });
    } catch (err) {
        res.status(500).json({ message: "Failed to update invoice", error: err.message });
    }
};

// DELETE invoice
const deleteInvoice = async (req, res) => {
    try {
        const deletedInvoice = await invoice.findByIdAndDelete(req.params.id);

        if (!deletedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json({ message: "Invoice deleted", invoice: deletedInvoice });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete invoice", error: err.message });
    }
};

// PAYMENT TRACKING - Record a payment
const recordPayment = async (req, res) => {
    try {
        const { amountPaid, paymentMethod, notes } = req.body;
        const invoiceId = req.params.id;

        const inv = await invoice.findById(invoiceId);
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Add to payment history
        inv.paymentHistory.push({
            amountPaid,
            paymentMethod,
            notes
        });

        // Update total amount paid
        inv.amountPaid += amountPaid;
        inv.amountDue = inv.amount - inv.amountPaid;

        // Auto-update status
        if (inv.amountDue <= 0) {
            inv.status = 'Paid';
        }

        await inv.save();
        res.json({ message: "Payment recorded", invoice: inv });
    } catch (err) {
        res.status(500).json({ message: "Failed to record payment", error: err.message });
    }
};

// GET payment history
const getPaymentHistory = async (req, res) => {
    try {
        const inv = await invoice.findById(req.params.id);
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json(inv.paymentHistory);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch payment history", error: err.message });
    }
};

// Generate PDF with payment details
const generateInvoicePDF = async (req, res) => {
    try {
        const { startMonth, startYear, endMonth, endYear } = req.query;

        if (!startMonth || !startYear) {
            return res.status(400).json({ message: "startMonth and startYear are required" });
        }

        const endM = endMonth || startMonth;
        const endY = endYear || startYear;

        const startDate = new Date(startYear, startMonth - 1, 1);
        const endDate = new Date(endY, endM, 1);

        const invoices = await invoice.find({
            createdAt: { $gte: startDate, $lt: endDate }
        }).populate('owner', 'firstName lastName email');

        if (invoices.length === 0) {
            return res.status(404).json({ message: "No invoices found for this period" });
        }

        const doc = new PDFDocument();
        const dateRange = startMonth === endM && startYear === endY
            ? `${startMonth}/${startYear}`
            : `${startMonth}/${startYear}-${endM}/${endY}`;
        const filename = `invoices-${dateRange}.pdf`;
        const filepath = path.join(__dirname, '../pdfs', filename);

        const pdfsDir = path.join(__dirname, '../pdfs');
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir);
        }

        doc.pipe(fs.createWriteStream(filepath));

        doc.fontSize(20).text('INVOICES REPORT', 100, 50);
        doc.fontSize(12).text(`Period: ${dateRange}`, 100, 80);
        doc.text(`Total Invoices: ${invoices.length}`, 100, 100);
        doc.moveTo(100, 120).lineTo(500, 120).stroke();

        let yPosition = 140;
        let totalAmount = 0;
        let totalPaid = 0;

        invoices.forEach((inv, index) => {
            doc.fontSize(11).text(`${index + 1}. Client: ${inv.clientName}`, 100, yPosition);
            yPosition += 20;
            doc.text(`   Amount: $${inv.amount} | Paid: $${inv.amountPaid} | Due: $${inv.amountDue}`, 100, yPosition);
            yPosition += 20;
            doc.text(`   Status: ${inv.status}`, 100, yPosition);
            yPosition += 20;
            doc.text(`   Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 100, yPosition);
            yPosition += 25;
            totalAmount += inv.amount;
            totalPaid += inv.amountPaid;
        });

        doc.moveTo(100, yPosition).lineTo(500, yPosition).stroke();
        yPosition += 20;
        doc.fontSize(12).text(`Total Amount: $${totalAmount}`, 100, yPosition);
        yPosition += 15;
        doc.text(`Total Paid: $${totalPaid}`, 100, yPosition);
        yPosition += 15;
        doc.text(`Total Due: $${totalAmount - totalPaid}`, 100, yPosition);

        doc.end();

        doc.on('finish', () => {
            res.download(filepath, filename, (err) => {
                if (err) console.log(err);
                fs.unlink(filepath, (err) => {
                    if (err) console.log(err);
                });
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to generate PDF", error: err.message });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getPaymentHistory,
    generateInvoicePDF
};