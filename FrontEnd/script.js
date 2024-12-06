const apiURLWorks = 'http://localhost:5678/api/works';
const apiURLCategories = 'http://localhost:5678/api/categories';
let editButton = document.getElementById('editProjectsBtn');

const editModal = document.getElementById('editModal');
const modalGallery = document.getElementById('modalGallery');
const closeModalButton = document.querySelector('.close-modal');
const addPhotoButton = document.getElementById('addPhotoBtn');

const addProjectModal = document.getElementById('addProjectModal');
const addPhotoModal = document.getElementById('addPhotoModal');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const addProjectForm = document.getElementById('addProjectForm');
const categorySelect = document.getElementById('selectCategory');
const uploadIcon = document.getElementById('upload-icon');
const addPhotoBtn = document.querySelector('.add-photo-btn');
const photoHint = document.querySelector('.photo-hint');

// === GESTION DE L'AUTHENTIFICATION ===

// Mettre à jour les boutons login/logout
function updateLoginLogout(isLoggedIn) {
    const navLogin = document.getElementById('navLogin');
    const navLogout = document.getElementById('navLogout');

    navLogin.style.display = isLoggedIn ? 'none' : 'block';
    navLogout.style.display = isLoggedIn ? 'block' : 'none';
}

// Gestion de la déconnexion
document.getElementById('navLogout').addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    updateLoginLogout(false);
    window.location.href = "login.html";
});

// Cacher les filtres si l'utilisateur est connecté
function hideFiltersIfLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (token) {
        document.querySelector('.categories').classList.add('hidden');
    }
}

// hide/play edit button
document.addEventListener('DOMContentLoaded', async () => {
    await displayWorks();
    await displayFilters();
    hideFiltersIfLoggedIn();

    const token = localStorage.getItem('authToken');
    updateLoginLogout(!!token);

    if (token && editButton) {
        editButton.style.display = 'block';
    } else if (editButton) {
        editButton.style.display = 'none';
    }
});

// === GESTION DES PROJETS ===

// Récupérer et afficher les projets
async function displayWorks() {
    try {
        const workResponse = await fetch(apiURLWorks);
        if (!workResponse.ok) throw new Error('Erreur lors de la récupération des projets');

        const projets = await workResponse.json();
        const galerie = document.querySelector('.gallery');
        galerie.innerHTML = '';

        projets.forEach(project => {
            const figure = createProjectFigure(project);
            galerie.appendChild(figure);
        });
    } catch (error) {
        console.error('Erreur:', error);
        document.querySelector('.gallery').innerHTML = '<p>Une erreur est survenue lors de la récupération des projets.</p>';
    }
}

// Créer un élément <figure> pour un projet
function createProjectFigure(project) {
    const figure = document.createElement('figure');
    figure.setAttribute('data-category-id', project.categoryId);

    const img = document.createElement('img');
    img.src = project.imageUrl;
    img.alt = project.title;

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = project.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    return figure;
}

// Filtrer les projets par catégorie
function filterWorks(categoryId = null) {
    const allWorks = document.querySelectorAll('.gallery figure');
    allWorks.forEach(work => {
        const workCategoryId = parseInt(work.getAttribute('data-category-id'));
        work.style.display = categoryId === null || workCategoryId === categoryId ? 'block' : 'none';
    });
}

// === GESTION DES CATÉGORIES ===

// Récupérer les catégories
async function getCategories() {
    try {
        const categoriesResponse = await fetch(apiURLCategories);
        if (!categoriesResponse.ok) throw new Error('Erreur lors de la récupération des catégories');
        return await categoriesResponse.json();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Afficher les filtres
async function displayFilters() {
    const categories = await getCategories();
    const categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = '';

    categories.forEach(category => {
        const button = createFilterButton(category);
        categoriesContainer.appendChild(button);
    });

    const allWorksButton = document.createElement('button');
    allWorksButton.textContent = 'Tous';
    allWorksButton.addEventListener('click', () => filterWorks());
    categoriesContainer.prepend(allWorksButton);
}

// Créer un bouton de filtre pour une catégorie
function createFilterButton(category) {
    const categoryButton = document.createElement('button');
    categoryButton.textContent = category.name;
    categoryButton.addEventListener('click', () => filterWorks(category.id));
    return categoryButton;
}

// === GESTION DE LA MODALE D'ÉDITION ===

// Ouvrir et fermer la modale
function openEditModal() {
    editModal.classList.remove('modal-hidden');
    loadProjectsInModal();
}

function closeEditModal() {
    editModal.classList.add('modal-hidden');
}

// Charger les projets dans la modale
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

// Créer un <figure> pour la modale
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

// Supprimer un projet
async function deleteProject(projectId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiURLWorks}/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression du projet');

        alert('Projet supprimé avec succès');
        loadProjectsInModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le projet.');
    }
}

// === GESTION DES MODALES ET FORMULAIRES ===

// Ouvrir et fermer la modale d'ajout de photo
function openAddProjectModal() {
    addProjectModal.classList.remove('modal-hidden');
    loadCategoriesInForm();
}

function closeAddProjectModal() {
    addProjectModal.classList.add('modal-hidden');
}

// Charger les catégories dans le formulaire
async function loadCategoriesInForm() {
    const categorySelect = document.getElementById('selectCategory');

    try {
        // Réinitialiser les options pour éviter les duplications
        categorySelect.innerHTML = '<option value="" selected disabled hidden></option>';

        // Récupérer les catégories depuis l'API
        const categories = await getCategories();

        // Ajouter chaque catégorie comme option dans le select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des catégories dans le formulaire:', error);
    }
}




// Gérer l'envoi du formulaire d'ajout de projet
addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(addProjectForm);
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(apiURLWorks, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) throw new Error('Erreur lors de l\'ajout du projet');

        alert('Projet ajouté avec succès');
        closeAddProjectModal();
        closeEditModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter le projet.');
    }
});



function loadFile(event) {
    // Vérifier si un fichier est chargé
    if (event.target.files && event.target.files[0]) {
        // Afficher l'image chargée
        uploadIcon.src = URL.createObjectURL(event.target.files[0]);
        uploadIcon.id = 'uploaded';

        // Cacher les éléments
        addPhotoBtn.classList.add('hidden');
        photoHint.classList.add('hidden');
    }
}


// Activer le bouton lorsque les champs sont remplis
function checkFormValidity() {
    const titleValue = document.getElementById('title').value.trim();
    const categoryValue = document.getElementById('selectCategory').value;
    const imgInputValue = document.getElementById('fileInput').files.length > 0;

    const isFormValid = titleValue && categoryValue && imgInputValue;
    document.getElementById('submitBtn').disabled = !isFormValid;
}

//eventListners
editButton.addEventListener('click', openEditModal);
closeModalButton.addEventListener('click', closeEditModal);
addPhotoButton.addEventListener('click', openAddProjectModal);
closeProjectModalBtn.addEventListener('click', closeAddProjectModal);
fileInput.addEventListener('change', loadFile);

document.getElementById('title').addEventListener('input', checkFormValidity);
document.getElementById('selectCategory').addEventListener('change', checkFormValidity);
document.getElementById('fileInput').addEventListener('change', checkFormValidity);

const button = document.getElementById('submitBtn');

