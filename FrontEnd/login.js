const API_URL= 'http://localhost:5678/api'
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    // Nettoie les messages d'erreur précédents
    errorMessage.textContent = "";

    // Envoi des informations de connexion
    fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            // Vérifiez le statut de la réponse
            if (response.ok) {
                // La requête est réussie, donc on retourne la réponse JSON
                return response.json();
            } else {
                // Si le statut n'est pas `200 OK`, on déclenche une erreur
                throw new Error("E-mail ou mot de passe incorrect.");
            }
        })
        .then(data => {
            // Vérifiez que le token et l'userId existent dans la réponse
            if (data.token && data.userId) {
                // Stocke le token pour les actions futures
                localStorage.setItem("authToken", data.token);

                window.location='/'
            } else {
                // Si le token ou userId n'est pas présent, affiche un message d'erreur
                errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe.";
            }
        })
        .catch(error => {
            // Gestion des erreurs
            console.error("Erreur :", error);
            errorMessage.textContent = error.message || "Une erreur est survenue. Veuillez réessayer plus tard.";
        });
});