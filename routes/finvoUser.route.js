const express = require("express");
const router = express.Router();
// const { postSignup, getSignup, postSignin, getSignin, getDashboard } = require("../controllers/user.controllers");
const { postSignup, postSignin,  } = require("../controllers/finvoUser.controller");

router.post("/register", postSignup);
router.post("/login", postSignin);


module.exports = router;
