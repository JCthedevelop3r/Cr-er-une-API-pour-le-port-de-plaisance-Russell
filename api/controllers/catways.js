const Catway = require("../models/catway");

async function getCatwaysList(req, res) {
  try {
    // Récupérer toutes les catways depuis la base de données
    const catways = await Catway.find();

    // Rendre la page "catways.ejs" avec les données récupérées
    res.render("catways", { catways });
  } catch (err) {
    console.error("Erreur lors de la récupération des catways :", err);
    // Gérer l'erreur comme tu le souhaites, par exemple :
    res
      .status(500)
      .send("Erreur de serveur lors de la récupération des catways");
  }
}

async function getCatwayDetails(req, res) {
  try {
    // Récupérer l'ID du catway depuis les paramètres de l'URL
    const catwayId = req.params.id;

    // Trouver le catway dans la base de données en fonction de son ID, en excluant les timestamps
    const catway = await Catway.findById(catwayId);

    // Vérifier si le catway existe
    if (!catway) {
      return res.status(404).send("Catway non trouvé");
    }

    // Rendre la vue avec les détails du catway
    res.render("catway-details", { catway });
  } catch (err) {
    console.error("Erreur lors de la récupération du catway :", err);
    res.status(500).send("Erreur de serveur lors de la récupération du catway");
  }
}

module.exports = { getCatwaysList, getCatwayDetails };
