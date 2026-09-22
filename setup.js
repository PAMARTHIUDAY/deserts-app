const fs = require("fs");
const path = require("path");

const files = {};

// ====================== ROOT FILES ======================
files[".env.example"] = `PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/deserts
SESSION_SECRET=change_me_super_secret
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@deserts.com
ADMIN_PASSWORD=admin123
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_user@ethereal.email
SMTP_PASS=your_password
MAIL_FROM="Sweet Deserts <no-reply@sweetdeserts.com>"
`;

files[".gitignore"] = `node_modules/
.env
.env.local
*.log
.DS_Store
`;

files[".dockerignore"] = `node_modules
npm-debug.log
.env
.git
.gitignore
`;

files["package.json"] = JSON.stringify({
  name: "deserts-app",
  version: "4.0.0",
  description: "Full-stack dessert e-commerce app",
  main: "server.js",
  scripts: {
    start: "node server.js",
    dev: "nodemon server.js",
    seed: "node seed.js"
  },
  dependencies: {
    "connect-mongo": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "ejs": "^3.1.10",
    "express": "^4.19.2",
    "express-session": "^1.18.0",
    "mongoose": "^8.5.0",
    "nodemailer": "^6.9.14",
    "stripe": "^16.2.0",
    "uuid": "^10.0.0"
  },
  devDependencies: {
    nodemon: "^3.1.0"
  }
}, null, 2);

files["Dockerfile"] = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`;

files["docker-compose.yml"] = `version: "3.9"
services:
  app:
    build: .
    container_name: deserts-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGO_URI=mongodb://mongo:27017/deserts
      - SESSION_SECRET=change_me_super_secret
    depends_on:
      - mongo
  mongo:
    image: mongo:7
    container_name: deserts-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
`;

files["README.md"] = `# 🍰 Sweet Deserts

Full-stack dessert e-commerce app — Red Velvet Cake, Brownies, Caramel & more.

**Stack:** Node.js · Express · MongoDB · Stripe · EJS · Nodemailer · Chart.js · Docker · PWA

## 🚀 Quick Start

\`\`\`bash
npm install
cp .env.example .env
npm run seed
npm start
\`\`\`

Open http://localhost:3000
Admin: http://localhost:3000/admin/login (admin@deserts.com / admin123)

## 💳 Test Card
4242 4242 4242 4242 · any future date · any CVC

## 🎟️ Coupons
- WELCOME10 — 10% off
- SWEET20 — 20% off (min $30)
- FIVEOFF — $5 off (min $20)
- FIRSTORDER — 15% off (min $25)

## 📜 License
MIT
`;

// ====================== CONFIG ======================
files["config/db.js"] = `const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/deserts");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
`;

// ====================== DATA ======================
files["data/desserts.js"] = `module.exports = [
  { name: "Classic Red Velvet Cake", category: "Red Velvet", price: 24.99, description: "Moist red velvet layers with cream cheese frosting.", image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800", gallery: ["https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800","https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800"] },
  { name: "Red Velvet Cupcakes (6pcs)", category: "Red Velvet", price: 14.99, description: "Six fluffy red velvet cupcakes.", image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800", gallery: ["https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800"] },
  { name: "Red Velvet Cheesecake", category: "Red Velvet", price: 29.99, description: "Red velvet cake fused with creamy cheesecake.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800", gallery: ["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800"] },
  { name: "Red Velvet Cake Pops", category: "Red Velvet", price: 11.99, description: "Bite-sized red velvet cake pops.", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800", gallery: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800"] },
  { name: "Fudgy Chocolate Brownies", category: "Brownies", price: 12.99, description: "Rich gooey brownies with Belgian chocolate.", image: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800", gallery: ["https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800"] },
  { name: "Walnut Brownies", category: "Brownies", price: 13.99, description: "Classic brownies loaded with walnuts.", image: "https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800", gallery: ["https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800"] },
  { name: "Blondie Brownies", category: "Brownies", price: 13.49, description: "Buttery blondies with white chocolate chips.", image: "https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=800", gallery: ["https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=800"] },
  { name: "Brownie Sundae", category: "Brownies", price: 9.99, description: "Warm brownie with vanilla ice cream.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800", gallery: ["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800"] },
  { name: "Salted Caramel Cake", category: "Caramel", price: 27.99, description: "Layered caramel cake with salted drizzle.", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800", gallery: ["https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800"] },
  { name: "Caramel Cheesecake", category: "Caramel", price: 28.99, description: "Creamy cheesecake with caramel topping.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800", gallery: ["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800"] },
  { name: "Caramel Pudding", category: "Caramel", price: 8.99, description: "Silky smooth caramel flan.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800", gallery: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800"] },
  { name: "Caramel Popcorn Brownie", category: "Caramel", price: 11.99, description: "Brownie topped with caramel popcorn.", image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800", gallery: ["https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800"] },
  { name: "Classic Tiramisu", category: "Other", price: 22.99, description: "Italian coffee-flavored layered dessert.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", gallery: ["https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800"] },
  { name: "Chocolate Lava Cake", category: "Other", price: 15.99, description: "Molten chocolate center.", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800", gallery: ["https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800"] },
  { name: "Strawberry Shortcake", category: "Other", price: 18.99, description: "Fresh strawberries with cream.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800", gallery: ["https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800"] },
  { name: "French Macarons (12pcs)", category: "Other", price: 24.00, description: "Colorful assorted macarons.", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800", gallery: ["https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800"] },
  { name: "Glazed Donuts (6pcs)", category: "Other", price: 10.99, description: "Soft donuts with chocolate glaze.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800", gallery: ["https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800"] },
  { name: "New York Cheesecake", category: "Other", price: 26.99, description: "Classic dense cheesecake.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800", gallery: ["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800"] }
];
`;

// ====================== MIDDLEWARE ======================
files["middleware/auth.js"] = `function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  res.redirect("/admin/login");
}
module.exports = { requireAdmin };
`;

// ====================== MODELS ======================
files["models/Dessert.js"] = `const mongoose = require("mongoose");
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
`;

files["models/Order.js"] = `const mongoose = require("mongoose");
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
`;

files["models/Review.js"] = `const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  dessertId: { type: mongoose.Schema.Types.ObjectId, ref: "Dessert", required: true, index: true },
  name: { type: String, required: true }, email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, comment: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model("Review", reviewSchema);
`;

files["models/Coupon.js"] = `const mongoose = require("mongoose");
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
`;

files["models/User.js"] = `const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  guestKey: { type: String, required: true, unique: true, index: true },
  email: String, wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dessert" }]
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
`;

// ====================== WRITE ALL ======================
Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
});

console.log("✅ Created", Object.keys(files).length, "files");
