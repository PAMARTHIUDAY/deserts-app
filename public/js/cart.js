(function () {
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
