(function () {
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
