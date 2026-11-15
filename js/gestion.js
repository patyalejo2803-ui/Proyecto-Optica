const API_ORDENES = 'php/ordenes/index.php';
let ordenes = [];
let estados = [];
let avisoTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('buscar').addEventListener('input', dibujar);
  document.getElementById('filtroEstado').addEventListener('change', dibujar);
  document.getElementById('btnActualizar').addEventListener('click', cargar);
  cargar();
});

function el(tag, clase, texto) {
  const x = document.createElement(tag);
  if (clase) x.className = clase;
  if (texto !== undefined) x.textContent = texto;
  return x;
}
function numero(id) { return String(id).padStart(4, '0'); }
function pesos(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); }
function fecha(f) {
  const p = String(f || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '—';
}

function aviso(texto, tipo, enlaceLogin) {
  const a = document.getElementById('aviso');
  a.className = 'aviso ' + tipo;
  a.textContent = texto + ' ';
  if (enlaceLogin) {
    const l = el('a', '', 'Ir al login');
    l.href = 'login.html';
    a.appendChild(l);
  }
  clearTimeout(avisoTimer);
  if (tipo === 'ok') avisoTimer = setTimeout(() => { a.className = 'aviso'; }, 3500);
}

function filaMensaje(texto) {
  const c = document.getElementById('cuerpo');
  c.innerHTML = '';
  const tr = el('tr');
  const td = el('td', 'vacio', texto);
  td.colSpan = 8;
  tr.appendChild(td);
  c.appendChild(tr);
}

async function cargar() {
  try {
    const res = await fetch(API_ORDENES);
    const data = await res.json();

    if (data.code === 401) { filaMensaje('Sin sesión.'); aviso(data.msg + '.', 'error', true); return; }
    if (data.code === 403) { filaMensaje('Sin permiso.'); aviso(data.msg + '. Esta página es solo para el personal.', 'error'); return; }
    if (data.code !== 200) { filaMensaje('Error.'); aviso('Error: ' + data.msg, 'error'); return; }

    ordenes = data.data;
    estados = data.estados;

    const filtro = document.getElementById('filtroEstado');
    const actual = filtro.value;
    filtro.innerHTML = '';
    filtro.appendChild(Object.assign(el('option', '', 'Todos los estados'), { value: '' }));
    estados.forEach(e => filtro.appendChild(Object.assign(el('option', '', e.nombre), { value: e.id })));
    filtro.value = actual;

    dibujar();
  } catch (err) {
    filaMensaje('No se pudo conectar con el servidor.');
    console.error(err);
  }
}

function dibujar() {
  const texto = document.getElementById('buscar').value.trim().toLowerCase();
  const est = document.getElementById('filtroEstado').value;

  const lista = ordenes.filter(o =>
    (!est || String(o.id_estado) === est) &&
    (!texto || (numero(o.id) + ' ' + (o.cliente || '') + ' ' + o.servicio).toLowerCase().includes(texto))
  );

  if (!lista.length) { filaMensaje('No hay órdenes con ese filtro.'); return; }

  const cuerpo = document.getElementById('cuerpo');
  cuerpo.innerHTML = '';

  lista.forEach(o => {
    const tr = el('tr');

    tr.appendChild(el('td', '', '#' + numero(o.id)));

    const tdF = el('td', '', fecha(o.fecha));
    if (o.hora && o.hora !== '00:00') { tdF.appendChild(el('br')); tdF.appendChild(el('small', '', o.hora)); }
    tr.appendChild(tdF);

    tr.appendChild(el('td', '', (o.cliente || '—').trim()));
    tr.appendChild(el('td', '', o.servicio));
    tr.appendChild(el('td', '', pesos(o.total)));

    const selE = el('select');
    estados.forEach(e => {
      const op = Object.assign(el('option', '', e.nombre), { value: e.id });
      if (String(e.id) === String(o.id_estado)) op.selected = true;
      selE.appendChild(op);
    });
    const tdE = el('td'); tdE.appendChild(selE); tr.appendChild(tdE);

    const selP = el('select');
    ['Pendiente', 'Pagado'].forEach(v => {
      const op = Object.assign(el('option', '', v), { value: v });
      if (String(o.pago || '').toLowerCase().startsWith(v.toLowerCase().slice(0, 5))) op.selected = true;
      selP.appendChild(op);
    });
    const tdP = el('td'); tdP.appendChild(selP); tr.appendChild(tdP);

    const btn = el('button', 'btn-guardar', 'Guardar');
    btn.type = 'button';
    btn.addEventListener('click', () => guardar(o, selE.value, selP.value, btn));
    const tdB = el('td'); tdB.appendChild(btn); tr.appendChild(tdB);

    cuerpo.appendChild(tr);
  });
}

async function guardar(o, idEstado, pago, btn) {
  btn.disabled = true;
  btn.textContent = 'Guardando…';
  try {
    const res = await fetch(API_ORDENES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_orden: o.id, id_estado: idEstado, pago: pago })
    });
    const data = await res.json();
    if (data.code === 200) {
      aviso(data.msg + '.', 'ok');
      o.id_estado = idEstado;
      o.pago = pago;
    } else {
      aviso(data.msg || 'No se pudo guardar.', 'error');
    }
  } catch (err) {
    aviso('No se pudo conectar con el servidor.', 'error');
    console.error(err);
  }
  btn.disabled = false;
  btn.textContent = 'Guardar';
}