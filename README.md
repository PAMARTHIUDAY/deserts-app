# 🍰 Sweet Deserts

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF.svg?logo=stripe&logoColor=white)](https://stripe.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

A full-stack dessert e-commerce application featuring **Red Velvet Cake, Brownies, Caramel, and more** — built with Node.js, Express, MongoDB, Stripe, and a fully-featured admin panel.

## ✨ Features

- 🎂 **18+ desserts** across Red Velvet, Brownies, Caramel, Cakes, and more
- 🖼️ **30+ high-quality images** (via Unsplash CDN)
- 🛒 **Session-based cart** (MongoDB-backed)
- 💳 **Stripe checkout** with test/production support
- 📧 **Order confirmation emails** (Nodemailer)
- ⭐ **Product reviews & star ratings**
- 🔍 **Live search with autocomplete**
- 📊 **Admin panel** with analytics (Chart.js)
- 🚚 **Shipping addresses, methods, free shipping over $50**
- 📦 **Order tracking with timeline & status updates**
- 🎟️ **Coupon codes** (percent / fixed, min subtotal, usage limits)
- ❤️ **Wishlist** (Mongo-persisted)
- 🌍 **Multi-currency** (USD, EUR, GBP, INR, JPY, AUD, CAD)
- 📱 **PWA** (installable, offline-capable)
- 🐳 **Docker & docker-compose** ready

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Templates | EJS |
| Payments | Stripe Checkout |
| Emails | Nodemailer |
| Charts | Chart.js |
| Sessions | express-session + connect-mongo |
| Container | Docker, docker-compose |
| PWA | Service Worker + Web App Manifest |

## 📁 Project Structure

```
deserts-app/
├── server.js           # Express entry point
├── seed.js             # Seed desserts + coupons
├── config/db.js        # MongoDB connection
├── models/             # Dessert, Order, Review, Coupon, User
├── routes/             # shop, cart, checkout, admin, reviews, search,
│                       # coupons, wishlist, orders, currency
├── middleware/auth.js  # Admin guard
├── utils/              # mailer, currencies
├── public/             # css, js, manifest, service worker
├── views/              # EJS templates
└── data/desserts.js    # Seed data
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (or use Docker)
- Stripe account (test keys) — [get here](https://dashboard.stripe.com/test/apikeys)
- SMTP credentials (Ethereal works for free) — [get here](https://ethereal.email/)

### Local Setup

```bash
git clone https://github.com/PAMARTHIUDAY/deserts-app.git
cd deserts-app
npm install
cp .env.example .env       # fill in Stripe + SMTP + Mongo
npm run seed
npm start
```

Open 👉 http://localhost:3000

### Docker Setup

```bash
cp .env.example .env
docker-compose up --build -d
docker-compose exec app node seed.js
```

## 🔐 Environment Variables

See `.env.example` for the full list.

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `SESSION_SECRET` | Session encryption key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SMTP_*` | Email credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login |

## 🧪 Test Data

**Stripe test card:**
```
Number: 4242 4242 4242 4242
Expiry: any future date
CVC:    any 3 digits
```

**Coupon codes:**

| Code | Discount | Min Subtotal |
|------|----------|--------------|
| `WELCOME10` | 10% off | $0 |
| `SWEET20` | 20% off | $30 |
| `FIVEOFF` | $5 off | $20 |
| `FIRSTORDER` | 15% off | $25 |

**Admin login:**
- Email: `admin@deserts.com`
- Password: `admin123`

> ⚠️ Change these in `.env` before deploying to production!

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/desserts` | List all desserts |
| GET | `/api/desserts/:id` | Get one dessert |
| GET | `/api/search?q=` | Autocomplete search |
| GET | `/api/reviews/:dessertId` | Dessert reviews |
| POST | `/api/reviews/:dessertId` | Add a review |
| POST | `/api/coupons/validate` | Validate a coupon |
| GET | `/api/currency` | List currency rates |
| POST | `/api/currency/set` | Set session currency |

## 📜 License

MIT — see [LICENSE](LICENSE).

---

Made with ❤️ & 🍫
- SWEET20 — 20% off (min $30)
- FIVEOFF — $5 off (min $20)
- FIRSTORDER — 15% off (min $25)

## 📜 License
MIT
