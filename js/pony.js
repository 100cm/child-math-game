// Pony Drawing Module - Canvas-based character rendering
import { CONFIG } from './config.js';

export class PonyRenderer {
    constructor() {
        this.ponies = CONFIG.cards;
    }

    // Draw a cute pony on canvas
    drawPony(canvas, ponyIndex = 0, size = 150, mood = 'happy') {
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;

        const pony = this.ponies[ponyIndex % this.ponies.length];
        const centerX = size / 2;
        const centerY = size / 2;
        const scale = size / 150;

        ctx.clearRect(0, 0, size, size);

        // Body
        ctx.fillStyle = pony.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 15 * scale, 40 * scale, 30 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = pony.color;
        ctx.beginPath();
        ctx.ellipse(centerX + 25 * scale, centerY - 20 * scale, 28 * scale, 25 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Mane
        ctx.fillStyle = pony.secondaryColor;
        ctx.beginPath();
        ctx.ellipse(centerX + 5 * scale, centerY - 35 * scale, 20 * scale, 15 * scale, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX - 5 * scale, centerY - 25 * scale, 15 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = pony.secondaryColor;
        ctx.beginPath();
        ctx.ellipse(centerX - 45 * scale, centerY + 15 * scale, 18 * scale, 25 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = pony.color;
        const legPositions = [-20, -5, 10, 25];
        legPositions.forEach(x => {
            ctx.beginPath();
            ctx.roundRect(centerX + x * scale - 5 * scale, centerY + 35 * scale, 10 * scale, 25 * scale, 5 * scale);
            ctx.fill();
        });

        // Hooves
        ctx.fillStyle = pony.secondaryColor;
        legPositions.forEach(x => {
            ctx.beginPath();
            ctx.roundRect(centerX + x * scale - 6 * scale, centerY + 55 * scale, 12 * scale, 8 * scale, 4 * scale);
            ctx.fill();
        });

        // Eye (big anime style) - different for sad mood
        if (mood === 'sad') {
            // Sad closed eyes with tears
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3 * scale;
            ctx.lineCap = 'round';

            // Closed eye (curved line)
            ctx.beginPath();
            ctx.arc(centerX + 37 * scale, centerY - 20 * scale, 8 * scale, 0.3, Math.PI - 0.3);
            ctx.stroke();

            // Tear drops
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.ellipse(centerX + 42 * scale, centerY - 8 * scale, 4 * scale, 6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 38 * scale, centerY - 2 * scale, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sad eyebrow
            ctx.strokeStyle = pony.secondaryColor;
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(centerX + 28 * scale, centerY - 32 * scale);
            ctx.lineTo(centerX + 45 * scale, centerY - 28 * scale);
            ctx.stroke();
        } else {
            // Normal happy eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(centerX + 35 * scale, centerY - 22 * scale, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Iris
            ctx.fillStyle = this.getEyeColor(ponyIndex);
            ctx.beginPath();
            ctx.ellipse(centerX + 37 * scale, centerY - 20 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(centerX + 38 * scale, centerY - 19 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX + 34 * scale, centerY - 25 * scale, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cute blush (more intense when sad)
        ctx.fillStyle = mood === 'sad' ? 'rgba(255, 100, 100, 0.5)' : 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX + 45 * scale, centerY - 10 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horn (for unicorn types)
        if ([0, 4, 6, 7, 8, 9, 10, 11].includes(ponyIndex)) {
            ctx.fillStyle = pony.secondaryColor;
            ctx.beginPath();
            ctx.moveTo(centerX + 30 * scale, centerY - 45 * scale);
            ctx.lineTo(centerX + 40 * scale, centerY - 70 * scale);
            ctx.lineTo(centerX + 50 * scale, centerY - 45 * scale);
            ctx.closePath();
            ctx.fill();

            // Horn spiral
            ctx.strokeStyle = pony.color;
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(centerX + 35 * scale, centerY - 50 * scale);
            ctx.lineTo(centerX + 45 * scale, centerY - 50 * scale);
            ctx.moveTo(centerX + 37 * scale, centerY - 58 * scale);
            ctx.lineTo(centerX + 43 * scale, centerY - 58 * scale);
            ctx.stroke();
        }

        // Wings (for pegasus types)
        if ([2, 3, 8, 9, 10].includes(ponyIndex)) {
            ctx.fillStyle = pony.secondaryColor;
            // Wing
            ctx.beginPath();
            ctx.moveTo(centerX - 10 * scale, centerY);
            ctx.quadraticCurveTo(centerX - 40 * scale, centerY - 40 * scale, centerX - 5 * scale, centerY - 20 * scale);
            ctx.quadraticCurveTo(centerX - 35 * scale, centerY - 30 * scale, centerX - 10 * scale, centerY - 5 * scale);
            ctx.closePath();
            ctx.fill();
        }

        // Ear
        ctx.fillStyle = pony.color;
        ctx.beginPath();
        ctx.moveTo(centerX + 15 * scale, centerY - 38 * scale);
        ctx.lineTo(centerX + 10 * scale, centerY - 55 * scale);
        ctx.lineTo(centerX + 25 * scale, centerY - 42 * scale);
        ctx.closePath();
        ctx.fill();

        // Mouth - smile or sad
        ctx.strokeStyle = pony.secondaryColor;
        ctx.lineWidth = 2 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (mood === 'sad') {
            // Sad frown
            ctx.arc(centerX + 42 * scale, centerY - 2 * scale, 6 * scale, Math.PI + 0.3, -0.3);
        } else {
            // Happy smile
            ctx.arc(centerX + 42 * scale, centerY - 8 * scale, 6 * scale, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();
    }

    getEyeColor(index) {
        const eyeColors = [
            '#9b59b6', '#27ae60', '#e74c3c', '#2ecc71',
            '#3498db', '#2980b9', '#8e44ad', '#9b59b6',
            '#e91e63', '#3498db', '#e91e63', '#9b59b6'
        ];
        return eyeColors[index % eyeColors.length];
    }

    // Draw card with pony
    drawCard(canvas, ponyIndex, size = 150) {
        const ctx = canvas.getContext('2d');
        const cardWidth = size;
        const cardHeight = size * 1.4;
        canvas.width = cardWidth;
        canvas.height = cardHeight;

        const pony = this.ponies[ponyIndex % this.ponies.length];

        // Card background with gradient
        const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, pony.secondaryColor);
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(0, 0, cardWidth, cardHeight, 15);
        ctx.fill();

        // Card border
        ctx.strokeStyle = pony.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(2, 2, cardWidth - 4, cardHeight - 4, 13);
        ctx.stroke();

        // Inner decorative border
        ctx.strokeStyle = pony.secondaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(10, 10, cardWidth - 20, cardHeight - 40, 8);
        ctx.stroke();

        // Draw pony in center of card
        const ponySize = size * 0.7;
        const tempCanvas = document.createElement('canvas');
        this.drawPony(tempCanvas, ponyIndex, ponySize);
        ctx.drawImage(tempCanvas, (cardWidth - ponySize) / 2, 15);

        // Star decorations
        ctx.fillStyle = pony.color;
        this.drawStar(ctx, 15, cardHeight - 25, 8);
        this.drawStar(ctx, cardWidth - 15, cardHeight - 25, 8);

        // Name at bottom
        ctx.fillStyle = pony.color;
        ctx.font = `bold ${size * 0.1}px "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(pony.name, cardWidth / 2, cardHeight - 12);
    }

    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Create canvas element with pony
    createPonyCanvas(ponyIndex, size = 150, mood = 'happy') {
        const canvas = document.createElement('canvas');
        this.drawPony(canvas, ponyIndex, size, mood);
        return canvas;
    }

    // Create card element with image (new image-based card)
    createImageCard(cardIndex, size = 120) {
        const card = this.ponies[cardIndex % this.ponies.length];

        const cardElement = document.createElement('div');
        cardElement.className = 'pony-card rainbow-border';
        cardElement.style.width = `${size}px`;

        const img = document.createElement('img');
        img.src = card.image;
        img.alt = `卡片 ${card.id}`;
        img.className = 'pony-card-image';

        const encouragement = document.createElement('div');
        encouragement.className = 'pony-card-text';
        encouragement.textContent = card.encouragement;

        cardElement.appendChild(img);
        cardElement.appendChild(encouragement);

        return cardElement;
    }

    // Create canvas element with card
    createCardCanvas(ponyIndex, size = 120) {
        // Use image-based card instead of canvas
        return this.createImageCard(ponyIndex, size);
    }
}

export const ponyRenderer = new PonyRenderer();
