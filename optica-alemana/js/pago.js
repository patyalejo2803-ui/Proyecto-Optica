// Variables globales para guardar lo que el usuario elige
var productoSeleccionado = "";
var precioSeleccionado   = 0;
var medioSeleccionado    = "";

// ── Función para seleccionar un producto ──
function seleccionarProducto(elemento, nombre, precio) {

  // Quitamos la clase "seleccionado" de todos los productos
  var productos = document.getElementsByClassName("producto");
  for (var i = 0; i < productos.length; i++) {
    productos[i].classList.remove("seleccionado");
  }

  // Le ponemos la clase "seleccionado" al que se hizo clic
  elemento.classList.add("seleccionado");

  // Guardamos el nombre y precio del producto elegido
  productoSeleccionado = nombre;
  precioSeleccionado   = precio;

  // Ocultamos el error si estaba visible
  document.getElementById("error-producto").style.display = "none";
}

// ── Función para seleccionar el medio de pago ──
function seleccionarMedio(elemento, medio) {

  // Quitamos la clase "seleccionado" de todos los medios
  var medios = document.getElementsByClassName("medio");
  for (var i = 0; i < medios.length; i++) {
    medios[i].classList.remove("seleccionado");
  }

  // Le ponemos la clase "seleccionado" al que se hizo clic
  elemento.classList.add("seleccionado");

  // Guardamos el medio de pago elegido
  medioSeleccionado = medio;

  // Ocultamos el error si estaba visible
  document.getElementById("error-medio").style.display = "none";
}

// ── Función principal: procesar el pago ──
function procesarPago() {

  // Ocultamos los errores antes de validar
  document.getElementById("error-producto").style.display = "none";
  document.getElementById("error-medio").style.display    = "none";
  document.getElementById("factura").style.display        = "none";

  // Variable para saber si hay errores
  var hayError = false;

  // Validar que eligió un producto
  if (productoSeleccionado == "") {
    document.getElementById("error-producto").style.display = "block";
    hayError = true;
  }

  // Validar que eligió un medio de pago
  if (medioSeleccionado == "") {
    document.getElementById("error-medio").style.display = "block";
    hayError = true;
  }

  // Si no hay errores, mostramos la factura
  if (hayError == false) {

    // Generamos un número de pedido aleatorio
    var numeroPedido = "OA-" + Math.floor(Math.random() * 90000 + 10000);

    // Formatear el precio con puntos
    var totalFormato = "$" + precioSeleccionado.toLocaleString("es-CO");

    // Llenamos los datos de la factura
    document.getElementById("f-producto").textContent = productoSeleccionado;
    document.getElementById("f-medio").textContent    = medioSeleccionado;
    document.getElementById("f-total").textContent    = totalFormato;
    document.getElementById("f-pedido").textContent   = numeroPedido;

    // Mostramos la factura
    document.getElementById("factura").style.display = "block";
  }
}