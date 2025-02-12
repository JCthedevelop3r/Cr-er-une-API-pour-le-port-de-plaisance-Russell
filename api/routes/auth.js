const express = require("express");
const router = express.Router();
const authService = require("../services/auth");

router.post("/", async (req, res) => {
  try {
    await authService.authenticate(req, res);
  } catch (error) {
    // Gérer les erreurs ici
    console.error("Erreur d'authentification :", error.message);
    res.render("home", {
      title: "Accueil",
      message: "Bienvenue sur l'API du port de plaisance Russell !",
      error: error.message  // Passer le message d'erreur à votre template
    });
  }
});

module.exports = router;
