const express = require("express");
const router = express.Router();

const catwaysControllers = require("../controllers/catways");
const reservationsControllers = require("../controllers/reservations");
const private = require("../middlewares/private");


// Routes pour les catways

// Route pour récupérer la liste des catways
router.get("/", private.authenticateToken, catwaysControllers.getCatwaysList);

// Route pour récupérer les détails d'un catway en particulier
router.get("/:id", catwaysControllers.getCatwayDetails);

// Routes pour les réservations

// Route pour récupérer la liste des réservations d'un catway
router.get(
  "/:catwayNumber/reservations", 
  private.authenticateToken,
  reservationsControllers.getReservations
);

// Route pour afficher les détails d'une réservation en particulier
router.get(
  "/:catwayNumber/reservations/:idReservation",
  reservationsControllers.getReservationDetails
);

module.exports = router;
