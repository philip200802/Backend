const Customer = require('../Models/finvoCustomer.model');
const jwt = require('jsonwebtoken');

const JWT_Secret = process.env.JWT_SECRET || process.env.jwt_secret;

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
    try {
        // ================= AUTH =================
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

        // ================= VALIDATION =================
        const { name, email, phone, company, address, notes } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Customer name is required" });
        }

        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Customer email is required" });
        }

        // Check if customer with same email already exists for this user
        const existingCustomer = await Customer.findOne({ owner, email: email.toLowerCase() });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with this email already exists" });
        }

        // ================= CREATE CUSTOMER =================
        const newCustomer = await Customer.create({
            owner,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : "",
            company: company ? company.trim() : "",
            address: address || {},
            notes: notes || ""
        });

        res.status(201).json({
            message: "Customer created successfully",
            customer: newCustomer
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to create customer",
            error: err.message
        });
    }
};

// GET ALL CUSTOMERS FOR USER
const getCustomers = async (req, res) => {
    try {
        // ================= AUTH =================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        if (!decoded.id) {
            return res.status(400).json({ message: "Invalid token" });
        }

        // ================= GET CUSTOMERS =================
        const customers = await Customer.find({ owner: decoded.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Customers retrieved successfully",
            count: customers.length,
            customers
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch customers",
            error: err.message
        });
    }
};

// GET SINGLE CUSTOMER
const getCustomerById = async (req, res) => {
    try {
        // ================= AUTH =================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);

        // ================= GET CUSTOMER =================
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Verify ownership
        if (customer.owner.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized - customer does not belong to you" });
        }

        res.status(200).json({
            message: "Customer retrieved successfully",
            customer
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch customer", error: err.message });
    }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
    try {
        // ================= AUTH =================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);
        const customerId = req.params.id;

        // ================= DEBUG: Log incoming data =================
        console.log('[UPDATE_CUSTOMER] Attempting to update customer:', customerId);
        console.log('[UPDATE_CUSTOMER] Received body:', JSON.stringify(req.body));
        console.log('[UPDATE_CUSTOMER] User ID:', decoded.id);

        // ================= VALIDATION =================
        const { name, email, phone, company, address, notes } = req.body;

        if (name && name.trim() === "") {
            return res.status(400).json({ message: "Customer name cannot be empty" });
        }

        if (email && email.trim() === "") {
            return res.status(400).json({ message: "Customer email cannot be empty" });
        }

        // ================= GET EXISTING CUSTOMER =================
        const existingCustomer = await Customer.findById(customerId);
        if (!existingCustomer) {
            console.log('[UPDATE_CUSTOMER] ERROR: Customer not found with ID:', customerId);
            return res.status(404).json({ message: "Customer not found" });
        }

        // Verify ownership
        if (existingCustomer.owner.toString() !== decoded.id) {
            console.log('[UPDATE_CUSTOMER] ERROR: Ownership check failed. Owner:', existingCustomer.owner, 'User:', decoded.id);
            return res.status(403).json({ message: "Unauthorized - customer does not belong to you" });
        }

        // Check if new email already exists for this user (if email is being changed)
        if (email && email.toLowerCase() !== existingCustomer.email) {
            const duplicateEmail = await Customer.findOne({
                owner: decoded.id,
                email: email.toLowerCase(),
                _id: { $ne: customerId }
            });
            if (duplicateEmail) {
                return res.status(400).json({ message: "Customer with this email already exists" });
            }
        }

        // ================= UPDATE DATA =================
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (phone) updateData.phone = phone.trim();
        if (company) updateData.company = company.trim();
        if (address) updateData.address = address;
        if (notes) updateData.notes = notes;

        console.log('[UPDATE_CUSTOMER] Update data to apply:', JSON.stringify(updateData));

        if (Object.keys(updateData).length === 0) {
            console.log('[UPDATE_CUSTOMER] WARNING: No fields to update!');
            return res.status(400).json({ message: "No fields to update" });
        }

        // ================= UPDATE CUSTOMER =================
        console.log('[UPDATE_CUSTOMER] Executing findByIdAndUpdate...');
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        console.log('[UPDATE_CUSTOMER] Update successful! New data:', JSON.stringify(updatedCustomer));

        res.status(200).json({
            message: "Customer updated successfully",
            customer: updatedCustomer
        });
    } catch (err) {
        console.error('[UPDATE_CUSTOMER] ERROR:', err.message);
        console.error('[UPDATE_CUSTOMER] Stack:', err.stack);
        res.status(500).json({ message: "Failed to update customer", error: err.message });
    }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
    try {
        // ================= AUTH =================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_Secret);
        const customerId = req.params.id;

        // ================= DEBUG: Log delete attempt =================
        console.log('[DELETE_CUSTOMER] Attempting to delete customer:', customerId);
        console.log('[DELETE_CUSTOMER] User ID:', decoded.id);

        // ================= GET CUSTOMER =================
        const customer = await Customer.findById(customerId);
        if (!customer) {
            console.log('[DELETE_CUSTOMER] ERROR: Customer not found with ID:', customerId);
            return res.status(404).json({ message: "Customer not found" });
        }

        console.log('[DELETE_CUSTOMER] Found customer:', customer.name, 'Owner:', customer.owner);

        // Verify ownership
        if (customer.owner.toString() !== decoded.id) {
            console.log('[DELETE_CUSTOMER] ERROR: Ownership check failed. Owner:', customer.owner, 'User:', decoded.id);
            return res.status(403).json({ message: "Unauthorized - customer does not belong to you" });
        }

        // ================= DELETE =================
        console.log('[DELETE_CUSTOMER] Executing findByIdAndDelete...');
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);

        if (deletedCustomer) {
            console.log('[DELETE_CUSTOMER] Delete successful! Deleted customer:', deletedCustomer.name);
        } else {
            console.log('[DELETE_CUSTOMER] WARNING: Delete returned null');
        }

        res.status(200).json({
            message: "Customer deleted successfully",
            customer: deletedCustomer
        });
    } catch (err) {
        console.error('[DELETE_CUSTOMER] ERROR:', err.message);
        console.error('[DELETE_CUSTOMER] Stack:', err.stack);
        res.status(500).json({ message: "Failed to delete customer", error: err.message });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};