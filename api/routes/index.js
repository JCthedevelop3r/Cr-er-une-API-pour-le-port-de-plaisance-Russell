const express = require("express");
const router = express.Router();

const catwayRoute = require("./catways");
const docRoute = require("./doc");

// Route de la page d'accueil / de connexion
router.get("/", function (req, res, next) {
  res.render("home", {
    title: "Accueil",
    message: "Bienvenue sur l'API du port de plaisance Russell !",
  });
});

router.get("/dashboard", (req, res) => {
  console.log("Route /dashboard appelée");
  res.render("dashboard", {
    title: "Tableau de bord",
  });
});

// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

router.use("/documentation", docRoute);

module.exports = router;
