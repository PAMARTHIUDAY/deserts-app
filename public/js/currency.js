(function () {
  const sel = document.getElementById("currency-select");
  if (!sel) return;
  sel.addEventListener("change", async () => {
    await fetch("/api/currency/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: sel.value }) });
    location.reload();
  });
})();
