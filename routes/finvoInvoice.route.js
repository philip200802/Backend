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

router.post('/create', createInvoice);
router.get('/all', getInvoices);
router.get('/download', generateInvoicePDF);

router.post('/:id/payment', recordPayment);
router.get('/:id/payments', getPaymentHistory);

router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router; 