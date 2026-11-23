require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
require("./db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" })); // photo ~300KB tak, base64 ke saath

app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/profile",  require("./routes/profile"));
app.use("/api/payment",  require("./routes/payment"));
app.use("/api/listings", require("./routes/listings"));
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Frontend bhi isi server se chalega: http://localhost:5000
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Photo is too large." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid request body." });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Eco-Conscious running on http://localhost:${PORT}`);
  if (!process.env.UPI_ID || process.env.UPI_ID === "yourname@upi")
    console.warn("⚠️  .env mein apna asli UPI_ID set karo, warna store ka payment QR nahi banega.");
});
