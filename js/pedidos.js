// ── Conexión con el servidor ──
const API_PEDIDOS = 'php/pedidos/index.php';

// Pedido seleccionado en pantalla
let pedidoActual = null;
let primeraCarga = true;

document.addEventListener('DOMContentLoaded', cargarPedidos);

// Actualización automática cada 15 segundos (solo si la pestaña está visible)
setInterval(() => {
  if (!document.hidden) cargarPedidos();
}, 15000);

// ── Utilidades ──
function formatoPesos(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}

function numeroPedido(id) {
  return String(id).padStart(4, '0');
}

function claseEstado(estado) {
  const t = String(estado ?? '').toLowerCase();
  const terminado = t.startsWith('asisti') || t.includes('complet') || t.includes('entreg') || t.includes('termin');
  return terminado ? 'badge-completado' : 'badge-proceso';
}

function clasePago(pago) {
  const t = String(pago ?? '').toLowerCase();
  return t.startsWith('pagad') ? 'badge-pagado' : 'badge-pendiente';
}

// ── Mensaje dentro de la lista (cargando, vacío o error) ──
function mensajeLista(texto, enlaceLogin) {
  const lista = document.getElementById('listaPedidos');
  lista.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = texto + ' ';
  if (enlaceLogin) {
    const a = document.createElement('a');
    a.href = 'login.html';
    a.textContent = 'Ir al login';
    p.appendChild(a);
  }
  lista.appendChild(p);
}

// ── Cargar los pedidos desde la base de datos ──
async function cargarPedidos() {
  // El mensaje "Cargando" solo se muestra la primera vez, para que no parpadee
  if (primeraCarga) mensajeLista('Cargando pedidos…');

  try {
    const res = await fetch(API_PEDIDOS);
    const data = await res.json();

    if (data.code === 401) {
      mensajeLista(data.msg + '.', true);
      return;
    }

    if (data.code !== 200) {
      mensajeLista('Error: ' + data.msg);
      return;
    }

    if (data.data.length === 0) {
      mensajeLista('Aún no hay pedidos registrados.');
      return;
    }

    // Recordamos qué pedido estaba elegido y si el panel de estado estaba abierto
    const idElegido = pedidoActual ? String(pedidoActual.id_orden) : null;
    const panel = document.getElementById('panel-estado');
    const panelAbierto = panel.style.display === 'block';

    const lista = document.getElementById('listaPedidos');
    lista.innerHTML = '';

    let cardElegida = null;
    let pedidoElegido = null;

    data.data.forEach((p, i) => {
      const card = crearCard(p, data.rol);
      lista.appendChild(card);
      if (String(p.id_orden) === idElegido || (!idElegido && i === 0)) {
        cardElegida = card;
        pedidoElegido = p;
      }
    });

    // Si el pedido elegido ya no existe, se vuelve al primero
    if (!cardElegida) {
      cardElegida = lista.firstChild;
      pedidoElegido = data.data[0];
    }

    seleccionarPedido(cardElegida, pedidoElegido, panelAbierto && !primeraCarga);
    primeraCarga = false;

  } catch (err) {
    // En las recargas automáticas no borramos lo que ya se ve si falla la red
    if (primeraCarga) mensajeLista('No se pudo conectar con el servidor.');
    console.error(err);
  }
}

// ── Crear la tarjeta de un pedido ──
function crearCard(p, rol) {
  const card = document.createElement('div');
  card.className = 'pedido-card';

  const info = document.createElement('div');
  info.className = 'pedido-card-info';

  const titulo = document.createElement('p');
  titulo.textContent = 'Pedido #' + numeroPedido(p.id_orden);

  const detalle = document.createElement('span');
  let texto = p.productos || 'Sin productos registrados';
  // El personal también ve el nombre del cliente
  if (rol !== 1 && p.cliente) texto = p.cliente + ' · ' + texto;
  detalle.textContent = texto;

  info.appendChild(titulo);
  info.appendChild(detalle);

  const badge = document.createElement('span');
  badge.className = 'badge ' + claseEstado(p.estado);
  badge.textContent = p.estado ?? '—';

  card.appendChild(info);
  card.appendChild(badge);
  card.addEventListener('click', () => seleccionarPedido(card, p, false));

  return card;
}

// ── Seleccionar un pedido de la lista ──
function seleccionarPedido(card, p, mantenerPanel) {
  document.querySelectorAll('.pedido-card').forEach(c => c.classList.remove('activo'));
  card.classList.add('activo');

  pedidoActual = p;

  document.getElementById('d-numero').textContent   = numeroPedido(p.id_orden);
  document.getElementById('d-producto').textContent = p.productos || 'Sin productos registrados';
  document.getElementById('d-total').textContent    = formatoPesos(p.total);

  const badgeEstado = document.getElementById('d-estado-badge');
  badgeEstado.textContent = p.estado ?? '—';
  badgeEstado.className   = 'badge ' + claseEstado(p.estado);

  const badgePago = document.getElementById('d-pago-badge');
  badgePago.textContent = p.pago ?? '—';
  badgePago.className   = 'badge ' + clasePago(p.pago);

  if (mantenerPanel) {
    // Recarga automática: se actualiza el panel abierto sin moverle la pantalla
    llenarPanelEstado(p);
  } else {
    // Cambio de pedido: se oculta el panel de estado
    document.getElementById('panel-estado').style.display = 'none';
  }
}

function llenarPanelEstado(p) {
  document.getElementById('e-numero').textContent   = '#' + numeroPedido(p.id_orden);
  document.getElementById('e-producto').textContent = p.productos || 'Sin productos registrados';
  document.getElementById('e-estado').textContent   = p.estado ?? '—';
  document.getElementById('e-pago').textContent     = p.pago ?? '—';
}

// ── Ir a pagar ──
function irAPagar() {
  if (!pedidoActual) return;
  window.location.href = 'pago.html?orden=' + encodeURIComponent(pedidoActual.id_orden);
}

// ── Ver estado del pedido ──
function verEstado() {
  if (!pedidoActual) return;

  llenarPanelEstado(pedidoActual);

  const panel = document.getElementById('panel-estado');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}