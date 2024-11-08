// URL de l'API pour récupérer les projets et les catégories
const apiURLWorks = 'http://localhost:5678/api/works';
const apiURLCategories = 'http://localhost:5678/api/categories';

// Fonction pour récupérer et afficher les projets
async function displayWorks() {
    try {
        // Appel à l'API pour récupérer les projets
        const workResponse = await fetch(apiURLWorks);

        // Vérifie si la requête a réussi
        if (!workResponse.ok) {
            throw new Error('Erreur lors de la récupération des projets');
        }

        // Convertit la réponse en format JSON
        const projets = await workResponse.json();
        console.log(projets)

        // Sélectionne l'élément de la galerie dans le DOM
        const galerie = document.querySelector('.gallery');

        // Vide le contenu statique de la galerie
        galerie.innerHTML = '';

        // Parcourt les projets récupérés et les ajoute à la galerie
        projets.forEach(project => {
            // Crée un élément figure pour chaque projet
            const figure = document.createElement('figure');

            // Crée l'image du projet
            const img = document.createElement('img');
            img.src = project.imageUrl; // Utilise l'URL de l'image depuis l'API
            img.alt = project.title; // Ajoute un texte alternatif avec le titre

            // Crée le titre du projet
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = project.title; // Affiche le titre du projet

            // Définir l'ID de la catégorie comme un attribut de l'élément figure
            figure.setAttribute('data-category-id', project.categoryId); // Utilise categoryId pour filtrer

            // Ajoute l'image et le titre à l'élément figure
            figure.appendChild(img);
            figure.appendChild(figcaption);

            // Ajoute la figure à la galerie
            galerie.appendChild(figure);
        });
    } catch (error) {
        console.error('Erreur:', error); // Affiche l'erreur dans la console
        const galerie = document.querySelector('.gallery');
        galerie.innerHTML = '<p>Une erreur est survenue lors de la récupération des projets.</p>';
    }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
    try {
        const categoriesResponse = await fetch(apiURLCategories);
        if (!categoriesResponse.ok) {
            throw new Error('Erreur lors de la récupération des catégories');
        }
        const categories = await categoriesResponse.json();
        return categories;
    } catch (error) {
        console.error('Erreur:', error); // Affiche l'erreur dans la console
    }
}

// Fonction pour afficher les filtres
async function displayFilters() {
    const categories = await getCategories(); // Récupère les catégories depuis l'API

    // Sélectionne l'élément categories dans le DOM
    const categoriesContainer = document.querySelector('.categories');

    // Vide le contenu statique de la liste de catégories
    categoriesContainer.innerHTML = '';

    // Parcourt les catégories récupérées et les ajoute dans le HTML
    categories.forEach(category => {
        // Crée un élément bouton pour chaque catégorie
        const categoryItem = document.createElement('li');
        const categoryButton = document.createElement('button');

        categoryButton.textContent = category.name; // Affiche le titre de la catégorie
        categoryItem.appendChild(categoryButton);
        categoriesContainer.appendChild(categoryItem);

        categoryButton.addEventListener('click', () => {
            filterWorks(category.id); // Filtre les travaux par catégorie
        });
    });

    // Ajouter un bouton "Tous" pour réafficher tous les travaux
    const allWorksButton = document.createElement('button');
    allWorksButton.textContent = 'Tous';
    categoriesContainer.prepend(allWorksButton); // Ajouter en haut de la liste
    allWorksButton.addEventListener('click', () => {
        filterWorks(); // Appel de la fonction sans catégorie pour montrer tous les travaux
    });
}

// Fonction pour filtrer les travaux
function filterWorks(categoryId = null) {
    // Sélectionne tous les travaux de la galerie
    const allWorks = document.querySelectorAll('.gallery figure');

    allWorks.forEach(work => {
        const workCategoryId = parseInt(work.getAttribute('data-category-id')); // Récupère l'ID de la catégorie de chaque figure

        if (categoryId === null || workCategoryId === categoryId) {
            work.style.display = 'block'; // Affiche le travail
        } else {
            work.style.display = 'none'; // Cache le travail
        }
    });
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    // Nettoie les messages d'erreur précédents
    errorMessage.textContent = "";

    // Envoi des informations de connexion
    fetch("http://localhost:5678/api/users/login", {
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

                // Mettez à jour les boutons avant de rediriger
                updateLoginLogout(true);

                // Redirige vers la page d'accueil après une courte pause (pour que l'utilisateur voit le changement)
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
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

// Fonction pour gérer l'affichage des boutons login/logout
function updateLoginLogout(isLoggedIn) {
    const navLogin = document.getElementById('navLogin');
    const navLogout = document.getElementById('navLogout');

    if (isLoggedIn) {
        navLogin.style.display = 'none';  // Cacher le bouton login
        navLogout.style.display = 'block'; // Afficher le bouton logout
    } else {
        navLogin.style.display = 'block';  // Afficher le bouton login
        navLogout.style.display = 'none';   // Cacher le bouton logout
    }
}

// Gestion de la déconnexion
document.getElementById("logout").addEventListener("click", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Supprimez le token de l'utilisateur du stockage local
    localStorage.removeItem("authToken");

    // Mettez à jour les boutons login/logout
    updateLoginLogout(false);

    // Optionnel: Redirigez vers la page d'accueil ou une autre page
    window.location.href = "index.html";
});

// Appelle les fonctions quand la page est chargée
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.endsWith("index.html")) {
        await displayWorks(); // Affiche les projets
        await displayFilters(); // Affiche les filtres
    }
    // Vérifiez si l'utilisateur est déjà connecté
    const token = localStorage.getItem('authToken');
    updateLoginLogout(!!token); // Met à jour les boutons selon l'état de connexion

    // Sélectionner le bouton "Modifier"
    const editButton = document.getElementById('editProjectsBtn');

    // Si un token est présent, l'utilisateur est connecté
    if (token) {
        // Afficher le bouton "Modifier"
        if (editButton) {
            editButton.style.display = 'block';
        }
    } else {
        // Si aucun token n'est présent, cacher le bouton "Modifier"
        if (editButton) {
            editButton.style.display = 'none';
        }
    }

});