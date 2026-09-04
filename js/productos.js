/* =========================================================
   ÓPTICA ALEMANA — productos.js
   Módulo CRUD completo conectado a php/productos/index.php
   ========================================================= */

const API_PRODUCTOS = 'php/productos/index.php';
const API_CATEGORIAS = 'php/categorias/index.php';

let categoriasDisponibles = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  cargarProductos();

  document.getElementById('btnNuevoProducto').addEventListener('click', abrirModalNuevo);
  document.getElementById('btnCancelarModal').addEventListener('click', cerrarModal);
  document.getElementById('formProducto').addEventListener('submit', guardarProducto);

  // Pestañas
  document.getElementById('tabProductos').addEventListener('click', () => cambiarTab('productos'));
  document.getElementById('tabCategorias').addEventListener('click', () => cambiarTab('categorias'));

  // Categorías
  document.getElementById('btnNuevaCategoria').addEventListener('click', abrirModalNuevaCategoria);
  document.getElementById('btnCancelarModalCategoria').addEventListener('click', cerrarModalCategoria);
  document.getElementById('formCategoria').addEventListener('submit', guardarCategoria);
});

/* ---------------------------------------------------------
   Pestañas
   --------------------------------------------------------- */
function cambiarTab(tab) {
  const esProductos = tab === 'productos';

  document.getElementById('tabProductos').classList.toggle('pestana--activa', esProductos);
  document.getElementById('tabCategorias').classList.toggle('pestana--activa', !esProductos);

  document.getElementById('seccionProductos').style.display = esProductos ? 'block' : 'none';
  document.getElementById('seccionCategorias').style.display = esProductos ? 'none' : 'block';

  if (!esProductos) cargarTablaCategorias();
}

/* ---------------------------------------------------------
   Cargar categorías para el <select> del formulario
   --------------------------------------------------------- */
async function cargarCategorias() {
  try {
    const res = await fetch(API_CATEGORIAS);
    const data = await res.json();
    categoriasDisponibles = data.data || [];

    const select = document.getElementById('categoriaProducto');
    categoriasDisponibles.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id_categoria;
      opt.textContent = cat.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('No se pudieron cargar las categorías:', err);
  }
}

/* ---------------------------------------------------------
   LEER: cargar y pintar la tabla de productos
   --------------------------------------------------------- */
async function cargarProductos() {
  const cuerpo = document.getElementById('cuerpoTablaProductos');
  cuerpo.innerHTML = '<tr><td colspan="6" class="fila-vacia">Cargando productos…</td></tr>';

  try {
    const res = await fetch(API_PRODUCTOS);
    const data = await res.json();

    if (data.code !== 200) {
      cuerpo.innerHTML = `<tr><td colspan="6" class="fila-vacia">Error: ${data.msg}</td></tr>`;
      return;
    }

    const productos = data.data;

    if (productos.length === 0) {
      cuerpo.innerHTML = '<tr><td colspan="6" class="fila-vacia">Aún no hay productos registrados</td></tr>';
      return;
    }

    cuerpo.innerHTML = productos.map(p => `
      <tr>
        <td>${p.id_producto}</td>
        <td>${p.nombre}</td>
        <td>${p.categoria ?? '—'}</td>
        <td>${p.marca}</td>
        <td><span class="badge-estado ${p.estado === 'Disponible' ? 'badge-estado--disponible' : 'badge-estado--agotado'}">${p.estado}</span></td>
        <td>
          <button class="btn btn--gris btn--pequeno" onclick="abrirModalEditar(${p.id_producto}, '${escaparComillas(p.nombre)}', ${p.id_categoria}, '${escaparComillas(p.marca)}', '${p.estado}')">Editar</button>
          <button class="btn btn--rojo btn--pequeno" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    cuerpo.innerHTML = '<tr><td colspan="6" class="fila-vacia">No se pudo conectar con el servidor</td></tr>';
    console.error(err);
  }
}

function escaparComillas(texto) {
  return String(texto).replace(/'/g, "\\'");
}

/* ---------------------------------------------------------
   Modal: abrir para crear / abrir para editar / cerrar
   --------------------------------------------------------- */
function abrirModalNuevo() {
  document.getElementById('modalTitulo').textContent = 'Nuevo producto';
  document.getElementById('productoId').value = '';
  document.getElementById('formProducto').reset();
  document.getElementById('modalFondo').classList.add('is-abierto');
}

function abrirModalEditar(id, nombre, idCategoria, marca, estado) {
  document.getElementById('modalTitulo').textContent = 'Editar producto';
  document.getElementById('productoId').value = id;
  document.getElementById('nombreProducto').value = nombre;
  document.getElementById('categoriaProducto').value = idCategoria;
  document.getElementById('marcaProducto').value = marca;
  document.getElementById('estadoProducto').value = estado;
  document.getElementById('modalFondo').classList.add('is-abierto');
}

function cerrarModal() {
  document.getElementById('modalFondo').classList.remove('is-abierto');
}

/* ---------------------------------------------------------
   CREAR o ACTUALIZAR (según si hay un ID en el formulario)
   --------------------------------------------------------- */
async function guardarProducto(e) {
  e.preventDefault();

  const id = document.getElementById('productoId').value;
  const payload = {
    nombre: document.getElementById('nombreProducto').value.trim(),
    id_categoria: document.getElementById('categoriaProducto').value,
    marca: document.getElementById('marcaProducto').value.trim(),
    estado: document.getElementById('estadoProducto').value
  };

  const esEdicion = id !== '';
  if (esEdicion) payload.id = id;

  try {
    const res = await fetch(API_PRODUCTOS, {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.code === 200) {
      mostrarMensaje(data.msg, 'ok');
      cerrarModal();
      cargarProductos();
    } else {
      mostrarMensaje(data.msg, 'error');
    }
  } catch (err) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
    console.error(err);
  }
}

/* ---------------------------------------------------------
   ELIMINAR
   --------------------------------------------------------- */
async function eliminarProducto(id) {
  const confirmar = confirm('¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.');
  if (!confirmar) return;

  try {
    const res = await fetch(API_PRODUCTOS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();

    if (data.code === 200) {
      mostrarMensaje(data.msg, 'ok');
      cargarProductos();
    } else {
      mostrarMensaje(data.msg, 'error');
    }
  } catch (err) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
    console.error(err);
  }
}

/* ---------------------------------------------------------
   Mensajes de estado (éxito / error)
   --------------------------------------------------------- */
function mostrarMensaje(texto, tipo) {
  const el = document.getElementById('mensajeEstado');
  el.textContent = texto;
  el.className = 'mensaje-estado ' + (tipo === 'ok' ? 'mensaje-estado--ok' : 'mensaje-estado--error');
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

/* =========================================================
   CATEGORÍAS — CRUD completo
   ========================================================= */

/* ---------------------------------------------------------
   LEER: cargar y pintar la tabla de categorías
   --------------------------------------------------------- */
async function cargarTablaCategorias() {
  const cuerpo = document.getElementById('cuerpoTablaCategorias');
  cuerpo.innerHTML = '<tr><td colspan="3" class="fila-vacia">Cargando categorías…</td></tr>';

  try {
    const res = await fetch(API_CATEGORIAS);
    const data = await res.json();

    if (data.code !== 200) {
      cuerpo.innerHTML = `<tr><td colspan="3" class="fila-vacia">Error: ${data.msg}</td></tr>`;
      return;
    }

    const categorias = data.data;

    if (categorias.length === 0) {
      cuerpo.innerHTML = '<tr><td colspan="3" class="fila-vacia">Aún no hay categorías registradas</td></tr>';
      return;
    }

    cuerpo.innerHTML = categorias.map(c => `
      <tr>
        <td>${c.id_categoria}</td>
        <td>${c.nombre}</td>
        <td>
          <button class="btn btn--gris btn--pequeno" onclick="abrirModalEditarCategoria(${c.id_categoria}, '${escaparComillas(c.nombre)}')">Editar</button>
          <button class="btn btn--rojo btn--pequeno" onclick="eliminarCategoria(${c.id_categoria})">Eliminar</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    cuerpo.innerHTML = '<tr><td colspan="3" class="fila-vacia">No se pudo conectar con el servidor</td></tr>';
    console.error(err);
  }
}

/* ---------------------------------------------------------
   Modal de categoría: abrir para crear / editar / cerrar
   --------------------------------------------------------- */
function abrirModalNuevaCategoria() {
  document.getElementById('modalTituloCategoria').textContent = 'Nueva categoría';
  document.getElementById('categoriaId').value = '';
  document.getElementById('formCategoria').reset();
  document.getElementById('modalFondoCategoria').classList.add('is-abierto');
}

function abrirModalEditarCategoria(id, nombre) {
  document.getElementById('modalTituloCategoria').textContent = 'Editar categoría';
  document.getElementById('categoriaId').value = id;
  document.getElementById('nombreCategoria').value = nombre;
  document.getElementById('modalFondoCategoria').classList.add('is-abierto');
}

function cerrarModalCategoria() {
  document.getElementById('modalFondoCategoria').classList.remove('is-abierto');
}

/* ---------------------------------------------------------
   CREAR o ACTUALIZAR categoría
   --------------------------------------------------------- */
async function guardarCategoria(e) {
  e.preventDefault();

  const id = document.getElementById('categoriaId').value;
  const nombre = document.getElementById('nombreCategoria').value.trim();
  const esEdicion = id !== '';

  try {
    const res = await fetch(API_CATEGORIAS, {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(esEdicion ? { id, nombre } : { nombre })
    });
    const data = await res.json();

    if (data.code === 200) {
      mostrarMensaje(data.msg, 'ok');
      cerrarModalCategoria();
      cargarTablaCategorias();
      await recargarSelectCategorias(); // actualiza el <select> del formulario de productos
    } else {
      mostrarMensaje(data.msg, 'error');
    }
  } catch (err) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
    console.error(err);
  }
}

/* ---------------------------------------------------------
   ELIMINAR categoría
   --------------------------------------------------------- */
async function eliminarCategoria(id) {
  const confirmar = confirm('¿Seguro que quieres eliminar esta categoría?');
  if (!confirmar) return;

  try {
    const res = await fetch(API_CATEGORIAS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();

    if (data.code === 200) {
      mostrarMensaje(data.msg, 'ok');
      cargarTablaCategorias();
      await recargarSelectCategorias();
    } else {
      // Aquí llega, por ejemplo, el mensaje de "hay productos usando esta categoría"
      mostrarMensaje(data.msg, 'error');
    }
  } catch (err) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
    console.error(err);
  }
}

/* ---------------------------------------------------------
   Refresca el <select> de categorías del formulario de productos
   --------------------------------------------------------- */
async function recargarSelectCategorias() {
  const select = document.getElementById('categoriaProducto');
  const valorActual = select.value;

  select.innerHTML = '<option value="">Selecciona una categoría…</option>';

  try {
    const res = await fetch(API_CATEGORIAS);
    const data = await res.json();
    categoriasDisponibles = data.data || [];

    categoriasDisponibles.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id_categoria;
      opt.textContent = cat.nombre;
      select.appendChild(opt);
    });

    select.value = valorActual; // conserva la selección si aún existe
  } catch (err) {
    console.error('No se pudo actualizar el listado de categorías:', err);
  }
}