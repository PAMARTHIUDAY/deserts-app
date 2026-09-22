const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(30);
  res.render("orders", { orders, cart: req.session.cart || {} });
});

router.get("/track/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send("Order not found");
    res.render("track", { order, cart: req.session.cart || {} });
  } catch { res.status(404).send("Order not found"); }
});

module.exports = router;
