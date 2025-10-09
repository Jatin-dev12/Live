const express = require("express");
const router = express.Router();

router.get("/forgot-password", (req, res) => {
  res.render("authentication/forgotPassword", { title: "Forgot Password", subTitle: "Reset Password", layout: "../views/layout/layout2" });
});

router.get("/signin", (req, res) => {
  res.render("authentication/signin", { title: "Sign In", subTitle: "Login", layout: "../views/layout/layout2" });
});

router.get("/sign-in", (req, res) => {
  res.render("authentication/signin", { title: "Sign In", subTitle: "Login", layout: "../views/layout/layout2" });
});

router.get("/signup", (req, res) => {
  res.render("authentication/signup", { title: "Sign Up", subTitle: "Register", layout: "../views/layout/layout2" });
});

router.get("/sign-up", (req, res) => {
  res.render("authentication/signup", { title: "Sign Up", subTitle: "Register", layout: "../views/layout/layout2" });
});

module.exports = router;
