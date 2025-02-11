const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authenticate(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Vous devez remplir tous les champs.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Identifiant et/ou mot de passe incorrect(s).");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Identifiant et/ou mot de passe incorrect(s).");
  }

  // Génère un token JWT
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

  // Stocke le token dans un cookie HTTP-only
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Mettre `true` en production avec HTTPS
    sameSite: "Strict"
  });

  res.redirect("/dashboard"); // Redirection serveur
}

module.exports = { authenticate };
