const bcrypt = require("bcrypt");
const User = require("../models/user");
const mongoose = require("mongoose");

async function createUser(name, email, password) {
  // Vérifier que l'utilisateur n'existe pas déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer un nouvel utilisateur
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  // Sauvegarder dans la base de données
  await newUser.save();

  return newUser;
}

async function updateUser(userId, name, email) {
  // Vérifier que l'ID est bien un ObjectId valide
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("L'ID utilisateur fourni est invalide.");
  }

  // Vérifier que l'utilisateur existe
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // Mettre à jour les informations de l'utilisateur
  user.name = name || user.name;
  user.email = email || user.email;

  // Sauvegarder les modifications
  await user.save();

  return user;
}

async function deleteUser(userId) {
  // Vérifier que l'ID est bien un ObjectId valide
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("L'ID utilisateur fourni est invalide.");
  }

  // Vérifier que l'utilisateur existe
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  return user;
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
};
