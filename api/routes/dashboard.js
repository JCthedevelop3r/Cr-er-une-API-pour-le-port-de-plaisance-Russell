const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    title: "Tableau de bord", // Titre de la page
    description: "Bienvenue dans le tableau de bord !",
  });
});

module.exports = router;
