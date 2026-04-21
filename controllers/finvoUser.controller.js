const Finvo = require("../Models/finvoUser.model");
const bcrypt = require("bcrypt");

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