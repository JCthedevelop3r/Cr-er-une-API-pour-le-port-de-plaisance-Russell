const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  console.log("Route /dashboard appelée");
  res.render("dashboard", {
    title: "Tableau de bord",
  });
});

module.exports = router;
