const express = require("express");
const router = express.Router();

const catwaysControllers = require("../controllers/catways");
const service = require("../services/catways");

// Routes pour les catways

// Route pour récupérer la liste des catways
router.get("/", catwaysControllers.getCatwaysList);

// Route pour récupérer les détails d'un catway en particulier
router.get("/:id", catwaysControllers.getCatwayDetails);

// Route pour créer un catway
router.post("/" /*service.createCatway*/);
// Routes pour modifier la description de l'état d'un catway en particulier
router.put("/:id" /*service.putUpdateCatway*/);
router.patch("/:id" /*service.patchUpdateCatway*/);
// Route pour supprimer un catway
router.delete("/:id" /*service.deleteCatway*/);

// Routes pour les réservations

// Route pour récupérer la liste des réservations d'un catway
router.get(
  "/:id/reservations",
  /*service.getReservationsList,*/ (req, res) => {
    res.render("reservations", {
      title: "Liste des réservations",
      catways: res.locals.reservations,
    });
  }
);
// Route pour afficher les détails d'une réservation en particulier
router.get(
  "/:id/reservations/:idReservation",
  /*service.getReservation,*/ (req, res) => {
    res.render("reservation-details", {
      title: "Réservations details",
      catways: res.locals.reservations,
    });
  }
);
// Route pour créer une réservation
router.post("/:id/reservations" /*service.createReservation*/);
// Route pour supprimer une réservation
router.delete(
  "/:id/reservations/:idReservation"
  /*service.deleteReservation*/
);

module.exports = router;
