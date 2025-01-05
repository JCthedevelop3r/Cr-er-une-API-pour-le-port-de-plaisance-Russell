const express = require("express");
const router = express.Router();

const catwayRoute = require("../routes/catways");
const dashboardRoute = require("../routes/dashboard");
const docRoute = require("../routes/doc");

// Route de la page d'accueil / de connexion
router.get("/", function (req, res, next) {
  res.status(200).json({
    name: process.env.APP_NAME,
    version: "1.0",
    status: 200,
    message: "Bienvenue sur l'API PPR !",
  });
});

// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

router.use("/dashboard", dashboardRoute);
router.use("/documentation", docRoute);

module.exports = router;
