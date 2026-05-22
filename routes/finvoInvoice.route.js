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

// Specific routes FIRST
router.post('/create', createInvoice);
router.get('/all', getInvoices);
router.get('/download', generateInvoicePDF);

// Payment Routes (before parameterized /:id)
router.post('/:id/payment', recordPayment);
router.get('/:id/payments', getPaymentHistory);

// Parameterized Routes LAST
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router; 