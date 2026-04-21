const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices } = require('../controllers/fimvoInvoice.controller');   

router.post('/create', createInvoice);
router.get('/all', getInvoices);

module.exports = router;