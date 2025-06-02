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
.pagination {
    color:white;
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    width: 100%;
    max-width: 1600px;
}

.pagination .page-info {
    margin-top: 6px;
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
</style>