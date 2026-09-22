const express = require("express");
const router = express.Router();
const Dessert = require("../models/Dessert");

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  const regex = new RegExp(q, "i");
  const results = await Dessert.find({ $or: [{ name: regex }, { category: regex }, { description: regex }] })
    .limit(8).select("name category price image _id");
  res.json(results);
});

module.exports = router;
