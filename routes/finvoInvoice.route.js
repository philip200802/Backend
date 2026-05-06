const express = require('express');
const router = express.Router();
const { 
    createInvoice, 
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getPaymentHistory,
    generateInvoicePDF 
} = require('../controllers/fimvoInvoice.controller');   

// CRUD Routes
router.post('/create', createInvoice);
router.get('/all', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Payment Routes
router.post('/:id/payment', recordPayment);
router.get('/:id/payments', getPaymentHistory);

// PDF Route
router.get('/download', generateInvoicePDF);

module.exports = router;