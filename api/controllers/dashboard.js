const Reservation = require("../models/reservation");
const userService = require("../services/user");
const dashboardService = require("../services/dashboard");
const catwaysService = require("../services/catways");

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!name || !email || !password) {
      throw new Error("Tous les champs doivent être remplis.");
    }

    // Appeler le service pour créer l'utilisateur
    await userService.createUser(name, email, password);

    // Redirection après création réussie
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error.message);
    
    req.session.errorCreateUser = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorCreateUser = null;
        req.session.save();
      }, 10000);
    });

    res.redirect("/dashboard");
  }
}

async function updateUser(req, res) {
  try {
    const { userId, name, email } = req.body;

    // Vérifier que tous les champs nécessaires sont présents
    if (!userId || !name || !email) {
      throw new Error("Tous les champs doivent être remplis.");
    }

    // Appeler le service pour mettre à jour l'utilisateur
    await userService.updateUser(userId, name, email);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error.message);
    
    req.session.errorUpdateUser = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorUpdateUser = null;
        req.session.save();
      }, 10000);
    });

    res.redirect("/dashboard");
  }
}

async function deleteUser(req, res) {
  try {
    const { userId, name, email } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!userId || !name || !email) {
      throw new Error("Tous les champs doivent être remplis")
    }

    // Appeler le service pour supprimer l'utilisateur
    await userService.deleteUser(userId);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);

    req.session.errorDeleteUser = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorDeleteUser = null;
        req.session.save();
      }, 10000);
    });

    res.redirect("/dashboard");
  }
}


async function createCatway(req, res) {
  try {
    const { type, catwayState } = req.body;

    // Vérifier que les champs nécessaires sont fournis
    if (!type || !catwayState) {
      throw new Error("Le type du catway et la description de l'état du catway sont requis.")
    }

    // Appeler le service pour créer le catway
    await dashboardService.createCatway(type, catwayState);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erreur lors de la création du catway :", error);

    req.session.errorCreateCatway = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorCreateCatway = null;
        req.session.save();
      }, 10000);
    });  

    res.redirect("/dashboard");
  }
}

async function getNextCatwayNumber(req, res) {
  try {
    const nextCatwayNumber = await dashboardService.getNextCatwayNumber();
    res.json({ nextCatwayNumber }); // Retourne le numéro dans une réponse JSON
  } catch (error) {
    console.error("Erreur serveur : ", error)
    res.status(500).send("Erreur serveur");
  }
}

async function updateCatwayState(req, res) {
  try {
    const { catwayId, catwayState } = req.body;

    if (!catwayId || !catwayState) {
      throw new Error("Tous les champs sont requis.");
    }

    await dashboardService.updateCatwayState(catwayId, catwayState);

    res.redirect("/dashboard");
  } catch (error) {
    req.session.errorUpdateCatway = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorUpdateCatway = null;
        req.session.save();
      }, 10000);
    });  

    res.redirect("/dashboard");
  }
}

async function deleteCatway(req, res) {
  try {
    const { catwayNumber } = req.body;

    const numCatway = Number(catwayNumber);
    if (isNaN(numCatway)) {
      throw new Error("Numéro de catway invalide.");
    }

    if (!catwayNumber) {
      throw new Error("Numéro du catway requis.")
    }

    await dashboardService.deleteCatway(catwayNumber);

    res.redirect("/dashboard");
  } catch (error) {
    req.session.errorDeleteCatway = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorDeleteCatway = null;
        req.session.save();
      }, 10000);
    });  

    res.redirect("/dashboard");
  }
}

async function getCatwayDetails(req, res) {
  try {
    const { catwayNumber } = req.params;

    const catwayDetails = await dashboardService.getCatwayDetails(catwayNumber);
    res.json(catwayDetails);
  } catch (error) {
    res.status(404).json({ error: "Catway non trouvé" });
  }
}

async function saveReservation(req, res) {
  try {
    await dashboardService.createReservation(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    req.session.errorSaveReservation = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorSaveReservation = null;
        req.session.save();
      }, 10000);
    });  

    res.redirect("/dashboard");
  }
}

async function deleteReservation(req, res) {
  try {
    await dashboardService.deleteReservation(req.body.reservationId);
    res.redirect("/dashboard");
  } catch (error) {
    req.session.errorDeleteReservation = error.message;

    req.session.save(() => {
      setTimeout(() => {
        req.session.errorDeleteReservation = null;
        req.session.save();
      }, 10000);
    });  

    res.redirect("/dashboard");
  }
}

async function displayReservationDetails(req, res) {
  try {
    const reservationDetails = await dashboardService.getReservationDetails(req.params.reservationId);
    res.json(reservationDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  createCatway,
  getNextCatwayNumber,
  updateCatwayState,
  deleteCatway,
  getCatwayDetails,
  saveReservation,
  deleteReservation,
  displayReservationDetails,
};
