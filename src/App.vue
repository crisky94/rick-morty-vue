<script setup>
import ModalDetails from './components/ModalDetails.vue';
import Pagination from './components/Pagination.vue';
import Navbar from './components/Navbar.vue';
import CharacterCard from './components/CharacterCard.vue';
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
      <CharacterCard v-for="character in filteredCharacters" :character="character" @click="openModal(character)" :key="character.id" @cardClick="openModal" />
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

@media (max-width: 480px) {
  .character-grid{
    margin-top: 250px;
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
</style>