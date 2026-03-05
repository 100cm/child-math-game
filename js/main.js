// Main Application Entry Point
import { CONFIG } from './config.js';
import { GameLogic } from './game.js';
import { HanziGameLogic } from './hanzi-game.js';
import { HANZI_DIFFICULTY } from './hanzi-data.js';
import { soundManager } from './sound.js';
import { storage } from './storage.js';
import { ponyRenderer } from './pony.js';
import { animations } from './animations.js';

class PonyMathGame {
    constructor() {
        this.game = new GameLogic();
        this.hanziGame = new HanziGameLogic();
        this.currentScreen = 'menu';
        this.timerInterval = null;
        this.currentDifficulty = null;
        this.currentGameMode = 'math'; // 'math' or 'hanzi'

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
            collection: document.getElementById('collection-screen'),
            hanziDifficulty: document.getElementById('hanzi-difficulty-screen'),
            hanziGame: document.getElementById('hanzi-game-screen')
        };

        // Menu elements
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn[data-difficulty]');
        this.viewCollectionBtn = document.getElementById('view-collection');
        this.menuPony = document.getElementById('menu-pony');
        this.hanziGameBtn = document.getElementById('hanzi-game');

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
        this.correctAnswerBox = document.getElementById('correct-answer-box');
        this.wrongTitle = document.getElementById('wrong-title');
        this.revealAnswerBtn = document.getElementById('reveal-answer-btn');
        this.closeWrongPopupBtn = document.getElementById('close-wrong-popup');

        // Hanzi game elements
        this.hanziDifficultyButtons = document.querySelectorAll('.difficulty-btn[data-hanzi-difficulty]');
        this.backFromHanziDifficultyBtn = document.getElementById('back-from-hanzi-difficulty');
        this.backFromHanziGameBtn = document.getElementById('back-from-hanzi-game');
        this.hanziMenuPony = document.getElementById('hanzi-menu-pony');
        this.hanziScoreDisplay = document.getElementById('hanzi-score');
        this.hanziTimerDisplay = document.getElementById('hanzi-timer');
        this.hanziTimerContainer = document.getElementById('hanzi-timer-container');
        this.hanziStreakDisplay = document.getElementById('hanzi-streak');
        this.hanziGamePony = document.getElementById('hanzi-game-pony');
        this.emojiDisplay = document.getElementById('emoji-display');
        this.hanziAnswerButtonsContainer = document.getElementById('hanzi-answer-buttons');
        this.hanziProgressFill = document.getElementById('hanzi-progress-fill');
        this.hanziCardsProgress = document.getElementById('hanzi-cards-progress');
        this.hanziCardsNeeded = document.getElementById('hanzi-cards-needed');
        this.hanziFeedbackOverlay = document.getElementById('hanzi-feedback-overlay');
    }

    bindEvents() {
        // Math difficulty selection
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentDifficulty = btn.dataset.difficulty;
                this.currentGameMode = 'math';
                this.startGame(this.currentDifficulty);
            });
        });

        // Hanzi game entry
        this.hanziGameBtn.addEventListener('click', () => {
            this.showScreen('hanziDifficulty');
            this.renderHanziMenuPony();
        });

        // Hanzi difficulty selection
        this.hanziDifficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentDifficulty = btn.dataset.hanziDifficulty;
                this.currentGameMode = 'hanzi';
                this.startHanziGame(this.currentDifficulty);
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

        this.backFromHanziDifficultyBtn.addEventListener('click', () => {
            this.showScreen('menu');
        });

        this.backFromHanziGameBtn.addEventListener('click', () => {
            this.endHanziGame();
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

        // Reveal answer button
        this.revealAnswerBtn.addEventListener('click', () => {
            this.revealAnswer();
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

        // Check if medium difficulty - hide answer initially
        const hideAnswer = this.currentDifficulty === 'medium';
        this.showWrongPopup(correctAnswer, hideAnswer);

        this.updateScore();
        this.updateStreak();
        this.updateProgress();
        storage.recordGame(false);
    }

    // Show wrong answer popup
    showWrongPopup(correctAnswer, hideAnswer = false) {
        // Store correct answer for later reveal
        this.pendingCorrectAnswer = correctAnswer;

        // Draw sad pony in popup (handle both math and hanzi modes)
        let ponyIndex = 0;
        if (this.currentGameMode === 'math') {
            const config = CONFIG.difficulties[this.currentDifficulty];
            ponyIndex = config ? config.ponyIndex : 0;
        }

        const canvas = ponyRenderer.createPonyCanvas(ponyIndex, 100, 'sad');
        this.sadPonyShowcase.innerHTML = '';
        this.sadPonyShowcase.appendChild(canvas);

        if (hideAnswer) {
            // Hide answer initially, show reveal button
            this.wrongTitle.textContent = '⏰ 时间到~';
            this.correctAnswerBox.style.display = 'none';
            this.revealAnswerBtn.style.display = 'block';
            this.closeWrongPopupBtn.style.display = 'none';
        } else {
            // Show answer directly
            this.wrongTitle.textContent = '😢 答错啦~';
            this.correctAnswerDisplay.textContent = correctAnswer;
            this.correctAnswerBox.style.display = 'block';
            this.revealAnswerBtn.style.display = 'none';
            this.closeWrongPopupBtn.style.display = 'block';
        }

        // Show popup
        this.wrongPopup.classList.remove('hidden');

        // Pause timer during popup
        this.stopTimer();
    }

    // Reveal the hidden answer
    revealAnswer() {
        this.correctAnswerDisplay.textContent = this.pendingCorrectAnswer;
        this.correctAnswerBox.style.display = 'block';
        this.revealAnswerBtn.style.display = 'none';
        this.closeWrongPopupBtn.style.display = 'block';
    }

    hideWrongPopup() {
        this.wrongPopup.classList.add('hidden');

        if (this.currentGameMode === 'hanzi') {
            // Reset pony to happy
            this.updateHanziGamePony(0, 'happy');

            // Generate next question
            const nextQuestion = this.hanziGame.generateQuestion();
            this.updateHanziQuestion(nextQuestion);

            // Resume timer if needed
            if (this.hanziGame.currentDifficultyConfig && this.hanziGame.currentDifficultyConfig.hasTimer) {
                this.resetHanziTimer();
                this.startHanziTimer();
            }
        } else {
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
        if (this.currentGameMode === 'hanzi') {
            if (this.hanziGame.currentDifficultyConfig && this.hanziGame.currentDifficultyConfig.hasTimer) {
                this.startHanziTimer();
            }
        } else {
            if (this.game.currentDifficulty && this.game.currentDifficulty.hasTimer) {
                this.startTimer();
            }
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

    // ===== Hanzi Game Methods =====

    renderHanziMenuPony() {
        if (this.hanziMenuPony) {
            const canvas = ponyRenderer.createPonyCanvas(1, 180);
            this.hanziMenuPony.innerHTML = '';
            this.hanziMenuPony.appendChild(canvas);
            animations.animatePony(this.hanziMenuPony, 'idle');
        }
    }

    startHanziGame(difficulty) {
        const question = this.hanziGame.startGame(difficulty);
        const config = HANZI_DIFFICULTY[difficulty];

        // Update UI
        this.showScreen('hanziGame');
        this.updateHanziGamePony(0);
        this.updateHanziQuestion(question);
        this.updateHanziScore();
        this.updateHanziStreak();
        this.updateHanziProgress();

        // Apply background class
        this.screens.hanziGame.className = `screen active ${config.bgClass}`;

        // Setup timer
        if (config.hasTimer) {
            this.hanziTimerContainer.style.display = 'flex';
            this.startHanziTimer();
        } else {
            this.hanziTimerContainer.style.display = 'none';
        }

        // Set cards needed
        this.hanziCardsNeeded.textContent = config.cardsPerReward;
    }

    updateHanziGamePony(ponyIndex, mood = 'happy') {
        if (this.hanziGamePony) {
            const canvas = ponyRenderer.createPonyCanvas(ponyIndex, 100, mood);
            this.hanziGamePony.innerHTML = '';
            this.hanziGamePony.appendChild(canvas);
            animations.animatePony(this.hanziGamePony, 'idle');
        }
    }

    updateHanziQuestion(question) {
        if (!question) return;

        this.emojiDisplay.textContent = question.emoji;
        animations.animateNumber(this.emojiDisplay);

        // Generate answer buttons
        this.renderHanziAnswerButtons(question.options);
    }

    renderHanziAnswerButtons(options) {
        this.hanziAnswerButtonsContainer.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'hanzi-answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleHanziAnswer(option, btn));
            this.hanziAnswerButtonsContainer.appendChild(btn);
        });
    }

    handleHanziAnswer(selectedAnswer, button) {
        // Disable all buttons temporarily
        const allButtons = this.hanziAnswerButtonsContainer.querySelectorAll('.hanzi-answer-btn');
        allButtons.forEach(btn => btn.disabled = true);

        const result = this.hanziGame.checkAnswer(selectedAnswer);

        // Visual feedback
        if (result.correct) {
            button.classList.add('correct');
            soundManager.play('correct');
            animations.animatePony(this.hanziGamePony, 'happy');
            this.showHanziFeedback(true);
            animations.createFloatingHearts(
                button.getBoundingClientRect().left + button.offsetWidth / 2,
                button.getBoundingClientRect().top
            );

            storage.recordGame(true);

            // Check for card reward
            if (this.hanziGame.shouldAwardCard()) {
                setTimeout(() => this.awardHanziCard(), 600);
            }
        } else {
            button.classList.add('wrong');
            soundManager.play('wrong');

            // Show sad pony
            this.updateHanziGamePony(0, 'sad');
            animations.animatePony(this.hanziGamePony, 'sad');

            // Highlight correct button
            allButtons.forEach(btn => {
                if (btn.textContent === result.correctAnswer) {
                    btn.style.boxShadow = '0 0 20px rgba(39, 174, 96, 0.8)';
                    btn.style.border = '3px solid #27ae60';
                    btn.style.transform = 'scale(1.1)';
                }
            });

            // Show wrong answer popup with correct hanzi
            this.showWrongPopup(result.correctAnswer);

            storage.recordGame(false);
        }

        // Update displays
        this.updateHanziScore();
        this.updateHanziStreak();
        this.updateHanziProgress();

        // Next question after delay (only for correct answers)
        if (result.correct) {
            setTimeout(() => {
                const nextQuestion = this.hanziGame.generateQuestion();
                this.updateHanziQuestion(nextQuestion);

                // Reset timer for timed modes
                if (this.hanziGame.currentDifficultyConfig && this.hanziGame.currentDifficultyConfig.hasTimer) {
                    this.resetHanziTimer();
                }
            }, 800);
        }
    }

    showHanziFeedback(correct) {
        const content = this.hanziFeedbackOverlay.querySelector('.feedback-content') ||
            document.getElementById('hanzi-feedback-content');
        if (content) {
            content.textContent = correct ? '🎉' : '😢';
            content.style.animation = 'none';
            void content.offsetWidth; // Trigger reflow
            content.style.animation = 'feedbackPop 0.6s ease forwards';
        }
    }

    // Hanzi Timer
    startHanziTimer() {
        this.updateHanziTimerDisplay();
        this.timerInterval = setInterval(() => {
            const result = this.hanziGame.tick();
            this.updateHanziTimerDisplay();

            if (result.expired) {
                this.handleHanziTimeUp();
            } else if (result.timeLeft <= 3) {
                this.hanziTimerDisplay.parentElement.classList.add('timer-warning');
            }
        }, 1000);
    }

    resetHanziTimer() {
        this.hanziTimerDisplay.parentElement.classList.remove('timer-warning');
        this.updateHanziTimerDisplay();
    }

    updateHanziTimerDisplay() {
        this.hanziTimerDisplay.textContent = this.hanziGame.timeLeft;
    }

    handleHanziTimeUp() {
        const result = this.hanziGame.checkAnswer('');
        soundManager.play('wrong');

        this.updateHanziGamePony(0, 'sad');
        animations.animatePony(this.hanziGamePony, 'sad');

        this.hanziTimerDisplay.parentElement.classList.add('shake');
        setTimeout(() => {
            this.hanziTimerDisplay.parentElement.classList.remove('shake');
        }, 300);

        // Show correct answer
        const correctAnswer = this.hanziGame.currentQuestion.correctAnswer;
        this.showWrongPopup(correctAnswer);

        this.updateHanziScore();
        this.updateHanziStreak();
        storage.recordGame(false);
    }

    // Hanzi displays
    updateHanziScore() {
        this.hanziScoreDisplay.textContent = this.hanziGame.score;
    }

    updateHanziStreak() {
        this.hanziStreakDisplay.textContent = this.hanziGame.streak;
    }

    updateHanziProgress() {
        const progress = this.hanziGame.getCardsProgress();
        this.hanziProgressFill.style.width = `${progress.progress}%`;
        this.hanziCardsProgress.textContent = progress.current;
    }

    // Hanzi card reward
    awardHanziCard() {
        const collectedCards = storage.getCollectedCards();
        const cardId = this.hanziGame.getRandomCard(collectedCards);
        const isNew = storage.addCard(cardId);

        soundManager.play('collect');
        animations.createConfetti(40);

        this.showCardPopup(cardId, isNew);
        this.updateCollectionCount();
    }

    endHanziGame() {
        this.stopTimer();

        // Save high score
        if (this.currentDifficulty) {
            storage.updateHighScore('hanzi_' + this.currentDifficulty, this.hanziGame.score);
        }

        // Reset game screen
        this.screens.hanziGame.className = 'screen';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PonyMathGame();
});
