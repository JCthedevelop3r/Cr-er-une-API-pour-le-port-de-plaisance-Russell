const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
    },
    email: {
      type: String,
      required: [true, "Le nom est requis"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
