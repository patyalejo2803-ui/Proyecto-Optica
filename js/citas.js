const API_CITAS = 'php/citas/index.php';

let horaElegida = '';
let todasLasHoras = [];

document.addEventListener('DOMContentLoaded', () => {
  const fecha = document.getElementById('fecha');
  fecha.min = hoyISO();
  fecha.addEventListener('change', cargarHoras);
  document.getElementById('servicio').addEventListener('change', validar);
  document.getElementById('btnConfirmar').addEventListener('click', confirmarCita);
  cargarHoras();
});

// Refresca las horas ocupadas cada 15 segundos sin borrar la hora elegida
setInterval(async () => {
  const fecha = document.getElementById('fecha').value;
  if (document.hidden || !fecha) return;
  try {
    const res = await fetch(API_CITAS + '?fecha=' + fecha);
    const data = await res.json();
    if (data.code !== 200) return;
    document.querySelectorAll('#horas .hora').forEach(b => {
      const pasada = new Date(fecha + 'T' + b.textContent + ':00') < new Date();
      b.disabled = data.ocupadas.includes(b.textContent) || pasada;
      if (b.disabled && b.classList.contains('activo')) {
        b.classList.remove('activo');
        horaElegida = '';
      }
    });
    validar();
  } catch (e) { /* se reintenta en el siguiente ciclo */ }
}, 15000);

function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatoPesos(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); }

function mostrarAviso(texto, tipo, enlace) {
  const el = document.getElementById('aviso');
  el.className = 'aviso ' + tipo;
  el.textContent = texto + ' ';
  if (enlace) {
    const a = document.createElement('a');
    a.href = enlace.href;
    a.textContent = enlace.texto;
    el.appendChild(a);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function cargarHoras() {
  const fecha = document.getElementById('fecha').value;
  horaElegida = '';

  try {
    const res = await fetch(API_CITAS + (fecha ? '?fecha=' + fecha : ''));
    const data = await res.json();

    if (data.code === 401) {
      document.getElementById('servicio').innerHTML = '<option value="">—</option>';
      mostrarAviso(data.msg + '.', 'error', { href: 'login.html', texto: 'Ir al login' });
      return;
    }
    if (data.code !== 200) {
      mostrarAviso('Error: ' + data.msg, 'error');
      return;
    }

    llenarServicios(data.servicios);
    todasLasHoras = data.horas;
    dibujarHoras(data.ocupadas, fecha);
  } catch (err) {
    mostrarAviso('No se pudo conectar con el servidor.', 'error');
    console.error(err);
  }
}

function llenarServicios(servicios) {
  const sel = document.getElementById('servicio');
  if (sel.options.length > 1) return; // ya cargados
  const previo = sel.value;
  sel.innerHTML = '';
  const base = document.createElement('option');
  base.value = '';
  base.textContent = 'Selecciona un servicio…';
  sel.appendChild(base);
  servicios.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.nombre + ' — ' + formatoPesos(s.precio);
    sel.appendChild(o);
  });
  sel.value = previo;
}

function dibujarHoras(ocupadas, fecha) {
  const cont = document.getElementById('horas');
  cont.innerHTML = '';
  const nota = document.getElementById('notaHoras');

  if (!fecha) { nota.textContent = 'Primero elige una fecha.'; validar(); return; }

  if (new Date(fecha + 'T12:00:00').getDay() === 0) {
    nota.textContent = 'No atendemos los domingos. Elige otra fecha.';
    validar();
    return;
  }
  nota.textContent = 'Las horas tachadas ya están reservadas.';

  const ahora = new Date();
  todasLasHoras.forEach(h => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hora';
    b.textContent = h;
    const pasada = new Date(fecha + 'T' + h + ':00') < ahora;
    b.disabled = ocupadas.includes(h) || pasada;
    b.addEventListener('click', () => {
      horaElegida = h;
      cont.querySelectorAll('.hora').forEach(x => x.classList.remove('activo'));
      b.classList.add('activo');
      validar();
    });
    cont.appendChild(b);
  });
  validar();
}

function validar() {
  const ok = document.getElementById('servicio').value &&
             document.getElementById('fecha').value && horaElegida;
  document.getElementById('btnConfirmar').disabled = !ok;
}

async function confirmarCita() {
  const btn = document.getElementById('btnConfirmar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const res = await fetch(API_CITAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_servicio: document.getElementById('servicio').value,
        fecha: document.getElementById('fecha').value,
        hora: horaElegida
      })
    });
    const data = await res.json();

    if (data.code === 200) {
      mostrarAviso('Cita agendada. Tu número es #' + String(data.id).padStart(4, '0') + '.', 'ok',
        { href: 'estado.html?orden=' + data.id, texto: 'Ver estado' });
      horaElegida = '';
      await cargarHoras();
    } else {
      mostrarAviso(data.msg, 'error');
      await cargarHoras();
    }
  } catch (err) {
    mostrarAviso('No se pudo conectar con el servidor.', 'error');
    console.error(err);
  }
  btn.textContent = 'Confirmar cita';
  validar();
}