# 🌍 Eco-Conscious: buy, sell, reuse

Full-stack demo: **frontend** (HTML/CSS/JS) + **backend** (Node, Express, SQLite).
Buy new eco-friendly products, and sell your old items too (pre-loved marketplace).

## How to start

```bash
cd backend
npm install
# open backend/.env and set UPI_ID to your real UPI ID
npm start
```

Then open in your browser: **http://localhost:5000**
(The frontend is served by the same server, so there is nothing else to run.)

## Folder structure

```
backend/
  server.js            starts the app + serves the frontend
  db.js                SQLite tables + 13 products
  middleware/auth.js   identifies the user via X-Device-Id
  routes/ controllers/ products, orders, payment, profile, listings
frontend/
  index.html           the whole site
```

## API

| Method | Path | Purpose |
|---|---|---|
| GET | /api/products | list of products |
| GET/PUT | /api/profile | name, goal, impact |
| POST | /api/orders | pending order from cart (server calculates the amount) |
| GET | /api/payment/qr/:orderId | UPI QR image |
| POST | /api/payment/:orderId/confirm | "I have paid" |
| GET | /api/listings | live pre-loved items |
| GET | /api/listings/mine | my listings |
| POST | /api/listings | new listing |
| POST | /api/listings/:id/buy | create an order to buy a listing |
| PATCH | /api/listings/:id | seller: mark as sold or list again |
| DELETE | /api/listings/:id | seller: remove listing |

## How pre-loved payments work

1. The buyer clicks "Buy now", and a QR code is generated for the **seller's UPI ID**.
2. The buyer pays and clicks "I've paid", and the item becomes "Buyer says paid" (reserved).
3. The seller checks whether the money arrived: **Money received** (sold) or **Not received** (back to live).

## Things to keep in mind

- A UPI QR code gives the server no way to know whether a payment happened. "I've paid" is only the user's claim. For a real store, use a payment gateway such as Razorpay or Cashfree.
- There is no login. Each browser has a device ID. For real use, add OTP, email or Google login.
- Photos are stored in SQLite (fine for a demo). With many users, use Cloudinary or S3.
- Do not upload `.env` to GitHub (it is listed in `.gitignore`).
- To host online, deploy the backend folder on Render (build: `npm install`, start: `npm start`). The SQLite file can be lost after a restart on the free plan, so attach a Render persistent disk or switch to Postgres.
