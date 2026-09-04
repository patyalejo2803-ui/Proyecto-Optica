import { enviarPeticion, ir } from './herramientas.js';

document.addEventListener("click", (e) => {
  if (e.target && e.target.id == "btn-registrar") {
    e.preventDefault();
    registrarUsuario();
  }
});

function registrarUsuario() {

  var nombre     = document.getElementById("nombre").value;
  var correo     = document.getElementById("correo").value;
  var contrasena = document.getElementById("contrasena").value;
  var confirmar  = document.getElementById("confirmar").value;
  var fecha      = document.getElementById("fecha").value;

  document.getElementById("error-nombre").style.display     = "none";
  document.getElementById("error-correo").style.display     = "none";
  document.getElementById("error-contrasena").style.display = "none";
  document.getElementById("error-confirmar").style.display  = "none";
  document.getElementById("error-fecha").style.display      = "none";
  document.getElementById("mensaje-exito").style.display    = "none";

  var hayError = false;

  if (nombre == "") {
    document.getElementById("error-nombre").style.display = "block";
    hayError = true;
  }

  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  if (contrasena.length < 6) {
    document.getElementById("error-contrasena").style.display = "block";
    hayError = true;
  }

  if (contrasena != confirmar) {
    document.getElementById("error-confirmar").style.display = "block";
    hayError = true;
  }

  if (fecha == "") {
    document.getElementById("error-fecha").style.display = "block";
    hayError = true;
  }

  if (hayError == false) {
    registrarUsuarioBackend(nombre, correo, contrasena);
  }
}

async function registrarUsuarioBackend(nombre, correo, contrasena) {
  await enviarPeticion({
    url: "php/registro_procesar.php",
    method: "POST",
    param: { nombre: nombre, correo: correo, contrasena: contrasena },
    fSuccess: (resp) => {
      if (resp.code == 200) {
        document.getElementById("mensaje-exito").style.display = "block";
        setTimeout(() => ir("login.html"), 1500);
      } else {
        alert(resp.msg);
      }
    }
  });
}