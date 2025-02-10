const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authenticate(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(403).json({ message: "Mot de passe incorrect" });

        // Génère un token JWT
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Stocke le token dans un cookie HTTP-only
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Mettre `true` en production avec HTTPS
            sameSite: "Strict"
        });

        res.redirect("/dashboard"); // Redirection serveur
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = { authenticate };
