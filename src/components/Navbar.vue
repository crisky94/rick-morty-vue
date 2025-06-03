<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    searchQuery: String,
    searchHistory: Array,
    recentCharacter: Object,
});

const emit = defineEmits([
    'update:searchQuery',
    'openModal',
    'closeSearchModal',
    'useHistoryTerm',
    'toggleHistory'
]);

const localSearchQuery = computed({
    get: () => props.searchQuery,
    set: (value) => emit('update:searchQuery', value),
});

const isHistoryVisible = ref(false);

const filteredHistory = computed(() => {
    const query = localSearchQuery.value.toLowerCase();
    return props.searchHistory.filter((term) =>
        term.toLowerCase().includes(query)
    );
});

function handleClickOutside(event) {
    if (!event.target.closest('.search-wrapper')) {
        isHistoryVisible.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

function toggleHistory() {
    isHistoryVisible.value = !isHistoryVisible.value;
}

function handleUseHistoryTerm(term) {
    emit('useHistoryTerm', term);
    isHistoryVisible.value = false; // Hide history after selecting a term
}

function handleOpenModal(character) {
    emit('openModal', character);
}

function handleCloseSearchModal() {
    emit('closeSearchModal');
}
</script>

<template>
    <nav class="navbar">
        <div class="navbar-content">
            <h1 class="navbar-title">Rick and Morty Gallery</h1>
            <div class="search-wrapper">
                <input type="text" placeholder="Buscar..." class="search-input" v-model="localSearchQuery"
                    @input="isHistoryVisible = true" @focus="isHistoryVisible = true" />
                <div class="search-buttons">
                    <button class="history-btn" @click="toggleHistory" title="Mostrar historial">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
                            <path
                                d="M13 3a9 9 0 1 0 8.9 10h-2.02A7 7 0 1 1 13 5v2l3-3-3-3v2zm1 5h-1v5l4.28 2.54.72-1.21-3.5-2.08V8z" />
                        </svg>
                    </button>
                    <button class="close-searchHistory" @click="handleCloseSearchModal" title="Cerrar búsqueda">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#e8eaed">
                            <path
                                d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
                        </svg>
                    </button>
                </div>
                <ul v-if="isHistoryVisible && localSearchQuery === '' && filteredHistory.length > 0"
                    class="search-history-dropdown">
                    <li v-for="(term, idx) in filteredHistory" :key="idx" @click="handleUseHistoryTerm(term)">
                        {{ term }}
                    </li>
                </ul>
            </div>
            <div v-if="props.recentCharacter?.name">
                <p>Personaje visto recientemente:</p>
                <div class="character-card" @click="handleOpenModal(props.recentCharacter)">
                    <h2 class="recent-character-name">{{ props.recentCharacter.name }}</h2>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
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
    width: 80%;
    max-width: 250px;
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
</style>