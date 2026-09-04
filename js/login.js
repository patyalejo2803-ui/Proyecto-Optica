import { enviarPeticion, ir } from './herramientas.js';

document.addEventListener("DOMContentLoaded", (e) => {
  document.getElementById("mensaje").style.display = "none";
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id == "btn-ingresar") {
    e.preventDefault();
    validarFormulario();
  }
});

function validarFormulario() {

  var correo = document.getElementById("correo").value;
  var clave  = document.getElementById("clave").value;

  document.getElementById("error-correo").style.display = "none";
  document.getElementById("error-clave").style.display  = "none";
  document.getElementById("mensaje").style.display = "none";

  var hayError = false;

  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  if (clave.length < 6) {
    document.getElementById("error-clave").style.display = "block";
    hayError = true;
  }

  if (hayError == false) {
    document.getElementById("mensaje").style.display = "block";
    validarLogin(correo, clave);
  }
}

async function validarLogin(correo, clave) {

  await enviarPeticion({
    url: "php/usuario/index.php",
    method: "POST",
    param: { usuario: correo, clave: clave },
    fSuccess: (resp) => {
      if (resp.code == 200) {
        localStorage.setItem("nombreUsuario", resp.user);
        localStorage.setItem("idRol", resp.id_rol);
        alert("El usuario ha iniciado sesión correctamente.");
        ir("dashboard.html");
      } else {
        alert(resp.msg);
        document.getElementById("mensaje").style.display = "none";
      }
    }
  });
}