const API_HISTORIAL = 'php/historial/index.php';

document.addEventListener('DOMContentLoaded', cargarHistorial);

function formatoFecha(f) {
  const p = String(f || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '—';
}

function tipoEstado(estado) {
  const t = String(estado || '').toLowerCase();
  if (t.startsWith('asisti')) return 'atendida';
  if (t.startsWith('cancel')) return 'cancelada';
  return 'pendiente';
}

function mostrarVacio(texto, conLogin) {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'vacio';
  p.textContent = texto + ' ';
  if (conLogin) {
    const a = document.createElement('a');
    a.href = 'login.html';
    a.textContent = 'Ir al login';
    p.appendChild(a);
  }
  lista.appendChild(p);
}

async function cargarHistorial() {
  try {
    const res = await fetch(API_HISTORIAL);
    const data = await res.json();

    if (data.code === 401) { mostrarVacio(data.msg + '.', true); return; }
    if (data.code !== 200) { mostrarVacio('Error: ' + data.msg); return; }

    const registros = data.data;
    document.getElementById('nombreCliente').textContent = data.cliente || 'cliente';
    document.getElementById('rTotal').textContent = registros.length;

    // Última atención (más reciente ya atendida) y próxima cita (la más cercana pendiente)
    const atendidas = registros.filter(r => tipoEstado(r.estado) === 'atendida');
    const futuras = registros
      .filter(r => tipoEstado(r.estado) === 'pendiente' && r.fecha >= data.hoy)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    document.getElementById('rUltima').textContent = atendidas.length ? formatoFecha(atendidas[0].fecha) : '—';
    document.getElementById('rProxima').textContent = futuras.length ? formatoFecha(futuras[0].fecha) : '—';

    if (registros.length === 0) {
      mostrarVacio('Aún no tienes citas ni pedidos.');
      return;
    }

    const lista = document.getElementById('lista');
    lista.innerHTML = '';

    registros.forEach(r => {
      const item = document.createElement('div');
      item.className = 'cita-item';

      const info = document.createElement('div');
      const f = document.createElement('p');
      f.className = 'cita-fecha';
      f.textContent = formatoFecha(r.fecha) + (r.hora && r.hora !== '00:00' ? ' · ' + r.hora : '');
      const m = document.createElement('p');
      m.className = 'cita-motivo';
      m.textContent = r.servicio + ' · Pedido #' + String(r.id).padStart(4, '0');
      info.appendChild(f);
      info.appendChild(m);

      const tipo = tipoEstado(r.estado);
      const b = document.createElement('span');
      b.className = 'badge ' + (tipo === 'atendida' ? 'badge-completado'
                              : tipo === 'cancelada' ? 'badge-cancelado' : 'badge-proceso');
      b.textContent = r.estado || '—';

      item.appendChild(info);
      item.appendChild(b);
      lista.appendChild(item);
    });
  } catch (err) {
    mostrarVacio('No se pudo conectar con el servidor.');
    console.error(err);
  }
}