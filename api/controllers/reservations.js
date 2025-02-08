const Reservation = require("../models/reservation");
const Catway = require("../models/catway");
const reservationService = require("../services/reservations");


async function getReservations(req, res) {
  try {
    const catwayNumber = req.params.catwayNumber;
    console.log("catwayNumber reçu :", catwayNumber);

    const reservations = await reservationService.getReservationsByCatway(catwayNumber);
    console.log("Réservations récupérées :", reservations);

    const catways = await Catway.find();

    res.render("reservations", { catwayNumber, reservations, catways });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res.status(500).send("Erreur serveur lors de la récupération des réservations.");
  }
}

async function getReservationDetails(req, res) {
  try {
    const { catwayNumber, idReservation } = req.params;

    // Utilisation du service pour récupérer la réservation
    const reservation = await reservationService.findReservationByIdAndCatway(idReservation, catwayNumber);

    if (!reservation) {
      return res.status(404).send("Réservation non trouvée.");
    }

    // Rendre la vue avec les détails de la réservation
    res.render("reservation-details", { reservation });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = {
  getReservations,
  getReservationDetails,
};
