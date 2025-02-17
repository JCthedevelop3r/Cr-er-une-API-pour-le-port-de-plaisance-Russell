const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Route POST pour l'authentification
router.post("/", authController.authenticateUser);

module.exports = router;
