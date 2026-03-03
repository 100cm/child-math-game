// Sound Manager Module - Web Audio API based
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.init();
    }

    init() {
        // Create audio context on first user interaction
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('touchstart', initAudio);
            document.removeEventListener('click', initAudio);
        };

        document.addEventListener('touchstart', initAudio, { once: true });
        document.addEventListener('click', initAudio, { once: true });
    }

    play(type) {
        if (!this.enabled || !this.audioContext) return;

        const sounds = {
            correct: () => this.playChime([880, 1100, 1320], 0.12),
            wrong: () => this.playTone(220, 0.25, 'triangle'),
            collect: () => this.playChime([1000, 1200, 1400, 1600], 0.1),
            click: () => this.playTone(600, 0.05, 'square')
        };

        if (sounds[type]) {
            sounds[type]();
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playChime(frequencies, noteDuration) {
        if (!this.audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, noteDuration * 1.5, 'sine');
            }, index * noteDuration * 1000);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

export const soundManager = new SoundManager();
