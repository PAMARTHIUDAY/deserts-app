const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Dessert = require("../models/Dessert");

async function getOrCreateUser(req) {
  const key = req.sessionID;
  let user = await User.findOne({ guestKey: key });
  if (!user) user = await User.create({ guestKey: key, wishlist: [] });
  return user;
}

router.get("/", async (req, res) => {
  const user = await getOrCreateUser(req);
  const items = await Dessert.find({ _id: { $in: user.wishlist } });
  res.render("wishlist", { items, cart: req.session.cart || {} });
});

router.post("/toggle/:id", async (req, res) => {
  const user = await getOrCreateUser(req);
  const id = req.params.id;
  const idx = user.wishlist.findIndex(i => i.toString() === id);
  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(id);
  await user.save();
  res.json({ ok: true, count: user.wishlist.length, inWishlist: idx < 0 });
});

module.exports = router;
