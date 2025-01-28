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

module.exports = router;
