// ── Datos de estadísticas ──
var stats = {
  clientes:  1234,
  citas:     45,
  pedidos:   89,
  ventas:    "$5.6M"
};

// ── Próximas citas ──
var proximasCitas = [
  { nombre: "Juan Pérez",    fecha: "29/04 - 10:00" },
  { nombre: "María García",  fecha: "29/04 - 11:30" },
  { nombre: "Carlos Méndez", fecha: "30/04 - 09:00" }
];

// ── Pedidos recientes ──
var pedidosRecientes = [
  { cliente: "Ana Martínez",   producto: "Gafas deportivas",   numero: "#0004" },
  { cliente: "Luis Rodríguez", producto: "Montura clásica",    numero: "#0005" },
  { cliente: "Sara Ospina",    producto: "Lentes de contacto", numero: "#0006" }
];

// ── Navegar a sección ──
function irA(destino) {
  window.location.href = destino;
}

// ── Renderizar citas ──
function renderizarCitas() {
  var lista = document.getElementById("lista-citas");
  if (!lista) return;
  lista.innerHTML = "";

  for (var i = 0; i < proximasCitas.length; i++) {
    var c = proximasCitas[i];
    var item = document.createElement("div");
    item.className = "panel-item";
    item.innerHTML =
      '<p class="panel-item-nombre">' + c.nombre + '</p>' +
      '<p class="panel-item-sub">' + c.fecha + '</p>';
    lista.appendChild(item);
  }
}

// ── Renderizar pedidos ──
function renderizarPedidos() {
  var lista = document.getElementById("lista-pedidos");
  if (!lista) return;
  lista.innerHTML = "";

  for (var i = 0; i < pedidosRecientes.length; i++) {
    var p = pedidosRecientes[i];
    var item = document.createElement("div");
    item.className = "panel-item panel-item-row";
    item.innerHTML =
      '<div>' +
        '<p class="panel-item-nombre">' + p.cliente + '</p>' +
        '<p class="panel-item-sub">' + p.producto + '</p>' +
      '</div>' +
      '<span class="pedido-tag">' + p.numero + '</span>';
    lista.appendChild(item);
  }
}

// ── Ejecutar al cargar ──
window.addEventListener("load", function () {
  renderizarCitas();
  renderizarPedidos();
});