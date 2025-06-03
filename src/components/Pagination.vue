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
    gap: 8px; /* Slightly reduced gap for smaller screens */
    margin-top: 20px;
    flex-wrap: wrap; /* Allows buttons to wrap to the next line */
    width: 100%;
    padding: 0 8px; /* Add some horizontal padding to prevent stretching too wide */
    box-sizing: border-box; /* Include padding in the element's total width */
}

.pagination .page-info {
    margin-top: 6px;
    font-size: 0.9em; /* Smaller font size for mobile */
    flex-basis: 100%; /* Makes page info take full width on very small screens */
    text-align: center; /* Center the page info */
    order: -1; /* Puts page info above buttons on very small screens if needed */
    margin-bottom: 8px; /* Space below page info */
}

.pagination button {
    background: #282828;
    color: #fff;
    border: none;
    padding: 2px 2px; /* Slightly more vertical padding for easier tapping */
    font-size: 0.9em; /* Smaller font size for buttons */
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    flex-grow: 1; /* Allow buttons to grow and fill space, especially "Anterior" and "Siguiente" */
    min-width: 60px; /* Ensure a minimum width for buttons */
    max-width: 80px; /* Prevent them from becoming too wide */
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
        gap: 10px; /* Restore original gap */
        padding: 0 20px;
    }

    .pagination .page-info {
        font-size: 1em; /* Restore original font size */
        flex-basis: auto; /* Allow it to sit in line with buttons */
        order: 0; /* Reset order */
        margin-bottom: 0; /* Remove extra margin */
        min-width: unset; /* Don't force min-width */
    }

    .pagination button {
        padding: 6px 12px; /* Restore original padding */
        font-size: 1em; /* Restore original font size */
        flex-grow: 0; /* Don't force growing */
        min-width: unset;
        max-width: unset;
    }
}

/* Larger tablets and desktops */
@media (min-width: 768px) {
    .pagination {
        max-width: 1600px; /* Use the original max-width */
        margin: 20px auto; /* Center the pagination */
    }
}
</style>