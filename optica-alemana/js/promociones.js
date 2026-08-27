// Lista donde guardamos todas las promociones
var listaPromociones = [];

// ── Mostrar u ocultar el formulario con el botón ⚙️ ──
function toggleFormulario() {
  var form = document.getElementById("formulario");

  if (form.style.display == "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

// ── Verificar si una promoción está activa hoy ──
function estaActiva(promo) {
  var hoy    = new Date();
  var inicio = new Date(promo.fechaInicio);
  var fin    = new Date(promo.fechaFin);

  // Ajustamos fin al final del día
  fin.setHours(23, 59, 59);

  return hoy >= inicio && hoy <= fin;
}

// ── Agregar una nueva promoción ──
function agregarPromocion() {

  // Leemos los campos del formulario
  var titulo      = document.getElementById("titulo").value;
  var descripcion = document.getElementById("descripcion").value;
  var fechaInicio = document.getElementById("fecha-inicio").value;
  var fechaFin    = document.getElementById("fecha-fin").value;

  // Ocultamos errores anteriores
  document.getElementById("error-titulo").style.display      = "none";
  document.getElementById("error-descripcion").style.display = "none";
  document.getElementById("error-inicio").style.display      = "none";
  document.getElementById("error-fin").style.display         = "none";

  var hayError = false;

  // Validaciones
  if (titulo == "") {
    document.getElementById("error-titulo").style.display = "block";
    hayError = true;
  }
  if (descripcion == "") {
    document.getElementById("error-descripcion").style.display = "block";
    hayError = true;
  }
  if (fechaInicio == "") {
    document.getElementById("error-inicio").style.display = "block";
    hayError = true;
  }
  if (fechaFin == "") {
    document.getElementById("error-fin").style.display = "block";
    hayError = true;
  }

  // Si todo está bien, guardamos la promoción
  if (hayError == false) {

    var nuevaPromo = {
      id:          Date.now(),
      titulo:      titulo,
      descripcion: descripcion,
      fechaInicio: fechaInicio,
      fechaFin:    fechaFin
    };

    listaPromociones.push(nuevaPromo);

    // Limpiamos el formulario
    document.getElementById("titulo").value       = "";
    document.getElementById("descripcion").value  = "";
    document.getElementById("fecha-inicio").value = "";
    document.getElementById("fecha-fin").value    = "";

    // Cerramos el formulario
    document.getElementById("formulario").style.display = "none";

    // Actualizamos toda la página
    actualizarPagina();
  }
}

// ── Eliminar una promoción ──
function eliminarPromocion(id) {

  var nueva = [];

  for (var i = 0; i < listaPromociones.length; i++) {
    if (listaPromociones[i].id != id) {
      nueva.push(listaPromociones[i]);
    }
  }

  listaPromociones = nueva;
  actualizarPagina();
}

// ── Actualizar toda la página ──
function actualizarPagina() {
  actualizarEstadisticas();
  mostrarTarjetasMini();
  mostrarNovedades();
}

// ── Actualizar los números de estadísticas ──
function actualizarEstadisticas() {

  var activas  = 0;
  var vencidas = 0;

  for (var i = 0; i < listaPromociones.length; i++) {
    if (estaActiva(listaPromociones[i])) {
      activas++;
    } else {
      vencidas++;
    }
  }

  document.getElementById("total-promos").textContent  = listaPromociones.length;
  document.getElementById("total-activas").textContent = activas;
  document.getElementById("total-vencidas").textContent = vencidas;
}

// ── Mostrar tarjetas mini (sección "Últimas Promociones") ──
function mostrarTarjetasMini() {

  var lista    = document.getElementById("lista-mini");
  var sinMini  = document.getElementById("sin-mini");

  if (listaPromociones.length == 0) {
    lista.innerHTML        = "";
    sinMini.style.display  = "block";
    return;
  }

  sinMini.style.display = "none";
  lista.innerHTML = "";

  for (var i = 0; i < listaPromociones.length; i++) {

    var promo  = listaPromociones[i];
    var activa = estaActiva(promo);

    var estadoTexto = activa
      ? '<p class="mini-estado-activo">✅ Activa</p>'
      : '<p class="mini-estado-vencido">❌ Vencida</p>';

    var tarjeta = '<div class="tarjeta-mini">' +
      '<span class="mini-icono">🎁</span>' +
      '<p class="mini-titulo">' + promo.titulo + '</p>' +
      estadoTexto +
      '<button class="btn-eliminar" onclick="eliminarPromocion(' + promo.id + ')">🗑️ Eliminar</button>' +
      '</div>';

    lista.innerHTML = lista.innerHTML + tarjeta;
  }
}

// ── Mostrar novedades activas (sección "Novedades") ──
function mostrarNovedades() {

  var lista      = document.getElementById("lista-novedades");
  var sinNovedad = document.getElementById("sin-novedades");

  lista.innerHTML = "";
  var activas = 0;

  for (var i = 0; i < listaPromociones.length; i++) {

    var promo = listaPromociones[i];

    // Solo mostramos las activas en novedades
    if (estaActiva(promo)) {
      activas++;

      var tarjeta = '<div class="tarjeta-novedad">' +
        '<div class="novedad-imagen">🎉</div>' +
        '<div class="novedad-contenido">' +
          '<p class="novedad-titulo">' + promo.titulo + '</p>' +
          '<p class="novedad-desc">'   + promo.descripcion + '</p>' +
          '<div class="novedad-stats">' +
            '<span>📅 ' + promo.fechaInicio + '</span>' +
            '<span>⏳ ' + promo.fechaFin + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

      lista.innerHTML = lista.innerHTML + tarjeta;
    }
  }

  if (activas == 0) {
    sinNovedad.style.display = "block";
  } else {
    sinNovedad.style.display = "none";
  }
}