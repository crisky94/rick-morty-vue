
<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import ModalDetails from './components/ModalDetails.vue';

const selectedCharacter = ref({});
const isModalOpen = ref(false);
const isSearchModalOpen = ref(false);
const extraCharacter = ref(null);
const noResultsFound = ref(false);
const searchQuery = ref('');
const searchHistory = ref([]);
const characters = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const recentCharacter = ref({});

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
}

function saveSearchToHistory(term) {
  const cleanTerm = term.trim();
  if (!cleanTerm || searchHistory.value[0]?.toLowerCase() === cleanTerm.toLowerCase()) return;

  const existing = searchHistory.value.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
  searchHistory.value = [cleanTerm, ...existing].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

const filteredCharacters = computed(() => {
  const query = (searchQuery.value || '').toLowerCase();
  const results = characters.value.filter(character =>
    character.name.toLowerCase().includes(query)
  );
  noResultsFound.value = searchQuery.value && results.length === 0;
  return results;
});


const fetchCharacters = async (page) => {
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
    const data = await response.json();
    characters.value = data.results;
    totalPages.value = data.info.pages;
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
};

onMounted(() => {
  const storedPage = localStorage.getItem('currentPage');
  if (storedPage) {
    currentPage.value = parseInt(storedPage);
  }

  fetchCharacters(currentPage.value);

  const storedHistory = localStorage.getItem('searchHistory');
  if (storedHistory) {
    searchHistory.value = JSON.parse(storedHistory);
  }

  const storedRecent = localStorage.getItem('recentCharacter');
  if (storedRecent) {
    recentCharacter.value = JSON.parse(storedRecent);
  }else {
    recentCharacter.value = {};
  }
});

onUnmounted(() => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
  localStorage.setItem('recentCharacter', JSON.stringify(recentCharacter.value));
});

watch(currentPage, (newPage) => {
  localStorage.setItem('currentPage', newPage.toString());
  fetchCharacters(newPage);
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

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
}
function home() {
currentPage.value = 1;
  fetchCharacters(currentPage.value);
  scrollToTop();
}

function end() {
  currentPage.value = totalPages.value;
  fetchCharacters(currentPage.value);
  scrollToTop();
}
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Puedes usar 'auto' si no quieres animación
  });
}

</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1 class="navbar-title">Rick and Morty Gallery</h1>

      <div @click="openSearchModal(searchQuery)" class="search-history-container">
        <p>Historial de busqueda</p>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
          <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
        </svg>
        <ul v-if="isSearchModalOpen" class="search-history">
          <li v-for="(term, idx) in searchHistory" :key="idx" @click="useHistoryTerm(term)" style="cursor:pointer;">
            {{ term }}
          </li>
        </ul>
      </div>

      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar..."
          class="search-input"
          v-model="searchQuery"
          @blur="saveSearchToHistory(searchQuery)"
        />
        <button class="close-searchHistory" @click="closeSearchModal">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
          </svg>
        </button>
      </div>

      <div v-if="recentCharacter?.name">
        <p>Personaje visto recientemente:</p>
        <div class="character-card" @click="openModal(recentCharacter)">
          <h2>{{ recentCharacter.name }}</h2>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <div v-if="extraCharacter && !isSearchModalOpen" @click="openModal(extraCharacter)" class="extra-character">
      <div class="character-card">
        <img :src="extraCharacter.image" :alt="extraCharacter.name" />
        <h2>{{ extraCharacter.name }}</h2>
        <p>{{ extraCharacter.species }}</p>
      </div>
    </div>

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

    <div v-if="!isSearchModalOpen && filteredCharacters.length > 2" class="pagination">
      <button @click="home" :disabled="currentPage === 1"><<<</button>
      <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
      <button @click="end" :disabled="currentPage === totalPages">>>></button>
    </div>
  </main>
</template>
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #121212;
  color: #f5f5f5;
  line-height: 1.6;
}

/* Navbar */
.navbar {
  background: #1f1f1f;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-wrap: wrap;
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  width: 200px;
  max-width: 100%;
  background: #2b2b2b;
  color: #fff;
}

.search-input::placeholder {
  color: #aaa;
}

.close-searchHistory {
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
}

.search-history-container {
  position: relative;
  cursor: pointer;
}

.search-history {
  position: absolute;
  top: 110%;
  left: 0;
  background: #2a2a2a;
  border-radius: 6px;
  padding: 0.5rem 0;
  width: 200px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  z-index: 99;
}

.search-history li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-history li:hover {
  background-color: #3a3a3a;
}

/* Main Content */
main {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: auto;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 250px));
  gap: 24px;
  justify-content: center;
  /* o center */
  padding: 20px;
  margin: 0 auto;
  width: 90vw;
  /* Asegura que ocupe el ancho total de la ventana */
  max-width: 100%;
  /* No se desborda */
  box-sizing: border-box;
}


.character-card {
  border-radius: 8px;
  text-align: center;
  background: none;
  box-shadow: none;
  color: #eee;
}

.character-card img {
  width: 100%;
  height: 200px;
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



.extra-character {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}


/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.pagination button {
  background: #282828;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pagination button:hover {
  background-color: #3b3b3b;
}

.pagination button:disabled {
  background: #444;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .search-history {
    width: 100%;
  }
}

.no-results-message {
  text-align: center;
  color: #ff6b6b;
  font-size: 1.1rem;
  margin-top: 2rem;
}

.glow-pointer {
  display: inline-block;
  padding: 1rem 2rem;
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
</style>
