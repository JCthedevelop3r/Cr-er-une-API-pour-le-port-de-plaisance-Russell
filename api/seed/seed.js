/**
 * Script de peuplement de la base de données.
 * 
 * Ce fichier se charge de la connexion à la base de données, de la suppression des anciennes données et de l'insertion de nouvelles données
 * à partir de fichiers JSON pour les collections Catway, Reservation et User.
 */

const mongo = require("../mongo");
const mongoose = require("mongoose");
const Catway = require("../models/catway");
const Reservation = require("../models/reservation");
const User = require("../models/user");
const catwaysData = require("./catways.json");
const reservationsData = require("./reservations.json");
const usersData = require("./users.json");

/**
 * Fonction asynchrone pour peupler la base de données avec les données des fichiers JSON.
 * 
 * - Se connecte à la base de données MongoDB
 * - Supprime les anciennes données dans les collections Catway, Reservation et User
 * - Insère de nouvelles données dans ces collections à partir des fichiers JSON correspondants
 * 
 * @async
 * @function seedDatabase
 * @returns {void}
 * @throws {Error} Si une erreur survient lors de la connexion à la base de données ou lors de l'insertion des données.
 */
async function seedDatabase() {
    try {
      // Initialisation de la connexion à la base de données
      await mongo.initClientDbConnection();
      console.log("🚀 Connexion à la BDD réussie");
  
      // Suppression des anciennes données dans les collections
      await Catway.deleteMany({});
      await Reservation.deleteMany({});
      await User.deleteMany({});

      // Insertion des nouvelles données dans les collections
      await Catway.insertMany(catwaysData);
      await Reservation.insertMany(reservationsData);
      await User.insertMany(usersData);

      console.log("✅ BDD peuplée avec succès !");
    } catch (err) {
      console.error("❌ Erreur lors du peuplement de la BDD :", err);
    } finally {
      // Fermeture de la connexion à la base de données
      mongoose.connection.close();
    }
}

seedDatabase();
