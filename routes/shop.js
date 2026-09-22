const express = require("express");
const router = express.Router();
const Dessert = require("../models/Dessert");
const Review = require("../models/Review");

router.get("/", async (req, res) => {
  const featured = await Dessert.find().limit(8);
  const categories = await Dessert.distinct("category");
  res.render("index", { featured, categories, cart: req.session.cart || {} });
});

router.get("/menu", async (req, res) => {
  const { category, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
  }
  const desserts = await Dessert.find(filter);
  const categories = await Dessert.distinct("category");
  res.render("menu", { desserts, categories, activeCategory: category, searchQuery: q || "", cart: req.session.cart || {} });
});

router.get("/dessert/:id", async (req, res) => {
  const dessert = await Dessert.findById(req.params.id);
  if (!dessert) return res.status(404).send("Dessert not found");
  const reviews = await Review.find({ dessertId: dessert._id }).sort({ createdAt: -1 });
  res.render("item", { dessert, reviews, cart: req.session.cart || {} });
});

module.exports = router;
