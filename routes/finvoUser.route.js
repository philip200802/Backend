const express = require("express");
const router = express.Router();
// const { postSignup, getSignup, postSignin, getSignin, getDashboard } = require("../controllers/user.controllers");
const { postSignup, postSignin,  } = require("../controllers/finvoUser.controller");

router.post("/register", postSignup);
router.post("/login", postSignin);
router.get("/dashboard", (req, res) => {
    res.send("Welcome to the dashboard!");
});
router.get("/signup", (req, res) => {   
    res.send("Signup page");
})
router.get("/signin", (req, res) => {
    res.send("Signin page");
});
module.exports = router;
