const express = require("express");
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get("/code-generator", isAuthenticated, (req, res) => {
  res.render("ai/codeGenerator", { title: "Code Generator", subTitle: "Code Generator" });
});

router.get("/code-generator-new", isAuthenticated, (req, res) => {
  res.render("ai/codeGeneratorNew", { title: "code Generator New", subTitle: "code Generator New" });
});

router.get("/image-generator", isAuthenticated, (req, res) => {
  res.render("ai/imageGenerator", { title: "Image Generator", subTitle: "Image Generator" });
});

router.get("/text-generator", isAuthenticated, (req, res) => {
  res.render("ai/textGenerator", { title: "Text Generator", subTitle: "Text Generator" });
});

router.get("/text-generator-new", isAuthenticated, (req, res) => {
  res.render("ai/textGeneratorNew", { title: "Dashboard", subTitle: "SubTitle" });
});

router.get("/video-generator", isAuthenticated, (req, res) => {
  res.render("ai/videoGenerator", { title: "video generator", subTitle: "video generator" });
});

router.get("/voice-generator", isAuthenticated, (req, res) => {
  res.render("ai/voiceGenerator", { title: "Voice Generator", subTitle: "Voice Generator" });
});

module.exports = router;
