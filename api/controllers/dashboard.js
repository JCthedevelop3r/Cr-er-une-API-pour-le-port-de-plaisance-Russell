const User = require("../models/user");
const Catway = require("../models/catway");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!name || !email || !password) {
      return res.status(400).send("Tous les champs sont requis.");
    }

    // Hasher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.redirect("/dashboard"); // Redirection après création
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur.");
  }
}

async function updateUser(req, res) {
  try {
    const { userId, name, email } = req.body;

    // Vérifier que tous les champs nécessaires sont présents
    if (!name || !email) {
      return res.status(400).send("Tous les champs sont requis.");
    }

    // Trouver l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Mettre à jour les informations de l'utilisateur
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur.");
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.body;

    // Vérifier que l'ID est bien fourni
    if (!userId) {
      return res.status(400).send("ID de l'utilisateur requis.");
    }

    // Trouver et supprimer l'utilisateur
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Rediriger vers le tableau de bord après la suppression
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur.");
  }
}

async function createCatway(req, res) {
  try {
    // Calculer le prochain numéro du catway
    const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
    const nextCatwayNumber = lastCatway ? lastCatway.catwayNumber + 1 : 1;

    // Création du nouveau catway
    const newCatway = new Catway({
      catwayNumber: nextCatwayNumber,
      type: req.body.type,
      catwayState: req.body.catwayState,
    });

    // Sauvegarde en base de données
    await newCatway.save();

    // Redirection vers le tableau de bord
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erreur lors de la création du catway :", err);
    res.status(500).send("Erreur serveur lors de la création du catway");
  }
}

async function getNextCatwayNumber(req, res) {
  try {
    const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
    const nextCatwayNumber = lastCatway ? lastCatway.catwayNumber + 1 : 1;
    res.json({ nextCatwayNumber }); // Retourne le numéro dans une réponse JSON
  } catch (err) {
    console.error("Erreur lors du calcul du numéro du catway :", err);
    res.status(500).send("Erreur serveur");
  }
}

async function updateCatwayState(req, res) {
  const { catwayId, catwayState } = req.body;

  try {
    // Vérification des données
    if (!catwayId || !catwayState) {
      return res.status(400).json({ error: "ID Catway et État sont requis." });
    }

    // Mise à jour de l'état du Catway
    const updatedCatway = await Catway.findOneAndUpdate(
      { _id: catwayId },
      { catwayState: catwayState },
      { new: true } // Pour retourner le document mis à jour
    );

    if (!updatedCatway) {
      return res.status(404).json({ error: "Catway non trouvé." });
    }

    // Sauvegarde en base de données
    await updatedCatway.save();

    // Redirection vers le tableau de bord
    res.redirect("/dashboard");
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'état du Catway :",
      error.message
    );
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour." });
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  createCatway,
  getNextCatwayNumber,
  updateCatwayState,
};
