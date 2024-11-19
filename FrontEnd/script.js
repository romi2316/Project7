// URL de l'API pour récupérer les projets et les catégories
const apiURLWorks = 'http://localhost:5678/api/works';
const apiURLCategories = 'http://localhost:5678/api/categories';
let editButton = document.getElementById('editProjectsBtn');

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
navLogout.addEventListener("click", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Supprimez le token de l'utilisateur du stockage local
    localStorage.removeItem("authToken");

    // Mettez à jour les boutons login/logout
    updateLoginLogout(false);

    // Optionnel: Redirigez vers la page d'accueil ou une autre page
    window.location.href = "login.html";
});

// Fonction pour cacher les filtres si l'utilisateur est connecté
function hideFiltersIfLoggedIn() {
    const categoriesContainer = document.querySelector('.categories');
    const token = localStorage.getItem('authToken'); // Vérifie la présence du token

    if (token) {
        categoriesContainer.classList.add('hidden'); // Masque la section des catégories
    }
}

// Sélection des éléments du DOM pour la modale
const editModal = document.getElementById('editModal');
const modalGallery = document.getElementById('modalGallery');

const closeModalButton = document.querySelector('.close-modal');
const addPhotoButton = document.getElementById('addPhotoBtn');

// Fonction pour ouvrir la modale
function openEditModal() {
    editModal.classList.remove('hidden');
    editModal.style.display = 'block';
    loadProjectsInModal();
}

// Fonction pour fermer la modale
function closeEditModal() {
    editModal.style.display = 'none';
    editModal.classList.add('hidden');
}

// Ajouter les événements pour ouvrir et fermer la modal
editButton.addEventListener('click', openEditModal);
closeModalButton.addEventListener('click', closeEditModal);

// Empêche la fermeture de la modal en cliquant à l'extérieur
editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// Charger les projets dans la modal
async function loadProjectsInModal() {
    try {
        const response = await fetch(apiURLWorks);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des projets');
        }
        const projects = await response.json();

        modalGallery.innerHTML = '';

        projects.forEach(project => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            img.src = project.imageUrl;
            img.alt = project.title;

            const figcaption = document.createElement('figcaption');
            figcaption.textContent = project.title;

            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt';
            deleteIcon.addEventListener('click', () => deleteProject(project.id));

            figure.appendChild(img);
            figure.appendChild(figcaption);
            figure.appendChild(deleteIcon);

            modalGallery.appendChild(figure);
        });
    } catch (error) {
        console.error('Erreur:', error);
        modalGallery.innerHTML = '<p>Impossible de charger les projets.</p>';
    }
}

// Fonction pour supprimer un projet
async function deleteProject(projectId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiURLWorks}/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du projet');
        }

        alert('Projet supprimé avec succès');
        loadProjectsInModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le projet.');
    }
}

// Event pour "Ajouter une photo"
addPhotoButton.addEventListener('click', () => {
    // Logique pour ajouter une photo ou ouvrir un autre modal de téléchargement de photo
    alert("Fonction d'ajout de photo en cours de développement");
});

// Appelle les fonctions quandFQ    azerè_çà QST la page est chargée
document.addEventListener('DOMContentLoaded', async () => {
    await displayWorks(); // Affiche les projets
    await displayFilters(); // Affiche les filtres
    hideFiltersIfLoggedIn(); // Vérifie l'état de connexion et masque les filtres si nécessaire
// Vérifiez si l'utilisateur est déjà connecté
const token = localStorage.getItem('authToken');
console.log(token)
updateLoginLogout(!!token); // Met à jour les boutons selon l'état de connexion

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