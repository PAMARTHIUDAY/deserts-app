require("dotenv").config();
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
