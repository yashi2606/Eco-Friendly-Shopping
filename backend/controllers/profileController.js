const db = require("../db");
const GOALS = ["", "plastic", "carbon", "waste", "fair"];

const out = u => ({ name: u.name, goal: u.goal, items: u.items_ordered, kg: +u.kg_avoided.toFixed(1) });

exports.get = (req, res) => res.json(out(req.user));

exports.update = (req, res) => {
  const { name, goal } = req.body || {};
  const u = req.user;
  const newName = typeof name === "string" ? name.trim().slice(0, 40) : u.name;
  const newGoal = typeof goal === "string" && GOALS.includes(goal) ? goal : u.goal;
  db.prepare("UPDATE users SET name = ?, goal = ? WHERE id = ?").run(newName, newGoal, u.id);
  res.json(out({ ...u, name: newName, goal: newGoal }));
};
