const mongoose = require("mongoose");
require("dotenv").config({ path: "./env/.env" });

const clientOptions = {
  useNewUrlParser: true,
  dbName: "port_plaisance",
};

exports.initClientDbConnection = async () => {
  try {
    console.log("MongoDB URI:", process.env.URL_MONGO);
    await mongoose.connect(process.env.URL_MONGO, clientOptions);
    console.log("connected");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
