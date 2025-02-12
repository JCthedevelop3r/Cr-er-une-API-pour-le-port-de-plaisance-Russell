const Catway = require("../models/catway");
const Reservation = require("../models/reservation");
const mongoose = require("mongoose");

async function getNextCatwayNumber() {
    const lastCatway = await Catway.findOne().sort({ catwayNumber: -1 });
    return lastCatway ? lastCatway.catwayNumber + 1 : 1;
  }

async function createCatway(type, catwayState) {
    // Trouver le dernier catway pour incrémenter le numéro
    const nextCatwayNumber = await getNextCatwayNumber();
  
    // Créer un nouveau catway
    const newCatway = new Catway({
      catwayNumber: nextCatwayNumber,
      type,
      catwayState,
    });
  
    // Sauvegarder dans la base de données
    await newCatway.save();
  
    return newCatway;
  }

  async function updateCatwayState(catwayId, catwayState) {
    if (!mongoose.isValidObjectId(catwayId)) {
        throw new Error("L'ID du catway fourni est invalide.");
      }
  
    const updatedCatway = await Catway.findOneAndUpdate(
      { _id: catwayId },
      { catwayState: catwayState },
      { new: true }
    );
  
    if (!updatedCatway) {
      throw new Error("Catway non trouvé.");
    }
  
    return updatedCatway;
  }

  async function deleteCatway(catwayNumber) {
    const deletedCatway = await Catway.findOneAndDelete({ catwayNumber });
  
    if (!deletedCatway) {
      throw new Error("Catway non trouvé.");
    }
  
    return deletedCatway;
  }

  async function getCatwayDetails(catwayNumber) {
    const catway = await Catway.findOne({ catwayNumber });
  
    if (!catway) {
      throw new Error("Catway non trouvé.");
    }
  
    return {
      type: catway.type,
      catwayState: catway.catwayState,
    };
  }

  async function createReservation({ catwayNumber, clientName, boatName, checkIn, checkOut }) {
    const numCatway = Number(catwayNumber);
    if (isNaN(numCatway)) {
      throw new Error("Numéro de catway invalide.");
    }
    
    if (!catwayNumber || !clientName || !boatName || !checkIn || !checkOut) {
      throw new Error("Tous les champs sont requis.");
    }
  
    const newReservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      checkIn,
      checkOut,
    });
  
    await newReservation.save();
    return newReservation;
  }

  async function deleteReservation(reservationId) {
    if (!reservationId) {
      throw new Error("L'ID est requis.");
    }

    if (!mongoose.isValidObjectId(reservationId)) {
      throw new Error("L'ID de la réservation fourni est invalide.");
    }
  
    const deletedReservation = await Reservation.findByIdAndDelete(reservationId);
  
    if (!deletedReservation) {
      throw new Error("Réservation non trouvée.");
    }
  
    return deletedReservation;
  }

  async function getReservationDetails(reservationId) {
    if (!reservationId) {
      throw new Error("L'ID de la réservation est requis.");
    }
  
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error("Réservation non trouvée.");
    }
  
    return {
      catwayNumber: reservation.catwayNumber,
      clientName: reservation.clientName,
      boatName: reservation.boatName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
    };
  }

  module.exports = {
    createCatway,
    getNextCatwayNumber,
    updateCatwayState,
    deleteCatway,
    getCatwayDetails,
    createReservation,
    deleteReservation,
    getReservationDetails,
  };