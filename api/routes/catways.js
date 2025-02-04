const express = require("express");
const router = express.Router();

const catwaysControllers = require("../controllers/catways");
const reservationsControllers = require("../controllers/reservations");

// Routes pour les catways

// Route pour récupérer la liste des catways
router.get("/", catwaysControllers.getCatwaysList);

// Route pour récupérer les détails d'un catway en particulier
router.get("/:id", catwaysControllers.getCatwayDetails);

// Routes pour les réservations

// Route pour récupérer la liste des réservations d'un catway
router.get(
  "/:catwayNumber/reservations",
  reservationsControllers.getReservations
);

// Route pour afficher les détails d'une réservation en particulier
router.get(
  "/:catwayNumber/reservations/:idReservation",
  reservationsControllers.getReservationDetails
);

// Route pour créer une réservation
router.post("/:id/reservations" /*service.createReservation*/);
// Route pour supprimer une réservation
router.delete(
  "/:id/reservations/:idReservation"
  /*service.deleteReservation*/
);

module.exports = router;
