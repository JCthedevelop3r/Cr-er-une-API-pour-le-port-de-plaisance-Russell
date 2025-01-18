const express = require("express");
const router = express.Router();

const service = require("../services/catways");

// Routes pour les catways

// Route pour récupérer la liste des catways
router.get("/catways" /*service.getCatwaysList*/);
// Route pour récupérer les détails d'un catway en particulier
router.get("/catways/:id" /*service.getCatway*/);
// Route pour créer un catway
router.post("/catways" /*service.createCatway*/);
// Routes pour modifier la description de l'état d'un catway en particulier
router.put("/catways/:id" /*service.putUpdateCatway*/);
router.patch("/catways/:id" /*service.patchUpdateCatway*/);
// Route pour supprimer un catway
router.delete("/catways/:id" /*service.deleteCatway*/);

// Routes pour les réservations

// Route pour récupérer la liste des réservations
router.get("/catways/:id/reservations" /*service.getReservationsList*/);
// Route pour afficher les détails d'une réservation en particulier
router.get(
  "/catways/:id/reservations/:idReservation" /*service.getReservation*/
);
// Route pour créer une réservation
router.post("/catways/:id/reservations" /*service.createReservation*/);
// Route pour supprimer une réservation
router.delete(
  "/catways/:id/reservations/:idReservation"
  /*service.deleteReservation*/
);

module.exports = router;
