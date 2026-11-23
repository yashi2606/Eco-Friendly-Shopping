const db = require("../db");
const crypto = require("crypto");

// Order sirf "pending" banta hai. User ke stats payment confirm hone par badhte hain
// (paymentController.confirm), pehle nahi.
exports.create = (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 50)
    return res.status(400).json({ error: "Cart is empty or invalid" });

  const getP = db.prepare("SELECT * FROM products WHERE id = ?");
  let total = 0, scoreSum = 0, qtySum = 0, kg = 0;
  const enriched = [];

  for (const it of items) {
    const q = Number(it.qty);
    if (!Number.isInteger(q) || q < 1 || q > 20)
      return res.status(400).json({ error: "Invalid quantity" });
    const p = getP.get(it.id);
    if (!p) return res.status(400).json({ error: `Unknown product ${it.id}` });
    total += p.price * q;
    scoreSum += p.score * q;
    qtySum += q;
    kg += Math.max(0, (p.score - 50) / 100 * 1.2) * q;
    enriched.push({ id: p.id, name: p.name, qty: q, price: p.price, score: p.score });
  }

  const orderId = "EC" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();
  const avgScore = Math.round(scoreSum / qtySum);
  const kgRounded = +kg.toFixed(1);

  db.prepare(`INSERT INTO orders (id,user_id,items,total,avg_score,kg_avoided,status,kind)
              VALUES (?,?,?,?,?,?,'pending','store')`)
    .run(orderId, req.user.id, JSON.stringify(enriched), total, avgScore, kgRounded);

  res.json({ orderId, total, avgScore, kg: kgRounded, items: enriched, status: "pending" });
};

exports.listMine = (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
};
