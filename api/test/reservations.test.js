const request = require("supertest");
const assert = require("assert");
const app = require("../app");
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

/**
 * Test pour l'affichage de la liste de toutes les réservations.
 * Ce fichier teste si l'endpoint `/catways/allReservations` affiche correctement toutes les réservations.
 */
describe("Test pour l'affichage de la liste de toutes les réservations", function () {
  let mongoServer;  // Serveur MongoDB en mémoire
  let server;       // Serveur de test
  let authToken;    // Token JWT d'authentification

  /**
   * Avant tous les tests, initialisation du serveur et connexion à la base de données en mémoire.
   * Génération d'un token JWT et insertion de réservations factices.
   * @async
   */
  before(async function () {
    this.timeout(10000); // Définit un délai d'attente de 10 secondes pour éviter les erreurs de timeout

    // Vérifie si une connexion MongoDB existe déjà et la ferme si nécessaire
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Création d'un serveur MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connexion à la base de données en mémoire
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Démarrage du serveur de l'application
    server = app.listen(3001);

    // Création d'un utilisateur de test et génération d'un token JWT
    const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
    authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY || "test-secret", { expiresIn: "24h" });

    // Insertion de réservations factices dans la base de données
    await Reservation.insertMany([
      {
        catwayNumber: 1,
        clientName: "Jean Dupont",
        boatName: "Le Voyageur",
        checkIn: new Date("2024-06-01"),
        checkOut: new Date("2024-06-10"),
      },
      {
        catwayNumber: 2,
        clientName: "Marie Curie",
        boatName: "L'Explorateur",
        checkIn: new Date("2024-07-01"),
        checkOut: new Date("2024-07-15"),
      },
    ]);
  });

  /**
   * Après tous les tests, suppression des données et arrêt du serveur.
   * @async
   */
  after(async function () {
    await Reservation.deleteMany({}); // Supprime toutes les réservations après les tests

    if (server) await server.close(); // Ferme le serveur de test
    await mongoose.connection.close(); // Ferme la connexion MongoDB
    if (mongoServer) await mongoServer.stop(); // Arrête le serveur MongoDB en mémoire
  });

  /**
   * Teste si l'endpoint `/catways/allReservations` retourne bien toutes les réservations.
   * Vérifie :
   *  - Le statut HTTP (200)
   *  - La présence des informations des clients et des bateaux dans la réponse
   *  - Le bon formatage des dates
   */
  it("devrait retourner le statut 200 et afficher toutes les réservations.", async function () {
    const res = await request(app)
      .get("/catways/allReservations")
      .set("cookie", `token=${authToken}`) // Envoi du token JWT dans les cookies
      .expect(200); // Vérifie que la requête réussit avec le statut 200

    // Extraire le contenu de la page HTML retournée
    const pageContent = res.text;

    // Vérifie que les noms des clients et des bateaux sont bien présents dans la réponse
    assert(pageContent.includes("Jean Dupont"));
    assert(pageContent.includes("Le Voyageur"));
    assert(pageContent.includes("Marie Curie"));
    assert(pageContent.includes("L&#39;Explorateur"));

    // Vérifie que les dates sont bien formatées en "jj/mm/aaaa"
    assert(pageContent.includes("01/06/2024"));
    assert(pageContent.includes("10/06/2024"));
    assert(pageContent.includes("01/07/2024"));
    assert(pageContent.includes("15/07/2024"));
  });
});


/**
 * Test pour l'affichage des détails d'une réservation en particulier.
 * Ce fichier teste si l'endpoint `/catways/:catwayNumber/reservations/:reservationId`
 * affiche correctement les informations d'une réservation spécifique.
 */
describe("Test pour l'affichage des détails d'une réservation en particulier", function () {
  let mongoServer;   // Serveur MongoDB en mémoire
  let server;        // Serveur de test
  let reservationId; // ID de la réservation créée pour les tests

  /**
   * Avant tous les tests, initialisation du serveur et connexion à la base de données en mémoire.
   * Création d'une réservation factice pour les tests.
   * @async
   */
  before(async function () {
    this.timeout(10000); // Définit un délai d'attente de 10 secondes pour éviter les erreurs de timeout

    // Vérifie si une connexion MongoDB existe déjà et la ferme si nécessaire
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Création d'un serveur MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connexion à la base de données en mémoire
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Démarrage du serveur de l'application
    server = app.listen(3001);

    // Création d'une réservation factice pour les tests
    const reservation = await Reservation.create({
      catwayNumber: 1,
      clientName: "Jean Dupont",
      boatName: "Le Voyageur",
      checkIn: new Date("2024-06-01"),
      checkOut: new Date("2024-06-10"),
    });

    reservationId = reservation._id; // Sauvegarde l'ID de la réservation pour les tests
  });

  /**
   * Après tous les tests, suppression des données et arrêt du serveur.
   * @async
   */
  after(async function () {
    await Reservation.deleteMany({}); // Supprime toutes les réservations après les tests

    if (server) await server.close(); // Ferme le serveur de test
    await mongoose.connection.close(); // Ferme la connexion MongoDB
    if (mongoServer) await mongoServer.stop(); // Arrête le serveur MongoDB en mémoire
  });

  /**
   * Teste si l'endpoint `/catways/:catwayNumber/reservations/:reservationId`
   * retourne bien les détails d'une réservation existante.
   * Vérifie :
   *  - Le statut HTTP (200)
   *  - La présence des informations du client et du bateau
   *  - Le bon formatage des dates
   */
  it("devrait retourner le statut 200 et afficher les détails de la réservation", async function () {
    const res = await request(app)
      .get(`/catways/1/reservations/${reservationId}`) // Envoie une requête avec l'ID de la réservation
      .expect(200); // Vérifie que la requête réussit avec le statut 200

    const pageContent = res.text;

    // Vérifie que les détails de la réservation sont bien affichés dans la réponse
    assert(pageContent.includes("Jean Dupont"));
    assert(pageContent.includes("Le Voyageur"));
    assert(pageContent.includes("01/06/2024"));
    assert(pageContent.includes("10/06/2024"));
  });

  /**
   * Teste si l'endpoint `/catways/:catwayNumber/reservations/:reservationId`
   * retourne une erreur 404 si la réservation n'existe pas.
   * Vérifie :
   *  - Le statut HTTP (404)
   *  - La présence du message "Réservation non trouvée."
   */
  it("devrait retourner 404 si la réservation n'est pas trouvée", async function () {
    const invalidReservationId = new mongoose.Types.ObjectId(); // Génère un ID de réservation inexistant

    const res = await request(app)
      .get(`/catways/1/reservations/${invalidReservationId}`) // Requête avec un ID inexistant
      .expect(404); // Vérifie que le statut retourné est bien 404

    assert(res.text.includes("Réservation non trouvée.")); // Vérifie que le message d'erreur est bien affiché
  });
});
