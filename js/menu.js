// Menú inferior único del área del cliente.
// Reemplaza el contenido de .menu-nav (o lo crea si la página no lo tiene).
(function () {
  const ICONOS = {
    inicio: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    citas: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pago: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    pedidos: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    estado: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    historial: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    promociones: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M5 12v9h14v-9M7.5 8a2.5 2.5 0 010-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 010 5"/>'
  };

  const OPCIONES = [
    { id: 'inicio', texto: 'Inicio', href: 'inicio.html' },
    { id: 'citas', texto: 'Citas', href: 'citas.html' },
    { id: 'pago', texto: 'Pago', href: 'pago.html' },
    { id: 'pedidos', texto: 'Pedidos', href: 'pedidos.html' },
    { id: 'estado', texto: 'Estado', href: 'estado.html' },
    { id: 'historial', texto: 'Historial', href: 'historial.html' },
    { id: 'promociones', texto: 'Promos', href: 'promociones.html' }
  ];

  function pintarMenu() {
    let nav = document.querySelector('.menu-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'menu-nav';
      document.body.appendChild(nav);
    }

    const actual = window.location.pathname.split('/').pop();

    nav.innerHTML = OPCIONES.map(o => `
      <a href="${o.href}" class="${actual === o.href ? 'activo' : ''}" aria-label="${o.texto}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${ICONOS[o.id]}
        </svg>
        <span>${o.texto}</span>
      </a>
    `).join('');

    // Páginas sin .pagina (como Pago): deja espacio para que el menú no tape el contenido
    if (!document.querySelector('.pagina')) {
      const espacio = document.createElement('div');
      espacio.style.height = '90px';
      document.body.insertBefore(espacio, nav);
    }
  }

  document.addEventListener('DOMContentLoaded', pintarMenu);
})();
