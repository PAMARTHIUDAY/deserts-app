require("dotenv").config();
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
