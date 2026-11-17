# 🌍 Eco-Conscious: buy, sell, reuse

Full-stack demo: **frontend** (HTML/CSS/JS) + **backend** (Node, Express, SQLite).
Naye eco products kharido, aur apni purani cheezein bech bhi sakte ho (pre-loved marketplace).

## Chalane ka tarika

```bash
cd backend
npm install
# backend/.env kholo aur UPI_ID mein apna asli UPI ID likho
npm start
```

Phir browser mein kholo: **http://localhost:5000**
(Frontend bhi isi server se chalta hai, alag se kuch chalane ki zarurat nahi.)

## Folder

```
backend/
  server.js            app start + frontend serve
  db.js                SQLite tables + 13 products
  middleware/auth.js   X-Device-Id se user pehchanta hai
  routes/ controllers/ products, orders, payment, profile, listings
frontend/
  index.html           poori site
```

## API

| Method | Path | Kaam |
|---|---|---|
| GET | /api/products | products list |
| GET/PUT | /api/profile | naam, goal, impact |
| POST | /api/orders | cart se pending order (amount server nikalta hai) |
| GET | /api/payment/qr/:orderId | UPI QR image |
| POST | /api/payment/:orderId/confirm | "maine pay kar diya" |
| GET | /api/listings | live pre-loved items |
| GET | /api/listings/mine | meri listings |
| POST | /api/listings | nayi listing |
| POST | /api/listings/:id/buy | listing kharidne ka order |
| PATCH | /api/listings/:id | seller: sold ya dobara live |
| DELETE | /api/listings/:id | seller: hatao |

## Pre-loved payment kaise chalta hai

1. Buyer "Buy now" dabata hai, QR **seller ke UPI ID** par banta hai.
2. Buyer pay karke "I've paid" dabata hai, item "Buyer says paid" (reserved) ho jata hai.
3. Seller dekhta hai ki paisa aaya ya nahi: **Money received** (sold) ya **Not received** (dobara live).

## Dhyan rakhna

- UPI QR se server ko payment ka pata nahi chalta. "I've paid" sirf user ka claim hai. Asli store ke liye Razorpay ya Cashfree jaisa gateway lagao.
- Login nahi hai. Har browser ka ek device id hota hai. Asli use ke liye OTP, email ya Google login lagao.
- Photos SQLite mein save hoti hain (demo ke liye theek). Zyada users ho to Cloudinary ya S3 use karo.
- `.env` ko GitHub par upload mat karna (`.gitignore` mein hai).
- Online hosting ke liye Render par backend folder deploy karo (build `npm install`, start `npm start`). SQLite file free plan par restart ke baad ud sakti hai, to Render ki persistent disk lagao ya Postgres par jao.
