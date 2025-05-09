// ===================== CONSTANTES =====================
const apiURLWorks = 'http://localhost:5678/api/works';
const apiURLCategories = 'http://localhost:5678/api/categories';

// Éléments DOM
const navLogin = document.getElementById('navLogin');
const navLogout = document.getElementById('navLogout');
const galerie = document.querySelector('.gallery');
const editButton = document.getElementById('editProjectsBtn');
const editModal = document.getElementById('editModal');
const modalGallery = document.getElementById('modalGallery');
const closeModalButton = document.querySelector('.close-modal');
const addPhotoButton = document.getElementById('addPhotoBtn');
const addProjectModal = document.getElementById('addProjectModal');
const addPhotoModal = document.getElementById('addPhotoModal');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const backToEditModalBtn = document.getElementById('backToEditModalBtn');
const addPhotoBtn = document.querySelector('.add-photo-btn');
const title = document.getElementById('title');
const fileInput = document.getElementById('fileInput');
const button = document.getElementById('submitBtn');
const photoHint = document.querySelector('.photo-hint');
const addProjectForm = document.getElementById('addProjectForm');
const uploadIcon = document.getElementById('upload-icon');
const categorySelect = document.getElementById('selectCategory');
const adminBanner = document.getElementById('adminBanner');


let token = localStorage.getItem('authToken');


// ===================== INITIALISATION =====================
document.addEventListener('DOMContentLoaded', async () => {
    await displayWorks(); //get works & display them
    await displayFilters();
    hideFiltersIfLoggedIn();

    updateLoginLogoutBtns(!!token); // true si token existe, false sinon
    editButton.style.display = token ? 'block' : 'none'; //opérateur ternair if/else
});


// ===================== AFFICHAGE DES PROJETS =====================
async function displayWorks() {
    try {
        const workResponse = await fetch(apiURLWorks); //récupérer les projets depuis l'API
        if (!workResponse.ok) throw new Error('Erreur lors de la récupération des projets');

        const projets = await workResponse.json(); //réponse api au format JSON
        galerie.innerHTML = ''; //vider le contenu HTML 

        projets.forEach(project => {
            const figure = createProjectFigure(project); //créer un élément figure pour chaque projet
            galerie.appendChild(figure); //Resultat: Afficher les projets récupérés depuis l'API dans la galerie
        });
    } catch (error) {
        console.error('Erreur:', error);
        document.querySelector('.gallery').innerHTML = '<p>Une erreur est survenue lors de la récupération des projets.</p>';
    }
}

function createProjectFigure(project) {
    const figure = document.createElement('figure');
    figure.setAttribute('data-category-id', project.categoryId); //ajouter un attribut data-category-id à chaque figure pour le filtrage

    const img = document.createElement('img'); //créer un élément img pour chaque projet
    img.src = project.imageUrl;
    img.alt = project.title;

    const figcaption = document.createElement('figcaption'); //créer un élément figcaption pour chaque projet
    figcaption.textContent = project.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    return figure;
}

// ===================== Filtrer les projets =====================
async function getCategories() {
    try {
        const categoriesResponse = await fetch(apiURLCategories); //récupérer les catégories depuis l'API
        if (!categoriesResponse.ok) throw new Error('Erreur lors de la récupération des catégories');
        return await categoriesResponse.json();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function createFilterButton(category) {
    const categoryButton = document.createElement('button'); //créer un bouton de filtrage pour chaque catégorie
    categoryButton.textContent = category.name; //bouton avec le nom de la catégorie
    categoryButton.addEventListener('click', () => filterWorks(category.id)); //déclencher la fonction filterWorks avec l'ID de la catégorie
    return categoryButton;
}

async function displayFilters() { //responsable de l'affichage des boutons de filtres sur la page
    const categories = await getCategories();
    const categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = '';

    categories.forEach(category => {
        const button = createFilterButton(category);
        categoriesContainer.appendChild(button); //ajouter les boutons de filtrage à la galerie dans HTML
    });
// Ajouter le bouton "Tous" en premier
    const allWorksButton = document.createElement('button');
    allWorksButton.textContent = 'Tous';
    allWorksButton.addEventListener('click', () => filterWorks());
    categoriesContainer.prepend(allWorksButton);
}

function filterWorks(categoryId = null) { //prend en paramètre l'ID de la catégorie cliqué et le compare
    const allWorks = document.querySelectorAll('.gallery figure');
    allWorks.forEach(work => {
        const workCategoryId = parseInt(work.getAttribute('data-category-id')); //transformer l'ID de la catégorie en entier
        work.style.display = categoryId === null || workCategoryId === categoryId ? 'block' : 'none'; //operateur ternaire
    });
}

// ===================== AUTHENTIFICATION  =====================
//updatelogin/logoutbtns
function updateLoginLogoutBtns(isLoggedIn) {
    navLogin.style.display = isLoggedIn ? 'none' : 'block'; //true/false
    navLogout.style.display = isLoggedIn ? 'block' : 'none'; //true/false
}

//cacher les filtres si connecté
function hideFiltersIfLoggedIn() {
    if (token) {
        document.querySelector('.categories').classList.add('hidden');
    }   
}

// Vérifie la connexion au chargement
if (token) {
    updateLoginLogoutBtns(true);
    hideFiltersIfLoggedIn();
    adminBanner?.classList.remove('modal-hidden'); // Afficher le bandeau noir
} else {
    updateLoginLogoutBtns(false);
    adminBanner?.classList.add('modal-hidden');    // cacher le bandeau noir
}
//deconnexion
navLogout.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    updateLoginLogoutBtns(false); //Afficher le bouton login
    adminBanner.classList.add('modal-hidden');
    window.location.href = "login.html";
});


// ===================== MODALE Modifier =====================

editButton.addEventListener('click', openEditModal);
closeModalButton.addEventListener('click', closeEditModal);

function openEditModal() {
    editModal.classList.remove('modal-hidden');
    loadProjectsInModal();
}

function closeEditModal() {
    editModal.classList.add('modal-hidden');
}

async function loadProjectsInModal() {
    try {
        const response = await fetch(apiURLWorks);
        if (!response.ok) throw new Error('Erreur lors du chargement des projets');

        const projects = await response.json();
        modalGallery.innerHTML = '';

        projects.forEach(project => {
            const figure = createModalProjectFigure(project);
            modalGallery.appendChild(figure);
        });
    } catch (error) {
        console.error('Erreur:', error);
        modalGallery.innerHTML = '<p>Impossible de charger les projets.</p>';
    }
} 

function createModalProjectFigure(project) {
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
    return figure;
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`${apiURLWorks}/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression du projet');

        alert('Projet supprimé avec succès');
        loadProjectsInModal(); // Recharge les projets dans la modale
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le projet.');
    }

    displayWorks(); // Recharge la galerie principale

}

// ===================== MODALE D'AJOUT DE PROJET =====================

addPhotoButton.addEventListener('click', openAddProjectModal);
closeProjectModalBtn.addEventListener('click', closeAddProjectModal);

function openAddProjectModal() {
    addProjectModal.classList.remove('modal-hidden');
    loadCategoriesInForm();
}

function closeAddProjectModal() {
    addProjectModal.classList.add('modal-hidden');
}

backToEditModalBtn.addEventListener('click', () => {
        closeAddProjectModal();
});

async function loadCategoriesInForm() {
    categorySelect.innerHTML = '<option value="" selected disabled hidden></option>'; //option par défaut 
    try {
        const categories = await getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option); //créée une option pour chaque catégorie
        });
    } catch (error) {
        console.error('Erreur lors du chargement des catégories dans le formulaire:', error);
    }
}


fileInput.addEventListener('change', loadedFile); //change : événement qui se produit lorsque l'utilisateur sélectionne un fichier
function loadedFile(event) {
    if (event.target.files && event.target.files[0]) { //vérifie si un fichier a été sélectionné
        uploadIcon.src = URL.createObjectURL(event.target.files[0]); //crée une URL temporaire pour l'image sélectionnée, sans la télécharger sur le serveur
        uploadIcon.id = 'uploaded'; //changer l'ID de l'icône pour le style CSS
        addPhotoBtn.classList.add('hidden'); //cacher le bouton d'ajout de photo
        photoHint.classList.add('hidden'); //cacher le bouton d'ajout de photo
    }
}

// ========= EventListners ========//
title.addEventListener('input', checkFormValidity); //input:saisir du texte dans le champ de saisie
categorySelect.addEventListener('change', checkFormValidity); //change:se produit lorsque l'utilisateur sélectionne une option dans le menu déroulant
fileInput.addEventListener('change', checkFormValidity); //change:se produit lorsque l'utilisateur sélectionne un fichier
// ===============================//

// désactiver le bouton Valider si le formulaire n'est pas valide
function checkFormValidity() {
    const titleValue = title.value.trim();
    const categoryValue = categorySelect.value;
    const imgInputValue = fileInput.files.length > 0;
    button.disabled = !(titleValue && categoryValue && imgInputValue);
}

addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(addProjectForm); //nouvelle instance de FormData pour récupérer les données du formulaire

    try {
        const response = await fetch(apiURLWorks, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) throw new Error('Erreur lors de l\'ajout du projet');
        alert('Projet ajouté avec succès');
        addProjectForm.reset();

        // Réinitialisation du formulaire
        uploadIcon.src = "/assets/images/Placeholder_view_vector.png";
        uploadIcon.id = 'upload-icon';
        addPhotoBtn.classList.remove('hidden'); //réafficher le bouton d'ajout de photo
        photoHint.classList.remove('hidden'); //réafficher l'image placeholder

        closeAddProjectModal();
        closeEditModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter le projet.');
    }
});

//Close modals when clicking outside of it
editModal.addEventListener('click', (event) => {
    if (event.target === editModal) closeEditModal(); //vérifie si l'utilisateur a cliqué à l'extérieur du contenu de la modale.
});

addProjectModal.addEventListener('click', (event) => {
    if (event.target === addProjectModal) closeAddProjectModal(); //vérifie si l'utilisateur a cliqué à l'extérieur du contenu de la modale.
});


