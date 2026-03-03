// Storage Manager Module - LocalStorage wrapper
const STORAGE_KEY = 'pony_math_game';

class StorageManager {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load from storage:', e);
        }
        return this.getDefaultData();
    }

    getDefaultData() {
        return {
            collectedCards: [],
            highScores: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            totalCorrect: 0,
            totalPlayed: 0,
            soundEnabled: true
        };
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save to storage:', e);
        }
    }

    // Card collection
    addCard(cardId) {
        if (!this.data.collectedCards.includes(cardId)) {
            this.data.collectedCards.push(cardId);
            this.save();
            return true; // New card
        }
        return false; // Already had
    }

    hasCard(cardId) {
        return this.data.collectedCards.includes(cardId);
    }

    getCollectedCards() {
        return [...this.data.collectedCards];
    }

    getCollectedCount() {
        return this.data.collectedCards.length;
    }

    // High scores
    updateHighScore(difficulty, score) {
        if (score > this.data.highScores[difficulty]) {
            this.data.highScores[difficulty] = score;
            this.save();
            return true; // New high score
        }
        return false;
    }

    getHighScore(difficulty) {
        return this.data.highScores[difficulty] || 0;
    }

    // Statistics
    recordGame(correct) {
        this.data.totalPlayed++;
        if (correct) {
            this.data.totalCorrect++;
        }
        this.save();
    }

    getStats() {
        return {
            totalPlayed: this.data.totalPlayed,
            totalCorrect: this.data.totalCorrect,
            accuracy: this.data.totalPlayed > 0
                ? Math.round((this.data.totalCorrect / this.data.totalPlayed) * 100)
                : 0
        };
    }

    // Sound setting
    setSoundEnabled(enabled) {
        this.data.soundEnabled = enabled;
        this.save();
    }

    isSoundEnabled() {
        return this.data.soundEnabled !== false;
    }

    // Reset
    reset() {
        this.data = this.getDefaultData();
        this.save();
    }
}

export const storage = new StorageManager();
