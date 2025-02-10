const Catway = require("../models/catway");

async function getAllCatways() {
  try {
    return await Catway.find();
  } catch (error) {
    throw new Error("Erreur lors de la récupération des catways.");
  }
}

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