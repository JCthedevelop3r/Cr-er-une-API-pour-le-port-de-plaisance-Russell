const Reservation = require("../models/reservation");
const Catway = require("../models/catway");

async function getCatwaysWithReservations(req, res, next) {
  try {
    // Récupérer les numéros de catways ayant des réservations
    const reservations = await Reservation.find({}, "catwayNumber");
    const reservedCatwayNumbers = [
      ...new Set(reservations.map((res) => res.catwayNumber)),
    ]; // Supprime les doublons

    // Récupérer les catways correspondants
    const catwaysWithReservations = await Catway.find({
      catwayNumber: { $in: reservedCatwayNumbers },
    });

    // Stocker dans res.locals pour qu'il soit accessible dans les templates
    res.locals.catwaysWithReservations = catwaysWithReservations;

    next(); // Passer au middleware suivant
  } catch (error) {
    console.error("Erreur lors de la récupération des catways avec réservations :", error);
    next(error);
  };
};

module.exports = {getCatwaysWithReservations};
