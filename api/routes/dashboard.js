const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const Catway = require("../models/catway");
const Reservation = require("../models/reservation");

router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find(); // Récupère tous les catways
    const reservations = await Reservation.find();
    res.render("dashboard", {
      title: "Tableau de bord",
      catways,
      reservations,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catways :",
      error.message
    );
    res.status(500).send("Erreur serveur");
  }
});

// Route pour créer un utilisateur
router.post("/create-user", dashboardController.createUser);

// Route pour modifier un utilisateur
router.post("/update-user", dashboardController.updateUser);

// Route pour supprimer un utilisateur
router.post("/delete-user", dashboardController.deleteUser);

// Route pour créer un catway
router.post("/create-catway", dashboardController.createCatway);

// Route pour obtenir le prochain numéro d'un catway
router.get("/next-catway-number", dashboardController.getNextCatwayNumber);

// Route pour modifier la description de l'état d'un catway
router.post("/update-catway-state", dashboardController.updateCatwayState);

// Route pour supprimer un catway
router.post("/delete-catway", dashboardController.deleteCatway);

// Route pour afficher les détails d'un catway
router.get("/catway-details/:catwayNumber", dashboardController.catwayDetails);

// Route pour enregistrer une réservation
router.post("/save-reservation", dashboardController.saveReservation);

// Route pour supprimer une réservation
router.post("/delete-reservation", dashboardController.deleteReservation);

// Route pour afficher les détails d'une réservation
router.get(
  "/reservation-details/:reservationId",
  dashboardController.displayReservationDetails
);

module.exports = router;
