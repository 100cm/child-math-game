// Main Application Entry Point
import { CONFIG } from './config.js';
import { GameLogic } from './game.js';
import { soundManager } from './sound.js';
import { storage } from './storage.js';
import { ponyRenderer } from './pony.js';
import { animations } from './animations.js';

class PonyMathGame {
    constructor() {
        this.game = new GameLogic();
        this.currentScreen = 'menu';
        this.timerInterval = null;
        this.currentDifficulty = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderMenuPony();
        this.updateCollectionCount();
    }

    cacheElements() {
        // Screens
        this.screens = {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            collection: document.getElementById('collection-screen')
        };

        // Menu elements
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.viewCollectionBtn = document.getElementById('view-collection');
        this.menuPony = document.getElementById('menu-pony');

        // Game elements
        this.backToMenuBtn = document.getElementById('back-to-menu');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.timerContainer = document.getElementById('timer-container');
        this.streakDisplay = document.getElementById('streak');
        this.gamePony = document.getElementById('game-pony');
        this.num1Display = document.getElementById('num1');
        this.operatorDisplay = document.getElementById('operator');
        this.num2Display = document.getElementById('num2');
        this.answerDisplay = document.getElementById('answer-display');
        this.answerButtonsContainer = document.getElementById('answer-buttons');
        this.progressFill = document.getElementById('progress-fill');
        this.cardsProgress = document.getElementById('cards-progress');
        this.cardsNeeded = document.getElementById('cards-needed');
        this.feedbackOverlay = document.getElementById('feedback-overlay');

        // Collection elements
        this.backFromCollectionBtn = document.getElementById('back-from-collection');
        this.collectionGrid = document.getElementById('collection-grid');
        this.collectedCount = document.getElementById('collected-count');
        this.totalCards = document.getElementById('total-cards');

        // Popup elements
        this.cardPopup = document.getElementById('card-popup');
        this.newCardShowcase = document.getElementById('new-card-showcase');
        this.closeCardPopupBtn = document.getElementById('close-card-popup');

        // Wrong answer popup elements
        this.wrongPopup = document.getElementById('wrong-popup');
        this.sadPonyShowcase = document.getElementById('sad-pony-showcase');
        this.correctAnswerDisplay = document.getElementById('correct-answer-display');
        this.closeWrongPopupBtn = document.getElementById('close-wrong-popup');
    }

    bindEvents() {
        // Difficulty selection
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentDifficulty = btn.dataset.difficulty;
                this.startGame(this.currentDifficulty);
            });
        });

        // Collection view
        this.viewCollectionBtn.addEventListener('click', () => {
            this.showScreen('collection');
            this.renderCollection();
        });

        // Back buttons
        this.backToMenuBtn.addEventListener('click', () => {
            this.endGame();
            this.showScreen('menu');
        });

        this.backFromCollectionBtn.addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Card popup
        this.closeCardPopupBtn.addEventListener('click', () => {
            this.hideCardPopup();
        });

        // Wrong answer popup
        this.closeWrongPopupBtn.addEventListener('click', () => {
            this.hideWrongPopup();
        });

        // Touch/mouse effects
        document.addEventListener('touchstart', this.handleTouch.bind(this), { passive: true });
    }

    handleTouch(e) {
        if (e.touches && e.touches[0]) {
            animations.createRainbowTrail(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    // Screen management
    showScreen(screenName) {
        Object.keys(this.screens).forEach(name => {
            this.screens[name].classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;

        soundManager.play('click');
    }

    // Menu pony rendering
    renderMenuPony() {
        const canvas = ponyRenderer.createPonyCanvas(0, 180);
        this.menuPony.innerHTML = '';
        this.menuPony.appendChild(canvas);
        animations.animatePony(this.menuPony, 'idle');
    }

    // Start game
    startGame(difficulty) {
        const question = this.game.startGame(difficulty);
        const config = CONFIG.difficulties[difficulty];

        // Update UI
        this.showScreen('game');
        this.updateGamePony(config.ponyIndex);
        this.updateQuestion(question);
        this.updateScore();
        this.updateStreak();
        this.updateProgress();

        // Apply background class
        this.screens.game.className = `screen active ${config.bgClass}`;

        // Setup timer
        if (config.hasTimer) {
            this.timerContainer.style.display = 'flex';
            this.startTimer();
        } else {
            this.timerContainer.style.display = 'none';
        }

        // Set cards needed
        this.cardsNeeded.textContent = config.cardsPerReward;
    }

    // Update game pony
    updateGamePony(ponyIndex, mood = 'happy') {
        const canvas = ponyRenderer.createPonyCanvas(ponyIndex, 100, mood);
        this.gamePony.innerHTML = '';
        this.gamePony.appendChild(canvas);
        animations.animatePony(this.gamePony, 'idle');
    }

    // Update question display
    updateQuestion(question) {
        this.num1Display.textContent = question.num1;
        this.operatorDisplay.textContent = question.operator;
        this.num2Display.textContent = question.num2;
        this.answerDisplay.textContent = '?';

        animations.animateNumber(this.num1Display);
        animations.animateNumber(this.num2Display);

        // Generate answer buttons
        this.renderAnswerButtons(question.options);
    }

    // Render answer buttons
    renderAnswerButtons(options) {
        this.answerButtonsContainer.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleAnswer(option, btn));
            this.answerButtonsContainer.appendChild(btn);
        });
    }

    // Handle answer selection
    handleAnswer(selectedAnswer, button) {
        // Disable all buttons temporarily
        const allButtons = this.answerButtonsContainer.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.disabled = true);

        const result = this.game.checkAnswer(selectedAnswer);

        // Show answer in display
        this.answerDisplay.textContent = selectedAnswer;

        // Visual feedback
        if (result.correct) {
            button.classList.add('correct');
            soundManager.play('correct');
            animations.animatePony(this.gamePony, 'happy');
            animations.showFeedback(this.feedbackOverlay, true);
            animations.createFloatingHearts(
                button.getBoundingClientRect().left + button.offsetWidth / 2,
                button.getBoundingClientRect().top
            );

            storage.recordGame(true);

            // Check for card reward
            if (this.game.shouldAwardCard()) {
                setTimeout(() => this.awardCard(), 600);
            }
        } else {
            button.classList.add('wrong');
            soundManager.play('wrong');

            // Show sad pony with tears
            const config = CONFIG.difficulties[this.currentDifficulty];
            this.updateGamePony(config.ponyIndex, 'sad');
            animations.animatePony(this.gamePony, 'sad');

            // Highlight correct button
            allButtons.forEach(btn => {
                if (parseInt(btn.textContent) === result.correctAnswer) {
                    btn.style.boxShadow = '0 0 20px rgba(39, 174, 96, 0.8)';
                    btn.style.border = '3px solid #27ae60';
                    btn.style.transform = 'scale(1.1)';
                }
            });

            // Show wrong answer popup
            this.showWrongPopup(result.correctAnswer);

            storage.recordGame(false);
        }

        // Update displays
        this.updateScore();
        this.updateStreak();
        this.updateProgress();

        // Next question after delay (only for correct answers, wrong answers wait for popup close)
        if (result.correct) {
            setTimeout(() => {
                const nextQuestion = this.game.generateQuestion();
                this.updateQuestion(nextQuestion);

                // Reset timer for timed modes
                if (this.game.currentDifficulty.hasTimer) {
                    this.resetTimer();
                }
            }, 800);
        }
    }

    // Timer management
    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            const result = this.game.tick();
            this.updateTimerDisplay();

            if (result.expired) {
                this.handleTimeUp();
            } else if (result.timeLeft <= 3) {
                this.timerDisplay.parentElement.classList.add('timer-warning');
            }
        }, 1000);
    }

    resetTimer() {
        this.timerDisplay.parentElement.classList.remove('timer-warning');
        this.updateTimerDisplay();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.game.timeLeft;
    }

    handleTimeUp() {
        // Treat as wrong answer
        const result = this.game.checkAnswer(-1);
        soundManager.play('wrong');

        // Show sad pony
        const config = CONFIG.difficulties[this.currentDifficulty];
        this.updateGamePony(config.ponyIndex, 'sad');
        animations.animatePony(this.gamePony, 'sad');

        this.timerDisplay.parentElement.classList.add('shake');
        setTimeout(() => {
            this.timerDisplay.parentElement.classList.remove('shake');
        }, 300);

        // Show correct answer
        const correctAnswer = this.game.currentQuestion.answer;
        this.answerDisplay.textContent = correctAnswer;
        this.answerDisplay.style.color = '#27ae60';

        // Show wrong popup for time up too
        this.showWrongPopup(correctAnswer);

        this.updateScore();
        this.updateStreak();
        storage.recordGame(false);
    }

    // Show wrong answer popup
    showWrongPopup(correctAnswer) {
        // Draw sad pony in popup
        const config = CONFIG.difficulties[this.currentDifficulty];
        const canvas = ponyRenderer.createPonyCanvas(config.ponyIndex, 100, 'sad');
        this.sadPonyShowcase.innerHTML = '';
        this.sadPonyShowcase.appendChild(canvas);

        // Set correct answer
        this.correctAnswerDisplay.textContent = correctAnswer;

        // Show popup
        this.wrongPopup.classList.remove('hidden');

        // Pause timer during popup
        this.stopTimer();
    }

    hideWrongPopup() {
        this.wrongPopup.classList.add('hidden');

        // Reset pony to happy
        const config = CONFIG.difficulties[this.currentDifficulty];
        this.updateGamePony(config.ponyIndex, 'happy');
        this.answerDisplay.style.color = '';
        this.answerDisplay.style.animation = '';

        // Generate next question
        const nextQuestion = this.game.generateQuestion();
        this.updateQuestion(nextQuestion);

        // Resume timer if needed
        if (this.game.currentDifficulty && this.game.currentDifficulty.hasTimer) {
            this.resetTimer();
            this.startTimer();
        }
    }

    // Update displays
    updateScore() {
        this.scoreDisplay.textContent = this.game.score;
    }

    updateStreak() {
        this.streakDisplay.textContent = this.game.streak;
    }

    updateProgress() {
        const progress = this.game.getCardsProgress();
        this.progressFill.style.width = `${progress.progress}%`;
        this.cardsProgress.textContent = progress.current;
    }

    // Card reward
    awardCard() {
        const collectedCards = storage.getCollectedCards();
        const cardId = this.game.getRandomCard(collectedCards);
        const isNew = storage.addCard(cardId);

        soundManager.play('collect');
        animations.createConfetti(40);

        this.showCardPopup(cardId, isNew);
        this.updateCollectionCount();
    }

    showCardPopup(cardId, isNew) {
        this.newCardShowcase.innerHTML = '';

        const ponyCard = ponyRenderer.createImageCard(cardId - 1, 150);
        ponyCard.classList.add('card-collect');
        this.newCardShowcase.appendChild(ponyCard);

        const popup = this.cardPopup;
        popup.classList.remove('hidden');

        // Pause timer during popup
        this.stopTimer();
    }

    hideCardPopup() {
        this.cardPopup.classList.add('hidden');

        // Resume timer if needed
        if (this.game.currentDifficulty && this.game.currentDifficulty.hasTimer) {
            this.startTimer();
        }
    }

    // Collection
    renderCollection() {
        this.collectionGrid.innerHTML = '';
        const collectedCards = storage.getCollectedCards();

        CONFIG.cards.forEach((card, index) => {
            const cardId = index + 1;
            const isCollected = collectedCards.includes(cardId);

            const cardElement = document.createElement('div');
            cardElement.className = `collection-card ${isCollected ? 'collected' : 'locked'}`;

            // Always show the card image
            const ponyCard = ponyRenderer.createImageCard(index, 100);

            // Add lock overlay inside pony-card for uncollected cards
            if (!isCollected) {
                const lockOverlay = document.createElement('div');
                lockOverlay.className = 'lock-overlay';
                lockOverlay.innerHTML = '🔒';
                ponyCard.appendChild(lockOverlay);
            }

            cardElement.appendChild(ponyCard);
            this.collectionGrid.appendChild(cardElement);
        });
    }

    updateCollectionCount() {
        this.collectedCount.textContent = storage.getCollectedCount();
        this.totalCards.textContent = CONFIG.cards.length;
    }

    // End game
    endGame() {
        this.stopTimer();

        // Save high score
        if (this.currentDifficulty) {
            storage.updateHighScore(this.currentDifficulty, this.game.score);
        }

        // Reset game screen
        this.screens.game.className = 'screen';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PonyMathGame();
});
