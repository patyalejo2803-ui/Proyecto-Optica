/* =========================================================
   ÓPTICA ALEMANA — DASHBOARD JS (conectado a datos reales)
   ========================================================= */

const CONFIG = {
  API_URL: 'php/api_dashboard.php', // <-- un solo archivo que trae todo
  POLL_INTERVAL_MS: 8000            // frecuencia de auto-actualización
};

// Aquí guardamos en memoria la última respuesta completa del servidor
let ULTIMA_RESPUESTA = {
  productos: [], categorias: [], servicios: [], usuario: [],
  ordenes: [], orden_producto: [], estados: [], localidad: [],
  roles: [], tipo_identificacion: []
};

/* ---------------------------------------------------------
   Definición de módulos (ajustada a las columnas reales de db_optica)
   --------------------------------------------------------- */
const TABLES = {
  productos: {
    label: 'Productos',
    columns: [
      { key: 'id_producto', label: 'ID' },
      { key: 'nombre', label: 'Producto' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'marca', label: 'Marca' },
      { key: 'estado', label: 'Estado', type: 'badge' }
    ]
  },
  categorias: {
    label: 'Categorías',
    columns: [
      { key: 'id_categoria', label: 'ID' },
      { key: 'nombre', label: 'Categoría' }
    ]
  },
  servicios: {
    label: 'Servicios',
    columns: [
      { key: 'id_servicio', label: 'ID' },
      { key: 'nombre', label: 'Servicio' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'precio', label: 'Precio', type: 'currency' }
    ]
  },
  ordenes: {
    label: 'Órdenes',
    columns: [
      { key: 'id_orden', label: 'ID' },
      { key: 'usuario', label: 'Cliente' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'estado', label: 'Estado', type: 'badge' },
      { key: 'total', label: 'Total', type: 'currency' }
    ]
  },
  orden_producto: {
    label: 'Detalle de órdenes',
    columns: [
      { key: 'id_orden', label: 'Orden' },
      { key: 'producto', label: 'Producto' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'precio_unitario', label: 'Precio unit.', type: 'currency' },
      { key: 'total', label: 'Total', type: 'currency' }
    ]
  },
  estados: {
    label: 'Estados',
    columns: [
      { key: 'id_estado', label: 'ID' },
      { key: 'nombre', label: 'Estado', type: 'badge' }
    ]
  },
  localidad: {
    label: 'Localidad',
    columns: [
      { key: 'id_localidad', label: 'ID' },
      { key: 'nombre', label: 'Nombre' }
    ]
  },
  usuario: {
    label: 'Usuarios',
    columns: [
      { key: 'id_usuario', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'rol', label: 'Rol' }
    ]
  },
  roles: {
    label: 'Roles',
    columns: [
      { key: 'id_rol', label: 'ID' },
      { key: 'nombre', label: 'Rol' }
    ]
  },
  tipo_identificacion: {
    label: 'Tipo de identificación',
    columns: [
      { key: 'id_tipo', label: 'ID' },
      { key: 'nombre', label: 'Tipo' },
      { key: 'descripcion', label: 'Descripción' }
    ]
  }
};

/* ---------------------------------------------------------
   Estado de la aplicación
   --------------------------------------------------------- */
const state = {
  currentModule: 'resumen',
  online: false
};

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheEls();
  bindUI();
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
  els.logoutBtn = document.getElementById('logoutBtn');
}

function bindUI() {
  if (els.sidebarToggle) els.sidebarToggle.addEventListener('click', () => els.app.classList.toggle('is-collapsed'));
  if (els.menuBtn) els.menuBtn.addEventListener('click', () => els.app.classList.add('is-nav-open'));
  if (els.overlay) els.overlay.addEventListener('click', () => els.app.classList.remove('is-nav-open'));

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

  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', () => {
      refreshAll(false);
      mostrarToast('Datos actualizados', 'ok');
    });
  }

  if (els.viewAllBtn) els.viewAllBtn.addEventListener('click', () => {
    document.querySelector('.panel--wide').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (els.logoutBtn) {
    els.logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('idRol');
      localStorage.removeItem('nombreUsuario');
      window.location.href = 'login.html';
    });
  }
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
   Capa de datos: UNA sola llamada trae todo (php/api_dashboard.php)
   --------------------------------------------------------- */
async function cargarTodo() {
  try {
    const res = await fetch(CONFIG.API_URL, { cache: 'no-store' });
    const data = await res.json();

    if (res.ok && data.ok) {
      state.online = true;
      ULTIMA_RESPUESTA = data;
    } else {
      state.online = false;
      console.error('Error del servidor:', data.error);
    }
  } catch (err) {
    state.online = false;
    console.error('No se pudo conectar a api_dashboard.php:', err);
  }
  updateDbStatus();
}

// fetchTable ahora solo lee del objeto que ya se descargó con cargarTodo()
function fetchTable(tableKey) {
  return ULTIMA_RESPUESTA[tableKey] || [];
}

function updateDbStatus() {
  if (state.online) {
    els.dbDot.className = 'db-dot is-online';
    els.dbStatusText.textContent = 'Conectado a db_optica';
  } else {
    els.dbDot.className = 'db-dot is-offline';
    els.dbStatusText.textContent = 'Sin conexión a la API — revisa XAMPP/Apache';
  }
}

/* ---------------------------------------------------------
   Render: tarjetas de estadísticas + contadores del menú
   --------------------------------------------------------- */
async function renderStats() {
  // Las 4 tarjetas grandes del resumen
  const keysConTarjeta = ['productos', 'ordenes', 'usuario', 'servicios'];
  for (const key of keysConTarjeta) {
    const rows = await fetchTable(key);
    const el = document.querySelector(`[data-value="${key}"]`);
    if (el) animarContador(el, rows.length);
  }

  // Todos los contadores del menú lateral (incluye los módulos nuevos)
  const todasLasClaves = [
    'productos', 'categorias', 'servicios', 'ordenes',
    'orden_producto', 'estados', 'localidad', 'usuario',
    'roles', 'tipo_identificacion'
  ];
  for (const key of todasLasClaves) {
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
  if (!els.categoryBars) return;
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
  if (['activo', 'completada', 'completado', 'disponible', 'pagado', 'asistio'].includes(v)) return 'badge--ok';
  if (['pendiente', 'en proceso'].includes(v)) return 'badge--pending';
  if (['cancelada', 'inactivo', 'cancelado'].includes(v)) return 'badge--alert';
  return 'badge--neutral';
}

/* ---------------------------------------------------------
   Ciclo de actualización
   --------------------------------------------------------- */
async function refreshAll(isFirstLoad) {
  if (els.refreshBtn) els.refreshBtn.classList.add('is-spinning');
  if (!isFirstLoad) triggerEyeRefresh();

  // 1. Traemos todo de una sola vez desde php/api_dashboard.php
  await cargarTodo();

  // 2. Pintamos las distintas partes de la pantalla con esos datos ya descargados
  renderStats();
  renderBars();
  renderChartDonut();
  state.currentModule === 'resumen' ? renderTable('ordenes') : renderTable(currentTableKey());

  updateDbStatus();
  const now = new Date();
  if (els.lastUpdated) els.lastUpdated.textContent = 'Última actualización: ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  setTimeout(() => { if (els.refreshBtn) els.refreshBtn.classList.remove('is-spinning'); }, 700);
}

function currentTableKey() {
  const active = els.navLinks.find(l => l.classList.contains('is-active'));
  return active ? active.dataset.table : 'ordenes';
}

/* ---------------------------------------------------------
   Micro-interacciones del logo (parpadeo + pulso al refrescar
   + seguimiento del cursor con la pupila)
   --------------------------------------------------------- */
function blinkLoop() {
  if (!els.eyeLogo) return;
  setInterval(() => {
    els.eyeLogo.classList.add('is-blinking');
    setTimeout(() => els.eyeLogo.classList.remove('is-blinking'), 520);
  }, 6000 + Math.random() * 4000);
}

function triggerEyeRefresh() {
  if (!els.eyePupil) return;
  els.eyePupil.classList.add('is-refreshing');
  setTimeout(() => els.eyePupil.classList.remove('is-refreshing'), 900);
}

// La pupila sigue el cursor dentro de un rango corto (no se sale del ojo)
document.addEventListener('mousemove', (e) => {
  if (!els.eyePupil || !els.eyeLogo) return;
  const rect = els.eyeLogo.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const angle = Math.atan2(dy, dx);

  const maxDesplazamiento = 4; // qué tanto se mueve la pupila dentro del ojo
  const offsetX = Math.cos(angle) * maxDesplazamiento;
  const offsetY = Math.sin(angle) * maxDesplazamiento;

  els.eyePupil.setAttribute('cx', 60 + offsetX);
  els.eyePupil.setAttribute('cy', 35 + offsetY);
});

/* ---------------------------------------------------------
   NUEVO: contador animado en las tarjetas de estadísticas
   --------------------------------------------------------- */
function animarContador(el, valorFinal) {
  const valorInicial = Number(el.dataset.actual || 0);
  if (valorInicial === valorFinal) return;
  const duracion = 600;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const valorActual = Math.round(valorInicial + (valorFinal - valorInicial) * progreso);
    el.textContent = valorActual;
    if (progreso < 1) requestAnimationFrame(paso);
    else el.dataset.actual = valorFinal;
  }
  requestAnimationFrame(paso);
}

/* ---------------------------------------------------------
   NUEVO: gráfico de dona con Chart.js (productos por categoría)
   --------------------------------------------------------- */
let chartCategoriasInstancia = null;

async function renderChartDonut() {
  const canvas = document.getElementById('chartCategorias');
  if (!canvas || typeof Chart === 'undefined') return;

  const productos = await fetchTable('productos');
  const counts = {};
  productos.forEach(p => { counts[p.categoria] = (counts[p.categoria] || 0) + 1; });

  const etiquetas = Object.keys(counts);
  const valores = Object.values(counts);
  const colores = ['#1B3A57', '#B08D57', '#4A7C9B', '#D9B173', '#6E8FA6', '#8C6F45'];

  if (chartCategoriasInstancia) {
    chartCategoriasInstancia.data.labels = etiquetas;
    chartCategoriasInstancia.data.datasets[0].data = valores;
    chartCategoriasInstancia.update();
    return;
  }

  chartCategoriasInstancia = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: etiquetas,
      datasets: [{
        data: valores,
        backgroundColor: colores,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
      },
      animation: { animateRotate: true, duration: 800 }
    }
  });
}

/* ---------------------------------------------------------
   NUEVO: sistema de notificaciones toast
   --------------------------------------------------------- */
function mostrarToast(mensaje, tipo = 'info') {
  const contenedor = document.getElementById('toastContainer');
  if (!contenedor) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 3100);
}