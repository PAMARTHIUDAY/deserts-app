(function () {
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
