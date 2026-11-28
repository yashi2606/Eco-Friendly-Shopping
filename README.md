# Eco-Friendly Shopping

An eco-friendly e-commerce demo application featuring a pre-loved marketplace where users can explore sustainable products and buy or sell second-hand items.

## Prerequisites

Ensure the following tools are installed before running the project:

- **Node.js:** Version 18 or later (Node.js 20 LTS recommended)
- **npm:** Node Package Manager

## Getting Started

Follow these steps to set up and run the application locally.

### 1. Extract the Project

Extract the ZIP file and open the project directory in your terminal.

### 2. Navigate to the Backend

```bash
cd backend
```

### 3. Install Dependencies

Install the required backend packages:

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Open the `.env` file and configure the `UPI_ID` variable if you want to test payment QR code generation.

**Note:** The application is intended for demonstration purposes. Do not use real payment flows in production without proper payment gateway integration and server-side payment verification.

### 5. Start the Backend Server

Run the development server:

```bash
npm run dev
```

Alternatively, use:

```bash
npm start
```

### 6. Access the Application

Once the server starts successfully, open the following URL in your browser:

```text
http://localhost:5000
```

## Key Features

- **Eco-Friendly Shopping:** Browse a collection of sustainable products.
- **Pre-Loved Marketplace:** Create and explore second-hand product listings.
- **Smart Search:** Search marketplace listings by title, description, and category.
- **Category Filtering:** Filter listings using category-based selection.
- **Combined Search and Filters:** Apply text search and category filters simultaneously.
- **Payment QR Generation:** Generate UPI payment QR codes for demonstration purposes.

## Pre-Loved Marketplace Search

The marketplace supports flexible searching and category-based filtering.

### Frontend Functionality

- Search is case-insensitive.
- Listings are matched against their title, description, and category.
- Category filters can be combined with text-based search.

### Backend API Support

The public listings endpoint supports the following query parameters:

| Endpoint | Description |
|---|---|
| `/api/listings?q=lamp` | Search listings by keyword |
| `/api/listings?cat=Home` | Filter listings by category |
| `/api/listings?cat=Home&q=lamp` | Combine keyword search and category filtering |

**Example:**

```text
http://localhost:5000/api/listings?q=lamp
```

### Testing the Marketplace

A fresh database does not contain any pre-loved marketplace listings.

To test the marketplace functionality:

1. Open the application.
2. Navigate to **Sell Your Pre-Loved Items**.
3. Create a new listing.
4. Visit the marketplace to browse, search, and filter listings.

Store products are automatically seeded when the database is initialized for the first time.

## Database

The application uses **SQLite** for local data storage.

- The database is automatically created on the first server startup.
- Database location: `backend/data/eco.db`
- Marketplace listings and other application data are stored locally.
- The ZIP distribution excludes the database and its associated WAL files to prevent previously stored demo data from being included.

## Technical Notes

- **Database:** SQLite
- **Native Dependency:** `better-sqlite3`
- Install native dependencies locally using `npm install`.
- Avoid copying the existing `node_modules` directory from another operating system, as native dependencies may not be compatible.

## Important Disclaimer

This project is developed for demonstration and educational purposes.

The UPI payment confirmation feature relies on user self-reporting and does not independently verify transactions. For production use, integrate a trusted payment gateway with server-side payment verification.

---

**Eco-Friendly Shopping — Promoting sustainable consumption through responsible shopping and reuse.**
