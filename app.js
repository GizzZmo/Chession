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

        // Settings
        this.themeSelect = document.getElementById('theme-select');
        this.pieceStyleSelect = document.getElementById('piece-style-select');
        this.toggleDarkmodeBtn = document.getElementById('toggle-darkmode');

        // Constants
        this.BOARD_SIZE = this.canvas.width;
        this.SQUARE_SIZE = this.BOARD_SIZE / 8;
        this.colors = this.getBoardTheme('default');

        // State variables
        this.pieceImages = {};
        this.draggedPiece = null;
        this.fromSquare = null;
        this.legalMoves = [];
        this.lastMove = null;

        // Accessibility
        this.canvas.setAttribute('tabindex', '0');

        // Initialize
        this.loadPieceImages('classic').then(() => {
            this.render();
            this.addEventListeners();
        });
    }

    // --- Initialization Methods ---
    async loadPieceImages(style) {
        // For now, only 'classic' is supported, but structure for more
        const svgSet = pieceSVGs; // extend if you add more sets
        const promises = [];
        for (const [name, svg] of Object.entries(svgSet)) {
            promises.push(new Promise(resolve => {
                const img = new Image();
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

        // Settings
        this.themeSelect.addEventListener('change', (e) => {
            this.colors = this.getBoardTheme(e.target.value);
            this.render();
        });
        this.pieceStyleSelect.addEventListener('change', (e) => {
            this.loadPieceImages(e.target.value).then(() => this.render());
        });
        this.toggleDarkmodeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            this.render();
        });

        // Accessibility: keyboard navigation (optional expansion)
        this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // --- Rendering Methods ---
    render() {
        this.drawBoard();
        this.drawPieces();
        this.updateStatus();
    }

    drawBoard() {
        // Draw squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const color = (row + col) % 2 === 0 ? this.colors.light : this.colors.dark;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(col * this.SQUARE_SIZE, row * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
            }
        }

        // Highlight legal moves
        for (const sq of this.legalMoves) {
            const {col, row} = this.squareToCoords(sq);
            this.ctx.fillStyle = this.colors.highlight;
            this.ctx.fillRect(col * this.SQUARE_SIZE, row * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
        }

        // Highlight last move
        if (this.lastMove) {
            [this.lastMove.from, this.lastMove.to].forEach(sq => {
                const {col, row} = this.squareToCoords(sq);
                this.ctx.fillStyle = this.colors.lastmove;
                this.ctx.fillRect(col * this.SQUARE_SIZE, row * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
            });
        }
    }

    drawPieces() {
        const board = this.game.board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceName = `${piece.color}${piece.type}`;
                    // Don't draw the piece being dragged from its original square
                    if (this.draggedPiece && this.fromSquare === piece.square) continue;
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
            this.ctx.globalAlpha = 0.7;
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
            // Highlight legal moves for this piece
            this.legalMoves = this.game.moves({square: square, verbose:true}).map(m => m.to);
            this.render();
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
            promotion: 'q'
        });

        if (move === null) {
            // Snap back and flash cue for invalid move
            this.flashInvalidMove();
        } else {
            // Move was legal, chess.js updated the internal state
            this.lastMove = {from: move.from, to: move.to};
        }

        // Reset dragging state, clear legal moves and re-render
        this.draggedPiece = null;
        this.fromSquare = null;
        this.legalMoves = [];
        this.render();
    }

    flashInvalidMove() {
        this.canvas.classList.add('invalid-move');
        setTimeout(() => this.canvas.classList.remove('invalid-move'), 300);
    }

    resetGame() {
        this.game.reset();
        this.lastMove = null;
        this.legalMoves = [];
        this.render();
    }

    // --- Utility Methods ---
    getSquareFromCoords(x, y) {
        const col = Math.floor(x / this.SQUARE_SIZE);
        const row = Math.floor(y / this.SQUARE_SIZE);
        const file = 'abcdefgh'[col];
        const rank = 8 - row;
        return { row, col, square: `${file}${rank}` };
    }

    squareToCoords(square) {
        // e.g., e4 -> {col: 4, row: 4}
        const file = square[0];
        const rank = parseInt(square[1]);
        const col = 'abcdefgh'.indexOf(file);
        const row = 8 - rank;
        return { col, row };
    }

    getBoardTheme(theme) {
        switch (theme) {
            case 'blue':
                return { light: '#dbeafe', dark: '#2563eb', highlight: 'rgba(16,185,129,0.4)', lastmove: 'rgba(59,130,246,0.4)' };
            case 'green':
                return { light: '#cfe8cf', dark: '#2c6b2c', highlight: 'rgba(74,222,128,0.4)', lastmove: 'rgba(34,197,94,0.4)' };
            case 'light':
                return { light: '#f9fafb', dark: '#e5e7eb', highlight: 'rgba(253,186,116,0.5)', lastmove: 'rgba(251,191,36,0.4)' };
            default:
                return { light: '#f0d9b5', dark: '#b58863', highlight: 'rgba(255, 255, 0, 0.4)', lastmove: 'rgba(50,200,255,0.4)' };
        }
    }

    // Optional: Keyboard navigation for accessibility
    handleKeyDown(e) {
        // Example: Allow resetting the game with "r"
        if (e.key === 'r') {
            this.resetGame();
        }
        // Add more navigation (e.g., arrow keys) as desired
    }
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    // Responsive canvas: adjust size for mobile
    const canvas = document.getElementById('chessboard');
    function resizeCanvas() {
        let size = Math.min(window.innerWidth * 0.95, 640);
        canvas.width = canvas.height = size;
    }
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    const game = new Chess();
    new ChessboardUI('chessboard', game);
});
