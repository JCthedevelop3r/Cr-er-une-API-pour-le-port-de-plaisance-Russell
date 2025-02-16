const request = require("supertest");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const sinon = require("sinon");

describe("Tests pour la création d'un utilisateur", function () {
    let server;
    let authToken;
    let mongoServer;
    let consoleErrorMock;

    before(async function () {
        this.timeout(10000);
    
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); // Ferme toute connexion existante
        }
    
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    
        server = app.listen(3001);

        authToken = jwt.sign({ userId: "fakeUserId" }, process.env.SECRET_KEY, { expiresIn: "24h" });
    });
    

    beforeEach(async function () {
        await User.deleteMany({});

        const user = new User({
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        });
        await user.save();
        
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    afterEach(() => {
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); // Vérifie si `server` est bien défini avant de le fermer
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); // Vérifie si `mongoServer` est bien défini avant de le stopper
    });

    it("devrait créer un utilisateur avec des données valides", async function () {
        const res = await request(app)
            .post("/dashboard/create-user")
            .set("Cookie", `token=${authToken}`)
            .send({ name: "Jean Dupont", email: "jean@example.com", password: "1234" });

        assert.strictEqual(res.status, 302); // Redirection après succès
        const user = await User.findOne({ email: "jean@example.com" });
        assert.ok(user);
    });

    it("ne doit pas créer un utilisateur avec un email déjà utilisé", async function () {
        // Crée un premier utilisateur
        await request(app)
            .post("/dashboard/create-user")
            .set("Cookie", `token=${authToken}`)
            .send({ name: "Jean Dupont", email: "jean@example.com", password: "1234" });
    
        // Essaye de créer un deuxième utilisateur avec le même email
        const res = await request(app)
            .post("/dashboard/create-user")
            .set("Cookie", `token=${authToken}`)
            .send({ name: "Jean Dupont", email: "jean@example.com", password: "1234" });
    
        // Vérifie la redirection
        assert.strictEqual(res.status, 302); // Redirection après erreur
    
        // Accéder à la session d'erreur directement et vérifier le message
        const sessionData = res.headers['set-cookie'][0]; // Accéder au cookie de session
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData) // Utiliser le cookie pour récupérer la session
            .send();
    
        assert(pageContent.text.includes("Un utilisateur avec cet email existe déjà.")); // Vérifie si l'erreur est présente dans le texte
    });
    
    

    it("ne doit pas permettre la création d'un utilisateur sans token", async function () {
        const res = await request(app)
            .post("/dashboard/create-user")
            .send({ name: "Sans Token", email: "sans.token@example.com", password: "1234" });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.text, "Accès non autorisé, token manquant");
    });
});

describe('Tests pour la mise à jour d\'un utilisateur', function() {
    let server;
    let mongoServer;
    let consoleErrorMock;
    let testUser;

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
        await User.deleteMany({});

        testUser = new User({
            name: "Utilisateur Test",
            email: "testuser@example.com",
            password: "password123"
        });

        await testUser.save();
        
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    afterEach(() => {
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait mettre à jour un utilisateur existant", async function () {
        const updatedData = {
            userId: testUser._id.toString(),
            name: "Utilisateur Modifié",
            email: "updated@example.com"
        };

        const res = await request(app)
            .post("/dashboard/update-user")
            .send(updatedData);

        assert.strictEqual(res.status, 302); // Redirection après succès

        // Vérifier si les données ont bien été mises à jour en base
        const updatedUser = await User.findById(testUser._id);
        assert.strictEqual(updatedUser.name, "Utilisateur Modifié");
        assert.strictEqual(updatedUser.email, "updated@example.com");
    });

    it("devrait renvoyer une erreur si l'ID utilisateur est invalide", async function () {
        const updatedData = {
            userId: "id_invalide",
            name: "Nouvelle Valeur",
            email: "new@example.com"
        };
    
        const res = await request(app)
            .post("/dashboard/update-user")
            .send(updatedData);
    
        assert.strictEqual(res.status, 302);
    
        // Récupérer la session après la redirection
        const sessionData = res.headers["set-cookie"][0]; // Récupère les cookies de session
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData) // Utilise le cookie de session pour accéder aux erreurs
            .send();

        assert(pageContent.text.includes("L&#39;ID utilisateur fourni est invalide.")); // Vérifie le message d'erreur
    });
    

    it("devrait renvoyer un message d'erreur si l'utilisateur n'existe pas", async function () {
        const fakeUserId = new mongoose.Types.ObjectId().toString(); // Génère un ObjectId valide mais inexistant
    
        const res = await request(app)
            .post("/dashboard/update-user")
            .send({ userId: fakeUserId, name: "Nouveau Nom", email: "newemail@example.com" });
    
        assert.strictEqual(res.status, 302); // Redirection après erreur
    
        // Vérifier si le message d'erreur est bien affiché sur la page
        const sessionData = res.headers["set-cookie"][0]; // Récupérer la session
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();
    
        assert(pageContent.text.includes("Utilisateur non trouvé."));
    });
});

describe('Tests pour la suppression d\'un utilisateur', function() {
    let server;
    let mongoServer;
    let testUser;
    let consoleErrorMock;
    let authToken;

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
        await User.deleteMany({});

        // Crée un utilisateur pour les tests
        testUser = new User({
            name: "Utilisateur à supprimer",
            email: "user.delete@example.com",
            password: "password123"
        });

        await testUser.save();

        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
        
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    afterEach(() => {
        consoleErrorMock.restore();
    });

    after(async function () {
        if (server) await server.close(); 
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); 
    });

    it("devrait supprimer un utilisateur existant", async function () {
        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: testUser._id.toString() });

        // Vérifie la redirection (si la suppression est réussie)
        assert.strictEqual(res.status, 302);

        // Vérifie si l'utilisateur a bien été supprimé de la base de données
        const deletedUser = await User.findById(testUser._id);
        assert.strictEqual(deletedUser, null); // L'utilisateur ne doit plus exister
    });

    it("devrait renvoyer une erreur si l'ID utilisateur est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: "invalidId" }); // ID invalide

        assert.strictEqual(res.status, 302); // Redirection attendue en cas d'erreur

        // Vérifie que le message d'erreur est bien dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("L&#39;ID utilisateur fourni est invalide"));
    });

    it("devrait renvoyer une erreur si l'utilisateur n'existe pas", async function () {
        const nonExistentUserId = new mongoose.Types.ObjectId(); // ID qui n'existe pas en base

        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: nonExistentUserId.toString() });

        assert.strictEqual(res.status, 302); // Redirection attendue en cas d'erreur

        // Vérifie que le message d'erreur est bien dans la session
        const sessionData = res.headers['set-cookie'][0];
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Utilisateur non trouvé."));
    });
});
