const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");

router.get("/", (req, res) => {
  res.render("dashboard", {
    title: "Tableau de bord",
  });
});

// Route pour créer un utilisateur
router.post("/create-user", dashboardController.createUser);

// Route pour modifier un utilisateur
router.post("/update-user", dashboardController.updateUser);

// Route pour supprimer un utilisateur
router.post("/delete-user", dashboardController.deleteUser);

// Route pour créer un catway
router.post("/create-catway", dashboardController.createCatway);

// Route pour obtenir le prochain numéro de catway
router.get("/next-catway-number", dashboardController.getNextCatwayNumber);

// Route pour modifier la description de l'état d'un catway
router.post("/update-catway-state", dashboardController.updateCatwayState);

// Route pour supprimer un catway
router.post("/delete-catway", dashboardController.deleteCatway);

module.exports = router;
