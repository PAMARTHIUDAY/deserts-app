const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  guestKey: { type: String, required: true, unique: true, index: true },
  email: String, wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dessert" }]
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
