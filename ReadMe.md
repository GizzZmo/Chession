# Canvas Chess MVP

This project is a tangible, working prototype of an online chess platform's front-end, built directly from the specifications of the "Architectural Blueprint for a Scalable Online Chess Platform". It serves as a proof-of-concept for the core user experience: an interactive, rule-enforcing chessboard.

The primary goal of this MVP is to demonstrate the client-side rendering and game logic handling before connecting it to a real-time backend.



### Core Features

*   **Interactive Chessboard:** A fluid, drag-and-drop interface for moving pieces.
*   **Full Rule Enforcement:** Leverages the powerful `chess.js` library to validate all moves, including complex rules like castling, en passant, and promotion.
*   **Real-time State Display:** The UI provides immediate feedback on game status, such as check, checkmate, and whose turn it is.
*   **Clear Architectural Model:** The code simulates the blueprint's "server-authoritative" model, where the UI is a "dumb" renderer of the game state managed by the logic engine (`chess.js`).

### Technology Stack

*   **HTML5:** For the basic structure of the application.
*   **CSS3:** For modern styling, including a focused, dark-theme UI.
*   **Vanilla JavaScript (ES Modules):** For all application logic, ensuring a lightweight and framework-free implementation.
*   **HTML5 Canvas:** For high-performance rendering of the board and pieces.
*   **chess.js:** The "headless" chess engine that acts as the source of truth for all game rules and state.

### Getting Started

A local web server is required to run this project due to the use of ES Modules.

1.  **Clone or download** the repository.
2.  **Obtain `chess.mjs`:** Download the ES Module version of `chess.js` and place it in the root of the project directory.
3.  **Start a local server:** In the project's root directory, run one of the following commands:
    *   If you have Python 3: `python -m http.server`
    *   If you have Node.js: `npx serve`
4.  **Open your browser** and navigate to `http://localhost:8000` (or the URL provided by your server command).

### Project Structure

```
/
|-- index.html         # The main HTML structure
|-- style.css          # All visual styling
|-- app.js             # Core application class and event handling
|-- pieces.js          # SVG data for the chess pieces
|-- chess.mjs          # The chess.js game logic library
|-- README.md          # This file
```

### Architectural Principles Implemented

This MVP is not just a collection of files; it's a direct implementation of key principles from the architectural blueprint:

*   **Separation of Concerns:** Logic (`app.js`), data (`pieces.js`), and presentation (`style.css`, `index.html`) are kept in separate, modular files.
*   **Server-Authoritative Simulation:** The UI (`app.js`) does not update its state directly. It sends a move request to the "authority" (`chess.js`), and only renders the board based on the new, validated state returned by the engine. This is critical for preventing cheating in a real online environment.
