# Employee Work Times

A simple web app for employees to clock in and out and view their work hours.

## Features

- **Clock In / Clock Out** — Select or type your name, then punch in or out
- **Live clock** — Current time shown in the header
- **Today’s hours** — Total time worked today for the selected employee
- **Recent entries** — Table of recent clock-in/out records
- **Local storage** — Data is saved in your browser (no server required)

## How to run

1. Open `index.html` in a web browser (double-click or drag into the browser).
2. Or run a local server from this folder, for example:
   - `python3 -m http.server 8000` then visit http://localhost:8000
   - Or use the “Open with Live Server” option in VS Code/Cursor if you have the extension.

## Usage

1. Enter your name in the text field or choose it from the dropdown (after you’ve used it once).
2. Click **Clock In** when you start work.
3. Click **Clock Out** when you finish (or take a break).
4. Check **Today** for today’s total hours and **Recent entries** for your history.

All data stays in your browser; nothing is sent to a server.
