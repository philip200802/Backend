const Finvo = require("../Models/finvoUser.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const JWT_Secret = process.env.JWT_SECRET || process.env.jwt_secret;

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, JWT_Secret, { expiresIn: "1h" });



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

    const transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.Email_user,
    pass: process.env.Email_passkey,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
    });

    const mailOptions = {
      from: process.env.Email_user,
  to: email,
  cc: process.env.Email_user, 
  subject: "Welcome to Finvo 🎉",  html: `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
      
      <!-- Header -->
      <div style="background:#1e88e5;color:#ffffff;text-align:center;padding:35px 20px;">
        <h1 style="margin:0;font-size:26px;">Welcome to Finvo 🎉</h1>
        <p style="margin-top:8px;font-size:14px;opacity:0.9;">Smart Invoice Management</p>
      </div>

      <!-- Content -->
      <div style="padding:35px;color:#333;line-height:1.6;">
        
        <p style="font-size:16px;">Hello <strong>${firstName}</strong>,</p>

        <p>
          We’re excited to have you on board! Your <strong>Finvo</strong> account has been successfully created.
        </p>

        <p>
          You can now create invoices, manage clients, and track payments — all in one place.
        </p>

        <!-- CTA -->
        <div style="text-align:center;margin:30px 0;">
          <a href="https://yourfrontendlink.com/login"
             style="background:#1e88e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
            Login to Your Account
          </a>
        </div>

        <!-- Features -->
        <div style="background:#f8f9fb;padding:20px;border-radius:8px;margin-top:20px;">
          <p style="margin-top:0;font-weight:bold;">What you can do with Finvo:</p>
          <ul style="padding-left:18px;margin:10px 0;">
            <li>Create and send professional invoices</li>
            <li>Track payment status in real time</li>
            <li>Manage your clients easily</li>
            <li>Monitor your business finances</li>
          </ul>
        </div>

        <p style="margin-top:25px;">
          If you need any help, simply reply to this email — we’re always here for you.
        </p>

        <p>
          Cheers,<br/>
          <strong>The Finvo Team</strong>
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:20px;font-size:12px;color:#888;background:#fafafa;">
        <p style="margin:5px 0;">© 2026 Finvo. All rights reserved.</p>
        <p style="margin:5px 0;">You’re receiving this email because you signed up for Finvo.</p>
      </div>

    </div>

  </div>
  `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (emailError) {
      console.log("Email error:", emailError);
    }

    const token = createToken(user);

    return res.status(201).json({
      message: "User created",
      userId: user._id,
      token,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
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

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_Secret);
    const user = await Finvo.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Dashboard accessed", user: { email: user.email, firstName: user.firstName } });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  postSignup,
  postSignin,
  getDashboard,
};