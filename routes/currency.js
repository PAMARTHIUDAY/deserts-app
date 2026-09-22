const express = require("express");
const router = express.Router();
const { RATES } = require("../utils/currencies");

router.get("/", (req, res) => res.json({ current: req.session.currency || "USD", rates: RATES }));
router.post("/set", (req, res) => {
  const { currency } = req.body;
  if (!RATES[currency]) return res.status(400).json({ ok: false });
  req.session.currency = currency;
  res.json({ ok: true, currency });
});

module.exports = router;
