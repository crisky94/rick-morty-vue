<script setup>
import ModalDetails from './components/ModalDetails.vue';
import Pagination from './components/Pagination.vue';
import Navbar from './components/Navbar.vue';
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
}

function closeModal() {
  isModalOpen.value = false;
  selectedCharacter.value = {};
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

const handleNoResults = () => {
  noResultsFound.value = true;
  setTimeout(() => {
    noResultsFound.value = false;
  }, 3000);
};



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
      handleNoResults();
    }
  } catch (e) {
    console.error('Error buscando personaje', e);
    filteredCharacters.value = [];
    handleNoResults();
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
      handleNoResults();
    }
  } catch (e) {
    console.error('Error buscando personaje', e);
    handleNoResults();
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
        handleNoResults();
      }
    } catch (error) {
      console.error('Error fetching filtered characters:', error);
      filteredCharacters.value = [];
      handleNoResults();
    }
  } else {
    await fetchCharacters(page);
    filteredCharacters.value = characters.value;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const statusClass = computed(() => (characterStatus) => {
  switch (characterStatus.toLowerCase()) {
    case 'alive':
      return 'status-alive';
    case 'dead':
      return 'status-dead';
    default:
      return 'status-unknown';
  }
});
</script>

<template>
  <Navbar v-model:searchQuery="searchQuery" :searchHistory="searchHistory" :recentCharacter="recentCharacter"
    @openModal="openModal" @closeSearchModal="closeSearchModal" @useHistoryTerm="useHistoryTerm" />
  <main class="main-content">
    <div class="character-grid">
      <div class="character-card glow-pointer" v-for="character in filteredCharacters" :key="character.id"
        @click="openModal(character)">
        <div class="character-image-container">
          <img :src="character.image" :alt="character.name" class="character-image" loading="lazy" />
          <div class="status-badge" :class="statusClass(character.status)">
            <span class="status-dot"></span>
            {{ character.status }}
          </div>
        </div>

        <div class="character-info">
          <h3 class="character-name">{{ character.name }}</h3>

          <div class="character-details">
            <div class="detail-row">
              <span class="label">Species:</span>
              <span class="value">{{ character.species }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Gender:</span>
              <span class="value">{{ character.gender }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="noResultsFound" class="no-results">
          <h3>No characters found</h3>
          <p>Try searching for something else</p>
        </div>
    <ModalDetails :character="selectedCharacter" :isModalOpen="isModalOpen" @close="isModalOpen = false" />
    <Pagination
      v-if="!noResultsFound && searchQuery.length === 0 && characters.length > 5"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @change-page="changePage"
    />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #222;
  color: white;
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
  padding: 20px;
  margin-top: 210px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 100px;
}

.character-card {
  background: #1111;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.character-image-container {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.character-card:hover .character-image {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-alive {
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.status-alive .status-dot {
  background: #27ae60;
}

.status-dead {
  background: rgba(231, 76, 60, 0.9);
  color: white;
}

.status-dead .status-dot {
  background: #c0392b;
}

.status-unknown {
  background: rgba(149, 165, 166, 0.9);
  color: white;
}

.status-unknown .status-dot {
  background: #7f8c8d;
}

.character-info {
  padding: 1.5rem;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.label {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.value {
  color: white;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  word-break: break-word;
}

@media (max-width: 480px) {
  .character-grid{
    margin-top: 250px;
  }
  .character-image-container {
    height: 200px;
  }

  .character-info {
    padding: 1rem;
  }

  .character-name {
    font-size: 1.1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .value {
    text-align: left;
  }
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.no-results h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.glow-pointer {
  display: inline-block;
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