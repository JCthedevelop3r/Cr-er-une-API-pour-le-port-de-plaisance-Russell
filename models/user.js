const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Le nom est requis"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Le nom est requis"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
