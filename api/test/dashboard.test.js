const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const Catway = require('../models/catway');
const Reservation = require('../models/reservation');


describe('Tests pour la création d\'un catway', function() {
    let server;
    let mongoServer;
    let authToken;
    let consoleErrorMock;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Mock pour éviter les logs dans le test

        // Crée un utilisateur pour tester l'authentification
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
    });

    afterEach(async function () {
        await Catway.deleteMany({});
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait créer un catway avec un type valide et un état valide", async function () {
        const res = await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`)
            .send({ type: "short", catwayState: "En bon état" });

        assert.strictEqual(res.status, 302);

        const createdCatway = await Catway.findOne({ type: "short" });
        assert(createdCatway);
        assert.strictEqual(createdCatway.catwayState, "En bon état");
    });

    it("devrait incrémenter correctement le numéro du catway", async function () {
        // Créer un premier catway (type long)
        await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`)
            .send({ type: "long", catwayState: "En bon état" });
    
        // Créer un deuxième catway (type short)
        await request(app)
            .post("/dashboard/create-catway")
            .set("cookie", `token=${authToken}`)
            .send({ type: "short", catwayState: "En bon état" });
    
        // Récupère le dernier catway pour vérifier le numéro
        const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
        assert(lastCatway); // Le dernier catway doit exister
        assert.strictEqual(lastCatway.catwayNumber, 2); // Le numéro du catway doit être incrémenté à 2
    });
});

describe('Tests pour la mise à jour de l\'état d\'un catway', function() {
    let server;
    let mongoServer;
    let catwayId;
    let consoleErrorMock;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Mock pour éviter les logs dans le test

        // Crée un catway pour tester la mise à jour
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayId = catway._id;
    });

    afterEach(() => {
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait mettre à jour l'état d'un catway", async function () {
        const newState = "En très bon état";

        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId, catwayState: newState });

        assert.strictEqual(res.status, 302); // Redirection attendue après la mise à jour

        // Vérifie si l'état du catway a bien été mis à jour dans la base de données
        const updatedCatway = await Catway.findById(catwayId);
        assert.strictEqual(updatedCatway.catwayState, newState); // L'état du catway doit être "En très bon état"
    });

    it("devrait renvoyer une erreur si l'ID du catway est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId: "invalidId", catwayState: "Nouveau statut" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("L&#39;ID du catway fourni est invalide"));
    });

    it("devrait renvoyer une erreur si le catway n'existe pas", async function () {
        const nonExistentCatwayId = new mongoose.Types.ObjectId(); // ID qui n'existe pas en base

        const res = await request(app)
            .post("/dashboard/update-catway-state")
            .send({ catwayId: nonExistentCatwayId.toString(), catwayState: "Nouveau statut" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Catway non trouvé."));
    });
});

describe('Tests pour la suppression d\'un catway', function() {
    let server;
    let mongoServer;
    let authToken;
    let catwayNumber;
    let consoleErrorMock;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Mock pour éviter les logs dans le test

        // Crée un utilisateur pour tester l'authentification
        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Crée un catway pour tester la suppression
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayNumber = catway.catwayNumber;
    });

    afterEach(async function () {
        await Catway.deleteMany({});
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait supprimer un catway", async function () {
        const res = await request(app)
            .post("/dashboard/delete-catway")
            .set("cookie", `token=${authToken}`) // Passe le token via les cookies
            .send({ catwayNumber });

        assert.strictEqual(res.status, 302); // Redirection attendue après la suppression

        // Vérifie si le catway a bien été supprimé
        const deletedCatway = await Catway.findOne({ catwayNumber });
        assert.strictEqual(deletedCatway, null); // Le catway ne doit plus exister
    });

    it("devrait renvoyer une erreur si le numéro du catway est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-catway")
            .set("cookie", `token=${authToken}`) // Passe le token via les cookies
            .send({ catwayNumber: "invalidNumber" });

        assert.strictEqual(res.status, 302); // Redirection attendue même en cas d'erreur

        // Vérifie que le message d'erreur est bien dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Numéro de catway invalide."));
    });
});

describe('Tests pour la récupération des détails d\'un catway', function() {
    let server;
    let mongoServer;
    let catwayNumber;
    let consoleErrorMock;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {}); // Mock pour éviter les logs dans le test

        // Crée un catway pour tester la récupération des détails
        const catway = new Catway({
            type: "short",
            catwayState: "En bon état",
            catwayNumber: 1,
        });

        await catway.save();
        catwayNumber = catway.catwayNumber;
    });

    afterEach(() => {
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait récupérer les détails d'un catway existant", async function () {
        const res = await request(app)
            .get(`/dashboard/catway-details/${catwayNumber}`);

        assert.strictEqual(res.status, 200);
        const data = res.body;

        assert.strictEqual(data.type, "short");
        assert.strictEqual(data.catwayState, "En bon état");
    });

    it("devrait renvoyer une erreur si le catway n'existe pas", async function () {
        const nonExistentCatwayNumber = 9999; // Catway inexistant

        const res = await request(app)
            .get(`/dashboard/catway-details/${nonExistentCatwayNumber}`);

        assert.strictEqual(res.status, 404);
        const data = res.body;

        assert.strictEqual(data.error, "Catway non trouvé.");
    });
});

describe('Tests pour l\'enregistrement d\'une réservation', function() {
    let server;
    let mongoServer;
    let consoleErrorMock;
    let validCatway;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});

        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // 🔹 Ajout d'un catway valide pour le test
        validCatway = await Catway.create({ catwayNumber: 1, type: "long", catwayState: "Mauvais état" });
    });

    afterEach(async function () {
        await Reservation.deleteMany({});
        await Catway.deleteMany({});
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

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

        assert.strictEqual(res.status, 302); // Redirection après enregistrement

        // Vérifie que la réservation a bien été enregistrée
        const reservation = await Reservation.findOne({ catwayNumber: reservationData.catwayNumber });
        assert(reservation);
        assert.strictEqual(reservation.clientName, reservationData.clientName);
        assert.strictEqual(reservation.boatName, reservationData.boatName);
    });

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

        assert.strictEqual(res.status, 302); // Redirection

        // 🔹 Vérifie que le message d'erreur est bien stocké dans la session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Numéro de catway invalide."));
    });

    it("devrait retourner une erreur si le numéro de catway n'existe pas", async function () {
        const reservationData = {
            catwayNumber: 9999, // Numéro de catway qui n'existe pas
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        };

        const res = await request(app)
            .post("/dashboard/save-reservation")
            .set("cookie", `token=${authToken}`)
            .send(reservationData);

        assert.strictEqual(res.status, 302); // Redirection

        // 🔹 Vérifie que le message d'erreur est bien stocké dans la session
        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Ce numéro de catway n&#39;existe pas."));
    });
});

describe("Tests pour la suppression d'une réservation", function () {
    let server;
    let mongoServer;
    let consoleErrorMock;
    let validReservation;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});

        const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        validReservation = await Reservation.create({
            catwayNumber: 1,
            clientName: "Jean Dupont",
            boatName: "Bateau A",
            checkIn: "2025-02-18",
            checkOut: "2025-02-20",
        });
    });

    afterEach(async function () {
        await Reservation.deleteMany({});
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    it("devrait supprimer une réservation avec un ID valide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: validReservation._id });

        assert.strictEqual(res.status, 302);

        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Réservation supprimée avec succès !"));

        const reservation = await Reservation.findById(validReservation._id);
        assert.strictEqual(reservation, null);
    });

    it("devrait retourner une erreur si l'ID est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: "invalid_id" });

        assert.strictEqual(res.status, 302);

        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("L&#39;ID de la réservation fourni est invalide."));
    });

    it("devrait retourner une erreur si la réservation n'existe pas", async function () {
        const res = await request(app)
            .post("/dashboard/delete-reservation")
            .set("cookie", `token=${authToken}`)
            .send({ reservationId: new mongoose.Types.ObjectId() });

        assert.strictEqual(res.status, 302);

        const sessionData = res.headers["set-cookie"][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Réservation non trouvée."));
    });
});

describe("Tests pour l'affichage des détails d'une réservation", function () {
    let server;
    let mongoServer;
    let testReservation;

    before(async function () {
        this.timeout(10000);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        server = app.listen(3001);
    });

    beforeEach(async function () {
        // Création d'un catway et d'une réservation valide
        const testCatway = await Catway.create({ catwayNumber: 1, type: "long", catwayState: "Bon état" });

        testReservation = await Reservation.create({
            catwayNumber: testCatway.catwayNumber,
            clientName: "Jean Dupont",
            boatName: "Le Voyageur",
            checkIn: new Date("2025-02-18"),
            checkOut: new Date("2025-02-20"),
        });
    });

    afterEach(async function () {
        await Reservation.deleteMany({});
        await Catway.deleteMany({});
    });

    after(async function () {
        if (server) await server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    it("devrait afficher les détails d'une réservation existante", async function () {
        const res = await request(app).get(`/dashboard/reservation-details/${testReservation._id}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.catwayNumber, testReservation.catwayNumber);
        assert.strictEqual(res.body.clientName, testReservation.clientName);
        assert.strictEqual(res.body.boatName, testReservation.boatName);
        assert.strictEqual(new Date(res.body.checkIn).toISOString(), testReservation.checkIn.toISOString());
        assert.strictEqual(new Date(res.body.checkOut).toISOString(), testReservation.checkOut.toISOString());
    });

    it("devrait retourner une erreur si la réservation n'existe pas", async function () {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/dashboard/reservation-details/${fakeId}`);

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, "Réservation non trouvée.");
    });
});
