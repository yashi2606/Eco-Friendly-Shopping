const db = require("../db");
const QRCode = require("qrcode");

const UPI_OK = /^[\w.\-]{2,}@[A-Za-z]{2,}$/;
const enc = encodeURIComponent;

function payee(order) {
  if (order.kind === "listing") {
    const l = db.prepare("SELECT seller_name, upi FROM listings WHERE id = ?").get(order.listing_id);
    return l ? { upi: l.upi, name: l.seller_name } : null;
  }
  return { upi: process.env.UPI_ID, name: process.env.SHOP_NAME || "Eco-Conscious" };
}

// GET /api/payment/qr/:orderId  ->  QR image (data URL) + UPI link
exports.qr = async (req, res, next) => {
  try {
    const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.orderId, req.user.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "pending") return res.status(409).json({ error: "Order is already " + order.status });

    const p = payee(order);
    if (!p || !p.upi || p.upi === "yourname@upi" || !UPI_OK.test(p.upi))
      return res.status(500).json({ error: "Payment is not set up yet. Set UPI_ID in backend/.env" });

    const link = `upi://pay?pa=${enc(p.upi)}&pn=${enc(p.name)}&am=${order.total.toFixed(2)}&cu=INR&tn=${enc(("Order " + order.id).slice(0, 60))}`;
    const qr = await QRCode.toDataURL(link, { width: 260, margin: 1, errorCorrectionLevel: "M" });
    res.json({ orderId: order.id, kind: order.kind, amount: order.total, payee: p.name, link, qr });
  } catch (e) { next(e); }
};

// POST /api/payment/:orderId/confirm
// NOTE: UPI QR se server ko payment ka pata nahi chalta. Ye user ka "maine pay kar diya" claim hai.
// Asli verification ke liye Razorpay / Cashfree jaisa gateway lagao.
exports.confirm = (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.orderId, req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === "paid") return res.json({ orderId: order.id, status: "paid", kind: order.kind, total: order.total });
  if (order.status !== "pending") return res.status(409).json({ error: "Order is " + order.status });

  const qty = JSON.parse(order.items).reduce((a, i) => a + i.qty, 0);

  const run = db.transaction(() => {
    if (order.kind === "listing") {
      // Pehle item reserve karo. Agar kisi aur ne pehle le liya to fail.
      const r = db.prepare("UPDATE listings SET status = 'reserved', buyer_id = ? WHERE id = ? AND status = 'live'")
        .run(req.user.id, order.listing_id);
      if (r.changes === 0) {
        db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(order.id);
        return false;
      }
    }
    db.prepare("UPDATE orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
    db.prepare("UPDATE users SET items_ordered = items_ordered + ?, kg_avoided = kg_avoided + ? WHERE id = ?")
      .run(qty, order.kg_avoided, req.user.id);
    return true;
  });

  if (!run()) return res.status(409).json({ error: "Someone else just bought this item. If you paid, please contact the seller." });
  res.json({ orderId: order.id, status: "paid", kind: order.kind, total: order.total });
};
