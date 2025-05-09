const API_URL= 'http://localhost:5678/api' //url de base de l'API

document.getElementById("loginForm").addEventListener("submit", function (event) { // *écouteur d'événement pour le formulaire de connexion
    event.preventDefault(); // Empêche le rechargement de la page
    const email = document.getElementById("email").value; // *Récupère la valeur de l'email de l'input
    const password = document.getElementById("password").value; // *Récupère la valeur du mot de passe de l'input
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";    //Nettoie les messages d'erreur précédents

    // Envoi des informations de connexion
    fetch(`${API_URL}/users/login`, { // *Envoie une requête POST à l'API pour la connexion
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }) // *Convertit les données en JSON
    })
        .then(response => {   // Vérifiez le statut de la réponse
            if (response.ok) {
                return response.json(); // Si le statut est `200 OK`, on convertit la réponse en JSON
            } else {
                // Si le statut n'est pas `200 OK`, on déclenche une erreur
                throw new Error("E-mail ou mot de passe incorrect.");
            }
        })
        .then(data => {
            // * Vérifiez que le token et l'userId existent dans la réponse
            if (data.token && data.userId) {
                localStorage.setItem("authToken", data.token); // *Stocker le token dans localstorage pour les actions futures
                window.location='/'
            } else {
                errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe."; // Affiche un message d'erreur si le token ou l'userId n'existe pas
            }
        })
        .catch(error => {
            // Gestion des erreurs
            console.error("Erreur :", error);
            errorMessage.textContent = error.message || "Une erreur est survenue. Veuillez réessayer plus tard.";
        });
});