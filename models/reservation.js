const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Reservation = new Schema(
  {
    catwayNumber: {
      type: String,
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
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
