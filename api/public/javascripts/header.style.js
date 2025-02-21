document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('reservations-button');
    var dropdown = document.getElementById('dropdown-content');

    button.addEventListener('click', function() {
      dropdown.classList.toggle('show');
    });

    // Fermer le dropdown si l'utilisateur clique en dehors de celui-ci
    window.addEventListener('click', function(event) {
      if (!event.target.matches('#reservations-button')) {
        if (dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
        }
      }
    });
  });