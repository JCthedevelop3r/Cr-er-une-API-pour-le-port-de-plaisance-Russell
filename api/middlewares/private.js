const jwt = require("jsonwebtoken");

/**
 * Middleware pour vérifier l'authenticité d'un token JWT.
 * Ce middleware permet de s'assurer que la requête est authentifiée
 * en vérifiant la validité du token contenu dans les cookies de la requête.
 * 
 * Si le token est valide, l'utilisateur est authentifié et son ID est ajouté
 * à la requête pour une utilisation ultérieure.
 * Si le token est manquant ou invalide, un message d'erreur est renvoyé.
 * 
 * @param {Object} req - La requête HTTP.
 * @param {Object} res - La réponse HTTP.
 * @param {Function} next - La fonction pour passer au middleware suivant.
 */
function authenticateToken(req, res, next) {
    // Récupérer le token JWT depuis les cookies de la requête
    const token = req.cookies.token; 

    // Si aucun token n'est trouvé, renvoyer une erreur 401 (Non autorisé)
    if (!token) {
        return res.status(401).send("Accès non autorisé, token manquant");
    }

    try {
        // Vérification du token avec la clé secrète définie dans les variables d'environnement
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Stocker les informations décodées du token (par exemple l'ID utilisateur) dans la requête
        req.user = decoded; // Cela permet d'accéder à l'utilisateur authentifié plus tard dans le processus

        // Passer au middleware suivant
        next();
    } catch (error) {
        // Si le token est invalide, renvoyer une erreur 403 (Accès interdit)
        return res.status(403).send("Token invalide");
    }
}

module.exports = { authenticateToken };
