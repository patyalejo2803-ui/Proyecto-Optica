const API_HISTORIAL = 'php/historial/index.php';
const API_PROMOCIONES = 'php/promociones/index.php';
let primeraCarga = true;

document.addEventListener('DOMContentLoaded', cargarInicio);

// Actualización automática cada 15 segundos (solo si la pestaña está visible)
setInterval(() => { if (!document.hidden) cargarInicio(); }, 15000);

function formatoFecha(f) {
  const p = String(f || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '—';
}
function formatoPesos(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); }
function tipoEstado(e) {
  const t = String(e || '').toLowerCase();
  if (t.startsWith('asisti')) return 'atendida';
  if (t.startsWith('cancel')) return 'cancelada';
  return 'pendiente';
}
function el(tag, clase, texto) {
  const x = document.createElement(tag);
  if (clase) x.className = clase;
  if (texto !== undefined) x.textContent = texto;
  return x;
}
function vacio(idContenedor, texto, conLogin) {
  const c = document.getElementById(idContenedor);
  c.innerHTML = '';
  const p = el('p', 'vacio', texto + ' ');
  if (conLogin) {
    const a = el('a', '', 'Ir al login');
    a.href = 'login.html';
    p.appendChild(a);
  }
  c.appendChild(p);
}

async function cargarInicio() {
  try {
    const [rh, rp] = await Promise.all([fetch(API_HISTORIAL), fetch(API_PROMOCIONES)]);
    const h = await rh.json();
    const p = await rp.json();

    if (h.code === 401) {
      ['proxima', 'ultimo', 'promos'].forEach(id => vacio(id, h.msg + '.', true));
      return;
    }
    if (h.code !== 200) { vacio('proxima', 'Error: ' + h.msg); return; }

    // Saludo
    let nombre = String(h.cliente || '').trim().split(' ')[0];
    nombre = nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase() : '';
    document.getElementById('saludo').textContent = nombre ? 'Hola, ' + nombre : 'Hola';

    const registros = h.data;

    // Próxima cita: la pendiente más cercana desde hoy
    const futuras = registros
      .filter(r => tipoEstado(r.estado) === 'pendiente' && r.fecha >= h.hoy && r.hora && r.hora !== '00:00')
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    if (futuras.length) {
      const r = futuras[0];
      const c = document.getElementById('proxima');
      c.innerHTML = '';
      const caja = el('div', 'dato');
      caja.appendChild(el('p', 'dato-titulo', formatoFecha(r.fecha) + ' · ' + r.hora));
      caja.appendChild(el('p', 'dato-sub', r.servicio + ' · Pedido #' + String(r.id).padStart(4, '0')));
      c.appendChild(caja);
    } else {
      vacio('proxima', 'No tienes citas próximas.');
    }

    // Último pedido
    if (registros.length) {
      const r = registros[0];
      const c = document.getElementById('ultimo');
      c.innerHTML = '';
      const caja = el('div', 'dato');
      const fila = el('div', 'dato-fila');
      const info = el('div');
      info.appendChild(el('p', 'dato-titulo', 'Pedido #' + String(r.id).padStart(4, '0') + ' · ' + r.servicio));
      info.appendChild(el('p', 'dato-sub', formatoFecha(r.fecha) + ' · ' + formatoPesos(r.total)));
      const tipo = tipoEstado(r.estado);
      const b = el('span', 'badge ' + (tipo === 'atendida' ? 'badge-completado'
                : tipo === 'cancelada' ? 'badge-cancelado' : 'badge-proceso'), r.estado || '—');
      fila.appendChild(info);
      fila.appendChild(b);
      caja.appendChild(fila);
      c.appendChild(caja);
    } else {
      vacio('ultimo', 'Aún no tienes pedidos.');
    }

    // Promociones
    if (p.code === 200 && p.data.length) {
      const c = document.getElementById('promos');
      c.innerHTML = '';
      p.data.forEach(x => {
        const card = el('div', 'promo');
        const info = el('div');
        info.appendChild(el('p', 'promo-titulo', x.titulo));
        info.appendChild(el('p', 'promo-desc', x.descripcion || ''));
        card.appendChild(info);
        card.appendChild(el('div', 'promo-etiqueta', x.etiqueta));
        c.appendChild(card);
      });
    } else {
      vacio('promos', 'Por ahora no hay promociones vigentes.');
    }
    primeraCarga = false;
  } catch (err) {
    if (primeraCarga) ['proxima', 'ultimo', 'promos'].forEach(id => vacio(id, 'No se pudo conectar con el servidor.'));
    console.error(err);
  }
}