const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);
