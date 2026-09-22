const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  type: { type: String, enum: ["percent","fixed"], required: true },
  value: { type: Number, required: true }, minSubtotal: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 }, usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null }, active: { type: Boolean, default: true }
}, { timestamps: true });
couponSchema.methods.isValid = function (subtotal) {
  if (!this.active) return { ok: false, msg: "Coupon is inactive" };
  if (this.expiresAt && this.expiresAt < new Date()) return { ok: false, msg: "Coupon expired" };
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return { ok: false, msg: "Usage limit reached" };
  if (subtotal < this.minSubtotal) return { ok: false, msg: "Minimum subtotal required" };
  return { ok: true };
};
couponSchema.methods.apply = function (subtotal) {
  if (this.type === "percent") return +(subtotal * (this.value / 100)).toFixed(2);
  return Math.min(this.value, subtotal);
};
module.exports = mongoose.model("Coupon", couponSchema);
