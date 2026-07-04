const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const userRoute = require("./routes/finvoUser.route");
const invoiceRoute = require("./routes/finvoInvoice.route");
const customerRoute = require("./routes/finvoCustomer.route");
const Invoice = require("./Models/finvoInvoice.model");
const port = process.env.PORT || 2008
const URI = process.env.MONGO_URI;
app.set("view engine", "ejs");
app.set("views", __dirname + "/Views");
app.use(cors({
    origin: [
        "https://finvo-app.netlify.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));

app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


if (!URI) {
    console.error("MONGO_URI is not set");
} else {
    mongoose.connect(URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
        .then(() => {
            console.log("Connected to MongoDB");
            return Invoice.updateMany(
                {
                    $or: [
                        { status: { $exists: false } },
                        { status: null },
                        { status: "" }
                    ]
                },
                { $set: { status: "Pending" } }
            );
        })
        .then((result) => {
            if (result?.modifiedCount) {
                console.log(`Backfilled invoice status for ${result.modifiedCount} document(s)`);
            }
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
}

app.get("/", (req, res) => {
    res.send("Welcome to the Finvo Backend API! It is running perfectly.");
});


app.use("/invoice", invoiceRoute);

app.use("/customer", customerRoute);

app.use("/user", userRoute);

// ✅ TEST EMAIL ENDPOINT - For debugging Resend
app.post("/test-email", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        console.log('🧪 [TEST-EMAIL] Starting test...');
        console.log('🧪 [TEST-EMAIL] API Key exists:', !!process.env.RESEND_API_KEY);

        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Test Email from Finvo",
            html: "<h1>Hello!</h1><p>This is a test email from Finvo backend.</p>"
        });

        console.log('🧪 [TEST-EMAIL] Response:', JSON.stringify(response));

        res.json({
            message: "Test email sent",
            response: response
        });
    } catch (err) {
        console.error('🧪 [TEST-EMAIL] Error:', err.message);
        res.status(500).json({
            message: "Test email failed",
            error: err.message
        });
    }
});







app.listen(port, () => {
    console.log("I am running on port", port);
});