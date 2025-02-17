const Catway = require("../models/catway");
const reservationService = require("../services/reservations");

/**
 * Récupère les réservations pour un catway spécifique et rend la vue des réservations.
 *
 * @param {Object} req - L'objet de la requête HTTP, incluant le numéro du catway dans les paramètres.
 * @param {Object} res - L'objet de la réponse HTTP, utilisé pour rendre la vue.
 * @returns {Promise<void>} - Rend la vue avec la liste des réservations pour un catway donné.
 * @throws {Error} En cas d'erreur lors de la récupération des réservations ou des catways.
 */
async function getReservations(req, res) {
  try {
    const catwayNumber = req.params.catwayNumber;

    const reservations = await reservationService.getReservationsByCatway(catwayNumber);

    const catways = await Catway.find();

    res.render("reservations", { catwayNumber, reservations, catways });
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la récupération des réservations.");
  }
}

/**
 * Récupère les détails d'une réservation spécifique pour un catway donné et les rend dans la vue.
 *
 * @param {Object} req - L'objet de la requête HTTP, incluant l'ID de la réservation et le numéro du catway.
 * @param {Object} res - L'objet de la réponse HTTP, utilisé pour rendre la vue.
 * @returns {Promise<void>} - Rend la vue avec les détails d'une réservation.
 * @throws {Error} En cas d'erreur lors de la récupération de la réservation ou de ses détails.
 */
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

/**
 * Récupère toutes les réservations et les rend dans la vue des réservations.
 *
 * @param {Object} req - L'objet de la requête HTTP.
 * @param {Object} res - L'objet de la réponse HTTP, utilisé pour rendre la vue.
 * @returns {Promise<void>} - Rend la vue avec toutes les réservations.
 * @throws {Error} En cas d'erreur lors de la récupération des réservations.
 */
async function getAllReservations(req, res) {
  try {
    const reservations = await reservationService.getAllReservations();
    res.render("allReservations", { reservations });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res.status(500).send("Erreur serveur lors de la récupération des réservations.");
  }
}

module.exports = {
  getReservations,
  getReservationDetails,
  getAllReservations,
};
