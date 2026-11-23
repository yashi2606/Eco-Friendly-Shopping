# Eco-Friendly Shopping 

This project is a demo eco-friendly shop with a pre-loved marketplace. The files improve the marketplace listing search and the empty-state message.

## Requirements
- Node.js 18 or newer (Node 20 LTS recommended)
- npm

## Run locally
1. Extract this ZIP.
2. Open a terminal in `backend`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and edit `UPI_ID` with your payment UPI ID if you intend to test payment QR generation. Do not use a real payment flow for production without payment verification.
5. Start the server:
   ```bash
   npm run dev
   ```
   or `npm start`.
6. Open `http://localhost:5000` in your browser.


## Pre-loved marketplace search
- Search text is matched case-insensitively across listing title, description and category in the frontend.
- Category chips can be combined with text search.
- The backend public endpoint also supports `q` and `cat` query parameters, e.g.:
  - `http://localhost:5000/api/listings?q=lamp`
  - `http://localhost:5000/api/listings?cat=Home`
  - `http://localhost:5000/api/listings?cat=Home&q=lamp`
- The marketplace starts empty in a fresh database. Create a listing through **Sell your pre-loved items** to test browse/search. Store products are seeded on first run.

## Notes
- SQLite data is created locally in `backend/data/eco.db` at first startup. This ZIP intentionally excludes the database and its WAL files, so it won't include personal demo data or stale DB state.
- This is a demonstration application. The UPI confirmation button is a user self-report, not server-side payment verification. Integrate a payment gateway before accepting real payments.
- `better-sqlite3` is a native dependency. Install it with `npm install` on your computer instead of copying the bundled `node_modules` from another operating system.
