// ── Conexión con el servidor (reutiliza el servicio de Pedidos) ──
const API_PEDIDOS = 'php/pedidos/index.php';

let pedidos = [];

document.addEventListener('DOMContentLoaded', cargarPedidos);

// ── Utilidades ──
function numeroPedido(id) {
  return String(id).padStart(4, '0');
}

function formatoPesos(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}

function formatoFecha(fecha) {
  if (!fecha) return '—';
  const partes = String(fecha).split('-');
  return partes.length === 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : fecha;
}

function claseEstado(estado) {
  const t = String(estado || '').toLowerCase();
  if (t.startsWith('asisti')) return 'badge-completado';
  if (t.startsWith('cancel')) return 'badge-cancelado';
  return 'badge-proceso';
}

function estaPagado(pago) {
  return String(pago || '').toLowerCase().startsWith('pagad');
}

function mostrarMensaje(texto, conLogin) {
  const el = document.getElementById('mensaje');
  el.textContent = texto + ' ';
  if (conLogin) {
    const a = document.createElement('a');
    a.href = 'login.html';
    a.textContent = 'Ir al login';
    el.appendChild(a);
  }
}

// ── Cargar los pedidos desde la base de datos ──
async function cargarPedidos() {
  const selector = document.getElementById('selectorPedido');

  try {
    const res = await fetch(API_PEDIDOS);
    const data = await res.json();

    if (data.code === 401) {
      selector.innerHTML = '';
      mostrarMensaje(data.msg + '.', true);
      return;
    }
    if (data.code !== 200) {
      selector.innerHTML = '';
      mostrarMensaje('Error: ' + data.msg);
      return;
    }
    if (data.data.length === 0) {
      selector.innerHTML = '';
      mostrarMensaje('Aún no hay pedidos registrados.');
      return;
    }

    pedidos = data.data;
    selector.innerHTML = '';

    pedidos.forEach((p, i) => {
      const opcion = document.createElement('option');
      opcion.value = i;
      let texto = 'Pedido #' + numeroPedido(p.id_orden) + ' — ' + (p.productos || 'Sin detalle');
      if (data.rol !== 1 && p.cliente) texto += ' (' + p.cliente.trim() + ')';
      opcion.textContent = texto;
      selector.appendChild(opcion);
    });

    selector.addEventListener('change', () => mostrarPedido(pedidos[selector.value]));

    // Si llega ?orden=ID en la dirección, se abre ese pedido
    const idUrl = new URLSearchParams(window.location.search).get('orden');
    const indice = pedidos.findIndex(p => String(p.id_orden) === idUrl);
    selector.value = indice >= 0 ? indice : 0;
    mostrarPedido(pedidos[selector.value]);

  } catch (err) {
    selector.innerHTML = '';
    mostrarMensaje('No se pudo conectar con el servidor.');
    console.error(err);
  }
}

// ── Mostrar la información y el seguimiento de un pedido ──
function mostrarPedido(p) {
  document.getElementById('mensaje').textContent = '';
  document.getElementById('seccionInfo').style.display = 'block';
  document.getElementById('seccionSeguimiento').style.display = 'block';

  document.getElementById('i-numero').textContent   = numeroPedido(p.id_orden);
  document.getElementById('i-producto').textContent = p.productos || 'Sin detalle';
  document.getElementById('i-fecha').textContent    = formatoFecha(p.fecha);
  document.getElementById('i-total').textContent    = formatoPesos(p.total);

  const badgeEstado = document.getElementById('i-estado');
  badgeEstado.textContent = p.estado || '—';
  badgeEstado.className = 'badge ' + claseEstado(p.estado);

  const pagado = estaPagado(p.pago);
  const badgePago = document.getElementById('i-pago');
  badgePago.textContent = p.pago || '—';
  badgePago.className = 'badge ' + (pagado ? 'badge-pagado' : 'badge-pendiente');

  dibujarSeguimiento(p, pagado);
}

function crearPaso(clase, icono, titulo, detalle) {
  const li = document.createElement('li');
  li.className = 'paso ' + clase;

  const ic = document.createElement('div');
  ic.className = 'paso-icono';
  ic.textContent = icono;

  const texto = document.createElement('div');
  const t = document.createElement('p');
  t.className = 'paso-titulo';
  t.textContent = titulo;
  const d = document.createElement('p');
  d.className = 'paso-detalle';
  d.textContent = detalle;
  texto.appendChild(t);
  texto.appendChild(d);

  li.appendChild(ic);
  li.appendChild(texto);
  return li;
}

function dibujarSeguimiento(p, pagado) {
  const estado = String(p.estado || '').toLowerCase();
  const asistio = estado.startsWith('asisti');
  const cancelado = estado.startsWith('cancel');
  const reagendado = estado.startsWith('reagend');

  const linea = document.getElementById('linea');
  linea.innerHTML = '';

  // Paso 1: pedido recibido
  linea.appendChild(crearPaso('hecho', '✓', 'Pedido recibido', formatoFecha(p.fecha)));

  // Paso 2: pago
  if (pagado) {
    linea.appendChild(crearPaso('hecho', '✓', 'Pago confirmado', 'Pago registrado'));
  } else {
    linea.appendChild(crearPaso('actual', '2', 'Pago pendiente', 'Aún no se registra el pago'));
  }

  // Paso 3: atención del servicio
  if (asistio) {
    linea.appendChild(crearPaso('hecho', '✓', 'Servicio atendido', 'La atención se realizó'));
  } else if (cancelado) {
    linea.appendChild(crearPaso('error', '✕', 'Servicio cancelado', 'Este pedido fue cancelado'));
  } else if (reagendado) {
    linea.appendChild(crearPaso('actual', '3', 'Servicio reagendado', 'Se asignó una nueva fecha de atención'));
  } else {
    linea.appendChild(crearPaso('actual', '3', 'Atención pendiente', 'Tu servicio está por atenderse'));
  }

  // Paso 4: finalizado
  linea.appendChild(crearPaso(asistio ? 'hecho' : '', asistio ? '✓' : '4', 'Finalizado',
    asistio ? 'Pedido completado' : 'Se completa cuando se atiende el servicio'));

  // Barra de progreso
  let pct = 25;
  if (pagado) pct += 25;
  if (asistio) pct = 100;

  document.getElementById('barra').style.width = pct + '%';
  document.getElementById('textoProgreso').textContent = 'Progreso: ' + pct + '%';
}