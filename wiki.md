# Project Wiki: Canvas Chess MVP

Welcome to the wiki for the Canvas Chess MVP. This document provides a deep dive into the architecture, components, and logic of the application.

### 1. Architectural Philosophy

This prototype was built to embody the principles of the "Architectural Blueprint for a Scalable Online Chess Platform".

*   **Server-Authoritative Model:** In a real online game, the client should never be trusted. It only sends *intent* (e.g., "I want to move from e2 to e4") to the server. The server validates the move and then broadcasts the new, true game state to all clients. This prototype simulates this by treating `chess.js` as the "server". The UI in `app.js` sends move intents to the `chess.js` instance. If the move is invalid, `chess.js` rejects it, and the UI snaps the piece back. If it's valid, `chess.js` updates its internal state, and the UI re-renders the board from this new authoritative state.
*   **Modularity:** The code is cleanly separated.
    *   **`app.js` (Controller):** Manages the application lifecycle, user input, and rendering loop.
    *   **`chess.mjs` (Model):** Manages the game state and rules.
    *   **`canvas` in `index.html` (View):** The surface where the game is displayed.
*   **Performance:** Using the HTML5 Canvas for rendering is a deliberate choice. It is highly performant for applications with many graphical elements that change frequently, as it avoids the overhead of manipulating hundreds of DOM elements for pieces, squares, and highlights.

### 2. Component Breakdown

*   **`index.html`:** The application's skeleton. It contains the `<canvas>` element, a status panel, and a reset button. It importantly loads `app.js` as a `type="module"`.
*   **`style.css`:** Defines the visual identity. It follows the blueprint's recommendation for a clean, modern, dark-themed UI to keep the user's focus on the game.
*   **`pieces.js`:** This file acts as a static asset store. It exports an object containing the SVG data for each chess piece. Using SVGs ensures the pieces are sharp and scalable on any display resolution.
*   **`app.js`:** This is the heart of the frontend.
    *   The `ChessboardUI` class orchestrates everything.
    *   **`constructor()`:** Initializes the canvas context, loads the game engine, and pre-loads the piece SVG images into `Image` objects for efficient drawing.
    *   **`render()`:** The main drawing function. It first draws the board, then iterates through the state provided by `game.board()` to draw each piece in its correct position. It is responsible for the "dumb" rendering principle.
    *   **Event Handlers (`handleMouseDown`, etc.):** These methods translate user mouse actions into game logic. They determine which square was clicked, what piece is being dragged, and where it was dropped.
    *   **`handleMouseUp()`:** This is where the core architectural model is enforced. It takes the `from` and `to` squares from the user's drag action and attempts the move with `this.game.move(...)`. It then re-renders the board regardless of the outcome, ensuring the UI always reflects the true state of the `chess.js` engine.

### 3. The Rendering and Interaction Loop

1.  **Initial Load:** `app.js` is loaded, a new `Chess` game is instantiated, and the `ChessboardUI` class is initialized.
2.  **`loadPieceImages()`:** Asynchronously loads all SVG strings into drawable `Image` objects.
3.  **`render()`:** The initial board position is drawn to the canvas based on the default state of `chess.js`.
4.  **User Interaction (`mousedown`):** A user clicks on a piece. The code checks if it's that player's turn and if there is a piece on that square. If so, it enters a "dragging" state.
5.  **`mousemove`:** While dragging, the `render()` function is called repeatedly to redraw the board and the dragged piece under the cursor, creating a smooth visual effect.
6.  **`mouseup`:** The user releases the mouse. The code calculates the target square.
7.  **Authority Check:** The move (`{ from, to }`) is passed to `game.move()`.
8.  **State Update:**
    *   **If legal:** `chess.js` updates its internal game state.
    *   **If illegal:** `chess.js` returns `null` and its state remains unchanged.
9.  **Final Render:** `render()` is called one last time. It reads the *current* (and potentially updated) state from `chess.js` and draws it to the screen. This automatically handles both successful moves and illegal "snap-back" moves.
