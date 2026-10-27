/* =========================================================
   ÓPTICA ALEMANA — nav.js
   Dibuja el menú lateral según el rol del usuario guardado
   en localStorage (idRol: 1 CLIENTE, 2 ADMIN, 3 GERENTE,
   4 OPTOMETRA, 5 ASESOR)
   ========================================================= */

const MENUS = {
  1: [ // CLIENTE
    { texto: "Citas", href: "citas.html" },
    { texto: "Pedidos", href: "pedidos.html" },
    { texto: "Historial", href: "historial.html" }
  ],
  2: [ // ADMINISTRADOR
    { texto: "Resumen", href: "dashboard.html" },
    { texto: "Productos", href: "productos.html" },
    { texto: "Servicios", href: "estado.html" },
    { texto: "Órdenes", href: "pedidos.html" },
    { texto: "Citas", href: "citas.html" },
    { texto: "Usuarios", href: "admin.html" },
    { texto: "Promociones", href: "promociones.html" }
  ],
  3: [ // GERENTE
    { texto: "Resumen", href: "dashboard.html" },
    { texto: "Productos", href: "productos.html" },
    { texto: "Servicios", href: "estado.html" },
    { texto: "Órdenes", href: "pedidos.html" },
    { texto: "Citas", href: "citas.html" },
    { texto: "Promociones", href: "promociones.html" }
  ],
  4: [ // OPTOMETRA
    { texto: "Citas", href: "citas.html" },
    { texto: "Servicios", href: "estado.html" }
  ],
  5: [ // ASESOR
    { texto: "Productos", href: "productos.html" },
    { texto: "Órdenes", href: "pedidos.html" },
    { texto: "Promociones", href: "promociones.html" }
  ]
};

document.addEventListener('DOMContentLoaded', pintarNav);

function pintarNav() {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  const idRol = parseInt(localStorage.getItem('idRol'));
  const nombre = localStorage.getItem('nombreUsuario') || 'Invitado';
  const opciones = MENUS[idRol] || [];
  const paginaActual = window.location.pathname.split('/').pop();

  placeholder.innerHTML = `
    <nav class="nav-oa">
      <div class="nav-oa__marca">
        <span class="nav-oa__logo">👁️</span>
        <span>Óptica<strong>Alemana</strong></span>
      </div>

      <div class="nav-oa__usuario">Hola, ${nombre}</div>

      <ul class="nav-oa__lista">
        ${opciones.map(op => `
          <li>
            <a href="${op.href}" class="${paginaActual === op.href ? 'is-activo' : ''}">
              ${op.texto}
            </a>
          </li>
        `).join('')}
      </ul>

      <button class="nav-oa__salir" id="btnCerrarSesion">Cerrar sesión</button>
    </nav>
  `;

  document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('idRol');
    window.location.href = 'login.html';
  });
}