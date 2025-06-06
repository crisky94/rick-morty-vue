<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
    character: Object,
    isModalOpen: Boolean
});

const emit = defineEmits(['close']);

const episodeNames = ref([]);
const isLoadingEpisodes = ref(false);


async function fetchEpisodeNames(episodeUrls) {
    isLoadingEpisodes.value = true;
    try {
        const episodePromises = episodeUrls.map(url => fetch(url).then(res => res.json()));
        const episodesData = await Promise.all(episodePromises);
        episodeNames.value = episodesData.map(episode => episode.name);
    } catch (error) {
        console.error('Error fetching episode names:', error);
        episodeNames.value = ['Error al cargar episodios'];
    } finally {
        isLoadingEpisodes.value = false;
    }
}

watch(() => props.isModalOpen, (newVal) => {
    if (newVal && props.character?.episode && props.character.episode.length > 0) {
        fetchEpisodeNames(props.character.episode);
    } else if (!newVal) {
        episodeNames.value = [];
    }
}, { immediate: true }); 
</script>

<template>
    <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-content">
            <button @click="emit('close')" class="close-button" aria-label="Cerrar modal">✖</button>
            <img :src="character.image" :alt="character.name" class="character-image" v-if="character.image" />
            <h1 class="character-name">{{ character.name }}</h1>
            <p><strong>Ubicación:</strong> {{ character.location?.name }}</p>
            <p class="episode-title">Episodio(s):</p>
            <ul :class="{ 'episode-list-clean': true }">
                <li v-for="(name, index) in episodeNames" :key="index">
                    {{ name }}
                </li>
            </ul>
        </div>
    </div>
</template>
<style scoped>
/* Variables para colores y sombras */
:root {
    --primary-text: #1f2937;
    --secondary-text: #374151;
    --background-light: #f9fafb;
    --background-dark: #1f2937; /* Darker background for episode list */
    --accent-color: #4CAF50; /* A nice green accent */
    --border-color: #e5e7eb;
    --shadow-light: rgba(0, 0, 0, 0.1);
    --shadow-medium: rgba(0, 0, 0, 0.2);
}

/* Base Styles (Mobile-First) */
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000; /* Adjusted z-index for common modal layering */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6); /* Slightly darker overlay */
    padding: 1rem;
    backdrop-filter: blur(4px); /* Subtle blur for depth */
}

.modal-content {
    background-color: var(--background-light);
    border-radius: 12px; /* Slightly more rounded corners */
    padding: 1.5rem;
    max-width: 95vw;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 25px var(--shadow-medium); /* More pronounced shadow */
    text-align: center;
    color: var(--primary-text);
    animation: fadeInScale 0.3s ease-out forwards; /* New animation */
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Spacing between sections */
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text);
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.close-button:hover {
    background-color: var(--border-color);
    color: var(--primary-text);
    transform: rotate(90deg); /* Little spin effect */
}

.close-button svg {
    width: 24px;
    height: 24px;
}

.modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
}

.character-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 9999px;
    margin: 0 auto 10px auto;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}


.character-image:hover {
    transform: scale(1.05); /* Slight zoom on hover */
}

.character-name {
    font-size: 1.8em; /* Larger name */
    font-weight: 800; /* Bolder */
    margin-bottom: 0.5rem;
    color: var(--primary-text);
    line-height: 1.2;
}

.character-location {
    font-size: 1em;
    color: var(--secondary-text);
    margin-bottom: 0.5rem;
}

.modal-body {
    flex-grow: 1; /* Allows body to take available space */
}

.episode-title {
    font-weight: 700;
    font-size: 1.1em;
    color: var(--primary-text);
    margin-bottom: 0.8rem;
    position: relative;
}

.episode-title::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background-color: var(--accent-color); /* Underline accent */
    border-radius: 2px;
}

.episode-list-clean {
    color: white;
    list-style: none;
    padding: 0 10px;
    margin: 15px 0;
    max-height: 250px;
    overflow-y: auto;
    border-top: 2px solid #0f0;
    border-bottom: 2px solid #0f0;
    background-color: #111;
    border-radius: 5px;
}

/* Animations */
@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Media Queries (Mobile-First Approach) */

/* Small devices (e.g., phones in landscape, larger phones) */
@media (min-width: 480px) {
    .modal-content {
        padding: 2rem;
        max-width: 80vw;
    }

    .character-image {
        width: 120px;
        height: 120px;
    }

    .character-name {
        font-size: 2.2em;
    }
}

/* Medium devices (tablets) */
@media (min-width: 768px) {
    .modal-content {
        max-width: 500px; /* Fixed max-width for better control */
        padding: 2.5rem;
    }

    .character-image {
        width: 140px;
        height: 140px;
    }

    .character-name {
        font-size: 2.5em;
    }

    .close-button {
        top: 1.5rem;
        right: 1.5rem;
    }
}

/* Large devices (desktops) */
@media (min-width: 1024px) {
    .modal-content {
        max-width: 550px; /* Slightly larger on desktops */
    }
}
</style>