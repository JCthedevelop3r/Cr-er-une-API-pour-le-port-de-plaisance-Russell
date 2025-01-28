const User = require("../models/user");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!name || !email || !password) {
      return res.status(400).send("Tous les champs sont requis.");
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Cet email est déjà utilisé.");
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

module.exports = { createUser, updateUser, deleteUser };
