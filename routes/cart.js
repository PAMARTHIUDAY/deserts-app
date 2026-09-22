const express = require("express");
const router = express.Router();
const Dessert = require("../models/Dessert");

function ensureCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

router.get("/", async (req, res) => {
  const cart = ensureCart(req);
  const items = await Dessert.find({ _id: { $in: Object.keys(cart) } });
  const detailed = items.map(d => ({ ...d.toObject(), qty: cart[d._id.toString()] }));
  const total = detailed.reduce((s, i) => s + i.price * i.qty, 0);
  res.render("cart", { items: detailed, total: total.toFixed(2), cart });
});

router.post("/add/:id", (req, res) => {
  const cart = ensureCart(req);
  cart[req.params.id] = (cart[req.params.id] || 0) + 1;
  res.json({ ok: true, count: Object.values(cart).reduce((a, b) => a + b, 0), cart });
});

router.post("/update/:id", (req, res) => {
  const cart = ensureCart(req);
  const qty = parseInt(req.body.qty) || 0;
  if (qty <= 0) delete cart[req.params.id];
  else cart[req.params.id] = qty;
  res.json({ ok: true, cart });
});

router.post("/remove/:id", (req, res) => {
  const cart = ensureCart(req);
  delete cart[req.params.id];
  res.json({ ok: true, cart });
});

router.post("/clear", (req, res) => {
  req.session.cart = {};
  res.json({ ok: true });
});

module.exports = router;
