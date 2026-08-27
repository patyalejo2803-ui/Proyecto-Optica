// ── Pedido actualmente seleccionado ──
var pedidoActual = {
  numero:   '0001',
  producto: 'Montura clásica',
  estado:   'En proceso',
  pago:     'Pendiente',
  total:    '$180.000'
};

// ── Seleccionar un pedido de la lista ──
function seleccionarPedido(elemento, numero, producto, estado, pago, total) {

  // Quitamos "activo" de todas las cards
  var cards = document.getElementsByClassName('pedido-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.remove('activo');
  }

  // Marcamos la card elegida
  elemento.classList.add('activo');

  // Guardamos el pedido actual
  pedidoActual = { numero: numero, producto: producto, estado: estado, pago: pago, total: total };

  // Actualizamos el detalle
  document.getElementById('d-numero').textContent  = numero;
  document.getElementById('d-producto').textContent = producto;
  document.getElementById('d-total').textContent   = total;

  // Badge de estado
  var badgeEstado = document.getElementById('d-estado-badge');
  badgeEstado.textContent = estado;
  badgeEstado.className   = 'badge ' + (estado === 'Completado' ? 'badge-completado' : 'badge-proceso');

  // Badge de pago
  var badgePago = document.getElementById('d-pago-badge');
  badgePago.textContent = pago;
  badgePago.className   = 'badge ' + (pago === 'Pagado' ? 'badge-pagado' : 'badge-pendiente');

  // Ocultamos el panel de estado al cambiar de pedido
  document.getElementById('panel-estado').style.display = 'none';
}

// ── Ir a pagar ──
function irAPagar() {
  alert('Redirigiendo a pago del pedido #' + pedidoActual.numero + ' — Total: ' + pedidoActual.total);
  // window.location.href = 'pago.html';
}

// ── Ver estado del pedido ──
function verEstado() {
  document.getElementById('e-numero').textContent  = '#' + pedidoActual.numero;
  document.getElementById('e-producto').textContent = pedidoActual.producto;
  document.getElementById('e-estado').textContent  = pedidoActual.estado;
  document.getElementById('e-pago').textContent    = pedidoActual.pago;

  var panel = document.getElementById('panel-estado');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}