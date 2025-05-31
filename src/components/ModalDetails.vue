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
            <p><strong>Ubicación:</strong> {{ character.location?.name }}</p>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1rem;
}

.modal-content {
    background-color: #f9fafb;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 30vw;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    color: #111827;
    animation: fadeIn 0.3s ease-in-out;
}

/* Responsivo */
@media (max-width: 1024px) {
    .modal-content {
        max-width: 60vw;
        padding: 1.5rem;
    }
}

@media (max-width: 768px) {
    .modal-content {
        max-width: 90vw;
        padding: 1.25rem;
    }
}

@media (max-width: 480px) {
    .modal-content {
        max-width: 98vw;
        padding: 1rem;
    }

    .character-name {
        font-size: 1.1rem;
    }

    .character-image {
        width: 80px;
        height: 80px;
    }
}

.character-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 9999px;
    margin: 0 auto 1rem auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.character-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #1f2937;
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.2rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #374151;
    transition: transform 0.2s ease;
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
</style>
