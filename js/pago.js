// ── Conexión con el servidor ──
const API_PAGO = 'php/pago/index.php';

// Lo que el usuario elige
let servicioSeleccionado = null;   // { id_servicio, nombre, precio }
let medioSeleccionado    = '';

document.addEventListener('DOMContentLoaded', cargarServicios);

// ── Utilidades ──
function formatoPesos(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}

function numeroPedido(id) {
  return '#' + String(id).padStart(4, '0');
}

function mostrar(id) { document.getElementById(id).style.display = 'block'; }
function ocultar(id) { document.getElementById(id).style.display = 'none'; }

function errorGeneral(texto) {
  const el = document.getElementById('error-general');
  el.textContent = texto;
  el.style.display = 'block';
}

// ── Mensaje dentro de la lista de servicios (cargando, vacío o error) ──
function mensajeServicios(texto, conLogin) {
  const contenedor = document.getElementById('listaServicios');
  contenedor.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = texto + ' ';
  if (conLogin) {
    const a = document.createElement('a');
    a.href = 'login.html';
    a.textContent = 'Ir al login';
    p.appendChild(a);
  }
  contenedor.appendChild(p);
}

// ── Cargar los servicios desde la base de datos ──
async function cargarServicios() {
  mensajeServicios('Cargando servicios…');

  try {
    const res = await fetch(API_PAGO);
    const data = await res.json();

    if (data.code === 401) {
      mensajeServicios(data.msg + '.', true);
      return;
    }
    if (data.code !== 200) {
      mensajeServicios('Error: ' + data.msg);
      return;
    }
    if (data.data.length === 0) {
      mensajeServicios('Aún no hay servicios disponibles.');
      return;
    }

    const contenedor = document.getElementById('listaServicios');
    contenedor.innerHTML = '';
    data.data.forEach(s => contenedor.appendChild(crearTarjetaServicio(s)));

  } catch (err) {
    mensajeServicios('No se pudo conectar con el servidor.');
    console.error(err);
  }
}

// ── Crear la tarjeta de un servicio ──
function crearTarjetaServicio(s) {
  const card = document.createElement('div');
  card.className = 'producto';
  card.title = s.descripcion || '';

  const icono = document.createElement('span');
  icono.className = 'icono';
  icono.textContent = '👓';

  const nombre = document.createElement('p');
  nombre.textContent = s.nombre;

  const precio = document.createElement('p');
  precio.className = 'precio';
  precio.textContent = formatoPesos(s.precio);

  card.appendChild(icono);
  card.appendChild(nombre);
  card.appendChild(precio);
  card.addEventListener('click', () => seleccionarServicio(card, s));

  return card;
}

// ── Seleccionar un servicio ──
function seleccionarServicio(card, s) {
  document.querySelectorAll('.producto').forEach(c => c.classList.remove('seleccionado'));
  card.classList.add('seleccionado');

  servicioSeleccionado = { id_servicio: s.id_servicio, nombre: s.nombre, precio: s.precio };
  ocultar('error-producto');
}

// ── Seleccionar el medio de pago ──
function seleccionarMedio(elemento, medio) {
  document.querySelectorAll('.medio').forEach(m => m.classList.remove('seleccionado'));
  elemento.classList.add('seleccionado');

  medioSeleccionado = medio;
  ocultar('error-medio');
}

// ── Procesar el pedido ──
async function procesarPago() {
  ocultar('error-producto');
  ocultar('error-medio');
  ocultar('error-general');
  ocultar('factura');

  let hayError = false;

  if (!servicioSeleccionado) {
    mostrar('error-producto');
    hayError = true;
  }
  if (medioSeleccionado === '') {
    mostrar('error-medio');
    hayError = true;
  }
  if (hayError) return;

  // Se desactiva el botón para no crear el mismo pedido dos veces
  const boton = document.getElementById('btnPagar');
  boton.disabled = true;

  try {
    const res = await fetch(API_PAGO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_servicio: servicioSeleccionado.id_servicio,
        medio: medioSeleccionado
      })
    });
    const data = await res.json();

    if (data.code !== 200) {
      errorGeneral(data.msg);
      boton.disabled = false;
      return;
    }

    // Factura con los datos reales
    document.getElementById('f-producto').textContent = data.servicio;
    document.getElementById('f-medio').textContent    = medioSeleccionado;
    document.getElementById('f-total').textContent    = formatoPesos(data.total);
    document.getElementById('f-pedido').textContent   = numeroPedido(data.id_orden);

    mostrar('factura');
    document.getElementById('factura').scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    errorGeneral('No se pudo conectar con el servidor');
    boton.disabled = false;
    console.error(err);
  }
}