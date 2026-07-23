// Función principal que se ejecuta al hacer clic en "Ingresar"
function validarFormulario() {

  // 1. Obtenemos los valores que el usuario escribió
  var nombre = document.getElementById("nombre").value;
  var correo = document.getElementById("correo").value;
  var clave  = document.getElementById("clave").value;
  var fecha  = document.getElementById("fecha").value;

  // 2. Ocultamos todos los errores antes de validar
  document.getElementById("error-nombre").style.display = "none";
  document.getElementById("error-correo").style.display = "none";
  document.getElementById("error-clave").style.display  = "none";
  document.getElementById("error-fecha").style.display  = "none";
  document.getElementById("mensaje-exito").style.display = "none";

  // 3. Variable para saber si hay algún error
  var hayError = false;

  // 4. Validar nombre: no puede estar vacío
  if (nombre == "") {
    document.getElementById("error-nombre").style.display = "block";
    hayError = true;
  }

  // 5. Validar correo: debe tener @ y un punto
  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  // 6. Validar clave: mínimo 6 caracteres
  if (clave.length < 6) {
    document.getElementById("error-clave").style.display = "block";
    hayError = true;
  }

  // 7. Validar fecha: no puede estar vacía
  if (fecha == "") {
    document.getElementById("error-fecha").style.display = "block";
    hayError = true;
  }

  // 8. Si no hay errores, mostramos el mensaje de éxito
  if (hayError == false) {
    document.getElementById("mensaje-exito").style.display = "block";
  }

}