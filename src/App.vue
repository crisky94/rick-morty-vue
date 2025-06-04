<script setup>
import ModalDetails from './components/ModalDetails.vue';
import Pagination from './components/Pagination.vue';
import Navbar from './components/Navbar.vue';
import "./assets/styles/mediquerie-app.css"
import { ref, onMounted, onUnmounted, watch } from 'vue';

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

</script>

<template>
  <Navbar
    v-model:searchQuery="searchQuery"
    :searchHistory="searchHistory"
    :recentCharacter="recentCharacter"
    @openModal="openModal"
    @closeSearchModal="closeSearchModal"
    @useHistoryTerm="useHistoryTerm"
    />
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

<style>
/* Base Styles (Mobile-First) */
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
  margin-top: 150px;
}

/* .character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 55px;
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
  margin-top: 65px;
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
} */
.character-card {
  /* Remove max-width: 180px; */
  width: 90%; /* Keep this to ensure it fills its grid cell */
  border-radius: 8px;
  text-align: center;
  background: none; /* Consider adding a background color if you want cards to stand out */
  box-shadow: none;
  color: #eee;
  padding: 10px;
  /* Add flex properties if you want the content inside the card to align */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Or space-between */
}

.character-grid {
  display: grid;
  /*
  Consider increasing the minmax for columns slightly,
  or let the cards be more flexible without a hard max-width on them.
  For example, allowing columns to be 200px minimum or more.
  */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjusted min-width for columns */
  gap: 20px;
  padding: 20px 10px; /* Reduce padding on grid for better mobile use, or use percentages */
  width: 100%;
  max-width: 1400px;
  box-sizing: border-box;
  margin: 40px auto 0; /* Center the grid */
}
/* .character-card img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  background: #222;
} */
.character-card img {
  width: 80%; /* Makes image 80% of the card's width */
  max-width: 120px; /* Prevents images from getting too big on huge screens */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover;
  border-radius: 6px;
  background: #222;
  margin-bottom: 10px; /* Add some space below the image */
}
/* .character-card h2 {
  font-size: 1em;
  color: #eee;
  margin-top: 10px;
  margin-bottom: 5px;
}

.character-card p {
  color: #efe4e4;
  margin: 5px 0 10px 0;
  font-size: 0.8em;
} */
/* If your base font size is 16px (default), then 1em is 16px.
   If it still feels too small, you can increase it. */
.character-card h2 {
  font-size: 1.1em; /* Slightly larger */
  color: #eee;
  margin-top: 10px;
  margin-bottom: 5px;
}

.character-card p {
  font-size: 0.9em; /* Slightly larger */
  color: #efe4e4;
  margin: 5px 0 10px 0;
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
</style>