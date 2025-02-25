const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Vérifie les identifiants d'un utilisateur et retourne un token JWT.
 *
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {string} Le token JWT généré.
 * @throws {Error} Si les identifiants sont incorrects.
 */
async function authenticate(email, password) {
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
  return jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
}

module.exports = { authenticate };
