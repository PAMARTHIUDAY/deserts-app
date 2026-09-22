const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Dessert = require("../models/Dessert");

async function recalcRating(dessertId) {
  const reviews = await Review.find({ dessertId });
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Dessert.findByIdAndUpdate(dessertId, { avgRating: Math.round(avg * 10) / 10, reviewCount: count });
}

router.get("/:dessertId", async (req, res) => {
  const reviews = await Review.find({ dessertId: req.params.dessertId }).sort({ createdAt: -1 });
  res.json(reviews);
});

router.post("/:dessertId", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    if (!name || !email || !rating || !comment) return res.status(400).json({ error: "All fields required" });
    const review = await Review.create({ dessertId: req.params.dessertId, name, email, rating: parseInt(rating), comment });
    await recalcRating(req.params.dessertId);
    res.json({ ok: true, review });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
