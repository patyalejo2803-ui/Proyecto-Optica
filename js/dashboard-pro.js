/* =========================================================
   ÓPTICA ALEMANA — dashboard-pro.js
   Saludo dinámico según la hora + respaldo si Chart.js no carga
   (Archivo independiente: no modifica dashboard.js)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  pintarBanner();
  revisarChartJs();
});

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function pintarBanner() {
  const main = document.querySelector('main.content');
  if (!main) return;

  const nombre = localStorage.getItem('nombreUsuario') || 'Administrador';

  const banner = document.createElement('div');
  banner.className = 'welcome-banner';
  banner.innerHTML = `
    <div class="welcome-banner__text">
      <h2>${saludoSegunHora()}, ${nombre} 👋</h2>
      <p>Este es el resumen en vivo de Óptica Alemana. Aquí puedes revisar productos, órdenes, usuarios y más, todo actualizado en tiempo real.</p>
      <span class="welcome-banner__badge">
        <span class="dot"></span> Sistema activo
      </span>
    </div>
    <svg class="welcome-banner__art" viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="50" r="28" fill="none" stroke="#fff" stroke-width="5" opacity="0.85"/>
      <circle cx="100" cy="50" r="28" fill="none" stroke="#fff" stroke-width="5" opacity="0.85"/>
      <path d="M63 50 h14" stroke="#fff" stroke-width="5" opacity="0.85"/>
      <path d="M7 50 C 0 40, 0 30, 8 24" stroke="#fff" stroke-width="5" fill="none" opacity="0.6"/>
      <path d="M133 50 C 140 40, 140 30, 132 24" stroke="#fff" stroke-width="5" fill="none" opacity="0.6"/>
    </svg>
  `;

  main.insertBefore(banner, main.firstChild);
}

/* Si Chart.js no cargó desde el primer CDN (cdnjs), probamos con jsdelivr.
   Esto NO reemplaza tu dashboard.js: solo asegura que la librería exista
   antes de que dashboard.js intente dibujar el gráfico. */
function revisarChartJs() {
  if (typeof Chart !== 'undefined') return; // ya cargó bien, no hacemos nada

  console.warn('Chart.js no cargó desde cdnjs, probando con jsdelivr...');
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
  script.onload = () => {
    console.log('Chart.js cargado correctamente desde jsdelivr');
    // Si dashboard.js ya intentó dibujar el gráfico y falló (Chart no existía),
    // lo reintentamos ahora que la librería sí está disponible.
    if (typeof renderChartDonut === 'function') {
      renderChartDonut();
    }
  };
  script.onerror = () => {
    console.error('No se pudo cargar Chart.js desde ningún CDN. Revisa tu conexión a internet.');
  };
  document.head.appendChild(script);
}