const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require('../controllers/finvoCustomer.controller');

router.post('/create', createCustomer);

router.get('/all', getCustomers);

router.get('/:id', getCustomerById);

router.put('/:id', updateCustomer);

router.delete('/:id', deleteCustomer);

module.exports = router;
