const Reservation = require("../models/reservation");
const Catway = require("../models/catway");

/**
 * Middleware pour récupérer tous les catways ayant des réservations.
 * Cette fonction récupère les numéros de catways réservés, puis les
 * informations associées à ces catways, et les rend accessibles dans
 * le header via `res.locals`.
 * 
 * @param {Object} req - La requête HTTP.
 * @param {Object} res - La réponse HTTP.
 * @param {Function} next - La fonction à appeler pour passer au middleware suivant.
 */
async function getCatwaysWithReservations(req, res, next) {
  try {
    // Étape 1 : Récupérer les numéros de catways ayant des réservations
    const reservations = await Reservation.find({}, "catwayNumber"); // Récupère tous les numéros de catways des réservations
    const reservedCatwayNumbers = [
      ...new Set(reservations.map((res) => res.catwayNumber)), // Supprimer les doublons en utilisant un Set
    ];

    // Étape 2 : Récupérer les catways associés aux numéros récupérés
    const catwaysWithReservations = await Catway.find({
      catwayNumber: { $in: reservedCatwayNumbers }, // Recherche des catways dont les numéros sont dans la liste des réservés
    });

    // Étape 3 : Stocker les catways dans `res.locals` pour les rendre accessibles dans le header
    res.locals.catwaysWithReservations = catwaysWithReservations;

    // Passer au middleware suivant
    next();
  } catch (error) {
    // En cas d'erreur, afficher un message et passer l'erreur au middleware suivant
    console.error("Erreur lors de la récupération des catways avec réservations :", error);
    next(error);
  }
};

// Exporter le middleware pour l'utiliser dans app.js
module.exports = { getCatwaysWithReservations };
