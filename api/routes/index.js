const express = require("express");
const router = express.Router();

const catwayRoute = require("./catways");
const dashboardRoute = require("./dashboard");
const authRoute = require("./auth.js");
const docRoute = require("./doc");
const catwaysService = require("../services/catways.js")

// Route de la page d'accueil (ou page de connexion)
router.get("/", function (req, res) {
  const catways = catwaysService.getAllCatways();

  res.render("home", {
    title: "Accueil",
    message: "Bienvenue sur l'API du port de plaisance Russell !",
    catways,
    error: null,
  });
});

// Route pour les catways
// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

// Route pour le tableau de bord
router.use("/dashboard", dashboardRoute);

// Route pour la documentation
router.use("/documentation", docRoute);

// Route pour l'authentification
router.use("/authenticate", authRoute);


module.exports = router;
