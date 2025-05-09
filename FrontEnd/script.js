// ===================== CONSTANTES =====================
const apiURLWorks = 'http://localhost:5678/api/works';
const apiURLCategories = 'http://localhost:5678/api/categories';

// Éléments DOM
const editButton = document.getElementById('editProjectsBtn');
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
const title = document.getElementById('title');
const fileInput = document.getElementById('fileInput');
const button = document.getElementById('submitBtn');
const navLogin = document.getElementById('navLogin');
const navLogout = document.getElementById('navLogout');
const token = localStorage.getItem('authToken');


// ===================== INITIALISATION =====================
document.addEventListener('DOMContentLoaded', async () => {
    await displayWorks(); //get works & display them
    await displayFilters();
    hideFiltersIfLoggedIn();

    updateLoginLogoutBtns(!!token); 
    editButton.style.display = token ? 'block' : 'none'; 
});

// ===================== AUTHENTIFICATION =====================
function updateLoginLogoutBtns(isLoggedIn) {
    navLogin.style.display = isLoggedIn ? 'none' : 'block';
    navLogout.style.display = isLoggedIn ? 'block' : 'none';
}

navLogout.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    updateLoginLogoutBtns(false);
    window.location.href = "login.html";
});

function hideFiltersIfLoggedIn() {
    if (token) {
        document.querySelector('.categories').classList.add('hidden');
    }
}


// ===================== AFFICHAGE DES PROJETS =====================
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

// ===================== GESTION DES CATÉGORIES =====================
async function getCategories() {
    try {
        const categoriesResponse = await fetch(apiURLCategories);
        if (!categoriesResponse.ok) throw new Error('Erreur lors de la récupération des catégories');
        return await categoriesResponse.json();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function filterWorks(categoryId = null) {
    const allWorks = document.querySelectorAll('.gallery figure');
    allWorks.forEach(work => {
        const workCategoryId = parseInt(work.getAttribute('data-category-id'));
        work.style.display = categoryId === null || workCategoryId === categoryId ? 'block' : 'none';
    });
}

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

function createFilterButton(category) {
    const categoryButton = document.createElement('button');
    categoryButton.textContent = category.name;
    categoryButton.addEventListener('click', () => filterWorks(category.id));
    return categoryButton;
}

// ===================== MODALE D'ÉDITION =====================
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
        loadProjectsInModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le projet.');
    }
}

// ===================== MODALE D'AJOUT DE PROJET =====================
function openAddProjectModal() {
    addProjectModal.classList.remove('modal-hidden');
    loadCategoriesInForm();
}

function closeAddProjectModal() {
    addProjectModal.classList.add('modal-hidden');
}

async function loadCategoriesInForm() {
    categorySelect.innerHTML = '<option value="" selected disabled hidden></option>';
    try {
        const categories = await getCategories();
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

addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(addProjectForm);

    try {
        const response = await fetch(apiURLWorks, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) throw new Error('Erreur lors de l\'ajout du projet');

        alert('Projet ajouté avec succès');
        addProjectForm.reset();

        uploadIcon.src = "/assets/images/Placeholder_view_vector.png";
        uploadIcon.id = 'upload-icon';
        addPhotoBtn.classList.remove('hidden');
        photoHint.classList.remove('hidden');

        closeAddProjectModal();
        closeEditModal();
        displayWorks();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter le projet.');
    }
});

function loadFile(event) {
    if (event.target.files && event.target.files[0]) {
        uploadIcon.src = URL.createObjectURL(event.target.files[0]);
        uploadIcon.id = 'uploaded';
        addPhotoBtn.classList.add('hidden');
        photoHint.classList.add('hidden');
    }
}

function checkFormValidity() {
    const titleValue = title.value.trim();
    const categoryValue = categorySelect.value;
    const imgInputValue = fileInput.files.length > 0;
    button.disabled = !(titleValue && categoryValue && imgInputValue);
}

// ===================== ÉVÉNEMENTS =====================
editButton.addEventListener('click', openEditModal);
closeModalButton.addEventListener('click', closeEditModal);
addPhotoButton.addEventListener('click', openAddProjectModal);
closeProjectModalBtn.addEventListener('click', closeAddProjectModal);

editModal.addEventListener('click', (event) => {
    if (event.target === editModal) closeEditModal();
});
addProjectModal.addEventListener('click', (event) => {
    if (event.target === addProjectModal) closeAddProjectModal();
});

fileInput.addEventListener('change', loadFile);
title.addEventListener('input', checkFormValidity);
categorySelect.addEventListener('change', checkFormValidity);
fileInput.addEventListener('change', checkFormValidity);
