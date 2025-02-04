const Reservation = require("../models/reservation");

async function getReservations(req, res) {
  try {
    const catwayNumber = parseInt(req.params.catwayNumber, 10);
    console.log("catwayNumber reçu :", req.params.catwayNumber);

    if (isNaN(catwayNumber)) {
      return res.status(400).send("CatwayNumber invalide");
    }

    // Récupération des réservations associées à ce catway
    const reservations = await Reservation.find({ catwayNumber });

    res.render("reservations", { catwayNumber, reservations });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res
      .status(500)
      .send("Erreur serveur lors de la récupération des réservations.");
  }
}

module.exports = {
  getReservations,
};
