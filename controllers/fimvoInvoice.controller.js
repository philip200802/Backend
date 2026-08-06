const invoice = require('../Models/finvoInvoice.model');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const { clientInvoiceEmail, paymentReceivedEmail } = require('../utils/emailTemplates');
const JWT_Secret = process.env.JWT_SECRET || process.env.jwt_secret;

const normalizeInvoice = (invoiceDoc) => {
    const invoiceObject = typeof invoiceDoc?.toObject === 'function' ? invoiceDoc.toObject() : invoiceDoc;

    return {
        ...invoiceObject,
        status: invoiceObject?.status || 'Pending'
    };
};

const createInvoice = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);
        const owner = decoded.id;

        if (!owner) {
            return res.status(400).json({ message: "Invalid token - no user ID" });
        }

        const {
            clientName,
            dueDate,
            description,
            clientEmail,
            items
        } = req.body;

        const defaultDueDate = new Date();
        defaultDueDate.setMonth(defaultDueDate.getMonth() + 3);
        const finalDueDate = dueDate || defaultDueDate;

        if (!clientName || clientName.trim() === "") {
            return res.status(400).json({ message: "Client name is required" });
        }

        if (!clientEmail || clientEmail.trim() === "") {
            return res.status(400).json({ message: "Client email is required" });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items array is required and must have at least 1 item" });
        }

        const formattedItems = [];
        let calculatedAmount = 0;

        for (let item of items) {
            if (!item.description || item.description.trim() === "") {
                return res.status(400).json({ message: "Item description is required" });
            }

            const qty = Number(item.qty);
            const unitPrice = Number(item.unitPrice);

            if (isNaN(qty) || qty <= 0) {
                return res.status(400).json({ message: "Item quantity must be greater than 0" });
            }

            if (isNaN(unitPrice) || unitPrice <= 0) {
                return res.status(400).json({ message: "Item unit price must be greater than 0" });
            }

            const total = qty * unitPrice;
            calculatedAmount += total;

            formattedItems.push({
                description: item.description.trim(),
                qty,
                unitPrice,
                total
            });
        }

        const newInvoice = await invoice.create({
            clientName: clientName.trim(),
            clientEmail,
            amount: calculatedAmount,
            status: "Pending",
            owner,
            dueDate: finalDueDate,
            description: description || "",
            amountDue: calculatedAmount,
            amountPaid: 0,
            items: formattedItems
        });

        res.status(201).json({
            message: "Invoice created successfully",
            invoiceId: newInvoice._id,
            amount: calculatedAmount
        });

        console.log('[INVOICE] Invoice created, triggering async email send...');

        setImmediate(async () => {
            try {
                console.log('[EMAIL] Starting email send to:', clientEmail);
                console.log('[EMAIL] Items received:', JSON.stringify(formattedItems));
                console.log('[EMAIL] Items count:', formattedItems.length);

                const emailHTML = clientInvoiceEmail(
                    clientName,
                    newInvoice._id,
                    description,
                    formattedItems,
                    calculatedAmount,
                    finalDueDate
                );

                console.log('[EMAIL] HTML generated, length:', emailHTML.length);
                console.log('[EMAIL] Calling Resend API...');

                const response = await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: 'adegboyegaphilip6@gmail.com',
                    subject: `Invoice #${newInvoice._id} - Payment Required`,
                    html: emailHTML
                });

                console.log('[EMAIL] Resend Response:', JSON.stringify(response));

                if (response.error) {
                    console.error(`[EMAIL] Failed to send invoice to ${clientEmail}:`, response.error);
                } else {
                    console.log(`[EMAIL] Invoice #${newInvoice._id} sent successfully to ${clientEmail}`);
                }
            } catch (err) {
                console.error('[EMAIL] Error sending invoice email:', err.message);
                console.error('[EMAIL] Stack:', err.stack);
            }
        });

        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: "adegboyegaphilip6@gmail.com",
                subject: "New Invoice Created - Finvo",
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>

<body style="margin:0;padding:40px;background:#f4f6f9;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#5E4A7A;padding:30px;text-align:center;color:white;">
    <h1 style="margin:0;">Finvo</h1>
    <p style="margin:8px 0 0;font-size:15px;">
        New Invoice Notification
    </p>
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2 style="margin-top:0;color:#333;">
A new invoice has been created
</h2>

<p style="color:#666;font-size:15px;line-height:24px;">
A user has successfully created a new invoice in Finvo.
Here are the details:
</p>

<table width="100%" cellpadding="12" cellspacing="0" style="margin-top:25px;border-collapse:collapse;">

<tr style="background:#f7f7f7;">
<td><strong>Invoice ID</strong></td>
<td>${newInvoice._id}</td>
</tr>

<tr>
<td><strong>Client</strong></td>
<td>${clientName}</td>
</tr>

<tr style="background:#f7f7f7;">
<td><strong>Total Amount</strong></td>
<td><strong>₦${Number(calculatedAmount).toLocaleString()}</strong></td>
</tr>

<tr>
<td><strong>Items</strong></td>
<td>${formattedItems.length}</td>
</tr>

<tr style="background:#f7f7f7;">
<td><strong>Due Date</strong></td>
<td>${new Date(finalDueDate).toLocaleDateString()}</td>
</tr>

<tr>
<td><strong>Status</strong></td>
<td>
<span style="
display:inline-block;
background:#FFF4CC;
color:#9A6700;
padding:6px 12px;
border-radius:20px;
font-size:13px;
font-weight:bold;
">
Pending
</span>
</td>
</tr>

</table>

<div style="
margin-top:30px;
padding:18px;
background:#EEF6FF;
border-left:4px solid #5E4A7A;
border-radius:6px;
">

<strong>Reminder</strong><br><br>

Review this invoice from the admin dashboard if any action is required.

</div>

</td>
</tr>

<tr>
<td style="padding:25px;background:#fafafa;text-align:center;font-size:13px;color:#888;">

Powered by <strong>Finvo</strong><br>

© 2026 Finvo. All rights reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
            });
            console.log("Admin notification sent");
        } catch (adminEmailErr) {
            console.log("Admin email error:", adminEmailErr.message);
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

        if (!decoded.id) {
            return res.status(400).json({ message: "Invalid token" });
        }

        const invoices = await invoice
            .find({ owner: decoded.id })
            .sort({ createdAt: -1 })
            .populate('owner', 'firstName lastName email');

        res.status(200).json({
            message: "Invoices retrieved successfully",
            count: invoices.length,
            invoices: invoices.map(normalizeInvoice)
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch invoices",
            error: err.message
        });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const inv = await invoice.findById(req.params.id).populate('owner', 'firstName lastName email');
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (inv.owner._id.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - invoice does not belong to you" });
        }

        res.status(200).json({
            message: "Invoice retrieved successfully",
            invoice: normalizeInvoice(inv)
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch invoice", error: err.message });
    }
};

const updateInvoice = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const { clientName, dueDate, description, items, status } = req.body;

        if (clientName && clientName.trim() === "") {
            return res.status(400).json({ message: "Client name cannot be empty" });
        }

        const existingInvoice = await invoice.findById(req.params.id);
        if (!existingInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (existingInvoice.owner.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - invoice does not belong to you" });
        }

        if (existingInvoice.status === 'Paid' && status !== 'Paid') {
            return res.status(400).json({ message: "Cannot change status of a paid invoice" });
        }

        const updateData = {};
        if (clientName) updateData.clientName = clientName.trim();
        if (dueDate) updateData.dueDate = dueDate;
        if (description) updateData.description = description;
        if (status) updateData.status = status;

        if (Array.isArray(items) && items.length > 0) {
            let newAmount = 0;
            const formattedItems = [];

            for (let item of items) {
                if (!item.description || item.description.trim() === "") {
                    return res.status(400).json({ message: "Each item must have a description" });
                }

                const qty = Number(item.qty);
                const unitPrice = Number(item.unitPrice);

                if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0 || unitPrice <= 0) {
                    return res.status(400).json({ message: "Invalid item quantity or price" });
                }

                const total = qty * unitPrice;
                newAmount += total;
                formattedItems.push({
                    description: item.description.trim(),
                    qty,
                    unitPrice,
                    total
                });
            }

            updateData.amount = newAmount;
            updateData.items = formattedItems;
        }

        const updatedInvoice = await invoice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('owner', 'firstName lastName email');

        res.status(200).json({
            message: "Invoice updated successfully",
            invoice: normalizeInvoice(updatedInvoice)
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update invoice", error: err.message });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const inv = await invoice.findById(req.params.id);
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (inv.owner.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - invoice does not belong to you" });
        }

        if (inv.status === 'Paid') {
            return res.status(400).json({ message: "Cannot delete a paid invoice" });
        }

        const deletedInvoice = await invoice.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Invoice deleted successfully",
            invoice: deletedInvoice
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete invoice", error: err.message });
    }
};

const recordPayment = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const rawAmountPaid = req.body.amountPaid;
        const { paymentMethod, notes } = req.body;
        const markAsPaid = req.body.markAsPaid === true || req.body.status === 'Paid' || req.body.action === 'mark-paid';
        const invoiceId = req.params.id;

        const inv = await invoice.findById(invoiceId);
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const amountPaid = markAsPaid
            ? inv.amountDue
            : Number(rawAmountPaid);

        const resolvedPaymentMethod = paymentMethod && paymentMethod.trim() !== ""
            ? paymentMethod.trim()
            : markAsPaid
                ? "Manual Mark as Paid"
                : "";

        if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
            return res.status(400).json({ message: "Payment amount must be greater than 0" });
        }

        if (!resolvedPaymentMethod) {
            return res.status(400).json({ message: "Payment method is required" });
        }

        if (inv.owner.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - invoice does not belong to you" });
        }

        if (inv.status === 'Paid') {
            return res.status(400).json({ message: "Invoice is already fully paid" });
        }

        if (amountPaid > inv.amountDue) {
            return res.status(400).json({
                message: `Payment amount exceeds remaining due amount of ₦${inv.amountDue}`
            });
        }

        inv.paymentHistory.push({
            amountPaid,
            paymentMethod: resolvedPaymentMethod,
            notes: notes || ""
        });

        inv.amountPaid += amountPaid;
        inv.amountDue = inv.amount - inv.amountPaid;

        if (inv.amountDue <= 0) {
            inv.status = 'Paid';
        } else if (inv.status === 'Overdue' && inv.amountDue > 0) {
            inv.status = 'Overdue';
        } else {
            inv.status = 'Pending';
        }

        await inv.save();
        if (inv.status === "Paid") {
            try {

                await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: 'adegboyegaphilip6@gmail.com',
                    subject: `Payment Received - Invoice #${inv._id}`,
                    html: paymentReceivedEmail(
                        inv.clientName,
                        inv._id,
                        inv.amountPaid
                    )
                });

                console.log("Payment receipt sent.");

            } catch (err) {

                console.log("Payment receipt email error:", err.message);

            }
        }

        res.status(200).json({
            message: "Payment recorded successfully",
            invoice: normalizeInvoice(inv),
            paymentSummary: {
                amountPaid: inv.amountPaid,
                amountDue: inv.amountDue,
                status: inv.status
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to record payment", error: err.message });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        const inv = await invoice.findById(req.params.id);
        if (!inv) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (inv.owner.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - invoice does not belong to you" });
        }

        res.status(200).json({
            message: "Payment history retrieved successfully",
            invoiceId: inv._id,
            clientName: inv.clientName,
            totalAmount: inv.amount,
            amountPaid: inv.amountPaid,
            amountDue: inv.amountDue,
            status: inv.status || 'Pending',
            paymentHistory: inv.paymentHistory
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch payment history", error: err.message });
    }
};

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
            fs.mkdirSync(pdfsDir, { recursive: true });
        }

        const outputStream = fs.createWriteStream(filepath);
        doc.pipe(outputStream);

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

        outputStream.on('finish', () => {
            res.download(filepath, filename, (err) => {
                if (err) console.log(err);
                fs.unlink(filepath, (err) => {
                    if (err) console.log(err);
                });
            });
        });

        doc.end();
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