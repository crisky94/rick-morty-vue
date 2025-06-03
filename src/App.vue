<script setup>
import ModalDetails from './components/ModalDetails.vue';
import Pagination from './components/Pagination.vue';
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const selectedCharacter = ref({});
const extraCharacter = ref(null);
const characters = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const recentCharacter = ref({});
const filteredCharacters = ref([]);
const searchQuery = ref('');
const searchHistory = ref([]);

const isModalOpen = ref(false);
const isSearchModalOpen = ref(false);
const isHistoryVisible = ref(false);
const noResultsFound = ref(false);


const filteredHistory = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return searchHistory.value.filter((term) =>
    term.toLowerCase().includes(query)
  );
});

function handleClickOutside(event) {
  if (!event.target.closest('.search-wrapper')) {
    isHistoryVisible.value = false;
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function openModal(character) {
  if (!character || !character.name) return;
  selectedCharacter.value = character;
  isModalOpen.value = true;
  recentCharacter.value = character;
  localStorage.setItem('recentCharacter', JSON.stringify(recentCharacter.value));
  saveSearchToHistory(character.name);
  isSearchModalOpen.value = false;

  setTimeout(() => {
    closeModal();
  }, 10000);
}

function closeModal() {
  isModalOpen.value = false;
  selectedCharacter.value = {};
}

function openSearchModal(query) {
  searchQuery.value = query;
  isSearchModalOpen.value = true;
}

function closeSearchModal() {
  extraCharacter.value = null;
  isSearchModalOpen.value = false;
  searchQuery.value = '';
  isHistoryVisible.value = false;
  noResultsFound.value = false;
}

function saveSearchToHistory(term) {
  if (!term == characters.value[0]?.name) return;
  const cleanTerm = term.trim();
  if (!cleanTerm || searchHistory.value[0]?.toLowerCase() === cleanTerm.toLowerCase()) return;

  const existing = searchHistory.value.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
  searchHistory.value = [cleanTerm, ...existing].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

const fetchCharacters = async (page) => {
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
    const data = await response.json();
    characters.value = data.results;
    totalPages.value = data.info.pages;
    noResultsFound.value = false;
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
};

watch(searchQuery, async (newQuery) => {
  currentPage.value = 1;
  if (!newQuery.trim()) {
    filteredCharacters.value = characters.value;
    return;
  }

  try {
    const res = await fetch(`https://rickandmortyapi.com/api/character/?name=${newQuery}`);
    const data = await res.json();
    if (data.results) {
      filteredCharacters.value = data.results;
      noResultsFound.value = false;
    } else {
      filteredCharacters.value = [];
      noResultsFound.value = true;
    }
  } catch (e) {
    console.error('Error buscando personaje', e);
    filteredCharacters.value = [];
    noResultsFound.value = true;
  }
});

onMounted(async () => {
  const storedPage = localStorage.getItem('currentPage');
  if (storedPage) {
    currentPage.value = parseInt(storedPage);
  }

  await fetchCharacters(currentPage.value);
  filteredCharacters.value = characters.value;
  const storedHistory = localStorage.getItem('searchHistory');
  if (storedHistory) {
    searchHistory.value = JSON.parse(storedHistory);
  }

  const storedRecent = localStorage.getItem('recentCharacter');
  if (storedRecent) {
    recentCharacter.value = JSON.parse(storedRecent);
  } else {
    recentCharacter.value = {};
  }
});

onUnmounted(() => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
  localStorage.setItem('recentCharacter', JSON.stringify(recentCharacter.value));
});

async function useHistoryTerm(term) {
  if (!term) return;
  searchQuery.value = term;
  isSearchModalOpen.value = false;

  try {
    const res = await fetch(`https://rickandmortyapi.com/api/character/?name=${term}`);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const found = data.results[0];
      const existsInPage = characters.value.some(c => c.id === found.id);
      if (!existsInPage) extraCharacter.value = found;
      noResultsFound.value = false
      openModal(found);
    } else {
      noResultsFound.value = true;
    }
  } catch (e) {
    console.error('Error buscando personaje', e);
    noResultsFound.value = true;
  }
}

async function changePage(page) {
  currentPage.value = page;
  localStorage.setItem('currentPage', page);

  if (searchQuery.value.trim()) {
    try {
      const res = await fetch(`https://rickandmortyapi.com/api/character/?page=${page}&name=${searchQuery.value}`);
      const data = await res.json();
      if (data.results) {
        filteredCharacters.value = data.results;
        totalPages.value = data.info.pages;
        noResultsFound.value = false;
      } else {
        filteredCharacters.value = [];
        noResultsFound.value = true;
      }
    } catch (error) {
      console.error('Error fetching filtered characters:', error);
      filteredCharacters.value = [];
      noResultsFound.value = true;
    }
  } else {
    await fetchCharacters(page);
    filteredCharacters.value = characters.value;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleHistory() {
  isHistoryVisible.value = !isHistoryVisible.value;
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1 class="navbar-title">Rick and Morty Gallery</h1>
      <div class="search-wrapper">
        <input type="text" placeholder="Buscar..." class="search-input" v-model="searchQuery"
          @input="isHistoryVisible = true" @focus="isHistoryVisible = true" />
        <div class="search-buttons">
          <button class="history-btn" @click="toggleHistory" title="Mostrar historial">
            <button class="close-searchHistory" @click="closeSearchModal" title="Cerrar búsqueda">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                fill="#e8eaed">
                <path
                  d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
              </svg>
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
              <path
                d="M13 3a9 9 0 1 0 8.9 10h-2.02A7 7 0 1 1 13 5v2l3-3-3-3v2zm1 5h-1v5l4.28 2.54.72-1.21-3.5-2.08V8z" />
            </svg>
          </button>
        </div>
        <ul v-if="isHistoryVisible && !searchQuery" class="search-history-dropdown">
          <li v-for="(term, idx) in filteredHistory" :key="idx" @click="useHistoryTerm(term)" style="cursor:pointer;">
            {{ term }}
          </li>
        </ul>
      </div>
      <div v-if="recentCharacter?.name">
        <p>Personaje visto recientemente:</p>
        <div class="character-card" @click="openModal(recentCharacter)">
          <h2 class="recent-character-name">{{ recentCharacter.name }}</h2>
        </div>
      </div>
    </div>
  </nav>
  <main class="main-content">
    <div class="character-grid">
      <div class="character-card glow-pointer" v-for="character in filteredCharacters" :key="character.id"
        @click="openModal(character)">
        <img :src="character.image" :alt="character.name" />
        <h2>{{ character.name }}</h2>
        <p>{{ character.species }}</p>
      </div>
    </div>
    <p v-if="noResultsFound" class="no-results-message">
      ❌ No se ha encontrado ningún personaje con ese nombre.
    </p>
    <ModalDetails :character="selectedCharacter" :isModalOpen="isModalOpen" @close="isModalOpen = false" />
    <Pagination v-if="!isSearchModalOpen && filteredCharacters.length > 2" :currentPage="currentPage"
      :totalPages="totalPages" @change-page="changePage" />
  </main>
</template>
<!-- <style>


/* Navbar */

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1f1f1f;
  color: white;
  z-index: 1000;
  padding: 20px 10px;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
}

.search-wrapper {
  position: relative;
  max-width: 300px;
  display: flex;
  align-items: center;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #555;
  border-radius: 6px 0 0 6px;
  outline: none;
  background-color: #222;
  color: #fff;
}

.search-buttons {
  display: flex;
  background-color: #222;
  border: 1px solid #555;
  border-left: none;
  border-radius: 0 6px 6px 0;
}

.search-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2b2b2b;
  border: 1px solid #444;
  border-top: none;
  border-radius: 0 0 6px 6px;
  z-index: 20;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-history-dropdown li {
  padding: 10px;
  cursor: pointer;
  color: #fff;
}

.search-history-dropdown li:hover {
  background: #444;
}

.search-buttons button:hover {
  color: #0f0;
}

.close-searchHistory svg {
  width: 18px;
  height: 18px;
}



/* Main Content */

.main-content {
  padding: 20px 10px;
  margin: auto;
  width: 100%;
  max-width: 1600px;
  box-sizing: border-box;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 2fr));
  gap: 20px;
  justify-content: center;
  padding: 24px;
  margin-top: 80px;
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
}

.character-card {
  width: 180px;
  border-radius: 8px;
  text-align: center;
  background: none;
  box-shadow: none;
  color: #eee;
}

.character-card img {
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  background: #222;
}

.character-card h2 {
  font-size: 1.1em;
  color: #eee;
}

.character-card p {
  color: #efe4e4;
  margin: 5px 0 10px 0;
}

.recent-character-name {
  cursor: pointer;
  transition: color 0.2s ease;
}

.extra-character {
  display: flex;
  justify-content: center;
  margin-top: 80px;
}

.no-results-message {
  text-align: center;
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 20px;
}

.glow-pointer {
  display: inline-block;
  padding: 10px 20px;
  color: #00ff88;
  border: 2px solid #00ff88;
  border-radius: 8px;
  font-weight: bold;
  background: #111;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 5px #00ff88;
}

.glow-pointer:hover {
  box-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
  background: #000;
  transform: scale(1.03);
} -->

/* Responsive */

/* @media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }

  .character-grid {
    gap: 16px;
  }

  .search-input {
    font-size: 12px;
  }

  .glow-pointer {
    padding: 10px 20px;
    font-size: 18px;
  }
}

@media (max-width: 600px) {
  .navbar-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .main-content {
    padding: 10px;
    width: 100%;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    margin: 30px;
  }
}

@media (min-width: 640px) {
  .character-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .character-grid {
    grid-template-columns: repeat(4, 1fr);
  }
} */
<!-- </style> -->
<style>
/* Base Styles (Mobile-First) */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #222;
  color: white;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1f1f1f;
  color: white;
  z-index: 1000;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
}

.navbar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: auto;
}

.navbar-title {
  font-size: 1.5em;
  margin-bottom: 5px;
}

.search-wrapper {
  position: relative;
  /* Reducimos el ancho máximo para pantallas muy pequeñas */
  width: 80%; /* Ajustado de 90% a 80% */
  max-width: 250px; /* Reducido de 300px a 250px */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;
}

.search-input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #555;
  border-radius: 6px;
  outline: none;
  background-color: #222;
  color: #fff;
  width: auto;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  background-color: #222;
  border: 1px solid #555;
  border-radius: 6px;
  width: 24%;
  margin-bottom: 5px;
}

.search-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.search-history-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 0 0 6px 6px;
  z-index: 20;
  max-height: 150px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-history-dropdown li {
  padding: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 0.9em;
}

.search-history-dropdown li:hover {
  background: #444;
}

.search-buttons button:hover {
  color: #0f0;
}

.close-searchHistory svg {
  width: 18px;
  height: 18px;
}

/* Recent Character */
.recent-character-name {
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 0.9em;
}

/* Main Content */
.main-content {
  padding: 20px 10px;
  margin: auto;
  width: 100%;
  max-width: 1600px;
  box-sizing: border-box;
  margin-top: 150px;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  justify-content: center;
  padding: 55px;
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
  margin-top: 80px;
}

.character-card {
  width: 100%;
  max-width: 180px;
  border-radius: 8px;
  text-align: center;
  background: none;
  box-shadow: none;
  color: #eee;
  padding: 10px;
}

.character-card img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  background: #222;
}

.character-card h2 {
  font-size: 1em;
  color: #eee;
  margin-top: 10px;
  margin-bottom: 5px;
}

.character-card p {
  color: #efe4e4;
  margin: 5px 0 10px 0;
  font-size: 0.8em;
}

.no-results-message {
  text-align: center;
  color: #ff6b6b;
  font-size: 1em;
  margin-top: 20px;
}

.glow-pointer {
  display: inline-block;
  padding: 8px 15px;
  color: #00ff88;
  border: 2px solid #00ff88;
  border-radius: 8px;
  font-weight: bold;
  background: #111;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 5px #00ff88;
}

.glow-pointer:hover {
  box-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
  background: #000;
  transform: scale(1.03);
}

/* Media Queries for Responsiveness */

/* Small devices (phones, 480px and up) */
@media (min-width: 480px) {
  .navbar-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
  }

  .navbar-title {
    font-size: 1.8em;
  }

  .search-wrapper {
    width: auto;
    max-width: 300px; /* Volvemos al ancho original para pantallas más grandes */
    flex-direction: row;
    align-items: center;
    gap: 0;
  }

  .search-input {
    font-size: 14px;
    padding: 10px;
    border-radius: 6px 0 0 6px;
  }

  .search-buttons {
    justify-content: center;
    border-radius: 0 6px 6px 0;
    border-left: none;
    margin-bottom: 0;
  }

  .search-history-dropdown {
    max-height: 200px;
    top: 100%;
  }

  .search-history-dropdown li {
    font-size: 1em;
    padding: 10px;
  }

  .recent-character-name {
    font-size: 1em;
  }

  .main-content {
    padding: 20px 20px;
    margin-top: 80px;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .character-card {
    width: 160px;
    padding: 15px;
  }

  .character-card img {
    width: 100px;
    height: 100px;
  }

  .character-card h2 {
    font-size: 1.1em;
  }

  .character-card p {
    font-size: 0.9em;
  }

  .glow-pointer {
    padding: 10px 20px;
    font-size: 1em;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .navbar-content {
    padding: 20px 40px;
  }

  .navbar-title {
    font-size: 2.2em;
  }

  .search-input {
    font-size: 16px;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .character-card {
    width: 180px;
  }

  .character-card img {
    width: 120px;
    height: 120px;
  }

  .character-card h2 {
    font-size: 1.2em;
  }

  .character-card p {
    font-size: 1em;
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .navbar-content {
    padding: 20px 60px;
  }

  .navbar-title {
    font-size: 2.5em;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 25px;
  }

  .character-card {
    width: 200px;
  }

  .character-card img {
    width: 140px;
    height: 140px;
  }
}
</style>