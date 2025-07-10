# 21-Day Bitcoin Challenge

This project is a small demo that teaches Bitcoin concepts over 21 days. It consists of a single-page web app and a simple Node.js backend for tracking progress.

## Features

- Spanish and English translations (Spanish is the default)
- Responsive design for desktops and smartphones
- Progress saved locally and on the backend via REST API
- Example lessons with images (`img.png`)

## Running Locally

1. Install [Node.js](https://nodejs.org/) (v16 or later).
2. Install backend dependencies:
   ```
   npm install express cors
   ```
3. Start the server:
   ```
   node server.js
   ```
   The server stores progress in `data.json`.
4. Open `index.html` in your browser. You can also serve it with any static HTTP server.

Use the language buttons in the top-right corner to switch between Spanish and English.

To reset your progress, click **Reiniciar Progreso** (Reset Progress) on the progress screen or delete `data.json`.
