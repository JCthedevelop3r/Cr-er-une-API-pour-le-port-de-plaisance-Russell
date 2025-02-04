const Reservation = require("../models/reservation");
const Catway = require("../models/catway");

async function getReservations(req, res) {
  try {
    const catwayNumber = req.params.catwayNumber;
    console.log("catwayNumber reçu :", req.params.catwayNumber);

    if (isNaN(catwayNumber)) {
      return res.status(400).send("CatwayNumber invalide");
    }

    // Récupération des réservations associées à ce catway
    const reservations = await Reservation.find({ catwayNumber });
    console.log("Réservations récupérées :", reservations);

    reservations.forEach((reservation) => {
      reservation.checkIn = new Date(reservation.checkIn);
      reservation.checkOut = new Date(reservation.checkOut);
    });

    const catways = await Catway.find();

    res.render("reservations", { catwayNumber, reservations, catways });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res
      .status(500)
      .send("Erreur serveur lors de la récupération des réservations.");
  }
}

async function getCatwaysWithReservations(req, res, next) {
  try {
    // Récupérer les catwayNumbers uniques des réservations
    const reservations = await Reservation.find({}, "catwayNumber"); // Sélectionne uniquement catwayNumber
    const reservedCatwayNumbers = [
      ...new Set(reservations.map((res) => res.catwayNumber)),
    ]; // Supprime les doublons

    // Récupérer les catways correspondant aux catwayNumbers trouvés
    const catwaysWithReservations = await Catway.find({
      catwayNumber: { $in: reservedCatwayNumbers },
    });

    // Ajouter les catways à `res.locals` pour qu'ils soient accessibles dans toutes les vues
    res.locals.catwaysWithReservations = catwaysWithReservations;

    next(); // Passer à la suite (middleware suivant ou rendu de la page)
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catways avec réservations :",
      error
    );
    next(error);
  }
}

async function getReservationDetails(req, res) {
  try {
    const { catwayNumber, idReservation } = req.params;

    // Rechercher la réservation par ID et vérifier qu'elle correspond au catwayNumber
    const reservation = await Reservation.findOne({
      _id: idReservation,
      catwayNumber: catwayNumber,
    });

    if (!reservation) {
      return res.status(404).send("Réservation non trouvée.");
    }

    // Rendre la vue avec les données de la réservation
    res.render("reservation-details", { reservation });
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation :", error);
    res.status(500).send("Erreur serveur.");
  }
}

module.exports = {
  getReservations,
  getCatwaysWithReservations,
  getReservationDetails,
};
