const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const Catway = require('../models/catway');
const Reservation = require('../models/reservation');


/**
 * Tests pour la création d'un catway.
 * Ce fichier teste si l'endpoint `/dashboard/create-catway` fonctionne correctement
 * et gère correctement les numéros de catway et les valeurs d'état.
 */
describe('Tests pour la création d\'un catway', function() {
    let server;         // Serveur de test
    let mongoServer;    // Serveur MongoDB en mémoire
    let authToken;      // Token JWT pour l'authentification
    let consoleErrorMock; // Mock pour intercepter les erreurs console

    /**
     * Avant tous les tests :
     * - Vérifie si une connexion MongoDB existe et la ferme si nécessaire
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à la base de données en mémoire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Timeout pour éviter les erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur
    });

    /**
     * Avant chaque test :
     * - Désactive les erreurs console pour éviter le bruit dans les logs
     * - Génère un token JWT pour simuler un utilisateur authentifié
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Empêche l'affichage d'erreurs dans les logs de test

        // Crée un utilisateur factice avec un token JWT pour l'authentification
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
    });

    /**
     * Après chaque test :
     * - Supprime tous les catways de la base de données pour éviter toute interférence entre tests
     * - Restaure le comportement normal des erreurs console
     * @async
     */
    afterEach(async function () {
        await Catway.deleteMany({}); // Nettoie la base après chaque test
        consoleErrorMock.restore();  // Restaure le comportement normal de console.error
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express si actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    /**
     * Test de la création d'un catway avec un type et un état valides.
     * Vérifie :
     * - Le statut HTTP de la réponse (302, car il y a une redirection après la création)
     * - L'existence du catway en base après la requête
     * - La correspondance entre l'état fourni et celui enregistré
     */
    it("devrait créer un catway avec un type valide et un état valide", async function () {
        const res = await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`) // Envoi du token dans les cookies
            .send({ type: "short", catwayState: "En bon état" });

        assert.strictEqual(res.status, 302); // Vérifie que la requête redirige bien après la création

        const createdCatway = await Catway.findOne({ type: "short" });
        assert(createdCatway); // Vérifie que le catway a bien été créé
        assert.strictEqual(createdCatway.catwayState, "En bon état"); // Vérifie que l'état est bien enregistré
    });

    /**
     * Test de l'incrémentation automatique du numéro du catway.
     * Vérifie :
     * - Que chaque catway reçoit un numéro unique et croissant.
     */
    it("devrait incrémenter correctement le numéro du catway", async function () {
        // Création d'un premier catway (type long)
        await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`)
            .send({ type: "long", catwayState: "En bon état" });
    
        // Création d'un deuxième catway (type short)
        await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`)
            .send({ type: "short", catwayState: "En bon état" });
    
        // Récupération du dernier catway pour vérifier son numéro
        const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
        assert(lastCatway); // Vérifie que le dernier catway existe
        assert.strictEqual(lastCatway.catwayNumber, 2); // Vérifie que le numéro du catway a bien été incrémenté à 2
    });
});


/**
 * Tests pour la mise à jour de l'état d'un catway.
 * Ce fichier teste si l'endpoint `/dashboard/update-catway-state` fonctionne correctement
 * en mettant à jour l'état d'un catway existant et en gérant les erreurs éventuelles.
 */
describe('Tests pour la mise à jour de l\'état d\'un catway', function() {
    let server;         // Serveur de test
    let mongoServer;    // Serveur MongoDB en mémoire
    let catwayId;       // ID du catway utilisé pour les tests
    let consoleErrorMock; // Mock pour intercepter les erreurs console

    /**
     * Avant tous les tests :
     * - Vérifie si une connexion MongoDB existe et la ferme si nécessaire
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à la base de données en mémoire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Timeout pour éviter les erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur
    });

    /**
     * Avant chaque test :
     * - Désactive les erreurs console pour éviter le bruit dans les logs
     * - Crée un catway factice pour tester la mise à jour
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Empêche l'affichage d'erreurs dans les logs de test

        // Création d'un catway test
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayId = catway._id; // Sauvegarde l'ID du catway créé
    });

    /**
     * Après chaque test :
     * - Restaure le comportement normal des erreurs console
     */
    afterEach(() => {
        consoleErrorMock.restore();
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express si actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    /**
     * Test de la mise à jour de l'état d'un catway existant.
     * Vérifie :
     * - Le statut HTTP de la réponse (302, car il y a une redirection après la mise à jour)
     * - La modification correcte de l'état dans la base de données
     */
    it("devrait mettre à jour l'état d'un catway", async function () {
        const newState = "En très bon état";

        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId, catwayState: newState });

        assert.strictEqual(res.status, 302); // Vérifie que la requête redirige après la mise à jour

        // Vérifie que l'état du catway a bien été mis à jour dans la base de données
        const updatedCatway = await Catway.findById(catwayId);
        assert.strictEqual(updatedCatway.catwayState, newState); // L'état du catway doit être "En très bon état"
    });

    /**
     * Test de la mise à jour avec un ID de catway invalide.
     * Vérifie :
     * - Que la requête est bien redirigée (302)
     * - Que le message d'erreur approprié est renvoyé à la session
     */
    it("devrait renvoyer une erreur si l'ID du catway est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId: "invalidId", catwayState: "Nouveau statut" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien enregistré dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("L&#39;ID du catway fourni est invalide"));
    });

    /**
     * Test de la mise à jour avec un ID de catway inexistant.
     * Vérifie :
     * - Que la requête est bien redirigée (302)
     * - Que le message d'erreur approprié est renvoyé à la session
     */
    it("devrait renvoyer une erreur si le catway n'existe pas", async function () {
        const nonExistentCatwayId = new mongoose.Types.ObjectId(); // ID qui n'existe pas en base

        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId: nonExistentCatwayId.toString(), catwayState: "Nouveau statut" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien enregistré dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Catway non trouvé."));
    });
});


/**
 * Tests pour la suppression d'un catway.
 * Ce fichier vérifie si l'endpoint `/dashboard/delete-catway` permet de supprimer un catway 
 * existant et gère correctement les erreurs en cas d'ID invalide.
 */
describe('Tests pour la suppression d\'un catway', function() {
    let server;          // Serveur Express pour les tests
    let mongoServer;     // Serveur MongoDB en mémoire
    let authToken;       // Jeton d'authentification pour l'utilisateur admin
    let catwayNumber;    // Numéro du catway utilisé pour les tests
    let consoleErrorMock; // Mock pour intercepter les erreurs console

    /**
     * Avant tous les tests :
     * - Vérifie et ferme toute connexion MongoDB existante
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à la base de données en mémoire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le timeout pour éviter des erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur pour les tests
    });

    /**
     * Avant chaque test :
     * - Désactive l'affichage des erreurs dans la console pour éviter les bruits dans les logs
     * - Crée un utilisateur test pour l'authentification
     * - Crée un catway factice pour tester la suppression
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Désactive les logs d'erreurs

        // Création d'un utilisateur administrateur fictif
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Création d'un catway test
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayNumber = catway.catwayNumber; // Sauvegarde du numéro du catway créé
    });

    /**
     * Après chaque test :
     * - Supprime tous les catways de la base de données
     * - Restaure le comportement normal des erreurs console
     */
    afterEach(async function () {
        await Catway.deleteMany({});
        consoleErrorMock.restore();
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express s'il est actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    /**
     * Test de la suppression d'un catway existant.
     * Vérifie :
     * - Le statut HTTP de la réponse (302, car redirection après suppression)
     * - Que le catway a bien été supprimé de la base de données
     */
    it("devrait supprimer un catway", async function () {
        const res = await request(app)
            .post("/dashboard/delete-catway")
            .set("cookie", `token=${authToken}`) // Passe le token via les cookies
            .send({ catwayNumber });

        assert.strictEqual(res.status, 302); // Vérifie la redirection après la suppression

        // Vérifie que le catway a bien été supprimé de la base de données
        const deletedCatway = await Catway.findOne({ catwayNumber });
        assert.strictEqual(deletedCatway, null); // Le catway ne doit plus exister
    });

    /**
     * Test de la suppression d'un catway avec un numéro invalide.
     * Vérifie :
     * - Que la requête est bien redirigée (302)
     * - Que le message d'erreur approprié est stocké dans la session
     */
    it("devrait renvoyer une erreur si le numéro du catway est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-catway")
            .set("cookie", `token=${authToken}`) // Passe le token via les cookies
            .send({ catwayNumber: "invalidNumber" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien enregistré dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Numéro de catway invalide."));
    });
});


/**
 * Tests pour la récupération des détails d'un catway.
 * Vérifie si l'endpoint `/dashboard/catway-details/:catwayNumber` permet d'obtenir
 * les informations correctes d'un catway existant et gère correctement les erreurs.
 */
describe('Tests pour la récupération des détails d\'un catway', function() {
    let server;          // Serveur Express pour les tests
    let mongoServer;     // Serveur MongoDB en mémoire
    let catwayNumber;    // Numéro du catway utilisé pour les tests
    let consoleErrorMock; // Mock pour intercepter les erreurs console

    /**
     * Avant tous les tests :
     * - Vérifie et ferme toute connexion MongoDB existante
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à la base de données en mémoire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le timeout pour éviter des erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur pour les tests
    });

    /**
     * Avant chaque test :
     * - Désactive l'affichage des erreurs dans la console pour éviter les bruits dans les logs
     * - Crée un catway factice pour tester la récupération des détails
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Désactive les logs d'erreurs

        // Création d'un catway test
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayNumber = catway.catwayNumber; // Sauvegarde du numéro du catway créé
    });

    /**
     * Après chaque test :
     * - Restaure le comportement normal des erreurs console
     */
    afterEach(() => {
        consoleErrorMock.restore();
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express s'il est actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    /**
     * Test de la récupération des détails d'un catway existant.
     * Vérifie :
     * - Le statut HTTP de la réponse (200)
     * - Que les informations retournées correspondent bien à celles du catway en base
     */
    it("devrait récupérer les détails d'un catway existant", async function () {
        const res = await request(app)
            .get(`/dashboard/catway-details/${catwayNumber}`);

        assert.strictEqual(res.status, 200); // Vérifie que la requête réussit
        const data = res.body;

        assert.strictEqual(data.type, "short"); // Vérifie que le type est correct
        assert.strictEqual(data.catwayState, "En bon état"); // Vérifie l'état du catway
    });

    /**
     * Test de la récupération des détails d'un catway inexistant.
     * Vérifie :
     * - Que la requête renvoie une erreur 404
     * - Que le message d'erreur retourné est approprié
     */
    it("devrait renvoyer une erreur si le catway n'existe pas", async function () {
        const nonExistentCatwayNumber = 9999; // Catway inexistant

        const res = await request(app)
            .get(`/dashboard/catway-details/${nonExistentCatwayNumber}`);

        assert.strictEqual(res.status, 404); // Vérifie que l'erreur 404 est retournée
        const data = res.body;

        assert.strictEqual(data.error, "Catway non trouvé."); // Vérifie le message d'erreur
    });
});


/**
 * Tests pour l'enregistrement d'une réservation.
 * Vérifie :
 * - L'enregistrement correct d'une réservation avec des données valides
 * - La gestion des erreurs lorsque le numéro de catway est invalide ou inexistant
 */
describe('Tests pour l\'enregistrement d\'une réservation', function() {
    let server;          // Serveur Express pour les tests
    let mongoServer;     // Serveur MongoDB en mémoire
    let consoleErrorMock; // Mock pour intercepter les erreurs console
    let validCatway;     // Catway valide utilisé pour les tests
    let authToken;       // Token d'authentification pour les requêtes sécurisées

    /**
     * Avant tous les tests :
     * - Déconnecte Mongoose s'il y a une connexion existante
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à cette base temporaire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le timeout pour éviter des erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur pour les tests
    });

    /**
     * Avant chaque test :
     * - Mocke la console pour éviter les logs inutiles
     * - Crée un utilisateur et génère un token JWT
     * - Crée un catway valide pour les tests
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Désactive les logs d'erreurs

        // Création d'un utilisateur factice et génération d'un token JWT
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Création d'un catway valide
        validCatway = await Catway.create({ catwayNumber: 1, type: "long", catwayState: "Mauvais état" });
    });

    /**
     * Après chaque test :
     * - Supprime toutes les réservations et catways de la base temporaire
     * - Restaure la console d'erreur normale
     */
    afterEach(async function () {
        await Reservation.deleteMany({});
        await Catway.deleteMany({});
        consoleErrorMock.restore();
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express s'il est actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    /**
     * Test : Enregistrement d'une réservation avec des données valides.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection après enregistrement)
     * - Que la réservation est bien enregistrée en base de données
     */
    it("devrait enregistrer une réservation avec des données valides", async function () {
        const reservationData = {
            catwayNumber: validCatway.catwayNumber, // On utilise un catway valide
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        };

        const res = await request(app)
            .post("/dashboard/save-reservation")
            .set("cookie", `token=${authToken}`)
            .send(reservationData);

        assert.strictEqual(res.status, 302); // Vérifie que la requête redirige bien après l'enregistrement

        // Vérifie que la réservation a bien été enregistrée en base
        const reservation = await Reservation.findOne({ catwayNumber: reservationData.catwayNumber });
        assert(reservation);
        assert.strictEqual(reservation.clientName, reservationData.clientName);
        assert.strictEqual(reservation.boatName, reservationData.boatName);
    });

    /**
     * Test : Gestion d'une erreur si le numéro de catway est invalide.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection)
     * - Que le message d'erreur "Numéro de catway invalide" est bien enregistré en session
     */
    it("devrait retourner une erreur si le numéro de catway est invalide", async function () {
        const reservationData = {
            catwayNumber: "invalid",  // Numéro de catway invalide
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        };

        const res = await request(app)
            .post("/dashboard/save-reservation")
            .set("cookie", `token=${authToken}`)
            .send(reservationData);

        assert.strictEqual(res.status, 302); // Vérifie que la requête redirige bien

        // Vérifie que le message d'erreur est bien enregistré en session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Numéro de catway invalide."));
    });

    /**
     * Test : Gestion d'une erreur si le numéro de catway n'existe pas.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection)
     * - Que le message d'erreur "Ce numéro de catway n'existe pas" est bien enregistré en session
     */
    it("devrait retourner une erreur si le numéro de catway n'existe pas", async function () {
        const reservationData = {
            catwayNumber: 9999, // Numéro de catway inexistant
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        };

        const res = await request(app)
            .post("/dashboard/save-reservation")
            .set("cookie", `token=${authToken}`)
            .send(reservationData);

        assert.strictEqual(res.status, 302); // Vérifie que la requête redirige bien

        // Vérifie que le message d'erreur est bien enregistré en session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Ce numéro de catway n&#39;existe pas."));
    });
});


/**
 * Tests pour la suppression d'une réservation.
 * Vérifie :
 * - La suppression réussie d'une réservation avec un ID valide
 * - La gestion d'erreurs avec un ID invalide
 * - La gestion d'erreurs lorsque la réservation n'existe pas
 */
describe("Tests pour la suppression d'une réservation", function () {
    let server;          // Serveur Express pour les tests
    let mongoServer;     // Serveur MongoDB en mémoire
    let consoleErrorMock; // Mock pour intercepter les erreurs console
    let validReservation; // Réservation valide utilisée pour les tests

    /**
     * Avant tous les tests :
     * - Déconnecte Mongoose s'il y a une connexion existante
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à cette base temporaire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le timeout pour éviter des erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur pour les tests
    });

    /**
     * Avant chaque test :
     * - Mocke la console pour éviter les logs inutiles
     * - Crée un utilisateur et génère un token JWT
     * - Crée une réservation valide pour les tests
     */
    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Désactive les logs d'erreurs

        // Création d'un utilisateur factice et génération d'un token JWT
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Création d'une réservation valide
        validReservation = await Reservation.create({
            catwayNumber: 1,
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        });
    });

    /**
     * Après chaque test :
     * - Supprime toutes les réservations de la base temporaire
     * - Restaure la console d'erreur normale
     */
    afterEach(async function () {
        await Reservation.deleteMany({});
        consoleErrorMock.restore();
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express s'il est actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    /**
     * Test : Suppression d'une réservation avec un ID valide.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection après suppression)
     * - Que le message "Réservation supprimée avec succès !" est bien affiché dans la session
     * - Que la réservation a bien été supprimée de la base de données
     */
    it("devrait supprimer une réservation avec un ID valide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: validReservation._id });

        assert.strictEqual(res.status, 302); // Vérifie la redirection après la suppression

        // Vérifie le message de succès dans la session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Réservation supprimée avec succès !"));

        // Vérifie que la réservation a été supprimée de la base de données
        const reservation = await Reservation.findById(validReservation._id);
        assert.strictEqual(reservation, null); // La réservation doit être nulle
    });

    /**
     * Test : Suppression d'une réservation avec un ID invalide.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection)
     * - Que le message d'erreur "L'ID de la réservation fourni est invalide." est bien affiché dans la session
     */
    it("devrait retourner une erreur si l'ID est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: "invalid_id" });

        assert.strictEqual(res.status, 302); // Vérifie la redirection

        // Vérifie le message d'erreur dans la session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("L&#39;ID de la réservation fourni est invalide."));
    });

    /**
     * Test : Suppression d'une réservation avec un ID qui n'existe pas.
     * Vérifie :
     * - Que la requête retourne un statut 302 (redirection)
     * - Que le message d'erreur "Réservation non trouvée." est bien affiché dans la session
     */
    it("devrait retourner une erreur si la réservation n'existe pas", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: new mongoose.Types.ObjectId() }); // ID inexistant

        assert.strictEqual(res.status, 302); // Vérifie la redirection

        // Vérifie le message d'erreur dans la session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Réservation non trouvée."));
    });
});

/**
 * Tests pour l'affichage des détails d'une réservation.
 * Vérifie :
 * - L'affichage des détails d'une réservation existante
 * - La gestion d'erreur si la réservation n'existe pas
 */
describe("Tests pour l'affichage des détails d'une réservation", function () {
    let server;           // Serveur Express pour les tests
    let mongoServer;      // Serveur MongoDB en mémoire
    let testReservation;  // Réservation utilisée pour les tests

    /**
     * Avant tous les tests :
     * - Déconnecte Mongoose s'il y a une connexion existante
     * - Démarre un serveur MongoDB en mémoire
     * - Connecte Mongoose à cette base temporaire
     * - Lance le serveur Express de l'application
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le timeout pour éviter des erreurs de connexion

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create(); // Démarre MongoDB en mémoire
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001); // Lance le serveur pour les tests
    });

    /**
     * Avant chaque test :
     * - Crée un catway et une réservation valide pour les tests
     */
    beforeEach(async function () {
        // Création d'un catway valide
        const testCatway = await Catway.create({ catwayNumber: 1, type: "long", catwayState: "Bon état" });

        // Création d'une réservation valide
        testReservation = await Reservation.create({
            catwayNumber: testCatway.catwayNumber,
            clientName: "Jean Dupont",
            boatName: "Le Voyageur",
            checkIn: new Date("2025-02-18"),
            checkOut: new Date("2025-02-20"),
        });
    });

    /**
     * Après chaque test :
     * - Supprime toutes les réservations et catways de la base temporaire
     */
    afterEach(async function () {
        await Reservation.deleteMany({});
        await Catway.deleteMany({});
    });

    /**
     * Après tous les tests :
     * - Arrête le serveur Express s'il est actif
     * - Ferme la connexion MongoDB
     * - Arrête le serveur MongoDB en mémoire
     * @async
     */
    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    /**
     * Test : Affichage des détails d'une réservation existante.
     * Vérifie :
     * - Que la requête retourne un statut 200
     * - Que les détails de la réservation dans la réponse sont corrects
     */
    it("devrait afficher les détails d'une réservation existante", async function () {
        const res = await request(app).get(`/dashboard/reservation-details/${testReservation._id}`);

        assert.strictEqual(res.status, 200); // Vérifie le statut de la réponse
        assert.strictEqual(res.body.catwayNumber, testReservation.catwayNumber); // Vérifie le numéro de catway
        assert.strictEqual(res.body.clientName, testReservation.clientName); // Vérifie le nom du client
        assert.strictEqual(res.body.boatName, testReservation.boatName); // Vérifie le nom du bateau
        assert.strictEqual(new Date(res.body.checkIn).toISOString(), testReservation.checkIn.toISOString()); // Vérifie la date d'arrivée
        assert.strictEqual(new Date(res.body.checkOut).toISOString(), testReservation.checkOut.toISOString()); // Vérifie la date de départ
    });

    /**
     * Test : Affichage des détails d'une réservation qui n'existe pas.
     * Vérifie :
     * - Que la requête retourne un statut 400
     * - Que le message d'erreur "Réservation non trouvée." est bien retourné
     */
    it("devrait retourner une erreur si la réservation n'existe pas", async function () {
        const fakeId = new mongoose.Types.ObjectId(); // Génère un ID qui n'existe pas dans la base
        const res = await request(app).get(`/dashboard/reservation-details/${fakeId}`);

        assert.strictEqual(res.status, 400); // Vérifie le statut d'erreur
        assert.strictEqual(res.body.error, "Réservation non trouvée."); // Vérifie le message d'erreur
    });
});
