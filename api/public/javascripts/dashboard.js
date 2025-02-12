document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/dashboard") {
        getNextCatwayNumber();
        displayCatwayDetails();
        displayReservationDetails();
    }
});

// Récupère dynamiquement le prochain numéro de catway
async function getNextCatwayNumber() {
    try {
        const response = await fetch("/dashboard/next-catway-number");
        const data = await response.json();
        document.getElementById("catwayNumberCc").value = data.nextCatwayNumber;
    } catch (error) {
        console.error("Erreur lors de la récupération du numéro de catway :", error);
    }
}

// Affiche les détails du catway sélectionné
function displayCatwayDetails() {
    const catwayNumberDropdown = document.getElementById("catwayNumberDcd");
    
    if (catwayNumberDropdown) {
        catwayNumberDropdown.addEventListener("change", async function () {
            const catwayNumber = this.value;

            try {
                const response = await fetch(`/dashboard/catway-details/${encodeURIComponent(catwayNumber)}`);
                const data = await response.json();
                document.getElementById("catwayTypeDcd").innerText = data.error ? "Non trouvé." : data.type;
                document.getElementById("catwayStateDcd").innerText = data.error ? "Non trouvé." : data.catwayState;
                document.querySelector(".error-message-dcd").innerText = data.error ? "Catway non trouvé." : null;
            } catch (error) {
                console.error("Erreur récupération catway:", error);
            }
        });
    } else {
        console.warn("L'élément #catwayNumberDcd n'existe pas sur cette page.");
    }
}

// Affiche les détails de la réservation sélectionnée
function displayReservationDetails() {
    const reservationDropdown = document.getElementById("reservationIdDrd");

    if (reservationDropdown) {
        reservationDropdown.addEventListener("change", async function () {
            const reservationId = this.value;

            if (reservationId) {
                try {
                    const response = await fetch(`/dashboard/reservation-details/${reservationId}`);
                    const data = await response.json();

                    document.getElementById("catwayNumberDrd").textContent = data.error ? "Non trouvé." : data.catwayNumber;
                    document.getElementById("clientNameDrd").textContent = data.error ? "Non trouvé." : data.clientName;
                    document.getElementById("boatNameDrd").textContent = data.error ? "Non trouvé." : data.boatName;
                    document.getElementById("checkInDrd").textContent = data.error ? "Non trouvé." : new Date(data.checkIn).toLocaleDateString("fr-FR");
                    document.getElementById("checkOutDrd").textContent = data.error ? "Non trouvé." : new Date(data.checkOut).toLocaleDateString("fr-FR");
                    document.querySelector(".error-message-drd").textContent = data.error ? "Réservation non trouvé." : null;

                } catch (error) {
                    console.error("Erreur lors de la récupération des détails de la réservation", error);
                }
            }
        });
    } else {
        console.warn("L'élément #reservationIdDrd n'existe pas sur cette page.");
    }
}
