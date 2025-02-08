if (window.location.pathname == "/") {
    function storeToken(token) {
        localStorage.setItem("token", token);
        alert("Connexion réussie !");
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("login-form");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!form) return;

        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Empêche le rechargement de la page

            const email = emailInput.value;
            const password = passwordInput.value;

            // Envoi des informations de l'utilisateur au serveur
            fetch('/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Si un token est retourné, le stocker dans localStorage
                    storeToken(data.token);
                } else {
                    alert('Erreur de connexion');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Une erreur est survenue');
            });
        });
    });
}
