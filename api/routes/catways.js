const express = require("express");
const router = express.Router();

const service = require("../services/catways");

// Routes pour les catways

// Route pour récupérer la liste des catways
router.get(
  "/",
  /*service.getCatwaysList,*/ (req, res) => {
    res.render("catways", {
      title: "Liste des catways",
      catways: res.locals.catways,
    });
  }
);
// Route pour récupérer les détails d'un catway en particulier
router.get(
  "/:id",
  /*service.getCatway,*/ (req, res) => {
    res.render("catway-details", {
      title: "Détails catway",
      catways: res.locals.catways,
    });
  }
);
// Route pour créer un catway
router.post("/catways" /*service.createCatway*/);
// Routes pour modifier la description de l'état d'un catway en particulier
router.put("/catways/:id" /*service.putUpdateCatway*/);
router.patch("/catways/:id" /*service.patchUpdateCatway*/);
// Route pour supprimer un catway
router.delete("/catways/:id" /*service.deleteCatway*/);

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
router.post("/catways/:id/reservations" /*service.createReservation*/);
// Route pour supprimer une réservation
router.delete(
  "/catways/:id/reservations/:idReservation"
  /*service.deleteReservation*/
);

module.exports = router;
