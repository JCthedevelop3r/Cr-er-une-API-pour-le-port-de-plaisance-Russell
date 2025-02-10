const catwayService = require("../services/catways");


async function getCatwaysList(req, res) {
  try {
    const catways = await catwayService.getAllCatways();
    res.render("catways", { catways });
  } catch (error) {
    console.error("Erreur récupération catways :", error.message);
    res.status(500).send("Erreur serveur lors de la récupération des catways.");
  }
}

async function getCatwayDetails(req, res) {
  try {
    const catwayId = req.params.id;
    const catway = await catwayService.getCatwayById(catwayId);
    res.render("catway-details", { catway });
  } catch (error) {
    console.error("Erreur récupération catway :", error.message);
    res.status(500).send("Erreur serveur lors de la récupération du catway.");
  }
}

module.exports = { getCatwaysList, getCatwayDetails };
