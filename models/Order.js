const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  customerEmail: String,
  items: [{ dessertId: { type: mongoose.Schema.Types.ObjectId, ref: "Dessert" }, name: String, price: Number, qty: Number }],
  subtotal: Number, discount: { type: Number, default: 0 }, shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 }, total: Number, currency: { type: String, default: "USD" }, couponCode: String,
  shippingAddress: { fullName: String, address1: String, address2: String, city: String, state: String, postalCode: String, country: String, phone: String },
  shippingMethod: { type: String, default: "standard" },
  trackingNumber: String,
  trackingStatus: { type: String, enum: ["pending","paid","preparing","shipped","out_for_delivery","delivered","cancelled"], default: "pending" },
  trackingHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  stripeSessionId: String,
  status: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" }
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
