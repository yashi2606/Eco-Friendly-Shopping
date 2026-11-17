const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/orderController");
router.use(auth);
router.post("/", c.create);
router.get("/", c.listMine);
module.exports = router;
