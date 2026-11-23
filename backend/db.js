const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// DB path hamesha backend folder ke hisaab se (kahin se bhi start karo, same file milegi)
const DB_PATH = path.resolve(__dirname, process.env.DB_PATH || "./data/eco.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  materials INTEGER NOT NULL,
  packaging INTEGER NOT NULL,
  carbon INTEGER NOT NULL,
  emoji TEXT,
  goals TEXT,
  description TEXT,
  score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  goal TEXT DEFAULT '',
  items_ordered INTEGER DEFAULT 0,
  kg_avoided REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  items TEXT NOT NULL,
  total INTEGER NOT NULL,
  avg_score INTEGER NOT NULL,
  kg_avoided REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  seller_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cond TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT DEFAULT '',
  seller_name TEXT NOT NULL,
  upi TEXT NOT NULL,
  photo TEXT,
  status TEXT DEFAULT 'live',
  buyer_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);
`);

// Purani DB ho to naye columns jod do
const orderCols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
if (!orderCols.includes("kind"))       db.exec("ALTER TABLE orders ADD COLUMN kind TEXT DEFAULT 'store'");
if (!orderCols.includes("listing_id")) db.exec("ALTER TABLE orders ADD COLUMN listing_id TEXT");
if (!orderCols.includes("paid_at"))    db.exec("ALTER TABLE orders ADD COLUMN paid_at TEXT");

const count = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
if (count === 0) {
  const seed = [
    [1,"Bamboo toothbrush, 4-pack","Personal care",249,96,90,88,"🪥",["plastic","waste"],"Compostable handle and plant-based bristles in paper packaging."],
    [2,"Shampoo bar","Personal care",349,90,95,82,"🧼",["plastic","waste"],"Lasts about 80 washes with no plastic bottle."],
    [3,"Copper water bottle","Kitchen",899,80,85,70,"🫗",["plastic","fair"],"Made by artisans, built to last for years."],
    [4,"Beeswax food wraps","Kitchen",449,88,92,85,"🍯",["plastic","waste"],"Replaces cling film. Wash and reuse for a year."],
    [5,"Recycled plastic storage set","Kitchen",599,55,62,58,"🥡",[],"Made from recycled plastic, but still plastic."],
    [6,"Jute tote bag","Fashion",299,92,90,86,"👜",["plastic","carbon","fair"],"Hand-woven natural fibre that carries heavy loads."],
    [7,"Organic cotton tee","Fashion",799,78,70,66,"👕",["fair"],"Grown without synthetic pesticides."],
    [8,"Recycled polyester jacket","Fashion",2499,60,62,55,"🧥",["waste"],"Made from recycled bottles, but sheds microfibres."],
    [9,"Soy wax candle","Home",399,82,74,68,"🕯️",["fair"],"Clean-burning wax in a reusable glass jar."],
    [10,"Coir doormat","Home",549,90,80,84,"🚪",["carbon","fair"],"Coconut husk fibre from local farms."],
    [11,"Solar power bank","Travel",1799,65,70,78,"🔋",["carbon"],"Charges from sunlight and cuts grid use."],
    [12,"Steel straw kit","Travel",199,85,88,80,"🥤",["plastic","waste"],"Foldable straws with a cleaning brush."],
    [13,"Recycled plastic bottle","Travel",349,55,60,50,"🍼",[],"Lighter, but short-lived and hard to recycle again."]
  ];
  const ins = db.prepare(`INSERT INTO products
    (id,name,category,price,materials,packaging,carbon,emoji,goals,description,score)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction(() => {
    for (const p of seed) {
      const score = Math.round((p[4] + p[5] + p[6]) / 3);
      ins.run(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],JSON.stringify(p[8]),p[9],score);
    }
  })();
  console.log("[db] Seeded 13 products.");
}

module.exports = db;
