const express = require('express')
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require("./routes/finvoUser.route");
const invoiceRoute = require("./routes/finvoInvoice.route");

dotenv.config();
const port = process.env.PORT||2008
const URI = process.env.MONGO_URI; // make this match the .env file
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}))


mongoose.connect(URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});


app.use("/invoice", invoiceRoute);

app.use("/user", userRoute);






app.listen(port, ()=> {
    console.log(`I am runnng on port ${port}`)
    
})