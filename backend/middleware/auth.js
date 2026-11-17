const db = require("../db");

// Har browser ka ek device id hota hai (login ki jagah). Demo ke liye theek hai;
// asli store mein proper login (OTP / email / Google) lagana.
module.exports = function auth(req, res, next) {
  const deviceId = req.header("X-Device-Id");
  if (!deviceId || !/^[A-Za-z0-9_-]{8,64}$/.test(deviceId))
    return res.status(400).json({ error: "Missing or invalid X-Device-Id header" });

  let user = db.prepare("SELECT * FROM users WHERE device_id = ?").get(deviceId);
  if (!user) {
    const info = db.prepare("INSERT INTO users (device_id) VALUES (?)").run(deviceId);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  }
  req.user = user;
  next();
};
