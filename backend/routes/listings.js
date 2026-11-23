const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/listingController");

router.get("/", c.list);                 // public: sirf live items
router.get("/mine", auth, c.mine);       // /mine, /:id wale routes se pehle
router.get("/:id/photo", c.photo);       // public: photo
router.post("/", auth, c.create);
router.post("/:id/buy", auth, c.buy);
router.patch("/:id", auth, c.setStatus);
router.delete("/:id", auth, c.remove);

module.exports = router;
