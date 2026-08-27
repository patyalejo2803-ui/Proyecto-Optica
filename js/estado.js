// ── Animar la barra de progreso al cargar ──
window.addEventListener("load", function () {
  var barra = document.querySelector(".barra-progreso");
  if (barra) {
    var anchoFinal = barra.style.width;
    barra.style.width = "0%";
    setTimeout(function () {
      barra.style.width = anchoFinal;
    }, 300);
  }
});