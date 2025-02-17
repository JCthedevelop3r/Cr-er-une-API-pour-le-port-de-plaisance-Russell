const assert = require("assert");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Catway = require("../models/catway");
const jwt = require("jsonwebtoken");

/**
 * Suite de tests pour la gestion des catways.
 * Cette suite vérifie le bon fonctionnement de l'API pour la liste des catways.
 */
describe("Tests pour la liste des catways", function () {
  let server;
  let mongoServer;
  let authToken;

  /**
   * Configuration avant tous les tests :
   * - Connexion à une base de données en mémoire MongoDB.
   * - Création d'un token d'authentification pour l'utilisateur.
   * 
   * @async
   * @throws {Error} Si la connexion à la base de données échoue.
   */
  before(async function () {
    this.timeout(10000); // Délai d'attente prolongé pour la configuration initiale.

    // Déconnexion de la base de données existante si nécessaire
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Démarrer une instance MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connexion à la base de données en mémoire
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Démarrer le serveur de l'application
    server = app.listen(3001);

    // Créer un token d'authentification pour un utilisateur de test
    const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
    authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
  });

  /**
   * Avant chaque test, créer des catways pour tester les fonctionnalités.
   * 
   * @async
   */
  beforeEach(async function () {
    await Catway.create([
      { catwayNumber: 1, type: "long", catwayState: "Bon état" },
      { catwayNumber: 2, type: "short", catwayState: "Excellent" },
      { catwayNumber: 3, type: "long", catwayState: "Mauvais état" },
    ]);
  });

  /**
   * Après chaque test, supprimer les catways créés pour éviter les conflits entre les tests.
   * 
   * @async
   */
  afterEach(async function () {
    await Catway.deleteMany({});
  });

  /**
   * Nettoyage après la fin de la suite de tests :
   * - Arrêter le serveur.
   * - Fermer la connexion à la base de données.
   * - Arrêter MongoDB en mémoire.
   * 
   * @async
   */
  after(async function () {
    if (server) await server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  /**
   * Test pour vérifier que tous les catways sont correctement retournés par l'API.
   * 
   * Ce test simule une requête GET sur l'endpoint "/catways", avec un token d'authentification,
   * et vérifie si les numéros des catways sont présents dans la réponse.
   * 
   * @async
   * @throws {AssertionError} Si les numéros de catways ne sont pas trouvés dans la réponse.
   */
  it("devrait lister tous les catways disponibles", async function () {
    const res = await request(app)
      .get("/catways") // Envoi de la requête GET
      .set("cookie", `token=${authToken}`) // Ajout du token d'authentification
      .send();

    assert.strictEqual(res.status, 200); // Vérifie le code de statut
    assert(res.text.includes("1")); // Vérifie que le catway numéro 1 est dans la réponse
    assert(res.text.includes("2")); // Vérifie que le catway numéro 2 est dans la réponse
    assert(res.text.includes("3")); // Vérifie que le catway numéro 3 est dans la réponse
  });
});
