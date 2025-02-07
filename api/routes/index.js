const express = require("express");
const router = express.Router();

const catwayRoute = require("./catways");
const dashboardRoute = require("./dashboard");
const docRoute = require("./doc");
const Catway = require("../models/catway");
const authRoute = require("./authenticate");

// Routes de la page d'accueil / de connexion
router.get("/", async function (req, res, next) {
  const catways = await Catway.find();

  res.render("home", {
    title: "Accueil",
    message: "Bienvenue sur l'API du port de plaisance Russell !",
    catways,
  });
});

// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

router.use("/dashboard", dashboardRoute);
router.use("/documentation", docRoute);
router.use("/authenticate", authRoute);

module.exports = router;
