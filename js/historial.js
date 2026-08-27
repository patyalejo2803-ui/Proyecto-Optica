// ── Datos del historial del cliente ──
var historial = [
  { numero: 1, fecha: "10/01/2026", motivo: "Examen visual" },
  { numero: 2, fecha: "15/04/2026", motivo: "Cambio de lentes" }
];

// ── Renderizar la lista de citas dinámicamente ──
function renderizarCitas() {
  var lista = document.getElementById("citas-lista");
  if (!lista) return;

  lista.innerHTML = "";

  for (var i = 0; i < historial.length; i++) {
    var cita = historial[i];

    var item = document.createElement("div");
    item.className = "cita-item";

    item.innerHTML =
      '<div class="cita-numero">' + cita.numero + '</div>' +
      '<div class="cita-info">' +
        '<p class="cita-fecha">' + cita.fecha + '</p>' +
        '<p class="cita-motivo">' + cita.motivo + '</p>' +
      '</div>';

    lista.appendChild(item);
  }
}

// ── Ejecutar al cargar la página ──
window.addEventListener("load", function () {
  renderizarCitas();
});