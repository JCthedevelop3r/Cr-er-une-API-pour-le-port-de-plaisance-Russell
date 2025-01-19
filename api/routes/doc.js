// routes/doc.js
const express = require("express");
const router = express.Router();

// Exemple de données de documentation de l'API
const documentationData = [
  {
    method: "GET",
    path: "/catways",
    description: "Récupérer la liste des catways.",
  },
  {
    method: "GET",
    path: "/catways/:id",
    description: "Récupérer les détails d'un catway.",
  },
  {
    method: "POST",
    path: "/catways",
    description: "Créer un catway.",
  },
  {
    method: "PUT",
    path: "/catways/:id",
    description: "Mettre à jour un catway.",
  },
  {
    method: "DELETE",
    path: "/catways/:id",
    description: "Supprimer un catway.",
  },
  // Ajoutez d'autres routes si nécessaire
];

// Route pour afficher la documentation
router.get("/", (req, res) => {
  res.render("doc", {
    title: "Documentation API PPR",
  });
});

module.exports = router;
