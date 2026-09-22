function showToast(msg) {
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
