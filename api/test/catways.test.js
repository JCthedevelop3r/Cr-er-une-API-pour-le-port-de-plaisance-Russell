const assert = require("assert");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Catway = require("../models/catway");
const jwt = require("jsonwebtoken");

describe("Tests pour la liste des catways", function () {
  let server;
  let mongoServer;
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

    // Création d'un token d'authentification
    const testUser = { _id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@example.com" };
    authToken = jwt.sign({ userId: testUser._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
  });

  beforeEach(async function () {
    await Catway.create([
      { catwayNumber: 1, type: "long", catwayState: "Bon état" },
      { catwayNumber: 2, type: "short", catwayState: "Excellent" },
      { catwayNumber: 3, type: "long", catwayState: "Mauvais état" },
    ]);
  });

  afterEach(async function () {
    await Catway.deleteMany({});
  });

  after(async function () {
    if (server) await server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  it("devrait lister tous les catways disponibles", async function () {
    const res = await request(app)
      .get("/catways")
      .set("cookie", `token=${authToken}`)
      .send();

    assert.strictEqual(res.status, 200);
    assert(res.text.includes("1"));
    assert(res.text.includes("2"));
    assert(res.text.includes("3"));
  });
});
