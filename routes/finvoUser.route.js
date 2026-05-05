const express = require("express");
const router = express.Router();
const { postSignup, postSignin, getDashboard } = require("../controllers/finvoUser.controller");

router.post("/register", postSignup);
router.post("/login", postSignin);
router.get("/dashboard", getDashboard);
router.get("/signup", (req, res) => {
    res.render("signup");
});
router.get("/signin", (req, res) => {
    res.render("signin");
});

module.exports = router;