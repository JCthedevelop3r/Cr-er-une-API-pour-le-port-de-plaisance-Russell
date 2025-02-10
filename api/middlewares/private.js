const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    console.log("private.js s'active !")
    const token = req.cookies.token; // Récupère le token du cookie

    if (!token) {
        return res.status(401).send("Accès non autorisé, token manquant");
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Stocke l'ID du user pour la suite
        next();
    } catch (error) {
        return res.status(403).send("Token invalide");
    }
}

module.exports = { authenticateToken };
