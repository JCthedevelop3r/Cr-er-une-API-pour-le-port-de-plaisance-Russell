const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("dashboard", {
    title: "Tableau de bord",
  });
});

module.exports = router;
