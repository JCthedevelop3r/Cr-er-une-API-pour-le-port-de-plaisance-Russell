const request = require("supertest");
const assert = require("assert");
const app = require("../app"); // Vérifie le bon chemin
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

describe("Test pour l'affichage de la liste de toutes les réservations", function () {
  let mongoServer;
  let server;
  let authToken; // Stocke le token JWT

  before(async function () {
    this.timeout(10000);

    // Vérifie si une connexion est déjà établie
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Démarre un serveur MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connecte Mongoose à la base en mémoire
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    server = app.listen(3001);

    // Génére un token JWT manuellement
    const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
    authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY || "test-secret", { expiresIn: "24h" });

    // Ajoute des réservations factices
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

  after(async function () {
    // Vide la base après chaque test
    await Reservation.deleteMany({});

    if (server) await server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  it("devrait retourner le statut 200 et afficher toutes les réservations.", async function () {
    const res = await request(app)
      .get("/catways/allReservations")
      .set("cookie", `token=${authToken}`) // Envoi du token dans les cookies
      .expect(200);

    // Extraire le contenu de la page HTML
    const pageContent = res.text;

    // Vérifie que les noms des clients et des bateaux sont bien présents
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

describe("Test pour l'affichage des détails d'une réservation en particulier", function () {
  let mongoServer;
  let server;
  let reservationId;

  before(async function () {
    this.timeout(10000);

    // Vérifie si une connexion est déjà établie
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Démarre un serveur MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connecte Mongoose à la base en mémoire
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    server = app.listen(3001);

    // Ajoute une réservation factice
    const reservation = await Reservation.create({
      catwayNumber: 1,
      clientName: "Jean Dupont",
      boatName: "Le Voyageur",
      checkIn: new Date("2024-06-01"),
      checkOut: new Date("2024-06-10"),
    });

    reservationId = reservation._id; // Sauvegarde l'ID de la réservation
  });

  after(async function () {
    // Vide la base après chaque test
    await Reservation.deleteMany({});

    if (server) await server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  it("devrait retourner le statut 200 et afficher les détails de la réservation", async function () {
    const res = await request(app)
      .get(`/catways/1/reservations/${reservationId}`)
      .expect(200);

    const pageContent = res.text;

    // Vérifie que les détails de la réservation sont présents
    assert(pageContent.includes("Jean Dupont"));
    assert(pageContent.includes("Le Voyageur"));
    assert(pageContent.includes("01/06/2024"));
    assert(pageContent.includes("10/06/2024"));
  });

  it("devrait retourner 404 si la réservation n'est pas trouvée", async function () {
    const invalidReservationId = new mongoose.Types.ObjectId(); // ID de réservation invalide

    const res = await request(app)
      .get(`/catways/1/reservations/${invalidReservationId}`)
      .expect(404);

    assert(res.text.includes("Réservation non trouvée."));
  });
});
