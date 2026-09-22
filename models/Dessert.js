const mongoose = require("mongoose");
const dessertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  image: { type: String, required: true },
  gallery: [String],
  inStock: { type: Boolean, default: true },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model("Dessert", dessertSchema);
