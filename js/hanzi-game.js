// Hanzi Game Logic Module
// 认字游戏逻辑

import { HANZI_DIFFICULTY, getHanziByDifficulty, getAllHanzi } from './hanzi-data.js';
import { CONFIG } from './config.js';

export class HanziGameLogic {
    constructor() {
        this.currentDifficulty = null;
        this.difficultyConfig = null;
        this.score = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.currentQuestion = null;
        this.timer = null;
        this.timeLeft = 0;
        this.hanziPool = [];
        this.usedIndices = new Set();
    }

    // Initialize game with difficulty
    startGame(difficulty) {
        this.currentDifficulty = difficulty;
        this.difficultyConfig = HANZI_DIFFICULTY[difficulty];
        this.score = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.timeLeft = this.difficultyConfig.timerSeconds || 0;
        this.hanziPool = getHanziByDifficulty(difficulty);
        this.usedIndices.clear();

        return this.generateQuestion();
    }

    // Generate a new question
    generateQuestion() {
        if (this.hanziPool.length === 0) {
            return null;
        }

        // Pick a random hanzi that hasn't been used recently
        let targetIndex;
        const maxAttempts = 50;
        let attempts = 0;

        // Reset used indices if we've used too many
        if (this.usedIndices.size >= Math.min(this.hanziPool.length * 0.7, 30)) {
            this.usedIndices.clear();
        }

        do {
            targetIndex = this.randomInt(0, this.hanziPool.length - 1);
            attempts++;
        } while (this.usedIndices.has(targetIndex) && attempts < maxAttempts);

        this.usedIndices.add(targetIndex);

        const target = this.hanziPool[targetIndex];
        const options = this.generateOptions(target, targetIndex);

        this.currentQuestion = {
            target,
            emoji: target.emoji,
            correctAnswer: target.char,
            options,
            pinyin: target.pinyin
        };

        // Reset timer for timed modes
        if (this.difficultyConfig.hasTimer) {
            this.timeLeft = this.difficultyConfig.timerSeconds;
        }

        return this.currentQuestion;
    }

    // Generate answer options (1 correct + 3 wrong)
    generateOptions(target, targetIndex) {
        const options = [target.char];
        const allHanzi = getAllHanzi();
        const usedChars = new Set([target.char]);

        // Generate 3 wrong answers
        let attempts = 0;
        while (options.length < 4 && attempts < 100) {
            const randomIndex = this.randomInt(0, allHanzi.length - 1);
            const candidate = allHanzi[randomIndex];

            // Avoid using the same character
            if (!usedChars.has(candidate.char)) {
                // Prefer similar length characters for harder difficulty
                const targetLen = target.char.length;
                const candidateLen = candidate.char.length;

                // For easy mode, accept similar length
                // For hard mode, accept any length
                if (this.currentDifficulty === 'easy' && Math.abs(targetLen - candidateLen) <= 1) {
                    options.push(candidate.char);
                    usedChars.add(candidate.char);
                } else if (this.currentDifficulty !== 'easy') {
                    options.push(candidate.char);
                    usedChars.add(candidate.char);
                }
            }
            attempts++;
        }

        // Fallback: fill with any remaining characters if needed
        while (options.length < 4) {
            for (const item of allHanzi) {
                if (!usedChars.has(item.char)) {
                    options.push(item.char);
                    usedChars.add(item.char);
                    if (options.length >= 4) break;
                }
            }
            break;
        }

        // Shuffle options
        return this.shuffle(options);
    }

    // Check answer
    checkAnswer(selectedAnswer) {
        const correct = selectedAnswer === this.currentQuestion.correctAnswer;

        if (correct) {
            this.streak++;
            this.correctCount++;
            this.score += CONFIG.pointsPerCorrect + (this.streak > 1 ? CONFIG.bonusPointsStreak : 0);
        } else {
            this.streak = 0;
        }

        return {
            correct,
            correctAnswer: this.currentQuestion.correctAnswer,
            pinyin: this.currentQuestion.pinyin,
            score: this.score,
            streak: this.streak
        };
    }

    // Check if should award card
    shouldAwardCard() {
        return this.correctCount > 0 &&
            this.correctCount % this.difficultyConfig.cardsPerReward === 0;
    }

    // Get cards needed for next reward
    getCardsProgress() {
        const cardsNeeded = this.difficultyConfig.cardsPerReward;
        const current = this.correctCount % cardsNeeded;
        return {
            current,
            needed: cardsNeeded,
            progress: (current / cardsNeeded) * 100
        };
    }

    // Timer tick
    tick() {
        if (this.difficultyConfig.hasTimer && this.timeLeft > 0) {
            this.timeLeft--;
            return {
                timeLeft: this.timeLeft,
                expired: this.timeLeft <= 0
            };
        }
        return { timeLeft: this.timeLeft, expired: false };
    }

    // Get random card to award (reuse from math game)
    getRandomCard(collectedCards) {
        const totalCards = CONFIG.cards.length;
        const uncollected = [];

        for (let i = 1; i <= totalCards; i++) {
            if (!collectedCards.includes(i)) {
                uncollected.push(i);
            }
        }

        // If all collected, give random duplicate
        if (uncollected.length === 0) {
            return this.randomInt(1, totalCards);
        }

        // Give uncollected card
        return uncollected[this.randomInt(0, uncollected.length - 1)];
    }

    // Utility functions
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // Get current state
    getState() {
        return {
            score: this.score,
            streak: this.streak,
            correctCount: this.correctCount,
            timeLeft: this.timeLeft,
            difficulty: this.difficultyConfig
        };
    }

    // Get difficulty config (for compatibility with main.js)
    get currentDifficultyConfig() {
        return this.difficultyConfig;
    }
}
