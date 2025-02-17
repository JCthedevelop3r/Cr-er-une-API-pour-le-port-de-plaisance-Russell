const express = require("express");
const router = express.Router();

// Route pour la documentation
router.get("/", (req, res) => {
  res.render("doc", {
    title: "Documentation API PPR",
  });
});

module.exports = router;
