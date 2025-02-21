document.addEventListener("DOMContentLoaded", function () {
  const btnCreateUser = document.querySelector(".btn-form-create-user");
  const btnUpdateUser = document.querySelector(".btn-form-update-user");
  const btnDeleteUser = document.querySelector(".btn-form-delete-user");
  const btnCreateCatway = document.querySelector(".btn-form-create-catway");
  const btnUpdateCatwayState = document.querySelector(
    ".btn-form-update-catway-state"
  );
  const btnDeleteCatway = document.querySelector(".btn-form-delete-catway");
  const btnDisplayCatwayDetails = document.querySelector(
    ".btn-form-display-catway-details"
  );
  const btnSaveReservation = document.querySelector(
    ".btn-form-save-reservation"
  );
  const btnDeleteReservation = document.querySelector(
    ".btn-form-delete-reservation"
  );
  const btnDisplayReservationDetails = document.querySelector(
    ".btn-form-display-details-reservation"
  );

  const createUserForm = document.getElementById("createUserForm");
  const updateUserForm = document.getElementById("updateUserForm");
  const deleteUserForm = document.getElementById("deleteUserForm");
  const createCatwayForm = document.getElementById("createCatwayForm");
  const updateCatwayStateForm = document.getElementById(
    "updateCatwayStateForm"
  );
  const deleteCatwayForm = document.getElementById("deleteCatwayForm");
  const displayCatwayDetailsForm = document.getElementById(
    "displayCatwayDetailsForm"
  );
  const saveReservationForm = document.getElementById("saveReservationForm");
  const deleteReservationForm = document.getElementById(
    "deleteReservationForm"
  );
  const displayReservationDetailsForm = document.getElementById(
    "displayReservationDetailsForm"
  );

  function ScrollToCreateUserForm() {
    btnCreateUser.addEventListener("click", function () {
      createUserForm.scrollIntoView({ behavior: "smooth" });
      createUserForm.style.backgroundColor = "green";
      setTimeout(() => {
        createUserForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToUpdateUserForm() {
    btnUpdateUser.addEventListener("click", function () {
      updateUserForm.scrollIntoView({ behavior: "smooth" });
      updateUserForm.style.backgroundColor = "green";
      setTimeout(() => {
        updateUserForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToDeleteUserForm() {
    btnDeleteUser.addEventListener("click", function () {
      deleteUserForm.scrollIntoView({ behavior: "smooth" });
      deleteUserForm.style.backgroundColor = "green";
      setTimeout(() => {
        deleteUserForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToCreateCatwayForm() {
    btnCreateCatway.addEventListener("click", function () {
      createCatwayForm.scrollIntoView({ behavior: "smooth" });
      createCatwayForm.style.backgroundColor = "green";
      setTimeout(() => {
        createCatwayForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToUpdateCatwayStateForm() {
    btnUpdateCatwayState.addEventListener("click", function () {
      updateCatwayStateForm.scrollIntoView({ behavior: "smooth" });
      updateCatwayStateForm.style.backgroundColor = "green";
      setTimeout(() => {
        updateCatwayStateForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToDeleteCatwayForm() {
    btnDeleteCatway.addEventListener("click", function () {
      deleteCatwayForm.scrollIntoView({ behavior: "smooth" });
      deleteCatwayForm.style.backgroundColor = "green";
      setTimeout(() => {
        deleteCatwayForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToDisplayCatwayDetailsForm() {
    btnDisplayCatwayDetails.addEventListener("click", function () {
      displayCatwayDetailsForm.scrollIntoView({ behavior: "smooth" });
      displayCatwayDetailsForm.style.backgroundColor = "green";
      setTimeout(() => {
        displayCatwayDetailsForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToSaveReservationForm() {
    btnSaveReservation.addEventListener("click", function () {
      saveReservationForm.scrollIntoView({ behavior: "smooth" });
      saveReservationForm.style.backgroundColor = "green";
      setTimeout(() => {
        saveReservationForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToDeleteReservationForm() {
    btnDeleteReservation.addEventListener("click", function () {
      deleteReservationForm.scrollIntoView({ behavior: "smooth" });
      deleteReservationForm.style.backgroundColor = "green";
      setTimeout(() => {
        deleteReservationForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  function ScrollToDisplayReservationDetailsForm() {
    btnDisplayReservationDetails.addEventListener("click", function () {
      displayReservationDetailsForm.scrollIntoView({ behavior: "smooth" });
      displayReservationDetailsForm.style.backgroundColor = "green";
      setTimeout(() => {
        displayReservationDetailsForm.style.backgroundColor = "";
      }, 2000);
    });
  }

  ScrollToCreateUserForm();
  ScrollToUpdateUserForm();
  ScrollToDeleteUserForm();
  ScrollToCreateCatwayForm();
  ScrollToUpdateCatwayStateForm();
  ScrollToDeleteCatwayForm();
  ScrollToDisplayCatwayDetailsForm();
  ScrollToSaveReservationForm();
  ScrollToDeleteReservationForm();
  ScrollToDisplayReservationDetailsForm();
});
