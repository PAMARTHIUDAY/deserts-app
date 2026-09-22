(function () {
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
