const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/paymentController");
router.use(auth);
router.get("/qr/:orderId", c.qr);
router.post("/:orderId/confirm", c.confirm);
module.exports = router;
