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

const isHistoryVisible = ref(false);

const filteredHistory = computed(() => {
    const query = localSearchQuery.value.toLowerCase();
    return props.searchHistory.filter((term) =>
        term.toLowerCase().includes(query)
    );
});

function handleClickOutside(event) {
    if (!event.target.closest('.search-container')) {
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
    isHistoryVisible.value = false;
}

function handleClearSearch() {
    localSearchQuery.value = '';
    isHistoryVisible.value = false;
}

function handleFocusInput() {
    if (localSearchQuery.value === '' || filteredHistory.value.length > 0) {
        isHistoryVisible.value = true;
    }
    return isHistoryVisible.value;
}

const localSearchQuery = computed({
    get: () => props.searchQuery,
    set: (value) => emit('update:searchQuery', value),
});
</script>

<template>
    <nav class="navbar">
        <div class="navbar-content">
            <h1 class="navbar-title">Rick and Morty</h1>
            <div class="search-container">
                <button class="history-button" @click="toggleHistory" title="Mostrar historial">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
                        <path
                            d="M13 3a9 9 0 1 0 8.9 10h-2.02A7 7 0 1 1 13 5v2l3-3-3-3v2zm1 5h-1v5l4.28 2.54.72-1.21-3.5-2.08V8z" />
                    </svg>
                </button>

                <div class="input-area-wrapper">
                    <input type="text" placeholder="Search..." class="search-input" v-model="localSearchQuery"
                        @input="isHistoryVisible = true" @focus="handleFocusInput" />
                    <button v-if="localSearchQuery" class="clear-input-button" @click="handleClearSearch"
                        title="Limpiar búsqueda">
                        X
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
                <p>Last Character:</p>
                <div class="recentCharater" @click="handleUseHistoryTerm(props.recentCharacter?.name)">
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
    margin-bottom: 20px;
}

.navbar-title {
    font-family: "Mountains of Christmas", serif;
    font-weight: 700;
    font-style: normal;
    font-size: 40px;
    color: #0f0;
    padding: 20px 0;
    letter-spacing: -0.02em;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.search-container {
    display: flex;
    align-items: center;
    max-width: 350px;
    gap: 10px;
    position: relative;
}

.history-button {
    background: #222;
    border-radius: 6px;
    cursor: pointer;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    flex-shrink: 0;
}

.history-button:hover {
    color: #0f0;
}

.input-area-wrapper {
    position: relative;
    flex-grow: 1;
    display: flex;
    align-items: center;
}

.search-input {
    color: var(--navbar-text-color);
    width: 100%;
    padding: 0.75rem 1rem; /* Increased padding */
    padding-right: 2.5rem; /* Space for clear button */
    border: 1px solid var(--input-border);
    border-radius: 8px; /* Consistent border-radius */
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--search-bg);
    text-align: left; /* Align text left in input */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
    color: #a0a0a0;
    opacity: 0.8;
}

.search-input:focus {
    outline: none;
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 3px rgba(151, 206, 76, 0.3), inset 0 1px 3px rgba(0, 0, 0, 0.5); /* Glow effect on focus */
    background-color: #222; /* Slightly lighter on focus */
}

.search-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--input-border);
}

.clear-input-button {
    position: absolute;
    right: 0.75rem; /* Adjusted position */
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a0a0a0; /* Softer color */
    cursor: pointer;
    font-size: 1.1em; /* Slightly larger */
    padding: 0.2rem;
    transition: color 0.2s ease;
}

.clear-input-button:hover {
    color: var(--navbar-text-color);
}

.clear-icon {
    width: 18px;
    height: 18px;
    color: currentColor;
}

.search-history-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    background: #2b2b2b;
    border-radius: 0 0 6px 6px;
    z-index: 20;
    max-height: 150px;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
    width: calc(100% - 70px);
    left: 70px;
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

/* Recent Character */
.recentCharater {
    width: 100%;
    display: flex;
    justify-content: center;
}

.recent-character-name {
    cursor: pointer;
    transition: color 0.2s ease;
    font-size: 0.9em;
}

@media (min-width: 768px) {
    .navbar-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
    }

    .navbar-title {
        margin-bottom: 0;
    }

    .search-container {
        width: auto;
        max-width: 400px;
    }

    .search-history-dropdown {
        width: calc(100% - 40px);
        left: 40px;
    }
}
</style>