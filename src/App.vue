<script setup>
import ModalDetails from './components/ModalDetails.vue';
import Pagination from './components/Pagination.vue';

const selectedCharacter = ref({});
const isModalOpen = ref(false);
const isSearchModalOpen = ref(false);
const extraCharacter = ref(null);
const noResultsFound = ref(false);
const characters = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const recentCharacter = ref({});
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const searchQuery = ref('');
const searchHistory = ref([]);
const isHistoryVisible = ref(false);

function selectFromHistory(term) {
  searchQuery.value = term;
  isHistoryVisible.value = false;
  useHistoryTerm(term);
}

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

// onMounted(() => {
//   document.addEventListener('click', handleClickOutside);
//   const storedHistory = localStorage.getItem('searchHistory');
//   if (storedHistory) {
//     searchHistory.value = JSON.parse(storedHistory);
//   }
// });
// onMounted(async () => {
//   const storedPage = localStorage.getItem('currentPage');
//   if (storedPage) {
//     currentPage.value = parseInt(storedPage);
//   }

//   await fetchCharacters(currentPage.value);
//   filteredCharacters.value = characters.value; // aquí
// });


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

// const filteredCharacters = computed(() => {
//   const query = (searchQuery.value || '').toLowerCase();
//   const results = characters.value.filter(character =>
//     character.name.toLowerCase().includes(query)
//   );
//   noResultsFound.value = searchQuery.value && results.length === 0;
//   return results;
// });

const filteredCharacters = ref([]);

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

// function showNoResultsMessage() {
//   noResultsFound.value = true

//   // Ocultar después de 3 segundos
//   setTimeout(() => {
//     noResultsFound.value = false
//   }, 2000)
// }
function toggleHistory() {
  isHistoryVisible.value = !isHistoryVisible.value;
}


</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1 class="navbar-title">Rick and Morty Gallery</h1>
      <!-- <div @click="openSearchModal(searchQuery)" class="search-history-container">
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
      </div> -->
          <!-- <div>
        <button class=""
          @click="filteredHistory.length > 0 ? isHistoryVisible = !isHistoryVisible : null">
          Historial de Búsqueda
        </button>
        <ul v-if="isHistoryVisible" class="search-history-dropdown">
          <li v-for="(term, idx) in filteredHistory" :key="idx" @click="useHistoryTerm(term)" style="cursor:pointer;">
            {{ term }}
          </li>
        </ul>
      </div> -->
      <!-- <div class="search-wrapper">
        <input type="text" placeholder="Buscar..." class="search-input" v-model="searchQuery"
          @input="isHistoryVisible = true" @change="openSearchModal(searchQuery)" />
        <button class="close-searchHistory" @click="closeSearchModal">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <path
              d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
          </svg>
        </button>
        <ul v-if="isSearchModalOpen" class="search-history-dropdown">
          <li v-for="(term, index) in filteredCharacters" :key="index" @click="selectFromHistory(term.name)">
            {{ term.name }}
          </li>
        </ul>
      </div> -->
      <!-- <div class="search-wrapper">
  <input
    type="text"
    placeholder="Buscar..."
    class="search-input"
    v-model="searchQuery"
    @input="isHistoryVisible = true"
    @focus="isHistoryVisible = true"
  />
  <span class="search-icon" @click="toggleHistory">
   
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
      <path d="M13 3a9 9 0 1 0 8.9 10h-2.02A7 7 0 1 1 13 5v2l3-3-3-3v2zm1 5h-1v5l4.28 2.54.72-1.21-3.5-2.08V8z"/>
    </svg>
  </span>
  

  <ul v-if="isHistoryVisible && !searchQuery" class="search-history-dropdown">
    
    <li
    v-for="(term, idx) in filteredHistory"
    :key="idx"
    @click="useHistoryTerm(term)"
    style="cursor:pointer;"
    >
    {{ term }}
  </li>
</ul>
</div>
<button class="close-searchHistory" @click="closeSearchModal">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
        <path
          d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
      </svg>
    </button> -->
    <div class="search-wrapper">
  <input
    type="text"
    placeholder="Buscar..."
    class="search-input"
    v-model="searchQuery"
    @input="isHistoryVisible = true"
    @focus="isHistoryVisible = true"
  />
  <div class="search-buttons">
    <button class="close-searchHistory" @click="closeSearchModal" title="Cerrar búsqueda">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
        <path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
      </svg>
    </button>
    <button class="history-btn" @click="toggleHistory" title="Mostrar historial">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
        <path d="M13 3a9 9 0 1 0 8.9 10h-2.02A7 7 0 1 1 13 5v2l3-3-3-3v2zm1 5h-1v5l4.28 2.54.72-1.21-3.5-2.08V8z"/>
      </svg>
    </button>

  </div>

  <ul v-if="isHistoryVisible && !searchQuery" class="search-history-dropdown">
    <li
      v-for="(term, idx) in filteredHistory"
      :key="idx"
      @click="useHistoryTerm(term)"
      style="cursor:pointer;"
    >
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
    <!-- <div>
      <button class="" @click="openSearchModal(searchQuery)">
        Buscar Personaje
      </button>
    </div> -->

  </nav>

  <main class="main-content">
    <!-- <div v-if="extraCharacter && !isSearchModalOpen" @click="openModal(extraCharacter)" class="extra-character">
      <div class="character-card glow-pointer">
        <img :src="extraCharacter.image" :alt="extraCharacter.name" />
        <h2>{{ extraCharacter.name }}</h2>
        <p>{{ extraCharacter.species }}</p>
      </div>
    </div> -->

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
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #121212;
  color: #f5f5f5;
  line-height: 1.6;
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
  padding: 1rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
}

/* 
.search-wrapper {
  position: relative;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 10px; 
  font-size: 14px;
  border: 1px solid #555;
  border-radius: 6px;
  outline: none;
  background-color: #222;
  color: #fff;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10;
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

.close-searchHistory {
  position: absolute;
  top: 7px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
} */
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

/* .main-content {
  padding: 2rem 1rem;
  margin: auto;
  width: 200vw;
  max-width: 1600px;
} */
.main-content {
  padding: 2rem 1rem;
  margin: auto;
  /* width: 200vw; ❌ */
  /* max-width: 1600px; ✅ mantener esto */
  width: 100%;
  max-width: 1600px;
  box-sizing: border-box;
}

/* .character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  justify-content: center;
  padding: 20px;
  margin-top: 80px;
  width: 1600vw;
  max-width: 1600px;
  box-sizing: border-box;
} */
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

/* Responsive */

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }

  .character-grid {
    gap: 16px;
  }

  .search-input {
    font-size: 0.9rem;
  }

  .glow-pointer {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .navbar-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .main-content {
    padding: 0.5rem;
    width: 100%;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    margin: 30px;
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
