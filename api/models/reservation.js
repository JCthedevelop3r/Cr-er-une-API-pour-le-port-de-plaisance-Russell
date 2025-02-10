const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Reservation = new Schema(
  {
    catwayNumber: {
      type: Number,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    boatName: {
      type: String,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "checkIn", updatedAt: false },
  }
);

module.exports = mongoose.model("Reservation", Reservation);
