# Country Flag Quiz

A simple quiz game that tests how well you know world flags. You get 10 questions, 30 seconds each, and you can use a hint if you're stuck.

## What it does

- Shows you a flag and 4 possible country names
- Gives you 30 seconds to answer
- Lets you use one hint per question (removes 2 wrong answers)
- Keeps track of your score
- Saves your best score and shows a leaderboard of top scores
- Works on phone and desktop

## Files in this project

- `index.html` – the start screen
- `quiz.html` – the actual quiz
- `result.html` – shows your score after you finish
- `leaderboard.html` – shows the top scores
- `script.js` – all the code that makes the game work
- `style.css` – how everything looks
- `icons/` – images used in the app

## How to run it on your computer

You can't just double-click `index.html` and open it — the flag data comes from an API, and browsers block that when you open files directly. You need to run it through a local server instead.

**Easiest way (VS Code):**
1. Open the folder in VS Code
2. Right-click `index.html`
3. Click "Open with Live Server"

## How it works technically

- Built with plain HTML, CSS, and JavaScript — no frameworks
- Gets country names and flags from the REST Countries API
- Saves your high score and leaderboard in the browser (localStorage), so they stay even after you close the tab
- Caches the country list for your session so it doesn't re-fetch every time (sessionStorage)

## Made by

Group 1, FUTMINNA — SWE221 project

- Akanmu Maryam — 2024/1/101032SW
- Williams Oche Sean — 2024/1/97533SW
- Olaore Ayuba Ayomide — 2025/2/106563SW
- Nasirudeen Aisha Annie — 2024/1/96492SW
- David Phillip Godstime — 2024/1/95944SW
