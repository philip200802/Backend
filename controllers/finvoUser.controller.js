const Finvo = require("../Models/finvoUser.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const getSignup = (req, res) => {
  res.send("Signup page");
};

const postSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Finvo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created", userId: user._id });
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.Email_user,
        pass: process.env.Email_passkey
      }
    });

    let mailOptions = {
      from: process.env.Email_user,
      to: email,   
      html: `<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; line-height: 1.6; }
        .button { 
            display: inline-block; 
            padding: 10px 20px; 
            margin-top: 20px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our App!</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Thanks for signing up! We’re excited to have you on board. You can now log in and start exploring your dashboard.</p>
            <a href="https://yourapp.com/login" class="button">Log In to Your Account</a>
            <p>If you have any questions, just reply to this email.</p>
            <p>Cheers,<br>The Team</p>
        </div>
    </div>
</body>
</html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
}; 
const getSignin = (req, res) => {
  res.send("Signin page");
};

const postSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Finvo.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const getDashboard = (req, res) => {
  res.send("Dashboard");
};

module.exports = {
  postSignup,
  postSignin,
  getDashboard,
};