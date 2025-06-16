import { Chess } from './chess.mjs';
import { pieceSVGs } from './pieces.js';

// --- Main Application Class ---
class ChessboardUI {
    constructor(canvasId, game) {
        // Core components
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.game = game; // The chess.js instance
        
        // UI elements
        this.statusEl = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-button');
        
        // Constants
        this.BOARD_SIZE = this.canvas.width;
        this.SQUARE_SIZE = this.BOARD_SIZE / 8;
        this.colors = {
            light: '#f0d9b5',
            dark: '#b58863',
            highlight: 'rgba(255, 255, 0, 0.4)'
        };

        // State variables
        this.pieceImages = {};
        this.draggedPiece = null;
        this.fromSquare = null;

        // Initialize
        this.loadPieceImages().then(() => {
            this.render();
            this.addEventListeners();
        });
    }

    // --- Initialization Methods ---

    async loadPieceImages() {
        // Pre-load SVGs as Image objects for efficient rendering
        const promises = [];
        for (const [name, svg] of Object.entries(pieceSVGs)) {
            promises.push(new Promise(resolve => {
                const img = new Image();
                // Use a data URL to render SVG on canvas
                img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                img.onload = () => {
                    this.pieceImages[name] = img;
                    resolve();
                };
            }));
        }
        return Promise.all(promises);
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.resetButton.addEventListener('click', this.resetGame.bind(this));
    }

    // --- Rendering Methods ---

    render() {
        this.drawBoard();
        this.drawPieces();
        this.updateStatus();
    }

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const color = (row + col) % 2 === 0 ? this.colors.light : this.colors.dark;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(col * this.SQUARE_SIZE, row * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
            }
        }
    }

    drawPieces() {
        const board = this.game.board(); // Get 2D array of pieces from chess.js
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceName = `${piece.color}${piece.type}`;
                    // Don't draw the piece being dragged from its original square
                    if (this.draggedPiece && this.fromSquare === piece.square) {
                        continue;
                    }
                    this.ctx.drawImage(
                        this.pieceImages[pieceName],
                        col * this.SQUARE_SIZE,
                        row * this.SQUARE_SIZE,
                        this.SQUARE_SIZE,
                        this.SQUARE_SIZE
                    );
                }
            }
        }
        // Draw the dragged piece at the mouse cursor
        if (this.draggedPiece && this.draggedPiece.pos) {
            this.ctx.globalAlpha = 0.7; // Make it semi-transparent
            this.ctx.drawImage(
                this.pieceImages[this.draggedPiece.name],
                this.draggedPiece.pos.x - this.SQUARE_SIZE / 2,
                this.draggedPiece.pos.y - this.SQUARE_SIZE / 2,
                this.SQUARE_SIZE,
                this.SQUARE_SIZE
            );
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    updateStatus() {
        let statusText = '';
        const turn = this.game.turn() === 'w' ? 'White' : 'Black';

        if (this.game.isCheckmate()) {
            statusText = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
        } else if (this.game.isDraw()) {
            statusText = 'Draw!';
        } else {
            statusText = `${turn}'s turn to move.`;
            if (this.game.isCheck()) {
                statusText += ' (in Check)';
            }
        }
        this.statusEl.textContent = statusText;
    }

    // --- Event Handlers ---

    handleMouseDown(e) {
        const { row, col, square } = this.getSquareFromCoords(e.offsetX, e.offsetY);
        const piece = this.game.get(square);

        // Allow picking up a piece only if it's the current player's turn
        if (piece && piece.color === this.game.turn()) {
            this.fromSquare = square;
            this.draggedPiece = {
                name: `${piece.color}${piece.type}`,
                pos: { x: e.offsetX, y: e.offsetY }
            };
            this.render(); // Re-render to start the drag effect
        }
    }

    handleMouseMove(e) {
        if (this.draggedPiece) {
            this.draggedPiece.pos = { x: e.offsetX, y: e.offsetY };
            this.render();
        }
    }

    handleMouseUp(e) {
        if (!this.draggedPiece) return;

        const { square: toSquare } = this.getSquareFromCoords(e.offsetX, e.offsetY);
        
        // Attempt the move using chess.js logic
        const move = this.game.move({
            from: this.fromSquare,
            to: toSquare,
            promotion: 'q' // Always promote to a queen for simplicity
        });

        // If the move is illegal, chess.js returns null.
        if (move === null) {
            // Snap back
            console.log('Illegal move attempted.');
        } else {
            // Move was legal, chess.js updated the internal state
            console.log(`Move made: ${move.san}`);
        }

        // Reset dragging state and re-render the final board state
        this.draggedPiece = null;
        this.fromSquare = null;
        this.render();
    }
    
    resetGame() {
        this.game.reset();
        this.render();
        console.log('Game reset.');
    }

    // --- Utility Methods ---

    getSquareFromCoords(x, y) {
        const col = Math.floor(x / this.SQUARE_SIZE);
        const row = Math.floor(y / this.SQUARE_SIZE);
        const file = 'abcdefgh'[col];
        const rank = 8 - row;
        return { row, col, square: `${file}${rank}` };
    }
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    const game = new Chess();
    new ChessboardUI('chessboard', game);
});