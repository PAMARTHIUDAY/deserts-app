const fs = require("fs");
const path = require("path");

const files = {};

files["server.js"] = `require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const connectDB = require("./config/db");
const shopRoutes = require("./routes/shop");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/reviews");
const searchRoutes = require("./routes/search");
const couponRoutes = require("./routes/coupons");
const wishlistRoutes = require("./routes/wishlist");
const orderRoutes = require("./routes/orders");
const currencyRoutes = require("./routes/currency");
const { RATES, format } = require("./utils/currencies");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use("/checkout/webhook", express.raw({ type: "application/json" }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/deserts" }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(async (req, res, next) => {
  const cart = req.session.cart || {};
  const currency = req.session.currency || "USD";
  res.locals.cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  res.locals.isAdmin = !!req.session.isAdmin;
  res.locals.searchQuery = req.query.q || "";
  res.locals.currency = currency;
  res.locals.currencies = RATES;
  res.locals.formatPrice = usd => format(usd, currency);
  try {
    const User = require("./models/User");
    const user = await User.findOne({ guestKey: req.sessionID });
    res.locals.wishlistCount = user ? user.wishlist.length : 0;
  } catch { res.locals.wishlistCount = 0; }
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/", shopRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/orders", orderRoutes);

const Dessert = require("./models/Dessert");
app.get("/api/desserts", async (req, res) => res.json(await Dessert.find()));
app.get("/api/desserts/:id", async (req, res) => {
  const d = await Dessert.findById(req.params.id);
  d ? res.json(d) : res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => console.log("Sweet Deserts running at http://localhost:" + PORT));
`;

files["seed.js"] = `require("dotenv").config();
const connectDB = require("./config/db");
const Dessert = require("./models/Dessert");
const Coupon = require("./models/Coupon");
const desserts = require("./data/desserts");

(async () => {
  await connectDB();
  await Dessert.deleteMany({});
  await Dessert.insertMany(desserts);
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0 },
    { code: "SWEET20", type: "percent", value: 20, minSubtotal: 30, maxUses: 100 },
    { code: "FIVEOFF", type: "fixed", value: 5, minSubtotal: 20 },
    { code: "FIRSTORDER", type: "percent", value: 15, minSubtotal: 25 }
  ]);
  console.log("Seeded " + desserts.length + " desserts + 4 coupons");
  process.exit(0);
})();
`;

files["utils/currencies.js"] = `const RATES = {
  USD: { symbol: "$", rate: 1, name: "US Dollar" },
  EUR: { symbol: "\\u20ac", rate: 0.92, name: "Euro" },
  GBP: { symbol: "\\u00a3", rate: 0.79, name: "British Pound" },
  INR: { symbol: "\\u20b9", rate: 83.2, name: "Indian Rupee" },
  JPY: { symbol: "\\u00a5", rate: 156.4, name: "Japanese Yen" },
  AUD: { symbol: "A$", rate: 1.52, name: "Australian Dollar" },
  CAD: { symbol: "C$", rate: 1.36, name: "Canadian Dollar" }
};
function convert(usdAmount, currency) {
  const c = RATES[currency] || RATES.USD;
  return +(usdAmount * c.rate).toFixed(2);
}
function format(usdAmount, currency) {
  const c = RATES[currency] || RATES.USD;
  const val = convert(usdAmount, currency);
  return c.symbol + val.toFixed(currency === "JPY" ? 0 : 2);
}
module.exports = { RATES, convert, format };
`;

files["utils/mailer.js"] = `const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendOrderConfirmation(order, toEmail) {
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  const rows = order.items.map(i => "<tr><td>" + i.qty + " x " + i.name + "</td><td align=right>$" + (i.price * i.qty).toFixed(2) + "</td></tr>").join("");
  const html = "<div style='font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fff8f2;border-radius:12px;'>" +
    "<h1 style='color:#7a1f2b;'>Sweet Deserts</h1><h2>Thank you for your order!</h2>" +
    "<p>Tracking #: <strong>" + (order.trackingNumber || "-") + "</strong></p>" +
    "<table width=100% cellpadding=8 style='background:#fff;'>" + rows +
    "<tr style='border-top:2px solid #7a1f2b;'><td><strong>Total</strong></td><td align=right><strong>$" + order.total.toFixed(2) + "</strong></td></tr></table>" +
    "<p style='color:#a1273a;'>Deliciousness on its way!</p></div>";
  try {
    const info = await transporter.sendMail({ from: process.env.MAIL_FROM, to: toEmail, subject: "Your Sweet Deserts order", html });
    console.log("Email sent:", info.messageId);
  } catch (err) { console.error("Email failed:", err.message); }
}
module.exports = { sendOrderConfirmation };
`;

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
});

console.log("Part B1 created " + Object.keys(files).length + " files");
