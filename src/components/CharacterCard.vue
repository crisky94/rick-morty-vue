<script>
export default {
    name: 'CharacterCard',
    props: {
        character: {
            type: Object,
            required: true
        }
    },
    methods: {
        statusClass(status) {
            switch (status.toLowerCase()) {
                case 'alive':
                    return 'status-alive';
                case 'dead':
                    return 'status-dead';
                case 'unknown':
                    return 'status-unknown';
                default:
                    return '';
            }
        },
        handleClick() {
            this.$emit('cardClick', this.character);
        }
    }
};
</script>

<template>
    <div class="character-card glow-pointer"
        @click="handleClick">
        <div class="character-image-container">
            <img :src="character.image" :alt="character.name" class="character-image" loading="lazy" />
            <div class="status-badge" :class="statusClass(character.status)">
                <span class="status-dot"></span>
                {{ character.status }}
            </div>
        </div>

        <div class="character-info">
            <h3 class="character-name">{{ character.name }}</h3>

            <div class="character-details">
                <div class="detail-row">
                    <span class="label">Specie:</span>
                    <span class="value">{{ character.species }}</span>
                </div>

                <div class="detail-row">
                    <span class="label">Gendre:</span>
                    <span class="value">{{ character.gender }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.character-card {
    background: #1111;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
}

.character-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.character-image-container {
    position: relative;
    width: 100%;
    height: 250px;
    overflow: hidden;
}

.character-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.character-card:hover .character-image {
    transform: scale(1.05);
}

.status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-alive {
    background: rgba(46, 204, 113, 0.9);
    color: white;
}

.status-alive .status-dot {
    background: #27ae60;
}

.status-dead {
    background: rgba(231, 76, 60, 0.9);
    color: white;
}

.status-dead .status-dot {
    background: #c0392b;
}

.status-unknown {
    background: rgba(149, 165, 166, 0.9);
    color: white;
}

.status-unknown .status-dot {
    background: #7f8c8d;
}

.character-info {
    padding: 1.5rem;
}

.character-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0 0 1rem 0;
    line-height: 1.3;
}

.character-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.label {
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}

.value {
    color: white;
    font-weight: 500;
    text-align: center;
    line-height: 1.4;
    word-break: break-word;
}

.glow-pointer {
    display: inline-block;
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

@media (max-width: 480px) {
    .character-image-container {
        height: 200px;
    }

    .character-info {
        padding: 1rem;
    }

    .character-name {
        font-size: 1.1rem;
    }

    .detail-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .value {
        text-align: left;
    }
}
</style>