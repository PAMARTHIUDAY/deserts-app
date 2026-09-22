const express = require("express");
const router = express.Router();
const Dessert = require("../models/Dessert");
const Order = require("../models/Order");
const Review = require("../models/Review");
const { requireAdmin } = require("../middleware/auth");

router.get("/login", (req, res) => res.render("admin-login", { error: null }));

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  res.render("admin-login", { error: "Invalid credentials" });
});

router.get("/logout", (req, res) => { req.session.isAdmin = false; res.redirect("/admin/login"); });

router.get("/", requireAdmin, async (req, res) => {
  const desserts = await Dessert.find().sort({ createdAt: -1 });
  const orders = await Order.find().sort({ createdAt: -1 }).limit(20);
  const paidOrders = await Order.find({ status: "paid" });
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const days = 14;
  const salesMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    salesMap[d.toISOString().slice(0, 10)] = 0;
  }
  paidOrders.forEach(o => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (salesMap[key] !== undefined) salesMap[key] += o.total;
  });

  const itemCounts = {};
  paidOrders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const reviewCount = await Review.countDocuments();
  const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5).populate("dessertId", "name");

  res.render("admin-dashboard", {
    desserts, orders,
    stats: { totalRevenue: totalRevenue.toFixed(2), totalOrders, avgOrderValue: avgOrderValue.toFixed(2), reviewCount },
    chart: { labels: Object.keys(salesMap), data: Object.values(salesMap) },
    topItems, recentReviews
  });
});

router.post("/desserts", requireAdmin, async (req, res) => {
  const { name, category, price, description, image, gallery } = req.body;
  await Dessert.create({
    name, category, price: parseFloat(price), description, image,
    gallery: gallery ? gallery.split(",").map(s => s.trim()) : [image]
  });
  res.redirect("/admin");
});

router.post("/desserts/:id", requireAdmin, async (req, res) => {
  const { name, category, price, description, image, inStock } = req.body;
  await Dessert.findByIdAndUpdate(req.params.id, {
    name, category, price: parseFloat(price), description, image, inStock: inStock === "on"
  });
  res.redirect("/admin");
});

router.post("/desserts/:id/delete", requireAdmin, async (req, res) => {
  await Dessert.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

module.exports = router;
