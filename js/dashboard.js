/* =========================================================
   ÓPTICA ALEMANA — DASHBOARD JS
   ---------------------------------------------------------
   Cómo conectar tus datos reales de db_optica:

   1. Crea endpoints PHP que devuelvan JSON, por ejemplo:
        /api/productos.php   -> SELECT * FROM productos
        /api/categorias.php  -> SELECT * FROM categorias
        /api/ordenes.php     -> SELECT * FROM ordenes ...
      Cada uno debe hacer: header('Content-Type: application/json');
      echo json_encode($resultado);

   2. Cambia CONFIG.API_BASE por la ruta donde viven esos archivos
      (ej: 'http://localhost/db_optica/api').

   3. Ajusta TABLES[].columns más abajo para que coincidan con
      los nombres reales de las columnas de cada tabla.

   Mientras no haya API disponible, el panel funciona en modo
   demostración con datos simulados que cambian levemente en
   cada actualización, para que puedas ver el comportamiento
   "en tiempo real" sin backend.
   ========================================================= */

const CONFIG = {
  API_BASE: 'api',           // <-- pon aquí la ruta de tus endpoints PHP
  POLL_INTERVAL_MS: 15000,   // frecuencia de auto-actualización
  USE_MOCK_FALLBACK: true    // si el fetch falla, usa datos simulados
};

/* ---------------------------------------------------------
   Definición de módulos (coincide con las tablas de db_optica)
   --------------------------------------------------------- */
const TABLES = {
  productos: {
    label: 'Productos', endpoint: 'productos.php',
    columns: [
      { key: 'id_producto', label: 'ID' },
      { key: 'nombre', label: 'Producto' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'precio', label: 'Precio', type: 'currency' },
      { key: 'stock', label: 'Stock' }
    ]
  },
  categorias: {
    label: 'Categorías', endpoint: 'categorias.php',
    columns: [
      { key: 'id_categoria', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' }
    ]
  },
  servicios: {
    label: 'Servicios', endpoint: 'servicios.php',
    columns: [
      { key: 'id_servicio', label: 'ID' },
      { key: 'nombre', label: 'Servicio' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'precio', label: 'Precio', type: 'currency' }
    ]
  },
  ordenes: {
    label: 'Órdenes', endpoint: 'ordenes.php',
    columns: [
      { key: 'id_orden', label: 'ID' },
      { key: 'usuario', label: 'Cliente' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'estado', label: 'Estado', type: 'badge' },
      { key: 'total', label: 'Total', type: 'currency' }
    ]
  },
  orden_producto: {
    label: 'Detalle de órdenes', endpoint: 'orden_producto.php',
    columns: [
      { key: 'id_orden', label: 'Orden' },
      { key: 'producto', label: 'Producto' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency' }
    ]
  },
  estados: {
    label: 'Estados', endpoint: 'estados.php',
    columns: [
      { key: 'id_estado', label: 'ID' },
      { key: 'nombre', label: 'Nombre' }
    ]
  },
  localidad: {
    label: 'Localidad', endpoint: 'localidad.php',
    columns: [
      { key: 'id_localidad', label: 'ID' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'departamento', label: 'Departamento' }
    ]
  },
  usuario: {
    label: 'Usuarios', endpoint: 'usuario.php',
    columns: [
      { key: 'id_usuario', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'rol', label: 'Rol' },
      { key: 'estado', label: 'Estado', type: 'badge' }
    ]
  },
  roles: {
    label: 'Roles', endpoint: 'roles.php',
    columns: [
      { key: 'id_rol', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' }
    ]
  },
  tipo_identificacion: {
    label: 'Tipo de identificación', endpoint: 'tipo_identificacion.php',
    columns: [
      { key: 'id_tipo', label: 'ID' },
      { key: 'nombre', label: 'Nombre' }
    ]
  }
};

/* ---------------------------------------------------------
   Datos simulados (solo se usan si la API no responde)
   --------------------------------------------------------- */
const MOCK = {
  categorias: ['Monturas', 'Lentes de contacto', 'Gafas de sol', 'Accesorios', 'Lentes graduados']
    .map((nombre, i) => ({ id_categoria: i + 1, nombre, descripcion: 'Línea de ' + nombre.toLowerCase() })),

  productos: [
    ['Montura Bavaria Titanio', 'Monturas', 289000, 14],
    ['Lente Progresivo Zeiss', 'Lentes graduados', 512000, 8],
    ['Gafa Sol Alpen UV400', 'Gafas de sol', 198000, 21],
    ['Lente Contacto Mensual', 'Lentes de contacto', 96000, 40],
    ['Estuche Rígido Premium', 'Accesorios', 35000, 60]
  ].map(([nombre, categoria, precio, stock], i) => ({ id_producto: i + 1, nombre, categoria, precio, stock })),

  servicios: ['Examen visual computarizado', 'Adaptación lentes de contacto', 'Ajuste de montura',
    'Topografía corneal', 'Control de salud visual', 'Asesoría óptica personalizada', 'Mantenimiento de gafas']
    .map((nombre, i) => ({ id_servicio: i + 1, nombre, descripcion: 'Servicio especializado', precio: 40000 + i * 8000 })),

  estados: ['Pendiente', 'En proceso', 'Completada', 'Cancelada']
    .map((nombre, i) => ({ id_estado: i + 1, nombre })),

  localidad: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Manizales']
    .map((ciudad, i) => ({ id_localidad: i + 1, ciudad, departamento: 'N/A' })),

  roles: ['Administrador', 'Optómetra', 'Vendedor', 'Cajero', 'Auxiliar']
    .map((nombre, i) => ({ id_rol: i + 1, nombre, descripcion: 'Perfil ' + nombre.toLowerCase() })),

  tipo_identificacion: ['Cédula de ciudadanía', 'Tarjeta de identidad', 'Cédula extranjería', 'Pasaporte',
    'NIT', 'PEP', 'Registro civil', 'Permiso especial', 'Otro']
    .map((nombre, i) => ({ id_tipo: i + 1, nombre })),

  usuario: ['Laura Restrepo', 'Andrés Gómez', 'Camila Ruiz', 'Julián Torres', 'Mariana Salas', 'Diego Peña']
    .map((nombre, i) => ({
      id_usuario: i + 1, nombre,
      rol: ['Administrador', 'Optómetra', 'Vendedor', 'Cajero'][i % 4],
      estado: i % 5 === 0 ? 'Inactivo' : 'Activo'
    })),

  ordenes: [],
  orden_producto: []
};

// una orden inicial, como en la captura de phpMyAdmin (1 fila)
MOCK.ordenes.push(mockOrden(1));
MOCK.orden_producto.push({ id_orden: 1, producto: MOCK.productos[0].nombre, cantidad: 1, subtotal: MOCK.productos[0].precio });

function mockOrden(id) {
  const user = MOCK.usuario[Math.floor(Math.random() * MOCK.usuario.length)];
  const estado = MOCK.estados[Math.floor(Math.random() * MOCK.estados.length)];
  const producto = MOCK.productos[Math.floor(Math.random() * MOCK.productos.length)];
  return {
    id_orden: id,
    usuario: user.nombre,
    fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
    estado: estado.nombre,
    total: producto.precio
  };
}

/* ---------------------------------------------------------
   Estado de la aplicación
   --------------------------------------------------------- */
const state = {
  currentModule: 'resumen',
  online: false,
  nextOrderId: 2
};

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheEls();
  bindUI();
  pingApi();
  refreshAll(true);
  blinkLoop();
  setInterval(() => refreshAll(false), CONFIG.POLL_INTERVAL_MS);
});

function cacheEls() {
  els.app = document.getElementById('app');
  els.sidebar = document.getElementById('sidebar');
  els.sidebarToggle = document.getElementById('sidebarToggle');
  els.menuBtn = document.getElementById('menuBtn');
  els.overlay = document.getElementById('sidebarOverlay');
  els.navLinks = [...document.querySelectorAll('.nav-link')];
  els.pageTitle = document.getElementById('pageTitle');
  els.pageSubtitle = document.getElementById('pageSubtitle');
  els.tableTitle = document.getElementById('tableTitle');
  els.tableHead = document.getElementById('dataTableHead');
  els.tableBody = document.getElementById('dataTableBody');
  els.categoryBars = document.getElementById('categoryBars');
  els.refreshBtn = document.getElementById('refreshBtn');
  els.lastUpdated = document.getElementById('lastUpdated');
  els.dbDot = document.getElementById('dbDot');
  els.dbStatusText = document.getElementById('dbStatusText');
  els.eyeLogo = document.querySelector('.eye-logo');
  els.eyePupil = document.getElementById('eyePupil');
  els.viewAllBtn = document.getElementById('viewAllBtn');
}

function bindUI() {
  els.sidebarToggle.addEventListener('click', () => els.app.classList.toggle('is-collapsed'));
  els.menuBtn.addEventListener('click', () => els.app.classList.add('is-nav-open'));
  els.overlay.addEventListener('click', () => els.app.classList.remove('is-nav-open'));

  els.navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      els.navLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
      state.currentModule = link.dataset.module;
      els.app.classList.remove('is-nav-open');
      openModule(state.currentModule, link.dataset.table);
    });
  });

  els.refreshBtn.addEventListener('click', () => refreshAll(false));
  els.viewAllBtn.addEventListener('click', () => {
    document.querySelector('.panel--wide').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ---------------------------------------------------------
   Navegación entre módulos
   --------------------------------------------------------- */
function openModule(moduleKey, tableKey) {
  if (moduleKey === 'resumen') {
    els.pageTitle.textContent = 'Resumen general';
    els.pageSubtitle.textContent = 'Estado en vivo de db_optica';
    els.tableTitle.textContent = 'Últimas órdenes';
    renderTable('ordenes');
    return;
  }
  const def = TABLES[tableKey];
  if (!def) return;
  els.pageTitle.textContent = def.label;
  els.pageSubtitle.textContent = 'Módulo · tabla "' + tableKey + '"';
  els.tableTitle.textContent = def.label;
  renderTable(tableKey);
}

/* ---------------------------------------------------------
   Capa de datos: intenta la API real, si falla usa MOCK
   --------------------------------------------------------- */
async function fetchTable(tableKey) {
  const def = TABLES[tableKey];
  if (def && CONFIG.API_BASE) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}/${def.endpoint}`, { cache: 'no-store' });
      if (res.ok) {
        state.online = true;
        return await res.json();
      }
    } catch (err) {
      /* sin API disponible: seguimos con datos simulados */
    }
  }
  state.online = state.online && false;
  if (!CONFIG.USE_MOCK_FALLBACK) return [];
  simulateActivity();
  return MOCK[tableKey] || [];
}

// pequeña simulación de "vida" en la base de datos para el modo demo
function simulateActivity() {
  if (Math.random() < 0.35) {
    const id = state.nextOrderId++;
    const nueva = mockOrden(id);
    MOCK.ordenes.unshift(nueva);
    MOCK.orden_producto.unshift({
      id_orden: id,
      producto: MOCK.productos[Math.floor(Math.random() * MOCK.productos.length)].nombre,
      cantidad: 1 + Math.floor(Math.random() * 3),
      subtotal: nueva.total
    });
    MOCK.ordenes = MOCK.ordenes.slice(0, 12);
    MOCK.orden_producto = MOCK.orden_producto.slice(0, 12);
  }
  // fluctuación leve de stock
  MOCK.productos.forEach(p => {
    if (Math.random() < 0.2) p.stock = Math.max(0, p.stock + (Math.random() < 0.5 ? -1 : 1));
  });
}

async function pingApi() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/ping.php`, { cache: 'no-store' });
    state.online = res.ok;
  } catch {
    state.online = false;
  }
  updateDbStatus();
}

function updateDbStatus() {
  if (state.online) {
    els.dbDot.className = 'db-dot is-online';
    els.dbStatusText.textContent = 'Conectado a db_optica';
  } else {
    els.dbDot.className = 'db-dot is-offline';
    els.dbStatusText.textContent = 'Modo demostración · sin API conectada';
  }
}

/* ---------------------------------------------------------
   Render: tarjetas de estadísticas
   --------------------------------------------------------- */
async function renderStats() {
  const keys = ['productos', 'ordenes', 'usuario', 'servicios'];
  for (const key of keys) {
    const rows = await fetchTable(key);
    const el = document.querySelector(`[data-value="${key}"]`);
    const navCount = document.querySelector(`[data-count="${key}"]`);
    if (el) el.textContent = rows.length;
    if (navCount) navCount.textContent = rows.length;
  }
  // también llena los contadores del resto de módulos del menú
  for (const key of ['categorias', 'estados', 'localidad', 'orden_producto', 'roles', 'tipo_identificacion']) {
    const rows = await fetchTable(key);
    const navCount = document.querySelector(`[data-count="${key}"]`);
    if (navCount) navCount.textContent = rows.length;
  }
}

/* ---------------------------------------------------------
   Render: barras de productos por categoría
   --------------------------------------------------------- */
async function renderBars() {
  const productos = await fetchTable('productos');
  const counts = {};
  productos.forEach(p => { counts[p.categoria] = (counts[p.categoria] || 0) + 1; });
  const max = Math.max(1, ...Object.values(counts));
  els.categoryBars.innerHTML = Object.entries(counts).map(([name, count]) => `
    <div class="bar-row">
      <span class="bar-name">${name}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(count / max) * 100}%"></span></span>
      <span class="bar-value">${count}</span>
    </div>
  `).join('') || '<p class="empty-row">Sin datos aún</p>';
}

/* ---------------------------------------------------------
   Render: tabla dinámica según el módulo activo
   --------------------------------------------------------- */
async function renderTable(tableKey) {
  const def = TABLES[tableKey];
  if (!def) return;
  const rows = await fetchTable(tableKey);

  els.tableHead.innerHTML = '<tr>' + def.columns.map(c => `<th>${c.label}</th>`).join('') + '</tr>';

  if (!rows.length) {
    els.tableBody.innerHTML = `<tr><td class="empty-row" colspan="${def.columns.length}">Aún no hay registros en "${tableKey}"</td></tr>`;
    return;
  }

  els.tableBody.innerHTML = rows.slice(0, 10).map((row, i) => `
    <tr class="${i === 0 ? 'is-new' : ''}">
      ${def.columns.map(c => `<td>${formatCell(row[c.key], c.type)}</td>`).join('')}
    </tr>
  `).join('');
}

function formatCell(value, type) {
  if (value === undefined || value === null || value === '') return '<span class="mono">—</span>';
  if (type === 'currency') return '<span class="mono">$' + Number(value).toLocaleString('es-CO') + '</span>';
  if (type === 'badge') return `<span class="badge ${badgeClass(value)}">${value}</span>`;
  return value;
}

function badgeClass(value) {
  const v = String(value).toLowerCase();
  if (['activo', 'completada', 'completado'].includes(v)) return 'badge--ok';
  if (['pendiente', 'en proceso'].includes(v)) return 'badge--pending';
  if (['cancelada', 'inactivo'].includes(v)) return 'badge--alert';
  return 'badge--neutral';
}

/* ---------------------------------------------------------
   Ciclo de actualización
   --------------------------------------------------------- */
async function refreshAll(isFirstLoad) {
  els.refreshBtn.classList.add('is-spinning');
  if (!isFirstLoad) triggerEyeRefresh();

  await Promise.all([
    renderStats(),
    renderBars(),
    state.currentModule === 'resumen' ? renderTable('ordenes') : renderTable(currentTableKey())
  ]);

  updateDbStatus();
  const now = new Date();
  els.lastUpdated.textContent = 'Última actualización: ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  setTimeout(() => els.refreshBtn.classList.remove('is-spinning'), 700);
}

function currentTableKey() {
  const active = els.navLinks.find(l => l.classList.contains('is-active'));
  return active ? active.dataset.table : 'ordenes';
}

/* ---------------------------------------------------------
   Micro-interacciones del logo (parpadeo + pulso al refrescar)
   --------------------------------------------------------- */
function blinkLoop() {
  setInterval(() => {
    els.eyeLogo.classList.add('is-blinking');
    setTimeout(() => els.eyeLogo.classList.remove('is-blinking'), 520);
  }, 6000 + Math.random() * 4000);
}

function triggerEyeRefresh() {
  els.eyePupil.classList.add('is-refreshing');
  setTimeout(() => els.eyePupil.classList.remove('is-refreshing'), 900);
}