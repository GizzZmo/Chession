# How-To: Set Up and Run the Canvas Chess MVP

This guide will walk you through the exact steps to get the Canvas Chess MVP running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

1.  **A modern web browser:** Chrome, Firefox, Safari, or Edge.
2.  **A code editor:** Such as Visual Studio Code, Sublime Text, or Atom.
3.  **A local web server:** This is required because the project uses JavaScript Modules. You have two easy options:
    *   **Python:** Most macOS and Linux systems have Python pre-installed.
    *   **Node.js and NPM:** If you are a web developer, you likely have this installed.

### Step-by-Step Instructions

**Step 1: Get the Project Files**

Download or clone all the project files (`index.html`, `style.css`, `app.js`, `pieces.js`) into a single folder on your computer. Let's name the folder `chess-platform`.

**Step 2: Obtain the `chess.js` Library**

The game's logic depends on the `chess.js` library.

1.  Go to the official `chess.js` repository or find a CDN link for the ES Module version.
2.  Save the file as `chess.mjs` inside your `chess-platform` folder.

Your folder structure should now look exactly like this:
```
/chess-platform
|-- index.html
|-- style.css
|-- app.js
|-- pieces.js
|-- chess.mjs
```

**Step 3: Launch the Local Web Server**

This is the most critical step. You cannot simply double-click `index.html`.

1.  Open your computer's terminal or command prompt.
2.  Navigate into the `chess-platform` directory you created.
    ```sh
    cd path/to/your/chess-platform
    ```
3.  Run **one** of the following commands:

    *   **Option A: Using Python**
        ```sh
        python -m http.server
        ```
        You should see a message like `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`

    *   **Option B: Using Node.js**
        ```sh
        npx serve
        ```
        You will see a message with a "Local" address, usually `http://localhost:5000` or `http://localhost:3000`.

**Step 4: View the Application in Your Browser**

1.  Open your web browser.
2.  In the address bar, type the URL from the previous step (e.g., `http://localhost:8000`).
3.  Press Enter.

**Success!** You should now see the chessboard on the screen. You can drag and drop the white pieces to start a game.
