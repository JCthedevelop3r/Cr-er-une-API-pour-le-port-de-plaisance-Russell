const Catway = require("../models/catway");

/**
 * Récupère tous les catways présents dans la base de données.
 *
 * @returns {Promise<Array>} Un tableau contenant tous les catways.
 * @throws {Error} En cas d'erreur lors de la récupération des catways.
 */
async function getAllCatways() {
  try {
    return await Catway.find();
  } catch (error) {
    throw new Error("Erreur lors de la récupération des catways.");
  }
}

/**
 * Récupère un catway spécifique par son ID.
 *
 * @param {string} catwayId - L'ID du catway à récupérer.
 * @returns {Promise<Object>} Le catway correspondant à l'ID spécifié.
 * @throws {Error} Si le catway n'est pas trouvé ou en cas d'erreur lors de la récupération.
 */
async function getCatwayById(catwayId) {
  try {
    const catway = await Catway.findById(catwayId);
    if (!catway) {
      throw new Error("Catway non trouvé.");
    }
    return catway;
  } catch (error) {
    throw new Error("Erreur lors de la récupération du catway.");
  }
}

module.exports = {
  getAllCatways,
  getCatwayById,
};