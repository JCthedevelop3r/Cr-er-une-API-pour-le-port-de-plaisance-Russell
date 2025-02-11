const express = require("express");
const router = express.Router();

const catwayRoute = require("./catways");
const dashboardRoute = require("./dashboard");
const authRoute = require("./auth.js");
const docRoute = require("./doc");
const catwaysService = require("../services/catways.js")

// Routes de la page d'accueil / de connexion
router.get("/", function (req, res) {
  const catways = catwaysService.getAllCatways();

  res.render("home", {
    title: "Accueil",
    message: "Bienvenue sur l'API du port de plaisance Russell !",
    catways,
    error: null,
  });
});

// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

router.use("/dashboard", dashboardRoute);
router.use("/documentation", docRoute);
router.use("/authenticate", authRoute);


module.exports = router;
