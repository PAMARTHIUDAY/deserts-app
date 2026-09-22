const express = require("express");
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
