const fs = require("fs");
const path = require("path");
const files = {};

files["public/css/style.css"] = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Roboto, sans-serif; background: #fff8f2; color: #3a2a25; line-height: 1.6; }
header { background: #7a1f2b; color: #fff; padding: 14px 28px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
.nav { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
.nav h1 { font-size: 1.5rem; }
.nav nav { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.nav nav a { color: #ffd9b3; text-decoration: none; font-weight: 500; }
.nav nav a:hover { color: #fff; }
.badge { background: #ffb3c1; color: #7a1f2b; padding: 1px 8px; border-radius: 12px; font-size: .75rem; font-weight: 700; }
.search-form { position: relative; flex: 1; max-width: 300px; }
.search-form input { width: 100%; padding: 8px 14px; border-radius: 20px; border: none; outline: none; font-size: .9rem; }
.autocomplete { position: absolute; top: 110%; left: 0; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.15); max-height: 340px; overflow-y: auto; z-index: 200; opacity: 0; pointer-events: none; transition: opacity .15s; }
.autocomplete.open { opacity: 1; pointer-events: auto; }
.ac-item { display: flex; gap: 10px; padding: 10px 12px; text-decoration: none; color: #3a2a25; align-items: center; border-bottom: 1px solid #f2e6df; }
.ac-item:hover { background: #fff3ea; }
.ac-item img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
.ac-item strong { display: block; font-size: .95rem; }
.ac-item small { color: #a1273a; font-size: .8rem; }
.ac-empty { padding: 12px; color: #999; text-align: center; }
.currency-select { background: transparent; color: #ffd9b3; border: 1px solid #ffd9b3; border-radius: 8px; padding: 4px 8px; font-weight: 600; cursor: pointer; }
.currency-select option { color: #3a2a25; background: #fff; }
.hero { text-align: center; padding: 70px 20px; background: linear-gradient(135deg, #ffd9b3, #ffb3c1); color: #7a1f2b; }
.hero h2 { font-size: 2.5rem; margin-bottom: 12px; }
.hero p { font-size: 1.1rem; margin-bottom: 24px; }
.btn { display: inline-block; background: #7a1f2b; color: #fff; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; transition: transform .2s, background .2s; }
.btn:hover { transform: translateY(-2px); background: #a1273a; }
.btn.ghost { background: transparent; color: #7a1f2b; border: 2px solid #7a1f2b; margin-left: 8px; }
.btn-small { background: #7a1f2b; color: #fff; border: none; padding: 6px 14px; border-radius: 20px; font-size: .9rem; cursor: pointer; text-decoration: none; }
.btn-small.danger { background: #c0392b; }
.btn-small.ghost { background: transparent; color: #7a1f2b; border: 2px solid #7a1f2b; }
.categories { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 30px 20px 10px; }
.cat-pill { background: #ffd9b3; color: #7a1f2b; padding: 8px 20px; border-radius: 20px; text-decoration: none; font-weight: 600; }
.featured, .menu-header { padding: 40px 32px; max-width: 1300px; margin: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; padding: 20px 32px 60px; max-width: 1300px; margin: auto; }
.card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(122,31,43,.08); transition: transform .25s, box-shadow .25s; display: flex; flex-direction: column; }
.card:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(122,31,43,.18); }
.card img { width: 100%; height: 200px; object-fit: cover; }
.card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.category { color: #a1273a; font-size: .8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
.desc { font-size: .9rem; color: #6b5a55; flex: 1; margin-bottom: 12px; }
.row { display: flex; justify-content: space-between; align-items: center; }
.price { font-weight: 700; color: #7a1f2b; font-size: 1.1rem; }
.price.big { font-size: 1.8rem; margin: 16px 0; }
.details-link { display: inline-block; margin-top: 10px; color: #a1273a; font-size: .85rem; text-decoration: none; font-weight: 600; }
.item-page { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; margin: 40px auto; padding: 0 32px; }
.item-gallery img { width: 100%; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.1); }
.item-info h2 { font-size: 2rem; margin-bottom: 12px; }
.rating-line { display: flex; align-items: center; gap: 10px; margin: 6px 0 12px; }
.stars { color: #e0a924; }
.rating-text { font-size: .9rem; color: #6b5a55; }
.reviews-section { max-width: 900px; margin: 40px auto; padding: 0 32px; }
.review-form { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.06); margin-bottom: 24px; }
.review-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.review-form input, .review-form select, .review-form textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-family: inherit; }
.review-form textarea { min-height: 90px; margin-bottom: 12px; }
.review { background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.review-head { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
.review-head small { margin-left: auto; color: #999; }
.muted { color: #999; }
.cart-page { max-width: 1000px; margin: 40px auto; padding: 0 32px; }
.cart-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.cart-table th, .cart-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f2e6df; }
.cart-table th { background: #fff3ea; }
.cart-item { display: flex; align-items: center; gap: 12px; }
.cart-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
.qty-input { width: 60px; padding: 6px; border-radius: 6px; border: 1px solid #ddd; }
.checkout-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin: 24px 0; }
.cart-panel { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.06); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.form-grid input, .cart-panel select, .cart-panel input { padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 100%; }
.coupon-row { display: flex; gap: 8px; }
.coupon-msg { font-size: .85rem; margin-top: 6px; min-height: 18px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f2e6df; }
.summary-row.total { border-top: 2px solid #7a1f2b; font-size: 1.15rem; padding-top: 12px; margin-top: 8px; }
.success-page { max-width: 700px; margin: 60px auto; padding: 40px; background: #fff; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.08); text-align: center; }
.success-page ul { list-style: none; margin: 20px 0; text-align: left; }
.orders-page, .track-page, .wishlist-page { max-width: 900px; margin: 40px auto; padding: 0 32px; }
.order-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.06); margin-bottom: 16px; }
.order-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.order-head small { display: block; color: #999; }
.status { padding: 4px 12px; border-radius: 20px; font-size: .75rem; font-weight: 700; text-transform: uppercase; }
.status-pending { background: #ffe6b3; color: #8a5a00; }
.status-paid { background: #cfe8ff; color: #0d4a91; }
.status-delivered { background: #d4f7d4; color: #1e6b1e; }
.timeline { list-style: none; padding: 20px 0; margin: 20px 0; }
.timeline li { display: flex; gap: 16px; padding-bottom: 24px; position: relative; }
.timeline .dot { width: 24px; height: 24px; border-radius: 50%; background: #f2e6df; flex-shrink: 0; }
.timeline li.done .dot { background: #7a1f2b; }
.admin-login { max-width: 420px; margin: 60px auto; background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.08); }
.admin-login label, .admin-box label { display: block; margin-bottom: 12px; font-weight: 600; }
.admin-login input, .admin-box input, .admin-box textarea { width: 100%; padding: 10px; margin-top: 4px; border-radius: 8px; border: 1px solid #ddd; }
.admin-dash { max-width: 1300px; margin: 40px auto; padding: 0 32px; }
.admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.admin-box { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.06); margin-bottom: 16px; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.kpi { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.06); text-align: center; }
.kpi h4 { color: #a1273a; font-size: .85rem; text-transform: uppercase; }
.kpi p { font-size: 1.8rem; font-weight: 700; color: #7a1f2b; }
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.admin-table { width: 100%; border-collapse: collapse; background: #fff; }
.admin-table th, .admin-table td { padding: 10px 14px; border-bottom: 1px solid #f2e6df; text-align: left; }
.admin-table img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
.error { color: #c0392b; margin-bottom: 12px; }
#toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(30px); background: #7a1f2b; color: #fff; padding: 12px 24px; border-radius: 30px; z-index: 999; font-weight: 600; opacity: 0; transition: all .3s; }
#toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
footer { background: #7a1f2b; color: #ffd9b3; text-align: center; padding: 20px; margin-top: 60px; }
@media (max-width: 900px) { .chart-grid, .review-grid, .checkout-grid, .form-grid { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .item-page, .admin-grid { grid-template-columns: 1fr; } .hero h2 { font-size: 1.8rem; } }
`;

files["public/js/main.js"] = `function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) { toast = document.createElement("div"); toast.id = "toast"; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2000);
}
document.addEventListener("click", async (e) => {
  const addBtn = e.target.closest(".add-cart");
  if (addBtn) {
    const res = await fetch("/cart/add/" + addBtn.dataset.id, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      showToast("Added to cart");
      const badge = document.querySelector("nav a[href='/cart'] .badge");
      if (badge) badge.textContent = data.count;
    }
  }
});
document.querySelectorAll(".qty-input").forEach(inp => {
  inp.addEventListener("change", async () => {
    await fetch("/cart/update/" + inp.dataset.id, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty: inp.value }) });
    location.reload();
  });
});
document.querySelectorAll(".remove-item").forEach(btn => {
  btn.addEventListener("click", async () => { await fetch("/cart/remove/" + btn.dataset.id, { method: "POST" }); location.reload(); });
});
document.getElementById("clear-cart") && document.getElementById("clear-cart").addEventListener("click", async () => { await fetch("/cart/clear", { method: "POST" }); location.reload(); });
document.getElementById("review-form") && document.getElementById("review-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  const res = await fetch("/api/reviews/" + form.dataset.id, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (data.ok) { showToast("Thanks for your review!"); setTimeout(() => location.reload(), 800); } else showToast(data.error || "Failed");
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.style.opacity = 1; en.target.style.transform = "translateY(0)"; observer.unobserve(en.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".card").forEach(card => { card.style.opacity = 0; card.style.transform = "translateY(20px)"; card.style.transition = "opacity .5s ease, transform .5s ease"; observer.observe(card); });
`;

files["public/js/search.js"] = `(function () {
  const input = document.getElementById("search-input");
  const box = document.getElementById("autocomplete");
  if (!input || !box) return;
  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    const q = input.value.trim();
    if (!q) { box.innerHTML = ""; box.classList.remove("open"); return; }
    t = setTimeout(async () => {
      const res = await fetch("/api/search?q=" + encodeURIComponent(q));
      const items = await res.json();
      box.innerHTML = items.length
        ? items.map(i => "<a class='ac-item' href='/dessert/" + i._id + "'><img src='" + i.image + "'><div><strong>" + i.name + "</strong><small>" + i.category + " - $" + i.price.toFixed(2) + "</small></div></a>").join("")
        : "<div class='ac-empty'>No matches</div>";
      box.classList.add("open");
    }, 180);
  });
  document.addEventListener("click", e => { if (!box.contains(e.target) && e.target !== input) box.classList.remove("open"); });
})();
`;

files["public/js/cart.js"] = `(function () {
  const symbol = window.__SYMBOL__ || "$";
  const rate = window.__RATE__ || 1;
  function fmt(usd) { return symbol + (usd * rate).toFixed(2); }
  let appliedCoupon = null;
  async function refreshQuote() {
    const method = document.getElementById("ship-method") ? document.getElementById("ship-method").value : "standard";
    const res = await fetch("/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingMethod: method, couponCode: appliedCoupon }) });
    const t = await res.json();
    document.getElementById("sum-subtotal").textContent = fmt(t.subtotal || 0);
    document.getElementById("sum-discount").textContent = t.discount ? "-" + fmt(t.discount) : fmt(0);
    document.getElementById("sum-shipping").textContent = fmt(t.shipping || 0);
    document.getElementById("sum-tax").textContent = fmt(t.tax || 0);
    document.getElementById("sum-total").textContent = fmt(t.total || 0);
  }
  document.getElementById("apply-coupon") && document.getElementById("apply-coupon").addEventListener("click", async () => {
    const code = document.getElementById("coupon-code").value.trim();
    const msg = document.getElementById("coupon-msg");
    if (!code) return;
    const q = await fetch("/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingMethod: document.getElementById("ship-method").value }) });
    const t = await q.json();
    const v = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code, subtotal: t.subtotal }) });
    const data = await v.json();
    if (data.ok) { appliedCoupon = data.code; msg.textContent = "Coupon applied: " + data.code; msg.style.color = "green"; }
    else { appliedCoupon = null; msg.textContent = data.msg; msg.style.color = "#c0392b"; }
    refreshQuote();
  });
  document.getElementById("ship-method") && document.getElementById("ship-method").addEventListener("change", refreshQuote);
  document.getElementById("checkout-btn") && document.getElementById("checkout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const shippingAddress = {
      fullName: document.getElementById("ship-fullName").value.trim(),
      phone: document.getElementById("ship-phone").value.trim(),
      address1: document.getElementById("ship-address1").value.trim(),
      address2: document.getElementById("ship-address2").value.trim(),
      city: document.getElementById("ship-city").value.trim(),
      state: document.getElementById("ship-state").value.trim(),
      postalCode: document.getElementById("ship-postalCode").value.trim(),
      country: document.getElementById("ship-country").value.trim()
    };
    if (!shippingAddress.fullName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) { alert("Please fill required shipping fields"); return; }
    btn.disabled = true; btn.textContent = "Redirecting...";
    const res = await fetch("/checkout/create-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingAddress: shippingAddress, shippingMethod: document.getElementById("ship-method").value, couponCode: appliedCoupon, currency: window.__CURRENCY__ }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert(data.error || "Checkout failed"); btn.disabled = false; btn.textContent = "Checkout with Stripe"; }
  });
  if (document.getElementById("checkout-btn")) refreshQuote();
})();
`;

files["public/js/wishlist.js"] = `(function () {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".wishlist-toggle");
    if (!btn) return;
    const res = await fetch("/wishlist/toggle/" + btn.dataset.id, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      const badge = document.querySelector("nav a[href='/wishlist'] .badge");
      if (badge) badge.textContent = data.count;
      if (window.location.pathname === "/wishlist") location.reload();
      else btn.textContent = data.inWishlist ? "Added" : "Wishlist";
    }
  });
})();
`;

files["public/js/currency.js"] = `(function () {
  const sel = document.getElementById("currency-select");
  if (!sel) return;
  sel.addEventListener("change", async () => {
    await fetch("/api/currency/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: sel.value }) });
    location.reload();
  });
})();
`;

files["public/js/analytics.js"] = `(function () {
  if (typeof Chart === "undefined" || !window.__CHART__) return;
  const sales = window.__CHART__.sales;
  const top = window.__CHART__.top;
  const salesEl = document.getElementById("salesChart");
  if (salesEl) new Chart(salesEl, {
    type: "line",
    data: { labels: sales.labels, datasets: [{ label: "Revenue", data: sales.data, borderColor: "#7a1f2b", backgroundColor: "rgba(122,31,43,.15)", fill: true, tension: 0.35 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
  const topEl = document.getElementById("topChart");
  if (topEl) new Chart(topEl, {
    type: "bar",
    data: { labels: top.labels, datasets: [{ label: "Units Sold", data: top.data, backgroundColor: ["#7a1f2b", "#a1273a", "#c76a7a", "#ffb3c1", "#ffd9b3"] }] },
    options: { indexAxis: "y", plugins: { legend: { display: false } } }
  });
})();
`;

files["public/js/pwa.js"] = `if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/service-worker.js").then(() => console.log("PWA registered")); });
}
`;

files["public/manifest.json"] = `{
  "name": "Sweet Deserts",
  "short_name": "Deserts",
  "description": "Red Velvet, Brownies, Caramel & more",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff8f2",
  "theme_color": "#7a1f2b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
`;

files["public/service-worker.js"] = `const CACHE = "sweet-deserts-v1";
const ASSETS = ["/", "/menu", "/css/style.css", "/js/main.js", "/js/search.js", "/js/cart.js", "/js/wishlist.js", "/js/currency.js", "/manifest.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("/"))));
});
`;

files["public/icons/.gitkeep"] = "";

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
});

console.log("Part C2 created " + Object.keys(files).length + " public files");
