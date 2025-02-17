const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Route pour l'authentification (connexion utilisateur)
router.post("/", authController.authenticateUser);

module.exports = router;
