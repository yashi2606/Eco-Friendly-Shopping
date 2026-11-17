const db = require("../db");

exports.list = (req, res) => {
  const { cat, goal, sort } = req.query;
  let sql = "SELECT * FROM products";
  const params = [];
  if (cat && cat !== "All") { sql += " WHERE category = ?"; params.push(String(cat)); }

  const rows = db.prepare(sql).all(...params).map(r => ({
    ...r, goals: JSON.parse(r.goals || "[]"),
  }));

  const hit = x => (goal && x.goals.includes(goal) ? 1 : 0);
  if (sort === "low")        rows.sort((a, b) => a.price - b.price);
  else if (sort === "score") rows.sort((a, b) => b.score - a.score);
  else                       rows.sort((a, b) => (hit(b) - hit(a)) || b.score - a.score);

  res.json(rows);
};

exports.getOne = (req, res) => {
  const r = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  r.goals = JSON.parse(r.goals || "[]");
  res.json(r);
};
