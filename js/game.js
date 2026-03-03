// Game Logic Module
import { CONFIG } from './config.js';

export class GameLogic {
    constructor() {
        this.currentDifficulty = null;
        this.score = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.currentQuestion = null;
        this.timer = null;
        this.timeLeft = 0;
    }

    // Initialize game with difficulty
    startGame(difficulty) {
        this.currentDifficulty = CONFIG.difficulties[difficulty];
        this.score = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.timeLeft = this.currentDifficulty.timerSeconds || 0;
        return this.generateQuestion();
    }

    // Generate a new math question
    generateQuestion() {
        const [min, max] = this.currentDifficulty.range;
        const isAddition = Math.random() > 0.5;
        const maxAnswer = max * 2; // For hell mode, max answer can be up to 60

        let num1, num2, answer;

        if (isAddition) {
            // Addition: ensure answer doesn't exceed maxAnswer
            num1 = this.randomInt(min, max);
            num2 = this.randomInt(min, Math.min(max, maxAnswer - num1));
            answer = num1 + num2;
        } else {
            // Subtraction: ensure positive result
            num1 = this.randomInt(Math.max(min, 2), max);
            num2 = this.randomInt(min, num1);
            answer = num1 - num2;
        }

        this.currentQuestion = {
            num1,
            num2,
            operator: isAddition ? '+' : '-',
            answer,
            options: this.generateOptions(answer, maxAnswer)
        };

        // Reset timer for timed modes
        if (this.currentDifficulty.hasTimer) {
            this.timeLeft = this.currentDifficulty.timerSeconds;
        }

        return this.currentQuestion;
    }

    // Generate answer options
    generateOptions(correctAnswer, maxAnswer) {
        const options = new Set([correctAnswer]);

        // Generate wrong answers that are plausible
        while (options.size < 6) {
            let wrongAnswer;
            const variation = Math.floor(Math.random() * 5) + 1;

            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + variation;
            } else {
                wrongAnswer = correctAnswer - variation;
            }

            // Ensure valid range
            if (wrongAnswer >= 0 && wrongAnswer <= maxAnswer && wrongAnswer !== correctAnswer) {
                options.add(wrongAnswer);
            } else {
                // Fallback to random number in valid range
                const fallback = this.randomInt(Math.max(0, correctAnswer - 10), Math.min(maxAnswer, correctAnswer + 10));
                if (fallback !== correctAnswer) {
                    options.add(fallback);
                }
            }
        }

        // Shuffle options
        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    // Check answer
    checkAnswer(selectedAnswer) {
        const correct = selectedAnswer === this.currentQuestion.answer;

        if (correct) {
            this.streak++;
            this.correctCount++;
            this.score += CONFIG.pointsPerCorrect + (this.streak > 1 ? CONFIG.bonusPointsStreak : 0);
        } else {
            this.streak = 0;
        }

        return {
            correct,
            correctAnswer: this.currentQuestion.answer,
            score: this.score,
            streak: this.streak
        };
    }

    // Check if should award card
    shouldAwardCard() {
        return this.correctCount > 0 &&
            this.correctCount % this.currentDifficulty.cardsPerReward === 0;
    }

    // Get cards needed for next reward
    getCardsProgress() {
        const cardsNeeded = this.currentDifficulty.cardsPerReward;
        const current = this.correctCount % cardsNeeded;
        return {
            current,
            needed: cardsNeeded,
            progress: (current / cardsNeeded) * 100
        };
    }

    // Timer tick
    tick() {
        if (this.currentDifficulty.hasTimer && this.timeLeft > 0) {
            this.timeLeft--;
            return {
                timeLeft: this.timeLeft,
                expired: this.timeLeft <= 0
            };
        }
        return { timeLeft: this.timeLeft, expired: false };
    }

    // Get random card to award
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

    // Utility
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Get current state
    getState() {
        return {
            score: this.score,
            streak: this.streak,
            correctCount: this.correctCount,
            timeLeft: this.timeLeft,
            difficulty: this.currentDifficulty
        };
    }
}
