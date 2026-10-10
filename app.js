'use strict';

// Selectores y configuración compartidos por las funciones de la página.
const FAVORITES_KEY = 'refugio-favoritos';
const TOAST_DURATION_MS = 2400;

function initRevealAnimations() {
  document.documentElement.classList.add('js');

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
  });
}

function initAdoptionDialog() {
  const dialog = document.querySelector('#pet-dialog');
  const title = dialog.querySelector('#dialog-title');
  const description = dialog.querySelector('#dialog-copy');
  let trigger;

  function openPetDialog(button) {
    trigger = button;
    title.textContent = button.dataset.pet;
    description.textContent = button.closest('article')
      .querySelector('.pet-content p').textContent;
    dialog.showModal();
  }

  document.querySelectorAll('[data-pet]').forEach(button => {
    button.addEventListener('click', () => openPetDialog(button));
  });

  dialog.querySelector('.close').addEventListener('click', () => dialog.close());

  // Cerrar únicamente si el clic cae fuera del rectángulo de la ficha.
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  dialog.addEventListener('close', () => trigger?.focus());
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Los corazones siguen funcionando si el navegador bloquea el guardado.
  }
}

function paintFavoriteButton(button, name, favorites) {
  const active = favorites.includes(name);
  button.setAttribute('aria-pressed', String(active));
  button.textContent = active ? '♥' : '♡';
}

function createToastNotifier() {
  const toast = document.querySelector('.toast');
  let timer;

  return function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION_MS);
  };
}

function initFavorites() {
  let favorites = loadFavorites();
  const showToast = createToastNotifier();

  document.querySelectorAll('.heart').forEach(button => {
    const name = button.getAttribute('aria-label').replace('Guardar a ', '');
    paintFavoriteButton(button, name, favorites);

    button.addEventListener('click', () => {
      const wasSaved = favorites.includes(name);
      favorites = wasSaved
        ? favorites.filter(savedName => savedName !== name)
        : [...favorites, name];

      saveFavorites(favorites);
      paintFavoriteButton(button, name, favorites);
      showToast(wasSaved
        ? `${name} retirado de tus favoritos`
        : `${name} guardado en tus favoritos`);
    });
  });
}

// El script se carga al final del HTML: los elementos ya están disponibles.
initRevealAnimations();
initAdoptionDialog();
initFavorites();
