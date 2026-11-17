const db = require("../db");
const crypto = require("crypto");

const CATS = ["Kitchen", "Home", "Fashion", "Books", "Electronics", "Travel"];
const CONDS = { like: 95, good: 90, fair: 85 };
const UPI_OK = /^[\w.\-]{2,}@[A-Za-z]{2,}$/;
const PHOTO_OK = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/;
const BLOCKED = /\b(gun|pistol|rifle|weapon|ammo|alcohol|liquor|whisky|whiskey|vodka|beer|wine|cigarette|tobacco|vape|medicine|tablet|capsule|drug|ganja|weed|stolen|fake|replica|counterfeit)\b/i;
const MAX_ACTIVE_PER_USER = 30;
const newId = p => p + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();

const pub = l => ({
  id: l.id, title: l.title, category: l.category, cond: l.cond, price: l.price,
  description: l.description, seller: l.seller_name, hasPhoto: !!l.photo, status: l.status,
});

// GET /api/listings?cat=Books&q=lamp   (sirf live items, seller ki UPI ID nahi dikhti)
exports.list = (req, res) => {
  const { cat, q } = req.query;
  let sql = "SELECT * FROM listings WHERE status = 'live'";
  const params = [];
  if (cat && cat !== "All") { sql += " AND category = ?"; params.push(String(cat)); }
  if (q) { sql += " AND (title LIKE ? OR description LIKE ?)"; const s = `%${String(q).slice(0, 40)}%`; params.push(s, s); }
  sql += " ORDER BY created_at DESC LIMIT 200";
  res.json(db.prepare(sql).all(...params).map(pub));
};

exports.photo = (req, res) => {
  const l = db.prepare("SELECT photo FROM listings WHERE id = ?").get(req.params.id);
  const m = l && l.photo && PHOTO_OK.exec(l.photo);
  if (!m) return res.status(404).end();
  res.set("Cache-Control", "public, max-age=86400").type("jpeg").send(Buffer.from(m[1], "base64"));
};

// GET /api/listings/mine  (meri saari listings, har status)
exports.mine = (req, res) => {
  res.json(db.prepare("SELECT * FROM listings WHERE seller_id = ? ORDER BY created_at DESC").all(req.user.id).map(pub));
};

// POST /api/listings
exports.create = (req, res) => {
  const b = req.body || {};
  const title = String(b.title || "").trim();
  const desc = String(b.description || "").trim();
  const seller = String(b.seller || "").trim();
  const upi = String(b.upi || "").trim();
  const price = Number(b.price);

  if (title.length < 3 || title.length > 60) return res.status(400).json({ error: "Title must be 3 to 60 characters." });
  if (desc.length > 300) return res.status(400).json({ error: "Details are too long (300 max)." });
  if (!CATS.includes(b.category)) return res.status(400).json({ error: "Invalid category." });
  if (!Object.prototype.hasOwnProperty.call(CONDS, b.cond)) return res.status(400).json({ error: "Invalid condition." });
  if (!Number.isInteger(price) || price < 1 || price > 100000) return res.status(400).json({ error: "Price must be a whole number from 1 to 1,00,000." });
  if (!seller || seller.length > 40) return res.status(400).json({ error: "Please enter your name." });
  if (!UPI_OK.test(upi)) return res.status(400).json({ error: "Enter a valid UPI ID, like name@upi." });
  if (b.confirm !== true) return res.status(400).json({ error: "Please confirm the item is yours and legal to sell." });
  if (BLOCKED.test(title + " " + desc)) return res.status(400).json({ error: "This kind of item is not allowed on Eco-Conscious." });

  let photo = null;
  if (b.photo) {
    if (typeof b.photo !== "string" || b.photo.length > 400000 || !PHOTO_OK.test(b.photo))
      return res.status(400).json({ error: "Photo must be a JPEG under about 300 KB." });
    photo = b.photo;
  }

  const active = db.prepare("SELECT COUNT(*) AS c FROM listings WHERE seller_id = ? AND status IN ('live','reserved')").get(req.user.id).c;
  if (active >= MAX_ACTIVE_PER_USER) return res.status(429).json({ error: "You have too many active listings. Remove some first." });

  const id = newId("L");
  db.prepare(`INSERT INTO listings (id,seller_id,title,category,cond,price,description,seller_name,upi,photo)
              VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, title, b.category, b.cond, price, desc, seller, upi, photo);
  res.status(201).json(pub(db.prepare("SELECT * FROM listings WHERE id = ?").get(id)));
};

// POST /api/listings/:id/buy  ->  pending order banata hai (payment /api/payment se hoga)
exports.buy = (req, res) => {
  const l = db.prepare("SELECT * FROM listings WHERE id = ?").get(req.params.id);
  if (!l || l.status !== "live") return res.status(404).json({ error: "This item is no longer available." });
  if (l.seller_id === req.user.id) return res.status(400).json({ error: "This is your own listing." });

  const orderId = newId("EC");
  const items = [{ id: l.id, name: l.title, qty: 1, price: l.price, score: CONDS[l.cond] }];
  db.prepare(`INSERT INTO orders (id,user_id,items,total,avg_score,kg_avoided,status,kind,listing_id)
              VALUES (?,?,?,?,?,?,'pending','listing',?)`)
    .run(orderId, req.user.id, JSON.stringify(items), l.price, CONDS[l.cond], 1.5, l.id);
  res.json({ orderId, total: l.price });
};

// PATCH /api/listings/:id  {status:"sold" | "live"}  (sirf seller)
// live/reserved -> sold (paisa mil gaya) ya reserved -> live (paisa nahi mila, dobara list karo)
exports.setStatus = (req, res) => {
  const l = db.prepare("SELECT * FROM listings WHERE id = ? AND seller_id = ?").get(req.params.id, req.user.id);
  if (!l) return res.status(404).json({ error: "Listing not found." });
  const to = req.body && req.body.status;
  const ok = (to === "sold" && ["live", "reserved"].includes(l.status)) || (to === "live" && l.status === "reserved");
  if (!ok) return res.status(400).json({ error: "That change is not allowed." });
  db.prepare("UPDATE listings SET status = ?, buyer_id = CASE WHEN ? = 'live' THEN NULL ELSE buyer_id END WHERE id = ?").run(to, to, l.id);
  res.json(pub(db.prepare("SELECT * FROM listings WHERE id = ?").get(l.id)));
};

// DELETE /api/listings/:id  (sirf seller)
exports.remove = (req, res) => {
  const r = db.prepare("DELETE FROM listings WHERE id = ? AND seller_id = ?").run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: "Listing not found." });
  res.json({ ok: true });
};
