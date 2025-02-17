const Catway = require("../models/catway");
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");

/**
 * Récupère le prochain numéro de catway disponible.
 *
 * @returns {Promise<number>} Le prochain numéro de catway (dernier numéro + 1) ou 1 s'il n'y a aucun catway enregistré.
 * @throws {Error} En cas d'erreur lors de la récupération des catways.
 */
async function getNextCatwayNumber() {
    const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
    return lastCatway ? lastCatway.catwayNumber + 1 : 1;
}

/**
 * Crée un nouveau catway avec un numéro de catway unique, un type et un état.
 *
 * @param {string} type - Le type du catway.
 * @param {string} catwayState - L'état du catway (ex : "Bon état").
 * @returns {Promise<Object>} Le catway nouvellement créé.
 */
async function createCatway(type, catwayState) {
    const nextCatwayNumber = await getNextCatwayNumber();

    const newCatway = new Catway({
      catwayNumber: nextCatwayNumber,
      type,
      catwayState,
    });

    await newCatway.save();

    return newCatway;
}

/**
 * Met à jour l'état d'un catway existant.
 *
 * @param {string} catwayId - L'ID du catway à mettre à jour.
 * @param {string} catwayState - Le nouvel état du catway.
 * @returns {Promise<Object>} Le catway mis à jour.
 * @throws {Error} Si l'ID est invalide ou si le catway n'est pas trouvé.
 */
async function updateCatwayState(catwayId, catwayState) {
    if (!mongoose.isValidObjectId(catwayId)) {
        throw new Error("L'ID du catway fourni est invalide.");
    }

    const updatedCatway = await Catway.findOneAndUpdate(
      { _id: catwayId },
      { catwayState: catwayState },
      { new: true }
    );

    if (!updatedCatway) {
      throw new Error("Catway non trouvé.");
    }

    return updatedCatway;
}

/**
 * Supprime un catway par son numéro.
 *
 * @param {number} catwayNumber - Le numéro du catway à supprimer.
 * @returns {Promise<Object>} Le catway supprimé.
 * @throws {Error} Si le catway n'est pas trouvé.
 */
async function deleteCatway(catwayNumber) {
    const deletedCatway = await Catway.findOneAndDelete({ catwayNumber });

    if (!deletedCatway) {
      throw new Error("Catway non trouvé.");
    }

    return deletedCatway;
}

/**
 * Récupère les détails d'un catway par son numéro.
 *
 * @param {number} catwayNumber - Le numéro du catway dont on souhaite obtenir les détails.
 * @returns {Promise<Object>} Les détails du catway (type et état).
 * @throws {Error} Si le catway n'est pas trouvé.
 */
async function getCatwayDetails(catwayNumber) {
    const catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      throw new Error("Catway non trouvé.");
    }

    return {
      type: catway.type,
      catwayState: catway.catwayState,
    };
}

/**
 * Crée une nouvelle réservation pour un catway donné.
 *
 * @param {number} catwayNumber - Le numéro du catway réservé.
 * @param {string} clientName - Le nom du client.
 * @param {string} boatName - Le nom du bateau.
 * @param {Date} checkIn - La date d'entrée de la réservation.
 * @param {Date} checkOut - La date de sortie de la réservation.
 * @returns {Promise<Object>} La réservation nouvellement créée.
 * @throws {Error} Si les données sont incomplètes ou invalides.
 */
async function createReservation({ catwayNumber, clientName, boatName, checkIn, checkOut }) {
    const numCatway = Number(catwayNumber);
    if (isNaN(numCatway)) {
      throw new Error("Numéro de catway invalide.");
    }

    const catwayExists = await Catway.findOne({ catwayNumber: numCatway });
    if (!catwayExists) {
        throw new Error("Ce numéro de catway n'existe pas.");
    }

    if (!catwayNumber || !clientName || !boatName || !checkIn || !checkOut) {
      throw new Error("Tous les champs sont requis.");
    }

    const newReservation = new Reservation({
      catwayNumber: numCatway,
      clientName,
      boatName,
      checkIn,
      checkOut,
    });

    await newReservation.save();
    return newReservation;
}

/**
 * Supprime une réservation par son ID.
 *
 * @param {string} reservationId - L'ID de la réservation à supprimer.
 * @returns {Promise<Object>} La réservation supprimée.
 * @throws {Error} Si l'ID de la réservation est invalide, manquant, ou si la réservation n'est pas trouvée.
 */
async function deleteReservation(reservationId) {
    if (!reservationId) {
      throw new Error("L'ID est requis.");
    }

    if (!mongoose.isValidObjectId(reservationId)) {
      throw new Error("L'ID de la réservation fourni est invalide.");
    }

    const deletedReservation = await Reservation.findByIdAndDelete(reservationId);

    if (!deletedReservation) {
      throw new Error("Réservation non trouvée.");
    }

    return deletedReservation;
}

/**
 * Récupère les détails d'une réservation par son ID.
 *
 * @param {string} reservationId - L'ID de la réservation.
 * @returns {Promise<Object>} Les détails de la réservation (numéro de catway, nom du client, etc.).
 * @throws {Error} Si l'ID de la réservation est invalide, manquant, ou si la réservation n'est pas trouvée.
 */
async function getReservationDetails(reservationId) {
    if (!reservationId) {
      throw new Error("L'ID de la réservation est requis.");
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error("Réservation non trouvée.");
    }

    return {
      catwayNumber: reservation.catwayNumber,
      clientName: reservation.clientName,
      boatName: reservation.boatName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
    };
}

module.exports = {
  createCatway,
  getNextCatwayNumber,
  updateCatwayState,
  deleteCatway,
  getCatwayDetails,
  createReservation,
  deleteReservation,
  getReservationDetails,
};
