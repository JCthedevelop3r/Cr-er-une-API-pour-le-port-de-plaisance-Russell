const mongoose = require("mongoose");
require("dotenv").config({ path: "./env/.env" });

const clientOptions = {
  useNewUrlParser: true,
  dbName: "port_plaisance",
};

exports.initClientDbConnection = async () => {
  try {
    await mongoose.connect(process.env.URL_MONGO, clientOptions);
    console.log("✅ Connexion MongoDB réussie !");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error);
    process.exit(1); // Arrête l'application en cas d'erreur
  }
};

/*exports.initClientDbConnection = async () => {
  try {
    await mongoose.connect(process.env.URL_MONGO, clientOptions, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connexion MongoDB réussie !");
  } catch (error) {
    console.log(error);
    throw error;
  }
};*/
