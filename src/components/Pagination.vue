<script setup>
const props = defineProps({
    currentPage: Number,
    totalPages: Number,
});

const emit = defineEmits(['change-page']);

function home() {
    emit('change-page', 1);
}

function end() {
    emit('change-page', props.totalPages);
}

function prevPage() {
    if (props.currentPage > 1) {
        emit('change-page', props.currentPage - 1);
    }
}

function nextPage() {
    if (props.currentPage < props.totalPages) {
        emit('change-page', props.currentPage + 1);
    }
}
</script>

<template>
    <div class="pagination">
        <button @click="home" :disabled="currentPage === 1">
            <<< </button>
                <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
                <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
                <button @click="end" :disabled="currentPage === totalPages">>>></button>
    </div>
</template>
<style scoped>
/* Mobile-First Styles */
.pagination {
    color: white;
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    flex-wrap: wrap;
    width: 100%;
    padding: 0 8px;
    box-sizing: border-box; 
}

.pagination .page-info {
    margin-top: 6px;
    font-size: 0.9em;
    flex-basis: 100%;
    text-align: center;
    order: -1; 
    margin-bottom: 8px; 
}

.pagination button {
    background: #282828;
    color: #fff;
    border: none;
    padding: 2px 2px; 
    font-size: 0.9em;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    flex-grow: 1;
    min-width: 60px;
    max-width: 80px;
}

.pagination button:hover {
    background-color: #3b3b3b;
}

.pagination button:disabled {
    background: #444;
    cursor: not-allowed;
}

/* Media Queries for larger screens (Tablet and Desktop) */

/* Small tablets / Larger phones */
@media (min-width: 480px) {
    .pagination {
        gap: 10px;
        padding: 0 20px;
    }

    .pagination .page-info {
        font-size: 1em;
        flex-basis: auto;
        order: 0;
        margin-bottom: 0;
        min-width: unset;
    }

    .pagination button {
        padding: 6px 12px;
        font-size: 1em; 
        flex-grow: 0;
        min-width: unset;
        max-width: unset;
    }
}

/* Larger tablets and desktops */
@media (min-width: 768px) {
    .pagination {
        max-width: 1600px;
        margin: 20px auto; 
    }
}
</style>