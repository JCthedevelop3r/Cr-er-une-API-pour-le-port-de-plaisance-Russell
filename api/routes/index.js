const express = require("express");
const router = express.Router();

const catwayRoute = require("../routes/catways");
const dashboardRoute = require("../routes/dashboard");
const docRoute = require("../routes/doc");

// Route de la page d'accueil / de connexion
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express avec EJS",
    message: "Bienvenue sur Express !",
  });
});

// Les routes pour les réservations se trouvent aussi dans "/catways"
router.use("/catways", catwayRoute);

router.use("/dashboard", dashboardRoute);
router.use("/documentation", docRoute);

module.exports = router;
