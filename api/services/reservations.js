const Reservation = require("../models/reservation");

/**
 * Récupère toutes les réservations d'un catway spécifique.
 *
 * @param {number} catwayNumber - Le numéro du catway pour lequel récupérer les réservations.
 * @returns {Promise<Array>} Une liste des réservations pour le catway spécifié.
 * @throws {Error} Si le numéro de catway est invalide ou si une erreur survient lors de la récupération des réservations.
 */
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

/**
 * Recherche une réservation par son ID et le numéro de catway.
 *
 * @param {string} idReservation - L'ID de la réservation à rechercher.
 * @param {number} catwayNumber - Le numéro du catway de la réservation à rechercher.
 * @returns {Promise<Object|null>} La réservation correspondante ou `null` si non trouvée.
 * @throws {Error} En cas d'erreur serveur lors de la récupération de la réservation.
 */
async function findReservationByIdAndCatway(idReservation, catwayNumber) {
    try {
      return await Reservation.findOne({ _id: idReservation, catwayNumber });
    } catch (error) {
      throw new Error("Erreur serveur lors de la récupération de la réservation.");
    }
  }

/**
* Récupère toutes les réservations.
*
* @returns {Promise<Array>} Une liste de toutes les réservations.
* @throws {Error} En cas d'erreur lors de la récupération des réservations.
*/
async function getAllReservations() {
  try {
    return await Reservation.find();
  } catch (error) {
    throw new Error("Erreur lors de la récupération des réservations." + error.message);
  }
}
  

module.exports = {
  getReservationsByCatway,
  findReservationByIdAndCatway,
  getAllReservations,
};