/**
 * CONFIG
 */
const SITE_AUTOR = 'Leonardo Limachi';
const API_BASE = 'https://jsonplaceholder.typicode.com';
const POKE_API = 'https://pokeapi.co/api/v2';
const WEATHER_API = 'https://restcountries.com/v3.1';

let currentFilter = 'all';
let pokeOffset = 0;

/**
 * DEMO ES6+
 */
const greet = (name) => `Hola desde el portafolio de ${name}`;
console.log(greet(SITE_AUTOR));

/**
 * PERFIL
 */
const devProfile = {
  name: SITE_AUTOR,
  role: 'Desarrollador Web',
  skills: ['JavaScript', 'Laravel', 'MySQL'],
};

const { name, role, skills } = devProfile;
console.log(`${name} - ${role}`);

/**
 * CLASE PROJECT
 */
class Project {
  #id;

  constructor({ id, title, description, techs, emoji, category }) {
    this.#id = id;
    this.title = title;
    this.description = description;
    this.techs = techs;
    this.emoji = emoji;
    this.category = category;
  }

  toHTML() {
    const badges = this.techs
      .map(t => `<span class="tech-badge">${t}</span>`)
      .join('');

    return `
      <article class="project-card" data-category="${this.category}">
        <div class="project-img">${this.emoji}</div>
        <div class="project-info">
          <h3>${this.title}</h3>
          <p>${this.description}</p>
          <div>${badges}</div>
        </div>
      </article>
    `;
  }
}

/**
 * PROYECTOS (LOS TUYOS)
 */
const localProjects = [
  new Project({
    id: 1,
    category: 'fullstack',
    emoji: '🛒',
    title: 'Ecommerce Laravel',
    description: 'Sistema completo con carrito, roles y autenticación.',
    techs: ['Laravel', 'MySQL', 'Bootstrap'],
  }),
  new Project({
    id: 2,
    category: 'fullstack',
    emoji: '🎓',
    title: 'Sistema Bicentenario',
    description: 'Gestión de PDFs, videos, galerías y roles.',
    techs: ['Laravel', 'PHP', 'MySQL'],
  }),
  new Project({
    id: 3,
    category: 'frontend',
    emoji: '📱',
    title: 'App de Tareas',
    description: 'Drag & drop y almacenamiento local.',
    techs: ['JavaScript', 'CSS'],
  }),
  new Project({
    id: 4,
    category: 'backend',
    emoji: '🔧',
    title: 'API Inventario',
    description: 'API REST con autenticación.',
    techs: ['Node.js', 'MySQL'],
  }),
];

/**
 * DOM
 */
const projectsGrid = document.getElementById('projects-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const pokeGrid = document.getElementById('poke-grid');
const pokeBtnNext = document.getElementById('poke-next');
const countryInput = document.getElementById('country-search');
const countryResult = document.getElementById('country-result');

/**
 * RENDER PROYECTOS
 */
function renderProjects(category = 'all') {
  if (!projectsGrid) return;

  const filtered = category === 'all'
    ? localProjects
    : localProjects.filter(p => p.category === category);

  projectsGrid.innerHTML = filtered.map(p => p.toHTML()).join('');

  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
}

renderProjects();

/**
 * FILTROS
 */
filterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    currentFilter = e.target.dataset.filter;
    renderProjects(currentFilter);
  });
});

/**
 * FETCH BASE
 */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error HTTP');
  return res.json();
}

/**
 * POKEMON
 */
async function fetchPokemon(offset = 0) {
  if (!pokeGrid) return;

  pokeGrid.innerHTML = '<p>Cargando...</p>';

  try {
    const data = await fetchJSON(`${POKE_API}/pokemon?limit=6&offset=${offset}`);

    const details = await Promise.all(
      data.results.map(p => fetchJSON(p.url))
    );

    pokeGrid.innerHTML = details.map(p => `
      <div class="poke-card">
        <img src="${p.sprites.front_default}" />
        <p>${p.name}</p>
      </div>
    `).join('');

  } catch {
    pokeGrid.innerHTML = '<p>Error al cargar</p>';
  }
}

if (pokeBtnNext) {
  pokeBtnNext.addEventListener('click', () => {
    pokeOffset += 6;
    fetchPokemon(pokeOffset);
  });
}

/**
 * PAISES (CORREGIDO)
 */
async function fetchCountry(query) {
  if (!countryResult || !query.trim()) return;

  countryResult.innerHTML = '<p>Buscando...</p>';

  try {
    const [country] = await fetchJSON(
      `${WEATHER_API}/name/${query}?fields=name,capital,population,flags,region`
    );

    const {
      name: { common },
      capital: [capital] = ['N/A'],
      population,
      flags: { svg },
      region
    } = country;

    countryResult.innerHTML = `
      <div class="project-card">
        <img src="${svg}" style="width:100%">
        <h3>${common}</h3>
        <p>Capital: ${capital}</p>
        <p>Región: ${region}</p>
        <p>Población: ${population.toLocaleString()}</p>
      </div>
    `;

  } catch {
    countryResult.innerHTML = '<p>No encontrado</p>';
  }
}

/**
 * BUSCADOR
 */
let timer;
if (countryInput) {
  countryInput.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fetchCountry(e.target.value);
    }, 500);
  });
}

/**
 * INIT
 */
document.addEventListener('DOMContentLoaded', () => {
  fetchPokemon(0);
});