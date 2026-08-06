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
    downloadInvoicePDF,
    generateInvoiceReportPDF
} = require('../controllers/fimvoInvoice.controller');

router.post('/create', createInvoice);
router.get('/all', getInvoices);
router.get('/download', generateInvoiceReportPDF);
router.get('/pdf/:id', downloadInvoicePDF);

router.post('/:id/payment', recordPayment);
router.get('/:id/payments', getPaymentHistory);

router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router; 