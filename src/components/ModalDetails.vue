<script setup>
defineProps({
    character: Object,
    isModalOpen: Boolean
});

const emit = defineEmits(['close']);
</script>

<template>
    <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-content">
            <button @click="emit('close')" class="close-button" aria-label="Cerrar modal">✖</button>
            <img :src="character.image" :alt="character.name" class="character-image" v-if="character.image" />
            <h1 class="character-name">{{ character.name }}</h1>
            <p><strong>Género:</strong> {{ character.gender }}</p>
            <p><strong>Estado:</strong> {{ character.status }}</p>
            <p><strong>Especie:</strong> {{ character.species }}</p>
            <p><strong>Ubicación:</strong> {{ character.location?.name }}</p>
        </div>
    </div>
</template>

<style scoped>
/* Base Styles (Mobile-First) */
/* These styles apply to the smallest screens by default */
.modal-overlay {
    position: fixed;
    inset: 0; /* Shorthand for top, right, bottom, left: 0 */
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10px; /* Padding around the modal for very small screens */
}

.modal-content {
    background-color: #f9fafb;
    border-radius: 10px;
    padding: 15px; /* Default padding for mobile */
    max-width: 95vw; /* Allow it to take up most of the viewport width */
    width: 100%; /* Ensure it fills max-width */
    max-height: 90vh;
    overflow-y: auto; /* Enable scrolling if content overflows */
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Lighter shadow for mobile */
    text-align: center;
    color: #111827;
    animation: fadeIn 0.3s ease-in-out;
}

.character-image {
    width: 80px; /* Smaller image for mobile */
    height: 80px;
    object-fit: cover;
    border-radius: 9999px; /* Makes it a perfect circle */
    margin: 0 auto 10px auto;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Lighter shadow */
}

.character-name {
    font-size: 1.2em; /* Adjusted font size for mobile, relative to parent */
    font-weight: 700;
    margin-bottom: 8px; /* Slightly less margin */
    color: #1f2937;
}

.modal-content p {
    font-size: 0.9em; /* Smaller paragraph text for mobile */
    margin-bottom: 5px; /* Reduce space between paragraphs */
}

.close-button {
    position: absolute;
    top: 8px; /* Adjusted closer to corner */
    right: 8px; /* Adjusted closer to corner */
    font-size: 1.2em; /* A bit larger for easier tapping */
    background: transparent;
    border: none;
    cursor: pointer;
    color: #374151;
    transition: transform 0.2s ease;
    padding: 5px; /* Add padding for larger tap area */
}

.close-button:hover {
    transform: scale(1.2);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Media Queries (Mobile-First Approach) */

/* Small devices (e.g., phones in landscape, larger phones) */
@media (min-width: 480px) {
    .modal-content {
        padding: 20px; /* Slightly more padding */
        max-width: 80vw; /* Take up less width */
    }

    .character-image {
        width: 100px; /* Original size for larger screens */
        height: 100px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Restore original shadow */
    }

    .character-name {
        font-size: 1.5em; /* Original size */
        margin-bottom: 10px;
    }

    .modal-content p {
        font-size: 1em; /* Restore original paragraph font size */
        margin-bottom: 8px;
    }

    .close-button {
        font-size: 1.5em; /* Restore original close button size */
        top: 10px;
        right: 10px;
        padding: initial; /* Remove extra padding added for mobile */
    }
}

/* Medium devices (tablets) */
@media (min-width: 768px) {
    .modal-content {
        max-width: 60vw; /* Further reduce width */
        padding: 25px;
    }
}

/* Large devices (desktops) */
@media (min-width: 1024px) {
    .modal-content {
        max-width: 30vw; /* Restore original desktop width */
        padding: 30px; /* More padding for larger modal */
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Restore original shadow */
    }
}
</style>
