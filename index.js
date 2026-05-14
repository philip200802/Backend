process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 2008;
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const userRoute = require("./routes/finvoUser.route");
const invoiceRoute = require("./routes/finvoInvoice.route");const port = process.env.PORT || 2008
const URI = process.env.MONGO_URI;
app.set("view engine", "ejs");
app.set("views", __dirname + "/Views");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


mongoose.connect(URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.get("/", (req, res) => {
    res.send("Welcome to the Finvo Backend API! It is running perfectly.");
});


app.use("/invoice", invoiceRoute);

app.use("/user", userRoute);







app.listen(PORT, () => {
  console.log("I am running on port", PORT);
});