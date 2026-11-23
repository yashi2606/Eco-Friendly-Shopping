const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/profileController");
router.use(auth);
router.get("/", c.get);
router.put("/", c.update);
module.exports = router;
