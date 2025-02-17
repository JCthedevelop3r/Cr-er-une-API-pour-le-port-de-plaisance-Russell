const bcrypt = require("bcrypt");
const User = require("../models/user");
const mongoose = require("mongoose");

/**
 * Crée un nouvel utilisateur avec un mot de passe haché.
 *
 * @param {string} name - Le nom de l'utilisateur.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise<Object>} L'utilisateur nouvellement créé.
 * @throws {Error} Si un utilisateur avec cet email existe déjà ou en cas d'erreur de création.
 */
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

/**
 * Met à jour les informations d'un utilisateur.
 *
 * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
 * @param {string} name - Le nouveau nom de l'utilisateur (optionnel).
 * @param {string} email - Le nouvel email de l'utilisateur (optionnel).
 * @returns {Promise<Object>} L'utilisateur mis à jour.
 * @throws {Error} Si l'ID est invalide, ou si l'utilisateur n'est pas trouvé.
 */
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

/**
 * Supprime un utilisateur par son ID.
 *
 * @param {string} userId - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<Object>} L'utilisateur supprimé.
 * @throws {Error} Si l'ID est invalide, ou si l'utilisateur n'est pas trouvé.
 */
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
