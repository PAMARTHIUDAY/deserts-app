const fs = require("fs");
const path = require("path");
const files = {};

files["views/partials/header.ejs"] = `<header>
  <div class="nav">
    <h1><a href="/" style="color:#fff;text-decoration:none;">Sweet Deserts</a></h1>
    <form class="search-form" action="/menu" method="GET" autocomplete="off">
      <input type="text" name="q" id="search-input" placeholder="Search desserts..." value="<%= typeof searchQuery !== 'undefined' ? searchQuery : '' %>">
      <div id="autocomplete" class="autocomplete"></div>
    </form>
    <nav>
      <a href="/">Home</a>
      <a href="/menu">Menu</a>
      <a href="/orders">Orders</a>
      <a href="/wishlist">Wishlist <span class="badge"><%= wishlistCount %></span></a>
      <a href="/cart">Cart <span class="badge"><%= cartCount %></span></a>
      <select id="currency-select" class="currency-select">
        <% Object.entries(currencies).forEach(([code, c]) => { %>
          <option value="<%= code %>" <%= currency === code ? "selected" : "" %>><%= c.symbol %> <%= code %></option>
        <% }) %>
      </select>
      <% if (isAdmin) { %>
        <a href="/admin">Admin</a>
        <a href="/admin/logout">Logout</a>
      <% } %>
    </nav>
  </div>
</header>
`;

files["views/partials/footer.ejs"] = `<footer>
  <p>© <%= new Date().getFullYear() %> Sweet Deserts</p>
</footer>
<script src="/js/main.js"></script>
<script src="/js/search.js"></script>
<script src="/js/wishlist.js"></script>
<script src="/js/currency.js"></script>
<script src="/js/pwa.js"></script>
</body>
</html>
`;

files["views/index.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#7a1f2b" />
</head>
<body>
<%- include('partials/header') %>
<section class="hero">
  <h2>Delicious Desserts Delivered Fresh</h2>
  <p>Red Velvet - Brownies - Caramel - Cakes - More</p>
  <a class="btn" href="/menu">Explore Menu</a>
</section>
<section class="categories">
  <% categories.forEach(cat => { %>
    <a class="cat-pill" href="/menu?category=<%= cat %>"><%= cat %></a>
  <% }) %>
</section>
<section class="featured">
  <h2>Featured Desserts</h2>
  <div class="grid">
    <% featured.forEach(d => { %>
      <div class="card">
        <img src="<%= d.image %>" alt="<%= d.name %>" loading="lazy">
        <div class="card-body">
          <h3><%= d.name %></h3>
          <p class="category"><%= d.category %></p>
          <p class="desc"><%= d.description %></p>
          <div class="row">
            <span class="price"><%= formatPrice(d.price) %></span>
            <button class="btn-small add-cart" data-id="<%= d._id %>">Add</button>
          </div>
          <a class="details-link" href="/dessert/<%= d._id %>">Details</a>
        </div>
      </div>
    <% }) %>
  </div>
</section>
<%- include('partials/footer') %>
`;

files["views/menu.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Menu - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="menu-header">
  <h2><%= activeCategory ? activeCategory + " Desserts" : (searchQuery ? 'Search: "' + searchQuery + '"' : "All Desserts") %></h2>
  <p><%= desserts.length %> items available</p>
</section>
<section class="grid">
  <% desserts.forEach(d => { %>
    <div class="card">
      <img src="<%= d.image %>" alt="<%= d.name %>" loading="lazy">
      <div class="card-body">
        <h3><%= d.name %></h3>
        <p class="category"><%= d.category %></p>
        <p class="desc"><%= d.description %></p>
        <div class="row">
          <span class="price"><%= formatPrice(d.price) %></span>
          <button class="btn-small add-cart" data-id="<%= d._id %>">Add</button>
        </div>
        <a class="details-link" href="/dessert/<%= d._id %>">Details</a>
      </div>
    </div>
  <% }) %>
</section>
<%- include('partials/footer') %>
`;

files["views/item.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title><%= dessert.name %> - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="item-page">
  <div class="item-gallery">
    <% (dessert.gallery && dessert.gallery.length ? dessert.gallery : [dessert.image]).forEach(img => { %>
      <img src="<%= img %>" alt="<%= dessert.name %>" class="main-img">
    <% }) %>
  </div>
  <div class="item-info">
    <p class="category"><%= dessert.category %></p>
    <h2><%= dessert.name %></h2>
    <div class="rating-line">
      <span class="stars"><%= "*".repeat(Math.round(dessert.avgRating)) %></span>
      <span class="rating-text"><%= dessert.avgRating %> / 5 - <%= dessert.reviewCount %> reviews</span>
    </div>
    <p class="desc"><%= dessert.description %></p>
    <p class="price big"><%= formatPrice(dessert.price) %></p>
    <button class="btn add-cart" data-id="<%= dessert._id %>">Add to Cart</button>
    <button class="btn ghost wishlist-toggle" data-id="<%= dessert._id %>">Wishlist</button>
    <a class="btn ghost" href="/menu">Back</a>
  </div>
</section>
<section class="reviews-section">
  <h3>Customer Reviews</h3>
  <form id="review-form" data-id="<%= dessert._id %>" class="review-form">
    <h4>Write a Review</h4>
    <div class="review-grid">
      <input name="name" placeholder="Your name" required>
      <input name="email" type="email" placeholder="Your email" required>
      <select name="rating" required>
        <option value="">Rating</option>
        <option value="5">5 stars</option>
        <option value="4">4 stars</option>
        <option value="3">3 stars</option>
        <option value="2">2 stars</option>
        <option value="1">1 star</option>
      </select>
    </div>
    <textarea name="comment" placeholder="Share your thoughts" required></textarea>
    <button class="btn" type="submit">Submit Review</button>
  </form>
  <div id="reviews-list">
    <% if (!reviews.length) { %><p class="muted">No reviews yet.</p><% } %>
    <% reviews.forEach(r => { %>
      <div class="review">
        <div class="review-head">
          <strong><%= r.name %></strong>
          <span class="stars"><%= "*".repeat(r.rating) %></span>
          <small><%= new Date(r.createdAt).toLocaleDateString() %></small>
        </div>
        <p><%= r.comment %></p>
      </div>
    <% }) %>
  </div>
</section>
<%- include('partials/footer') %>
`;

files["views/cart.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Your Cart - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="cart-page">
  <h2>Your Cart</h2>
  <% if (!items.length) { %>
    <p>Your cart is empty. <a href="/menu">Browse desserts</a></p>
  <% } else { %>
    <table class="cart-table">
      <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>
        <% items.forEach(i => { %>
          <tr>
            <td class="cart-item"><img src="<%= i.image %>" alt=""><span><%= i.name %></span></td>
            <td><%= formatPrice(i.price) %></td>
            <td><input type="number" min="1" value="<%= i.qty %>" class="qty-input" data-id="<%= i._id %>"></td>
            <td><%= formatPrice(i.price * i.qty) %></td>
            <td><button class="btn-small remove-item" data-id="<%= i._id %>">X</button></td>
          </tr>
        <% }) %>
      </tbody>
    </table>
    <div class="checkout-grid">
      <div class="cart-panel">
        <h3>Shipping Address</h3>
        <div class="form-grid">
          <input id="ship-fullName" placeholder="Full name" required>
          <input id="ship-phone" placeholder="Phone">
          <input id="ship-address1" placeholder="Address line 1" required>
          <input id="ship-address2" placeholder="Address line 2 (optional)">
          <input id="ship-city" placeholder="City" required>
          <input id="ship-state" placeholder="State / Province">
          <input id="ship-postalCode" placeholder="Postal code" required>
          <input id="ship-country" placeholder="Country" required>
        </div>
        <h3>Shipping Method</h3>
        <select id="ship-method">
          <option value="standard">Standard - $5 (free over $50)</option>
          <option value="express">Express - $12</option>
          <option value="overnight">Overnight - $25</option>
        </select>
        <h3>Coupon</h3>
        <div class="coupon-row">
          <input id="coupon-code" placeholder="WELCOME10, SWEET20, FIVEOFF">
          <button id="apply-coupon" class="btn-small">Apply</button>
        </div>
        <p id="coupon-msg" class="coupon-msg"></p>
      </div>
      <div class="cart-panel">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span id="sum-subtotal">-</span></div>
        <div class="summary-row"><span>Discount</span><span id="sum-discount">-</span></div>
        <div class="summary-row"><span>Shipping</span><span id="sum-shipping">-</span></div>
        <div class="summary-row"><span>Tax (8%)</span><span id="sum-tax">-</span></div>
        <div class="summary-row total"><span>Total</span><span id="sum-total">-</span></div>
        <button id="checkout-btn" class="btn">Checkout with Stripe</button>
      </div>
    </div>
    <button id="clear-cart" class="btn ghost">Clear Cart</button>
  <% } %>
</section>
<script>
  window.__CURRENCY__ = "<%= currency %>";
  window.__SYMBOL__ = "<%= currencies[currency].symbol %>";
  window.__RATE__ = <%= currencies[currency].rate %>;
</script>
<%- include('partials/footer') %>
<script src="/js/cart.js"></script>
`;

files["views/success.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order Success</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="success-page">
  <h2>Thank you!</h2>
  <% if (order) { %>
    <p>Your order has been placed successfully.</p>
    <p>Tracking #: <strong><%= order.trackingNumber %></strong></p>
    <ul>
      <% order.items.forEach(i => { %>
        <li><%= i.qty %> x <%= i.name %> - <%= formatPrice(i.price * i.qty) %></li>
      <% }) %>
    </ul>
    <p><strong>Total Paid: <%= formatPrice(order.total) %></strong></p>
    <a class="btn" href="/orders/track/<%= order._id %>">Track Order</a>
  <% } else { %>
    <p>We couldn't find your order, but payment may have succeeded.</p>
  <% } %>
  <a class="btn ghost" href="/menu">Continue Shopping</a>
</section>
<%- include('partials/footer') %>
`;

files["views/orders.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Orders - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="orders-page">
  <h2>Your Orders</h2>
  <% if (!orders.length) { %>
    <p>No orders yet. <a href="/menu">Start shopping</a></p>
  <% } else { %>
    <% orders.forEach(o => { %>
      <div class="order-card">
        <div class="order-head">
          <div>
            <strong>#<%= o._id.toString().slice(-8).toUpperCase() %></strong>
            <small><%= new Date(o.createdAt).toLocaleString() %></small>
          </div>
          <span class="status status-<%= o.trackingStatus %>"><%= o.trackingStatus.replace("_", " ") %></span>
        </div>
        <p><%= o.items.length %> items - Total <strong><%= formatPrice(o.total) %></strong></p>
        <p>Tracking #: <code><%= o.trackingNumber %></code></p>
        <a class="btn-small" href="/orders/track/<%= o._id %>">Track Order</a>
      </div>
    <% }) %>
  <% } %>
</section>
<%- include('partials/footer') %>
`;

files["views/track.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Track Order - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="track-page">
  <h2>Track Order</h2>
  <p>Order <code>#<%= order._id.toString().slice(-8).toUpperCase() %></code></p>
  <p>Tracking #: <strong><%= order.trackingNumber %></strong></p>
  <ol class="timeline">
    <% const stages = ["pending","paid","preparing","shipped","out_for_delivery","delivered"]; %>
    <% const currentIdx = stages.indexOf(order.trackingStatus); %>
    <% stages.forEach((s, i) => { %>
      <% const ev = order.trackingHistory && order.trackingHistory.find(h => h.status === s); %>
      <li class="<%= i <= currentIdx ? 'done' : '' %>">
        <div class="dot"></div>
        <div class="content">
          <strong><%= s.replace("_", " ") %></strong>
          <% if (ev) { %><small><%= ev.note %> - <%= new Date(ev.at).toLocaleString() %></small><% } else { %><small>Pending...</small><% } %>
        </div>
      </li>
    <% }) %>
  </ol>
  <h3>Shipping To</h3>
  <p>
    <%= order.shippingAddress.fullName %><br>
    <%= order.shippingAddress.address1 %><br>
    <%= order.shippingAddress.city %>, <%= order.shippingAddress.state %> <%= order.shippingAddress.postalCode %><br>
    <%= order.shippingAddress.country %>
  </p>
  <h3>Items</h3>
  <ul class="track-items">
    <% order.items.forEach(i => { %>
      <li><%= i.qty %> x <%= i.name %> - <%= formatPrice(i.price * i.qty) %></li>
    <% }) %>
  </ul>
  <p class="total-line">Total: <strong><%= formatPrice(order.total) %></strong></p>
</section>
<%- include('partials/footer') %>
`;

files["views/wishlist.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Wishlist - Sweet Deserts</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="wishlist-page">
  <h2>Your Wishlist</h2>
  <% if (!items.length) { %>
    <p>No favourites yet. <a href="/menu">Browse desserts</a></p>
  <% } else { %>
    <div class="grid">
      <% items.forEach(d => { %>
        <div class="card">
          <img src="<%= d.image %>" alt="<%= d.name %>">
          <div class="card-body">
            <h3><%= d.name %></h3>
            <p class="category"><%= d.category %></p>
            <div class="row">
              <span class="price"><%= formatPrice(d.price) %></span>
              <button class="btn-small add-cart" data-id="<%= d._id %>">Add</button>
            </div>
            <button class="btn-small ghost wishlist-toggle" data-id="<%= d._id %>">Remove</button>
          </div>
        </div>
      <% }) %>
    </div>
  <% } %>
</section>
<%- include('partials/footer') %>
`;

files["views/admin-login.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin Login</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
<%- include('partials/header') %>
<section class="admin-login">
  <h2>Admin Login</h2>
  <% if (error) { %><p class="error"><%= error %></p><% } %>
  <form method="POST" action="/admin/login">
    <label>Email <input type="email" name="email" required></label>
    <label>Password <input type="password" name="password" required></label>
    <button class="btn" type="submit">Login</button>
  </form>
</section>
<%- include('partials/footer') %>
`;

files["views/admin-dashboard.ejs"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/css/style.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
</head>
<body>
<%- include('partials/header') %>
<section class="admin-dash">
  <h2>Dessert Admin Panel</h2>
  <div class="kpi-grid">
    <div class="kpi"><h4>Total Revenue</h4><p>$<%= stats.totalRevenue %></p></div>
    <div class="kpi"><h4>Paid Orders</h4><p><%= stats.totalOrders %></p></div>
    <div class="kpi"><h4>Avg Order</h4><p>$<%= stats.avgOrderValue %></p></div>
    <div class="kpi"><h4>Reviews</h4><p><%= stats.reviewCount %></p></div>
  </div>
  <div class="chart-grid">
    <div class="admin-box"><h3>Revenue (last 14 days)</h3><canvas id="salesChart" height="120"></canvas></div>
    <div class="admin-box"><h3>Top Selling Desserts</h3><canvas id="topChart" height="120"></canvas></div>
  </div>
  <div class="admin-grid">
    <div class="admin-box">
      <h3>Add Dessert</h3>
      <form method="POST" action="/admin/desserts">
        <label>Name <input name="name" required></label>
        <label>Category <input name="category" required></label>
        <label>Price <input name="price" type="number" step="0.01" required></label>
        <label>Image URL <input name="image" required></label>
        <label>Gallery <input name="gallery"></label>
        <label>Description <textarea name="description"></textarea></label>
        <button class="btn" type="submit">Create</button>
      </form>
    </div>
    <div class="admin-box">
      <h3>Recent Orders</h3>
      <% if (!orders.length) { %><p>No orders yet.</p><% } %>
      <ul class="orders">
        <% orders.forEach(o => { %>
          <li><strong><%= o.status.toUpperCase() %></strong> - $<%= o.total.toFixed(2) %> <small>(<%= o.items.length %> items)</small></li>
        <% }) %>
      </ul>
    </div>
  </div>
  <div class="admin-box">
    <h3>Recent Reviews</h3>
    <% if (!recentReviews.length) { %><p>No reviews yet.</p><% } %>
    <% recentReviews.forEach(r => { %>
      <div class="review">
        <div class="review-head">
          <strong><%= r.name %></strong>
          <span class="stars"><%= "*".repeat(r.rating) %></span>
          <small>on <%= r.dessertId ? r.dessertId.name : "?" %></small>
        </div>
        <p><%= r.comment %></p>
      </div>
    <% }) %>
  </div>
  <h3>All Desserts</h3>
  <table class="admin-table">
    <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th><th>Actions</th></tr></thead>
    <tbody>
      <% desserts.forEach(d => { %>
        <tr>
          <td><img src="<%= d.image %>" alt=""></td>
          <td><%= d.name %></td>
          <td><%= d.category %></td>
          <td>$<%= d.price.toFixed(2) %></td>
          <td><%= d.avgRating %> (<%= d.reviewCount %>)</td>
          <td><%= d.inStock ? "Yes" : "No" %></td>
          <td>
            <form method="POST" action="/admin/desserts/<%= d._id %>" style="display:inline">
              <input type="hidden" name="name" value="<%= d.name %>">
              <input type="hidden" name="category" value="<%= d.category %>">
              <input type="hidden" name="price" value="<%= d.price %>">
              <input type="hidden" name="image" value="<%= d.image %>">
              <input type="hidden" name="description" value="<%= d.description %>">
              <input type="hidden" name="inStock" value="<%= d.inStock ? 'on' : '' %>">
              <button class="btn-small" type="submit">Toggle</button>
            </form>
            <form method="POST" action="/admin/desserts/<%= d._id %>/delete" style="display:inline">
              <button class="btn-small danger" type="submit">Delete</button>
            </form>
          </td>
        </tr>
      <% }) %>
    </tbody>
  </table>
</section>
<script>
  window.__CHART__ = {
    sales: { labels: <%- JSON.stringify(chart.labels) %>, data: <%- JSON.stringify(chart.data) %> },
    top: { labels: <%- JSON.stringify(topItems.map(t => t[0])) %>, data: <%- JSON.stringify(topItems.map(t => t[1])) %> }
  };
</script>
<script src="/js/analytics.js"></script>
<%- include('partials/footer') %>
`;

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
});

console.log("Part C1 created " + Object.keys(files).length + " view files");
