const authService = require("../services/auth");

/**
 * Contrôleur pour gérer l'authentification d'un utilisateur.
 *
 * @param {import("express").Request} req - Objet de requête Express contenant les identifiants de l'utilisateur.
 * @param {import("express").Response} res - Objet de réponse Express utilisé pour définir un cookie et rediriger l'utilisateur.
 */
async function authenticateUser(req, res) {
  try {
    const { email, password } = req.body;
    const token = await authService.authenticate(email, password);

    // Stocke le token dans un cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Mettre `true` en production avec HTTPS
      sameSite: "Strict"
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erreur d'authentification :", error.message);
    res.render("home", {
      title: "Accueil",
      message: "Bienvenue sur l'API du port de plaisance Russell !",
      error: error.message
    });
  }
}

module.exports = { authenticateUser };
