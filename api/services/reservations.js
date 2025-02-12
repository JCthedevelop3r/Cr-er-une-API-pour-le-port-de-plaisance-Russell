const Reservation = require("../models/reservation");

async function getReservationsByCatway(catwayNumber) {
  try {
    if (isNaN(catwayNumber)) {
      throw new Error("CatwayNumber invalide.");
    }

    const reservations = await Reservation.find({ catwayNumber });

    reservations.forEach((reservation) => {
      reservation.checkIn = new Date(reservation.checkIn);
      reservation.checkOut = new Date(reservation.checkOut);
    });

    return reservations;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des réservations.");
  }
}

async function findReservationByIdAndCatway(idReservation, catwayNumber) {
    try {
      return await Reservation.findOne({ _id: idReservation, catwayNumber });
    } catch (error) {
      throw new Error("Erreur serveur lors de la récupération de la réservation.");
    }
  }

module.exports = {
  getReservationsByCatway,
  findReservationByIdAndCatway,
};