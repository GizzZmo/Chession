# Frequently Asked Questions (FAQ)

### Q: I opened `index.html` and the page is blank. What's wrong?

**A:** This is the most common issue. The project uses modern JavaScript Modules (`import`/`export`), which browsers do not allow to run from the local file system (`file:///...`) for security reasons. You **must** serve the files from a local web server. Please follow the **How-To Guide** for instructions on using Python or Node.js to start a server.

### Q: I can't pick up any of the black pieces at the start of the game. Is it broken?

**A:** No, this is by design! The `chess.js` engine enforces all the rules of chess, including whose turn it is. The game starts with White's turn, so the UI correctly prevents you from moving Black's pieces. After White makes a move, you will be able to move the black pieces.

### Q: Why use Canvas instead of just HTML `<div>`s for the squares and `<img>` tags for the pieces?

**A:** While a DOM-based approach is possible, the Canvas was chosen for several reasons aligned with the architectural blueprint:
1.  **Performance:** Drawing 64 squares, 32 pieces, and potential highlights on a single Canvas element is often more performant than managing ~100 individual DOM elements, especially during rapid updates like dragging.
2.  **Graphical Control:** The Canvas API provides fine-grained control over rendering, making it easier to implement custom animations, highlighting, and effects without being constrained by CSS.
3.  **Simplicity:** The entire board becomes a single programmable surface, which can simplify the logic for calculating positions and handling interactions.

### Q: How can I change the board colors or piece styles?

**A:**
*   **Board Colors:** In `app.js`, modify the `this.colors` object in the `ChessboardUI` constructor.
*   **Piece Styles:** In `pieces.js`, you can replace the SVG string data for any piece with your own custom SVG code. Ensure the new SVG is designed to be viewed in a square aspect ratio.

### Q: This is great, but it's not an online game. What's the next step?

**A:** You've correctly identified the purpose of this MVP! The next step, as outlined in the architectural blueprint, is to build the backend and real-time layer. The process would be:
1.  Build the Node.js/Express server with the API endpoints (`/login`, etc.).
2.  Implement the WebSocket server (using `socket.io`).
3.  In `app.js`, instead of creating a local `new Chess()` instance, the client would establish a WebSocket connection.
4.  When a user makes a move, `handleMouseUp` would no longer call `this.game.move()`. Instead, it would emit a message to the server, like `socket.emit('client:move', { from, to })`.
5.  The client would then wait for a `server:gameState` message from the server and use the data in that message to render the board. This fully transitions from a simulated authoritative model to a true client-server architecture.

### Q: Does this handle castling, en passant, and pawn promotion?

**A:** Yes. The power of using a robust library like `chess.js` is that it handles 100% of the FIDE chess rules internally. Our UI code in `app.js` is deliberately simple: it only needs to know the `from` and `to` squares. If a move from `e1` to `g1` is a valid castling move, `chess.js` will handle it correctly and update the board state to show the king and rook in their new positions. For promotion, the `game.move()` function takes an optional promotion piece (we've hardcoded it to 'q' for queen for simplicity).
