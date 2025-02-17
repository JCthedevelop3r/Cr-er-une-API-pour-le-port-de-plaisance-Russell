/**
 * Récupère la liste de tous les catways et les rend sur la page catways.
 *
 * @param {Object} req - L'objet de la requête HTTP.
 * @param {Object} res - L'objet de la réponse HTTP.
 * @returns {Promise<void>} - La réponse est rendue avec les données des catways.
 * @throws {Error} En cas d'erreur lors de la récupération des catways.
 */
async function getCatwaysList(req, res) {
  try {
    const catways = await catwayService.getAllCatways();
    res.render("catways", { catways });
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la récupération des catways.");
  }
}

/**
 * Récupère les détails d'un catway spécifique et les rend sur la page catway-details.
 *
 * @param {Object} req - L'objet de la requête HTTP.
 * @param {Object} res - L'objet de la réponse HTTP.
 * @returns {Promise<void>} - La réponse est rendue avec les données du catway.
 * @throws {Error} En cas d'erreur lors de la récupération du catway.
 */
async function getCatwayDetails(req, res) {
  try {
    const catwayId = req.params.id;
    const catway = await catwayService.getCatwayById(catwayId);
    res.render("catway-details", { catway });
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la récupération du catway.");
  }
}

module.exports = { getCatwaysList, getCatwayDetails };
