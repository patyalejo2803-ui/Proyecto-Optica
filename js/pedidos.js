// ── Conexión con el servidor ──
const API_PEDIDOS = 'php/pedidos/index.php';

// Pedido seleccionado en pantalla
let pedidoActual = null;

document.addEventListener('DOMContentLoaded', cargarPedidos);

// ── Utilidades ──
function formatoPesos(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}

function numeroPedido(id) {
  return String(id).padStart(4, '0');
}

function claseEstado(estado) {
  const t = String(estado ?? '').toLowerCase();
  const terminado = t.includes('complet') || t.includes('entreg') || t.includes('termin');
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
  mensajeLista('Cargando pedidos…');

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

    const lista = document.getElementById('listaPedidos');
    lista.innerHTML = '';

    data.data.forEach((p, i) => {
      const card = crearCard(p, data.rol);
      lista.appendChild(card);
      if (i === 0) seleccionarPedido(card, p);
    });

  } catch (err) {
    mensajeLista('No se pudo conectar con el servidor.');
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
  card.addEventListener('click', () => seleccionarPedido(card, p));

  return card;
}

// ── Seleccionar un pedido de la lista ──
function seleccionarPedido(card, p) {
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

  // Ocultamos el panel de estado al cambiar de pedido
  document.getElementById('panel-estado').style.display = 'none';
}

// ── Ir a pagar ──
function irAPagar() {
  if (!pedidoActual) return;
  window.location.href = 'pago.html?orden=' + encodeURIComponent(pedidoActual.id_orden);
}

// ── Ver estado del pedido ──
function verEstado() {
  if (!pedidoActual) return;

  document.getElementById('e-numero').textContent   = '#' + numeroPedido(pedidoActual.id_orden);
  document.getElementById('e-producto').textContent = pedidoActual.productos || 'Sin productos registrados';
  document.getElementById('e-estado').textContent   = pedidoActual.estado ?? '—';
  document.getElementById('e-pago').textContent     = pedidoActual.pago ?? '—';

  const panel = document.getElementById('panel-estado');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}