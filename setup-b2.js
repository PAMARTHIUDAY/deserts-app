const fs = require("fs");
const path = require("path");
const files = {};

files["routes/shop.js"] = `const express = require("express");
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
`;

files["routes/cart.js"] = `const express = require("express");
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
`;

files["routes/reviews.js"] = `const express = require("express");
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
`;

files["routes/search.js"] = `const express = require("express");
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
`;

files["routes/coupons.js"] = `const express = require("express");
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
`;

files["routes/currency.js"] = `const express = require("express");
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
`;

files["routes/wishlist.js"] = `const express = require("express");
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
`;

files["routes/orders.js"] = `const express = require("express");
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
`;

files["routes/checkout.js"] = `const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Stripe = require("stripe");
const Dessert = require("../models/Dessert");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendOrderConfirmation } = require("../utils/mailer");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
const SHIPPING_RATES = { standard: 5.0, express: 12.0, overnight: 25.0 };
const FREE_SHIPPING_THRESHOLD = 50.0;
const TAX_RATE = 0.08;

function computeTotals({ subtotal, shippingMethod, coupon }) {
  const shippingBase = SHIPPING_RATES[shippingMethod] || SHIPPING_RATES.standard;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingBase;
  const discount = coupon ? coupon.apply(subtotal) : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = +(taxable * TAX_RATE).toFixed(2);
  const total = +(taxable + shipping + tax).toFixed(2);
  return { subtotal, shipping, discount, tax, total };
}

router.post("/quote", async (req, res) => {
  const cart = req.session.cart || {};
  const ids = Object.keys(cart);
  if (!ids.length) return res.json({ subtotal: 0, shipping: 0, discount: 0, tax: 0, total: 0 });
  const items = await Dessert.find({ _id: { $in: ids } });
  const subtotal = items.reduce((s, d) => s + d.price * cart[d._id.toString()], 0);
  let coupon = null;
  if (req.body.couponCode) {
    const c = await Coupon.findOne({ code: req.body.couponCode.toUpperCase() });
    if (c && c.isValid(subtotal).ok) coupon = c;
  }
  res.json(computeTotals({ subtotal, shippingMethod: req.body.shippingMethod, coupon }));
});

router.post("/create-session", async (req, res) => {
  try {
    const cart = req.session.cart || {};
    const ids = Object.keys(cart);
    if (!ids.length) return res.status(400).json({ error: "Cart is empty" });
    const { shippingAddress, shippingMethod = "standard", couponCode, currency = "USD" } = req.body;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address1) return res.status(400).json({ error: "Shipping address required" });
    const items = await Dessert.find({ _id: { $in: ids } });
    const subtotal = items.reduce((s, d) => s + d.price * cart[d._id.toString()], 0);
    let coupon = null;
    if (couponCode) {
      const c = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (c && c.isValid(subtotal).ok) coupon = c;
    }
    const totals = computeTotals({ subtotal, shippingMethod, coupon });
    const line_items = items.map(d => ({
      price_data: { currency: "usd", product_data: { name: d.name, description: d.description, images: [d.image] }, unit_amount: Math.round(d.price * 100) },
      quantity: cart[d._id.toString()]
    }));
    if (totals.shipping > 0) line_items.push({ price_data: { currency: "usd", product_data: { name: "Shipping" }, unit_amount: Math.round(totals.shipping * 100) }, quantity: 1 });
    if (totals.tax > 0) line_items.push({ price_data: { currency: "usd", product_data: { name: "Tax" }, unit_amount: Math.round(totals.tax * 100) }, quantity: 1 });
    const session = await stripe.checkout.sessions.create({
      mode: "payment", line_items,
      success_url: req.protocol + "://" + req.get("host") + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: req.protocol + "://" + req.get("host") + "/cart",
      customer_creation: "always",
      metadata: { cart: JSON.stringify(cart) }
    });
    const trackingNumber = "SD-" + uuidv4().slice(0, 8).toUpperCase();
    await Order.create({
      items: items.map(d => ({ dessertId: d._id, name: d.name, price: d.price, qty: cart[d._id.toString()] })),
      subtotal: totals.subtotal, shipping: totals.shipping, discount: totals.discount, tax: totals.tax, total: totals.total,
      currency, couponCode: coupon ? coupon.code : null, shippingAddress, shippingMethod, trackingNumber,
      trackingStatus: "pending", trackingHistory: [{ status: "pending", note: "Order created" }],
      stripeSessionId: session.id, status: "pending"
    });
    if (coupon) { coupon.usedCount += 1; await coupon.save(); }
    res.json({ url: session.url });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.get("/success", async (req, res) => {
  const { session_id } = req.query;
  try {
    const order = await Order.findOneAndUpdate(
      { stripeSessionId: session_id },
      { status: "paid", trackingStatus: "paid", $push: { trackingHistory: { status: "paid", note: "Payment received" } } },
      { new: true }
    );
    if (order) {
      try {
        const s = await stripe.checkout.sessions.retrieve(session_id, { expand: ["customer"] });
        const email = (s.customer_details && s.customer_details.email) || (s.customer && s.customer.email);
        if (email) { order.customerEmail = email; await order.save(); await sendOrderConfirmation(order, email); }
      } catch (e) { console.error(e.message); }
    }
    req.session.cart = {};
    res.render("success", { order });
  } catch { res.render("success", { order: null }); }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send("Webhook Error: " + err.message); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order = await Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: "paid", trackingStatus: "paid", customerEmail: session.customer_details ? session.customer_details.email : null },
      { new: true }
    );
    if (order && session.customer_details && session.customer_details.email) await sendOrderConfirmation(order, session.customer_details.email);
  }
  res.json({ received: true });
});

module.exports = router;
`;

files["routes/admin.js"] = `const express = require("express");
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
`;

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
});

console.log("Part B2 created " + Object.keys(files).length + " files");
