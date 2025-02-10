const express = require("express");
const router = express.Router();

const authService = require("../services/auth");

router.post("/", (req, res) => {
  console.log("🔹 Route /authenticate appelée !");
  authService.authenticate(req, res);
});

module.exports = router;