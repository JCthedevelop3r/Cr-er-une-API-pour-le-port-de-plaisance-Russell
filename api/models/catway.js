const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Catway = new Schema({
  catwayNumber: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  catwayState: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Catway", Catway);
