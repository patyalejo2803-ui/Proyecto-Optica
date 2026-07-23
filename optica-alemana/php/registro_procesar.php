Función para registrar el usuario
function registrarUsuario() {

  // 1. Leemos los valores
  var nombre     = document.getElementById("nombre").value;
  var correo     = document.getElementById("correo").value;
  var contrasena = document.getElementById("contrasena").value;
  var confirmar  = document.getElementById("confirmar").value;

  // 2. Ocultamos todos los errores
  document.getElementById("error-nombre").style.display     = "none";
  document.getElementById("error-correo").style.display     = "none";
  document.getElementById("error-contrasena").style.display = "none";
  document.getElementById("error-confirmar").style.display  = "none";
  document.getElementById("mensaje-exito").style.display    = "none";

  // 3. Variable para errores
  var hayError = false;

  // 4. Validar nombre
  if (nombre == "") {
    document.getElementById("error-nombre").style.display = "block";
    hayError = true;
  }

  // 5. Validar correo
  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  // 6. Validar contraseña mínimo 6 caracteres
  if (contrasena.length < 6) {
    document.getElementById("error-contrasena").style.display = "block";
    hayError = true;
  }

  // 7. Validar que las contraseñas coincidan
  if (contrasena != confirmar) {
    document.getElementById("error-confirmar").style.display = "block";
    hayError = true;
  }

  // 8. Si no hay errores, mostramos el éxito
  if (hayError == false) {
    document.getElementById("mensaje-exito").style.display = "block";
  }
}