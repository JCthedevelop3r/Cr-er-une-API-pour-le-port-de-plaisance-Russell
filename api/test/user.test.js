const request = require("supertest");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const sinon = require("sinon");

/**
 * Tests pour la création d'un utilisateur.
 * Ce groupe de tests couvre les fonctionnalités liées à la création d'un utilisateur, incluant la gestion des erreurs comme 
 * l'email déjà utilisé et l'absence de token d'authentification.
 */
describe("Tests pour la création d'un utilisateur", function () {
    let server;              // Serveur de l'application pour les tests
    let authToken;           // Token d'authentification pour les requêtes
    let mongoServer;         // Serveur Mongo en mémoire pour les tests
    let consoleErrorMock;    // Simulation de la méthode console.error pour éviter les logs dans les tests

    /**
     * Fonction exécutée avant tous les tests.
     * Elle prépare l'environnement en initialisant la base de données en mémoire et en générant un token d'authentification.
     * @async
     */
    before(async function () {
        this.timeout(10000); // Augmente le délai d'attente des tests à 10 secondes
    
        // Si une connexion Mongo existante existe, on la déconnecte
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect(); 
        }
    
        // Initialise un serveur Mongo en mémoire
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        // Se connecte à la base de données en mémoire
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    
        // Démarre le serveur de l'application sur le port 3001 pour les tests
        server = app.listen(3001);

        // Crée un token JWT d'authentification pour les requêtes
        authToken = jwt.sign({ userId: "fakeUserId" }, process.env.SECRET_KEY, { expiresIn: "24h" });
    });

    /**
     * Fonction exécutée avant chaque test.
     * Elle supprime les utilisateurs existants et crée un nouvel utilisateur pour les tests.
     * @async
     */
    beforeEach(async function () {
        await User.deleteMany({}); // Supprime tous les utilisateurs précédemment créés

        // Crée un utilisateur de test
        const user = new User({
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        });
        await user.save();
        
        // Simule la méthode console.error pour éviter l'affichage de logs dans les tests
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    /**
     * Fonction exécutée après chaque test.
     * Elle restaure la méthode console.error.
     */
    afterEach(() => {
        consoleErrorMock.restore(); // Restaure la méthode console.error
    });

    /**
     * Fonction exécutée après tous les tests.
     * Elle ferme la connexion à la base de données et arrête le serveur en mémoire.
     * @async
     */
    after(async function () {
        if (server) await server.close(); // Vérifie si `server` est bien défini avant de le fermer
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop(); // Vérifie si `mongoServer` est bien défini avant de le stopper
    });

    /**
     * Test pour la création d'un utilisateur avec des données valides.
     * Vérifie que l'utilisateur est correctement créé dans la base de données.
     */
    it("devrait créer un utilisateur avec des données valides", async function () {
        const res = await request(app)
            .post("/dashboard/create-user")
            .set("Cookie", `token=${authToken}`) // Envoie le token d'authentification avec la requête
            .send({ name: "Jean Dupont", email: "jean@example.com", password: "1234" });

        assert.strictEqual(res.status, 302); // Vérifie la redirection après succès
        const user = await User.findOne({ email: "jean@example.com" }); // Recherche l'utilisateur en base
        assert.ok(user); // Vérifie si l'utilisateur a bien été créé
    });

    /**
     * Test pour la tentative de création d'un utilisateur avec un email déjà utilisé.
     * Vérifie que le système ne permet pas la création de deux utilisateurs avec le même email.
     */
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
    
        // Vérifie la redirection après erreur
        assert.strictEqual(res.status, 302); // Vérifie la redirection après erreur
    
        // Accède à la session d'erreur et vérifie le message d'erreur
        const sessionData = res.headers['set-cookie'][0]; 
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();
    
        // Vérifie que le message d'erreur est bien affiché sur la page
        assert(pageContent.text.includes("Un utilisateur avec cet email existe déjà."));
    });

    /**
     * Test pour la création d'un utilisateur sans token d'authentification.
     * Vérifie que le système retourne une erreur 401 si le token est manquant.
     */
    it("ne doit pas permettre la création d'un utilisateur sans token", async function () {
        const res = await request(app)
            .post("/dashboard/create-user")
            .send({ name: "Sans Token", email: "sans.token@example.com", password: "1234" });

        assert.strictEqual(res.status, 401); // Vérifie que le statut est 401 (Accès non autorisé)
        assert.strictEqual(res.text, "Accès non autorisé, token manquant"); // Vérifie que le message d'erreur est correct
    });
});

/**
 * Tests pour la mise à jour d'un utilisateur.
 * Ce groupe de tests vérifie les différentes conditions liées à la modification des informations d'un utilisateur.
 */
describe("Tests pour la mise à jour d'un utilisateur", function () {
    let server;              // Serveur de test
    let mongoServer;         // Serveur MongoDB en mémoire
    let consoleErrorMock;    // Stub pour intercepter les erreurs de console
    let testUser;            // Utilisateur de test

    /**
     * Avant tous les tests, initialisation du serveur et connexion à la base de données en mémoire.
     * @async
     */
    before(async function () {
        this.timeout(10000); // Définit un délai d'attente de 10 secondes pour éviter les erreurs de timeout

        // Déconnexion si une connexion MongoDB existe déjà
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
    });

    /**
     * Avant chaque test, suppression des utilisateurs et création d'un utilisateur de test.
     * @async
     */
    beforeEach(async function () {
        await User.deleteMany({}); // Supprime tous les utilisateurs existants

        // Création d'un utilisateur de test
        testUser = new User({
            name: "Utilisateur Test",
            email: "testuser@example.com",
            password: "password123"
        });

        await testUser.save(); // Sauvegarde l'utilisateur dans la base

        // Stub pour intercepter et masquer les erreurs console.error dans les tests
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    /**
     * Après chaque test, restaure la méthode console.error.
     */
    afterEach(() => {
        consoleErrorMock.restore(); // Restaure la méthode console.error
    });

    /**
     * Après tous les tests, fermeture du serveur et de la connexion à la base de données.
     * @async
     */
    after(async function () {
        if (server) await server.close(); // Vérifie si le serveur existe avant de le fermer
        await mongoose.connection.close(); // Ferme la connexion à la base de données
        if (mongoServer) await mongoServer.stop(); // Vérifie si le serveur Mongo en mémoire existe avant de l'arrêter
    });

    /**
     * Test de la mise à jour d'un utilisateur existant.
     * Vérifie que les données d'un utilisateur peuvent être mises à jour correctement.
     */
    it("devrait mettre à jour un utilisateur existant", async function () {
        const updatedData = {
            userId: testUser._id.toString(),
            name: "Utilisateur Modifié",
            email: "updated@example.com"
        };

        const res = await request(app)
            .post("/dashboard/update-user")
            .send(updatedData);

        assert.strictEqual(res.status, 302); // Vérifie que la requête aboutit à une redirection

        // Vérification que les données ont bien été mises à jour en base
        const updatedUser = await User.findById(testUser._id);
        assert.strictEqual(updatedUser.name, "Utilisateur Modifié");
        assert.strictEqual(updatedUser.email, "updated@example.com");
    });

    /**
     * Test de la mise à jour avec un ID utilisateur invalide.
     * Vérifie que le serveur renvoie une erreur et empêche la modification si l'ID est incorrect.
     */
    it("devrait renvoyer une erreur si l'ID utilisateur est invalide", async function () {
        const updatedData = {
            userId: "id_invalide",
            name: "Nouvelle Valeur",
            email: "new@example.com"
        };
    
        const res = await request(app)
            .post("/dashboard/update-user")
            .send(updatedData);
    
        assert.strictEqual(res.status, 302); // Vérifie que la requête est redirigée après une erreur
    
        // Récupérer les cookies de session après la redirection
        const sessionData = res.headers["set-cookie"][0]; 
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData) // Utiliser le cookie pour récupérer la session
            .send();

        // Vérifie que l'erreur s'affiche bien sur la page
        assert(pageContent.text.includes("L&#39;ID utilisateur fourni est invalide."));
    });

    /**
     * Test de la mise à jour d'un utilisateur inexistant.
     * Vérifie que le serveur renvoie un message d'erreur si l'utilisateur n'existe pas.
     */
    it("devrait renvoyer un message d'erreur si l'utilisateur n'existe pas", async function () {
        const fakeUserId = new mongoose.Types.ObjectId().toString(); // Génère un ObjectId valide mais inexistant
    
        const res = await request(app)
            .post("/dashboard/update-user")
            .send({ userId: fakeUserId, name: "Nouveau Nom", email: "newemail@example.com" });
    
        assert.strictEqual(res.status, 302); // Vérifie que la requête est redirigée après une erreur
    
        // Vérifie si le message d'erreur est bien affiché sur la page
        const sessionData = res.headers["set-cookie"][0]; 
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();
    
        assert(pageContent.text.includes("Utilisateur non trouvé."));
    });
});


/**
 * Tests pour la suppression d'un utilisateur.
 * Ce groupe de tests vérifie les différentes conditions liées à la suppression d'un utilisateur.
 */
describe("Tests pour la suppression d'un utilisateur", function () {
    let server;              // Serveur de test
    let mongoServer;         // Serveur MongoDB en mémoire
    let testUser;            // Utilisateur de test
    let consoleErrorMock;    // Stub pour intercepter les erreurs de console
    let authToken;           // Jeton d'authentification pour la requête

    /**
     * Avant tous les tests, initialisation du serveur et connexion à la base de données en mémoire.
     * @async
     */
    before(async function () {
        this.timeout(10000); // Définit un délai d'attente de 10 secondes pour éviter les erreurs de timeout

        // Déconnexion si une connexion MongoDB existe déjà
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
    });

    /**
     * Avant chaque test, suppression des utilisateurs et création d'un utilisateur de test.
     * Génération d'un token d'authentification valide.
     * @async
     */
    beforeEach(async function () {
        await User.deleteMany({}); // Supprime tous les utilisateurs existants

        // Création d'un utilisateur pour les tests
        testUser = new User({
            name: "Utilisateur à supprimer",
            email: "user.delete@example.com",
            password: "password123"
        });

        await testUser.save(); // Sauvegarde l'utilisateur dans la base

        // Génération d'un token d'authentification pour l'utilisateur de test
        authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Stub pour intercepter et masquer les erreurs console.error dans les tests
        consoleErrorMock = sinon.stub(console, "error").callsFake(() => {});
    });

    /**
     * Après chaque test, restaure la méthode console.error.
     */
    afterEach(() => {
        consoleErrorMock.restore(); // Restaure la méthode console.error
    });

    /**
     * Après tous les tests, fermeture du serveur et de la connexion à la base de données.
     * @async
     */
    after(async function () {
        if (server) await server.close(); // Vérifie si le serveur existe avant de le fermer
        await mongoose.connection.close(); // Ferme la connexion à la base de données
        if (mongoServer) await mongoServer.stop(); // Vérifie si le serveur Mongo en mémoire existe avant de l'arrêter
    });

    /**
     * Test de la suppression d'un utilisateur existant.
     * Vérifie que l'utilisateur est correctement supprimé de la base de données.
     */
    it("devrait supprimer un utilisateur existant", async function () {
        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: testUser._id.toString() });

        assert.strictEqual(res.status, 302); // Vérifie que la requête aboutit à une redirection

        // Vérification que l'utilisateur a bien été supprimé en base
        const deletedUser = await User.findById(testUser._id);
        assert.strictEqual(deletedUser, null); // L'utilisateur ne doit plus exister
    });

    /**
     * Test de la suppression avec un ID utilisateur invalide.
     * Vérifie que le serveur renvoie une erreur et empêche la suppression si l'ID est incorrect.
     */
    it("devrait renvoyer une erreur si l'ID utilisateur est invalide", async function () {
        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: "invalidId" }); // ID invalide

        assert.strictEqual(res.status, 302); // Vérifie que la requête est redirigée après une erreur

        // Récupérer les cookies de session après la redirection
        const sessionData = res.headers["set-cookie"][0]; 
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData) // Utiliser le cookie pour récupérer la session
            .send();

        // Vérifie que l'erreur s'affiche bien sur la page
        assert(pageContent.text.includes("L&#39;ID utilisateur fourni est invalide"));
    });

    /**
     * Test de la suppression d'un utilisateur inexistant.
     * Vérifie que le serveur renvoie un message d'erreur si l'utilisateur n'existe pas.
     */
    it("devrait renvoyer une erreur si l'utilisateur n'existe pas", async function () {
        const nonExistentUserId = new mongoose.Types.ObjectId(); // Génère un ObjectId valide mais inexistant

        const res = await request(app)
            .post("/dashboard/delete-user")
            .set("cookie", `token=${authToken}`)
            .send({ userId: nonExistentUserId.toString() });

        assert.strictEqual(res.status, 302); // Vérifie que la requête est redirigée après une erreur

        // Vérifie si le message d'erreur est bien affiché sur la page
        const sessionData = res.headers["set-cookie"][0]; 
        const pageContent = await request(app)
            .get("/dashboard")
            .set("Cookie", sessionData)
            .send();

        assert(pageContent.text.includes("Utilisateur non trouvé."));
    });
});

