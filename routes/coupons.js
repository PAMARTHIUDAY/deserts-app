const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

router.post("/validate", async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ ok: false, msg: "No coupon code" });
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.json({ ok: false, msg: "Invalid coupon code" });
  const check = coupon.isValid(parseFloat(subtotal) || 0);
  if (!check.ok) return res.json(check);
  const discount = coupon.apply(parseFloat(subtotal) || 0);
  res.json({ ok: true, code: coupon.code, discount, type: coupon.type, value: coupon.value });
});

module.exports = router;
